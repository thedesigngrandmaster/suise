import { Heart, Eye, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Demo album data for new users
export const demoAlbums = [
  {
    id: "demo-1",
    title: "Summer Adventures 2024",
    description: "Beach trips and sunset vibes",
    cover_image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop",
    love_count: 247,
    view_count: 1203,
    owner: { display_name: "Alex Rivera", avatar_url: null },
    is_public: true,
  },
  {
    id: "demo-2",
    title: "Coffee Shop Diaries",
    description: "My favorite spots around the city",
    cover_image_url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop",
    love_count: 182,
    view_count: 892,
    owner: { display_name: "Jordan Kim", avatar_url: null },
    is_public: true,
  },
  {
    id: "demo-3",
    title: "Mountain Escapes",
    description: "Weekend hiking memories",
    cover_image_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=400&fit=crop",
    love_count: 421,
    view_count: 2341,
    owner: { display_name: "Sam Chen", avatar_url: null },
    is_public: true,
  },
  {
    id: "demo-4",
    title: "Urban Photography",
    description: "City lights and architecture",
    cover_image_url: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=400&fit=crop",
    love_count: 356,
    view_count: 1567,
    owner: { display_name: "Taylor Park", avatar_url: null },
    is_public: true,
  },
  {
    id: "demo-5",
    title: "Foodie Adventures",
    description: "Culinary explorations",
    cover_image_url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop",
    love_count: 289,
    view_count: 1123,
    owner: { display_name: "Morgan Lee", avatar_url: null },
    is_public: true,
  },
  {
    id: "demo-6",
    title: "Golden Hour Moments",
    description: "Chasing the perfect light",
    cover_image_url: "https://images.unsplash.com/photo-1502481851512-e9e2529bfbf9?w=400&h=400&fit=crop",
    love_count: 512,
    view_count: 2890,
    owner: { display_name: "Casey Martinez", avatar_url: null },
    is_public: true,
  },
];

interface DemoAlbumCardProps {
  album: typeof demoAlbums[0];
  onClick?: () => void;
}

export function DemoAlbumCard({ album, onClick }: DemoAlbumCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl bg-card border-2 border-border hover:shadow-neubrutalist transition-all duration-200 text-left w-full"
    >
      <div className="aspect-square relative overflow-hidden">
        <img
          src={album.cover_image_url}
          alt={album.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Stats overlay */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center gap-3 text-white text-xs">
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {album.love_count}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {album.view_count}
          </span>
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-bold text-sm truncate">{album.title}</h3>
        <p className="text-xs text-muted-foreground truncate">by {album.owner.display_name}</p>
      </div>

      {/* Demo badge */}
      <div className="absolute top-2 right-2 px-2 py-0.5 bg-secondary text-secondary-foreground text-xs font-bold rounded-full">
        Demo
      </div>
    </button>
  );
}

export function DemoContentBanner() {
  return (
    <div className="bg-gradient-to-r from-secondary/20 to-primary/20 rounded-xl p-4 mb-6 border border-border">
      <p className="text-sm text-muted-foreground text-center">
        👋 These are sample albums to inspire you. Create your own to see them here!
      </p>
    </div>
  );
}
