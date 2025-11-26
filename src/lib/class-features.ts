// Class Features System
// Defines all class resources, calculated stats, and feature effects

// ============================================
// CLASS RESOURCES (Limited Use Features)
// ============================================

export interface ClassResource {
  name: string;
  shortName: string;
  getMax: (level: number, abilityScores?: Record<string, number>) => number;
  rechargeOn: "short" | "long" | "dawn" | "never";
  description: string;
}

// Resource definitions for each class
export const CLASS_RESOURCES: Record<string, ClassResource[]> = {
  barbarian: [
    {
      name: "Rage",
      shortName: "Rage",
      getMax: (level) => {
        if (level >= 17) return 6;
        if (level >= 12) return 5;
        if (level >= 6) return 4;
        if (level >= 3) return 3;
        return 2;
      },
      rechargeOn: "long",
      description: "Enter a rage as a bonus action for extra damage and resistance.",
    },
  ],
  bard: [
    {
      name: "Bardic Inspiration",
      shortName: "Inspiration",
      getMax: (level, abilities) => {
        const chaMod = abilities ? Math.floor((abilities.charisma - 10) / 2) : 0;
        return Math.max(1, chaMod);
      },
      rechargeOn: "long", // Short rest at level 5+
      description: "Inspire allies with a bonus die they can add to ability checks, attack rolls, or saving throws.",
    },
  ],
  cleric: [
    {
      name: "Channel Divinity",
      shortName: "Channel",
      getMax: (level) => {
        if (level >= 18) return 3;
        if (level >= 6) return 2;
        return 1;
      },
      rechargeOn: "short",
      description: "Channel divine energy to fuel magical effects.",
    },
  ],
  druid: [
    {
      name: "Wild Shape",
      shortName: "Wild Shape",
      getMax: (level) => {
        if (level >= 20) return 999; // Unlimited at 20
        return 2;
      },
      rechargeOn: "short",
      description: "Transform into a beast you have seen before.",
    },
  ],
  fighter: [
    {
      name: "Second Wind",
      shortName: "2nd Wind",
      getMax: () => 1,
      rechargeOn: "short",
      description: "Regain 1d10 + fighter level HP as a bonus action.",
    },
    {
      name: "Action Surge",
      shortName: "Action Surge",
      getMax: (level) => (level >= 17 ? 2 : 1),
      rechargeOn: "short",
      description: "Take one additional action on your turn.",
    },
    {
      name: "Indomitable",
      shortName: "Indomitable",
      getMax: (level) => {
        if (level >= 17) return 3;
        if (level >= 13) return 2;
        if (level >= 9) return 1;
        return 0;
      },
      rechargeOn: "long",
      description: "Reroll a failed saving throw.",
    },
  ],
  monk: [
    {
      name: "Ki Points",
      shortName: "Ki",
      getMax: (level) => level, // Equal to monk level
      rechargeOn: "short",
      description: "Fuel various ki features and monk abilities.",
    },
  ],
  paladin: [
    {
      name: "Lay on Hands",
      shortName: "Lay on Hands",
      getMax: (level) => level * 5, // 5 HP per paladin level
      rechargeOn: "long",
      description: "Heal creatures by touch from a pool of HP.",
    },
    {
      name: "Channel Divinity",
      shortName: "Channel",
      getMax: (level) => {
        if (level >= 11) return 2;
        if (level >= 3) return 1;
        return 0;
      },
      rechargeOn: "short",
      description: "Channel divine energy for sacred effects.",
    },
    {
      name: "Divine Smite",
      shortName: "Smite",
      getMax: () => 999, // Uses spell slots, not tracked separately
      rechargeOn: "never",
      description: "Expend spell slots to deal extra radiant damage on melee hits.",
    },
  ],
  ranger: [
    // Rangers primarily use spell slots, no major class resources until subclass
  ],
  rogue: [
    {
      name: "Sneak Attack",
      shortName: "Sneak Atk",
      getMax: () => 999, // Unlimited, once per turn
      rechargeOn: "never",
      description: "Deal extra damage when you have advantage or an ally is nearby.",
    },
  ],
  sorcerer: [
    {
      name: "Sorcery Points",
      shortName: "Sorcery",
      getMax: (level) => level, // Equal to sorcerer level
      rechargeOn: "long",
      description: "Fuel metamagic and create spell slots.",
    },
  ],
  warlock: [
    // Warlock uses pact magic (spell slots that recharge on short rest)
    // Tracked via spell slots, not separate resource
  ],
  wizard: [
    {
      name: "Arcane Recovery",
      shortName: "Arcane Rec",
      getMax: (level) => Math.ceil(level / 2), // Recover spell slot levels = half wizard level
      rechargeOn: "long",
      description: "Recover expended spell slots during a short rest (once per long rest).",
    },
  ],
};

