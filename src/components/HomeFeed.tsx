import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { UploadModal } from "@/components/UploadModal";
import { useAuth } from "@/hooks/useAuth";
import { useAlbums, Album } from "@/hooks/useAlbums";
import { useAlbumFollows } from "@/hooks/useAlbumFollows";
import { StreakBadge } from "@/components/StreakBadge";
import { AlbumCard } from "@/components/AlbumCard";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Bookmark, Plus, Flame, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const TABS = [
  { id: "for-you", label: "For you" },
  { id: "following", label: "Following" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function HomeFeed() {
  const { profile, user } = useAuth();
  const { albums } = useAlbums(user?.id);
  const { followedAlbums, loading: followsLoading } = useAlbumFollows(user?.id);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("for-you");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [featuredAlbums, setFeaturedAlbums] = useState<Album[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  const streakCount = profile?.streak_count || 0;
  const isNewUser = !profile?.last_streak_date;
  const firstName =
    (profile?.display_name || profile?.username || "there").split(" ")[0];

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoadingFeatured(true);
      const { data, error } = await supabase
        .from("albums")
        .select(
          `*, owner:profiles!albums_owner_id_fkey(id, username, display_name, avatar_url, wallet_address), memories(image_url, display_order)`
        )
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(12);

      if (!error && data) {
        setFeaturedAlbums(
          data.map((album: any) => {
            const sorted = album.memories?.sort(
              (a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)
            );
            const first = sorted?.[0]?.image_url || null;
            return {
              ...album,
              cover_image_url: album.cover_image_url || first,
              first_memory_url: first,
              memories: undefined,
            };
          }) as Album[]
        );
      }
      setLoadingFeatured(false);
    };

    fetchFeatured();
  }, []);

  const streakMessage = isNewUser
    ? "Start your first memory"
    : streakCount === 0
    ? "Add a memory today to restart your streak"
    : `${streakCount}-day streak · keep it going`;

  const streakSub = isNewUser
    ? "Create a folder and keep your first photo safe."
    : "One photo a day keeps your streak alive.";

  return (
    <DashboardLayout
      activeTab="home"
      onTabChange={(tab) => navigate(`/${tab === "home" ? "" : tab}`)}
    >
      <div className="w-full max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
        {/* Header */}
        <header className="flex items-start justify-between gap-4 mb-6">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Welcome back</p>
            <h1 className="text-2xl sm:text-3xl font-bold font-bricolage tracking-tight truncate">
              {firstName}
            </h1>
          </div>
          <StreakBadge count={streakCount} size="md" />
        </header>

        {/* Streak / add-memory bar */}
        <section
          aria-label="Daily contribution"
          className="soft-card soft-lift mb-6 overflow-hidden"
        >
          <button
            onClick={() => setUploadOpen(true)}
            className="w-full flex items-center gap-4 p-4 sm:p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-3xl"
          >
            <span
              aria-hidden
              className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl bg-secondary/12 flex items-center justify-center"
            >
              <Flame
                className={cn(
                  "w-6 h-6 sm:w-7 sm:h-7 text-secondary",
                  streakCount > 0 && "streak-flicker"
                )}
                fill={streakCount > 0 ? "currentColor" : "none"}
              />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block font-semibold text-base sm:text-lg truncate">
                {streakMessage}
              </span>
              <span className="block text-sm text-muted-foreground truncate">
                {streakSub}
              </span>
            </span>
            <span
              aria-hidden
              className="shrink-0 w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center"
            >
              <Plus className="w-5 h-5" />
            </span>
            <span className="sr-only">Add today's memory</span>
          </button>
        </section>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Feed"
          className="inline-flex items-center gap-1 p-1 rounded-full bg-muted/70 mb-6"
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all",
                  active
                    ? "bg-background text-foreground shadow-[var(--shadow-soft)]"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Your albums */}
        {albums.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base sm:text-lg font-semibold">Your folders</h2>
              <button
                onClick={() => navigate("/vault")}
                className="text-sm text-secondary font-medium inline-flex items-center gap-1 hover:underline"
              >
                Vault <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {albums.slice(0, 5).map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  showVisibility
                  onClick={() => navigate(`/album/${album.id}`)}
                />
              ))}
            </div>
          </section>
        )}

        {activeTab === "for-you" && (
          <section>
            <h2 className="text-base sm:text-lg font-semibold mb-3">
              Fresh from the community
            </h2>
            {loadingFeatured ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-muted rounded-3xl animate-pulse"
                  />
                ))}
              </div>
            ) : featuredAlbums.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {featuredAlbums.map((album) => (
                  <AlbumCard
                    key={album.id}
                    album={album}
                    onClick={() => navigate(`/album/${album.id}`)}
                    showOwner
                  />
                ))}
              </div>
            ) : (
              <div className="soft-card text-center py-12 px-6">
                <Sparkles className="w-10 h-10 mx-auto mb-3 text-secondary" />
                <h3 className="font-semibold mb-1">Nothing here yet</h3>
                <p className="text-sm text-muted-foreground">
                  Be the first to share a public folder.
                </p>
              </div>
            )}
          </section>
        )}

        {activeTab === "following" && (
          <section>
            <h2 className="text-base sm:text-lg font-semibold mb-3">
              Folders you follow
            </h2>
            {followsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-muted rounded-3xl animate-pulse"
                  />
                ))}
              </div>
            ) : followedAlbums.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {followedAlbums.map((album) => (
                  <AlbumCard
                    key={album.id}
                    album={album}
                    onClick={() => navigate(`/album/${album.id}`)}
                    showOwner
                  />
                ))}
              </div>
            ) : (
              <div className="soft-card text-center py-12 px-6">
                <Bookmark className="w-10 h-10 mx-auto mb-3 text-secondary" />
                <h3 className="font-semibold mb-1">No follows yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Follow folders on Explore to see their updates here.
                </p>
                <Button variant="suise" onClick={() => navigate("/explore")}>
                  Explore folders
                </Button>
              </div>
            )}
          </section>
        )}
      </div>

      <UploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} />
    </DashboardLayout>
  );
}
