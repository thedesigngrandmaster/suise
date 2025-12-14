import { Home, Images, Users, User, Plus, MessageCircle } from "lucide-react";
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
    { id: "connect", icon: <Users className="w-5 h-5" />, label: "Connect" },
    { id: "chat", icon: <MessageCircle className="w-5 h-5" />, label: "Chat" },
    { id: "profile", icon: <User className="w-5 h-5" />, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-50 pb-safe">
      <div className="flex items-center h-16 px-4 max-w-lg mx-auto">
        {/* Nav Items - Evenly Spaced */}
        <div className="flex items-center justify-between flex-1">
          {navItems.map((item) => (
            <NavButton
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => onTabChange?.(item.id)}
            />
          ))}
        </div>
        
        {/* FAB Upload Button - Far Right */}
        <div className="ml-4">
          <Button
            size="icon"
            variant="suise"
            onClick={onUpload}
            className="shadow-neubrutalist h-14 w-14 rounded-full hover:scale-110 transition-transform"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </nav>
  );
}

function NavButton({ icon, label, active, onClick }: NavItem) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 min-w-[48px] transition-all duration-200",
        "active:scale-95"
      )}
      aria-label={label}
    >
      <div className={cn(
        "relative p-2 rounded-2xl transition-all duration-200",
        active 
          ? "bg-secondary text-secondary-foreground scale-110" 
          : "text-muted-foreground hover:bg-muted"
      )}>
        {icon}
        {/* Active indicator dot */}
        {active && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-secondary-foreground rounded-full" />
        )}
      </div>
      <span className={cn(
        "text-[10px] font-medium transition-all duration-200",
        active 
          ? "text-secondary font-bold" 
          : "text-muted-foreground"
      )}>
        {label}
      </span>
    </button>
  );
      }              active={activeTab === item.id}
              onClick={() => onTabChange?.(item.id)}
            />
          ))}
        </div>
        
        {/* FAB Upload Button - Far Right */}
        <div className="ml-4">
          <Button
            size="icon"
            variant="suise"
            onClick={onUpload}
            className="shadow-neubrutalist h-14 w-14 rounded-full hover:scale-110 transition-transform"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </nav>
  );
}

function NavButton({ icon, label, active, onClick }: NavItem) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 min-w-[48px] transition-all duration-200",
        "active:scale-95"
      )}
      aria-label={label}
    >
      <div className={cn(
        "relative p-2 rounded-2xl transition-all duration-200",
        active 
          ? "bg-secondary text-secondary-foreground scale-110" 
          : "text-muted-foreground hover:bg-muted"
      )}>
        {icon}
        {/* Active indicator dot */}
        {active && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-secondary-foreground rounded-full" />
        )}
      </div>
      <span className={cn(
        "text-[10px] font-medium transition-all duration-200",
        active 
          ? "text-secondary font-bold" 
          : "text-muted-foreground"
      )}>
        {label}
      </span>
    </button>
  );
  }
