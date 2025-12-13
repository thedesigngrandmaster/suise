import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UpdateProfileData {
  username?: string;
  display_name?: string;
  bio?: string;
  is_public?: boolean;
  show_email?: boolean;
  show_wallet?: boolean;
}

export function useProfile() {
  const [updating, setUpdating] = useState(false);

  const updateProfile = async (userId: string, data: UpdateProfileData) => {
    setUpdating(true);
    const { error } = await supabase
      .from("profiles")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", userId);

    setUpdating(false);
    if (error) {
      toast.error("Failed to update profile", { description: error.message });
      return { error };
    }
    toast.success("Profile updated!");
    return { error: null };
  };

  const getProfileByUsername = async (username: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    return data;
  };

  const checkUsernameAvailable = async (username: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username.toLowerCase())
      .maybeSingle();

    return !data;
  };

  return {
    updateProfile,
    getProfileByUsername,
    checkUsernameAvailable,
    updating,
  };
}