// ============================================
// SUBCLASS RESOURCES
// ============================================

export const SUBCLASS_RESOURCES: Record<string, ClassResource[]> = {
  // Fighter subclasses
  "battle-master": [
    {
      name: "Superiority Dice",
      shortName: "Sup. Dice",
      getMax: (level) => {
        if (level >= 15) return 6;
        if (level >= 7) return 5;
        return 4;
      },
      rechargeOn: "short",
      description: "Fuel combat maneuvers with d8 (d10 at 10th, d12 at 18th) dice.",
    },
  ],
  "champion": [],
  "eldritch-knight": [],
  
  // Rogue subclasses
  "arcane-trickster": [],
  "assassin": [],
  "thief": [],
  
  // Monk subclasses
  "warrior-of-mercy": [],
  "warrior-of-shadow": [
    {
      name: "Shadow Arts",
      shortName: "Shadow",
      getMax: () => 999, // Uses Ki points
      rechargeOn: "never",
      description: "Spend ki to cast darkness, darkvision, pass without trace, or silence.",
    },
  ],
  "warrior-of-the-elements": [],
  "warrior-of-the-open-hand": [],
  
  // Cleric domains
  "life-domain": [],
  "light-domain": [
    {
      name: "Warding Flare",
      shortName: "Warding",
      getMax: (level, abilities) => {
        const wisMod = abilities ? Math.floor((abilities.wisdom - 10) / 2) : 0;
        return Math.max(1, wisMod);
      },
      rechargeOn: "long",
      description: "Impose disadvantage on an attack roll against you.",
    },
  ],
  "war-domain": [
    {
      name: "War Priest",
      shortName: "War Priest",
      getMax: (level, abilities) => {
        const wisMod = abilities ? Math.floor((abilities.wisdom - 10) / 2) : 0;
        return Math.max(1, wisMod);
      },
      rechargeOn: "long",
      description: "Make a weapon attack as a bonus action after attacking.",
    },
  ],
  
  // Wizard schools
  "school-of-abjuration": [
    {
      name: "Arcane Ward",
      shortName: "Ward HP",
      getMax: (level, abilities) => {
        const intMod = abilities ? Math.floor((abilities.intelligence - 10) / 2) : 0;
        return level * 2 + intMod;
      },
      rechargeOn: "long",
      description: "Protective ward that absorbs damage.",
    },
  ],
  "school-of-divination": [
    {
      name: "Portent",
      shortName: "Portent",
      getMax: (level) => (level >= 14 ? 3 : 2),
      rechargeOn: "long",
      description: "Replace any d20 roll with a pre-rolled result.",
    },
  ],
  "school-of-evocation": [],
  
  // Barbarian paths
  "path-of-the-berserker": [],
  "path-of-the-totem-warrior": [],
  "path-of-the-zealot": [],
  
  // Bard colleges
  "college-of-lore": [],
  "college-of-valor": [],
  
  // Druid circles
  "circle-of-the-land": [
    {
      name: "Natural Recovery",
      shortName: "Nat Rec",
      getMax: (level) => Math.ceil(level / 2),
      rechargeOn: "long",
      description: "Recover spell slots during short rest.",
    },
  ],
  "circle-of-the-moon": [],
  
  // Paladin oaths
  "oath-of-devotion": [],
  "oath-of-the-ancients": [],
  "oath-of-vengeance": [],
  
  // Ranger conclaves
  "beast-master": [],
  "hunter": [],
  "gloom-stalker": [],
  
  // Sorcerer origins
  "draconic-bloodline": [],
  "wild-magic": [
    {
      name: "Tides of Chaos",
      shortName: "Tides",
      getMax: () => 1,
      rechargeOn: "long", // Or when Wild Magic Surge happens
      description: "Gain advantage on one attack, check, or save.",
    },
  ],
  
  // Warlock patrons
  "the-archfey": [
    {
      name: "Fey Presence",
      shortName: "Fey Pres",
      getMax: () => 1,
      rechargeOn: "short",
      description: "Charm or frighten creatures in a 10-foot cube.",
    },
  ],
  "the-fiend": [
    {
      name: "Dark One's Blessing",
      shortName: "Dark Bless",
      getMax: () => 999, // Per kill, no limit
      rechargeOn: "never",
      description: "Gain temp HP when you reduce a hostile creature to 0 HP.",
    },
  ],
  "the-great-old-one": [],
};

