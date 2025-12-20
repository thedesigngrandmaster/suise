-- Add is_bot column to profiles to track bot accounts
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_bot boolean DEFAULT false;

-- Create bot_albums table to track scheduled album content
CREATE TABLE IF NOT EXISTS public.bot_album_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  cover_image_url text,
  memory_urls text[] NOT NULL,
  memory_captions text[],
  scheduled_for timestamp with time zone NOT NULL,
  published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on bot_album_queue (only system can access)
ALTER TABLE public.bot_album_queue ENABLE ROW LEVEL SECURITY;

-- Policy to allow select for authenticated users (to check published albums)
CREATE POLICY "Anyone can view published queue items" ON public.bot_album_queue
  FOR SELECT USING (published = true);

-- Create index for scheduled publishing
CREATE INDEX IF NOT EXISTS idx_bot_album_queue_scheduled ON public.bot_album_queue(scheduled_for, published);