-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  wallet_address TEXT,
  streak_count INTEGER DEFAULT 0,
  last_streak_date DATE,
  is_public BOOLEAN DEFAULT true,
  show_email BOOLEAN DEFAULT false,
  show_wallet BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create albums table
CREATE TABLE public.albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  is_public BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  love_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create album co-owners table
CREATE TABLE public.album_co_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(album_id, user_id)
);

-- Create memories table
CREATE TABLE public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  is_public BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  love_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create album loves table
CREATE TABLE public.album_loves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(album_id, user_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT false,
  related_user_id UUID REFERENCES public.profiles(id),
  related_album_id UUID REFERENCES public.albums(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create connections/friends table
CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id)
);

-- Create messages/chat table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create streaks history table
CREATE TABLE public.streak_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  memory_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_co_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_loves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_history ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (is_public = true OR auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Albums policies
CREATE POLICY "Public albums viewable by everyone" ON public.albums
  FOR SELECT USING (is_public = true OR owner_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.album_co_owners WHERE album_id = albums.id AND user_id = auth.uid()));

CREATE POLICY "Users can create albums" ON public.albums
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners and co-owners can update albums" ON public.albums
  FOR UPDATE USING (owner_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.album_co_owners WHERE album_id = albums.id AND user_id = auth.uid()));

CREATE POLICY "Owners can delete albums" ON public.albums
  FOR DELETE USING (owner_id = auth.uid());

-- Album co-owners policies
CREATE POLICY "Co-owners viewable by album owner and co-owners" ON public.album_co_owners
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.albums WHERE id = album_id AND owner_id = auth.uid()) OR
    user_id = auth.uid()
  );

CREATE POLICY "Album owners can add co-owners" ON public.album_co_owners
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.albums WHERE id = album_id AND owner_id = auth.uid())
  );

CREATE POLICY "Album owners can remove co-owners" ON public.album_co_owners
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.albums WHERE id = album_id AND owner_id = auth.uid())
  );

-- Memories policies
CREATE POLICY "Public memories viewable by everyone" ON public.memories
  FOR SELECT USING (is_public = true OR owner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.album_co_owners WHERE album_id = memories.album_id AND user_id = auth.uid()));

CREATE POLICY "Users can create memories" ON public.memories
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update memories" ON public.memories
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete memories" ON public.memories
  FOR DELETE USING (owner_id = auth.uid());

-- Album loves policies
CREATE POLICY "Loves viewable by everyone" ON public.album_loves
  FOR SELECT USING (true);

CREATE POLICY "Users can add loves" ON public.album_loves
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove own loves" ON public.album_loves
  FOR DELETE USING (user_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Connections policies
CREATE POLICY "Users can view own connections" ON public.connections
  FOR SELECT USING (requester_id = auth.uid() OR addressee_id = auth.uid());

CREATE POLICY "Users can create connection requests" ON public.connections
  FOR INSERT WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update connections they're part of" ON public.connections
  FOR UPDATE USING (addressee_id = auth.uid());

CREATE POLICY "Users can delete own connection requests" ON public.connections
  FOR DELETE USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update own messages" ON public.messages
  FOR UPDATE USING (receiver_id = auth.uid());

-- Streak history policies
CREATE POLICY "Users can view own streak history" ON public.streak_history
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own streak history" ON public.streak_history
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), ' ', '_')) || '_' || substr(NEW.id::text, 1, 4)
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update streak
CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_last_date DATE;
  v_current_streak INTEGER;
  v_today DATE := CURRENT_DATE;
BEGIN
  SELECT last_streak_date, streak_count INTO v_last_date, v_current_streak
  FROM public.profiles WHERE id = p_user_id;
  
  IF v_last_date IS NULL OR v_last_date < v_today - INTERVAL '1 day' THEN
    v_current_streak := 1;
  ELSIF v_last_date = v_today - INTERVAL '1 day' THEN
    v_current_streak := COALESCE(v_current_streak, 0) + 1;
  END IF;
  
  UPDATE public.profiles 
  SET streak_count = v_current_streak, last_streak_date = v_today, updated_at = NOW()
  WHERE id = p_user_id;
  
  INSERT INTO public.streak_history (user_id, date)
  VALUES (p_user_id, v_today)
  ON CONFLICT (user_id, date) DO UPDATE SET memory_count = streak_history.memory_count + 1;
  
  RETURN v_current_streak;
END;
$$;

-- Create storage bucket for memories
INSERT INTO storage.buckets (id, name, public) VALUES ('memories', 'memories', true);

-- Storage policies
CREATE POLICY "Anyone can view public memories" ON storage.objects
  FOR SELECT USING (bucket_id = 'memories');

CREATE POLICY "Authenticated users can upload memories" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'memories' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own memories" ON storage.objects
  FOR UPDATE USING (bucket_id = 'memories' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own memories" ON storage.objects
  FOR DELETE USING (bucket_id = 'memories' AND auth.uid()::text = (storage.foldername(name))[1]);