// ============================================
// CALCULATED STATS (Features that modify stats)
// ============================================

export interface CalculatedStat {
  stat: "ac" | "speed" | "initiative" | "hp";
  calculate: (
    baseValue: number,
    level: number,
    abilityScores: Record<string, number>,
    equipment?: unknown[]
  ) => number;
  condition?: (level: number, equipment?: unknown[]) => boolean;
  description: string;
}

export const CLASS_CALCULATED_STATS: Record<string, CalculatedStat[]> = {
  barbarian: [
    {
      stat: "ac",
      calculate: (_, __, abilities) => {
        const dexMod = Math.floor((abilities.dexterity - 10) / 2);
        const conMod = Math.floor((abilities.constitution - 10) / 2);
        return 10 + dexMod + conMod;
      },
      condition: (_, equipment) => {
        // Only if not wearing armor
        if (!equipment) return true;
        // Would need to check equipment for armor
        return true;
      },
      description: "Unarmored Defense: 10 + DEX + CON when not wearing armor",
    },
    {
      stat: "speed",
      calculate: (base, level) => (level >= 5 ? base + 10 : base),
      description: "Fast Movement: +10 speed at level 5 when not wearing heavy armor",
    },
  ],
  monk: [
    {
      stat: "ac",
      calculate: (_, __, abilities) => {
        const dexMod = Math.floor((abilities.dexterity - 10) / 2);
        const wisMod = Math.floor((abilities.wisdom - 10) / 2);
        return 10 + dexMod + wisMod;
      },
      condition: (_, equipment) => {
        // Only if not wearing armor or shield
        if (!equipment) return true;
        return true;
      },
      description: "Unarmored Defense: 10 + DEX + WIS when not wearing armor or shield",
    },
    {
      stat: "speed",
      calculate: (base, level) => {
        if (level >= 18) return base + 30;
        if (level >= 14) return base + 25;
        if (level >= 10) return base + 20;
        if (level >= 6) return base + 15;
        if (level >= 2) return base + 10;
        return base;
      },
      description: "Unarmored Movement: Bonus speed when not wearing armor or shield",
    },
  ],
  rogue: [
    {
      stat: "initiative",
      calculate: (base, level, abilities) => {
        // Swashbuckler gets CHA to initiative at level 3
        return base;
      },
      description: "Rogues are naturally quick on their feet",
    },
  ],
};

// ============================================
// SNEAK ATTACK / MARTIAL ARTS DICE
// ============================================

export function getSneakAttackDice(rogueLevel: number): string {
  return `${Math.ceil(rogueLevel / 2)}d6`;
}

export function getMartialArtsDie(monkLevel: number): string {
  if (monkLevel >= 17) return "1d12";
  if (monkLevel >= 11) return "1d10";
  if (monkLevel >= 5) return "1d8";
  return "1d6";
}

export function getRageDamage(barbarianLevel: number): number {
  if (barbarianLevel >= 16) return 4;
  if (barbarianLevel >= 9) return 3;
  return 2;
}

// ============================================
// SPELLCASTING ABILITY
// ============================================

