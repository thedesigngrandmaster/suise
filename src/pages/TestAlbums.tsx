import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useNavigate } from "react-router-dom";

export default function TestAlbums() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [albums, setAlbums] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testFetch = async () => {
      console.log('=== ALBUM FETCH TEST ===');
      console.log('Current user:', user);
      
      try {
        // Test 1: Fetch all public albums (simple query)
        console.log('Test 1: Simple query...');
        const { data: simpleData, error: simpleError } = await supabase
          .from("albums")
          .select("*")
          .eq("is_public", true)
          .limit(5);

        console.log('Simple query result:', simpleData);
        console.log('Simple query error:', simpleError);

        if (simpleError) {
          setError(`Simple query failed: ${simpleError.message}`);
          setLoading(false);
          return;
        }

        // Test 2: Fetch with owner info
        console.log('Test 2: Query with owner...');
        const { data: withOwner, error: ownerError } = await supabase
          .from("albums")
          .select(`
            *,
            owner:profiles!albums_owner_id_fkey(id, username, display_name, avatar_url)
          `)
          .eq("is_public", true)
          .limit(5);

        console.log('With owner result:', withOwner);
        console.log('With owner error:', ownerError);

        if (ownerError) {
          setError(`Owner query failed: ${ownerError.message}`);
          setLoading(false);
          return;
        }

        // Test 3: Full query with memories
        console.log('Test 3: Full query...');
        const { data: fullData, error: fullError } = await supabase
          .from("albums")
          .select(`
            *,
            owner:profiles!albums_owner_id_fkey(id, username, display_name, avatar_url, wallet_address),
            memories(image_url, display_order)
          `)
          .eq("is_public", true)
          .order("love_count", { ascending: false })
          .limit(5);

        console.log('Full query result:', fullData);
        console.log('Full query error:', fullError);

        if (fullError) {
          setError(`Full query failed: ${fullError.message}`);
        } else {
          setAlbums(fullData || []);
        }

      } catch (err: any) {
        console.error('Exception:', err);
        setError(`Exception: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    testFetch();
  }, [user]);

  return (
    <DashboardLayout activeTab="explore" onTabChange={(tab) => navigate(`/${tab === "home" ? "" : tab}`)}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Album Fetch Test</h1>
        
        <div className="bg-card p-4 rounded-lg mb-6">
          <h2 className="font-bold mb-2">User Info:</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        {loading && (
          <div className="text-center py-8">
            <p>Loading...</p>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
            <h2 className="font-bold mb-2">Error:</h2>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="bg-card p-4 rounded-lg">
            <h2 className="font-bold mb-2">Albums Found: {albums.length}</h2>
            <pre className="text-xs overflow-auto max-h-96">
              {JSON.stringify(albums, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 flex gap-4">
          <Button onClick={() => navigate("/explore")}>
            Go to Explore
          </Button>
          <Button onClick={() => window.location.reload()}>
            Refresh Test
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
