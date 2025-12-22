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
  push_notifications_enabled?: boolean;
  email_notifications_enabled?: boolean;
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
      .rpc("get_profile_by_username", { p_username: username });

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    // RPC returns an array, get first item
    return data && data.length > 0 ? data[0] : null;
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
