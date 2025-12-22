import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { UploadModal } from "@/components/UploadModal";
import { useAuth } from "@/hooks/useAuth";
import { useAlbums, Album } from "@/hooks/useAlbums";
import { useAlbumFollows } from "@/hooks/useAlbumFollows";
import { YoomaAvatar } from "@/components/YoomaAvatar";
import { StreakBadge } from "@/components/StreakBadge";
import { AlbumCard } from "@/components/AlbumCard";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HomeFeed() {
  const { profile, user } = useAuth();
  const { albums } = useAlbums(user?.id);
  const { followedAlbums, loading: followsLoading } = useAlbumFollows(user?.id);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"for-you" | "following">("for-you");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [featuredAlbums, setFeaturedAlbums] = useState<Album[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(false);

  const streakCount = profile?.streak_count || 0;
  const isNewUser = !profile?.last_streak_date;

  useEffect(() => {
    if (isNewUser && user && !localStorage.getItem(`tutorial-shown-${user.id}`)) {
      const timer = setTimeout(() => {
        setTutorialOpen(true);
        localStorage.setItem(`tutorial-shown-${user.id}`, "true");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isNewUser, user]);

  // Fetch featured albums for "For You"
  useEffect(() => {
    const fetchFeatured = async () => {
      setLoadingFeatured(true);
      const { data, error } = await supabase
        .from("albums")
        .select(`
          *,
          owner:profiles!albums_owner_id_fkey(id, username, display_name, avatar_url, wallet_address),
          memories(image_url, display_order)
        `)
        .eq("is_public", true)
        .order("love_count", { ascending: false })
        .limit(12);

      if (!error && data) {
        const processed = data.map(album => {
          const sortedMemories = album.memories?.sort((a: any, b: any) => 
            (a.display_order || 0) - (b.display_order || 0)
          );
          return {
            ...album,
            first_memory_url: sortedMemories?.[0]?.image_url || album.cover_image_url || null,
            memories: undefined,
          };
        });
        setFeaturedAlbums(processed as Album[]);
      }
      setLoadingFeatured(false);
    };

    fetchFeatured();
  }, []);

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

        {/* For You Tab - Featured albums */}
        {activeTab === "for-you" && (
          <div>
            <h2 className="text-lg font-bold mb-4">Featured Albums</h2>
            {loadingFeatured ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-square bg-muted rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : featuredAlbums.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {featuredAlbums.map((album) => (
                  <AlbumCard
                    key={album.id}
                    album={album}
                    onClick={() => navigate(`/album/${album.id}`)}
                    showOwner={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-bold mb-2">No albums yet</h3>
                <p className="text-muted-foreground">Be the first to share your memories!</p>
              </div>
            )}
          </div>
        )}

        {/* Following Tab - Albums user is following */}
        {activeTab === "following" && (
          <div>
            {followsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-square bg-muted rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : followedAlbums.length > 0 ? (
              <>
                <h2 className="text-lg font-bold mb-4">Albums You Follow</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {followedAlbums.map((album) => (
                    <AlbumCard
                      key={album.id}
                      album={album}
                      onClick={() => navigate(`/album/${album.id}`)}
                      showOwner={true}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Bookmark className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-bold mb-2">No followed albums yet</h3>
                <p className="text-muted-foreground mb-4">
                  Follow albums to see them here!
                </p>
                <Button variant="suise" onClick={() => navigate("/explore")}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Explore Albums
                </Button>
              </div>
            )}
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
