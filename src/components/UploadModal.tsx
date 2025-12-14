import { useState, useRef } from "react";
import { X, Upload, Image, FolderPlus, Camera } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { useAlbums } from "@/hooks/useAlbums";
import { useMemories } from "@/hooks/useMemories";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAlbumId?: string;
}

type Mode = "select" | "upload" | "create-album";

export function UploadModal({ isOpen, onClose, defaultAlbumId }: UploadModalProps) {
  const { user } = useAuth();
  const { albums, createAlbum } = useAlbums(user?.id);
  const { uploadMemory } = useMemories();

  const [mode, setMode] = useState<Mode>("select");
  const [selectedAlbumId, setSelectedAlbumId] = useState(defaultAlbumId || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  // Create album state
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumDescription, setAlbumDescription] = useState("");
  const [albumIsPublic, setAlbumIsPublic] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      setMode("upload");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedAlbumId) return;

    setLoading(true);
    await uploadMemory(selectedAlbumId, selectedFile, caption, isPublic);
    setLoading(false);
    handleClose();
  };

  const handleCreateAlbum = async () => {
    if (!albumTitle.trim() || !user) return;

    setLoading(true);
    
    // Use the createAlbum function from useAlbums hook
    // This ensures proper state management and triggers real-time updates
    const result = await createAlbum({
      title: albumTitle,
      description: albumDescription || undefined,
      is_public: albumIsPublic,
    });

    if (result?.error) {
      setLoading(false);
      return;
    }

    // Set the newly created album as selected
    if (result?.album) {
      setSelectedAlbumId(result.album.id);
    }
    
    setMode("select");
    setAlbumTitle("");
    setAlbumDescription("");
    setAlbumIsPublic(false);
    setLoading(false);
  };

  const handleClose = () => {
    setMode("select");
    setSelectedFile(null);
    setPreview(null);
    setCaption("");
    setIsPublic(false);
    setSelectedAlbumId(defaultAlbumId || "");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-card rounded-2xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-bold font-bricolage text-lg">
            {mode === "create-album" ? "Create Album" : "Add Memory"}
          </h2>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {mode === "select" && (
            <div className="space-y-4">
              {/* Album selector */}
              <div>
                <Label>Select Album</Label>
                <select
                  value={selectedAlbumId}
                  onChange={(e) => setSelectedAlbumId(e.target.value)}
                  className="w-full mt-1 p-3 rounded-xl border border-border bg-background"
                >
                  <option value="">Choose an album...</option>
                  {albums.map((album) => (
                    <option key={album.id} value={album.id}>
                      {album.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setMode("create-album")}
                >
                  <FolderPlus className="w-4 h-4 mr-2" />
                  New Album
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={!selectedAlbumId}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
                <Button
                  variant="suise"
                  className="flex-1"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!selectedAlbumId}
                >
                  <Image className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </div>

              {/* Camera input */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {/* File upload input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {mode === "upload" && preview && (
            <div className="space-y-4">
              <img
                src={preview}
                alt="Preview"
                className="w-full aspect-video object-cover rounded-xl"
              />

              <div>
                <Label htmlFor="caption">Caption (optional)</Label>
                <Textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                  className="mt-1"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Make Public</p>
                  <p className="text-sm text-muted-foreground">Anyone can see this memory</p>
                </div>
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setMode("select")}>
                  Back
                </Button>
                <Button
                  variant="suise"
                  className="flex-1"
                  onClick={handleUpload}
                  disabled={loading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {loading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </div>
          )}

          {mode === "create-album" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="albumTitle">Album Title</Label>
                <Input
                  id="albumTitle"
                  value={albumTitle}
                  onChange={(e) => setAlbumTitle(e.target.value)}
                  placeholder="My awesome album"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="albumDesc">Description (optional)</Label>
                <Textarea
                  id="albumDesc"
                  value={albumDescription}
                  onChange={(e) => setAlbumDescription(e.target.value)}
                  placeholder="What's this album about?"
                  className="mt-1"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Public Album</p>
                  <p className="text-sm text-muted-foreground">Anyone can discover this album</p>
                </div>
                <Switch checked={albumIsPublic} onCheckedChange={setAlbumIsPublic} />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setMode("select")}>
                  Cancel
                </Button>
                <Button
                  variant="suise"
                  className="flex-1"
                  onClick={handleCreateAlbum}
                  disabled={loading || !albumTitle.trim()}
                >
                  {loading ? "Creating..." : "Create Album"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
