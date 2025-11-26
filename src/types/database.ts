// Database types for Supabase
// These match the SQL schema we'll create

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          sound_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          sound_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          sound_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      characters: {
        Row: {
          id: string;
          user_id: string;
          share_id: string;
          is_public: boolean;
          name: string;
          level: number;
          race_key: string;
          subrace_key: string | null;
          class_levels: ClassLevel[];
          background_key: string;
          ability_scores: AbilityScores;
          current_hp: number;
          max_hp: number;
          temp_hp: number;
          hit_dice_remaining: Json;
          spell_slots_remaining: Json;
          skill_proficiencies: string[];
          saving_throw_proficiencies: string[];
          tool_proficiencies: string[];
          languages: string[];
          feats: string[];
          spells_known: SpellsKnown;
          spells_prepared: string[];
          equipment: Equipment[];
          currency: Currency;
          personality_traits: string | null;
          ideals: string | null;
          bonds: string | null;
          flaws: string | null;
          backstory: string | null;
          notes: Json;
          conditions: string[];
          death_saves: DeathSaves;
          // New fields
          inspiration: boolean;
          exhaustion: number;
          xp: number;
          avatar_url: string | null;
          concentration_spell: string | null;
          class_feature_choices: ClassFeatureChoices;
          feature_uses: FeatureUses;
          appearance: CharacterAppearance;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          share_id?: string;
          is_public?: boolean;
          name: string;
          level?: number;
          race_key: string;
          subrace_key?: string | null;
          class_levels: ClassLevel[];
          background_key: string;
          ability_scores: AbilityScores;
          current_hp?: number;
          max_hp?: number;
          temp_hp?: number;
          hit_dice_remaining?: Json;
          spell_slots_remaining?: Json;
          skill_proficiencies?: string[];
          saving_throw_proficiencies?: string[];
          tool_proficiencies?: string[];
          languages?: string[];
          feats?: string[];
          spells_known?: SpellsKnown;
          spells_prepared?: string[];
          equipment?: Equipment[];
          currency?: Currency;
          personality_traits?: string | null;
          ideals?: string | null;
          bonds?: string | null;
          flaws?: string | null;
          backstory?: string | null;
          notes?: Json;
          conditions?: string[];
          death_saves?: DeathSaves;
          // New fields
          inspiration?: boolean;
          exhaustion?: number;
          xp?: number;
          avatar_url?: string | null;
          concentration_spell?: string | null;
          class_feature_choices?: ClassFeatureChoices;
          feature_uses?: FeatureUses;
          appearance?: CharacterAppearance;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          share_id?: string;
          is_public?: boolean;
          name?: string;
          level?: number;
          race_key?: string;
          subrace_key?: string | null;
          class_levels?: ClassLevel[];
          background_key?: string;
          ability_scores?: AbilityScores;
          current_hp?: number;
          max_hp?: number;
          temp_hp?: number;
          hit_dice_remaining?: Json;
          spell_slots_remaining?: Json;
          skill_proficiencies?: string[];
          saving_throw_proficiencies?: string[];
          tool_proficiencies?: string[];
          languages?: string[];
          feats?: string[];
          spells_known?: SpellsKnown;
          spells_prepared?: string[];
          equipment?: Equipment[];
          currency?: Currency;
          personality_traits?: string | null;
          ideals?: string | null;
          bonds?: string | null;
          flaws?: string | null;
          backstory?: string | null;
          notes?: Json;
          conditions?: string[];
          death_saves?: DeathSaves;
          // New fields
          inspiration?: boolean;
          exhaustion?: number;
          xp?: number;
          avatar_url?: string | null;
          concentration_spell?: string | null;
          class_feature_choices?: ClassFeatureChoices;
          feature_uses?: FeatureUses;
          appearance?: CharacterAppearance;
          created_at?: string;
          updated_at?: string;
        };
      };
      parties: {
        Row: {
          id: string;
          name: string;
          invite_code: string;
          owner_id: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          invite_code?: string;
          owner_id: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          invite_code?: string;
          owner_id?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      party_members: {
        Row: {
          id: string;
          party_id: string;
          character_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          party_id: string;
          character_id: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          party_id?: string;
          character_id?: string;
          joined_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Character = Database["public"]["Tables"]["characters"]["Row"];
export type Party = Database["public"]["Tables"]["parties"]["Row"];
export type PartyMember = Database["public"]["Tables"]["party_members"]["Row"];

// Character with parsed JSON types
export interface CharacterWithTypes extends Omit<Character, 'class_levels' | 'ability_scores' | 'hit_dice_remaining' | 'spell_slots_remaining' | 'spells_known' | 'equipment' | 'currency' | 'notes' | 'death_saves'> {
  class_levels: ClassLevel[];
  ability_scores: AbilityScores;
  hit_dice_remaining: HitDiceRemaining;
  spell_slots_remaining: SpellSlotsRemaining;
  spells_known: SpellsKnown;
  equipment: EquipmentItem[];
  currency: Currency;
  notes: Note[];
  death_saves: DeathSaves;
}

export interface ClassLevel {
  class: string; // "wizard|XPHB"
  level: number;
  subclass?: string; // "evocation|XPHB"
}

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface HitDiceRemaining {
  [hitDie: string]: number; // e.g., "d6": 5, "d10": 3
}

export interface SpellSlotsRemaining {
  [level: number]: number; // e.g., 1: 4, 2: 3, 3: 2
}

export interface SpellsKnown {
  cantrips: string[];
  spells: string[];
  spellbook?: string[]; // For wizards
}

export interface EquipmentItem {
  id: string;
  item_key: string; // "longsword|XPHB"
  quantity: number;
  equipped: boolean;
  attuned?: boolean;
  notes?: string;
}

export interface Currency {
  cp: number;
  sp: number;
  ep: number;
  gp: number;
  pp: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export interface DeathSaves {
  successes: number;
  failures: number;
}

// New types for comprehensive character management
export interface ClassFeatureChoices {
  fighting_style?: string;
  expertise?: string[];
  metamagic?: string[];
  eldritch_invocations?: string[];
  maneuvers?: string[];
  infusions?: string[];
  pact_boon?: string;
  divine_domain?: string;
  arcane_tradition?: string;
  [key: string]: string | string[] | undefined;
}

export interface FeatureUse {
  used: number;
  max: number;
}

export interface FeatureUses {
  [featureName: string]: FeatureUse;
}

export interface CharacterAppearance {
  age?: string;
  height?: string;
  weight?: string;
  eyes?: string;
  skin?: string;
  hair?: string;
}

// Equipment type for the Row (simpler version for JSON storage)
export interface Equipment {
  name: string;
  quantity: number;
  equipped?: boolean;
  attuned?: boolean;
}
