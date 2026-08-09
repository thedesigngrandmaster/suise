import { SoftOrb } from "./SoftOrb";
import { Heart, Compass, Home, Archive, MessageCircle } from "lucide-react";

const chips = ["All", "New", "Top", "Trending"];

export function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[280px] sm:w-[320px]">
      <div
        className="rounded-[2.75rem] border border-border/70 bg-card p-3"
        style={{ boxShadow: "var(--shadow-float)" }}
      >
        <div className="soft-surface rounded-[2.25rem] p-4">
          {/* chips row */}
          <div className="mb-4 flex gap-2 overflow-hidden">
            {chips.map((c, i) => (
              <span
                key={c}
                className={
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium " +
                  (i === 3
                    ? "bg-secondary text-secondary-foreground"
                    : "border border-border/70 bg-card text-muted-foreground")
                }
              >
                {c}
              </span>
            ))}
          </div>

          {/* memory card */}
          <div className="soft-card overflow-hidden p-2">
            <SoftOrb className="aspect-[4/3] w-full" />
            <div className="flex items-center gap-2 px-2 py-3">
              <div className="h-8 w-8 rounded-full bg-[hsl(25_95%_62%)]" />
              <div className="flex-1">
                <p className="text-xs font-semibold leading-tight">Sunset Roll</p>
                <p className="text-[10px] text-muted-foreground">shared by @yooma</p>
              </div>
              <Heart className="h-4 w-4 text-secondary" />
            </div>
          </div>

          {/* bottom bar */}
          <div className="mt-4 flex items-center justify-between rounded-full border border-border/70 bg-card px-4 py-3 shadow-neubrutalist-sm">
            {[Home, Archive, Compass, MessageCircle].map((Icon, i) => (
              <Icon
                key={i}
                className={"h-4 w-4 " + (i === 2 ? "text-secondary" : "text-muted-foreground")}
              />
            ))}
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              Y
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}