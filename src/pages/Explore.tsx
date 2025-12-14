import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAlbums, Album } from "@/hooks/useAlbums";
import { useAlbumFollows } from "@/hooks/useAlbumFollows";
import { useAuth } from "@/hooks/useAuth";
import { AlbumCard } from "@/components/AlbumCard";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Sparkles, Heart, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
interface SearchResult {
  type: "user" | "album";
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  url: string;
}

export default function Explore() {
  const { user } = useAuth();
  const { fetchPublicAlbums, albums, loading } = useAlbums();
  const { followedAlbums, loading: followsLoading } = useAlbumFollows(user?.id);
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  useEffect(() => {
    fetchPublicAlbums(100);
  }, []);

  // Search functionality
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      const results: SearchResult[] = [];

      // Check if it's a username search
      if (searchQuery.startsWith("@")) {
        const username = searchQuery.slice(1).toLowerCase();
        const { data: users } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url")
          .ilike("username", `%${username}%`)
          .eq("is_public", true)
          .limit(10);

        if (users) {
          users.forEach((user) => {
            results.push({
              type: "user",
              id: user.id,
              title: user.display_name || user.username || "Unknown",
              subtitle: user.username || "",
              image: user.avatar_url || undefined,
              url: `/${user.username}`,
            });
          });
        }
      } else {
        // Search users and albums
        const [usersResponse, albumsResponse] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, username, display_name, avatar_url")
            .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
            .eq("is_public", true)
            .limit(5),
          supabase
            .from("albums")
            .select("id, title, cover_image_url, owner:profiles(username)")
            .ilike("title", `%${searchQuery}%`)
            .eq("is_public", true)
            .limit(5),
        ]);

        if (usersResponse.data) {
          usersResponse.data.forEach((user) => {
            results.push({
              type: "user",
              id: user.id,
              title: user.display_name || user.username || "Unknown",
              subtitle: user.username || "",
              image: user.avatar_url || undefined,
              url: `/${user.username}`,
            });
          });
        }

        if (albumsResponse.data) {
          albumsResponse.data.forEach((album: any) => {
            results.push({
              type: "album",
              id: album.id,
              title: album.title,
              subtitle: `by ${album.owner?.username || "unknown"}`,
              image: album.cover_image_url || undefined,
              url: `/album/${album.id}`,
            });
          });
        }
      }

      setSearchResults(results);
      setIsSearching(false);
    };

    const debounce = setTimeout(performSearch, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleResultClick = (url: string) => {
    setSearchQuery("");
    setSearchResults([]);
    navigate(url);
  };

  // Get albums based on category
  const getDisplayAlbums = () => {
    if (activeCategory === "following") {
      return followedAlbums;
    }
    
    return [...albums].sort((a, b) => {
      if (activeCategory === "trending") {
        return (b.love_count || 0) - (a.love_count || 0);
      } else if (activeCategory === "new") {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
      return 0;
    });
  };
  
  const displayAlbums = getDisplayAlbums();
  const isLoading = activeCategory === "following" ? followsLoading : loading;

  return (
    <DashboardLayout activeTab="explore" onTabChange={(tab) => navigate(`/${tab === "home" ? "" : tab}`)}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-bricolage">Explore</h1>
          <p className="text-muted-foreground">Discover amazing memories from the community</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search users (@username) or albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-full bg-muted border-none"
          />
          
          {/* Search Results Dropdown */}
          {(searchResults.length > 0 || isSearching) && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-2xl shadow-lg border border-border z-50 overflow-hidden max-h-80 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-muted-foreground">Searching...</div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No results found</div>
              ) : (
                searchResults.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result.url)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left"
                  >
                    {result.type === "user" ? (
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={result.image} />
                        <AvatarFallback>
                          <User className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden">
                        {result.image ? (
                          <img src={result.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-secondary/20">
                            <Sparkles className="w-5 h-5 text-secondary" />
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{result.title}</p>
                      {result.subtitle && (
                        <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground capitalize px-2 py-1 bg-muted rounded-full">
                      {result.type}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
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
            icon={<Heart className="w-4 h-4" />} 
            label="Following" 
            active={activeCategory === "following"}
            onClick={() => setActiveCategory("following")}
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : displayAlbums.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {displayAlbums.map((album) => (
              <AlbumCard
                key={album.id}
                album={album as Album}
                onClick={() => navigate(`/album/${album.id}`)}
                showOwner
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            {activeCategory === "following" ? (
              <>
                <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-bold mb-2">No followed albums yet</h3>
                <p className="text-muted-foreground">Browse albums and click the follow button to see them here!</p>
              </>
            ) : (
              <>
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-bold mb-2">No public albums yet</h3>
                <p className="text-muted-foreground">Be the first to share your memories with the community!</p>
              </>
            )}
          </div>
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
