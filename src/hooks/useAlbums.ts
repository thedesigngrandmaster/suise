import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Album {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  is_public: boolean;
  view_count: number;
  love_count: number;
  share_count: number;
  created_at: string;
  owner?: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    wallet_address: string | null;
  };
  co_owners?: Array<{
    user_id: string;
    user?: {
      username: string | null;
      display_name: string | null;
      avatar_url: string | null;
    };
  }>;
  is_loved?: boolean;
}

export function useAlbums(userId?: string) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserAlbums = async () => {
    if (!userId) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from("albums")
      .select(`
        *,
        owner:profiles!albums_owner_id_fkey(id, username, display_name, avatar_url, wallet_address),
        co_owners:album_co_owners(user_id, user:profiles(username, display_name, avatar_url))
      `)
      .or(`owner_id.eq.${userId},album_co_owners.user_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching albums:", error);
    } else {
      setAlbums(data || []);
    }
    setLoading(false);
  };

  const fetchPublicAlbums = async (limit = 50) => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("albums")
      .select(`
        *,
        owner:profiles!albums_owner_id_fkey(id, username, display_name, avatar_url, wallet_address),
        co_owners:album_co_owners(user_id, user:profiles(username, display_name, avatar_url))
      `)
      .eq("is_public", true)
      .order("love_count", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching public albums:", error);
    } else {
      setAlbums(data || []);
    }
    setLoading(false);
  };

  const createAlbum = async (data: {
    title: string;
    description?: string;
    is_public?: boolean;
    cover_image_url?: string;
  }) => {
    if (!userId) return { error: new Error("Not authenticated") };

    const { data: album, error } = await supabase
      .from("albums")
      .insert({
        owner_id: userId,
        title: data.title,
        description: data.description,
        is_public: data.is_public ?? false,
        cover_image_url: data.cover_image_url,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create album", { description: error.message });
      return { error };
    }
    
    toast.success("Album created!");
    await fetchUserAlbums();
    return { album, error: null };
  };

  const updateAlbum = async (albumId: string, data: {
    title?: string;
    description?: string;
    is_public?: boolean;
    cover_image_url?: string;
  }) => {
    const { error } = await supabase
      .from("albums")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", albumId);

    if (error) {
      toast.error("Failed to update album", { description: error.message });
      return { error };
    }
    
    toast.success("Album updated!");
    await fetchUserAlbums();
    return { error: null };
  };

  const deleteAlbum = async (albumId: string) => {
    const { error } = await supabase
      .from("albums")
      .delete()
      .eq("id", albumId);

    if (error) {
      toast.error("Failed to delete album", { description: error.message });
      return { error };
    }
    
    toast.success("Album deleted");
    await fetchUserAlbums();
    return { error: null };
  };

  const transferOwnership = async (albumId: string, newOwnerId: string) => {
    const { error } = await supabase
      .from("albums")
      .update({ owner_id: newOwnerId, updated_at: new Date().toISOString() })
      .eq("id", albumId);

    if (error) {
      toast.error("Failed to transfer ownership", { description: error.message });
      return { error };
    }
    
    toast.success("Ownership transferred!");
    await fetchUserAlbums();
    return { error: null };
  };

  const addCoOwner = async (albumId: string, coOwnerId: string) => {
    const { error } = await supabase
      .from("album_co_owners")
      .insert({ album_id: albumId, user_id: coOwnerId });

    if (error) {
      toast.error("Failed to add co-owner", { description: error.message });
      return { error };
    }
    
    toast.success("Co-owner added!");
    return { error: null };
  };

  const loveAlbum = async (albumId: string) => {
    if (!userId) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("album_loves")
      .insert({ album_id: albumId, user_id: userId });

    if (error && error.code !== "23505") { // Ignore duplicate key error
      toast.error("Failed to love album");
      return { error };
    }
    
    return { error: null };
  };

  const unloveAlbum = async (albumId: string) => {
    if (!userId) return;

    await supabase
      .from("album_loves")
      .delete()
      .eq("album_id", albumId)
      .eq("user_id", userId);
  };

  useEffect(() => {
    if (userId) {
      fetchUserAlbums();
    }
  }, [userId]);

  return {
    albums,
    loading,
    createAlbum,
    updateAlbum,
    deleteAlbum,
    transferOwnership,
    addCoOwner,
    loveAlbum,
    unloveAlbum,
    fetchUserAlbums,
    fetchPublicAlbums,
  };
}
