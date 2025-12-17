import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useWallet as useSuiWallet } from "@suiet/wallet-kit";
import { useWallet as usePhantomWallet } from "@solana/wallet-adapter-react";

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
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    return data;
  };

  const refreshProfile = async () => {
    if (!user) return;
    const profileData = await fetchProfile(user.id);
    setProfile(profileData);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          fetchProfile(newSession.user.id).then(setProfile);
        } else {
          setProfile(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        fetchProfile(data.session.user.id).then(setProfile);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });

    if (error) {
      toast.error("Google sign-in failed", { description: error.message });
      throw error;
    }
  };

  const signInWithSlush = async () => {
    await suiWallet.connect();

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-slush`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          address: suiWallet.address,
          message: "Sign in to Suise",
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      toast.error("Slush login failed", { description: err });
      throw new Error(err);
    }

    const session = await res.json();
    await supabase.auth.setSession(session);
  };

  const signInWithPhantom = async () => {
    if (!phantomWallet.connected) {
      await phantomWallet.connect();
    }

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-phantom`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          publicKey: phantomWallet.publicKey?.toBase58(),
          message: "Sign in to Suise",
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      toast.error("Phantom login failed", { description: err });
      throw new Error(err);
    }

    const session = await res.json();
    await supabase.auth.setSession(session);
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error("Sign-in failed", { description: error.message });
      return { error };
    }
    return { error: null };
  };

  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: displayName },
      },
    });

    if (error) {
      toast.error("Sign-up failed", { description: error.message });
      return { error };
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signInWithGoogle,
        signInWithSlush,
        signInWithPhantom,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        refreshProfile,
      }}
    >
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