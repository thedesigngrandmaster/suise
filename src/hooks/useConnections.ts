import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Connection {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
  requester?: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
  addressee?: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export function useConnections(userId?: string) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = async () => {
    if (!userId) return;
    
    const { data, error } = await supabase
      .from("connections")
      .select(`
        *,
        requester:profiles!connections_requester_id_fkey(username, display_name, avatar_url),
        addressee:profiles!connections_addressee_id_fkey(username, display_name, avatar_url)
      `)
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .eq("status", "accepted");

    if (!error && data) {
      setConnections(data);
    }
    setLoading(false);
  };

  const fetchPendingRequests = async () => {
    if (!userId) return;
    
    const { data, error } = await supabase
      .from("connections")
      .select(`
        *,
        requester:profiles!connections_requester_id_fkey(username, display_name, avatar_url)
      `)
      .eq("addressee_id", userId)
      .eq("status", "pending");

    if (!error && data) {
      setPendingRequests(data);
    }
  };

  const sendRequest = async (addresseeId: string) => {
    if (!userId) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("connections")
      .insert({ requester_id: userId, addressee_id: addresseeId });

    if (error) {
      if (error.code === "23505") {
        toast.error("Connection request already sent");
      } else {
        toast.error("Failed to send request");
      }
      return { error };
    }

    toast.success("Connection request sent!");
    return { error: null };
  };

  const acceptRequest = async (connectionId: string) => {
    const { error } = await supabase
      .from("connections")
      .update({ status: "accepted" })
      .eq("id", connectionId);

    if (error) {
      toast.error("Failed to accept request");
      return { error };
    }

    toast.success("Connection accepted!");
    await fetchConnections();
    await fetchPendingRequests();
    return { error: null };
  };

  const rejectRequest = async (connectionId: string) => {
    const { error } = await supabase
      .from("connections")
      .update({ status: "rejected" })
      .eq("id", connectionId);

    if (!error) {
      await fetchPendingRequests();
    }
    return { error };
  };

  useEffect(() => {
    fetchConnections();
    fetchPendingRequests();
  }, [userId]);

  return {
    connections,
    pendingRequests,
    loading,
    sendRequest,
    acceptRequest,
    rejectRequest,
    refetch: fetchConnections,
  };
}
