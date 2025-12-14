import { Home, Plus, Archive } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface BottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onUpload?: () => void;
}

export function BottomNav({ activeTab = "home", onTabChange, onUpload }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      {/* Glassmorphism container */}
      <div className="mx-4 mb-4 bg-background/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl">
        <div className="flex items-center justify-around h-16 px-6">
          {/* Home */}
          <button
            onClick={() => onTabChange?.("home")}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-200 active:scale-95",
              "min-w-[60px]"
            )}
          >
            <div className={cn(
              "p-3 rounded-2xl transition-all duration-200",
              activeTab === "home"
                ? "bg-secondary text-secondary-foreground scale-110"
                : "text-muted-foreground hover:bg-muted"
            )}>
              <Home className="w-6 h-6" />
            </div>
            <span className={cn(
              "text-xs font-medium",
              activeTab === "home" ? "text-secondary font-bold" : "text-muted-foreground"
            )}>
              Home
            </span>
          </button>

          {/* FAB Upload Button */}
          <Button
            size="icon"
            variant="suise"
            onClick={onUpload}
            className="shadow-neubrutalist h-16 w-16 rounded-full hover:scale-110 transition-transform"
          >
            <Plus className="w-7 h-7" />
          </Button>

          {/* Vault */}
          <button
            onClick={() => onTabChange?.("vault")}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-200 active:scale-95",
              "min-w-[60px]"
            )}
          >
            <div className={cn(
              "p-3 rounded-2xl transition-all duration-200",
              activeTab === "vault"
                ? "bg-secondary text-secondary-foreground scale-110"
                : "text-muted-foreground hover:bg-muted"
            )}>
              <Archive className="w-6 h-6" />
            </div>
            <span className={cn(
              "text-xs font-medium",
              activeTab === "vault" ? "text-secondary font-bold" : "text-muted-foreground"
            )}>
              Vault
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
