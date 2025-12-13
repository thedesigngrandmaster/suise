import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

export default function Chat() {
  const { partnerId } = useParams<{ partnerId: string }>();
  const { user } = useAuth();
  const { threads, messages, loading, fetchConversation, sendMessage, refetch } = useMessages(user?.id);
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState("");
  const [partner, setPartner] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (partnerId) {
      fetchConversation(partnerId);
      // Fetch partner details
      supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", partnerId)
        .single()
        .then(({ data }) => setPartner(data));
    }
  }, [partnerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !partnerId) return;
    await sendMessage(partnerId, newMessage);
    setNewMessage("");
  };

  // Thread list view
  if (!partnerId) {
    return (
      <DashboardLayout activeTab="chat" onTabChange={(tab) => navigate(`/${tab === "home" ? "" : tab}`)}>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold font-bricolage mb-6">Messages</h1>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 p-4 bg-muted rounded-2xl animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-muted-foreground/20" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted-foreground/20 rounded w-24 mb-2" />
                    <div className="h-3 bg-muted-foreground/20 rounded w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : threads.length === 0 ? (
            <div className="text-center py-16">
              <Send className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-bold mb-2">No messages yet</h3>
              <p className="text-muted-foreground">Start a conversation by visiting someone's profile</p>
            </div>
          ) : (
            <div className="space-y-2">
              {threads.map((thread) => (
                <button
                  key={thread.partnerId}
                  onClick={() => navigate(`/chat/${thread.partnerId}`)}
                  className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl hover:bg-muted transition-colors text-left"
                >
                  {thread.partner.avatar_url ? (
                    <img
                      src={thread.partner.avatar_url}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                      <User className="w-6 h-6 text-secondary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-medium truncate">
                        {thread.partner.display_name || thread.partner.username || "Unknown"}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(thread.lastMessageTime), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{thread.lastMessage}</p>
                  </div>
                  {thread.unreadCount > 0 && (
                    <span className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">
                      {thread.unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // Conversation view
  return (
    <DashboardLayout activeTab="chat" onTabChange={(tab) => navigate(`/${tab === "home" ? "" : tab}`)}>
      <div className="flex flex-col h-[calc(100vh-80px)] lg:h-screen max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button onClick={() => navigate("/chat")} className="lg:hidden">
            <ArrowLeft className="w-5 h-5" />
          </button>
          {partner?.avatar_url ? (
            <img src={partner.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-secondary" />
            </div>
          )}
          <p className="font-medium">{partner?.display_name || "Loading..."}</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                  msg.sender_id === user?.id
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted"
                }`}
              >
                <p>{msg.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button type="submit" variant="suise" size="icon" disabled={!newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
