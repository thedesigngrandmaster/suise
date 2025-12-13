import { useState } from "react";
import { MemoryCard } from "./MemoryCard";
import { StreakBadge } from "./StreakBadge";
import { DashboardLayout } from "./DashboardLayout";
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
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onUpload={() => console.log("Upload clicked")}
    >
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Desktop header actions */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold font-bricolage">Home</h1>
          <div className="flex items-center gap-3">
            <StreakBadge count={streakCount} />
            <Button variant="ghost" size="icon">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>
          </div>
        </div>

        {/* Mobile streak badge */}
        <div className="lg:hidden flex justify-end mb-4">
          <StreakBadge count={streakCount} />
        </div>

        {/* Welcome message */}
        <div className="mb-6">
          <div className="flex items-center gap-3 p-4 bg-secondary/20 rounded-2xl">
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
        <div>
          <h2 className="text-lg font-bold mb-4">Recent Memories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
      </div>
    </DashboardLayout>
  );
}