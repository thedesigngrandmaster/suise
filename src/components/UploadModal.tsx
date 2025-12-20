import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAlbums } from "@/hooks/useAlbums";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  // CRITICAL FIX: Get user from useAuth
  const { user } = useAuth();
  
  // CRITICAL FIX: Pass user?.id to useAlbums
  const { createAlbum } = useAlbums(user?.id);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [creating, setCreating] = useState(false);

  // Debug logs
  console.log('UploadModal - user:', user);
  console.log('UploadModal - user?.id:', user?.id);

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!user?.id) {
      toast.error("Not authenticated");
      return;
    }

    setCreating(true);

    try {
      const result = await createAlbum({
        title: title.trim(),
        description: description.trim() || undefined,
        is_public: isPublic,
      });

      if (result.error) {
        console.error('Create album failed:', result.error);
        toast.error("Failed to create album");
      } else {
        console.log('Album created:', result.album);
        toast.success("Album created!");
        resetForm();
        onClose();
      }
    } catch (error) {
      console.error('Exception creating album:', error);
      toast.error("Failed to create album");
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setIsPublic(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Album</DialogTitle>
          <DialogDescription>
            Create a new album to organize your memories
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Album Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summer Vacation 2024"
              className="mt-1"
              disabled={creating}
            />
          </div>

          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Memories from our summer trip..."
              className="mt-1"
              disabled={creating}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="public">Make album public</Label>
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
              disabled={creating}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              variant="suise"
              onClick={handleCreate}
              className="flex-1"
              disabled={creating || !title.trim()}
            >
              {creating ? "Creating..." : "Create Album"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
