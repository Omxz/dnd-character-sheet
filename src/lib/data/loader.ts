// 5etools data loader - loads from local JSON files
// Data is pre-downloaded from 5etools repository (XPHB 2024 edition only)

// Import all data files statically for bundling
import racesData from "@/data/5etools/races.json";
import backgroundsData from "@/data/5etools/backgrounds.json";
import spellsData from "@/data/5etools/spells-xphb.json";
import itemsData from "@/data/5etools/items.json";
import itemsBaseData from "@/data/5etools/items-base.json";
import featsData from "@/data/5etools/feats.json";

// Class data imports
import barbarianData from "@/data/5etools/class-barbarian.json";
import bardData from "@/data/5etools/class-bard.json";
import clericData from "@/data/5etools/class-cleric.json";
import druidData from "@/data/5etools/class-druid.json";
import fighterData from "@/data/5etools/class-fighter.json";
import monkData from "@/data/5etools/class-monk.json";
import paladinData from "@/data/5etools/class-paladin.json";
import rangerData from "@/data/5etools/class-ranger.json";
import rogueData from "@/data/5etools/class-rogue.json";
import sorcererData from "@/data/5etools/class-sorcerer.json";
import warlockData from "@/data/5etools/class-warlock.json";
import wizardData from "@/data/5etools/class-wizard.json";

// Type definitions
export interface ClassDataFile {
  class: Array<{
    name: string;
    source: string;
    edition?: string;
    hd?: { number: number; faces: number };
    proficiency?: string[];
    spellcastingAbility?: string;
    casterProgression?: string;
    startingProficiencies?: {
      armor?: string[];
      weapons?: string[];
      tools?: string[];
      skills?: Array<{ choose?: { from: string[]; count: number } }>;
    };
    startingEquipment?: {
      additionalFromBackground?: boolean;
      default?: string[];
      goldAlternative?: string;
    };
    multiclassing?: Record<string, unknown>;
    classFeatures?: string[];
    subclassTitle?: string;
    [key: string]: unknown;
  }>;
  subclass: Array<{
    name: string;
    source: string;
    className: string;
    classSource: string;
    shortName?: string;
    subclassFeatures?: string[];
    [key: string]: unknown;
  }>;
  classFeature: Array<{
    name: string;
    source: string;
    className: string;
    classSource: string;
    level: number;
    entries?: unknown[];
    [key: string]: unknown;
  }>;
  subclassFeature?: Array<{
    name: string;
    source: string;
    className: string;
    classSource: string;
    subclassShortName: string;
    subclassSource: string;
    level: number;
    entries?: unknown[];
    [key: string]: unknown;
  }>;
}

export interface RacesDataFile {
  race: Array<{
    name: string;
    source: string;
    edition?: string;
    size?: string[];
    speed?: number | { walk: number; [key: string]: number };
    darkvision?: number;
    entries?: unknown[];
    languageProficiencies?: Array<Record<string, unknown>>;
    skillProficiencies?: Array<{ choose?: { from: string[]; count: number } }>;
    ability?: Array<{ choose?: { from: string[]; count: number; amount?: number } }>;
    [key: string]: unknown;
  }>;
}

export interface BackgroundsDataFile {
  background: Array<{
    name: string;
    source: string;
    edition?: string;
    skillProficiencies?: Array<Record<string, boolean>>;
    toolProficiencies?: Array<Record<string, boolean>>;
    languageProficiencies?: Array<Record<string, unknown>>;
    entries?: unknown[];
    feats?: Array<Record<string, boolean>>;
    ability?: Array<{ choose?: { from: string[]; count: number; amount?: number } }>;
    [key: string]: unknown;
  }>;
}

export interface SpellsDataFile {
  spell: Array<{
    name: string;
    source: string;
    level: number;
    school: string;
    time?: Array<{ number: number; unit: string }>;
    range?: { type: string; distance?: { type: string; amount?: number } };
    components?: { v?: boolean; s?: boolean; m?: string | { text: string; cost?: number } };
    duration?: Array<{ type: string; duration?: { type: string; amount: number }; concentration?: boolean }>;
    entries?: unknown[];
    entriesHigherLevel?: unknown[];
    meta?: { ritual?: boolean };
    classes?: { fromClassList?: Array<{ name: string; source: string }> };
    [key: string]: unknown;
  }>;
}

