// Feature Choices System
// Defines all class features that require player choices

export interface FeatureChoice {
  featureName: string;
  level: number;
  type: "single" | "multiple";
  count?: number; // For "multiple" type, how many to choose
  options: Array<{
    key: string;
    name: string;
    description: string;
  }>;
}

// ============================================
// FIGHTING STYLES
// ============================================

const FIGHTING_STYLES = [
  {
    key: "archery",
    name: "Archery",
    description: "+2 bonus to attack rolls with ranged weapons.",
  },
  {
    key: "blind-fighting",
    name: "Blind Fighting",
    description: "You have Blindsight with a range of 10 feet.",
  },
  {
    key: "defense",
    name: "Defense",
    description: "+1 bonus to AC while wearing armor.",
  },
  {
    key: "dueling",
    name: "Dueling",
    description: "+2 damage when wielding a melee weapon in one hand and no other weapons.",
  },
  {
    key: "great-weapon-fighting",
    name: "Great Weapon Fighting",
    description: "Reroll 1s and 2s on damage dice with two-handed melee weapons.",
  },
  {
    key: "interception",
    name: "Interception",
    description: "Reduce damage to nearby ally by 1d10 + proficiency when using reaction.",
  },
  {
    key: "protection",
    name: "Protection",
    description: "Impose disadvantage on attacks against adjacent allies using reaction.",
  },
  {
    key: "thrown-weapon-fighting",
    name: "Thrown Weapon Fighting",
    description: "+2 damage with thrown weapons, can draw as part of attack.",
  },
  {
    key: "two-weapon-fighting",
    name: "Two-Weapon Fighting",
    description: "Add ability modifier to off-hand attack damage.",
  },
  {
    key: "unarmed-fighting",
    name: "Unarmed Fighting",
    description: "Unarmed strikes deal 1d6+STR (1d8 if both hands free), deal 1d4 damage grappling.",
  },
];

// ============================================
// BATTLE MASTER MANEUVERS
// ============================================

const MANEUVERS = [
  {
    key: "commanders-strike",
    name: "Commander's Strike",
    description: "Forgo one attack to direct an ally to attack as a reaction, adding superiority die to damage.",
  },
  {
    key: "disarming-attack",
    name: "Disarming Attack",
    description: "Add superiority die to damage, target must save or drop held item.",
  },
  {
    key: "distracting-strike",
    name: "Distracting Strike",
    description: "Add superiority die to damage, next ally attack has advantage.",
  },
  {
    key: "evasive-footwork",
    name: "Evasive Footwork",
    description: "Add superiority die to AC while moving.",
  },
  {
    key: "feinting-attack",
    name: "Feinting Attack",
    description: "Bonus action to feint, gain advantage and add superiority die to next attack.",
  },
  {
    key: "goading-attack",
    name: "Goading Attack",
    description: "Add superiority die to damage, target has disadvantage on attacks against others.",
  },
  {
    key: "lunging-attack",
    name: "Lunging Attack",
    description: "Increase reach by 5 feet and add superiority die to damage.",
  },
  {
    key: "maneuvering-attack",
    name: "Maneuvering Attack",
    description: "Add superiority die to damage, ally can move half speed without provoking.",
  },
  {
    key: "menacing-attack",
    name: "Menacing Attack",
    description: "Add superiority die to damage, target must save or be frightened.",
  },
  {
    key: "parry",
    name: "Parry",
    description: "Reduce melee damage taken by superiority die + DEX modifier.",
  },
  {
    key: "precision-attack",
    name: "Precision Attack",
    description: "Add superiority die to attack roll.",
  },
  {
    key: "pushing-attack",
    name: "Pushing Attack",
    description: "Add superiority die to damage, push target 15 feet.",
  },
  {
    key: "rally",
    name: "Rally",
    description: "Ally gains temporary HP equal to superiority die + CHA modifier.",
  },
  {
    key: "riposte",
    name: "Riposte",
    description: "When creature misses you, use reaction to attack and add superiority die.",
  },
  {
    key: "sweeping-attack",
    name: "Sweeping Attack",
    description: "Deal superiority die damage to another creature within reach.",
  },
  {
    key: "tactical-assessment",
    name: "Tactical Assessment",
    description: "Add superiority die to Investigation, History, or Insight check.",
  },
  {
    key: "trip-attack",
    name: "Trip Attack",
    description: "Add superiority die to damage, knock target prone if Large or smaller.",
  },
];

