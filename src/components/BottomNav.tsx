import { useState } from "react";
import { Home, Plus, Archive, Compass, Users, MessageCircle, Bell, Settings, User, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useMessages } from "@/hooks/useMessages";
import { useNavigate } from "react-router-dom";

interface BottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onUpload?: () => void;
}

export function BottomNav({ activeTab = "home", onTabChange, onUpload }: BottomNavProps) {
  const { user, profile, signOut } = useAuth();
  const { unreadCount } = useNotifications(user?.id);
  const { totalUnreadCount: unreadMessageCount } = useMessages(user?.id);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigation = (tab: string) => {
    setMenuOpen(false);
    if (tab === "profile") {
      navigate(profile?.username ? `/${profile.username}` : "/profile");
    } else {
      onTabChange?.(tab);
      navigate(`/${tab === "home" ? "" : tab}`);
    }
  };

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const displayName = profile?.display_name || user?.email?.split("@")[0] || "User";

  return (
    <>
      {/* Full screen menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-lg animate-in fade-in-0 duration-200">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-secondary" />
                  </div>
                )}
                <div>
                  <p className="font-bold text-lg">{displayName}</p>
                  <p className="text-sm text-muted-foreground">@{profile?.username || "user"}</p>
                </div>
              </div>
              <button onClick={() => setMenuOpen(false)} className="p-2 rounded-full hover:bg-muted">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <MobileNavLink icon={Home} label="Home" onClick={() => handleNavigation("home")} active={activeTab === "home"} />
              <MobileNavLink icon={Archive} label="Vault" onClick={() => handleNavigation("vault")} active={activeTab === "vault"} />
              <MobileNavLink icon={Compass} label="Explore" onClick={() => handleNavigation("explore")} active={activeTab === "explore"} />
              <MobileNavLink icon={Users} label="Connect" onClick={() => handleNavigation("connect")} active={activeTab === "connect"} />
              <MobileNavLink icon={MessageCircle} label="Chat" onClick={() => handleNavigation("chat")} active={activeTab === "chat"} badge={unreadMessageCount} />
              <MobileNavLink icon={Bell} label="Notifications" onClick={() => handleNavigation("notifications")} active={activeTab === "notifications"} badge={unreadCount} />
              
              <div className="h-px bg-border my-4" />
              
              <MobileNavLink icon={User} label="View Profile" onClick={() => handleNavigation("profile")} />
              <MobileNavLink icon={Settings} label="Settings" onClick={() => handleNavigation("settings")} active={activeTab === "settings"} />
              
              <div className="h-px bg-border my-4" />
              
              <button
                onClick={() => { signOut(); setMenuOpen(false); }}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-6 h-6" />
                <span className="text-lg font-medium">Sign Out</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 pb-safe">
        <div className="mx-4 mb-4 bg-background/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl">
          <div className="flex items-center justify-around h-16 px-4">
            {/* Home */}
            <NavButton
              icon={Home}
              label="Home"
              active={activeTab === "home"}
              onClick={() => handleNavigation("home")}
            />

            {/* Explore */}
            <NavButton
              icon={Compass}
              label="Explore"
              active={activeTab === "explore"}
              onClick={() => handleNavigation("explore")}
            />

            {/* FAB Upload Button */}
            <Button
              size="icon"
              variant="suise"
              onClick={onUpload}
              className="shadow-neubrutalist h-14 w-14 rounded-full hover:scale-110 transition-transform"
            >
              <Plus className="w-6 h-6" />
            </Button>

            {/* Vault */}
            <NavButton
              icon={Archive}
              label="Vault"
              active={activeTab === "vault"}
              onClick={() => handleNavigation("vault")}
            />

            {/* Profile Menu Trigger */}
            <button
              onClick={() => setMenuOpen(true)}
              className="flex flex-col items-center gap-1 min-w-[50px] relative"
            >
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className={cn(
                      "w-8 h-8 rounded-full object-cover transition-all",
                      menuOpen && "ring-2 ring-secondary"
                    )}
                  />
                ) : (
                  <div className={cn(
                    "w-8 h-8 rounded-full bg-muted flex items-center justify-center",
                    menuOpen && "ring-2 ring-secondary"
                  )}>
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                {(unreadCount > 0 || unreadMessageCount > 0) && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full border-2 border-background" />
                )}
              </div>
              <span className="text-xs text-muted-foreground">Menu</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

interface NavButtonProps {
  icon: typeof Home;
  label: string;
  active?: boolean;
  onClick: () => void;
  badge?: number;
}

function NavButton({ icon: Icon, label, active, onClick, badge }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 min-w-[50px] transition-all duration-200 active:scale-95"
    >
      <div className={cn(
        "p-2 rounded-xl transition-all duration-200 relative",
        active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground"
      )}>
        <Icon className="w-5 h-5" />
        {badge && badge > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </div>
      <span className={cn(
        "text-xs",
        active ? "text-secondary font-semibold" : "text-muted-foreground"
      )}>
        {label}
      </span>
    </button>
  );
}

interface MobileNavLinkProps {
  icon: typeof Home;
  label: string;
  onClick: () => void;
  active?: boolean;
  badge?: number;
}

function MobileNavLink({ icon: Icon, label, onClick, active, badge }: MobileNavLinkProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200",
        active ? "bg-secondary/20 text-secondary font-bold" : "hover:bg-muted"
      )}
    >
      <div className="relative">
        <Icon className={cn("w-6 h-6", active && "text-secondary")} />
        {badge && badge > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-secondary text-secondary-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </div>
      <span className="text-lg">{label}</span>
      {badge && badge > 0 && (
        <span className="ml-auto bg-secondary text-secondary-foreground text-sm px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}
