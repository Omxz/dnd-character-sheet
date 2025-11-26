-- D&D Character Sheet Database Schema (Reset Version)
-- This will DROP and recreate all tables - USE WITH CAUTION
-- Run this in your Supabase SQL editor

-- Drop existing triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_parties_updated_at ON public.parties;
DROP TRIGGER IF EXISTS update_characters_updated_at ON public.characters;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Remove from realtime publication if exists (ignore errors if not in publication)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE public.characters;
EXCEPTION WHEN undefined_object THEN
  -- Table not in publication, ignore
END $$;

-- Drop existing tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS public.party_members CASCADE;
DROP TABLE IF EXISTS public.parties CASCADE;
DROP TABLE IF EXISTS public.characters CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  sound_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Characters table
CREATE TABLE public.characters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  share_id UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT false,
  
  -- Basic info
  name TEXT NOT NULL,
  level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 20),
  
  -- Core selections
  race_key TEXT NOT NULL,
  subrace_key TEXT,
  class_levels JSONB DEFAULT '[]'::jsonb NOT NULL,
  background_key TEXT NOT NULL,
  
  -- Ability scores
  ability_scores JSONB DEFAULT '{"strength": 10, "dexterity": 10, "constitution": 10, "intelligence": 10, "wisdom": 10, "charisma": 10}'::jsonb NOT NULL,
  
  -- Combat stats
  current_hp INTEGER DEFAULT 0,
  max_hp INTEGER DEFAULT 0,
  temp_hp INTEGER DEFAULT 0,
  hit_dice_remaining JSONB DEFAULT '{}'::jsonb,
  
  -- Spellcasting
  spell_slots_remaining JSONB DEFAULT '{}'::jsonb,
  spells_known JSONB DEFAULT '{"cantrips": [], "spells": []}'::jsonb,
  spells_prepared TEXT[] DEFAULT '{}',
  
  -- Proficiencies
  skill_proficiencies TEXT[] DEFAULT '{}',
  saving_throw_proficiencies TEXT[] DEFAULT '{}',
  tool_proficiencies TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{"Common"}',
  
  -- Features
  feats TEXT[] DEFAULT '{}',
  
  -- Inventory
  equipment JSONB DEFAULT '[]'::jsonb,
  currency JSONB DEFAULT '{"cp": 0, "sp": 0, "ep": 0, "gp": 0, "pp": 0}'::jsonb,
  
  -- Character details
  personality_traits TEXT,
  ideals TEXT,
  bonds TEXT,
  flaws TEXT,
  backstory TEXT,
  notes JSONB DEFAULT '[]'::jsonb,
  
  -- Combat state
  conditions TEXT[] DEFAULT '{}',
  death_saves JSONB DEFAULT '{"successes": 0, "failures": 0}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parties table
CREATE TABLE public.parties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Party members junction table
CREATE TABLE public.party_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  party_id UUID REFERENCES public.parties(id) ON DELETE CASCADE NOT NULL,
  character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(party_id, character_id)
);

-- Indexes for performance
CREATE INDEX idx_characters_user_id ON public.characters(user_id);
CREATE INDEX idx_characters_share_id ON public.characters(share_id);
CREATE INDEX idx_party_members_party_id ON public.party_members(party_id);
CREATE INDEX idx_party_members_character_id ON public.party_members(character_id);
CREATE INDEX idx_parties_invite_code ON public.parties(invite_code);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_characters_updated_at
  BEFORE UPDATE ON public.characters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parties_updated_at
  BEFORE UPDATE ON public.parties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_members ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Characters policies
CREATE POLICY "Users can view their own characters"
  ON public.characters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public characters by share_id"
  ON public.characters FOR SELECT
  USING (is_public = true);

CREATE POLICY "Party members can view characters in their party"
  ON public.characters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.party_members pm
      JOIN public.party_members my_pm ON pm.party_id = my_pm.party_id
      JOIN public.characters my_char ON my_pm.character_id = my_char.id
      WHERE pm.character_id = characters.id
      AND my_char.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own characters"
  ON public.characters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own characters"
  ON public.characters FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own characters"
  ON public.characters FOR DELETE
  USING (auth.uid() = user_id);

-- Parties policies
CREATE POLICY "Users can view parties they own or are members of"
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

CREATE POLICY "Anyone can view party by invite code"
  ON public.parties FOR SELECT
  USING (true);

CREATE POLICY "Users can insert parties"
  ON public.parties FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their parties"
  ON public.parties FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their parties"
  ON public.parties FOR DELETE
  USING (auth.uid() = owner_id);

-- Party members policies (avoid self-referencing to prevent infinite recursion)
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
    -- User owns the character being viewed
    EXISTS (
      SELECT 1 FROM public.characters c
      WHERE c.id = party_members.character_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add their characters to parties"
  ON public.party_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.characters c
      WHERE c.id = character_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove their characters from parties"
  ON public.party_members FOR DELETE
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

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Realtime for characters table (for party sync)
ALTER PUBLICATION supabase_realtime ADD TABLE public.characters;

-- Grant access to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create profiles for any existing users
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;
