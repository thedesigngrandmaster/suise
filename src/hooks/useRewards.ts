import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RewardEvent {
  id: string;
  kind: string;
  points: number;
  description: string | null;
  created_at: string;
}

export const REWARD_RULES = [
  { kind: "memory", label: "Add a memory", points: 10, hint: "Every photo you keep safe" },
  { kind: "streak", label: "Keep your streak", points: 25, hint: "Daily contribution bonus" },
  { kind: "shared_folder", label: "Invite a co-owner", points: 40, hint: "Grow a shared folder" },
  { kind: "handover", label: "Complete a handover", points: 60, hint: "Pass a folder on safely" },
];

/**
 * Records a reward for a user from anywhere in the app (hooks, dialogs, flows).
 * `oncePerDay` prevents duplicate daily bonuses such as the streak reward.
 */
export async function awardPoints(
  userId: string | undefined,
  kind: string,
  points: number,
  description?: string,
  options?: { oncePerDay?: boolean }
) {
  if (!userId) return;

  if (options?.oncePerDay) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const { data: existing } = await supabase
      .from("reward_events")
      .select("id")
      .eq("user_id", userId)
      .eq("kind", kind)
      .gte("created_at", startOfDay.toISOString())
      .limit(1);
    if (existing && existing.length > 0) return;
  }

  const { error } = await supabase
    .from("reward_events")
    .insert({ user_id: userId, kind, points, description: description ?? null });

  if (error) console.error("Failed to award points", error);
}

export function useRewards(userId?: string) {
  const [events, setEvents] = useState<RewardEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    if (!userId) {
      setEvents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("reward_events")
      .select("id, kind, points, description, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) console.error("Failed to load rewards", error);
    setEvents((data as RewardEvent[]) ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const award = useCallback(
    async (kind: string, points: number, description?: string) => {
      await awardPoints(userId, kind, points, description);
      fetchEvents();
    },
    [userId, fetchEvents]
  );

  const balance = events.reduce((sum, e) => sum + (e.points || 0), 0);

  return { events, loading, balance, award, refresh: fetchEvents };
}