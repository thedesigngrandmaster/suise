import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Camera, User, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onUploadComplete?: (url: string | null) => void;
  size?: "sm" | "md" | "lg";
}

export function AvatarUpload({ currentAvatarUrl, onUploadComplete, size = "lg" }: AvatarUploadProps) {
  const { user, refreshProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-20 h-20",
    lg: "w-24 h-24",
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true, cacheControl: "3600" });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const avatarUrl = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      onUploadComplete?.(avatarUrl);
      toast.success("Profile picture updated!");
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload image", { description: error.message });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    setUploading(true);

    try {
      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from("avatars")
        .remove([`${user.id}/avatar.jpg`, `${user.id}/avatar.png`, `${user.id}/avatar.webp`]);

      // Update profile to remove avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      onUploadComplete?.(null);
      toast.success("Profile picture removed!");
    } catch (error: any) {
      console.error("Error removing avatar:", error);
      toast.error("Failed to remove image", { description: error.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={currentAvatarUrl || undefined} />
        <AvatarFallback className="bg-secondary/20">
          <User className="w-1/2 h-1/2 text-secondary" />
        </AvatarFallback>
      </Avatar>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="secondary"
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Upload new photo
          </DropdownMenuItem>
          {currentAvatarUrl && (
            <DropdownMenuItem onClick={handleRemoveAvatar} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Remove photo
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
