import { Home, Images, Users, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

interface BottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onUpload?: () => void;
}

export function BottomNav({ activeTab = "home", onTabChange, onUpload }: BottomNavProps) {
  const navItems: (NavItem & { id: string })[] = [
    { id: "home", icon: <Home className="w-5 h-5" />, label: "Home" },
    { id: "albums", icon: <Images className="w-5 h-5" />, label: "Albums" },
    { id: "social", icon: <Users className="w-5 h-5" />, label: "Friends" },
    { id: "profile", icon: <User className="w-5 h-5" />, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t-2 border-foreground px-4 pb-safe z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto relative">
        {navItems.slice(0, 2).map((item) => (
          <NavButton
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeTab === item.id}
            onClick={() => onTabChange?.(item.id)}
          />
        ))}
        
        {/* FAB Upload Button */}
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
        
        {/* Spacer for FAB */}
        <div className="w-16" />
        
        {navItems.slice(2).map((item) => (
          <NavButton
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeTab === item.id}
            onClick={() => onTabChange?.(item.id)}
          />
        ))}
      </div>
    </nav>
  );
}

function NavButton({ icon, label, active, onClick }: NavItem) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-0.5 p-2 rounded-xl transition-colors",
        active 
          ? "text-foreground" 
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <div className={cn(
        "p-1.5 rounded-lg transition-colors",
        active && "bg-primary"
      )}>
        {icon}
      </div>
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
}