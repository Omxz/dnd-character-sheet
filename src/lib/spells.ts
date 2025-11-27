// Spell Data System
// Loads and parses spell data from 5etools format

import spellsData from "@/data/5etools/spells-xphb.json";
import { getSpellNamesForClass } from "./class-spell-lists";

// ============================================
// TYPES
// ============================================

export interface SpellData {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  duration: string;
  components: {
    verbal: boolean;
    somatic: boolean;
    material: boolean;
    materialComponent?: string;
  };
  concentration: boolean;
  ritual: boolean;
  description: string;
  atHigherLevels?: string;
  damage?: {
    type: string;
    dice: string;
    scaling?: Record<number, string>;
  };
  healing?: {
    dice: string;
    scaling?: Record<number, string>;
  };
  savingThrow?: string;
  attackType?: "melee" | "ranged";
  classes: string[];
  source: string;
}

// ============================================
// SCHOOL MAPPINGS
// ============================================

const SCHOOL_MAP: Record<string, string> = {
  A: "Abjuration",
  C: "Conjuration",
  D: "Divination",
  E: "Enchantment",
  V: "Evocation",
  I: "Illusion",
  N: "Necromancy",
  T: "Transmutation",
};

// ============================================
// PARSING HELPERS
// ============================================

function parseTime(time: { number: number; unit: string }[]): string {
  if (!time || time.length === 0) return "1 action";
  const t = time[0];
  if (t.unit === "action") return `${t.number} action${t.number > 1 ? "s" : ""}`;
  if (t.unit === "bonus") return "1 bonus action";
  if (t.unit === "reaction") return "1 reaction";
  if (t.unit === "minute") return `${t.number} minute${t.number > 1 ? "s" : ""}`;
  if (t.unit === "hour") return `${t.number} hour${t.number > 1 ? "s" : ""}`;
  return `${t.number} ${t.unit}`;
}

function parseRange(range: { type: string; distance?: { type: string; amount?: number } }): string {
  if (!range) return "Self";
  if (range.type === "point") {
    if (range.distance?.type === "self") return "Self";
    if (range.distance?.type === "touch") return "Touch";
    if (range.distance?.type === "sight") return "Sight";
    if (range.distance?.type === "unlimited") return "Unlimited";
    if (range.distance?.amount) {
      return `${range.distance.amount} ${range.distance.type}`;
    }
  }
  if (range.type === "radius") {
    return `Self (${range.distance?.amount} ft radius)`;
  }
  if (range.type === "sphere") {
    return `Self (${range.distance?.amount} ft sphere)`;
  }
  if (range.type === "cone") {
    return `Self (${range.distance?.amount} ft cone)`;
  }
  if (range.type === "line") {
    return `Self (${range.distance?.amount} ft line)`;
  }
  if (range.type === "cube") {
    return `Self (${range.distance?.amount} ft cube)`;
  }
  return "Self";
}

function parseDuration(duration: { type: string; duration?: { type: string; amount?: number }; concentration?: boolean }[]): { text: string; concentration: boolean } {
  if (!duration || duration.length === 0) return { text: "Instantaneous", concentration: false };
  const d = duration[0];
  const concentration = d.concentration || false;
  
  if (d.type === "instant") return { text: "Instantaneous", concentration };
  if (d.type === "permanent") return { text: "Until dispelled", concentration };
  if (d.type === "special") return { text: "Special", concentration };
  if (d.type === "timed" && d.duration) {
    const amount = d.duration.amount || 1;
    const unit = d.duration.type;
    let text = "";
    if (unit === "round") text = `${amount} round${amount > 1 ? "s" : ""}`;
    else if (unit === "minute") text = `${amount} minute${amount > 1 ? "s" : ""}`;
    else if (unit === "hour") text = `${amount} hour${amount > 1 ? "s" : ""}`;
    else if (unit === "day") text = `${amount} day${amount > 1 ? "s" : ""}`;
    else text = `${amount} ${unit}`;
    return { text: concentration ? `Concentration, up to ${text}` : text, concentration };
  }
  return { text: "Instantaneous", concentration };
}

