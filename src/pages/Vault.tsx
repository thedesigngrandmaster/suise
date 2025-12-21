import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAlbumsContext } from "@/contexts/AlbumsContext";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadModal } from "@/components/UploadModal";
import { AlbumCard } from "@/components/AlbumCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Vault() {
  const { user } = useAuth();
  const { albums, loading, deleteAlbum } = useAlbumsContext();
  const [uploadOpen, setUploadOpen] = useState(false);
  const navigate = useNavigate();

  // Debug logs
  useEffect(() => {
    console.log('Vault - user:', user);
    console.log('Vault - albums:', albums);
    console.log('Vault - loading:', loading);
  }, [user, albums, loading]);

  const handleNewAlbum = () => {
    console.log("Opening upload modal");
    setUploadOpen(true);
  };

  return (
    <DashboardLayout activeTab="vault" onTabChange={(tab) => navigate(`/${tab === "home" ? "" : tab}`)}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-bricolage">Your Vault</h1>
            <p className="text-muted-foreground">Your private memories organized by albums</p>
          </div>
          <Button variant="suise" onClick={handleNewAlbum}>
            <Plus className="w-4 h-4 mr-2" />
            New Album
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : albums.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 bg-secondary/20 rounded-full flex items-center justify-center">
              <Plus className="w-12 h-12 text-secondary" />
            </div>
            <h3 className="text-lg font-bold mb-2">No albums yet</h3>
            <p className="text-muted-foreground mb-4">Create your first album to start saving memories</p>
            <Button variant="suise" onClick={handleNewAlbum}>
              Create Album
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {albums.length} {albums.length === 1 ? 'album' : 'albums'}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {albums.map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  onClick={() => navigate(`/album/${album.id}`)}
                  onDelete={() => deleteAlbum(album.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <UploadModal 
        key={uploadOpen ? 'open' : 'closed'}
        isOpen={uploadOpen} 
        onClose={() => {
          console.log("Closing upload modal");
          setUploadOpen(false);
        }} 
      />
    </DashboardLayout>
  );
}
