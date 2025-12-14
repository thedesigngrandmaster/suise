import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "./useAuth";

export interface Memory {
  id: string;
  album_id: string;
  owner_id: string;
  image_url: string;
  caption: string | null;
  is_public: boolean;
  view_count: number;
  love_count: number;
  created_at: string;
  display_order: number;
}

export function useMemories(albumId?: string) {
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAlbumMemories = async (id?: string) => {
    const targetId = id || albumId;
    if (!targetId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("memories")
      .select("*")
      .eq("album_id", targetId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching memories:", error);
    } else {
      setMemories(data || []);
    }
    setLoading(false);
  };

  const updateMemoryOrder = async (orderedMemories: Memory[]) => {
    // Update local state immediately
    setMemories(orderedMemories);

    // Batch update in database
    const updates = orderedMemories.map((memory, index) => ({
      id: memory.id,
      display_order: index + 1,
    }));

    for (const update of updates) {
      await supabase
        .from("memories")
        .update({ display_order: update.display_order })
        .eq("id", update.id);
    }
  };

  const uploadMemory = async (
    albumId: string,
    file: File,
    caption?: string,
    isPublic = false
  ) => {
    if (!user) return { error: new Error("Not authenticated") };

    // Upload file to storage
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("memories")
      .upload(fileName, file);

    if (uploadError) {
      toast.error("Failed to upload image", { description: uploadError.message });
      return { error: uploadError };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("memories")
      .getPublicUrl(fileName);

    // Create memory record
    const { data: memory, error } = await supabase
      .from("memories")
      .insert({
        album_id: albumId,
        owner_id: user.id,
        image_url: publicUrl,
        caption,
        is_public: isPublic,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to save memory", { description: error.message });
      return { error };
    }

    // Set as album cover if this is the first memory
    const { count } = await supabase
      .from("memories")
      .select("*", { count: "exact", head: true })
      .eq("album_id", albumId);
    
    if (count === 1) {
      await supabase
        .from("albums")
        .update({ cover_image_url: publicUrl })
        .eq("id", albumId);
    }

    // Update streak
    await supabase.rpc("update_user_streak", { p_user_id: user.id });

    toast.success("Memory added! 🎉");
    await fetchAlbumMemories(albumId);
    return { memory, error: null };
  };

  const deleteMemory = async (memoryId: string) => {
    const { error } = await supabase
      .from("memories")
      .delete()
      .eq("id", memoryId);

    if (error) {
      toast.error("Failed to delete memory");
      return { error };
    }

    toast.success("Memory deleted");
    if (albumId) await fetchAlbumMemories();
    return { error: null };
  };

  return {
    memories,
    loading,
    uploadMemory,
    deleteMemory,
    updateMemoryOrder,
    fetchAlbumMemories,
  };
}
