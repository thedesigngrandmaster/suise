import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { AuthProvider } from "@/hooks/useAuth";
import { AlbumsProvider } from "@/contexts/AlbumsContext";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";

const queryClient = new QueryClient();
const wallets = [new PhantomWalletAdapter()];
const SOLANA_RPC = "https://api.mainnet-beta.solana.com";

export function GlobalProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AlbumsProvider>
          <ConnectionProvider endpoint={SOLANA_RPC}>
            <WalletProvider wallets={wallets} autoConnect>
              <WalletModalProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    {children}
                  </BrowserRouter>
                </TooltipProvider>
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </AlbumsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
