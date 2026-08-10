import { Heart, Eye, Users, BookmarkCheck, Bookmark, Globe, Lock, ArrowRightLeft } from "lucide-react";
import { Album } from "@/hooks/useAlbums";
import { useAlbumFollows } from "@/hooks/useAlbumFollows";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AlbumCardProps {
  album: Partial<Album> & Pick<Album, "id" | "title" | "owner_id">;
  onClick: () => void;
  showOwner?: boolean;
  showFollowButton?: boolean;
  onDelete?: () => void;
  showVisibility?: boolean;
  onTransfer?: () => void;
}

export function AlbumCard({
  album,
  onClick,
  showOwner = false,
  showFollowButton = false,
  showVisibility = false,
  onTransfer,
}: AlbumCardProps) {
  const { user } = useAuth();
  const { isFollowing, followAlbum, unfollowAlbum } = useAlbumFollows(user?.id);
  
  // Determine which image to show - prioritize cover_image_url, fallback to first_memory_url
  const imageUrl = album.cover_image_url || album.first_memory_url;
  const isOwner = user && album.owner_id === user.id;
  const showFollow = showFollowButton && user && !isOwner;

  const handleFollowClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast.error("Please sign in to follow albums");
      return;
    }

    try {
      if (isFollowing(album.id)) {
        await unfollowAlbum(album.id);
        toast.success("Unfollowed album");
      } else {
        await followAlbum(album.id);
        toast.success("Following album");
      }
    } catch (error) {
      console.error("Follow action failed:", error);
      toast.error("Failed to update follow status");
    }
  };

  return (
    <div className="group relative">
      <div 
        onClick={onClick}
        className="cursor-pointer"
      >
        {/* Album Image */}
        <div className="aspect-square rounded-3xl overflow-hidden bg-muted relative border border-border/50 shadow-neubrutalist-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-neubrutalist">
          {/* Visibility badge */}
          {showVisibility && (
            <span
              className={cn(
                "absolute top-2 left-2 z-10 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md",
                album.is_public
                  ? "bg-accent/85 text-accent-foreground"
                  : "bg-background/85 text-foreground"
              )}
            >
              {album.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {album.is_public ? "Public" : "Private"}
            </span>
          )}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={album.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary/10">
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">No photos yet</p>
              </div>
            </div>
          )}
          
          {/* Hover Overlay with Stats */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
            <div className="flex items-center gap-3 text-white text-sm">
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {album.love_count || 0}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {album.view_count || 0}
              </span>
            </div>
          </div>

          {/* Transfer ownership */}
          {isOwner && onTransfer && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant="secondary"
                aria-label={`Hand over ${album.title}`}
                className="h-8 w-8 rounded-full shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  onTransfer();
                }}
              >
                <ArrowRightLeft className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Follow Button Overlay */}
          {showFollow && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant={isFollowing(album.id) ? "secondary" : "default"}
                className="h-8 w-8 rounded-full shadow-lg"
                onClick={handleFollowClick}
              >
                {isFollowing(album.id) ? (
                  <BookmarkCheck className="w-4 h-4" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Album Info */}
        <div className="mt-2">
          <h3 className="font-bold text-sm line-clamp-1">{album.title}</h3>
          {album.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {album.description}
            </p>
          )}
          
          {/* Owner Info */}
          {showOwner && album.owner && (
            <div className="flex items-center gap-2 mt-2">
              {album.owner.avatar_url ? (
                <img
                  src={album.owner.avatar_url}
                  alt={album.owner.display_name || album.owner.username || ''}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Users className="w-3 h-3 text-secondary" />
                </div>
              )}
              <span className="text-xs text-muted-foreground">
                {album.owner.display_name || album.owner.username}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
