// 5etools data types for XPHB (2024 Player's Handbook)
// These match the JSON structure from the 5etools repository

// Common types
export interface Source {
  name: string;
  source: string;
  page?: number;
}

// Rich text entry types
export type Entry = string | EntryObject;

export interface EntryObject {
  type: string;
  name?: string;
  entries?: Entry[];
  items?: Entry[];
  colLabels?: string[];
  rows?: Entry[][];
  [key: string]: unknown;
}

// Class types
export interface DndClass extends Source {
  edition: "classic" | "one";
  hd: { number: number; faces: number };
  proficiency: string[];
  spellcastingAbility?: string;
  casterProgression?: "full" | "half" | "third" | "pact";
  preparedSpells?: string;
  preparedSpellsProgression?: number[];
  cantripProgression?: number[];
  spellsKnownProgressionFixed?: number[];
  startingProficiencies: {
    armor?: string[];
    weapons?: string[];
    tools?: string[];
    skills?: SkillChoice[];
  };
  startingEquipment: {
    additionalFromBackground: boolean;
    default?: string[];
    defaultData?: Record<string, unknown>[];
    goldAlternative?: string;
    entries?: string[];
  };
  multiclassing?: {
    requirements: Record<string, number>;
    proficienciesGained?: {
      armor?: string[];
      weapons?: string[];
      skills?: SkillChoice[];
    };
  };
  classTableGroups?: ClassTableGroup[];
  classFeatures: (string | ClassFeatureRef)[];
  subclassTitle: string;
}

export interface SkillChoice {
  choose?: {
    from: string[];
    count: number;
  };
}

export interface ClassTableGroup {
  colLabels: string[];
  rows?: unknown[][];
  rowsSpellProgression?: number[][];
}

export interface ClassFeatureRef {
  classFeature: string;
  gainSubclassFeature?: boolean;
}

export interface Subclass extends Source {
  shortName: string;
  className: string;
  classSource: string;
  subclassFeatures: string[];
  additionalSpells?: AdditionalSpell[];
}

export interface AdditionalSpell {
  prepared?: Record<string, string[]>;
  innate?: Record<string, string[]>;
}

export interface ClassFeature extends Source {
  className: string;
  classSource: string;
  level: number;
  entries: Entry[];
  isClassFeatureVariant?: boolean;
}

export interface SubclassFeature extends Source {
  className: string;
  classSource: string;
  subclassShortName: string;
  subclassSource: string;
  level: number;
  entries: Entry[];
}

// Race types
export interface Race extends Source {
  edition?: "classic" | "one";
  size: string[];
  speed: number | SpeedObject;
  darkvision?: number;
  traitTags?: string[];
  languageProficiencies?: LanguageProficiency[];
  skillProficiencies?: SkillChoice[];
  resist?: string[];
  entries: Entry[];
  ability?: AbilityChoice[];
  additionalSpells?: AdditionalSpell[];
  creatureTypes?: string[];
  age?: { mature: number; max: number };
  lineage?: string;
  heightAndWeight?: HeightAndWeight;
}

export interface SpeedObject {
  walk: number;
  fly?: number;
  swim?: number;
  climb?: number;
  burrow?: number;
}

export interface LanguageProficiency {
  common?: boolean;
  anyStandard?: number;
  [language: string]: boolean | number | undefined;
}

export interface AbilityChoice {
  choose?: {
    from: string[];
    count: number;
    amount?: number;
  };
  [ability: string]: unknown;
}

export interface HeightAndWeight {
  baseHeight: number;
  heightMod: string;
  baseWeight: number;
  weightMod: string;
}

// Background types
export interface Background extends Source {
  edition?: "classic" | "one";
  skillProficiencies?: Record<string, boolean>[];
  toolProficiencies?: Record<string, boolean>[];
  languageProficiencies?: LanguageProficiency[];
  startingEquipment?: Record<string, number>[];
  entries: Entry[];
  feats?: Record<string, boolean>[];
  ability?: AbilityChoice[];
  fromFeature?: {
    feats: boolean;
  };
}

// Spell types
export interface Spell extends Source {
  srd?: boolean;
  basicRules?: boolean;
  reprintedAs?: string[];
  level: number;
  school: string;
  time: SpellTime[];
  range: SpellRange;
  components: SpellComponents;
  duration: SpellDuration[];
  meta?: { ritual?: boolean };
  entries: Entry[];
  entriesHigherLevel?: Entry[];
  damageInflict?: string[];
  conditionInflict?: string[];
  savingThrow?: string[];
  spellAttack?: string[];
  areaTags?: string[];
  miscTags?: string[];
  scalingLevelDice?: ScalingLevelDice;
  affectsCreatureType?: string[];
  classes?: {
    fromClassList?: Source[];
    fromSubclass?: SubclassSpellRef[];
  };
}

