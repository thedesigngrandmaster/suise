import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAlbumFollows(userId?: string, albumId?: string) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Check if user is following this album
  const checkFollowStatus = async () => {
    if (!userId || !albumId) return;

    const { data, error } = await supabase
      .from("album_follows")
      .select("id")
      .eq("album_id", albumId)
      .eq("user_id", userId)
      .single();

    if (!error && data) {
      setIsFollowing(true);
    } else {
      setIsFollowing(false);
    }
  };

  // Get follower count for album
  const getFollowerCount = async () => {
    if (!albumId) return;

    const { count, error } = await supabase
      .from("album_follows")
      .select("*", { count: "exact", head: true })
      .eq("album_id", albumId);

    if (!error && count !== null) {
      setFollowerCount(count);
    }
  };

  // Follow an album
  const followAlbum = async () => {
    if (!userId || !albumId) return;

    setLoading(true);
    const { error } = await supabase
      .from("album_follows")
      .insert({ album_id: albumId, user_id: userId });

    if (error) {
      if (error.code === "23505") {
        toast.error("Already following this album");
      } else {
        toast.error("Failed to follow album");
      }
    } else {
      setIsFollowing(true);
      setFollowerCount(prev => prev + 1);
      toast.success("Following album!");
      
      // Create notification for album owner
      await createFollowNotification();
    }
    setLoading(false);
  };

  // Unfollow an album
  const unfollowAlbum = async () => {
    if (!userId || !albumId) return;

    setLoading(true);
    const { error } = await supabase
      .from("album_follows")
      .delete()
      .eq("album_id", albumId)
      .eq("user_id", userId);

    if (error) {
      toast.error("Failed to unfollow album");
    } else {
      setIsFollowing(false);
      setFollowerCount(prev => Math.max(0, prev - 1));
      toast.success("Unfollowed album");
    }
    setLoading(false);
  };

  // Create notification for album owner when someone follows
  const createFollowNotification = async () => {
    if (!userId || !albumId) return;

    // Get album owner
    const { data: album } = await supabase
      .from("albums")
      .select("owner_id, title")
      .eq("id", albumId)
      .single();

    if (!album || album.owner_id === userId) return; // Don't notify self

    // Get follower's profile
    const { data: follower } = await supabase
      .from("profiles")
      .select("username, display_name")
      .eq("id", userId)
      .single();

    if (!follower) return;

    // Create notification
    await supabase
      .from("notifications")
      .insert({
        user_id: album.owner_id,
        type: "album_follow",
        title: "New Album Follower",
        message: `${follower.display_name || follower.username} is now following your album "${album.title}"`,
        action_url: `/album/${albumId}`,
      });
  };

  // Notify followers when album is updated
  const notifyFollowers = async (updateType: "new_memory" | "album_update", details?: string) => {
    if (!albumId) return;

    // Get all followers
    const { data: follows } = await supabase
      .from("album_follows")
      .select("user_id")
      .eq("album_id", albumId);

    if (!follows || follows.length === 0) return;

    // Get album details
    const { data: album } = await supabase
      .from("albums")
      .select("title, owner_id")
      .eq("id", albumId)
      .single();

    if (!album) return;

    // Get owner's profile
    const { data: owner } = await supabase
      .from("profiles")
      .select("username, display_name")
      .eq("id", album.owner_id)
      .single();

    if (!owner) return;

    const ownerName = owner.display_name || owner.username;
    
    let notificationTitle = "";
    let notificationMessage = "";

    if (updateType === "new_memory") {
      notificationTitle = "New Memory Added";
      notificationMessage = `${ownerName} added a new memory to "${album.title}"`;
    } else {
      notificationTitle = "Album Updated";
      notificationMessage = `${ownerName} updated "${album.title}"${details ? `: ${details}` : ""}`;
    }

    // Create notifications for all followers
    const notifications = follows
      .filter(f => f.user_id !== album.owner_id) // Don't notify owner
      .map(follow => ({
        user_id: follow.user_id,
        type: updateType,
        title: notificationTitle,
        message: notificationMessage,
        action_url: `/album/${albumId}`,
      }));

    if (notifications.length > 0) {
      await supabase.from("notifications").insert(notifications);
    }
  };

  useEffect(() => {
    if (userId && albumId) {
      checkFollowStatus();
      getFollowerCount();
    }
  }, [userId, albumId]);

  // Real-time updates for follower count
  useEffect(() => {
    if (!albumId) return;

    const channel = supabase
      .channel(`album-follows-${albumId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "album_follows",
          filter: `album_id=eq.${albumId}`,
        },
        () => {
          getFollowerCount();
          if (userId) checkFollowStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [albumId, userId]);

  return {
    isFollowing,
    followerCount,
    loading,
    followAlbum,
    unfollowAlbum,
    notifyFollowers,
  };
}