function parseComponents(comp: { v?: boolean; s?: boolean; m?: string | boolean }): {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  materialComponent?: string;
} {
  return {
    verbal: comp?.v || false,
    somatic: comp?.s || false,
    material: !!comp?.m,
    materialComponent: typeof comp?.m === "string" ? comp.m : undefined,
  };
}

// Parse 5etools text format with tags like {@damage 1d6}, {@dice 2d8+4}, etc.
function parseEntryText(entry: unknown): string {
  if (typeof entry === "string") {
    // Remove 5etools tags but keep the content
    return entry
      .replace(/{@damage ([^}]+)}/g, "$1")
      .replace(/{@dice ([^}]+)}/g, "$1")
      .replace(/{@scaledamage ([^|]+)\|[^|]*\|([^}]+)}/g, "$2")
      .replace(/{@scaledice ([^|]+)\|[^|]*\|([^}]+)}/g, "$2")
      .replace(/{@condition ([^}]+)}/g, "$1")
      .replace(/{@creature ([^}|]+)[^}]*}/g, "$1")
      .replace(/{@spell ([^}]+)}/g, "$1")
      .replace(/{@item ([^}|]+)[^}]*}/g, "$1")
      .replace(/{@sense ([^}]+)}/g, "$1")
      .replace(/{@skill ([^}]+)}/g, "$1")
      .replace(/{@action ([^}|]+)[^}]*}/g, "$1")
      .replace(/{@status ([^}]+)}/g, "$1")
      .replace(/{@variantrule ([^|]+)[^}]*}/g, "$1")
      .replace(/{@b ([^}]+)}/g, "$1")
      .replace(/{@i ([^}]+)}/g, "$1")
      .replace(/{@filter ([^|]+)[^}]*}/g, "$1")
      .replace(/{@classFeature ([^|]+)[^}]*}/g, "$1")
      .replace(/{@subclassFeature ([^|]+)[^}]*}/g, "$1")
      .replace(/{@hazard ([^}]+)}/g, "$1")
      .replace(/{@area ([^}|]+)[^}]*}/g, "$1")
      .replace(/{@note ([^}]+)}/g, "($1)")
      .replace(/{@dc ([^}]+)}/g, "DC $1")
      .replace(/{@hit ([^}]+)}/g, "+$1")
      .replace(/{@atk mw}/g, "Melee Weapon Attack")
      .replace(/{@atk rw}/g, "Ranged Weapon Attack")
      .replace(/{@atk ms}/g, "Melee Spell Attack")
      .replace(/{@atk rs}/g, "Ranged Spell Attack")
      .replace(/{@h}/g, "Hit: ")
      .replace(/{@recharge}/g, "(Recharge)")
      .replace(/{@recharge (\d)}/g, "(Recharge $1-6)");
  }
  
  if (typeof entry === "object" && entry !== null) {
    // Handle list entries
    if ("type" in entry && (entry as { type: string }).type === "list") {
      const listEntry = entry as { items?: unknown[] };
      return (listEntry.items || []).map(item => `• ${parseEntryText(item)}`).join("\n");
    }
    
    // Handle table entries
    if ("type" in entry && (entry as { type: string }).type === "table") {
      return "[Table - see full description]";
    }
    
    // Handle entries with nested entries
    if ("entries" in entry) {
      const nestedEntry = entry as { name?: string; entries: unknown[] };
      const prefix = nestedEntry.name ? `**${nestedEntry.name}:** ` : "";
      return prefix + nestedEntry.entries.map(e => parseEntryText(e)).join(" ");
    }
    
    // Handle inset entries
    if ("type" in entry && (entry as { type: string }).type === "inset") {
      const insetEntry = entry as { name?: string; entries?: unknown[] };
      const prefix = insetEntry.name ? `${insetEntry.name}: ` : "";
      return prefix + (insetEntry.entries || []).map(e => parseEntryText(e)).join(" ");
    }
  }
  
  return String(entry);
}

