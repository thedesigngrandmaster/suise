import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { WalletPanel } from "@/components/wallet/WalletPanel";
import { useAuth } from "@/hooks/useAuth";
import { useRewards } from "@/hooks/useRewards";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WalletPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance } = useRewards(user?.id);

  return (
    <DashboardLayout activeTab="wallet" onTabChange={(tab) => navigate(`/${tab === "home" ? "" : tab}`)}>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <header>
          <h1 className="text-2xl font-bold font-bricolage">Wallet</h1>
          <p className="text-muted-foreground text-sm">
            Your linked account, balance and rewards in one place.
          </p>
        </header>

        <WalletPanel />

        <button
          onClick={() => navigate("/earn")}
          className="soft-card soft-lift w-full p-5 flex items-center gap-4 text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/25 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold">Rewards balance</p>
            <p className="text-sm text-muted-foreground">
              {balance.toLocaleString()} points earned from your contributions
            </p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="soft-card p-5">
          <p className="font-bold mb-1">Why link an account?</p>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
            <li>Seal folder handovers with a signed on-chain receipt.</li>
            <li>Prove who owns a shared folder, without trusting a middleman.</li>
            <li>Collect contribution rewards straight to your own account.</li>
          </ul>
          <Button variant="outline" className="mt-4 w-full sm:w-auto" onClick={() => navigate("/vault")}>
            Go to your Vault
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}