export interface SpellTime {
  number: number;
  unit: "action" | "bonus" | "reaction" | "minute" | "hour";
  condition?: string;
}

export interface SpellRange {
  type: "point" | "radius" | "cone" | "line" | "cube" | "sphere" | "hemisphere" | "cylinder";
  distance: {
    type: "feet" | "miles" | "touch" | "self" | "sight" | "unlimited" | "special";
    amount?: number;
  };
}

export interface SpellComponents {
  v?: boolean;
  s?: boolean;
  m?: string | { text: string; cost?: number; consume?: boolean | string };
}

export interface SpellDuration {
  type: "instant" | "timed" | "permanent" | "special";
  duration?: { type: "round" | "minute" | "hour" | "day" | "week" | "year"; amount: number };
  concentration?: boolean;
  ends?: string[];
}

export interface ScalingLevelDice {
  label: string;
  scaling: Record<string, string>;
}

export interface SubclassSpellRef {
  class: Source;
  subclass: Source;
}

// Item types
export interface Item extends Source {
  type?: string;
  baseItem?: string;
  rarity?: string;
  reqAttune?: boolean | string;
  weight?: number;
  value?: number;
  entries?: Entry[];
  bonusWeapon?: string;
  bonusAc?: string;
  dmg1?: string;
  dmg2?: string;
  dmgType?: string;
  property?: string[];
  charges?: number;
  recharge?: string;
  attachedSpells?: string[];
  ac?: number;
  strength?: string;
  stealth?: boolean;
  range?: string;
  weaponCategory?: string;
  age?: string;
  ammunition?: boolean;
  axe?: boolean;
  sword?: boolean;
  firearm?: boolean;
}

// Feat types
export interface Feat extends Source {
  edition?: "classic" | "one";
  category?: string[];
  prerequisite?: FeatPrerequisite[];
  ability?: AbilityChoice[];
  additionalSpells?: AdditionalSpell[];
  skillProficiencies?: SkillChoice[];
  entries: Entry[];
  repeatable?: boolean;
  repeatableNote?: string;
}

export interface FeatPrerequisite {
  level?: number | { level: number; class?: Source };
  race?: Source[];
  ability?: Record<string, number>[];
  other?: string;
  feat?: string[];
  spellcasting?: boolean;
  background?: Source[];
}

// Data index types for lookups
export interface DataIndex<T> {
  [key: string]: T; // key format: "name|source"
}

// Processed data types for the app
export interface ProcessedClass {
  key: string; // "wizard|XPHB"
  name: string;
  source: string;
  hitDie: number;
  primaryAbility: string;
  savingThrows: string[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies: string[];
  skillChoices: SkillChoice[];
  spellcasting?: {
    ability: string;
    type: "full" | "half" | "third" | "pact";
    cantripsKnown: number[];
    spellsKnown?: number[];
    preparedFormula?: string;
  };
  subclassTitle: string;
  subclassLevel: number;
}

export interface ProcessedRace {
  key: string; // "elf|XPHB"
  name: string;
  source: string;
  size: string[];
  speed: number;
  darkvision?: number;
  traits: Entry[];
  abilityScoreChoice?: {
    count: number;
    amount: number;
  };
  languages: string[];
  skillProficiencies?: string[];
}

export interface ProcessedBackground {
  key: string; // "sage|XPHB"
  name: string;
  source: string;
  skillProficiencies: string[];
  toolProficiencies: string[];
  languages: number;
  originFeat?: string;
  abilityScoreChoice?: {
    from: string[];
    count: number;
    amount: number;
  };
  equipment: string;
}

export interface ProcessedSpell {
  key: string; // "fireball|XPHB"
  name: string;
  source: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  concentration: boolean;
  ritual: boolean;
  description: Entry[];
  higherLevels?: Entry[];
  classes: string[];
}

export interface ProcessedItem {
  key: string; // "longsword|XPHB"
  name: string;
  source: string;
  type: string;
  rarity: string;
  attunement: boolean | string;
  weight?: number;
  value?: number;
  damage?: string;
  damageType?: string;
  properties?: string[];
  ac?: number;
  description: Entry[];
}

export interface ProcessedFeat {
  key: string; // "alert|XPHB"
  name: string;
  source: string;
  category: string[];
  prerequisite?: string;
  description: Entry[];
  repeatable: boolean;
}
