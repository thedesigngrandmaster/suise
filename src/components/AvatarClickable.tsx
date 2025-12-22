import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { User, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarClickableProps {
  avatarUrl: string | null | undefined;
  displayName?: string | null;
  username?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

export function AvatarClickable({ 
  avatarUrl, 
  displayName, 
  username, 
  size = "md",
  className 
}: AvatarClickableProps) {
  const [open, setOpen] = useState(false);

  if (!avatarUrl) {
    return (
      <Avatar className={cn(sizeClasses[size], className)}>
        <AvatarFallback className="bg-secondary/20">
          <User className="w-1/2 h-1/2 text-secondary" />
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="relative group">
          <Avatar className={cn(sizeClasses[size], "cursor-pointer transition-transform group-hover:scale-105", className)}>
            <AvatarImage src={avatarUrl} alt={displayName || username || "Profile"} />
            <AvatarFallback className="bg-secondary/20">
              <User className="w-1/2 h-1/2 text-secondary" />
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-full transition-colors" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-0 bg-transparent">
        <div className="relative">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <img
            src={avatarUrl}
            alt={displayName || username || "Profile"}
            className="w-full h-auto max-h-[90vh] object-contain"
          />
          {(displayName || username) && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <p className="text-white font-bold text-lg">{displayName || username}</p>
              {displayName && username && (
                <p className="text-white/80 text-sm">@{username}</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
