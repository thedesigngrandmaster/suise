import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";

interface StreakBadgeProps {
  count: number;
  className?: string;
}

export function StreakBadge({ count, className }: StreakBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary border-2 border-foreground shadow-neubrutalist-sm streak-glow",
        className
      )}
    >
      <Flame className="w-4 h-4 text-foreground" />
      <span className="font-bold text-foreground text-sm">{count}</span>
    </div>
  );
}