// ============================================
// METAMAGIC OPTIONS
// ============================================

const METAMAGIC = [
  {
    key: "careful-spell",
    name: "Careful Spell",
    description: "Spend 1 sorcery point to let CHA mod creatures auto-succeed on spell saves.",
  },
  {
    key: "distant-spell",
    name: "Distant Spell",
    description: "Spend 1 sorcery point to double spell range (or make touch 30 ft).",
  },
  {
    key: "empowered-spell",
    name: "Empowered Spell",
    description: "Spend 1 sorcery point to reroll CHA mod damage dice.",
  },
  {
    key: "extended-spell",
    name: "Extended Spell",
    description: "Spend 1 sorcery point to double spell duration (max 24 hours).",
  },
  {
    key: "heightened-spell",
    name: "Heightened Spell",
    description: "Spend 3 sorcery points to give one target disadvantage on first save.",
  },
  {
    key: "quickened-spell",
    name: "Quickened Spell",
    description: "Spend 2 sorcery points to cast spell as bonus action.",
  },
  {
    key: "seeking-spell",
    name: "Seeking Spell",
    description: "Spend 2 sorcery points to reroll a missed spell attack.",
  },
  {
    key: "subtle-spell",
    name: "Subtle Spell",
    description: "Spend 1 sorcery point to cast without verbal or somatic components.",
  },
  {
    key: "transmuted-spell",
    name: "Transmuted Spell",
    description: "Spend 1 sorcery point to change damage type to acid, cold, fire, lightning, poison, or thunder.",
  },
  {
    key: "twinned-spell",
    name: "Twinned Spell",
    description: "Spend spell level sorcery points to target a second creature with single-target spell.",
  },
];

// ============================================
// ELDRITCH INVOCATIONS
// ============================================

const ELDRITCH_INVOCATIONS = [
  {
    key: "agonizing-blast",
    name: "Agonizing Blast",
    description: "Add CHA modifier to eldritch blast damage. Requires: eldritch blast cantrip.",
  },
  {
    key: "armor-of-shadows",
    name: "Armor of Shadows",
    description: "Cast mage armor on yourself at will without a spell slot.",
  },
  {
    key: "beast-speech",
    name: "Beast Speech",
    description: "Cast speak with animals at will without a spell slot.",
  },
  {
    key: "beguiling-influence",
    name: "Beguiling Influence",
    description: "Gain proficiency in Deception and Persuasion.",
  },
  {
    key: "devils-sight",
    name: "Devil's Sight",
    description: "See normally in darkness (magical and nonmagical) up to 120 feet.",
  },
  {
    key: "eldritch-mind",
    name: "Eldritch Mind",
    description: "Advantage on Constitution saves to maintain concentration.",
  },
  {
    key: "eldritch-sight",
    name: "Eldritch Sight",
    description: "Cast detect magic at will without a spell slot.",
  },
  {
    key: "eldritch-spear",
    name: "Eldritch Spear",
    description: "Eldritch blast range becomes 300 feet. Requires: eldritch blast cantrip.",
  },
  {
    key: "eyes-of-the-rune-keeper",
    name: "Eyes of the Rune Keeper",
    description: "Read all writing.",
  },
  {
    key: "fiendish-vigor",
    name: "Fiendish Vigor",
    description: "Cast false life on yourself at will as a 1st-level spell.",
  },
  {
    key: "gaze-of-two-minds",
    name: "Gaze of Two Minds",
    description: "Use action to perceive through willing humanoid's senses.",
  },
  {
    key: "gift-of-the-ever-living-ones",
    name: "Gift of the Ever-Living Ones",
    description: "Max healing dice when familiar is within 100 feet. Requires: Pact of the Chain.",
  },
  {
    key: "grasp-of-hadar",
    name: "Grasp of Hadar",
    description: "Pull creature 10 feet toward you on eldritch blast hit. Requires: eldritch blast cantrip.",
  },
  {
    key: "improved-pact-weapon",
    name: "Improved Pact Weapon",
    description: "Pact weapon can be shortbow, longbow, or crossbow, +1 bonus, use as focus. Requires: Pact of the Blade.",
  },
  {
    key: "lance-of-lethargy",
    name: "Lance of Lethargy",
    description: "Reduce creature speed by 10 feet on eldritch blast hit. Requires: eldritch blast cantrip.",
  },
  {
    key: "mask-of-many-faces",
    name: "Mask of Many Faces",
    description: "Cast disguise self at will without a spell slot.",
  },
  {
    key: "misty-visions",
    name: "Misty Visions",
    description: "Cast silent image at will without a spell slot.",
  },
  {
    key: "one-with-shadows",
    name: "One with Shadows",
    description: "Become invisible in dim light or darkness. Requires: 5th level.",
  },
  {
    key: "otherworldly-leap",
    name: "Otherworldly Leap",
    description: "Cast jump on yourself at will without a spell slot. Requires: 9th level.",
  },
  {
    key: "repelling-blast",
    name: "Repelling Blast",
    description: "Push creature 10 feet away on eldritch blast hit. Requires: eldritch blast cantrip.",
  },
  {
    key: "thirsting-blade",
    name: "Thirsting Blade",
    description: "Attack twice with pact weapon. Requires: Pact of the Blade, 5th level.",
  },
  {
    key: "voice-of-the-chain-master",
    name: "Voice of the Chain Master",
    description: "Communicate telepathically with and perceive through familiar. Requires: Pact of the Chain.",
  },
  {
    key: "whispers-of-the-grave",
    name: "Whispers of the Grave",
    description: "Cast speak with dead at will without a spell slot. Requires: 9th level.",
  },
  {
    key: "witch-sight",
    name: "Witch Sight",
    description: "See true forms of shapechangers and invisible creatures within 30 feet. Requires: 15th level.",
  },
];

