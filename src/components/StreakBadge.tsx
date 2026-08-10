import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";

interface StreakBadgeProps {
  count: number;
  className?: string;
  /** Larger presentation for headers and profile surfaces */
  size?: "sm" | "md";
}

export function StreakBadge({ count, className, size = "sm" }: StreakBadgeProps) {
  const previous = useRef(count);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (count > previous.current) {
      setCelebrating(true);
      const timer = setTimeout(() => setCelebrating(false), 1200);
      previous.current = count;
      return () => clearTimeout(timer);
    }
    previous.current = count;
  }, [count]);

  const active = count > 0;
  const label = active
    ? `${count} day contribution streak`
    : "No contribution streak yet — add a memory to start one";

  return (
    <div
      role="status"
      aria-label={label}
      title={label}
      className={cn(
        "relative inline-flex items-center gap-2 rounded-full font-semibold transition-all duration-300",
        size === "md" ? "px-4 py-2 text-base" : "px-3 py-1.5 text-sm",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground",
        celebrating && "streak-celebrate",
        className
      )}
      style={active ? { boxShadow: "var(--shadow-soft)" } : undefined}
    >
      {active && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-primary/50 streak-halo"
        />
      )}
      <Flame
        aria-hidden
        className={cn(
          "relative shrink-0",
          size === "md" ? "w-5 h-5" : "w-4 h-4",
          active && "streak-flicker"
        )}
        fill={active ? "currentColor" : "none"}
      />
      <span className="relative tabular-nums">{count}</span>
      <span className="sr-only">{label}</span>
    </div>
  );
}