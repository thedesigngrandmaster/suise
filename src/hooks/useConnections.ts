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

// CHANGE THIS TO MATCH YOUR TABLE NAME
// If your table is called "connection_requests", change all instances below
const TABLE_NAME = "connection_requests"; // or "connections"

export function useConnections(userId?: string) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [sentRequests, setSentRequests] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = async () => {
    if (!userId) return;
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        requester:profiles!${TABLE_NAME}_requester_id_fkey(username, display_name, avatar_url),
        addressee:profiles!${TABLE_NAME}_addressee_id_fkey(username, display_name, avatar_url)
      `)
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .eq("status", "accepted");

    if (!error && data) {
      setConnections(data);
    }
    setLoading(false);
  };

  const fetchSentRequests = async () => {
    if (!userId) return;
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("requester_id", userId)
      .eq("status", "pending");

    if (!error && data) {
      setSentRequests(data);
    }
  };

  const fetchPendingRequests = async () => {
    if (!userId) return;
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        requester:profiles!${TABLE_NAME}_requester_id_fkey(username, display_name, avatar_url)
      `)
      .eq("addressee_id", userId)
      .eq("status", "pending");

    if (!error && data) {
      setPendingRequests(data);
    }
  };

  const sendRequest = async (addresseeId: string) => {
    if (!userId) {
      toast.error('Not authenticated');
      return { error: new Error('Not authenticated') };
    }

    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert({
          requester_id: userId,
          addressee_id: addresseeId,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('sendRequest failed:', error);
        toast.error("Failed to send connection request");
        return { error };
      }

      toast.success("Connection request sent!");
      await fetchSentRequests();
      return { data, error: null };
    } catch (error) {
      console.error('sendRequest exception:', error);
      toast.error("Failed to send connection request");
      return { error };
    }
  };

  const acceptRequest = async (connectionId: string) => {
    const { error } = await supabase
      .from(TABLE_NAME)
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
      .from(TABLE_NAME)
      .update({ status: "rejected" })
      .eq("id", connectionId);

    if (!error) {
      toast.success("Request rejected");
      await fetchPendingRequests();
    }
    return { error };
  };

  useEffect(() => {
    fetchConnections();
    fetchPendingRequests();
    fetchSentRequests();
  }, [userId]);

  const hasSentRequest = (targetUserId: string) => {
    return sentRequests.some((r) => r.addressee_id === targetUserId);
  };

  const isConnected = (targetUserId: string) => {
    return connections.some(
      (c) => c.requester_id === targetUserId || c.addressee_id === targetUserId
    );
  };

  return {
    connections,
    pendingRequests,
    sentRequests,
    loading,
    sendRequest,
    acceptRequest,
    rejectRequest,
    hasSentRequest,
    isConnected,
    refetch: fetchConnections,
  };
}
