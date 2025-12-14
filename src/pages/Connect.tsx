import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useConnections } from "@/hooks/useConnections";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Check, X, Users, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export default function Connect() {
  const { user } = useAuth();
  const { connections, pendingRequests, acceptRequest, rejectRequest, loading, sendRequest, hasSentRequest, isConnected } = useConnections(user?.id);
  const navigate = useNavigate();
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user?.id) return;
      
      setLoadingUsers(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, bio")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        setAllUsers(data.filter((u) => u.id !== user?.id));
      }
      setLoadingUsers(false);
    };

    fetchUsers();
  }, [user?.id]);

  // Check connection status
  const getConnectionStatus = (userId: string) => {
    if (isConnected(userId)) return "connected";
    if (hasSentRequest(userId)) return "sent";
    
    const isPending = pendingRequests.some(
      (p) => p.requester_id === userId
    );
    if (isPending) return "pending";
    
    return "none";
  };

  const handleConnect = async (userId: string) => {
    await sendRequest(userId);
  };

  return (
    <DashboardLayout activeTab="connect" onTabChange={(tab) => navigate(`/${tab === "home" ? "" : tab}`)}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold font-bricolage mb-6">Connect</h1>

        <Tabs defaultValue="discover">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="discover" className="flex-1">
              <Search className="w-4 h-4 mr-2" />
              Discover
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
              <Users className="w-4 h-4 mr-2" />
              Friends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover">
            <div className="space-y-4">
              <h2 className="font-bold">People You May Know</h2>
              {loadingUsers ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-3 p-4 bg-muted rounded-2xl animate-pulse">
                      <div className="w-12 h-12 rounded-full bg-muted-foreground/20" />
                      <div className="flex-1">
                        <div className="h-4 bg-muted-foreground/20 rounded w-24 mb-2" />
                        <div className="h-3 bg-muted-foreground/20 rounded w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : allUsers.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-bold mb-2">No users yet</h3>
                  <p className="text-muted-foreground">Be the first to join the community!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allUsers.map((profile) => {
                    const status = getConnectionStatus(profile.id);
                    return (
                      <div
                        key={profile.id}
                        className="flex items-center gap-3 p-4 bg-card rounded-2xl"
                      >
                        <button onClick={() => navigate(`/@${profile.username}`)}>
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={profile.avatar_url || undefined} />
                            <AvatarFallback>
                              <User className="w-6 h-6" />
                            </AvatarFallback>
                          </Avatar>
                        </button>
                        <div className="flex-1 min-w-0">
                          <button 
                            onClick={() => navigate(`/@${profile.username}`)}
                            className="text-left"
                          >
                            <p className="font-medium truncate">{profile.display_name || profile.username}</p>
                            <p className="text-sm text-muted-foreground truncate">@{profile.username}</p>
                          </button>
                          {profile.bio && (
                            <p className="text-sm text-muted-foreground truncate mt-1">{profile.bio}</p>
                          )}
                        </div>
                        {status === "connected" ? (
                          <span className="text-sm text-muted-foreground px-3 py-1 bg-muted rounded-full">
                            Connected
                          </span>
                        ) : status === "sent" ? (
                          <span className="text-sm text-secondary px-3 py-1 bg-secondary/20 rounded-full">
                            Request Sent
                          </span>
                        ) : status === "pending" ? (
                          <span className="text-sm text-muted-foreground px-3 py-1 bg-muted rounded-full">
                            Pending
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="suise"
                            onClick={() => handleConnect(profile.id)}
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
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
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={request.requester?.avatar_url || undefined} />
                      <AvatarFallback>
                        <User className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>
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
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={friend?.avatar_url || undefined} />
                        <AvatarFallback>
                          <User className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>
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
         }  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, bio")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        setAllUsers(data.filter((u) => u.id !== user?.id));
      }
      setLoadingUsers(false);
    };

    if (user?.id) {
      fetchUsers();
    }
  }, [user?.id]);

  // Filter users based on search
  const filteredUsers = allUsers.filter((profile) => {
    const query = searchQuery.toLowerCase();
    return (
      profile.username?.toLowerCase().includes(query) ||
      profile.display_name?.toLowerCase().includes(query) ||
      profile.bio?.toLowerCase().includes(query)
    );
  });

  // Check connection status
  const getConnectionStatus = (userId: string) => {
    if (isConnected(userId)) return "connected";
    if (hasSentRequest(userId)) return "sent";
    
    const isPending = pendingRequests.some(
      (p) => p.requester_id === userId
    );
    if (isPending) return "pending";
    
    return "none";
  };

  const handleConnect = async (userId: string) => {
    await sendRequest(userId);
  };

  return (
    <DashboardLayout activeTab="connect" onTabChange={(tab) => navigate(`/${tab === "home" ? "" : tab}`)}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold font-bricolage mb-6">Connect</h1>

        <Tabs defaultValue="discover" className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="discover" className="flex-1">
              <Search className="w-4 h-4 mr-2" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex-1 relative">
              Requests
              {pendingRequests.length > 0 && (
                <span className="ml-2 bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full font-bold">
                  {pendingRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="connections" className="flex-1">
              <Users className="w-4 h-4 mr-2" />
              Friends ({connections.length})
            </TabsTrigger>
          </TabsList>

          {/* DISCOVER TAB */}
          <TabsContent value="discover" className="mt-0">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {loadingUsers ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-3 p-4 bg-card rounded-2xl animate-pulse">
                      <div className="w-12 h-12 rounded-full bg-muted" />
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-24 mb-2" />
                        <div className="h-3 bg-muted rounded w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-bold mb-2">
                    {searchQuery ? "No users found" : "No users yet"}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? "Try a different search term" : "Be the first to join the community!"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredUsers.map((profile) => {
                    const status = getConnectionStatus(profile.id);
                    return (
                      <div
                        key={profile.id}
                        className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border hover:border-secondary/50 transition-colors"
                      >
                        <button onClick={() => navigate(`/@${profile.username}`)}>
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={profile.avatar_url || undefined} />
                            <AvatarFallback className="bg-secondary/20">
                              <User className="w-6 h-6 text-secondary" />
                            </AvatarFallback>
                          </Avatar>
                        </button>
                        <div className="flex-1 min-w-0">
                          <button 
                            onClick={() => navigate(`/@${profile.username}`)}
                            className="text-left w-full"
                          >
                            <p className="font-bold truncate">{profile.display_name || profile.username}</p>
                            <p className="text-sm text-muted-foreground truncate">@{profile.username}</p>
                            {profile.bio && (
                              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{profile.bio}</p>
                            )}
                          </button>
                        </div>
                        {status === "connected" ? (
                          <Button size="sm" variant="outline" disabled>
                            <Check className="w-4 h-4 mr-2" />
                            Connected
                          </Button>
                        ) : status === "sent" ? (
                          <Button size="sm" variant="outline" disabled>
                            Request Sent
                          </Button>
                        ) : status === "pending" ? (
                          <Button size="sm" variant="outline" disabled>
                            Respond
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="suise"
                            onClick={() => handleConnect(profile.id)}
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* REQUESTS TAB */}
          <TabsContent value="requests" className="mt-0">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3 p-4 bg-card rounded-2xl animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-muted" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-24 mb-2" />
                      <div className="h-3 bg-muted rounded w-32" />
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
                    className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border"
                  >
                    <button onClick={() => navigate(`/@${request.requester?.username}`)}>
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={request.requester?.avatar_url || undefined} />
                        <AvatarFallback className="bg-secondary/20">
                          <User className="w-6 h-6 text-secondary" />
                        </AvatarFallback>
                      </Avatar>
                    </button>
                    <div className="flex-1 min-w-0">
                      <button 
                        onClick={() => navigate(`/@${request.requester?.username}`)}
                        className="text-left"
                      >
                        <p className="font-bold truncate">{request.requester?.display_name}</p>
                        <p className="text-sm text-muted-foreground truncate">@{request.requester?.username}</p>
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="suise"
                        onClick={() => acceptRequest(request.id)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
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

          {/* CONNECTIONS/FRIENDS TAB */}
          <TabsContent value="connections" className="mt-0">
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-3 p-4 bg-card rounded-2xl animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-muted" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-24 mb-2" />
                      <div className="h-3 bg-muted rounded w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : connections.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-bold mb-2">No connections yet</h3>
                <p className="text-muted-foreground mb-4">Explore and connect with others!</p>
                <Button variant="suise" onClick={() => navigate("/connect")}>
                  <Search className="w-4 h-4 mr-2" />
                  Discover People
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {connections.map((connection) => {
                  const friend =
                    connection.requester_id === user?.id
                      ? connection.addressee
                      : connection.requester;

                  return (
                    <div
                      key={connection.id}
                      className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border hover:border-secondary/50 transition-colors"
                    >
                      <button onClick={() => navigate(`/@${friend?.username}`)}>
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={friend?.avatar_url || undefined} />
                          <AvatarFallback className="bg-secondary/20">
                            <User className="w-6 h-6 text-secondary" />
                          </AvatarFallback>
                        </Avatar>
                      </button>
                      <button 
                        onClick={() => navigate(`/@${friend?.username}`)}
                        className="flex-1 text-left min-w-0"
                      >
                        <p className="font-bold truncate">{friend?.display_name}</p>
                        <p className="text-sm text-muted-foreground truncate">@{friend?.username}</p>
                      </button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/chat/${friend?.id}`)}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
  }      if (!error && data) {
        setAllUsers(data.filter((u) => u.id !== user?.id));
      }
      setLoadingUsers(false);
    };

    fetchUsers();
  }, [user?.id]);

  // Check connection status
  const getConnectionStatus = (userId: string) => {
    if (isConnected(userId)) return "connected";
    if (hasSentRequest(userId)) return "sent";
    
    const isPending = pendingRequests.some(
      (p) => p.requester_id === userId
    );
    if (isPending) return "pending";
    
    return "none";
  };

  const handleConnect = async (userId: string) => {
    await sendRequest(userId);
  };

  return (
    <DashboardLayout activeTab="connect" onTabChange={(tab) => navigate(`/${tab === "home" ? "" : tab}`)}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold font-bricolage mb-6">Connect</h1>

        <Tabs defaultValue="discover">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="discover" className="flex-1">
              <Search className="w-4 h-4 mr-2" />
              Discover
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

          <TabsContent value="discover">
            <div className="space-y-4">
              <h2 className="font-bold">People You May Know</h2>
              {loadingUsers ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-3 p-4 bg-muted rounded-2xl animate-pulse">
                      <div className="w-12 h-12 rounded-full bg-muted-foreground/20" />
                      <div className="flex-1">
                        <div className="h-4 bg-muted-foreground/20 rounded w-24 mb-2" />
                        <div className="h-3 bg-muted-foreground/20 rounded w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : allUsers.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-bold mb-2">No users yet</h3>
                  <p className="text-muted-foreground">Be the first to join the community!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allUsers.map((profile) => {
                    const status = getConnectionStatus(profile.id);
                    return (
                      <div
                        key={profile.id}
                        className="flex items-center gap-3 p-4 bg-card rounded-2xl"
                      >
                        <button onClick={() => navigate(`/${profile.username}`)}>
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={profile.avatar_url || undefined} />
                            <AvatarFallback>
                              <User className="w-6 h-6" />
                            </AvatarFallback>
                          </Avatar>
                        </button>
                        <div className="flex-1 min-w-0">
                          <button 
                            onClick={() => navigate(`/${profile.username}`)}
                            className="text-left"
                          >
                            <p className="font-medium truncate">{profile.display_name || profile.username}</p>
                            <p className="text-sm text-muted-foreground truncate">@{profile.username}</p>
                          </button>
                          {profile.bio && (
                            <p className="text-sm text-muted-foreground truncate mt-1">{profile.bio}</p>
                          )}
                        </div>
                        {status === "connected" ? (
                          <span className="text-sm text-muted-foreground px-3 py-1 bg-muted rounded-full">
                            Connected
                          </span>
                        ) : status === "sent" ? (
                          <span className="text-sm text-secondary px-3 py-1 bg-secondary/20 rounded-full">
                            Request Sent
                          </span>
                        ) : status === "pending" ? (
                          <span className="text-sm text-muted-foreground px-3 py-1 bg-muted rounded-full">
                            Pending
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="suise"
                            onClick={() => handleConnect(profile.id)}
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
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
                      onClick={() => navigate(`/${friend?.username}`)}
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
