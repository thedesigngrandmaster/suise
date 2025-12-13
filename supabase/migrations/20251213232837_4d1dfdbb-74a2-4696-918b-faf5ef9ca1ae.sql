-- Add cover_photo_url column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cover_photo_url text;

-- Create storage bucket for cover photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for cover photos bucket
CREATE POLICY "Users can upload their own cover"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'covers' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own cover"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'covers' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own cover"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'covers' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Covers are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'covers');

-- Create function to notify on new connection request
CREATE OR REPLACE FUNCTION public.notify_connection_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requester_name text;
BEGIN
  SELECT COALESCE(display_name, username) INTO requester_name
  FROM public.profiles WHERE id = NEW.requester_id;
  
  INSERT INTO public.notifications (user_id, type, title, message, related_user_id)
  VALUES (
    NEW.addressee_id,
    'connection_request',
    'New Connection Request',
    requester_name || ' wants to connect with you',
    NEW.requester_id
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for connection requests
DROP TRIGGER IF EXISTS on_connection_request ON public.connections;
CREATE TRIGGER on_connection_request
  AFTER INSERT ON public.connections
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION public.notify_connection_request();

-- Create function to notify on connection accepted
CREATE OR REPLACE FUNCTION public.notify_connection_accepted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  accepter_name text;
BEGIN
  IF OLD.status = 'pending' AND NEW.status = 'accepted' THEN
    SELECT COALESCE(display_name, username) INTO accepter_name
    FROM public.profiles WHERE id = NEW.addressee_id;
    
    INSERT INTO public.notifications (user_id, type, title, message, related_user_id)
    VALUES (
      NEW.requester_id,
      'connection_accepted',
      'Connection Accepted',
      accepter_name || ' accepted your connection request',
      NEW.addressee_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for connection accepted
DROP TRIGGER IF EXISTS on_connection_accepted ON public.connections;
CREATE TRIGGER on_connection_accepted
  AFTER UPDATE ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_connection_accepted();

-- Create function to notify on album love
CREATE OR REPLACE FUNCTION public.notify_album_love()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lover_name text;
  album_title text;
  album_owner_id uuid;
BEGIN
  -- Get the lover's name
  SELECT COALESCE(display_name, username) INTO lover_name
  FROM public.profiles WHERE id = NEW.user_id;
  
  -- Get the album info
  SELECT title, owner_id INTO album_title, album_owner_id
  FROM public.albums WHERE id = NEW.album_id;
  
  -- Don't notify if user loves their own album
  IF NEW.user_id != album_owner_id THEN
    INSERT INTO public.notifications (user_id, type, title, message, related_user_id, related_album_id)
    VALUES (
      album_owner_id,
      'album_love',
      'Someone loved your album!',
      lover_name || ' loved your album "' || album_title || '"',
      NEW.user_id,
      NEW.album_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for album loves
DROP TRIGGER IF EXISTS on_album_love ON public.album_loves;
CREATE TRIGGER on_album_love
  AFTER INSERT ON public.album_loves
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_album_love();