export interface ItemsDataFile {
  item: Array<{
    name: string;
    source: string;
    type?: string;
    rarity?: string;
    weight?: number;
    value?: number;
    entries?: unknown[];
    [key: string]: unknown;
  }>;
  baseitem?: Array<{
    name: string;
    source: string;
    type?: string;
    weight?: number;
    value?: number;
    dmg1?: string;
    dmgType?: string;
    property?: string[];
    [key: string]: unknown;
  }>;
}

export interface FeatsDataFile {
  feat: Array<{
    name: string;
    source: string;
    edition?: string;
    category?: string[];
    prerequisite?: Array<Record<string, unknown>>;
    entries?: unknown[];
    ability?: Array<{ choose?: { from: string[]; count: number; amount?: number } }>;
    [key: string]: unknown;
  }>;
}

// Class data map for easy access
const CLASS_DATA: Record<string, ClassDataFile> = {
  barbarian: barbarianData as ClassDataFile,
  bard: bardData as ClassDataFile,
  cleric: clericData as ClassDataFile,
  druid: druidData as ClassDataFile,
  fighter: fighterData as ClassDataFile,
  monk: monkData as ClassDataFile,
  paladin: paladinData as ClassDataFile,
  ranger: rangerData as ClassDataFile,
  rogue: rogueData as ClassDataFile,
  sorcerer: sorcererData as ClassDataFile,
  warlock: warlockData as ClassDataFile,
  wizard: wizardData as ClassDataFile,
};

// Export data getters
export function getRaces(): RacesDataFile["race"] {
  return (racesData as unknown as RacesDataFile).race;
}

export function getBackgrounds(): BackgroundsDataFile["background"] {
  return (backgroundsData as unknown as BackgroundsDataFile).background;
}

export function getSpells(): SpellsDataFile["spell"] {
  return (spellsData as unknown as SpellsDataFile).spell;
}

export function getItems(): ItemsDataFile["item"] {
  return (itemsData as unknown as ItemsDataFile).item;
}

export function getBaseItems(): ItemsDataFile["baseitem"] {
  return (itemsBaseData as unknown as ItemsDataFile).baseitem || [];
}

export function getFeats(): FeatsDataFile["feat"] {
  return (featsData as unknown as FeatsDataFile).feat;
}

export function getClassData(className: string): ClassDataFile | undefined {
  return CLASS_DATA[className.toLowerCase()];
}

export function getAllClasses(): ClassDataFile[] {
  return Object.values(CLASS_DATA);
}

export function getClassNames(): string[] {
  return Object.keys(CLASS_DATA);
}

// Helper to get class by name from all class data
export function findClass(className: string) {
  const classData = getClassData(className);
  if (!classData) return undefined;
  return classData.class.find(c => c.name.toLowerCase() === className.toLowerCase());
}

// Helper to get subclasses for a class
export function getSubclasses(className: string) {
  const classData = getClassData(className);
  if (!classData) return [];
  return classData.subclass.filter(sc => sc.className.toLowerCase() === className.toLowerCase());
}

// Helper to get class features for a class up to a certain level
export function getClassFeatures(className: string, maxLevel: number = 20) {
  const classData = getClassData(className);
  if (!classData) return [];
  return classData.classFeature.filter(
    f => f.className.toLowerCase() === className.toLowerCase() && f.level <= maxLevel
  );
}

// Helper to get spells for a class
export function getSpellsForClass(className: string) {
  const spells = getSpells();
  return spells.filter(spell => 
    spell.classes?.fromClassList?.some(
      c => c.name.toLowerCase() === className.toLowerCase()
    )
  );
}

// Build lookup keys
export function buildKey(name: string, source: string): string {
  return `${name.toLowerCase().replace(/\s+/g, "-")}|${source.toUpperCase()}`;
}

// Parse a key back to name and source
export function parseKey(key: string): { name: string; source: string } {
  const [name, source] = key.split("|");
  return { name: name.replace(/-/g, " "), source };
}
