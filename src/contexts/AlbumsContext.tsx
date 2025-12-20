import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAlbums, Album } from "@/hooks/useAlbums";

interface AlbumsContextType {
  albums: Album[];
  loading: boolean;
  createAlbum: (data: {
    title: string;
    description?: string;
    is_public?: boolean;
    cover_image_url?: string;
  }) => Promise<{ album?: Album; error: Error | null }>;
  updateAlbum: (albumId: string, data: {
    title?: string;
    description?: string;
    is_public?: boolean;
    cover_image_url?: string;
  }) => Promise<{ error: Error | null }>;
  deleteAlbum: (albumId: string) => Promise<{ error: Error | null }>;
  refetch: () => Promise<void>;
}

const AlbumsContext = createContext<AlbumsContextType | undefined>(undefined);

export function AlbumsProvider({ children }: { children: ReactNode }) {
  // CRITICAL FIX: Get user from useAuth
  const { user } = useAuth();
  
  // CRITICAL FIX: Pass user?.id to useAlbums
  const {
    albums,
    loading,
    createAlbum,
    updateAlbum,
    deleteAlbum,
    fetchUserAlbums,
  } = useAlbums(user?.id);

  // Debug log
  console.log('AlbumsContext - user?.id:', user?.id);

  return (
    <AlbumsContext.Provider
      value={{
        albums,
        loading,
        createAlbum,
        updateAlbum,
        deleteAlbum,
        refetch: fetchUserAlbums,
      }}
    >
      {children}
    </AlbumsContext.Provider>
  );
}

export function useAlbumsContext() {
  const context = useContext(AlbumsContext);
  if (context === undefined) {
    throw new Error("useAlbumsContext must be used within AlbumsProvider");
  }
  return context;
}
