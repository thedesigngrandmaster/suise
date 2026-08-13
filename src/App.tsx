import { Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Vault from "./pages/Vault";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Chat from "./pages/Chat";
import Connect from "./pages/Connect";
import AlbumDetail from "./pages/AlbumDetail";
import DemoAlbumDetail from "./pages/DemoAlbumDetail";
import Auth from "./pages/Auth";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import TestAlbums from "@/pages/TestAlbums";
import WalletPage from "./pages/Wallet";
import Earn from "./pages/Earn";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import { ProtectedRoute } from "./components/ProtectedRoute";

const App = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<Index />} />
    <Route path="/home" element={<Index />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/privacy" element={<Privacy />} />
    <Route path="/terms" element={<Terms />} />
    <Route path="/demo-album/:albumId" element={<DemoAlbumDetail />} />

    {/* Private — require login */}
    <Route
      path="/vault"
      element={
        <ProtectedRoute>
          <Vault />
        </ProtectedRoute>
      }
    />
    <Route
      path="/explore"
      element={
        <ProtectedRoute>
          <Explore />
        </ProtectedRoute>
      }
    />
    <Route
      path="/connect"
      element={
        <ProtectedRoute>
          <Connect />
        </ProtectedRoute>
      }
    />
    <Route
      path="/wallet"
      element={
        <ProtectedRoute>
          <WalletPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/earn"
      element={
        <ProtectedRoute>
          <Earn />
        </ProtectedRoute>
      }
    />
    <Route
      path="/settings"
      element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      }
    />
    <Route
      path="/chat"
      element={
        <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
      }
    />
    <Route
      path="/chat/:partnerId"
      element={
        <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
      }
    />
    <Route
      path="/album/:albumId"
      element={
        <ProtectedRoute>
          <AlbumDetail />
        </ProtectedRoute>
      }
    />
    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      }
    />
    <Route
      path="/notifications"
      element={
        <ProtectedRoute>
          <Notifications />
        </ProtectedRoute>
      }
    />
    <Route
      path="/test-albums"
      element={
        <ProtectedRoute>
          <TestAlbums />
        </ProtectedRoute>
      }
    />

    {/* Public profile by username — keep after static routes */}
    <Route path="/:username" element={<Profile />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;
