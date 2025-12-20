import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useAlbumsContext } from "@/contexts/AlbumsContext";
import { useTheme, Theme } from "@/providers/ThemeProvider";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Shield, Bell, Palette, LogOut, Sun, Moon, Monitor, Sunset, Waves, TreePine } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const themeOptions: { id: Theme; label: string; icon: typeof Sun; description: string }[] = [
  { id: "light", label: "Light", icon: Sun, description: "Clean and bright" },
  { id: "dim", label: "Dim", icon: Monitor, description: "Easy on the eyes" },
  { id: "dark", label: "Dark", icon: Moon, description: "Pure darkness" },
  { id: "sunset", label: "Sunset", icon: Sunset, description: "Warm orange tones" },
  { id: "ocean", label: "Ocean", icon: Waves, description: "Cool blue vibes" },
  { id: "forest", label: "Forest", icon: TreePine, description: "Natural greens" },
];

export default function Settings() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { updateProfile, updating } = useProfile();
  const { albums } = useAlbumsContext();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [username, setUsername] = useState(profile?.username || "");
  const [isPublic, setIsPublic] = useState(profile?.is_public ?? true);
  const [showEmail, setShowEmail] = useState(profile?.show_email ?? false);
  const [showWallet, setShowWallet] = useState(profile?.show_wallet ?? true);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setIsPublic(profile.is_public);
      setShowEmail(profile.show_email);
      setShowWallet(profile.show_wallet);
    }
  }, [profile]);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    toast.success(`Theme changed to ${newTheme}`);
  };

  const handleSavePrivacy = async () => {
    if (!user) return;
    await updateProfile(user.id, {
      username: username.toLowerCase().replace(/[^a-z0-9_]/g, ""),
      is_public: isPublic,
      show_email: showEmail,
      show_wallet: showWallet,
    });
    await refreshProfile();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <DashboardLayout activeTab="settings" onTabChange={(tab) => navigate(`/${tab === "home" ? "" : tab}`)}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold font-bricolage mb-6 text-secondary">Settings</h1>

        {/* Stats Overview */}
        {profile && (
          <section className="mb-8">
            <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl p-4">
              <div className="flex items-center justify-around">
                <div className="text-center">
                  <p className="text-3xl font-bold">{albums.length}</p>
                  <p className="text-sm text-muted-foreground">Albums</p>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <p className="text-3xl font-bold">{profile.streak_count}</p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Account Section */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-secondary">
            <User className="w-5 h-5" />
            Account
          </h2>
          <div className="bg-card rounded-2xl p-4 space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                placeholder="your_username"
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Your profile will be available at /@{username || "username"}
              </p>
            </div>
            <div>
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled className="mt-1 bg-muted" />
            </div>
          </div>
        </section>

        {/* Appearance Section */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-secondary">
            <Palette className="w-5 h-5" />
            Appearance
          </h2>
          <div className="bg-card rounded-2xl p-4">
            <p className="font-medium mb-4">Choose your preferred theme</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleThemeChange(option.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                      theme === option.id ? "border-secondary bg-secondary/10" : "border-border hover:border-secondary/50"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Privacy Section */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-secondary">
            <Shield className="w-5 h-5" />
            Privacy
          </h2>
          <div className="bg-card rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Public Profile</p>
                <p className="text-sm text-muted-foreground">Allow others to find and view your profile</p>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Show Email</p>
                <p className="text-sm text-muted-foreground">Display your email on your profile</p>
              </div>
              <Switch checked={showEmail} onCheckedChange={setShowEmail} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Show Wallet Address</p>
                <p className="text-sm text-muted-foreground">Display your wallet address on your profile</p>
              </div>
              <Switch checked={showWallet} onCheckedChange={setShowWallet} />
            </div>
            <Button variant="suise" onClick={handleSavePrivacy} disabled={updating}>
              {updating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-secondary">
            <Bell className="w-5 h-5" />
            Notifications
          </h2>
          <div className="bg-card rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Receive notifications for activity</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive email updates</p>
              </div>
              <Switch />
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section>
          <h2 className="text-lg font-bold mb-4 text-destructive">Danger Zone</h2>
          <div className="bg-card rounded-2xl p-4">
            <Button variant="destructive" onClick={handleSignOut} className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
