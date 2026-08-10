import { useEffect, useState } from "react";
import {
  ConnectModal,
  useCurrentAccount,
  useDisconnectWallet,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import { Wallet, Copy, Check, ShieldCheck, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatSui, shortAddress, SUI_NETWORK } from "@/lib/sui";
import { toast } from "sonner";

export function WalletPanel() {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const { user, profile, refreshProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: balance, isLoading } = useSuiClientQuery(
    "getBalance",
    { owner: account?.address as string },
    { enabled: !!account?.address }
  );

  // Keep the linked address on the profile in sync
  useEffect(() => {
    if (!user || !account?.address) return;
    if (profile?.wallet_address === account.address) return;
    supabase
      .from("profiles")
      .update({ wallet_address: account.address })
      .eq("id", user.id)
      .then(({ error }) => {
        if (error) console.error("Could not save linked account", error);
        else refreshProfile();
      });
  }, [account?.address, user, profile?.wallet_address, refreshProfile]);

  const copy = async () => {
    if (!account?.address) return;
    await navigator.clipboard.writeText(account.address);
    setCopied(true);
    toast.success("Address copied");
    setTimeout(() => setCopied(false), 1800);
  };

  if (!account) {
    return (
      <div className="soft-card p-6 sm:p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-secondary/12 flex items-center justify-center">
          <Wallet className="w-8 h-8 text-secondary" />
        </div>
        <h2 className="text-xl font-bold font-bricolage mb-1">Link your Sui wallet</h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-5">
          Linking a wallet lets you seal folder handovers on-chain and receive
          contribution rewards. Nothing is moved without your signature.
        </p>
        <ConnectModal
          open={open}
          onOpenChange={setOpen}
          trigger={<Button variant="suise" size="lg">Connect wallet</Button>}
        />
      </div>
    );
  }

  return (
    <div className="soft-card p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-secondary/12 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6 text-secondary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Connected · {SUI_NETWORK}
            </p>
            <button
              onClick={copy}
              className="flex items-center gap-2 font-semibold hover:text-secondary transition-colors"
            >
              <span className="truncate">{shortAddress(account.address, 6)}</span>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => disconnect()}>
          <LogOut className="w-4 h-4 mr-1.5" />
          Disconnect
        </Button>
      </div>

      <div className="mt-6 rounded-3xl p-5 soft-surface">
        <p className="text-sm text-muted-foreground">Available balance</p>
        <p className="text-3xl font-bold font-bricolage mt-1">
          {isLoading ? "—" : `${formatSui(balance?.totalBalance)} SUI`}
        </p>
      </div>

      <p className="mt-5 flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="w-4 h-4 shrink-0 text-accent mt-0.5" />
        Suise never holds your keys. Every transaction shows up in your wallet for
        approval before anything happens.
      </p>
    </div>
  );
}