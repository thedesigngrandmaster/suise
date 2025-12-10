import { useState } from "react";
import { MemoryCard } from "./MemoryCard";
import { StreakBadge } from "./StreakBadge";
import { BottomNav } from "./BottomNav";
import { YoomaAvatar } from "./YoomaAvatar";
import { Bell, Search } from "lucide-react";
import { Button } from "./ui/button";

// Sample memory data
const sampleMemories = [
  {
    id: 1,
    imageUrl: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&h=400&fit=crop",
    caption: "Beach sunset vibes 🌅",
    likes: 24,
    comments: 5,
  },
  {
    id: 2,
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    caption: "Mountain adventures",
    likes: 18,
    comments: 3,
  },
  {
    id: 3,
    imageUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=400&fit=crop",
    likes: 42,
    comments: 8,
  },
  {
    id: 4,
    imageUrl: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=400&h=400&fit=crop",
    caption: "Cozy coffee mornings ☕",
    likes: 31,
    comments: 6,
  },
  {
    id: 5,
    imageUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=400&fit=crop",
    caption: "City lights",
    likes: 56,
    comments: 12,
  },
  {
    id: 6,
    imageUrl: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=400&h=400&fit=crop",
    likes: 15,
    comments: 2,
  },
];

export function HomeFeed() {
  const [activeTab, setActiveTab] = useState("home");
  const [streakCount] = useState(7);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b-2 border-foreground z-40">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <YoomaAvatar variant="wave" size="sm" animate={false} />
            <h1 className="text-2xl font-black">Suise</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <StreakBadge count={streakCount} />
            <Button variant="ghost" size="icon" className="border-0">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="border-0 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full border border-background" />
            </Button>
          </div>
        </div>
      </header>

      {/* Welcome message */}
      <div className="px-4 py-6 max-w-lg mx-auto">
        <div className="flex items-center gap-3 p-4 bg-secondary rounded-2xl border-2 border-foreground shadow-neubrutalist-sm">
          <YoomaAvatar variant="celebrate" size="sm" animate />
          <div>
            <p className="font-bold text-foreground">Great job! 🎉</p>
            <p className="text-sm text-muted-foreground">
              You're on a 7-day streak. Keep it up!
            </p>
          </div>
        </div>
      </div>

      {/* Memory Grid */}
      <div className="px-4 max-w-lg mx-auto">
        <h2 className="text-lg font-bold mb-4">Recent Memories</h2>
        <div className="grid grid-cols-2 gap-3">
          {sampleMemories.map((memory) => (
            <MemoryCard
              key={memory.id}
              imageUrl={memory.imageUrl}
              caption={memory.caption}
              likes={memory.likes}
              comments={memory.comments}
            />
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onUpload={() => console.log("Upload clicked")}
      />
    </div>
  );
}