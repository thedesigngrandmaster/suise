import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CollaboratorsManager } from "@/components/CollaboratorsManager";
import { supabase } from "@/integrations/supabase/client";
import { Globe, Lock, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";

interface AlbumPermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  album: { id: string; title: string; owner_id: string; is_public?: boolean | null };
  isOwner: boolean;
  onUpdated?: () => void;
  onTransfer?: () => void;
}

export function AlbumPermissionsDialog({
  open,
  onOpenChange,
  album,
  isOwner,
  onUpdated,
  onTransfer,
}: AlbumPermissionsDialogProps) {
  const [isPublic, setIsPublic] = useState(!!album.is_public);
  const [saving, setSaving] = useState(false);

  useEffect(() => setIsPublic(!!album.is_public), [album.id, album.is_public]);

  const setVisibility = async (next: boolean) => {
    setIsPublic(next);
    setSaving(true);

    const { error } = await supabase
      .from("albums")
      .update({ is_public: next, updated_at: new Date().toISOString() })
      .eq("id", album.id);

    if (!error) {
      // Photos follow the folder so a public folder is actually viewable.
      await supabase
        .from("memories")
        .update({ is_public: next })
        .eq("album_id", album.id);
    }

    setSaving(false);

    if (error) {
      setIsPublic(!next);
      toast.error("Could not update who can view this folder", {
        description: error.message,
      });
      return;
    }

    toast.success(next ? "Folder is now public" : "Folder is now private");
    onUpdated?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-bricolage">Manage access</DialogTitle>
          <DialogDescription>
            Choose who can view “{album.title}” and who shares ownership of it.
          </DialogDescription>
        </DialogHeader>

        <div className="soft-surface rounded-3xl p-4 flex items-start gap-3">
          <span
            aria-hidden
            className="w-10 h-10 rounded-2xl bg-secondary/12 flex items-center justify-center shrink-0"
          >
            {isPublic ? (
              <Globe className="w-5 h-5 text-secondary" />
            ) : (
              <Lock className="w-5 h-5 text-secondary" />
            )}
          </span>
          <div className="flex-1 min-w-0">
            <Label htmlFor="folder-visibility" className="font-semibold">
              {isPublic ? "Anyone can view" : "Only you and co-owners"}
            </Label>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isPublic
                ? "This folder and its photos appear on Explore and can be followed."
                : "This folder stays hidden from Explore, search and other people."}
            </p>
          </div>
          <Switch
            id="folder-visibility"
            checked={isPublic}
            disabled={!isOwner || saving}
            onCheckedChange={setVisibility}
            aria-label="Make this folder public"
          />
        </div>

        <div className="mt-2">
          <CollaboratorsManager
            albumId={album.id}
            ownerId={album.owner_id}
            isOwner={isOwner}
            onUpdate={onUpdated}
          />
        </div>

        {isOwner && onTransfer && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              onOpenChange(false);
              onTransfer();
            }}
          >
            <ArrowRightLeft className="w-4 h-4 mr-2" aria-hidden />
            Hand over ownership
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
