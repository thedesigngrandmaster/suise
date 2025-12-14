import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useMemories } from "@/hooks/useMemories";
import { useAlbums } from "@/hooks/useAlbums";
import { useAlbumFollows } from "@/hooks/useAlbumFollows";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { CollaboratorsManager } from "@/components/CollaboratorsManager";
import { ArrowLeft, Heart, Eye, Share2, MoreHorizontal, Trash2, Edit, Users, UserPlus, Send, Wallet, Copy, Plus, Upload, X, ImagePlus, Bookmark, BookmarkCheck, Crop } from "lucide-react";
import { toast } from "sonner";
import { SortableMemoryGrid } from "@/components/SortableMemoryGrid";
import { ImageCropper } from "@/components/ImageCropper";

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

interface Memory {
  id: string;
  image_url: string;
  caption: string | null;
  is_public: boolean;
  owner_id: string;
  display_order: number;
}

export default function AlbumDetail() {
  const { albumId } = useParams<{ albumId: string }>();
  const { user, profile } = useAuth();
  const { memories, fetchAlbumMemories, uploadMemory, deleteMemory, updateMemoryOrder, loading: memoriesLoading } = useMemories(albumId);
  const { deleteAlbum, updateAlbum, transferOwnership, loveAlbum } = useAlbums(user?.id);
  const { isFollowing, followAlbum, unfollowAlbum } = useAlbumFollows(user?.id);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [album, setAlbum] = useState<AlbumDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [collaboratorsDialogOpen, setCollaboratorsDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editMemoryDialogOpen, setEditMemoryDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [transferUsername, setTransferUsername] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  
  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploadIsPublic, setUploadIsPublic] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Image cropper state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [fileToCrop, setFileToCrop] = useState<File | null>(null);

  // Edit memory state
  const [editMemoryCaption, setEditMemoryCaption] = useState("");

  const isOwner = user && album && user.id === album.owner_id;
  const isCoOwner = user && album && user.id !== album.owner_id; // Simplified check

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

  const handleFollow = async () => {
    if (!albumId) return;
    if (isFollowing(albumId)) {
      await unfollowAlbum(albumId);
    } else {
      await followAlbum(albumId);
    }
  };

  const copyWalletAddress = () => {
    if (album?.owner.wallet_address) {
      navigator.clipboard.writeText(album.owner.wallet_address);
      toast.success("Wallet address copied!");
    }
  };

  // Photo upload handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }

    // Open cropper
    setFileToCrop(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageToCrop(e.target?.result as string);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setCropperOpen(false);
    setImageToCrop(null);
    
    // Create file from blob
    const croppedFile = new File([croppedBlob], fileToCrop?.name || "image.jpg", { type: "image/jpeg" });
    setUploadFile(croppedFile);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setUploadPreview(e.target?.result as string);
    reader.readAsDataURL(croppedBlob);
    setUploadDialogOpen(true);
    setFileToCrop(null);
  };

  const handleCropCancel = () => {
    setCropperOpen(false);
    setImageToCrop(null);
    setFileToCrop(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadMemory = async () => {
    if (!uploadFile || !albumId) return;
    setUploading(true);

    try {
      await uploadMemory(albumId, uploadFile, uploadCaption, uploadIsPublic);
      setUploadDialogOpen(false);
      resetUploadState();
    } catch (error: any) {
      toast.error("Failed to upload", { description: error.message });
    } finally {
      setUploading(false);
    }
  };

  const resetUploadState = () => {
    setUploadFile(null);
    setUploadPreview(null);
    setUploadCaption("");
    setUploadIsPublic(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleReorderMemories = (reorderedMemories: Memory[]) => {
    updateMemoryOrder(reorderedMemories as any);
  };

  const handleDeleteMemory = async (memoryId: string) => {
    if (confirm("Delete this memory?")) {
      await deleteMemory(memoryId);
      setSelectedImage(null);
      toast.success("Memory deleted");
    }
  };

  const handleEditMemory = async () => {
    if (!selectedMemory) return;
    
    const { error } = await supabase
      .from("memories")
      .update({ caption: editMemoryCaption })
      .eq("id", selectedMemory.id);

    if (error) {
      toast.error("Failed to update memory");
      return;
    }

    fetchAlbumMemories(albumId);
    setEditMemoryDialogOpen(false);
    toast.success("Memory updated");
  };

  const openEditMemory = (memory: Memory) => {
    setSelectedMemory(memory);
    setEditMemoryCaption(memory.caption || "");
    setEditMemoryDialogOpen(true);
    setSelectedImage(null);
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

  const canManagePhotos = isOwner || user;

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
            {!isOwner && albumId && (
              <Button 
                variant={isFollowing(albumId) ? "secondary" : "ghost"} 
                size="icon" 
                onClick={handleFollow}
                title={isFollowing(albumId) ? "Unfollow" : "Follow"}
              >
                {isFollowing(albumId) ? (
                  <BookmarkCheck className="w-5 h-5" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </Button>
            )}
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
                  <DropdownMenuItem onClick={() => setCollaboratorsDialogOpen(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Manage Collaborators
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

        {/* Add Photo Button */}
        {canManagePhotos && (
          <div className="mb-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <ImagePlus className="w-4 h-4" />
              Add Photo
            </Button>
          </div>
        )}

        {/* Memories Grid */}
        {memoriesLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-16">
            <ImagePlus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No memories in this album yet</p>
            {canManagePhotos && (
              <Button variant="suise" onClick={() => fileInputRef.current?.click()}>
                <Plus className="w-4 h-4 mr-2" />
                Add your first memory
              </Button>
            )}
          </div>
        ) : (
          <SortableMemoryGrid
            memories={memories as Memory[]}
            onReorder={handleReorderMemories}
            onImageClick={(url) => setSelectedImage(url)}
            onEditMemory={openEditMemory}
            onDeleteMemory={handleDeleteMemory}
            canEdit={!!isOwner}
            userId={user?.id}
            isOwner={!!isOwner}
          />
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

      {/* Upload Memory Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={(open) => {
        setUploadDialogOpen(open);
        if (!open) resetUploadState();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Memory</DialogTitle>
            <DialogDescription>Add a new photo to this album.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {uploadPreview && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={uploadPreview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={resetUploadState}
                  className="absolute top-2 right-2 p-1 bg-background/80 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <div>
              <Label htmlFor="caption">Caption (optional)</Label>
              <Textarea
                id="caption"
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                placeholder="Add a caption..."
                className="mt-1"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="public">Make this memory public</Label>
              <Switch
                id="public"
                checked={uploadIsPublic}
                onCheckedChange={setUploadIsPublic}
              />
            </div>
            <Button 
              variant="suise" 
              className="w-full" 
              onClick={handleUploadMemory}
              disabled={!uploadFile || uploading}
            >
              {uploading ? "Uploading..." : "Add Memory"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Album Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Album</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button variant="suise" onClick={handleUpdate}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Memory Dialog */}
      <Dialog open={editMemoryDialogOpen} onOpenChange={setEditMemoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Memory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="memoryCaption">Caption</Label>
              <Textarea
                id="memoryCaption"
                value={editMemoryCaption}
                onChange={(e) => setEditMemoryCaption(e.target.value)}
                placeholder="Add a caption..."
                className="mt-1"
              />
            </div>
            <Button variant="suise" onClick={handleEditMemory}>Save Changes</Button>
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

      {/* Collaborators Dialog */}
      <Dialog open={collaboratorsDialogOpen} onOpenChange={setCollaboratorsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Album Collaborators</DialogTitle>
            <DialogDescription>
              Collaborators can add and edit memories in this album.
            </DialogDescription>
          </DialogHeader>
          {album && (
            <CollaboratorsManager
              albumId={album.id}
              ownerId={album.owner_id}
              isOwner={isOwner || false}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-background/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedImage}
            alt=""
            className="max-w-full max-h-full object-contain rounded-2xl"
          />
        </div>
      )}

      {/* Image Cropper */}
      {imageToCrop && (
        <ImageCropper
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspect={4 / 3}
          isOpen={cropperOpen}
        />
      )}
    </DashboardLayout>
  );
}
