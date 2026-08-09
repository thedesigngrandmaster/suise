import { cn } from "@/lib/utils";

/**
 * Soft abstract organic visual — the hero "shape" of the Suise design language.
 * Purely decorative.
 */
export function SoftOrb({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("relative overflow-hidden rounded-[2rem]", className)}
      style={{ background: "var(--gradient-soft)" }}
    >
      <div
        className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[2px] animate-float"
        style={{ background: "var(--gradient-orb)" }}
      />
      <div className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-card shadow-neubrutalist-sm" />
      <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-accent/30 blur-2xl" />
      <div className="absolute -bottom-10 -left-6 h-32 w-32 rounded-full bg-secondary/25 blur-2xl" />
    </div>
  );
}