// ============================================
// EXPERTISE SKILLS
// ============================================

const SKILLS = [
  { key: "acrobatics", name: "Acrobatics", description: "Balance, tumbling, aerial maneuvers." },
  { key: "animal-handling", name: "Animal Handling", description: "Calm, control, or intuit animals." },
  { key: "arcana", name: "Arcana", description: "Magical lore, spells, items, planes." },
  { key: "athletics", name: "Athletics", description: "Climbing, jumping, swimming, grappling." },
  { key: "deception", name: "Deception", description: "Lying, disguising, misleading others." },
  { key: "history", name: "History", description: "Historical events, people, cultures." },
  { key: "insight", name: "Insight", description: "Determine true intentions, detect lies." },
  { key: "intimidation", name: "Intimidation", description: "Threaten, coerce, or frighten." },
  { key: "investigation", name: "Investigation", description: "Find clues, make deductions." },
  { key: "medicine", name: "Medicine", description: "Diagnose, stabilize, treat ailments." },
  { key: "nature", name: "Nature", description: "Plants, animals, terrain, weather." },
  { key: "perception", name: "Perception", description: "Spot, hear, or detect presence." },
  { key: "performance", name: "Performance", description: "Entertain through music, dance, acting." },
  { key: "persuasion", name: "Persuasion", description: "Influence with tact, diplomacy, grace." },
  { key: "religion", name: "Religion", description: "Deities, rites, prayers, organizations." },
  { key: "sleight-of-hand", name: "Sleight of Hand", description: "Pick pockets, plant items, manual trickery." },
  { key: "stealth", name: "Stealth", description: "Hide, move silently, avoid detection." },
  { key: "survival", name: "Survival", description: "Track, forage, navigate wilderness." },
];

// ============================================
// TOTEM SPIRITS (Barbarian Path of the Totem Warrior)
// ============================================

const TOTEM_SPIRITS = [
  {
    key: "bear",
    name: "Bear",
    description: "Resistance to all damage except psychic while raging.",
  },
  {
    key: "eagle",
    name: "Eagle",
    description: "Enemies have disadvantage on opportunity attacks against you while raging.",
  },
  {
    key: "elk",
    name: "Elk",
    description: "Walking speed increases by 15 feet while raging.",
  },
  {
    key: "tiger",
    name: "Tiger",
    description: "Add 10 feet to long jump, 3 feet to high jump while raging.",
  },
  {
    key: "wolf",
    name: "Wolf",
    description: "Allies have advantage on attacks against enemies within 5 feet of you while raging.",
  },
];

// ============================================
// WARLOCK PACT BOONS
// ============================================

const PACT_BOONS = [
  {
    key: "pact-of-the-blade",
    name: "Pact of the Blade",
    description: "Create a magical weapon you're proficient with. Can transform magic weapons into your pact weapon.",
  },
  {
    key: "pact-of-the-chain",
    name: "Pact of the Chain",
    description: "Learn find familiar with special options: imp, pseudodragon, quasit, or sprite.",
  },
  {
    key: "pact-of-the-tome",
    name: "Pact of the Tome",
    description: "Receive a Book of Shadows with 3 cantrips from any class spell list.",
  },
  {
    key: "pact-of-the-talisman",
    name: "Pact of the Talisman",
    description: "Receive a talisman that adds 1d4 to failed ability checks.",
  },
];

