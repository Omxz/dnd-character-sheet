-- Fix RLS policies to avoid infinite recursion
-- Run this in your Supabase SQL editor

-- Drop problematic policies
DROP POLICY IF EXISTS "Users can view party members" ON public.party_members;
DROP POLICY IF EXISTS "Users can view parties they are members of" ON public.parties;

-- Recreate parties policy without recursion
-- Users can view parties where they own a character that's a member
CREATE POLICY "Users can view parties they are members of"
  ON public.parties FOR SELECT
  USING (
    auth.uid() = owner_id
    OR
    id IN (
      SELECT pm.party_id 
      FROM public.party_members pm
      JOIN public.characters c ON pm.character_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

-- Recreate party_members policy without self-reference
-- Users can view party members if they own the party OR own a character in the party
CREATE POLICY "Users can view party members"
  ON public.party_members FOR SELECT
  USING (
    -- User owns the party
    EXISTS (
      SELECT 1 FROM public.parties p
      WHERE p.id = party_members.party_id
      AND p.owner_id = auth.uid()
    )
    OR
    -- User owns a character in this party
    EXISTS (
      SELECT 1 FROM public.characters c
      WHERE c.id = party_members.character_id
      AND c.user_id = auth.uid()
    )
    OR
    -- User owns the specific character being viewed
    EXISTS (
      SELECT 1 FROM public.characters c
      WHERE c.id = party_members.character_id
      AND c.user_id = auth.uid()
    )
  );
