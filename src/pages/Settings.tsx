import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Shield, Bell, Palette, LogOut, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { updateProfile, updating } = useProfile();
  const navigate = useNavigate();

  const [username, setUsername] = useState(profile?.username || "");
  const [isPublic, setIsPublic] = useState(profile?.is_public ?? true);
  const [showEmail, setShowEmail] = useState(profile?.show_email ?? false);
  const [showWallet, setShowWallet] = useState(profile?.show_wallet ?? true);

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
        <h1 className="text-2xl font-bold font-bricolage mb-6">Settings</h1>

        {/* Account Section */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
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

        {/* Privacy Section */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
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
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
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