// ============================================
// DRUID LAND TYPES (Circle of the Land)
// ============================================

const LAND_TYPES = [
  { key: "arctic", name: "Arctic", description: "Cold tundra, glaciers, and frozen wastes." },
  { key: "coast", name: "Coast", description: "Beaches, cliffs, and coastal waters." },
  { key: "desert", name: "Desert", description: "Sandy dunes, rocky badlands, salt flats." },
  { key: "forest", name: "Forest", description: "Dense woodlands, ancient groves, jungles." },
  { key: "grassland", name: "Grassland", description: "Plains, prairies, savannas." },
  { key: "mountain", name: "Mountain", description: "High peaks, mountain passes, alpine." },
  { key: "swamp", name: "Swamp", description: "Marshes, bogs, fens, and wetlands." },
  { key: "underdark", name: "Underdark", description: "Subterranean caves and caverns." },
];

// ============================================
// CLASS FEATURE CHOICES
// ============================================

export const CLASS_FEATURE_CHOICES: Record<string, FeatureChoice[]> = {
  fighter: [
    {
      featureName: "Fighting Style",
      level: 1,
      type: "single",
      options: FIGHTING_STYLES,
    },
    {
      featureName: "Fighting Style (Additional)",
      level: 10, // Champion
      type: "single",
      options: FIGHTING_STYLES,
    },
  ],
  paladin: [
    {
      featureName: "Fighting Style",
      level: 2,
      type: "single",
      options: FIGHTING_STYLES.filter(fs => 
        ["defense", "dueling", "great-weapon-fighting", "protection", "blessed-warrior", "blind-fighting", "interception"].includes(fs.key)
      ),
    },
  ],
  ranger: [
    {
      featureName: "Fighting Style",
      level: 2,
      type: "single",
      options: FIGHTING_STYLES.filter(fs => 
        ["archery", "defense", "dueling", "thrown-weapon-fighting", "two-weapon-fighting", "blind-fighting", "druidic-warrior"].includes(fs.key)
      ),
    },
  ],
  rogue: [
    {
      featureName: "Expertise",
      level: 1,
      type: "multiple",
      count: 2,
      options: SKILLS,
    },
    {
      featureName: "Expertise (Additional)",
      level: 6,
      type: "multiple",
      count: 2,
      options: SKILLS,
    },
  ],
  bard: [
    {
      featureName: "Expertise",
      level: 3,
      type: "multiple",
      count: 2,
      options: SKILLS,
    },
    {
      featureName: "Expertise (Additional)",
      level: 10,
      type: "multiple",
      count: 2,
      options: SKILLS,
    },
  ],
  sorcerer: [
    {
      featureName: "Metamagic",
      level: 3,
      type: "multiple",
      count: 2,
      options: METAMAGIC,
    },
    {
      featureName: "Metamagic (Additional)",
      level: 10,
      type: "multiple",
      count: 1,
      options: METAMAGIC,
    },
    {
      featureName: "Metamagic (Additional)",
      level: 17,
      type: "multiple",
      count: 1,
      options: METAMAGIC,
    },
  ],
  warlock: [
    {
      featureName: "Pact Boon",
      level: 3,
      type: "single",
      options: PACT_BOONS,
    },
    {
      featureName: "Eldritch Invocation",
      level: 2,
      type: "multiple",
      count: 2,
      options: ELDRITCH_INVOCATIONS,
    },
    {
      featureName: "Eldritch Invocation (Additional)",
      level: 5,
      type: "multiple",
      count: 1,
      options: ELDRITCH_INVOCATIONS,
    },
    {
      featureName: "Eldritch Invocation (Additional)",
      level: 7,
      type: "multiple",
      count: 1,
      options: ELDRITCH_INVOCATIONS,
    },
    {
      featureName: "Eldritch Invocation (Additional)",
      level: 9,
      type: "multiple",
      count: 1,
      options: ELDRITCH_INVOCATIONS,
    },
    {
      featureName: "Eldritch Invocation (Additional)",
      level: 12,
      type: "multiple",
      count: 1,
      options: ELDRITCH_INVOCATIONS,
    },
    {
      featureName: "Eldritch Invocation (Additional)",
      level: 15,
      type: "multiple",
      count: 1,
      options: ELDRITCH_INVOCATIONS,
    },
    {
      featureName: "Eldritch Invocation (Additional)",
      level: 18,
      type: "multiple",
      count: 1,
      options: ELDRITCH_INVOCATIONS,
    },
  ],
};

