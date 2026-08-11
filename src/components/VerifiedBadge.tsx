import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  className?: string;
  size?: "sm" | "md";
}

/** Blue check shown next to verified account names. */
export function VerifiedBadge({ className, size = "sm" }: VerifiedBadgeProps) {
  return (
    <BadgeCheck
      role="img"
      aria-label="Verified account"
      className={cn(
        "shrink-0 text-accent",
        size === "md" ? "w-5 h-5" : "w-4 h-4",
        className
      )}
      fill="currentColor"
      stroke="hsl(var(--background))"
    />
  );
}
