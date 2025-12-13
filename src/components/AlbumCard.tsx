import { Heart, Eye, MoreHorizontal, Trash2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Album } from "@/hooks/useAlbums";

interface AlbumCardProps {
  album: Album;
  onClick?: () => void;
  onDelete?: () => void;
  showOwner?: boolean;
}

export function AlbumCard({ album, onClick, onDelete, showOwner }: AlbumCardProps) {
  return (
    <div className="group relative">
      <button
        onClick={onClick}
        className="w-full aspect-square rounded-2xl overflow-hidden bg-muted relative"
      >
        {album.cover_image_url ? (
          <img
            src={album.cover_image_url}
            alt={album.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-secondary/30 to-primary/30 flex items-center justify-center">
            <span className="text-4xl">📷</span>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Stats */}
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="font-bold truncate">{album.title}</p>
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" /> {album.love_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {album.view_count || 0}
            </span>
          </div>
        </div>
      </button>

      {/* Owner info */}
      {showOwner && album.owner && (
        <div className="flex items-center gap-2 mt-2">
          {album.owner.avatar_url ? (
            <img
              src={album.owner.avatar_url}
              alt=""
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
              <User className="w-3 h-3 text-secondary" />
            </div>
          )}
          <span className="text-sm text-muted-foreground truncate">
            @{album.owner.username}
          </span>
        </div>
      )}

      {/* Actions */}
      {onDelete && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 hover:bg-background/80"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
