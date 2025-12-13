import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface CoverPhotoUploadProps {
  currentCoverUrl?: string | null;
  onUploadComplete?: (url: string | null) => void;
}

export function CoverPhotoUpload({ currentCoverUrl, onUploadComplete }: CoverPhotoUploadProps) {
  const { user, refreshProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/cover.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("covers")
        .upload(fileName, file, { upsert: true, cacheControl: "3600" });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("covers")
        .getPublicUrl(fileName);

      const coverUrl = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ cover_photo_url: coverUrl, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      onUploadComplete?.(coverUrl);
      toast.success("Cover photo updated!");
    } catch (error: any) {
      console.error("Error uploading cover:", error);
      toast.error("Failed to upload image", { description: error.message });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveCover = async () => {
    if (!user) return;
    setUploading(true);

    try {
      await supabase.storage
        .from("covers")
        .remove([`${user.id}/cover.jpg`, `${user.id}/cover.png`, `${user.id}/cover.webp`]);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ cover_photo_url: null, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      onUploadComplete?.(null);
      toast.success("Cover photo removed!");
    } catch (error: any) {
      console.error("Error removing cover:", error);
      toast.error("Failed to remove image", { description: error.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative w-full h-32 sm:h-48 bg-gradient-to-br from-secondary/30 to-primary/30 rounded-2xl overflow-hidden group">
      {currentCoverUrl && (
        <img 
          src={currentCoverUrl} 
          alt="Cover" 
          className="w-full h-full object-cover"
        />
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
      
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Camera className="w-4 h-4 mr-2" />
          )}
          {currentCoverUrl ? "Change" : "Add Cover"}
        </Button>
        {currentCoverUrl && (
          <Button
            size="sm"
            variant="destructive"
            onClick={handleRemoveCover}
            disabled={uploading}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
