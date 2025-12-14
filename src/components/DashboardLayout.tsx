import { useState } from "react";
import { Home, Archive, Compass, Settings, Plus, Search, Bell, MessageCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { BrandHeader } from "./BrandHeader";
import { UserMenu, UserAvatar } from "./UserMenu";
import { UserDetailsPanel } from "./UserDetailsPanel";
import { SearchModal } from "./SearchModal";
import { NotificationsPanel } from "./NotificationsPanel";
import { UploadModal } from "./UploadModal";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";

interface NavItem {
  id: string;
  icon: typeof Home;
  label: string;
}

const navItems: NavItem[] = [
  { id: "home", icon: Home, label: "Home" },
  { id: "vault", icon: Archive, label: "Vault" },
  { id: "explore", icon: Compass, label: "Explore" },
  { id: "connect", icon: Users, label: "Connect" },
  { id: "chat", icon: MessageCircle, label: "Chat" },
];

const mobileNavItems: NavItem[] = [
  { id: "home", icon: Home, label: "Home" },
  { id: "vault", icon: Archive, label: "Vault" },
  { id: "explore", icon: Compass, label: "Explore" },
  { id: "connect", icon: Users, label: "Connect" },
  { id: "chat", icon: MessageCircle, label: "Chat" },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onUpload?: () => void;
}

export function DashboardLayout({ children, activeTab, onTabChange }: DashboardLayoutProps) {
  const { user, profile, signOut } = useAuth();
  const { unreadCount } = useNotifications(user?.id);
  const navigate = useNavigate();
  
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    if (tab === "notifications") {
      setNotificationsOpen(true);
      return;
    }
    onTabChange(tab);
    navigate(`/${tab === "home" ? "" : tab}`);
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col border-r border-border fixed top-0 left-0 h-screen transition-all duration-300 bg-background z-40",
        collapsed ? "w-20" : "w-64 xl:w-72"
      )}>
        <div className="p-4">
          <button onClick={() => setCollapsed(!collapsed)} className="w-full">
            <BrandHeader collapsed={collapsed} />
          </button>
        </div>
        
        {/* User Details Panel */}
        {user && profile && (
          <div className={cn("px-3", collapsed ? "py-2" : "pb-4")}>
            <UserDetailsPanel collapsed={collapsed} />
          </div>
        )}

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <DesktopNavItem
                key={item.id}
                item={item}
                isActive={activeTab === item.id}
                collapsed={collapsed}
                onClick={() => handleTabChange(item.id)}
              />
            ))}
          </ul>

          {/* Notifications item */}
          <ul className="mt-4 space-y-1">
            <DesktopNavItem
              item={{ id: "notifications", icon: Bell, label: "Notifications" }}
              isActive={activeTab === "notifications"}
              collapsed={collapsed}
              onClick={() => handleTabChange("notifications")}
              badge={unreadCount}
            />
            <DesktopNavItem
              item={{ id: "settings", icon: Settings, label: "Settings" }}
              isActive={activeTab === "settings"}
              collapsed={collapsed}
              onClick={() => handleTabChange("settings")}
            />
          </ul>

          <div className="mt-6 px-2">
            <Button
              variant="suise"
              size={collapsed ? "icon" : "lg"}
              className={cn("w-full", collapsed && "h-12")}
              onClick={() => setUploadOpen(true)}
            >
              <Plus className="w-5 h-5" />
              {!collapsed && <span className="ml-2">Add Memory</span>}
            </Button>
          </div>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-border">
          {collapsed ? (
            <UserAvatar />
          ) : (
            <UserMenu />
          )}
        </div>
      </aside>
      
      {/* Spacer for fixed sidebar */}
      <div className={cn("hidden lg:block shrink-0 transition-all duration-300", collapsed ? "w-20" : "w-64 xl:w-72")} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <BrandHeader />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
                <Search className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setNotificationsOpen(true)}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -bottom-1 -right-1 min-w-5 h-5 px-1 bg-secondary text-secondary-foreground text-xs rounded-full flex items-center justify-center font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
              <UserAvatar />
            </div>
          </div>
        </header>
        
        {/* Spacer for fixed mobile header */}
        <div className="lg:hidden h-14" />

        {/* Page content */}
        <main className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 h-16 pb-safe">
          <div className="flex items-center justify-around h-full w-full relative">
            {mobileNavItems.slice(0, 2).map((item) => (
              <MobileNavItem
                key={item.id}
                item={item}
                isActive={activeTab === item.id}
                onClick={() => handleTabChange(item.id)}
              />
            ))}

            {/* FAB */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-6">
              <Button
                size="fab"
                variant="suise"
                onClick={() => setUploadOpen(true)}
                className="shadow-neubrutalist"
              >
                <Plus className="w-7 h-7" />
              </Button>
            </div>

            <div className="w-14" />

            {mobileNavItems.slice(2, 5).map((item) => (
              <MobileNavItem
                key={item.id}
                item={item}
                isActive={activeTab === item.id}
                onClick={() => handleTabChange(item.id)}
              />
            ))}
          </div>
        </nav>
      </div>

      {/* Modals */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <NotificationsPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      <UploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  );
}

interface DesktopNavItemProps {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
  badge?: number;
}

function DesktopNavItem({ item, isActive, collapsed, onClick, badge }: DesktopNavItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = item.icon;

  return (
    <li className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "w-full flex items-center gap-4 px-4 py-3 rounded-full transition-all duration-200 group",
          isActive
            ? "bg-muted font-bold"
            : "hover:bg-muted/50"
        )}
      >
        <div className={cn(
          "relative transition-transform duration-200",
          (isHovered || isActive) && "scale-110"
        )}>
          <Icon
            className={cn(
              "w-6 h-6 transition-all duration-200",
              isActive ? "stroke-[2.5px] text-secondary" : "stroke-[1.5px]"
            )}
          />
          {badge && badge > 0 && (
            <span className="absolute -bottom-1 -right-1 min-w-5 h-5 px-1 bg-secondary text-secondary-foreground text-xs rounded-full flex items-center justify-center font-bold">
              {badge > 9 ? "9+" : badge}
            </span>
          )}
        </div>
        {!collapsed && (
          <span className={cn(
            "text-lg transition-all duration-200",
            isActive ? "font-bold text-secondary" : "font-medium"
          )}>
            {item.label}
          </span>
        )}
      </button>

      {/* Tooltip for collapsed state */}
      {collapsed && isHovered && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-foreground text-background rounded-lg text-sm font-medium whitespace-nowrap z-50">
          {item.label}
        </div>
      )}
    </li>
  );
}

interface MobileNavItemProps {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
  badge?: number;
}

function MobileNavItem({ item, isActive, onClick, badge }: MobileNavItemProps) {
  const Icon = item.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-0.5 p-2 rounded-xl transition-colors",
        isActive
          ? "text-secondary"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <div className={cn(
        "p-1.5 rounded-lg transition-colors relative",
        isActive && "bg-secondary"
      )}>
        <Icon className={cn(
          "w-5 h-5",
          isActive && "stroke-[2.5px] text-secondary-foreground"
        )} />
        {badge && badge > 0 && (
          <span className="absolute -bottom-1 -right-1 min-w-5 h-5 px-1 bg-secondary text-secondary-foreground text-xs rounded-full flex items-center justify-center font-bold">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </div>
      <span className={cn(
        "text-xs",
        isActive ? "font-bold text-secondary" : "font-medium"
      )}>{item.label}</span>
    </button>
  );
}
