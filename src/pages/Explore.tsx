import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAlbums, Album } from "@/hooks/useAlbums";
import { AlbumCard } from "@/components/AlbumCard";
import { DemoAlbumCard, demoAlbums, DemoContentBanner } from "@/components/DemoContent";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";

export default function Explore() {
  const { fetchPublicAlbums, albums, loading } = useAlbums();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("trending");

  useEffect(() => {
    fetchPublicAlbums(100);
  }, []);

  const handleDemoClick = () => {
    toast.info("This is demo content. Create your own public albums to appear here!");
  };

  const hasRealContent = albums.length > 0;

  return (
    <DashboardLayout activeTab="explore" onTabChange={(tab) => navigate(`/${tab === "home" ? "" : tab}`)}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-bricolage">Explore</h1>
          <p className="text-muted-foreground">Discover amazing memories from the community</p>
        </div>

        {/* Categories */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          <CategoryPill 
            icon={<TrendingUp className="w-4 h-4" />} 
            label="Trending" 
            active={activeCategory === "trending"}
            onClick={() => setActiveCategory("trending")}
          />
          <CategoryPill 
            icon={<Sparkles className="w-4 h-4" />} 
            label="New" 
            active={activeCategory === "new"}
            onClick={() => setActiveCategory("new")}
          />
          <CategoryPill 
            icon={<Users className="w-4 h-4" />} 
            label="Following" 
            active={activeCategory === "following"}
            onClick={() => setActiveCategory("following")}
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Show demo content banner if no real albums */}
            {!hasRealContent && <DemoContentBanner />}

            {/* Real user albums */}
            {hasRealContent && (
              <div className="mb-8">
                <h2 className="text-lg font-bold mb-4">Community Albums</h2>
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
              </div>
            )}

            {/* Demo content */}
            <div>
              {hasRealContent && <h2 className="text-lg font-bold mb-4">Featured Collections</h2>}
              {!hasRealContent && <h2 className="text-lg font-bold mb-4">Explore Sample Albums</h2>}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {demoAlbums.map((album) => (
                  <DemoAlbumCard
                    key={album.id}
                    album={album}
                    onClick={handleDemoClick}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function CategoryPill({ 
  icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
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
