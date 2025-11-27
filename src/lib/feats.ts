// Feat utilities for D&D 2024 Player's Handbook
import { getFeats as loadFeats } from "@/lib/data/loader";
import type { Character } from "@/types/database";

// Feat data structure from 5etools
export interface FeatData {
  name: string;
  source: string;
  category: string; // "G" = General, "O" = Origin, "FS" = Fighting Style, "EB" = Epic Boon
  prerequisite?: Array<{
    level?: number;
    ability?: Array<Record<string, number>>; // e.g., [{ "cha": 13 }]
    feature?: string[]; // e.g., ["Fighting Style"]
    proficiency?: Array<{ [key: string]: string[] }>;
    race?: Array<{ name: string }>;
    otherSummary?: string;
  }>;
  ability?: Array<
    | {
        str?: number;
        dex?: number;
        con?: number;
        int?: number;
        wis?: number;
        cha?: number;
        choose?: {
          from: string[];
          amount?: number; // Amount to add (e.g., 2)
          count?: number; // Number of abilities to choose (e.g., 2)
        };
        hidden?: boolean;
      }
  >;
  repeatable?: boolean;
  repeatableHidden?: boolean;
  entries: unknown[];
}

// Category labels
export const FEAT_CATEGORIES: Record<string, string> = {
  G: "General",
  O: "Origin",
  FS: "Fighting Style",
  EB: "Epic Boon",
};

/**
 * Get all feats from 5etools data
 */
export function getFeats(): FeatData[] {
  const rawFeats = loadFeats();
  // Fix category type - loader says array but data is string
  return rawFeats.map(feat => ({
    ...feat,
    category: Array.isArray(feat.category)
      ? (feat.category[0] as string)
      : ((feat.category || "G") as string),
  })) as FeatData[];
}

/**
 * Get a single feat by name key (lowercase, spaces to dashes)
 */
export function getFeat(key: string): FeatData | undefined {
  const feats = getFeats();
  const name = key
    .split("|")[0] // Remove source suffix if present
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

  return feats.find(
    (f) => f.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === name
  );
}

/**
 * Get feat by exact name
 */
export function getFeatByName(name: string): FeatData | undefined {
  const feats = getFeats();
  return feats.find((f) => f.name.toLowerCase() === name.toLowerCase());
}

/**
 * Get feats by category
 */
export function getFeatsByCategory(category: string): FeatData[] {
  const feats = getFeats();
  return feats.filter((f) => f.category === category);
}

/**
 * Check if a character meets the prerequisites for a feat
 */
export function checkPrerequisites(
  feat: FeatData,
  character: {
    level: number;
    ability_scores: {
      strength: number;
      dexterity: number;
      constitution: number;
      intelligence: number;
      wisdom: number;
      charisma: number;
    };
    feats?: string[];
    class_levels?: Array<{ class: string; level: number }>;
  }
): { valid: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (!feat.prerequisite || feat.prerequisite.length === 0) {
    return { valid: true, reasons: [] };
  }

  for (const prereq of feat.prerequisite) {
    // Check level requirement
    if (prereq.level && character.level < prereq.level) {
      reasons.push(`Requires level ${prereq.level} (you are level ${character.level})`);
    }

    // Check ability score requirements
    if (prereq.ability && prereq.ability.length > 0) {
      const abilityMap: Record<string, keyof typeof character.ability_scores> = {
        str: "strength",
        dex: "dexterity",
        con: "constitution",
        int: "intelligence",
        wis: "wisdom",
        cha: "charisma",
      };

      for (const abilityReq of prereq.ability) {
        for (const [abbr, required] of Object.entries(abilityReq)) {
          const abilityName = abilityMap[abbr];
          if (abilityName) {
            const score = character.ability_scores[abilityName];
            if (score < required) {
              const fullName = abilityName.charAt(0).toUpperCase() + abilityName.slice(1);
              reasons.push(`Requires ${fullName} ${required} (you have ${score})`);
            }
          }
        }
      }
    }

    // Check feature requirements (e.g., "Fighting Style")
    if (prereq.feature && prereq.feature.length > 0) {
      reasons.push(`Requires: ${prereq.feature.join(", ")}`);
    }

    // Check other prerequisites
    if (prereq.otherSummary) {
      reasons.push(prereq.otherSummary);
    }
  }

  return {
    valid: reasons.length === 0,
    reasons,
  };
}

