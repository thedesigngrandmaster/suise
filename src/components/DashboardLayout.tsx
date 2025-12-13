import { useState } from "react";
import { Home, Archive, Compass, Settings, Plus, Search, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { BrandHeader } from "./BrandHeader";

interface NavItem {
  id: string;
  icon: typeof Home;
  label: string;
}

const navItems: NavItem[] = [
  { id: "home", icon: Home, label: "Home" },
  { id: "vault", icon: Archive, label: "Vault" },
  { id: "explore", icon: Compass, label: "Explore" },
  { id: "settings", icon: Settings, label: "Settings" },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onUpload?: () => void;
}

export function DashboardLayout({ children, activeTab, onTabChange, onUpload }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Desktop Sidebar - X style */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 border-r border-border sticky top-0 h-screen">
        <div className="p-4">
          <BrandHeader />
        </div>

        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <DesktopNavItem
                key={item.id}
                item={item}
                isActive={activeTab === item.id}
                onClick={() => onTabChange(item.id)}
              />
            ))}
          </ul>

          <div className="mt-6 px-2">
            <Button
              variant="suise"
              size="lg"
              className="w-full"
              onClick={onUpload}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Memory
            </Button>
          </div>
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <BrandHeader />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>

        {/* Mobile bottom nav - X style */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
          <div className="flex items-center justify-around h-16 max-w-lg mx-auto relative">
            {navItems.slice(0, 2).map((item) => (
              <MobileNavItem
                key={item.id}
                item={item}
                isActive={activeTab === item.id}
                onClick={() => onTabChange(item.id)}
              />
            ))}

            {/* FAB */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-6">
              <Button
                size="fab"
                variant="suise"
                onClick={onUpload}
                className="shadow-neubrutalist"
              >
                <Plus className="w-7 h-7" />
              </Button>
            </div>

            {/* Spacer */}
            <div className="w-16" />

            {navItems.slice(2).map((item) => (
              <MobileNavItem
                key={item.id}
                item={item}
                isActive={activeTab === item.id}
                onClick={() => onTabChange(item.id)}
              />
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

interface DesktopNavItemProps {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}

function DesktopNavItem({ item, isActive, onClick }: DesktopNavItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = item.icon;

  return (
    <li>
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
              isActive ? "stroke-[2.5px]" : "stroke-[1.5px]"
            )}
          />
        </div>
        <span className={cn(
          "text-lg transition-all duration-200",
          isActive ? "font-bold" : "font-medium"
        )}>
          {item.label}
        </span>
      </button>
    </li>
  );
}

interface MobileNavItemProps {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}

function MobileNavItem({ item, isActive, onClick }: MobileNavItemProps) {
  const Icon = item.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-0.5 p-2 rounded-xl transition-colors",
        isActive
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <div className={cn(
        "p-1.5 rounded-lg transition-colors",
        isActive && "bg-primary"
      )}>
        <Icon className={cn(
          "w-5 h-5",
          isActive && "stroke-[2.5px]"
        )} />
      </div>
      <span className="text-xs font-medium">{item.label}</span>
    </button>
  );
}