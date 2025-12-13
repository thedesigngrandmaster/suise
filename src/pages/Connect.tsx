import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useConnections } from "@/hooks/useConnections";
import { useAlbums } from "@/hooks/useAlbums";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Check, X, TrendingUp } from "lucide-react";
import { AlbumCard } from "@/components/AlbumCard";

export default function Connect() {
  const { user } = useAuth();
  const { connections, pendingRequests, acceptRequest, rejectRequest, loading } = useConnections(user?.id);
  const { fetchPublicAlbums, albums } = useAlbums();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublicAlbums(20);
  }, []);

  const topAlbums = albums.sort((a, b) => (b.love_count || 0) - (a.love_count || 0)).slice(0, 10);

  return (
    <DashboardLayout activeTab="connect" onTabChange={(tab) => navigate(`/${tab === "home" ? "" : tab}`)}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold font-bricolage mb-6">Connect</h1>

        <Tabs defaultValue="trending">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="trending" className="flex-1">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex-1">
              Requests
              {pendingRequests.length > 0 && (
                <span className="ml-2 bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full">
                  {pendingRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="connections" className="flex-1">
              Friends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trending">
            <div className="space-y-4">
              <h2 className="font-bold">Top Albums This Week</h2>
              <div className="grid grid-cols-2 gap-4">
                {topAlbums.map((album) => (
                  <AlbumCard
                    key={album.id}
                    album={album}
                    onClick={() => navigate(`/album/${album.id}`)}
                    showOwner
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="requests">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3 p-4 bg-muted rounded-2xl animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-muted-foreground/20" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted-foreground/20 rounded w-24 mb-2" />
                      <div className="h-3 bg-muted-foreground/20 rounded w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-16">
                <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-bold mb-2">No pending requests</h3>
                <p className="text-muted-foreground">When someone wants to connect, they'll appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center gap-3 p-4 bg-card rounded-2xl"
                  >
                    {request.requester?.avatar_url ? (
                      <img
                        src={request.requester.avatar_url}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-secondary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{request.requester?.display_name}</p>
                      <p className="text-sm text-muted-foreground">@{request.requester?.username}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="suise"
                        onClick={() => acceptRequest(request.id)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => rejectRequest(request.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="connections">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-3 p-4 bg-muted rounded-2xl animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-muted-foreground/20" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted-foreground/20 rounded w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : connections.length === 0 ? (
              <div className="text-center py-16">
                <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-bold mb-2">No connections yet</h3>
                <p className="text-muted-foreground">Explore and connect with others!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {connections.map((connection) => {
                  const friend =
                    connection.requester_id === user?.id
                      ? connection.addressee
                      : connection.requester;

                  return (
                    <button
                      key={connection.id}
                      onClick={() => navigate(`/@${friend?.username}`)}
                      className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl hover:bg-muted transition-colors text-left"
                    >
                      {friend?.avatar_url ? (
                        <img
                          src={friend.avatar_url}
                          alt=""
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                          <User className="w-6 h-6 text-secondary" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{friend?.display_name}</p>
                        <p className="text-sm text-muted-foreground">@{friend?.username}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
