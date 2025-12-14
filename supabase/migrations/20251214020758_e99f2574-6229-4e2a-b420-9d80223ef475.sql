-- Add display_order column to memories for drag and drop reordering
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- Create index for efficient ordering
CREATE INDEX IF NOT EXISTS idx_memories_display_order ON public.memories(album_id, display_order);

-- Update existing memories to have sequential order based on created_at
WITH ordered_memories AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY album_id ORDER BY created_at) as new_order
  FROM memories
)
UPDATE memories 
SET display_order = ordered_memories.new_order
FROM ordered_memories 
WHERE memories.id = ordered_memories.id;