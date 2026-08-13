import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRewards } from "@/hooks/useRewards";
import { toast } from "sonner";
import { AlertTriangle, ArrowRightLeft, Check, Loader2, ShieldCheck, User } from "lucide-react";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { buildOwnershipSealTx, shortAddress } from "@/lib/sui";

interface Recipient {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  wallet_address: string | null;
}

interface TransferOwnershipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  album: { id: string; title: string };
  onTransferred?: () => void;
}

export function TransferOwnershipDialog({
  open,
  onOpenChange,
  album,
  onTransferred,
}: TransferOwnershipDialogProps) {
  const { user } = useAuth();
  const { award } = useRewards(user?.id);
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Recipient[]>([]);
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [understood, setUnderstood] = useState(false);
  const [sealOnChain, setSealOnChain] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = () => {
    setStep(1);
    setUsername("");
    setSearchResults([]);
    setRecipient(null);
    setConfirmText("");
    setUnderstood(false);
    setSealOnChain(false);
    setSubmitting(false);
  };

  const close = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  // Live username search while typing (debounced)
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const handle = username.trim().replace(/^@/, "");
    if (!handle || handle.length < 1) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, wallet_address")
        .or(`username.ilike.%${handle}%,display_name.ilike.%${handle}%`)
        .neq("id", user?.id ?? "")
        .limit(8);
      setSearching(false);
      if (error) {
        console.error(error);
        setSearchResults([]);
        return;
      }
      setSearchResults((data as Recipient[]) ?? []);
    }, 280);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [username, user?.id]);

  const selectRecipient = (person: Recipient) => {
    setRecipient(person);
    setUsername(person.username ? `@${person.username}` : person.display_name || "");
    setSearchResults([]);
    setStep(2);
  };

  const findRecipient = async () => {
    const handle = username.trim().replace(/^@/, "");
    if (!handle) return;
    const exact = searchResults.find(
      (r) => r.username?.toLowerCase() === handle.toLowerCase()
    );
    if (exact) {
      selectRecipient(exact);
      return;
    }
    setSearching(true);
    const { data, error } = await supabase.rpc("get_profile_by_username", {
      p_username: handle,
    });
    setSearching(false);

    const found = Array.isArray(data) ? data[0] : null;
    if (error || !found) {
      toast.error("No one found with that username");
      return;
    }
    if (found.id === user?.id) {
      toast.error("You already own this folder");
      return;
    }
    selectRecipient(found as Recipient);
  };

  const canConfirm =
    understood && confirmText.trim().toLowerCase() === album.title.trim().toLowerCase();

  const handleTransfer = async () => {
    if (!user || !recipient || !canConfirm) return;
    setSubmitting(true);
    let txDigest: string | null = null;

    try {
      if (sealOnChain) {
        if (!account) {
          toast.error("Connect your wallet first, or turn off the on-chain seal");
          setSubmitting(false);
          return;
        }
        if (!recipient.wallet_address) {
          toast.error(`${recipient.display_name || recipient.username} hasn't linked a wallet yet`);
          setSubmitting(false);
          return;
        }
        const tx = buildOwnershipSealTx({
          recipient: recipient.wallet_address,
          albumId: album.id,
        });
        const result = await signAndExecute({ transaction: tx });
        txDigest = result.digest;
      }

      const { error: albumError } = await supabase
        .from("albums")
        .update({ owner_id: recipient.id })
        .eq("id", album.id)
        .eq("owner_id", user.id);
      if (albumError) throw albumError;

      const { error: recordError } = await supabase.from("ownership_transfers").insert({
        album_id: album.id,
        from_user_id: user.id,
        to_user_id: recipient.id,
        tx_digest: txDigest,
        status: "completed",
      });
      if (recordError) console.error("Transfer record failed", recordError);

      await award("handover", 60, `Handed over "${album.title}"`);
      toast.success(`"${album.title}" now belongs to ${recipient.display_name || recipient.username}`);
      onTransferred?.();
      close(false);
    } catch (err) {
      console.error("Ownership transfer failed", err);
      toast.error(err instanceof Error ? err.message : "Handover could not be completed");
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-secondary/12 flex items-center justify-center mb-2">
            <ArrowRightLeft className="w-6 h-6 text-secondary" />
          </div>
          <DialogTitle className="font-bricolage">Hand over this folder</DialogTitle>
          <DialogDescription>
            {step === 1
              ? `Choose who should become the new owner of "${album.title}".`
              : "Read this carefully — a handover cannot be undone by you."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="handover-username">Find the new owner</Label>
              <Input
                id="handover-username"
                placeholder="Search by username or name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && findRecipient()}
                autoComplete="off"
                aria-autocomplete="list"
                aria-controls="handover-user-results"
                aria-expanded={searchResults.length > 0}
              />
              {searching && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" /> Searching…
                </p>
              )}
              {searchResults.length > 0 && (
                <ul
                  id="handover-user-results"
                  role="listbox"
                  className="rounded-xl border border-border bg-card shadow-sm overflow-hidden max-h-56 overflow-y-auto"
                >
                  {searchResults.map((person) => (
                    <li key={person.id} role="option">
                      <button
                        type="button"
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/70 transition-colors"
                        onClick={() => selectRecipient(person)}
                      >
                        {person.avatar_url ? (
                          <img
                            src={person.avatar_url}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-secondary/15 flex items-center justify-center">
                            <User className="w-4 h-4 text-secondary" />
                          </div>
                        )}
                        <span className="min-w-0">
                          <span className="block font-medium truncate text-sm">
                            {person.display_name || person.username}
                          </span>
                          <span className="block text-xs text-muted-foreground truncate">
                            @{person.username}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {!searching && username.trim().length > 0 && searchResults.length === 0 && (
                <p className="text-xs text-muted-foreground">No matches yet. Try another name.</p>
              )}
            </div>
            <div className="rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground flex gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
              They keep everything inside — memories, co-owners and history move with
              the folder.
            </div>
            <Button
              variant="suise"
              className="w-full"
              onClick={findRecipient}
              disabled={!username.trim() || searching}
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Recipient */}
            <div className="flex items-center gap-3 rounded-2xl border border-border/60 p-3">
              {recipient?.avatar_url ? (
                <img
                  src={recipient.avatar_url}
                  alt={recipient.display_name || recipient.username || "New owner"}
                  className="w-11 h-11 rounded-full object-cover"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-secondary/15 flex items-center justify-center">
                  <User className="w-5 h-5 text-secondary" />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold truncate">
                  {recipient?.display_name || recipient?.username}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  @{recipient?.username}
                  {recipient?.wallet_address
                    ? ` · ${shortAddress(recipient.wallet_address)}`
                    : " · no wallet linked"}
                </p>
              </div>
            </div>

            {/* Safety messaging */}
            <div className="rounded-2xl bg-destructive/8 border border-destructive/25 p-4 space-y-2">
              <p className="flex items-center gap-2 font-semibold text-sm text-destructive">
                <AlertTriangle className="w-4 h-4" />
                This is permanent
              </p>
              <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                <li>You lose owner rights immediately — including deleting the folder.</li>
                <li>Only the new owner can hand it back to you.</li>
                <li>Every memory inside moves with the folder.</li>
              </ul>
            </div>

            {/* Optional on-chain seal */}
            <label className="flex items-start gap-3 rounded-2xl border border-border/60 p-3 cursor-pointer">
              <Checkbox
                checked={sealOnChain}
                onCheckedChange={(v) => setSealOnChain(v === true)}
                className="mt-0.5"
              />
              <span className="text-sm">
                <span className="font-medium">Seal this handover on Sui</span>
                <span className="block text-xs text-muted-foreground">
                  Signs a transaction from your wallet so there's a public receipt.
                  {!account && " Requires a connected wallet."}
                </span>
              </span>
            </label>

            {/* Deliberate confirmation */}
            <div className="space-y-2">
              <Label htmlFor="handover-confirm">
                Type <span className="font-semibold">{album.title}</span> to confirm
              </Label>
              <Input
                id="handover-confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={album.title}
                autoComplete="off"
              />
            </div>

            <label className="flex items-start gap-3 text-sm cursor-pointer">
              <Checkbox
                checked={understood}
                onCheckedChange={(v) => setUnderstood(v === true)}
                className="mt-0.5"
              />
              <span>I understand this hands over ownership for good.</span>
            </label>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)} disabled={submitting}>
                Back
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleTransfer}
                disabled={!canConfirm || submitting}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1.5" />
                    Hand over
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
