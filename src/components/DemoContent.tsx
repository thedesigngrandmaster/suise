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

// Demo memories for each album
export const demoMemories: Record<string, Array<{ image_url: string; caption: string }>> = {
  "demo-1": [
    { image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800", caption: "Perfect beach day" },
    { image_url: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800", caption: "Sunset vibes" },
    { image_url: "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=800", caption: "Ocean breeze" },
    { image_url: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800", caption: "Beach walk" },
    { image_url: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800", caption: "Paradise found" },
    { image_url: "https://images.unsplash.com/photo-1494783367193-149034c05e8f?w=800", caption: "Summer memories" },
  ],
  "demo-2": [
    { image_url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800", caption: "Morning brew" },
    { image_url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800", caption: "Cozy corner" },
    { image_url: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800", caption: "Latte art" },
    { image_url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800", caption: "Perfect pour" },
    { image_url: "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=800", caption: "Cafe vibes" },
  ],
  "demo-3": [
    { image_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800", caption: "Summit views" },
    { image_url: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800", caption: "Alpine adventure" },
    { image_url: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800", caption: "Mountain sunrise" },
    { image_url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800", caption: "Starry night" },
    { image_url: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800", caption: "Valley view" },
    { image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800", caption: "Peak experience" },
  ],
  "demo-4": [
    { image_url: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800", caption: "City lights" },
    { image_url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800", caption: "Urban jungle" },
    { image_url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800", caption: "Architecture" },
    { image_url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800", caption: "Skyline" },
    { image_url: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=800", caption: "Night drive" },
  ],
  "demo-5": [
    { image_url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800", caption: "Feast" },
    { image_url: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800", caption: "Brunch goals" },
    { image_url: "https://images.unsplash.com/photo-1482049016gy5-fa7004e9e0db?w=800", caption: "Fresh ingredients" },
    { image_url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800", caption: "Colorful plate" },
    { image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800", caption: "Pizza night" },
    { image_url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800", caption: "Sweet treat" },
  ],
  "demo-6": [
    { image_url: "https://images.unsplash.com/photo-1502481851512-e9e2529bfbf9?w=800", caption: "Golden light" },
    { image_url: "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?w=800", caption: "Field of gold" },
    { image_url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800", caption: "Sunset glow" },
    { image_url: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800", caption: "Magic hour" },
    { image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800", caption: "Dreamy" },
  ],
};

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