function parseEntries(entries: unknown[]): string {
  if (!entries || !Array.isArray(entries)) return "";
  return entries.map(e => parseEntryText(e)).join("\n\n");
}

function parseHigherLevels(entriesHigherLevel: { entries: unknown[] }[] | undefined): string | undefined {
  if (!entriesHigherLevel || entriesHigherLevel.length === 0) return undefined;
  const hlEntry = entriesHigherLevel[0];
  if (hlEntry.entries) {
    return parseEntries(hlEntry.entries);
  }
  return undefined;
}

function parseDamage(spell: RawSpell): SpellData["damage"] | undefined {
  if (!spell.damageInflict || spell.damageInflict.length === 0) return undefined;
  
  const damageType = spell.damageInflict[0];
  
  // Try to get damage from scalingLevelDice
  if (spell.scalingLevelDice) {
    const scaling = spell.scalingLevelDice.scaling || {};
    const firstDice = Object.values(scaling)[0];
    return {
      type: damageType,
      dice: firstDice || "1d6",
      scaling: scaling as Record<number, string>,
    };
  }
  
  // Try to extract from entries
  const entriesText = parseEntries(spell.entries || []);
  const diceMatch = entriesText.match(/(\d+d\d+(?:\s*\+\s*\d+)?)/);
  if (diceMatch) {
    return {
      type: damageType,
      dice: diceMatch[1],
    };
  }
  
  return {
    type: damageType,
    dice: "varies",
  };
}

function parseHealing(spell: RawSpell): SpellData["healing"] | undefined {
  if (!spell.miscTags?.includes("HL")) return undefined;
  
  const entriesText = parseEntries(spell.entries || []);
  const diceMatch = entriesText.match(/(\d+d\d+(?:\s*\+\s*\d+)?)/);
  
  if (diceMatch) {
    return {
      dice: diceMatch[1],
    };
  }
  
  return undefined;
}

// ============================================
// RAW SPELL TYPE (from JSON)
// ============================================

interface RawSpell {
  name: string;
  source: string;
  level: number;
  school: string;
  time?: { number: number; unit: string }[];
  range?: { type: string; distance?: { type: string; amount?: number } };
  components?: { v?: boolean; s?: boolean; m?: string | boolean };
  duration?: { type: string; duration?: { type: string; amount?: number }; concentration?: boolean }[];
  entries?: unknown[];
  entriesHigherLevel?: { entries: unknown[] }[];
  meta?: { ritual?: boolean };
  damageInflict?: string[];
  savingThrow?: string[];
  spellAttack?: string[];
  scalingLevelDice?: { label?: string; scaling?: Record<string, string> };
  miscTags?: string[];
  classes?: { fromClassList?: { name: string; source: string }[] };
}

// ============================================
// MAIN PARSING FUNCTION
// ============================================

function parseSpell(raw: RawSpell): SpellData {
  const durationInfo = parseDuration(raw.duration || []);
  const components = parseComponents(raw.components || {});
  
  // Extract classes
  const classes: string[] = [];
  if (raw.classes?.fromClassList) {
    for (const c of raw.classes.fromClassList) {
      classes.push(c.name.toLowerCase());
    }
  }
  
  return {
    name: raw.name,
    level: raw.level,
    school: SCHOOL_MAP[raw.school] || raw.school,
    castingTime: parseTime(raw.time || []),
    range: parseRange(raw.range || { type: "point", distance: { type: "self" } }),
    duration: durationInfo.text,
    components,
    concentration: durationInfo.concentration,
    ritual: raw.meta?.ritual || false,
    description: parseEntries(raw.entries || []),
    atHigherLevels: parseHigherLevels(raw.entriesHigherLevel),
    damage: parseDamage(raw),
    healing: parseHealing(raw),
    savingThrow: raw.savingThrow?.[0],
    attackType: raw.spellAttack?.includes("M") ? "melee" : raw.spellAttack?.includes("R") ? "ranged" : undefined,
    classes,
    source: raw.source,
  };
}

