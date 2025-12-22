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
    setMemories(orderedMemories);

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
    if (!user) {
      toast.error("Not authenticated");
      return { error: new Error("Not authenticated") };
    }

    try {
      console.log("Starting upload for file:", file.name);

      // Get the next display_order
      const { count } = await supabase
        .from("memories")
        .select("*", { count: "exact", head: true })
        .eq("album_id", albumId);

      const nextOrder = (count || 0) + 1;

      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${albumId}/${Date.now()}.${fileExt}`;

      console.log("Uploading to storage:", fileName);

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("memories")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        toast.error("Failed to upload image", { description: uploadError.message });
        return { error: uploadError };
      }

      console.log("Upload successful:", uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("memories")
        .getPublicUrl(fileName);

      console.log("Public URL:", publicUrl);

      // Create memory record
      const { data: memory, error: dbError } = await supabase
        .from("memories")
        .insert({
          album_id: albumId,
          owner_id: user.id,
          image_url: publicUrl,
          caption: caption || null,
          is_public: isPublic,
          display_order: nextOrder,
        })
        .select()
        .single();

      if (dbError) {
        console.error("Database insert error:", dbError);
        toast.error("Failed to save memory", { description: dbError.message });
        return { error: dbError };
      }

      console.log("Memory saved to database:", memory);

      // FIXED: Set as album cover if this is the first memory
      if (nextOrder === 1) {
        console.log("Setting as album cover photo");
        const { error: coverError } = await supabase
          .from("albums")
          .update({ cover_image_url: publicUrl })
          .eq("id", albumId);

        if (coverError) {
          console.error("Failed to set cover:", coverError);
        } else {
          console.log("Album cover updated successfully");
        }
      }

      // Update streak
      try {
        await supabase.rpc("update_user_streak", { p_user_id: user.id });
      } catch (streakError) {
        console.error("Streak update error:", streakError);
        // Don't fail the upload if streak update fails
      }

      toast.success("Memory added! 🎉");
      
      // Refresh memories list
      await fetchAlbumMemories(albumId);
      
      return { memory, error: null };
    } catch (err: any) {
      console.error("Upload exception:", err);
      toast.error("Failed to upload memory", { description: err.message });
      return { error: err };
    }
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
