import { useEffect, useMemo, useState } from "react";
import {
  ConnectModal,
  useCurrentAccount,
  useDisconnectWallet,
  useSuiClientContext,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import {
  Wallet,
  Copy,
  Check,
  ShieldCheck,
  LogOut,
  RefreshCw,
  AlertTriangle,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatSui, shortAddress } from "@/lib/sui";
import { toast } from "sonner";

const NETWORKS = ["mainnet", "testnet", "devnet"] as const;
type Network = (typeof NETWORKS)[number];

export function WalletPanel() {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const { network, selectNetwork } = useSuiClientContext();
  const { user, profile, refreshProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linking, setLinking] = useState(false);

  /** The chain the connected wallet is actually on, e.g. "sui:mainnet". */
  const walletNetwork = useMemo<Network | null>(() => {
    const chain = account?.chains?.find((c) => c.startsWith("sui:"));
    const name = chain?.split(":")[1];
    return (NETWORKS as readonly string[]).includes(name || "")
      ? (name as Network)
      : null;
  }, [account?.chains]);

  // Follow the wallet onto whichever network it is using, so the balance we
  // read is the balance the user sees in their wallet.
  useEffect(() => {
    if (walletNetwork && walletNetwork !== network) {
      selectNetwork(walletNetwork);
    }
  }, [walletNetwork, network, selectNetwork]);

  const {
    data: balance,
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
  } = useSuiClientQuery(
    "getBalance",
    { owner: account?.address as string },
    { enabled: !!account?.address, retry: 2 }
  );

  const linkedElsewhere =
    !!profile?.wallet_address &&
    !!account?.address &&
    profile.wallet_address !== account.address;

  const linkAddress = async () => {
    if (!user || !account?.address) return;
    setLinking(true);
    const { error: linkError } = await supabase
      .from("profiles")
      .update({ wallet_address: account.address })
      .eq("id", user.id);
    setLinking(false);
    if (linkError) {
      toast.error("Could not link this wallet", {
        description: linkError.message,
      });
      return;
    }
    await refreshProfile();
    toast.success("Wallet linked to this account");
  };

  // Auto-link only when the signed-in account has no wallet saved yet.
  useEffect(() => {
    if (!user || !account?.address) return;
    if (profile?.wallet_address) return;
    linkAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.address, user?.id, profile?.wallet_address]);

  const copy = async () => {
    if (!account?.address) return;
    try {
      await navigator.clipboard.writeText(account.address);
      setCopied(true);
      toast.success("Address copied");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy the address");
    }
  };

  if (!account) {
    return (
      <div className="soft-card p-6 sm:p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-secondary/12 flex items-center justify-center">
          <Wallet className="w-8 h-8 text-secondary" aria-hidden />
        </div>
        <h2 className="text-xl font-bold font-bricolage mb-1">
          Link your Sui wallet
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-5">
          Linking a wallet lets you seal folder handovers on-chain and receive
          contribution rewards. Nothing moves without your signature.
        </p>
        <ConnectModal
          open={open}
          onOpenChange={setOpen}
          trigger={
            <Button variant="suise" size="lg">
              Connect wallet
            </Button>
          }
        />
        {profile?.wallet_address && (
          <p className="mt-4 text-xs text-muted-foreground">
            Saved on this account: {shortAddress(profile.wallet_address, 6)}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="soft-card p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-secondary/12 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6 text-secondary" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Connected · {walletNetwork || network}
            </p>
            <button
              onClick={copy}
              aria-label="Copy wallet address"
              className="flex items-center gap-2 font-semibold hover:text-secondary transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="truncate">{shortAddress(account.address, 6)}</span>
              {copied ? (
                <Check className="w-4 h-4" aria-hidden />
              ) : (
                <Copy className="w-4 h-4" aria-hidden />
              )}
            </button>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => disconnect()}>
          <LogOut className="w-4 h-4 mr-1.5" aria-hidden />
          Disconnect
        </Button>
      </div>

      {linkedElsewhere && (
        <div className="mt-5 rounded-2xl bg-muted/70 p-4 flex flex-wrap items-center gap-3">
          <Link2 className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden />
          <p className="text-sm text-muted-foreground flex-1 min-w-[12rem]">
            This account currently has{" "}
            <span className="font-medium text-foreground">
              {shortAddress(profile?.wallet_address, 4)}
            </span>{" "}
            saved. Wallets are linked per Suise account.
          </p>
          <Button size="sm" onClick={linkAddress} disabled={linking}>
            {linking ? "Linking…" : "Link this wallet"}
          </Button>
        </div>
      )}

      <div className="mt-6 rounded-3xl p-5 soft-surface">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">
              Available balance · {walletNetwork || network}
            </p>
            {isError ? (
              <p className="mt-1 flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden />
                Couldn't reach the {walletNetwork || network} network.
              </p>
            ) : (
              <p className="text-3xl font-bold font-bricolage mt-1" aria-live="polite">
                {isPending ? "—" : `${formatSui(balance?.totalBalance)} SUI`}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Refresh balance"
            onClick={() => {
              refetch().then((r) => {
                if (r.error) toast.error("Balance refresh failed");
              });
            }}
            disabled={isRefetching}
          >
            <RefreshCw
              className={isRefetching ? "w-4 h-4 animate-spin" : "w-4 h-4"}
              aria-hidden
            />
          </Button>
        </div>
        {isError && (
          <p className="mt-2 text-xs text-muted-foreground break-words">
            {(error as Error)?.message}
          </p>
        )}
      </div>

      <p className="mt-5 flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="w-4 h-4 shrink-0 text-accent mt-0.5" aria-hidden />
        Suise never holds your keys. Every transaction shows up in your wallet for
        approval before anything happens.
      </p>
    </div>
  );
}
