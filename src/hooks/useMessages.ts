import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender?: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface ChatThread {
  partnerId: string;
  partner: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export function useMessages(userId?: string) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  const fetchThreads = async () => {
    if (!userId) return;
    
    const { data, error } = await supabase
      .from("messages")
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(username, display_name, avatar_url),
        receiver:profiles!messages_receiver_id_fkey(username, display_name, avatar_url)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Group by chat partner
      const threadMap = new Map<string, ChatThread>();
      let unreadTotal = 0;
      
      data.forEach((msg: any) => {
        const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
        const partner = msg.sender_id === userId ? msg.receiver : msg.sender;
        
        if (!threadMap.has(partnerId)) {
          const isUnread = msg.receiver_id === userId && !msg.read;
          if (isUnread) unreadTotal++;
          threadMap.set(partnerId, {
            partnerId,
            partner,
            lastMessage: msg.content,
            lastMessageTime: msg.created_at,
            unreadCount: isUnread ? 1 : 0,
          });
        } else if (msg.receiver_id === userId && !msg.read) {
          const thread = threadMap.get(partnerId)!;
          thread.unreadCount++;
          unreadTotal++;
        }
      });
      
      setThreads(Array.from(threadMap.values()));
      setTotalUnreadCount(unreadTotal);
    }
    setLoading(false);
  };

  const fetchConversation = async (partnerId: string) => {
    if (!userId) return;
    
    const { data, error } = await supabase
      .from("messages")
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(username, display_name, avatar_url)
      `)
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`
      )
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data);
      
      // Find unread messages from the partner
      const unreadIds = data
        .filter((msg: Message) => msg.sender_id === partnerId && msg.receiver_id === userId && !msg.read)
        .map((msg: Message) => msg.id);
      
      if (unreadIds.length > 0) {
        // Mark as read in database
        await supabase
          .from("messages")
          .update({ read: true })
          .in("id", unreadIds);
        
        // Update local state immediately
        setMessages((prev) =>
          prev.map((msg) =>
            unreadIds.includes(msg.id) ? { ...msg, read: true } : msg
          )
        );
        
        // Update total unread count
        setTotalUnreadCount((prev) => Math.max(0, prev - unreadIds.length));
      }
      
      // Refresh threads to update unread count
      fetchThreads();
    }
  };

  const sendMessage = async (receiverId: string, content: string) => {
    if (!userId) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("messages")
      .insert({ sender_id: userId, receiver_id: receiverId, content });

    if (error) {
      toast.error("Failed to send message");
      return { error };
    }

    await fetchConversation(receiverId);
    return { error: null };
  };

  useEffect(() => {
    fetchThreads();
  }, [userId]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`messages-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);
          fetchThreads(); // Refresh threads to update unread count
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          );
          fetchThreads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return {
    threads,
    messages,
    loading,
    totalUnreadCount,
    fetchConversation,
    sendMessage,
    refetch: fetchThreads,
  };
}
