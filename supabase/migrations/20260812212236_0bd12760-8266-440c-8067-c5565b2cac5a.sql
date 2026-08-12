ALTER TABLE public.reward_events
ADD COLUMN IF NOT EXISTS action_key text;

CREATE UNIQUE INDEX IF NOT EXISTS reward_events_user_action_key_unique
ON public.reward_events (user_id, action_key)
WHERE action_key IS NOT NULL;

GRANT SELECT, INSERT ON public.reward_events TO authenticated;
GRANT ALL ON public.reward_events TO service_role;