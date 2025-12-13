import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAlbums, Album } from "@/hooks/useAlbums";
import { AlbumCard } from "@/components/AlbumCard";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Sparkles, Users } from "lucide-react";

export default function Explore() {
  const { fetchPublicAlbums, albums, loading } = useAlbums();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublicAlbums(100);
  }, []);

  return (
    <DashboardLayout activeTab="explore" onTabChange={(tab) => navigate(`/${tab === "home" ? "" : tab}`)}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-bricolage">Explore</h1>
          <p className="text-muted-foreground">Discover amazing memories from the community</p>
        </div>

        {/* Categories */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          <CategoryPill icon={<TrendingUp className="w-4 h-4" />} label="Trending" active />
          <CategoryPill icon={<Sparkles className="w-4 h-4" />} label="New" />
          <CategoryPill icon={<Users className="w-4 h-4" />} label="Following" />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : albums.length === 0 ? (
          <div className="text-center py-16">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-secondary" />
            <h3 className="text-lg font-bold mb-2">No public albums yet</h3>
            <p className="text-muted-foreground">Be the first to share your memories with the world!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {albums.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                onClick={() => navigate(`/album/${album.id}`)}
                showOwner
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function CategoryPill({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${
        active
          ? "bg-secondary text-secondary-foreground"
          : "bg-muted hover:bg-muted/80"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