// ============================================
// SPELL CACHE
// ============================================

let spellCache: Map<string, SpellData> | null = null;

function buildSpellCache(): Map<string, SpellData> {
  if (spellCache) return spellCache;
  
  spellCache = new Map();
  const rawSpells = (spellsData as { spell: RawSpell[] }).spell || [];
  
  for (const raw of rawSpells) {
    const parsed = parseSpell(raw);
    // Store by lowercase name for easy lookup
    spellCache.set(parsed.name.toLowerCase(), parsed);
    // Also store with source key format
    const sourceKey = `${parsed.name.toLowerCase()}|${raw.source.toLowerCase()}`;
    spellCache.set(sourceKey, parsed);
  }
  
  return spellCache;
}

// ============================================
// PUBLIC API
// ============================================

/**
 * Get a spell by name (or name|source key)
 */
export function getSpell(nameOrKey: string): SpellData | undefined {
  const cache = buildSpellCache();
  const key = nameOrKey.toLowerCase().split("|")[0]; // Remove source suffix if present
  return cache.get(key);
}

/**
 * Get all spells
 */
export function getAllSpells(): SpellData[] {
  const cache = buildSpellCache();
  // Filter to avoid duplicates (we store by name and name|source)
  const seen = new Set<string>();
  const result: SpellData[] = [];
  
  for (const [key, spell] of cache) {
    if (!key.includes("|") && !seen.has(spell.name)) {
      seen.add(spell.name);
      result.push(spell);
    }
  }
  
  return result;
}

/**
 * Get spells for a specific class
 */
export function getSpellsForClass(className: string): SpellData[] {
  const classSpellNames = getSpellNamesForClass(className);
  return getAllSpells().filter(s => classSpellNames.has(s.name.toLowerCase()));
}

/**
 * Get spells by level
 */
export function getSpellsByLevel(level: number): SpellData[] {
  return getAllSpells().filter(s => s.level === level);
}

/**
 * Get cantrips
 */
export function getCantrips(): SpellData[] {
  return getSpellsByLevel(0);
}

/**
 * Format components for display
 */
export function formatComponents(components: SpellData["components"]): string[] {
  const result: string[] = [];
  if (components.verbal) result.push("V");
  if (components.somatic) result.push("S");
  if (components.material) {
    result.push(components.materialComponent ? `M (${components.materialComponent})` : "M");
  }
  return result;
}

/**
 * Get damage at a specific character/spell level (for cantrip scaling)
 */
export function getDamageAtLevel(spell: SpellData, characterLevel: number): string {
  if (!spell.damage) return "";
  
  if (spell.damage.scaling && spell.level === 0) {
    // Cantrip scaling
    const levels = Object.keys(spell.damage.scaling).map(Number).sort((a, b) => b - a);
    for (const lvl of levels) {
      if (characterLevel >= lvl) {
        return spell.damage.scaling[lvl];
      }
    }
  }
  
  return spell.damage.dice;
}

/**
 * Get damage when upcasting a spell
 */
export function getDamageAtSlotLevel(spell: SpellData, slotLevel: number): string {
  if (!spell.damage) return "";
  
  // For spells with scaling per slot level
  if (spell.atHigherLevels && spell.damage.dice) {
    const baseLevel = spell.level;
    const levelsAbove = slotLevel - baseLevel;
    
    // Try to extract the per-level scaling from atHigherLevels
    const perLevelMatch = spell.atHigherLevels.match(/(\d+d\d+)\s+(?:additional\s+)?(?:damage\s+)?(?:for\s+each|per)\s+(?:slot\s+)?level/i);
    if (perLevelMatch) {
      const baseDice = spell.damage.dice;
      const extraDice = perLevelMatch[1];
      if (levelsAbove > 0) {
        return `${baseDice} + ${levelsAbove}${extraDice}`;
      }
    }
  }
  
  return spell.damage.dice;
}
