import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Settings, ChevronDown } from "lucide-react";

export function UserMenu() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const displayName = profile?.display_name || user.email?.split("@")[0] || "User";
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-full hover:bg-muted transition-colors w-full"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
            <User className="w-5 h-5 text-secondary" />
          </div>
        )}
        <div className="hidden lg:block text-left flex-1 min-w-0">
          <p className="font-medium truncate">{displayName}</p>
          <p className="text-sm text-muted-foreground truncate">
            @{profile?.username || "user"}
          </p>
        </div>
        <ChevronDown className="w-4 h-4 text-muted-foreground hidden lg:block" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full left-0 mb-2 w-full min-w-[200px] bg-card rounded-xl shadow-lg border border-border z-50 overflow-hidden">
            <button
              onClick={() => {
                navigate(profile?.username ? `/@${profile.username}` : "/profile");
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors"
            >
              <User className="w-4 h-4" />
              <span>View Profile</span>
            </button>
            <button
              onClick={() => {
                navigate("/settings");
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <div className="border-t border-border" />
            <button
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-destructive"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function UserAvatar({ onClick }: { onClick?: () => void }) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(profile?.username ? `/@${profile.username}` : "/profile");
    }
  };

  return (
    <button onClick={handleClick} className="relative">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
          <User className="w-4 h-4 text-secondary" />
        </div>
      )}
    </button>
  );
}
