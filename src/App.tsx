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

const App = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/home" element={<Index />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/vault" element={<Vault />} />
    <Route path="/explore" element={<Explore />} />
    <Route path="/connect" element={<Connect />} />
    <Route path="/settings" element={<Settings />} />
    <Route path="/chat" element={<Chat />} />
    <Route path="/chat/:partnerId" element={<Chat />} />
    <Route path="/album/:albumId" element={<AlbumDetail />} />
    <Route path="/demo-album/:albumId" element={<DemoAlbumDetail />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/notifications" element={<Notifications />} />
    <Route path="/:username" element={<Profile />} />
    <Route path="*" element={<NotFound />} />
    <Route path="/test-albums" element={<TestAlbums />} />
  </Routes>
);

export default App;
