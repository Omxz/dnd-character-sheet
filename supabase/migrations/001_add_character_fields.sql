-- Migration: Add comprehensive character fields
-- Run this in your Supabase SQL Editor

-- Add new columns to characters table
ALTER TABLE public.characters 
ADD COLUMN IF NOT EXISTS inspiration BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS exhaustion INTEGER DEFAULT 0 CHECK (exhaustion >= 0 AND exhaustion <= 6),
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS concentration_spell TEXT,
ADD COLUMN IF NOT EXISTS class_feature_choices JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS feature_uses JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS appearance JSONB DEFAULT '{}'::jsonb;

-- Add comment explaining the JSONB structures
COMMENT ON COLUMN public.characters.class_feature_choices IS 
'Stores class feature choices like Fighting Style, Expertise, Metamagic, etc.
Example: {"fighting_style": "defense", "expertise": ["stealth", "perception"], "metamagic": ["quickened", "twinned"]}';

COMMENT ON COLUMN public.characters.feature_uses IS 
'Tracks usage of limited-use features
Example: {"rage": {"used": 1, "max": 3}, "channel_divinity": {"used": 0, "max": 1}, "bardic_inspiration": {"used": 2, "max": 4}}';

COMMENT ON COLUMN public.characters.appearance IS 
'Character physical appearance details
Example: {"age": "25", "height": "5''10\"", "weight": "180 lbs", "eyes": "Blue", "skin": "Fair", "hair": "Brown"}';

COMMENT ON COLUMN public.characters.class_levels IS 
'Class progression with subclass support. Updated format:
Example: [{"class": "fighter|xphb", "subclass": "champion|xphb", "level": 5}, {"class": "rogue|xphb", "subclass": null, "level": 2}]';

-- Update existing class_levels to new format (add subclass field if missing)
UPDATE public.characters 
SET class_levels = (
  SELECT jsonb_agg(
    CASE 
      WHEN elem ? 'subclass' THEN elem
      ELSE elem || '{"subclass": null}'::jsonb
    END
  )
  FROM jsonb_array_elements(class_levels) elem
)
WHERE class_levels IS NOT NULL 
  AND jsonb_array_length(class_levels) > 0
  AND NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(class_levels) elem WHERE elem ? 'subclass'
  );

-- Create index for faster avatar lookups (for party display)
CREATE INDEX IF NOT EXISTS idx_characters_avatar ON public.characters(avatar_url) WHERE avatar_url IS NOT NULL;

-- ============================================
-- Storage bucket for avatars
-- ============================================

-- Note: Storage bucket creation must be done via Supabase Dashboard or API
-- Go to Storage in Supabase Dashboard and create a bucket named 'avatars'
-- Then run the following policies:

-- Storage RLS Policies (run after creating the bucket)
-- These allow users to upload/manage their own character avatars

/*
-- Policy: Users can upload avatars
CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own avatars
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own avatars
CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Anyone can view avatars (for party members)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');
*/
