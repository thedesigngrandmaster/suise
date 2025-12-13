import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  type: "user" | "album";
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  url: string;
}

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const searchResults: SearchResult[] = [];

    // Check if it's a username search
    if (query.startsWith("@")) {
      const username = query.slice(1).toLowerCase();
      const { data: users } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .ilike("username", `%${username}%`)
        .limit(10);

      if (users) {
        users.forEach((user) => {
          searchResults.push({
            type: "user",
            id: user.id,
            title: user.display_name || user.username || "Unknown",
            subtitle: `@${user.username}`,
            image: user.avatar_url || undefined,
            url: `/@${user.username}`,
          });
        });
      }
    } else {
      // Search users and albums
      const [usersResponse, albumsResponse] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url")
          .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
          .eq("is_public", true)
          .limit(5),
        supabase
          .from("albums")
          .select("id, title, cover_image_url, owner:profiles(username)")
          .ilike("title", `%${query}%`)
          .eq("is_public", true)
          .limit(5),
      ]);

      if (usersResponse.data) {
        usersResponse.data.forEach((user) => {
          searchResults.push({
            type: "user",
            id: user.id,
            title: user.display_name || user.username || "Unknown",
            subtitle: `@${user.username}`,
            image: user.avatar_url || undefined,
            url: `/@${user.username}`,
          });
        });
      }

      if (albumsResponse.data) {
        albumsResponse.data.forEach((album: any) => {
          searchResults.push({
            type: "album",
            id: album.id,
            title: album.title,
            subtitle: `by @${album.owner?.username || "unknown"}`,
            image: album.cover_image_url || undefined,
            url: `/album/${album.id}`,
          });
        });
      }
    }

    // Check for page routes
    const routes = ["settings", "vault", "explore", "notifications", "connect", "chat"];
    routes.forEach((route) => {
      if (route.includes(query.toLowerCase())) {
        searchResults.unshift({
          type: "album",
          id: route,
          title: route.charAt(0).toUpperCase() + route.slice(1),
          subtitle: "Page",
          url: `/${route}`,
        });
      }
    });

    setResults(searchResults);
    setLoading(false);
  };

  return {
    results,
    loading,
    search,
    clearResults: () => setResults([]),
  };
}
