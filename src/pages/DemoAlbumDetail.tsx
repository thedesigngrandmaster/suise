import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Eye, Share2, User } from "lucide-react";
import { demoAlbums, demoMemories } from "@/components/DemoContent";
import { useState } from "react";
import { toast } from "sonner";

export default function DemoAlbumDetail() {
  const { albumId } = useParams<{ albumId: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loved, setLoved] = useState(false);
  const [loveCount, setLoveCount] = useState(0);

  const album = demoAlbums.find((a) => a.id === albumId);
  const memories = demoMemories[albumId || ""] || [];

  // Initialize love count from album data
  useState(() => {
    if (album) {
      setLoveCount(album.love_count);
    }
  });

  const handleLove = () => {
    if (loved) {
      setLoved(false);
      setLoveCount((prev) => prev - 1);
      toast.success("Removed from favorites");
    } else {
      setLoved(true);
      setLoveCount((prev) => prev + 1);
      toast.success("Added to favorites!");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  if (!album) {
    return (
      <DashboardLayout activeTab="explore" onTabChange={(tab) => navigate(`/${tab === "home" ? "" : tab}`)}>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-xl font-bold mb-2">Demo album not found</h2>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="explore" onTabChange={(tab) => navigate(`/${tab === "home" ? "" : tab}`)}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Demo Banner */}
        <div className="bg-gradient-to-r from-secondary/20 to-primary/20 rounded-xl p-3 mb-6 border border-border text-center">
          <p className="text-sm text-muted-foreground">
            👋 This is a demo album. <button onClick={() => navigate("/vault")} className="text-secondary font-bold hover:underline">Create your own!</button>
          </p>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold font-bricolage">{album.title}</h1>
              {album.description && (
                <p className="text-muted-foreground">{album.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant={loved ? "default" : "ghost"} 
              size="icon" 
              onClick={handleLove}
              className={loved ? "text-red-500" : ""}
            >
              <Heart className={`w-5 h-5 ${loved ? "fill-current" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mb-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" /> {album.view_count} views
          </span>
          <span className="flex items-center gap-1">
            <Heart className={`w-4 h-4 ${loved ? "text-red-500 fill-current" : ""}`} /> {loveCount || album.love_count} loves
          </span>
        </div>

        {/* Memories Grid */}
        {memories.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No memories in this demo album</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {memories.map((memory, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(memory.image_url)}
                className="aspect-square rounded-2xl overflow-hidden hover:opacity-90 transition-opacity"
              >
                <img
                  src={memory.image_url}
                  alt={memory.caption || "Memory"}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Owner Info */}
        <div className="mt-8 p-4 bg-card rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
              <User className="w-6 h-6 text-secondary" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{album.owner.display_name}</p>
              <p className="text-sm text-muted-foreground">Demo Creator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-background/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt=""
            className="max-w-full max-h-full object-contain rounded-2xl"
          />
        </div>
      )}
    </DashboardLayout>
  );
}
