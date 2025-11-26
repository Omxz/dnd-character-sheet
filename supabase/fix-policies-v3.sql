-- Fix ALL RLS policies to avoid infinite recursion
-- Run this in your Supabase SQL Editor

-- ============================================
-- DROP ALL EXISTING POLICIES
-- ============================================

-- Profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Characters
DROP POLICY IF EXISTS "Users can view their own characters" ON public.characters;
DROP POLICY IF EXISTS "Anyone can view public characters by share_id" ON public.characters;
DROP POLICY IF EXISTS "Party members can view characters in their party" ON public.characters;
DROP POLICY IF EXISTS "Users can insert their own characters" ON public.characters;
DROP POLICY IF EXISTS "Users can update their own characters" ON public.characters;
DROP POLICY IF EXISTS "Users can delete their own characters" ON public.characters;

-- Parties
DROP POLICY IF EXISTS "Users can view parties they own" ON public.parties;
DROP POLICY IF EXISTS "Users can view parties they are members of" ON public.parties;
DROP POLICY IF EXISTS "Users can view parties they own or are members of" ON public.parties;
DROP POLICY IF EXISTS "Anyone can view party by invite code" ON public.parties;
DROP POLICY IF EXISTS "Users can insert parties" ON public.parties;
DROP POLICY IF EXISTS "Users can insert their own parties" ON public.parties;
DROP POLICY IF EXISTS "Owners can update their parties" ON public.parties;
DROP POLICY IF EXISTS "Owners can delete their parties" ON public.parties;
DROP POLICY IF EXISTS "Authenticated users can view parties" ON public.parties;

-- Party members
DROP POLICY IF EXISTS "Users can view party members" ON public.party_members;
DROP POLICY IF EXISTS "Users can add their characters to parties" ON public.party_members;
DROP POLICY IF EXISTS "Users can add their own characters to parties" ON public.party_members;
DROP POLICY IF EXISTS "Users can remove their characters from parties" ON public.party_members;
DROP POLICY IF EXISTS "Users can remove their characters or party owners can remove anyone" ON public.party_members;
DROP POLICY IF EXISTS "Authenticated users can view party members" ON public.party_members;

-- ============================================
-- CREATE SIMPLE, NON-RECURSIVE POLICIES
-- ============================================

-- PROFILES: Simple user-owns-their-profile policies
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- CHARACTERS: Allow users to manage their own, allow all authenticated to read (for party viewing)
CREATE POLICY "characters_select_all"
  ON public.characters FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "characters_insert_own"
  ON public.characters FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "characters_update_own"
  ON public.characters FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "characters_delete_own"
  ON public.characters FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- PARTIES: Allow all authenticated to read (for join by invite code), restrict writes
CREATE POLICY "parties_select_all"
  ON public.parties FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "parties_insert_own"
  ON public.parties FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "parties_update_own"
  ON public.parties FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "parties_delete_own"
  ON public.parties FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- PARTY_MEMBERS: Allow all authenticated to read, restrict writes to character owners
CREATE POLICY "party_members_select_all"
  ON public.party_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "party_members_insert_own"
  ON public.party_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.characters c
      WHERE c.id = character_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "party_members_delete_own_or_owner"
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
