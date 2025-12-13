import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useAlbums } from "@/hooks/useAlbums";
import { useConnections } from "@/hooks/useConnections";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlbumCard } from "@/components/AlbumCard";
import { StreakBadge } from "@/components/StreakBadge";
import { User, Edit, MessageCircle, UserPlus, Check, Copy, Wallet } from "lucide-react";
import { toast } from "sonner";

interface ProfileData {
  id: string;
  username: string | null;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  wallet_address: string | null;
  streak_count: number;
  is_public: boolean;
  show_email: boolean;
  show_wallet: boolean;
}

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const { user, profile: currentUserProfile, refreshProfile } = useAuth();
  const { updateProfile, getProfileByUsername } = useProfile();
  const { sendRequest, connections } = useConnections(user?.id);
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    display_name: "",
    username: "",
    bio: "",
  });

  const isOwnProfile = user && profileData && user.id === profileData.id;
  const cleanUsername = username?.replace("@", "");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      if (cleanUsername) {
        const data = await getProfileByUsername(cleanUsername);
        setProfileData(data);
      } else if (user && currentUserProfile) {
        // Redirect to proper profile URL if we have username
        if (currentUserProfile.username) {
          navigate(`/@${currentUserProfile.username}`, { replace: true });
          return;
        }
        setProfileData(currentUserProfile as ProfileData);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [cleanUsername, user, currentUserProfile, navigate]);

  const { albums } = useAlbums(profileData?.id);

  const handleSaveProfile = async () => {
    if (!user) return;
    await updateProfile(user.id, editData);
    await refreshProfile();
    setIsEditing(false);
  };

  const handleConnect = async () => {
    if (!profileData) return;
    await sendRequest(profileData.id);
  };

  const copyWalletAddress = () => {
    if (profileData?.wallet_address) {
      navigator.clipboard.writeText(profileData.wallet_address);
      toast.success("Wallet address copied!");
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeTab="home" onTabChange={(tab) => navigate(`/${tab === "home" ? "" : tab}`)}>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="w-24 h-24 bg-muted rounded-full mb-4" />
            <div className="h-8 bg-muted rounded w-48 mb-2" />
            <div className="h-4 bg-muted rounded w-32" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profileData) {
    return (
      <DashboardLayout activeTab="home" onTabChange={(tab) => navigate(`/${tab === "home" ? "" : tab}`)}>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold mb-2">User not found</h2>
          <p className="text-muted-foreground">The profile you're looking for doesn't exist.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="home" onTabChange={(tab) => navigate(`/${tab === "home" ? "" : tab}`)}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
          {profileData.avatar_url ? (
            <img
              src={profileData.avatar_url}
              alt={profileData.display_name || ""}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-secondary/20 flex items-center justify-center">
              <User className="w-12 h-12 text-secondary" />
            </div>
          )}

          <div className="flex-1 text-center sm:text-left">
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <Label>Display Name</Label>
                  <Input
                    value={editData.display_name}
                    onChange={(e) => setEditData({ ...editData, display_name: e.target.value })}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <Label>Username</Label>
                  <Input
                    value={editData.username}
                    onChange={(e) => setEditData({ ...editData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
                    placeholder="username"
                  />
                </div>
                <div>
                  <Label>Bio</Label>
                  <Textarea
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    placeholder="Tell us about yourself"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="suise" onClick={handleSaveProfile}>Save</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <h1 className="text-2xl font-bold font-bricolage">
                    {profileData.display_name || profileData.username}
                  </h1>
                  <StreakBadge count={profileData.streak_count} />
                </div>
                <p className="text-muted-foreground">@{profileData.username}</p>
                {profileData.bio && <p className="mt-2">{profileData.bio}</p>}
                
                {profileData.show_email && profileData.email && (
                  <p className="text-sm text-muted-foreground mt-1">{profileData.email}</p>
                )}

                {profileData.show_wallet && profileData.wallet_address && (
                  <button
                    onClick={copyWalletAddress}
                    className="flex items-center gap-2 mt-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Wallet className="w-4 h-4" />
                    <span className="font-mono">
                      {profileData.wallet_address.slice(0, 6)}...{profileData.wallet_address.slice(-4)}
                    </span>
                    <Copy className="w-3 h-3" />
                  </button>
                )}

                <div className="flex gap-3 mt-4 justify-center sm:justify-start">
                  {isOwnProfile ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditData({
                          display_name: profileData.display_name || "",
                          username: profileData.username || "",
                          bio: profileData.bio || "",
                        });
                        setIsEditing(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button variant="suise" onClick={handleConnect}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Connect
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/chat/${profileData.id}`)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 py-4 border-y border-border mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold">{albums.filter(a => a.is_public || isOwnProfile).length}</p>
            <p className="text-sm text-muted-foreground">Albums</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{profileData.streak_count}</p>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </div>
        </div>

        {/* Albums */}
        <div>
          <h2 className="text-lg font-bold mb-4">
            {isOwnProfile ? "Your Albums" : "Public Albums"}
          </h2>
          {albums.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No albums yet</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {albums
                .filter((a) => a.is_public || isOwnProfile)
                .map((album) => (
                  <AlbumCard
                    key={album.id}
                    album={album}
                    onClick={() => navigate(`/album/${album.id}`)}
                  />
                ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
