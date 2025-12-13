-- Create a security definer function to check if user is album owner or co-owner
CREATE OR REPLACE FUNCTION public.is_album_owner_or_coowner(album_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM albums WHERE id = album_id AND owner_id = user_id
  ) OR EXISTS (
    SELECT 1 FROM album_co_owners WHERE album_co_owners.album_id = $1 AND album_co_owners.user_id = $2
  )
$$;

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Public albums viewable by everyone" ON albums;
DROP POLICY IF EXISTS "Owners and co-owners can update albums" ON albums;

-- Recreate policies using the security definer function
CREATE POLICY "Public albums viewable by everyone" 
ON albums FOR SELECT 
USING (
  is_public = true 
  OR owner_id = auth.uid() 
  OR public.is_album_owner_or_coowner(id, auth.uid())
);

CREATE POLICY "Owners and co-owners can update albums" 
ON albums FOR UPDATE 
USING (
  owner_id = auth.uid() 
  OR public.is_album_owner_or_coowner(id, auth.uid())
);