// Subclass-specific choices
export const SUBCLASS_FEATURE_CHOICES: Record<string, FeatureChoice[]> = {
  "battle-master": [
    {
      featureName: "Combat Superiority: Maneuvers",
      level: 3,
      type: "multiple",
      count: 3,
      options: MANEUVERS,
    },
    {
      featureName: "Maneuvers (Additional)",
      level: 7,
      type: "multiple",
      count: 2,
      options: MANEUVERS,
    },
    {
      featureName: "Maneuvers (Additional)",
      level: 10,
      type: "multiple",
      count: 2,
      options: MANEUVERS,
    },
    {
      featureName: "Maneuvers (Additional)",
      level: 15,
      type: "multiple",
      count: 2,
      options: MANEUVERS,
    },
  ],
  "path-of-the-totem-warrior": [
    {
      featureName: "Totem Spirit",
      level: 3,
      type: "single",
      options: TOTEM_SPIRITS,
    },
    {
      featureName: "Aspect of the Beast",
      level: 6,
      type: "single",
      options: TOTEM_SPIRITS,
    },
    {
      featureName: "Totemic Attunement",
      level: 14,
      type: "single",
      options: TOTEM_SPIRITS,
    },
  ],
  "circle-of-the-land": [
    {
      featureName: "Land Type",
      level: 2,
      type: "single",
      options: LAND_TYPES,
    },
  ],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all feature choices for a class at a given level
 */
export function getFeatureChoicesForClass(
  className: string,
  level: number,
  subclassName?: string
): FeatureChoice[] {
  const classKey = className.toLowerCase().split("|")[0];
  const subclassKey = subclassName?.toLowerCase().split("|")[0].replace(/\s+/g, "-");
  
  const choices: FeatureChoice[] = [];
  
  // Add class choices
  const classChoices = CLASS_FEATURE_CHOICES[classKey] || [];
  for (const choice of classChoices) {
    if (choice.level <= level) {
      choices.push(choice);
    }
  }
  
  // Add subclass choices
  if (subclassKey) {
    const subChoices = SUBCLASS_FEATURE_CHOICES[subclassKey] || [];
    for (const choice of subChoices) {
      if (choice.level <= level) {
        choices.push(choice);
      }
    }
  }
  
  return choices;
}

/**
 * Get feature choices that are newly available at a specific level
 */
export function getNewFeatureChoicesAtLevel(
  className: string,
  level: number,
  subclassName?: string
): FeatureChoice[] {
  const classKey = className.toLowerCase().split("|")[0];
  const subclassKey = subclassName?.toLowerCase().split("|")[0].replace(/\s+/g, "-");
  
  const choices: FeatureChoice[] = [];
  
  // Add class choices for this exact level
  const classChoices = CLASS_FEATURE_CHOICES[classKey] || [];
  for (const choice of classChoices) {
    if (choice.level === level) {
      choices.push(choice);
    }
  }
  
  // Add subclass choices for this exact level
  if (subclassKey) {
    const subChoices = SUBCLASS_FEATURE_CHOICES[subclassKey] || [];
    for (const choice of subChoices) {
      if (choice.level === level) {
        choices.push(choice);
      }
    }
  }
  
  return choices;
}

/**
 * Validate that all required choices have been made
 */
export function validateFeatureChoices(
  className: string,
  level: number,
  subclassName: string | undefined,
  currentChoices: Record<string, string | string[]>
): { valid: boolean; missing: string[] } {
  const requiredChoices = getFeatureChoicesForClass(className, level, subclassName);
  const missing: string[] = [];
  
  for (const choice of requiredChoices) {
    const choiceKey = choice.featureName.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const currentValue = currentChoices[choiceKey];
    
    if (!currentValue) {
      missing.push(choice.featureName);
    } else if (choice.type === "multiple" && choice.count) {
      const selectedCount = Array.isArray(currentValue) ? currentValue.length : 1;
      if (selectedCount < choice.count) {
        missing.push(`${choice.featureName} (need ${choice.count - selectedCount} more)`);
      }
    }
  }
  
  return { valid: missing.length === 0, missing };
}
