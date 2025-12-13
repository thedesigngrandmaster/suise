-- Create a security definer function to fetch profile by username (bypasses RLS for lookup)
CREATE OR REPLACE FUNCTION public.get_profile_by_username(p_username text)
RETURNS TABLE (
  id uuid,
  username text,
  display_name text,
  email text,
  avatar_url text,
  cover_photo_url text,
  bio text,
  wallet_address text,
  streak_count integer,
  is_public boolean,
  show_email boolean,
  show_wallet boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    username,
    display_name,
    email,
    avatar_url,
    cover_photo_url,
    bio,
    wallet_address,
    streak_count,
    is_public,
    show_email,
    show_wallet
  FROM public.profiles
  WHERE LOWER(profiles.username) = LOWER(p_username)
  LIMIT 1;
$$;