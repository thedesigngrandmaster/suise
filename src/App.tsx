import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Vault from "./pages/Vault";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Chat from "./pages/Chat";
import Connect from "./pages/Connect";
import AlbumDetail from "./pages/AlbumDetail";
import DemoAlbumDetail from "./pages/DemoAlbumDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<Index />} />
            <Route path="/vault" element={<Vault />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/connect" element={<Connect />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/:partnerId" element={<Chat />} />
            <Route path="/album/:albumId" element={<AlbumDetail />} />
            <Route path="/demo-album/:albumId" element={<DemoAlbumDetail />} />
            <Route path="/@:username" element={<Profile />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
