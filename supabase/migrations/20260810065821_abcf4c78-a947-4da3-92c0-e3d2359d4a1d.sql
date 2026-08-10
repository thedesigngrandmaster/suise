CREATE TABLE public.ownership_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note TEXT,
  tx_digest TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.ownership_transfers TO authenticated;
GRANT ALL ON public.ownership_transfers TO service_role;
ALTER TABLE public.ownership_transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view transfers" ON public.ownership_transfers FOR SELECT TO authenticated USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "Owners can create transfers" ON public.ownership_transfers FOR INSERT TO authenticated WITH CHECK (auth.uid() = from_user_id AND EXISTS (SELECT 1 FROM public.albums a WHERE a.id = album_id AND a.owner_id = auth.uid()));
CREATE POLICY "Participants can update transfers" ON public.ownership_transfers FOR UPDATE TO authenticated USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE TABLE public.reward_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.reward_events TO authenticated;
GRANT ALL ON public.reward_events TO service_role;
ALTER TABLE public.reward_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own rewards" ON public.reward_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users add own rewards" ON public.reward_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_reward_events_user ON public.reward_events(user_id, created_at DESC);
CREATE INDEX idx_ownership_transfers_album ON public.ownership_transfers(album_id);