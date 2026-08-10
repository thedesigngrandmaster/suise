import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useRewards, REWARD_RULES } from "@/hooks/useRewards";
import { Sparkles, TrendingUp, Flame, Users, ArrowRightLeft, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

const KIND_ICON: Record<string, typeof Sparkles> = {
  memory: Image,
  streak: Flame,
  shared_folder: Users,
  handover: ArrowRightLeft,
};

const NEXT_TIER = 500;

export default function Earn() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { events, loading, balance } = useRewards(user?.id);

  const progress = Math.min(100, Math.round((balance / NEXT_TIER) * 100));

  return (
    <DashboardLayout activeTab="earn" onTabChange={(tab) => navigate(`/${tab === "home" ? "" : tab}`)}>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <header>
          <h1 className="text-2xl font-bold font-bricolage">Earn</h1>
          <p className="text-muted-foreground text-sm">
            Contribute to your folders, watch your balance grow.
          </p>
        </header>

        {/* Balance card */}
        <div className="soft-card overflow-hidden">
          <div className="soft-surface p-6 sm:p-8">
            <p className="text-sm text-muted-foreground">Rewards balance</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-4xl sm:text-5xl font-bold font-bricolage tabular-nums">
                {balance.toLocaleString()}
              </span>
              <span className="text-muted-foreground mb-1.5">points</span>
            </div>
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Progress to next tier</span>
                <span>{balance} / {NEXT_TIER}</span>
              </div>
              <div
                className="h-2.5 rounded-full bg-muted overflow-hidden"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progress to next rewards tier"
              >
                <div
                  className="h-full rounded-full bg-secondary transition-[width] duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <section>
          <h2 className="text-lg font-bold mb-3">How you earn</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {REWARD_RULES.map((rule) => {
              const Icon = KIND_ICON[rule.kind] ?? Sparkles;
              return (
                <div key={rule.kind} className="soft-card p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-secondary/12 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{rule.label}</p>
                    <p className="text-xs text-muted-foreground">{rule.hint}</p>
                  </div>
                  <span className="ml-auto text-sm font-bold text-secondary whitespace-nowrap">
                    +{rule.points}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Activity */}
        <section>
          <h2 className="text-lg font-bold mb-3">Recent activity</h2>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 rounded-3xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="soft-card p-8 text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-3xl bg-primary/25 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-foreground" />
              </div>
              <p className="font-bold mb-1">No rewards yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Add your first memory today and your balance starts moving.
              </p>
              <Button variant="suise" onClick={() => navigate("/vault")}>
                Start contributing
              </Button>
            </div>
          ) : (
            <ul className="space-y-2">
              {events.map((event) => {
                const Icon = KIND_ICON[event.kind] ?? Sparkles;
                return (
                  <li key={event.id} className="soft-card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-accent/20 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">
                        {event.description || event.kind}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <span className="font-bold text-secondary text-sm">+{event.points}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}