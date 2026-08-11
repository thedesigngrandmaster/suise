import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { shortAddress } from "@/lib/sui";
import { CheckCircle2, Clock, XCircle, ArrowRightLeft, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransferRow {
  id: string;
  album_id: string;
  from_user_id: string;
  to_user_id: string;
  note: string | null;
  tx_digest: string | null;
  status: string;
  created_at: string;
  album?: { title: string | null } | null;
}

const STATUS: Record<
  string,
  { label: string; icon: typeof Clock; className: string }
> = {
  completed: {
    label: "Success",
    icon: CheckCircle2,
    className: "bg-accent/15 text-accent-foreground",
  },
  pending: { label: "Pending", icon: Clock, className: "bg-muted text-muted-foreground" },
  failed: {
    label: "Failed",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive",
  },
};

export function TransferHistory({ userId }: { userId?: string }) {
  const [rows, setRows] = useState<TransferRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let active = true;

    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("ownership_transfers")
        .select("*, album:albums(title)")
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!active) return;
      if (error) console.error("Failed to load handovers", error);
      setRows((data as TransferRow[]) ?? []);
      setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-2" aria-busy="true">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-16 rounded-3xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No handovers yet. When you pass a folder on, the receipt shows up here.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {rows.map((row) => {
        const status = STATUS[row.status] || STATUS.pending;
        const StatusIcon = status.icon;
        const outgoing = row.from_user_id === userId;
        return (
          <li key={row.id} className="soft-card p-4 flex items-center gap-3">
            <span
              aria-hidden
              className="w-10 h-10 rounded-2xl bg-secondary/12 flex items-center justify-center shrink-0"
            >
              <ArrowRightLeft className="w-5 h-5 text-secondary" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">
                {outgoing ? "Handed over" : "Received"} ·{" "}
                {row.album?.title || "Folder"}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(row.created_at).toLocaleString()}
                {row.tx_digest ? ` · receipt ${shortAddress(row.tx_digest, 4)}` : ""}
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
                status.className
              )}
            >
              <StatusIcon className="w-3.5 h-3.5" aria-hidden />
              {status.label}
            </span>
            {row.tx_digest && (
              <a
                href={`https://suiscan.xyz/tx/${row.tx_digest}`}
                target="_blank"
                rel="noreferrer"
                aria-label="View transaction receipt"
                className="shrink-0 text-muted-foreground hover:text-secondary"
              >
                <ExternalLink className="w-4 h-4" aria-hidden />
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}
