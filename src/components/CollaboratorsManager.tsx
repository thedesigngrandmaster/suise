import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, X, Crown, Users } from "lucide-react";
import { toast } from "sonner";

interface Collaborator {
  user_id: string;
  added_at: string;
  user: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface CollaboratorsManagerProps {
  albumId: string;
  ownerId: string;
  isOwner: boolean;
  onUpdate?: () => void;
}

export function CollaboratorsManager({ albumId, ownerId, isOwner, onUpdate }: CollaboratorsManagerProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchUsername, setSearchUsername] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchCollaborators = async () => {
    const { data, error } = await supabase
      .from("album_co_owners")
      .select(`
        user_id,
        added_at,
        user:profiles!album_co_owners_user_id_fkey(username, display_name, avatar_url)
      `)
      .eq("album_id", albumId);

    if (error) {
      console.error("Error fetching collaborators:", error);
    } else {
      setCollaborators(data as Collaborator[] || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCollaborators();
  }, [albumId]);

  const handleAddCollaborator = async () => {
    if (!searchUsername.trim()) return;
    
    setAdding(true);
    
    // Find user by username
    const { data: targetUser, error: userError } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("username", searchUsername.toLowerCase().trim())
      .single();

    if (userError || !targetUser) {
      toast.error("User not found", { description: "Check the username and try again" });
      setAdding(false);
      return;
    }

    if (targetUser.id === ownerId) {
      toast.error("Cannot add owner as collaborator");
      setAdding(false);
      return;
    }

    // Check if already a collaborator
    const existing = collaborators.find(c => c.user_id === targetUser.id);
    if (existing) {
      toast.error("User is already a collaborator");
      setAdding(false);
      return;
    }

    // Add collaborator
    const { error } = await supabase
      .from("album_co_owners")
      .insert({ album_id: albumId, user_id: targetUser.id });

    if (error) {
      toast.error("Failed to add collaborator", { description: error.message });
    } else {
      // Send notification to the invited user
      const { data: currentUser } = await supabase.auth.getUser();
      const { data: albumData } = await supabase
        .from("albums")
        .select("title")
        .eq("id", albumId)
        .single();

      await supabase.from("notifications").insert({
        user_id: targetUser.id,
        type: "collaboration_invite",
        title: "Album Collaboration Invite",
        message: `You've been invited to collaborate on "${albumData?.title || "an album"}"`,
        related_user_id: currentUser?.user?.id,
        related_album_id: albumId,
      });

      toast.success(`@${targetUser.username} added as collaborator!`);
      setSearchUsername("");
      await fetchCollaborators();
      onUpdate?.();
    }
    
    setAdding(false);
  };

  const handleRemoveCollaborator = async (userId: string, username: string | null) => {
    const { error } = await supabase
      .from("album_co_owners")
      .delete()
      .eq("album_id", albumId)
      .eq("user_id", userId);

    if (error) {
      toast.error("Failed to remove collaborator", { description: error.message });
    } else {
      toast.success(`@${username || "User"} removed`);
      await fetchCollaborators();
      onUpdate?.();
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-10 bg-muted rounded-lg animate-pulse" />
        <div className="h-10 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isOwner && (
        <div className="flex gap-2">
          <Input
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            placeholder="Enter username to invite..."
            onKeyDown={(e) => e.key === "Enter" && handleAddCollaborator()}
          />
          <Button 
            onClick={handleAddCollaborator} 
            disabled={adding || !searchUsername.trim()}
            variant="suise"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      )}

      {collaborators.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No collaborators yet</p>
          {isOwner && <p className="text-sm">Invite friends to collaborate on this album</p>}
        </div>
      ) : (
        <div className="space-y-2">
          {collaborators.map((collab) => (
            <div 
              key={collab.user_id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={collab.user.avatar_url || ""} />
                  <AvatarFallback>
                    {(collab.user.display_name || collab.user.username || "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{collab.user.display_name || collab.user.username}</p>
                  <p className="text-sm text-muted-foreground">@{collab.user.username}</p>
                </div>
              </div>
              
              {isOwner && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveCollaborator(collab.user_id, collab.user.username)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
