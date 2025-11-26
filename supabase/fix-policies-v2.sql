-- Fix ALL RLS policies to avoid infinite recursion
-- Run this in your Supabase SQL Editor

-- Drop ALL existing policies on parties and party_members
DROP POLICY IF EXISTS "Users can view parties they own" ON public.parties;
DROP POLICY IF EXISTS "Users can view parties they are members of" ON public.parties;
DROP POLICY IF EXISTS "Users can view parties they own or are members of" ON public.parties;
DROP POLICY IF EXISTS "Anyone can view party by invite code" ON public.parties;
DROP POLICY IF EXISTS "Users can insert parties" ON public.parties;
DROP POLICY IF EXISTS "Owners can update their parties" ON public.parties;
DROP POLICY IF EXISTS "Owners can delete their parties" ON public.parties;

DROP POLICY IF EXISTS "Users can view party members" ON public.party_members;
DROP POLICY IF EXISTS "Users can add their characters to parties" ON public.party_members;
DROP POLICY IF EXISTS "Users can remove their characters from parties" ON public.party_members;

-- SIMPLE APPROACH: Allow all authenticated users to read parties/party_members
-- Security is handled by the app logic, not RLS for reads

-- Parties: Anyone authenticated can view all parties (they need to see them to join)
CREATE POLICY "Authenticated users can view parties"
  ON public.parties FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own parties"
  ON public.parties FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their parties"
  ON public.parties FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their parties"
  ON public.parties FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Party members: Anyone authenticated can view (needed to show party member lists)
CREATE POLICY "Authenticated users can view party members"
  ON public.party_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can add their own characters to parties"
  ON public.party_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.characters c
      WHERE c.id = character_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove their characters or party owners can remove anyone"
  ON public.party_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.characters c
      WHERE c.id = character_id
      AND c.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.parties p
      WHERE p.id = party_id
      AND p.owner_id = auth.uid()
    )
  );
