import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  Heart, 
  UserPlus, 
  Check, 
  ImagePlus, 
  Edit, 
  Users,
  X 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const notificationIcons = {
  connection_request: UserPlus,
  connection_accepted: Check,
  album_love: Heart,
  album_update: Edit,
  new_memory: ImagePlus,
  new_user: Users,
};

export function NotificationsPanel() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(user?.id);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.type === "connection_request" || notification.type === "connection_accepted") {
      navigate("/connect");
    } else if (notification.related_album_id) {
      navigate(`/album/${notification.related_album_id}`);
    } else if (notification.related_user_id) {
      // Navigate to user profile
      navigate(`/profile/${notification.related_user_id}`);
    }
    
    setOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    const Icon = notificationIcons[type as keyof typeof notificationIcons] || Bell;
    return Icon;
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 sm:w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                markAllAsRead();
              }}
              className="h-auto p-1 text-xs"
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-1 p-1">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg transition-colors hover:bg-muted",
                      !notification.read && "bg-secondary/10"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                        !notification.read ? "bg-secondary/20" : "bg-muted"
                      )}>
                        <Icon className={cn(
                          "w-5 h-5",
                          !notification.read ? "text-secondary" : "text-muted-foreground"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn(
                            "font-medium text-sm",
                            !notification.read && "text-secondary"
                          )}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-secondary flex-shrink-0 mt-1" />
                          )}
                        </div>
                        {notification.message && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                navigate("/notifications");
                setOpen(false);
              }}
              className="cursor-pointer justify-center"
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