export const SPELLCASTING_ABILITY: Record<string, string> = {
  bard: "charisma",
  cleric: "wisdom",
  druid: "wisdom",
  paladin: "charisma",
  ranger: "wisdom",
  sorcerer: "charisma",
  warlock: "charisma",
  wizard: "intelligence",
  // Subclasses that add spellcasting
  "eldritch-knight": "intelligence",
  "arcane-trickster": "intelligence",
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getClassResources(
  className: string,
  subclassName?: string | null,
  level?: number,
  abilityScores?: Record<string, number>
): Array<{ name: string; shortName: string; max: number; rechargeOn: string; description: string }> {
  const classKey = className.toLowerCase().split("|")[0];
  const subclassKey = subclassName?.toLowerCase().split("|")[0].replace(/\s+/g, "-");
  
  const resources: Array<{ name: string; shortName: string; max: number; rechargeOn: string; description: string }> = [];
  
  // Add class resources
  const classResources = CLASS_RESOURCES[classKey] || [];
  for (const resource of classResources) {
    const max = resource.getMax(level || 1, abilityScores);
    if (max > 0 && max < 999) {
      resources.push({
        name: resource.name,
        shortName: resource.shortName,
        max,
        rechargeOn: resource.rechargeOn,
        description: resource.description,
      });
    }
  }
  
  // Add subclass resources
  if (subclassKey) {
    const subResources = SUBCLASS_RESOURCES[subclassKey] || [];
    for (const resource of subResources) {
      const max = resource.getMax(level || 1, abilityScores);
      if (max > 0 && max < 999) {
        resources.push({
          name: resource.name,
          shortName: resource.shortName,
          max,
          rechargeOn: resource.rechargeOn,
          description: resource.description,
        });
      }
    }
  }
  
  return resources;
}

export function calculateAC(
  className: string,
  level: number,
  abilityScores: Record<string, number>,
  baseAC: number = 10,
  hasArmor: boolean = false,
  hasShield: boolean = false
): { ac: number; source: string } {
  const classKey = className.toLowerCase().split("|")[0];
  const dexMod = Math.floor((abilityScores.dexterity - 10) / 2);
  
  // If wearing armor, use armor AC (simplified)
  if (hasArmor) {
    return { ac: baseAC, source: "Armor" };
  }
  
  // Check for class-specific AC calculations
  if (classKey === "monk" && !hasShield) {
    const wisMod = Math.floor((abilityScores.wisdom - 10) / 2);
    return { 
      ac: 10 + dexMod + wisMod, 
      source: "Unarmored Defense (Monk)" 
    };
  }
  
  if (classKey === "barbarian") {
    const conMod = Math.floor((abilityScores.constitution - 10) / 2);
    return { 
      ac: 10 + dexMod + conMod, 
      source: "Unarmored Defense (Barbarian)" 
    };
  }
  
  // Default unarmored AC
  return { ac: 10 + dexMod, source: "Unarmored" };
}

export function calculateSpeed(
  className: string,
  level: number,
  baseSpeed: number = 30,
  hasHeavyArmor: boolean = false
): number {
  const classKey = className.toLowerCase().split("|")[0];
  
  if (classKey === "monk" && !hasHeavyArmor) {
    if (level >= 18) return baseSpeed + 30;
    if (level >= 14) return baseSpeed + 25;
    if (level >= 10) return baseSpeed + 20;
    if (level >= 6) return baseSpeed + 15;
    if (level >= 2) return baseSpeed + 10;
  }
  
  if (classKey === "barbarian" && level >= 5 && !hasHeavyArmor) {
    return baseSpeed + 10;
  }
  
  return baseSpeed;
}

// ============================================
// EXTRA ATTACKS
// ============================================

export function getExtraAttacks(className: string, level: number): number {
  const classKey = className.toLowerCase().split("|")[0];
  
  if (classKey === "fighter") {
    if (level >= 20) return 4;
    if (level >= 11) return 3;
    if (level >= 5) return 2;
  }
  
  if (["barbarian", "monk", "paladin", "ranger"].includes(classKey)) {
    if (level >= 5) return 2;
  }
  
  return 1;
}
