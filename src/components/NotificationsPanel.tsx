import { useEffect } from "react";
import { X, Bell, Heart, UserPlus, Image } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, refetch } = useNotifications(user?.id);

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen]);

  const getIcon = (type: string) => {
    switch (type) {
      case "love":
        return <Heart className="w-4 h-4 text-destructive" />;
      case "connection":
        return <UserPlus className="w-4 h-4 text-secondary" />;
      case "memory":
        return <Image className="w-4 h-4 text-accent" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 lg:bg-transparent lg:backdrop-blur-none">
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-card shadow-lg lg:top-16 lg:right-4 lg:h-auto lg:max-h-[80vh] lg:rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <h2 className="font-bold font-bricolage">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(100vh-80px)] lg:max-h-[60vh]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <ul>
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`p-4 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer ${
                    !notification.read ? "bg-secondary/5" : ""
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{notification.title}</p>
                      {notification.message && (
                        <p className="text-sm text-muted-foreground truncate">
                          {notification.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-secondary" />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
