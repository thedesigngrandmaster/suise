import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { AuthProvider } from "@/hooks/useAuth";
import { AlbumsProvider } from "@/contexts/AlbumsContext";
import { ThemeProvider } from "@/providers/ThemeProvider";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";

import { SuiClientProvider, WalletProvider as SuiWalletProvider } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { SUI_NETWORK } from "@/lib/sui";
import "@mysten/dapp-kit/dist/index.css";

const queryClient = new QueryClient();
const wallets = [new PhantomWalletAdapter()];
const SOLANA_RPC = "https://api.mainnet-beta.solana.com";

const suiNetworks = {
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
  devnet: { url: getFullnodeUrl("devnet") },
};

export function GlobalProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AlbumsProvider>
            <ConnectionProvider endpoint={SOLANA_RPC}>
              <WalletProvider wallets={wallets}>
                <WalletModalProvider>
                  <SuiClientProvider
                    networks={suiNetworks}
                    defaultNetwork={SUI_NETWORK as keyof typeof suiNetworks}
                  >
                    <SuiWalletProvider autoConnect>
                      <TooltipProvider>
                        <Toaster />
                        <Sonner />
                        <BrowserRouter>
                          {children}
                        </BrowserRouter>
                      </TooltipProvider>
                    </SuiWalletProvider>
                  </SuiClientProvider>
                </WalletModalProvider>
              </WalletProvider>
            </ConnectionProvider>
          </AlbumsProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
