import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

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
  first_memory_url?: string | null;
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

interface AlbumsContextType {
  albums: Album[];
  loading: boolean;
  createAlbum: (data: {
    title: string;
    description?: string;
    is_public?: boolean;
    cover_image_url?: string;
  }) => Promise<{ album?: Album; error: Error | null }>;
  updateAlbum: (
    albumId: string,
    data: {
      title?: string;
      description?: string;
      is_public?: boolean;
      cover_image_url?: string;
    }
  ) => Promise<{ error: Error | null }>;
  deleteAlbum: (albumId: string) => Promise<{ error: Error | null }>;
  refreshAlbums: () => Promise<void>;
  fetchPublicAlbums: (limit?: number) => Promise<void>;
  fetchAlbumById: (albumId: string) => Promise<Album | null>;
}

const AlbumsContext = createContext<AlbumsContextType | undefined>(undefined);

export function AlbumsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  // ============================
  // Fetch albums owned or co-owned by user
  // ============================
  const fetchUserAlbums = async () => {
    if (!user?.id) {
      setAlbums([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("albums")
      .select(`
        *,
        owner:profiles!albums_owner_id_fkey(
          id, username, display_name, avatar_url, wallet_address
        ),
        co_owners:album_co_owners(
          user_id,
          user:profiles(username, display_name, avatar_url)
        ),
        memories(image_url, display_order)
      `)
      .or(
        `owner_id.eq.${user.id},album_co_owners.user_id.eq.${user.id}`
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching albums:", error);
      setAlbums([]);
    } else {
      const processed = (data || []).map((album) => {
        const sortedMemories = album.memories?.sort(
          (a: any, b: any) =>
            (a.display_order || 0) - (b.display_order || 0)
        );
        return {
          ...album,
          first_memory_url: sortedMemories?.[0]?.image_url || null,
          memories: undefined,
        };
      });
      setAlbums(processed);
    }

    setLoading(false);
  };

  // ============================
  // Fetch public albums (explore)
  // ============================
  const fetchPublicAlbums = async (limit = 50) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("albums")
      .select(`
        *,
        owner:profiles!albums_owner_id_fkey(
          id, username, display_name, avatar_url, wallet_address
        ),
        co_owners:album_co_owners(
          user_id,
          user:profiles(username, display_name, avatar_url)
        ),
        memories(image_url, display_order)
      `)
      .eq("is_public", true)
      .order("love_count", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching public albums:", error);
    } else {
      const processed = (data || []).map((album) => {
        const sortedMemories = album.memories?.sort(
          (a: any, b: any) =>
            (a.display_order || 0) - (b.display_order || 0)
        );
        return {
          ...album,
          first_memory_url: sortedMemories?.[0]?.image_url || null,
          memories: undefined,
        };
      });
      setAlbums(processed);
    }

    setLoading(false);
  };

  // ============================
  // Fetch single album by ID (PUBLIC-SAFE)
  // ============================
  const fetchAlbumById = async (albumId: string): Promise<Album | null> => {
    const { data, error } = await supabase
      .from("albums")
      .select(`
        *,
        owner:profiles!albums_owner_id_fkey(
          id, username, display_name, avatar_url, wallet_address
        ),
        co_owners:album_co_owners(
          user_id,
          user:profiles(username, display_name, avatar_url)
        ),
        memories(image_url, display_order)
      `)
      .eq("id", albumId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching album:", error);
      return null;
    }

    if (!data) return null;

    const sortedMemories = data.memories?.sort(
      (a: any, b: any) =>
        (a.display_order || 0) - (b.display_order || 0)
    );

    return {
      ...data,
      first_memory_url: sortedMemories?.[0]?.image_url || null,
      memories: undefined,
    };
  };

  // ============================
  // CRUD
  // ============================
  const createAlbum = async (data: {
    title: string;
    description?: string;
    is_public?: boolean;
    cover_image_url?: string;
  }) => {
    if (!user?.id) return { error: new Error("Not authenticated") };

    const { data: album, error } = await supabase
      .from("albums")
      .insert({
        owner_id: user.id,
        title: data.title,
        description: data.description,
        is_public: data.is_public ?? false,
        cover_image_url: data.cover_image_url,
      })
      .select(`
        *,
        owner:profiles!albums_owner_id_fkey(
          id, username, display_name, avatar_url, wallet_address
        ),
        co_owners:album_co_owners(
          user_id,
          user:profiles(username, display_name, avatar_url)
        )
      `)
      .single();

    if (error) {
      toast.error("Failed to create album", { description: error.message });
      return { error };
    }

    toast.success("Album created!");
    setAlbums((prev) => [{ ...album, first_memory_url: null }, ...prev]);
    return { album, error: null };
  };

  const updateAlbum = async (
    albumId: string,
    data: {
      title?: string;
      description?: string;
      is_public?: boolean;
      cover_image_url?: string;
    }
  ) => {
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
    const { error } = await supabase.from("albums").delete().eq("id", albumId);

    if (error) {
      toast.error("Failed to delete album", { description: error.message });
      return { error };
    }

    toast.success("Album deleted");
    setAlbums((prev) => prev.filter((a) => a.id !== albumId));
    return { error: null };
  };

  // ============================
  // Realtime subscriptions
  // ============================
  useEffect(() => {
    if (!user?.id) return;

    const albumsChannel = supabase
      .channel(`user-albums-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "albums",
          filter: `owner_id=eq.${user.id}`,
        },
        fetchUserAlbums
      )
      .subscribe();

    const coOwnersChannel = supabase
      .channel(`user-co-owned-albums-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "album_co_owners",
          filter: `user_id=eq.${user.id}`,
        },
        fetchUserAlbums
      )
      .subscribe();

    return () => {
      supabase.removeChannel(albumsChannel);
      supabase.removeChannel(coOwnersChannel);
    };
  }, [user?.id]);

  useEffect(() => {
    fetchUserAlbums();
  }, [user?.id]);

  return (
    <AlbumsContext.Provider
      value={{
        albums,
        loading,
        createAlbum,
        updateAlbum,
        deleteAlbum,
        refreshAlbums: fetchUserAlbums,
        fetchPublicAlbums,
        fetchAlbumById,
      }}
    >
      {children}
    </AlbumsContext.Provider>
  );
}

export function useAlbumsContext() {
  const context = useContext(AlbumsContext);
  if (!context) {
    throw new Error(
      "useAlbumsContext must be used within an AlbumsProvider"
    );
  }
  return context;
}
