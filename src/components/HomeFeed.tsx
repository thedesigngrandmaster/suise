import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { UploadModal } from "@/components/UploadModal";
import { useAuth } from "@/hooks/useAuth";
import { useAlbums } from "@/hooks/useAlbums";
import { YoomaAvatar } from "@/components/YoomaAvatar";
import { StreakBadge } from "@/components/StreakBadge";
import { AlbumCard } from "@/components/AlbumCard";
import { DemoAlbumCard, demoAlbums, DemoContentBanner } from "@/components/DemoContent";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function HomeFeed() {
  const { profile } = useAuth();
  const { user } = useAuth();
  const { albums } = useAlbums(user?.id);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"for-you" | "following">("for-you");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const streakCount = profile?.streak_count || 0;
  const isNewUser = !profile?.last_streak_date;

  // Show tutorial for new users
  useEffect(() => {
    if (isNewUser && user && !localStorage.getItem(`tutorial-shown-${user.id}`)) {
      const timer = setTimeout(() => {
        setTutorialOpen(true);
        localStorage.setItem(`tutorial-shown-${user.id}`, "true");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isNewUser, user]);

  const getStreakMessage = () => {
    if (isNewUser) {
      return "Welcome! Start your journey by adding your first memory.";
    }
    if (streakCount === 0) {
      return "Add a memory today to start your streak!";
    }
    if (streakCount === 1) {
      return "You're on a 1-day streak. Keep going!";
    }
    if (streakCount < 7) {
      return `You're on a ${streakCount}-day streak. Nice work!`;
    }
    if (streakCount < 30) {
      return `Amazing! ${streakCount} days and counting! 🔥`;
    }
    return `Legendary ${streakCount}-day streak! You're unstoppable! 🏆`;
  };

  const handleDemoClick = (albumId: string) => {
    navigate(`/demo-album/${albumId}`);
  };

  return (
    <DashboardLayout
      activeTab="home"
      onTabChange={(tab) => navigate(`/${tab === "home" ? "" : tab}`)}
    >
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex items-center justify-center gap-8 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab("for-you")}
            className={cn(
              "pb-3 font-bold transition-colors relative",
              activeTab === "for-you"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            For You
            {activeTab === "for-you" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("following")}
            className={cn(
              "pb-3 font-bold transition-colors relative",
              activeTab === "following"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Following
            {activeTab === "following" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary rounded-full" />
            )}
          </button>
        </div>

        {/* Desktop header actions */}
        <div className="hidden lg:flex items-center justify-end mb-6">
          <StreakBadge count={streakCount} />
        </div>

        {/* Mobile streak badge */}
        <div className="lg:hidden flex justify-end mb-4">
          <StreakBadge count={streakCount} />
        </div>

        {/* Upload CTA Card */}
        <button
          onClick={() => setUploadOpen(true)}
          className="w-full mb-6 p-6 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl text-left hover:from-primary/30 hover:to-secondary/30 transition-colors"
        >
          <div className="flex items-center gap-4">
            <YoomaAvatar variant={streakCount > 0 ? "celebrate" : "wave"} size="md" animate />
            <div className="flex-1">
              <p className="font-bold text-lg">{getStreakMessage()}</p>
              <p className="text-muted-foreground">
                {isNewUser ? "Click here to add your first memory!" : "Tap to add today's memory"}
              </p>
            </div>
          </div>
        </button>

        {/* User's Albums */}
        {albums.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4">Your Recent Albums</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {albums.slice(0, 6).map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  onClick={() => navigate(`/album/${album.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Demo content for For You tab */}
        {activeTab === "for-you" && (
          <div>
            <DemoContentBanner />
            <h2 className="text-lg font-bold mb-4">Discover Amazing Memories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {demoAlbums.slice(0, 6).map((album) => (
                <DemoAlbumCard
                  key={album.id}
                  album={album}
                  onClick={() => handleDemoClick(album.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Following tab empty state */}
        {activeTab === "following" && (
          <div className="text-center py-12">
            <YoomaAvatar variant="wave" size="lg" animate />
            <h3 className="text-lg font-bold mt-4 mb-2">No posts yet</h3>
            <p className="text-muted-foreground">
              Connect with friends to see their memories here!
            </p>
          </div>
        )}
      </div>

      <UploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} />
      <OnboardingTutorial 
        isOpen={tutorialOpen} 
        onClose={() => setTutorialOpen(false)}
        onStartUpload={() => setUploadOpen(true)}
      />
    </DashboardLayout>
  );
}
