import { useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { Bell, Heart, UserPlus, Image, Users, FolderHeart, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, refetch } = useNotifications(user?.id);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const getIcon = (type: string) => {
    switch (type) {
      case "love":
      case "album_love":
        return <Heart className="w-5 h-5 text-destructive fill-destructive" />;
      case "connection_request":
        return <UserPlus className="w-5 h-5 text-secondary" />;
      case "connection_accepted":
        return <Users className="w-5 h-5 text-green-500" />;
      case "memory":
      case "new_memory":
        return <Image className="w-5 h-5 text-accent" />;
      case "album_update":
        return <FolderHeart className="w-5 h-5 text-primary" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const handleNotificationClick = async (notification: any) => {
    await markAsRead(notification.id);

    // Navigate based on notification type
    if (notification.related_album_id) {
      navigate(`/album/${notification.related_album_id}`);
    } else if (notification.related_user_id && notification.type.includes("connection")) {
      navigate("/connect");
    } else if (notification.related_user_id) {
      // Navigate to user profile
      navigate(`/profile`);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout activeTab="notifications" onTabChange={(tab) => navigate(`/${tab === "home" ? "" : tab}`)}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-secondary" />
            <h1 className="text-2xl font-bold font-bricolage">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-secondary text-secondary-foreground text-sm px-3 py-1 rounded-full font-medium">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-muted-foreground">
              <Check className="w-4 h-4 mr-2" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-card border border-border">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
            <p className="text-muted-foreground max-w-sm">
              When someone loves your album or sends you a connection request, you'll see it here.
            </p>
          </div>
        )}

        {/* Notifications list */}
        {!loading && notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full text-left flex gap-4 p-4 rounded-2xl transition-all duration-200 hover:scale-[1.01] ${
                  !notification.read
                    ? "bg-secondary/10 border-2 border-secondary/30"
                    : "bg-card border border-border hover:bg-muted/50"
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                  !notification.read ? "bg-secondary/20" : "bg-muted"
                }`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-medium ${!notification.read ? "text-foreground" : "text-foreground/90"}`}>
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <span className="w-2 h-2 rounded-full bg-secondary shrink-0 mt-2" />
                    )}
                  </div>
                  {notification.message && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
