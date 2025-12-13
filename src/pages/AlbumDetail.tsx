import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useMemories } from "@/hooks/useMemories";
import { useAlbums } from "@/hooks/useAlbums";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ArrowLeft, Heart, Eye, Share2, MoreHorizontal, Trash2, Edit, Users, Send, Wallet, Copy } from "lucide-react";
import { toast } from "sonner";

interface AlbumDetails {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  is_public: boolean;
  view_count: number;
  love_count: number;
  share_count: number;
  owner_id: string;
  owner: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    wallet_address: string | null;
  };
}

export default function AlbumDetail() {
  const { albumId } = useParams<{ albumId: string }>();
  const { user } = useAuth();
  const { memories, fetchAlbumMemories, loading: memoriesLoading } = useMemories(albumId);
  const { deleteAlbum, updateAlbum, transferOwnership, loveAlbum } = useAlbums(user?.id);
  const navigate = useNavigate();

  const [album, setAlbum] = useState<AlbumDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [transferUsername, setTransferUsername] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const isOwner = user && album && user.id === album.owner_id;

  useEffect(() => {
    const fetchAlbum = async () => {
      if (!albumId) return;
      
      const { data, error } = await supabase
        .from("albums")
        .select(`
          *,
          owner:profiles!albums_owner_id_fkey(id, username, display_name, avatar_url, wallet_address)
        `)
        .eq("id", albumId)
        .single();

      if (error) {
        console.error(error);
        navigate("/explore");
        return;
      }

      setAlbum(data);
      setEditTitle(data.title);
      setEditDescription(data.description || "");
      setLoading(false);
      fetchAlbumMemories(albumId);

      // Increment view count
      await supabase
        .from("albums")
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq("id", albumId);
    };

    fetchAlbum();
  }, [albumId]);

  const handleDelete = async () => {
    if (!albumId) return;
    if (confirm("Are you sure you want to delete this album? This cannot be undone.")) {
      await deleteAlbum(albumId);
      navigate("/vault");
    }
  };

  const handleUpdate = async () => {
    if (!albumId) return;
    await updateAlbum(albumId, { title: editTitle, description: editDescription });
    setAlbum((prev) => prev ? { ...prev, title: editTitle, description: editDescription } : null);
    setEditDialogOpen(false);
  };

  const handleTransfer = async () => {
    if (!albumId || !transferUsername) return;
    
    const { data: targetUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", transferUsername.toLowerCase())
      .single();

    if (!targetUser) {
      toast.error("User not found");
      return;
    }

    await transferOwnership(albumId, targetUser.id);
    setTransferDialogOpen(false);
    navigate("/vault");
  };

  const handleLove = async () => {
    if (!albumId) return;
    await loveAlbum(albumId);
    setAlbum((prev) => prev ? { ...prev, love_count: (prev.love_count || 0) + 1 } : null);
  };

  const copyWalletAddress = () => {
    if (album?.owner.wallet_address) {
      navigator.clipboard.writeText(album.owner.wallet_address);
      toast.success("Wallet address copied!");
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeTab="explore" onTabChange={(tab) => navigate(`/${tab === "home" ? "" : tab}`)}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-muted rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!album) {
    return (
      <DashboardLayout activeTab="explore" onTabChange={(tab) => navigate(`/${tab === "home" ? "" : tab}`)}>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-xl font-bold mb-2">Album not found</h2>
          <Button variant="outline" onClick={() => navigate("/explore")}>
            Back to Explore
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="explore" onTabChange={(tab) => navigate(`/${tab === "home" ? "" : tab}`)}>
      <div className="max-w-4xl mx-auto px-4 py-6">
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
            <Button variant="ghost" size="icon" onClick={handleLove}>
              <Heart className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="w-5 h-5" />
            </Button>

            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Album
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTransferDialogOpen(true)}>
                    <Users className="w-4 h-4 mr-2" />
                    Transfer Ownership
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Album
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mb-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" /> {album.view_count || 0} views
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4" /> {album.love_count || 0} loves
          </span>
          <span className="flex items-center gap-1">
            <Share2 className="w-4 h-4" /> {album.share_count || 0} shares
          </span>
        </div>

        {/* Memories Grid */}
        {memoriesLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No memories in this album yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {memories.map((memory) => (
              <button
                key={memory.id}
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
            <button onClick={() => navigate(`/@${album.owner.username}`)}>
              {album.owner.avatar_url ? (
                <img
                  src={album.owner.avatar_url}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
              )}
            </button>
            <div className="flex-1">
              <p className="font-medium">{album.owner.display_name || album.owner.username}</p>
              <p className="text-sm text-muted-foreground">@{album.owner.username}</p>
              {album.owner.wallet_address && (
                <button
                  onClick={copyWalletAddress}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-1"
                >
                  <Wallet className="w-3 h-3" />
                  <span className="font-mono">
                    {album.owner.wallet_address.slice(0, 6)}...{album.owner.wallet_address.slice(-4)}
                  </span>
                  <Copy className="w-3 h-3" />
                </button>
              )}
            </div>
            {!isOwner && (
              <Button variant="outline" onClick={() => navigate(`/chat/${album.owner.id}`)}>
                <Send className="w-4 h-4 mr-2" />
                Contact
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Album</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button variant="suise" onClick={handleUpdate}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Ownership</DialogTitle>
            <DialogDescription>
              Enter the username of the person you want to transfer this album to.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={transferUsername}
              onChange={(e) => setTransferUsername(e.target.value)}
              placeholder="username"
            />
            <Button variant="suise" onClick={handleTransfer}>Transfer</Button>
          </div>
        </DialogContent>
      </Dialog>

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
