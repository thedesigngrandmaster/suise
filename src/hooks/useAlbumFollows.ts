import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AlbumWithDetails {
  id: string;
  title: string;
  cover_image_url: string | null;
  owner_id: string;
  is_public: boolean;
  love_count: number;
  view_count: number;
  first_memory_url?: string | null;
}

export function useAlbumFollows(userId?: string) {
  const [followedAlbumIds, setFollowedAlbumIds] = useState<Set<string>>(new Set());
  const [followedAlbums, setFollowedAlbums] = useState<AlbumWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchFollows = async () => {
      setLoading(true);
      
      try {
        // Fetch all albums the user is following
        const { data, error } = await supabase
          .from("album_follows")
          .select(`
            album_id,
            albums:album_id (
              id,
              title,
              cover_image_url,
              owner_id,
              is_public,
              love_count,
              view_count
            )
          `)
          .eq("user_id", userId);

        if (error) {
          console.error("Error fetching follows:", error);
          setLoading(false);
          return;
        }

        // Extract album IDs
        const albumIds = new Set(data?.map(item => item.album_id) || []);
        setFollowedAlbumIds(albumIds);

        // Extract full album data
        const albums = data
          ?.map(item => item.albums)
          .filter(Boolean)
          .flat() as AlbumWithDetails[];
        
        setFollowedAlbums(albums || []);
      } catch (err) {
        console.error("Exception fetching follows:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFollows();

    // Subscribe to changes
    const channel = supabase
      .channel(`album-follows-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "album_follows",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          console.log("Album follows changed, refetching...");
          fetchFollows();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const isFollowing = (albumId: string): boolean => {
    return followedAlbumIds.has(albumId);
  };

  const followAlbum = async (albumId: string) => {
    if (!userId) {
      toast.error("Please sign in to follow albums");
      return;
    }

    try {
      const { error } = await supabase
        .from("album_follows")
        .insert({
          album_id: albumId,
          user_id: userId,
        });

      if (error) {
        if (error.code === "23505") {
          // Already following
          return;
        }
        console.error("Follow error:", error);
        toast.error("Failed to follow album");
        return;
      }

      // Update local state
      setFollowedAlbumIds(prev => new Set([...prev, albumId]));
      toast.success("Following album!");
    } catch (err) {
      console.error("Follow exception:", err);
      toast.error("Failed to follow album");
    }
  };

  const unfollowAlbum = async (albumId: string) => {
    if (!userId) {
      return;
    }

    try {
      const { error } = await supabase
        .from("album_follows")
        .delete()
        .eq("album_id", albumId)
        .eq("user_id", userId);

      if (error) {
        console.error("Unfollow error:", error);
        toast.error("Failed to unfollow album");
        return;
      }

      // Update local state
      setFollowedAlbumIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(albumId);
        return newSet;
      });
      
      toast.success("Unfollowed album");
    } catch (err) {
      console.error("Unfollow exception:", err);
      toast.error("Failed to unfollow album");
    }
  };

  return {
    followedAlbums,
    isFollowing,
    followAlbum,
    unfollowAlbum,
    loading,
  };
}
