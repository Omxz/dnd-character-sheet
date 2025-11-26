// Shared types for character creation wizard
import type { AbilityScores, ClassLevel } from "@/types/database";

export interface CharacterData {
  name: string;
  race_key: string;
  subrace_key: string | null;
  class_levels: ClassLevel[];
  background_key: string;
  ability_scores: AbilityScores;
  skill_proficiencies: string[];
  saving_throw_proficiencies: string[];
  tool_proficiencies: string[];
  languages: string[];
  feats: string[];
  spells_known: {
    cantrips: string[];
    spells: string[];
    spellbook?: string[];
  };
  equipment: Array<{ item_key: string; quantity: number }>;
  personality_traits: string;
  ideals: string;
  bonds: string;
  flaws: string;
  backstory: string;
}

export interface StepProps {
  data: CharacterData;
  updateData: (updates: Partial<CharacterData>) => void;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
}