/**
 * Format feat prerequisites as a readable string
 */
export function formatFeatPrerequisites(feat: FeatData): string {
  if (!feat.prerequisite || feat.prerequisite.length === 0) {
    return "None";
  }

  const parts: string[] = [];

  for (const prereq of feat.prerequisite) {
    const prereqParts: string[] = [];

    if (prereq.level) {
      prereqParts.push(`Level ${prereq.level}`);
    }

    if (prereq.ability && prereq.ability.length > 0) {
      const abilityReqs = prereq.ability.map((abilityReq) => {
        return Object.entries(abilityReq)
          .map(([abbr, required]) => `${abbr.toUpperCase()} ${required}`)
          .join(" or ");
      });
      prereqParts.push(...abilityReqs);
    }

    if (prereq.feature) {
      prereqParts.push(...prereq.feature);
    }

    if (prereq.otherSummary) {
      prereqParts.push(prereq.otherSummary);
    }

    if (prereqParts.length > 0) {
      parts.push(prereqParts.join(", "));
    }
  }

  return parts.join(" or ");
}

/**
 * Apply feat ability score bonuses to character
 */
export function applyFeatAbilityBonus(
  feat: FeatData,
  currentScores: Character["ability_scores"]
): Character["ability_scores"] {
  if (!feat.ability || feat.ability.length === 0) {
    return currentScores;
  }

  const updated = { ...currentScores };
  const abilityMap: Record<string, keyof typeof updated> = {
    str: "strength",
    dex: "dexterity",
    con: "constitution",
    int: "intelligence",
    wis: "wisdom",
    cha: "charisma",
  };

  for (const abilityBonus of feat.ability) {
    // Skip bonuses marked as hidden (they're for the ASI feat's built-in bonus)
    if (abilityBonus.hidden) {
      continue;
    }

    // Apply fixed ability score increases
    for (const [abbr, increase] of Object.entries(abilityBonus)) {
      if (abbr === "choose" || abbr === "hidden") continue;

      const abilityName = abilityMap[abbr];
      if (abilityName && typeof increase === "number") {
        updated[abilityName] = Math.min(20, updated[abilityName] + increase);
      }
    }
  }

  return updated;
}

/**
 * Check if a feat has choosable ability score increases
 */
export function featHasChoosableAbility(feat: FeatData): boolean {
  if (!feat.ability || feat.ability.length === 0) {
    return false;
  }

  return feat.ability.some((ab) => ab.choose !== undefined && !ab.hidden);
}

/**
 * Get the choosable ability options for a feat
 */
export function getFeatChoosableAbilities(feat: FeatData): {
  from: string[];
  amount?: number;
  count?: number;
} | null {
  if (!feat.ability) return null;

  for (const abilityBonus of feat.ability) {
    if (abilityBonus.choose && !abilityBonus.hidden) {
      return abilityBonus.choose;
    }
  }

  return null;
}

/**
 * Search feats by name
 */
export function searchFeats(query: string): FeatData[] {
  if (!query || query.trim().length === 0) {
    return getFeats();
  }

  const lowercaseQuery = query.toLowerCase();
  const feats = getFeats();

  return feats.filter((feat) =>
    feat.name.toLowerCase().includes(lowercaseQuery)
  );
}

/**
 * Check if a feat is repeatable
 */
export function isFeatRepeatable(feat: FeatData): boolean {
  return feat.repeatable === true;
}

/**
 * Get feat category label
 */
export function getFeatCategoryLabel(category: string): string {
  return FEAT_CATEGORIES[category] || "Unknown";
}

/**
 * Create a feat key for storage (name + source)
 */
export function createFeatKey(feat: FeatData): string {
  return `${feat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}|${feat.source}`;
}

/**
 * Parse feat key back to name
 */
export function parseFeatKey(key: string): { name: string; source: string } {
  const [nameSlug, source] = key.split("|");
  const name = nameSlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return { name, source: source || "XPHB" };
}
