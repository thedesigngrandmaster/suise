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
  {
    id: "demo-7",
    title: "Pet Adventures",
    description: "Furry friends and their antics",
    cover_image_url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop",
    love_count: 678,
    view_count: 3421,
    owner: { display_name: "Riley Johnson", avatar_url: null },
    is_public: true,
  },
  {
    id: "demo-8",
    title: "Art & Creativity",
    description: "Paintings, sketches, and crafts",
    cover_image_url: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=400&fit=crop",
    love_count: 234,
    view_count: 1089,
    owner: { display_name: "Quinn Davis", avatar_url: null },
    is_public: true,
  },
  {
    id: "demo-9",
    title: "Music & Concerts",
    description: "Live shows and vinyl collections",
    cover_image_url: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop",
    love_count: 445,
    view_count: 2156,
    owner: { display_name: "Avery Wilson", avatar_url: null },
    is_public: true,
  },
  {
    id: "demo-10",
    title: "Fitness Journey",
    description: "Workouts and healthy living",
    cover_image_url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop",
    love_count: 321,
    view_count: 1678,
    owner: { display_name: "Jordan Blake", avatar_url: null },
    is_public: true,
  },
  {
    id: "demo-11",
    title: "Night Sky",
    description: "Astrophotography and stargazing",
    cover_image_url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=400&fit=crop",
    love_count: 589,
    view_count: 2890,
    owner: { display_name: "Skyler Moon", avatar_url: null },
    is_public: true,
  },
  {
    id: "demo-12",
    title: "Vintage Vibes",
    description: "Retro finds and nostalgia",
    cover_image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    love_count: 267,
    view_count: 1234,
    owner: { display_name: "Finley Rose", avatar_url: null },
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
  "demo-7": [
    { image_url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800", caption: "Best friend" },
    { image_url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800", caption: "Park day" },
    { image_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800", caption: "Nap time" },
    { image_url: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800", caption: "Smile!" },
    { image_url: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800", caption: "Curious cat" },
  ],
  "demo-8": [
    { image_url: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800", caption: "Colors" },
    { image_url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800", caption: "Brushstrokes" },
    { image_url: "https://images.unsplash.com/photo-1499892477393-f675706cbe6e?w=800", caption: "Studio" },
    { image_url: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800", caption: "Abstract" },
    { image_url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800", caption: "Gallery" },
  ],
  "demo-9": [
    { image_url: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800", caption: "Live show" },
    { image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800", caption: "On stage" },
    { image_url: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=800", caption: "Vinyl" },
    { image_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800", caption: "DJ set" },
    { image_url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800", caption: "Festival" },
  ],
  "demo-10": [
    { image_url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800", caption: "Gym day" },
    { image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800", caption: "Running" },
    { image_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800", caption: "Yoga" },
    { image_url: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800", caption: "Strength" },
    { image_url: "https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=800", caption: "Progress" },
  ],
  "demo-11": [
    { image_url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800", caption: "Milky Way" },
    { image_url: "https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=800", caption: "Galaxy" },
    { image_url: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800", caption: "Stars" },
    { image_url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800", caption: "Nebula" },
    { image_url: "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=800", caption: "Night sky" },
  ],
  "demo-12": [
    { image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800", caption: "Retro finds" },
    { image_url: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=800", caption: "Vintage car" },
    { image_url: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800", caption: "Old camera" },
    { image_url: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800", caption: "Polaroid" },
    { image_url: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800", caption: "Nostalgia" },
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
    </button>
  );
}

export function DemoContentBanner() {
  return (
    <div className="bg-gradient-to-r from-secondary/20 to-primary/20 rounded-xl p-4 mb-6 border border-border">
      <p className="text-sm text-muted-foreground text-center">
        👋 Discover inspiring albums from the community!
      </p>
    </div>
  );
}
