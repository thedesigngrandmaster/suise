import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useWallet as useSuiWallet } from "@suiet/wallet-kit";
import { useWallet as usePhantomWallet } from "@solana/wallet-adapter-react";
import nacl from "tweetnacl";
import bs58 from "bs58";

interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  cover_photo_url: string | null;
  bio: string | null;
  wallet_address: string | null;
  streak_count: number;
  last_streak_date: string | null;
  is_public: boolean;
  show_email: boolean;
  show_wallet: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithSlush: () => Promise<void>;
  signInWithPhantom: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const suiWallet = useSuiWallet();
  const phantomWallet = usePhantomWallet();

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    return data;
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          setTimeout(() => {
            fetchProfile(newSession.user.id).then(setProfile);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      
      if (existingSession?.user) {
        fetchProfile(existingSession.user.id).then(setProfile);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) {
      toast.error("Failed to sign in with Google", { description: error.message });
      throw error;
    }
  };

  // ✅ Now using the hook declared at top level
  const signInWithSlush = async () => {
    await suiWallet.connect();
    const address = suiWallet.address;
    const message = "Sign in to Suise";

    const signature = await suiWallet.signMessage({
      message,
    });

   const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-slush`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address,
        message,
        signature,
      }),
    });

    const session = await res.json();

await supabase.auth.setSession(session);

    if (error) {
      toast.error("Failed to sign in with Slush", { description: error.message });
      throw error;
  };

  // ✅ Now using the hook declared at top level
  const signInWithPhantom = async () => {
    if (!phantomWallet.connected) {
      await phantomWallet.connect();
    }

    const publicKey = phantomWallet.publicKey!.toBase58();

    const { nonce } = await fetch("/api/auth/nonce").then(r => r.json());

    const message = new TextEncoder().encode(
      `Sign in to Suise\nNonce: ${nonce}`
    );

    const signature = await phantomWallet.signMessage!(message);

    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-phantom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publicKey,
        signature: Array.from(signature),
        nonce,
      }),
    });

    const session = await res.json();

await supabase.auth.setSession(session);

    if (error) {
      toast.error("Failed to sign in with Phantom", { description: error.message });
      throw error;
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error("Failed to sign in", { description: error.message });
      return { error };
    }
    toast.success("Welcome back!", { description: "Successfully signed in" });
    return { error: null };
  };

  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: displayName || email.split("@")[0],
        },
      },
    });
    if (error) {
      toast.error("Failed to sign up", { description: error.message });
      return { error };
    }
    toast.success("Welcome to Suise!", { description: "Account created successfully" });
    return { error: null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out", { description: error.message });
      throw error;
    }
    setProfile(null);
    toast.success("Signed out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signInWithGoogle, signInWithSlush, signInWithPhantom, signInWithEmail, signUpWithEmail, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
