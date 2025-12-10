import { Heart, MessageCircle, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface MemoryCardProps {
  imageUrl: string;
  caption?: string;
  likes?: number;
  comments?: number;
  className?: string;
}

export function MemoryCard({ 
  imageUrl, 
  caption, 
  likes = 0, 
  comments = 0,
  className 
}: MemoryCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border-2 border-foreground bg-card shadow-neubrutalist transition-transform hover:scale-[1.02]",
        className
      )}
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={imageUrl}
          alt={caption || "Memory"}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      
      {caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 to-transparent p-3 pt-8">
          <p className="text-card text-sm font-medium line-clamp-2">{caption}</p>
        </div>
      )}

      <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleLike}
          className={cn(
            "p-2 rounded-full border-2 border-foreground transition-all",
            liked ? "bg-destructive" : "bg-card hover:bg-primary"
          )}
        >
          <Heart className={cn("w-4 h-4", liked && "fill-current")} />
        </button>
        <button className="p-2 rounded-full border-2 border-foreground bg-card hover:bg-secondary transition-colors">
          <MessageCircle className="w-4 h-4" />
        </button>
        <button className="p-2 rounded-full border-2 border-foreground bg-card hover:bg-accent transition-colors">
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {likeCount > 0 && (
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-card/90 backdrop-blur-sm px-2 py-1 rounded-full border border-foreground text-xs font-bold">
          <Heart className="w-3 h-3 fill-destructive text-destructive" />
          {likeCount}
        </div>
      )}
    </div>
  );
}