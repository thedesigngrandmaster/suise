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
  const [sentRequests, setSentRequests] = useState<Connection[]>([]);
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

  const fetchSentRequests = async () => {
    if (!userId) return;
    
    const { data, error } = await supabase
      .from("connections")
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

// sendRequest: inserts a connection request and optionally fetches the inserted row safely
async function sendRequest(addresseeId: string) {
  if (!user?.id) {
    console.error('sendRequest: not authenticated');
    throw new Error('Not authenticated');
  }

  const payload = {
    requester_id: user.id,    // MUST equal auth.uid()
    addressee_id: addresseeId,
    status: 'pending',
  };

  try {
    // Insert without chaining .select() to avoid SELECT RLS interfering with insert success
    const { data: insertData, error: insertError } = await supabase
      .from('connection_requests')
      .insert([payload]);

    console.log('sendRequest - insert result', { insertData, insertError });

    if (insertError) {
      // Surface DB error (RLS/constraint)
      console.error('sendRequest - insert failed', insertError);
      return { success: false, error: insertError };
    }

    const insertedId = insertData?.[0]?.id ?? null;

    // If you need the inserted row for UI, fetch it in a separate SELECT.
    // This SELECT is subject to SELECT policies; handle failures gracefully.
    if (insertedId) {
      try {
        const { data: fetched, error: fetchError } = await supabase
          .from('connection_requests')
          .select(
            `id, requester_id, addressee_id, status, created_at,
             requester:requester(username,display_name,avatar_url),
             addressee:addressee(username,display_name,avatar_url)`
          )
          .eq('id', insertedId)
          .single();

        if (fetchError) {
          console.warn('sendRequest - fetch after insert failed (likely SELECT RLS):', fetchError);
          // Still treat the operation as success if insert succeeded.
          return { success: true, id: insertedId, fetched: null, warning: fetchError };
        }

        return { success: true, id: insertedId, fetched };
      } catch (err) {
        console.warn('sendRequest - unexpected fetch error', err);
        return { success: true, id: insertedId, fetched: null, warning: err };
      }
    }

    return { success: true, id: null };
  } catch (error) {
    console.error('sendRequest - unexpected error', error);
    return { success: false, error };
  }
}

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
