import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FollowedAlbum {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  is_public: boolean;
  view_count: number;
  love_count: number;
  follow_count: number;
  owner_id: string;
  created_at: string;
  owner?: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export function useAlbumFollows(userId?: string) {
  const [followedAlbums, setFollowedAlbums] = useState<FollowedAlbum[]>([]);
  const [followedAlbumIds, setFollowedAlbumIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchFollowedAlbums = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("album_follows")
      .select(`
        album_id,
        albums!inner(
          id,
          title,
          description,
          cover_image_url,
          is_public,
          view_count,
          love_count,
          follow_count,
          owner_id,
          created_at,
          owner:profiles!albums_owner_id_fkey(id, username, display_name, avatar_url)
        )
      `)
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching followed albums:", error);
    } else if (data) {
      const albums = data.map((item: any) => ({
        ...item.albums,
        owner: item.albums.owner,
      }));
      setFollowedAlbums(albums);
      setFollowedAlbumIds(new Set(albums.map((a: FollowedAlbum) => a.id)));
    }
    setLoading(false);
  }, [userId]);

  const followAlbum = async (albumId: string) => {
    if (!userId) {
      toast.error("Please sign in to follow albums");
      return { error: new Error("Not authenticated") };
    }

    const { error } = await supabase
      .from("album_follows")
      .insert({ album_id: albumId, user_id: userId });

    if (error && error.code !== "23505") {
      toast.error("Failed to follow album");
      return { error };
    }

    setFollowedAlbumIds((prev) => new Set([...prev, albumId]));
    toast.success("Now following this album");
    return { error: null };
  };

  const unfollowAlbum = async (albumId: string) => {
    if (!userId) return;

    await supabase
      .from("album_follows")
      .delete()
      .eq("album_id", albumId)
      .eq("user_id", userId);

    setFollowedAlbumIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(albumId);
      return newSet;
    });
    setFollowedAlbums((prev) => prev.filter((a) => a.id !== albumId));
    toast.success("Unfollowed album");
  };

  const isFollowing = (albumId: string) => followedAlbumIds.has(albumId);

  useEffect(() => {
    fetchFollowedAlbums();
  }, [fetchFollowedAlbums]);

  // Real-time subscription for followed albums
  useEffect(() => {
    if (!userId) return;

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
          fetchFollowedAlbums();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchFollowedAlbums]);

  return {
    followedAlbums,
    loading,
    followAlbum,
    unfollowAlbum,
    isFollowing,
    refetch: fetchFollowedAlbums,
  };
}
