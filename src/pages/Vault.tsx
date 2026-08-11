import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAlbumsContext } from "@/contexts/AlbumsContext";
import { Plus, Globe, Lock, FolderHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadModal } from "@/components/UploadModal";
import { AlbumCard } from "@/components/AlbumCard";
import { TransferOwnershipDialog } from "@/components/TransferOwnershipDialog";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

type Filter = "all" | "private" | "public";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "private", label: "Private" },
  { id: "public", label: "Public" },
];

const EMPTY_COPY: Record<Filter, { title: string; body: string }> = {
  all: {
    title: "No folders yet",
    body: "Create your first folder and start keeping memories safe.",
  },
  private: {
    title: "Nothing private yet",
    body: "Private folders are visible only to you and the people you invite.",
  },
  public: {
    title: "Nothing public yet",
    body: "Make a folder public to share it on Explore and let others follow along.",
  },
};

export default function Vault() {
  const { albums, loading, refetch } = useAlbumsContext();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [transferAlbum, setTransferAlbum] = useState<{ id: string; title: string } | null>(null);
  const navigate = useNavigate();

  const counts = useMemo(
    () => ({
      all: albums.length,
      private: albums.filter((a) => !a.is_public).length,
      public: albums.filter((a) => a.is_public).length,
    }),
    [albums]
  );

  const visible = useMemo(() => {
    if (filter === "private") return albums.filter((a) => !a.is_public);
    if (filter === "public") return albums.filter((a) => a.is_public);
    return albums;
  }, [albums, filter]);

  const empty = EMPTY_COPY[filter];

  return (
    <DashboardLayout activeTab="vault" onTabChange={(tab) => navigate(`/${tab === "home" ? "" : tab}`)}>
      <div className="w-full max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
          <div>
            <h1 className="text-2xl font-bold font-bricolage">Your Vault</h1>
            <p className="text-sm text-muted-foreground">
              Folders you own, private by default.
            </p>
          </div>
          <Button variant="suise" onClick={() => setUploadOpen(true)} className="shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            New folder
          </Button>
        </div>

        {/* Visibility chips */}
        <div
          role="tablist"
          aria-label="Filter folders by visibility"
          className="flex items-center gap-2 mb-5 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1"
        >
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all",
                  active
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted"
                )}
              >
                {f.id === "public" && <Globe className="w-3.5 h-3.5" />}
                {f.id === "private" && <Lock className="w-3.5 h-3.5" />}
                {f.label}
                <span className={cn("tabular-nums", active ? "opacity-80" : "opacity-60")}>
                  {counts[f.id]}
                </span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-square bg-muted rounded-3xl animate-pulse" />
                <div className="h-3 w-2/3 bg-muted rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="soft-card text-center py-14 px-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-secondary/12 rounded-3xl flex items-center justify-center">
              <FolderHeart className="w-9 h-9 text-secondary" />
            </div>
            <h3 className="text-lg font-bold mb-1">{empty.title}</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">{empty.body}</p>
            <Button variant="suise" onClick={() => setUploadOpen(true)}>
              Create a folder
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-3">
              {visible.length} {visible.length === 1 ? "folder" : "folders"}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {visible.map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  showVisibility
                  onClick={() => navigate(`/album/${album.id}`)}
                  onTransfer={() => setTransferAlbum({ id: album.id, title: album.title })}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <UploadModal
        key={uploadOpen ? "open" : "closed"}
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
      />

      {transferAlbum && (
        <TransferOwnershipDialog
          open={!!transferAlbum}
          onOpenChange={(open) => !open && setTransferAlbum(null)}
          album={transferAlbum}
          onTransferred={() => refetch?.()}
        />
      )}
    </DashboardLayout>
  );
}
