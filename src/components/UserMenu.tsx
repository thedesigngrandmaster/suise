import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Settings, ChevronDown, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/hooks/useNotifications";

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
            {profile?.username || "user"}
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
                navigate(profile?.username ? `/${profile.username}` : "/profile");
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

export function UserAvatar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications(user?.id);

  if (!user) return null;

  const displayName = profile?.display_name || user.email?.split("@")[0] || "User";
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative">
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
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-3 py-2">
          <p className="font-medium truncate">{displayName}</p>
          <p className="text-sm text-muted-foreground truncate">
            {profile?.username || "user"}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate(profile?.username ? `/${profile.username}` : "/profile")}>
          <User className="w-4 h-4 mr-2" />
          View Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/notifications")}>
          <Bell className="w-4 h-4 mr-2" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-auto bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/settings")}>
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
