import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAlbumLoves(userId?: string, albumId?: string) {
  const [isLoved, setIsLoved] = useState(false);
  const [loveCount, setLoveCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch initial love status and count
  useEffect(() => {
    if (!albumId) return;

    const fetchLoveStatus = async () => {
      // Fetch love count
      const { count } = await supabase
        .from("album_loves")
        .select("*", { count: "exact", head: true })
        .eq("album_id", albumId);
      
      setLoveCount(count || 0);

      // Check if user has loved
      if (userId) {
        const { data } = await supabase
          .from("album_loves")
          .select("id")
          .eq("album_id", albumId)
          .eq("user_id", userId)
          .maybeSingle();
        
        setIsLoved(!!data);
      }
    };

    fetchLoveStatus();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`album-loves-${albumId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "album_loves",
          filter: `album_id=eq.${albumId}`,
        },
        async () => {
          // Refetch count on any change
          const { count } = await supabase
            .from("album_loves")
            .select("*", { count: "exact", head: true })
            .eq("album_id", albumId);
          
          setLoveCount(count || 0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [albumId, userId]);

  const toggleLove = useCallback(async () => {
    if (!userId || !albumId) {
      toast.error("Please sign in to love albums");
      return;
    }

    setLoading(true);

    if (isLoved) {
      // Unlike
      const { error } = await supabase
        .from("album_loves")
        .delete()
        .eq("album_id", albumId)
        .eq("user_id", userId);

      if (!error) {
        setIsLoved(false);
        setLoveCount((prev) => Math.max(0, prev - 1));
      }
    } else {
      // Like
      const { error } = await supabase
        .from("album_loves")
        .insert({ album_id: albumId, user_id: userId });

      if (!error) {
        setIsLoved(true);
        setLoveCount((prev) => prev + 1);
      } else if (error.code !== "23505") {
        toast.error("Failed to love album");
      }
    }

    setLoading(false);
  }, [userId, albumId, isLoved]);

  return {
    isLoved,
    loveCount,
    loading,
    toggleLove,
  };
}
