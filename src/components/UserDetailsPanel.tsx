import { useAuth } from "@/hooks/useAuth";
import { useAlbums } from "@/hooks/useAlbums";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StreakBadge } from "@/components/StreakBadge";
import { User, Images, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserDetailsPanelProps {
  collapsed?: boolean;
}

export function UserDetailsPanel({ collapsed = false }: UserDetailsPanelProps) {
  const { user, profile } = useAuth();
  const { albums } = useAlbums(user?.id);
  const navigate = useNavigate();

  if (!user || !profile) return null;

  const publicAlbumsCount = albums.filter((a) => a.is_public).length;
  const streakCount = profile.streak_count || 0;

  if (collapsed) {
    return (
      <button
        onClick={() => navigate(`/@${profile.username}`)}
        className="flex items-center justify-center p-2 hover:bg-muted rounded-full transition-colors"
      >
        <Avatar className="w-10 h-10">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback className="bg-secondary/20">
            <User className="w-5 h-5 text-secondary" />
          </AvatarFallback>
        </Avatar>
      </button>
    );
  }

  return (
    <div className="p-4 bg-muted/50 rounded-2xl">
      <button
        onClick={() => navigate(`/@${profile.username}`)}
        className="flex items-center gap-3 w-full text-left hover:opacity-80 transition-opacity"
      >
        <Avatar className="w-12 h-12">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback className="bg-secondary/20">
            <User className="w-6 h-6 text-secondary" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-bold truncate">
            {profile.display_name || profile.username}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            @{profile.username}
          </p>
        </div>
      </button>

      {/* Stats */}
      <div className="flex items-center justify-around mt-4 pt-4 border-t border-border">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <Images className="w-4 h-4 text-muted-foreground" />
            <span className="font-bold">{publicAlbumsCount}</span>
          </div>
          <p className="text-xs text-muted-foreground">Albums</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-bold">{streakCount}</span>
          </div>
          <p className="text-xs text-muted-foreground">Streak</p>
        </div>
      </div>
    </div>
  );
}
