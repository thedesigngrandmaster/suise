import { Skeleton } from "@/components/ui/skeleton";

export function AlbumCardSkeleton() {
  return (
    <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden animate-pulse">
      <Skeleton className="w-full h-full" />
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Cover Photo */}
      <Skeleton className="w-full h-48 rounded-none" />
      
      {/* Avatar */}
      <div className="relative -mt-16 px-4">
        <Skeleton className="w-32 h-32 rounded-full border-4 border-background" />
      </div>
      
      {/* Info */}
      <div className="px-4 mt-4 space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}

export function MessageThreadSkeleton() {
  return (
    <div className="flex gap-3 p-4 bg-muted rounded-2xl animate-pulse">
      <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  );
}

export function ChatMessageSkeleton({ isOwn }: { isOwn?: boolean }) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-pulse`}>
      <div className={`max-w-[80%] space-y-2 ${isOwn ? "items-end" : "items-start"}`}>
        <Skeleton className={`h-12 w-48 rounded-2xl ${isOwn ? "bg-secondary/30" : ""}`} />
        <Skeleton className="h-2 w-16" />
      </div>
    </div>
  );
}

export function UserCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 bg-card rounded-2xl animate-pulse">
      <Skeleton className="w-14 h-14 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-9 w-24 rounded-full" />
    </div>
  );
}

export function NotificationSkeleton() {
  return (
    <div className="flex gap-3 p-4 animate-pulse">
      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <Skeleton className="h-8 w-48" />
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-card rounded-xl">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
