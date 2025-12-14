-- Create album_follows table for following albums
CREATE TABLE IF NOT EXISTS public.album_follows (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id uuid NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(album_id, user_id)
);

-- Enable RLS
ALTER TABLE public.album_follows ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view album follows"
  ON public.album_follows FOR SELECT
  USING (true);

CREATE POLICY "Users can follow albums"
  ON public.album_follows FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unfollow albums"
  ON public.album_follows FOR DELETE
  USING (user_id = auth.uid());

-- Add follow_count column to albums
ALTER TABLE public.albums ADD COLUMN IF NOT EXISTS follow_count integer DEFAULT 0;

-- Enable realtime for albums table
ALTER PUBLICATION supabase_realtime ADD TABLE public.albums;
ALTER PUBLICATION supabase_realtime ADD TABLE public.album_follows;

-- Create trigger to notify followers when album changes
CREATE OR REPLACE FUNCTION public.notify_album_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  follower_record RECORD;
  notification_title text;
  notification_message text;
BEGIN
  -- Determine notification based on event
  IF TG_OP = 'UPDATE' THEN
    notification_title := 'Album Updated';
    notification_message := 'Album "' || NEW.title || '" has been updated';
  END IF;
  
  -- Notify all followers
  FOR follower_record IN 
    SELECT user_id FROM album_follows WHERE album_id = NEW.id AND user_id != NEW.owner_id
  LOOP
    INSERT INTO public.notifications (user_id, type, title, message, related_album_id, related_user_id)
    VALUES (
      follower_record.user_id,
      'album_update',
      notification_title,
      notification_message,
      NEW.id,
      NEW.owner_id
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger for album updates
DROP TRIGGER IF EXISTS on_album_update ON public.albums;
CREATE TRIGGER on_album_update
  AFTER UPDATE ON public.albums
  FOR EACH ROW
  WHEN (OLD.title IS DISTINCT FROM NEW.title OR OLD.description IS DISTINCT FROM NEW.description OR OLD.cover_image_url IS DISTINCT FROM NEW.cover_image_url)
  EXECUTE FUNCTION public.notify_album_update();

-- Notify when new memory is added to followed album
CREATE OR REPLACE FUNCTION public.notify_memory_added()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  follower_record RECORD;
  album_title text;
BEGIN
  -- Get album title
  SELECT title INTO album_title FROM albums WHERE id = NEW.album_id;
  
  -- Notify all followers
  FOR follower_record IN 
    SELECT user_id FROM album_follows WHERE album_id = NEW.album_id AND user_id != NEW.owner_id
  LOOP
    INSERT INTO public.notifications (user_id, type, title, message, related_album_id, related_user_id)
    VALUES (
      follower_record.user_id,
      'new_memory',
      'New Memory Added',
      'A new memory was added to "' || album_title || '"',
      NEW.album_id,
      NEW.owner_id
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_memory_added ON public.memories;
CREATE TRIGGER on_memory_added
  AFTER INSERT ON public.memories
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_memory_added();