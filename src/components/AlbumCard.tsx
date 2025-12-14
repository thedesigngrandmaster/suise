import { Heart, Eye, Share2, Users, UserPlus, UserMinus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAlbumFollows } from "@/hooks/useAlbumFollows";

interface Album {
  id: string;
  title: string;
  cover_image_url?: string | null;
  first_memory_url?: string | null;
  is_public: boolean;
  view_count: number;
  love_count?: number;
  follower_count?: number;
  owner_id: string;
}

interface AlbumCardProps {
  album: Album;
  onClick?: () => void;
  onDelete?: () => void;
  showFollowButton?: boolean;
}

export function AlbumCard({ album, onClick, showFollowButton = true }: AlbumCardProps) {
  const { user } = useAuth();
  const { isFollowing, followerCount, loading, followAlbum, unfollowAlbum } = useAlbumFollows(
    user?.id,
    album.id
  );

  const isOwnAlbum = user?.id === album.owner_id;
  const coverImage = album.cover_image_url || album.first_memory_url;
  
  // Use follower count from album data or from hook
  const displayFollowerCount = album.follower_count ?? followerCount;

  const handleFollowClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFollowing) {
      await unfollowAlbum();
    } else {
      await followAlbum();
    }
  };

  return (
    <div
      className={cn(
        "group relative aspect-square rounded-2xl overflow-hidden bg-muted cursor-pointer",
        "transition-all duration-300 hover:shadow-neubrutalist hover:scale-[1.02]"
      )}
      onClick={onClick}
    >
      {/* Cover Image */}
      {coverImage ? (
        <img
          src={coverImage}
          alt={album.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary/20 to-primary/20">
          <span className="text-4xl">📸</span>
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
            {album.title}
          </h3>

          {/* Stats Row */}
          <div className="flex items-center gap-4 text-white/80 text-sm mb-3">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{album.view_count || 0}</span>
            </div>
            {album.love_count !== undefined && (
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{album.love_count}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{displayFollowerCount}</span>
            </div>
          </div>

          {/* Follow Button */}
          {showFollowButton && !isOwnAlbum && user && (
            <Button
              variant={isFollowing ? "outline" : "suise"}
              size="sm"
              className="w-full"
              onClick={handleFollowClick}
              disabled={loading}
            >
              {isFollowing ? (
                <>
                  <UserMinus className="w-4 h-4 mr-2" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Follow
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Private Badge */}
      {!album.is_public && (
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium">
          Private
        </div>
      )}
    </div>
  );
}
