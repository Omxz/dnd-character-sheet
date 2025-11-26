// Data processing utilities
// Transform raw 5etools data into app-friendly formats

import type { 
  DndClass, 
  Race, 
  Background, 
  Spell, 
  Item, 
  Feat,
  ProcessedClass,
  ProcessedRace,
  ProcessedBackground,
  ProcessedSpell,
  ProcessedItem,
  ProcessedFeat,
  Entry,
} from "@/types/dnd";
import { buildKey } from "./fetcher";
import { parseToPlainText } from "./parser";
import { SPELL_SCHOOLS } from "@/lib/utils";

// Process a class into app-friendly format
export function processClass(cls: DndClass): ProcessedClass {
  // Determine primary ability from spellcasting or first saving throw
  const primaryAbility = cls.spellcastingAbility || cls.proficiency[0] || "strength";
  
  // Find subclass level (usually when gainSubclassFeature appears)
  let subclassLevel = 3; // Default
  for (const feature of cls.classFeatures) {
    if (typeof feature === "object" && feature.gainSubclassFeature) {
      const match = feature.classFeature.match(/\|(\d+)\|/);
      if (match) {
        subclassLevel = parseInt(match[1]);
        break;
      }
    }
  }

  return {
    key: buildKey(cls.name, cls.source),
    name: cls.name,
    source: cls.source,
    hitDie: cls.hd.faces,
    primaryAbility,
    savingThrows: cls.proficiency,
    armorProficiencies: cls.startingProficiencies.armor || [],
    weaponProficiencies: cls.startingProficiencies.weapons || [],
    toolProficiencies: cls.startingProficiencies.tools || [],
    skillChoices: cls.startingProficiencies.skills || [],
    spellcasting: cls.spellcastingAbility ? {
      ability: cls.spellcastingAbility,
      type: cls.casterProgression || "full",
      cantripsKnown: cls.cantripProgression || [],
      spellsKnown: cls.spellsKnownProgressionFixed,
      preparedFormula: cls.preparedSpells,
    } : undefined,
    subclassTitle: cls.subclassTitle,
    subclassLevel,
  };
}

// Process a race into app-friendly format
export function processRace(race: Race): ProcessedRace {
  const speed = typeof race.speed === "number" ? race.speed : race.speed.walk;
  
  // Extract languages
  const languages: string[] = [];
  if (race.languageProficiencies) {
    for (const langProf of race.languageProficiencies) {
      if (langProf.common) languages.push("Common");
      // Add other specified languages
      for (const [lang, value] of Object.entries(langProf)) {
        if (lang !== "common" && lang !== "anyStandard" && value === true) {
          languages.push(lang.charAt(0).toUpperCase() + lang.slice(1));
        }
      }
    }
  }

  // Extract skill proficiencies
  const skillProficiencies: string[] = [];
  if (race.skillProficiencies) {
    for (const skillProf of race.skillProficiencies) {
      if (skillProf.choose) {
        // Will be handled as a choice in character creation
      }
    }
  }

  // XPHB uses +2/+1 or +1/+1/+1 ability score increases
  let abilityScoreChoice;
  if (race.ability) {
    for (const ab of race.ability) {
      if (ab.choose) {
        abilityScoreChoice = {
          count: ab.choose.count || 2,
          amount: ab.choose.amount || 1,
        };
        break;
      }
    }
  }

  return {
    key: buildKey(race.name, race.source),
    name: race.name,
    source: race.source,
    size: race.size,
    speed,
    darkvision: race.darkvision,
    traits: race.entries,
    abilityScoreChoice,
    languages,
    skillProficiencies,
  };
}

// Process a background into app-friendly format
export function processBackground(bg: Background): ProcessedBackground {
  // Extract skill proficiencies
  const skillProficiencies: string[] = [];
  if (bg.skillProficiencies) {
    for (const skillProf of bg.skillProficiencies) {
      for (const [skill, value] of Object.entries(skillProf)) {
        if (value === true) {
          skillProficiencies.push(skill);
        }
      }
    }
  }

  // Extract tool proficiencies
  const toolProficiencies: string[] = [];
  if (bg.toolProficiencies) {
    for (const toolProf of bg.toolProficiencies) {
      for (const [tool, value] of Object.entries(toolProf)) {
        if (value === true) {
          toolProficiencies.push(tool);
        }
      }
    }
  }

  // Count language choices
  let languageCount = 0;
  if (bg.languageProficiencies) {
    for (const langProf of bg.languageProficiencies) {
      if (langProf.anyStandard) {
        languageCount += langProf.anyStandard;
      }
    }
  }

  // Extract origin feat (XPHB feature)
  let originFeat: string | undefined;
  if (bg.feats) {
    for (const featEntry of bg.feats) {
      for (const [featName, value] of Object.entries(featEntry)) {
        if (value === true) {
          originFeat = featName;
          break;
        }
      }
    }
  }

  // Ability score choice for XPHB backgrounds
  let abilityScoreChoice;
  if (bg.ability) {
    for (const ab of bg.ability) {
      if (ab.choose) {
        abilityScoreChoice = {
          from: (ab.choose as { from: string[]; count: number }).from || [],
          count: (ab.choose as { from: string[]; count: number }).count || 3,
          amount: 1,
        };
        break;
      }
    }
  }

  // Build equipment description
  const equipmentParts: string[] = [];
  if (bg.startingEquipment) {
    for (const equipEntry of bg.startingEquipment) {
      for (const [item, count] of Object.entries(equipEntry)) {
        if (count === 1) {
          equipmentParts.push(item);
        } else {
          equipmentParts.push(`${item} (${count})`);
        }
      }
    }
  }

  return {
    key: buildKey(bg.name, bg.source),
    name: bg.name,
    source: bg.source,
    skillProficiencies,
    toolProficiencies,
    languages: languageCount,
    originFeat,
    abilityScoreChoice,
    equipment: equipmentParts.join(", ") || "See description",
  };
}

// Process a spell into app-friendly format
export function processSpell(spell: Spell): ProcessedSpell {
  // Format casting time
  const time = spell.time[0];
  let castingTime = `${time.number} ${time.unit}`;
  if (time.condition) {
    castingTime += ` (${time.condition})`;
  }

  // Format range
  let range: string;
  if (spell.range.distance.type === "self") {
    range = "Self";
    if (spell.range.type !== "point") {
      range += ` (${spell.range.distance.amount}-foot ${spell.range.type})`;
    }
  } else if (spell.range.distance.type === "touch") {
    range = "Touch";
  } else if (spell.range.distance.amount) {
    range = `${spell.range.distance.amount} ${spell.range.distance.type}`;
  } else {
    range = spell.range.distance.type;
  }

  // Format components
  const componentParts: string[] = [];
  if (spell.components.v) componentParts.push("V");
  if (spell.components.s) componentParts.push("S");
  if (spell.components.m) {
    if (typeof spell.components.m === "string") {
      componentParts.push(`M (${spell.components.m})`);
    } else {
      componentParts.push(`M (${spell.components.m.text})`);
    }
  }

  // Format duration
  const dur = spell.duration[0];
  let duration: string;
  if (dur.type === "instant") {
    duration = "Instantaneous";
  } else if (dur.type === "permanent") {
    duration = "Until dispelled";
  } else if (dur.duration) {
    duration = `${dur.duration.amount} ${dur.duration.type}${dur.duration.amount > 1 ? "s" : ""}`;
    if (dur.concentration) {
      duration = `Concentration, up to ${duration}`;
    }
  } else {
    duration = "Special";
  }

  // Extract classes
  const classes: string[] = [];
  if (spell.classes?.fromClassList) {
    for (const cls of spell.classes.fromClassList) {
      if (cls.source === "XPHB") {
        classes.push(cls.name);
      }
    }
  }

  return {
    key: buildKey(spell.name, spell.source),
    name: spell.name,
    source: spell.source,
    level: spell.level,
    school: SPELL_SCHOOLS[spell.school] || spell.school,
    castingTime,
    range,
    components: componentParts.join(", "),
    duration,
    concentration: spell.duration[0].concentration || false,
    ritual: spell.meta?.ritual || false,
    description: spell.entries,
    higherLevels: spell.entriesHigherLevel,
    classes,
  };
}

// Process an item into app-friendly format
export function processItem(item: Item): ProcessedItem {
  // Determine item type name
  const typeNames: Record<string, string> = {
    "LA": "Light Armor",
    "MA": "Medium Armor",
    "HA": "Heavy Armor",
    "S": "Shield",
    "M": "Melee Weapon",
    "R": "Ranged Weapon",
    "A": "Ammunition",
    "P": "Potion",
    "SC": "Scroll",
    "WD": "Wand",
    "RD": "Rod",
    "ST": "Staff",
    "RG": "Ring",
    "W": "Wondrous Item",
    "$": "Currency/Trade Good",
    "G": "Adventuring Gear",
    "INS": "Instrument",
    "AT": "Artisan's Tools",
    "GS": "Gaming Set",
    "T": "Tool",
  };

  // Format damage
  let damage: string | undefined;
  if (item.dmg1) {
    damage = item.dmg1;
    if (item.dmg2) {
      damage += ` / ${item.dmg2}`;
    }
  }

  // Property names
  const propertyNames: Record<string, string> = {
    "V": "Versatile",
    "H": "Heavy",
    "2H": "Two-Handed",
    "F": "Finesse",
    "L": "Light",
    "R": "Reach",
    "T": "Thrown",
    "A": "Ammunition",
    "LD": "Loading",
    "S": "Special",
  };

  const properties = item.property?.map(p => propertyNames[p] || p);

  return {
    key: buildKey(item.name, item.source),
    name: item.name,
    source: item.source,
    type: typeNames[item.type || ""] || item.type || "Item",
    rarity: item.rarity || "common",
    attunement: item.reqAttune || false,
    weight: item.weight,
    value: item.value,
    damage,
    damageType: item.dmgType,
    properties,
    ac: item.ac,
    description: item.entries || [],
  };
}

// Process a feat into app-friendly format
export function processFeat(feat: Feat): ProcessedFeat {
  // Format prerequisites
  let prerequisite: string | undefined;
  if (feat.prerequisite) {
    const prereqParts: string[] = [];
    for (const prereq of feat.prerequisite) {
      if (prereq.level) {
        if (typeof prereq.level === "number") {
          prereqParts.push(`Level ${prereq.level}`);
        } else {
          prereqParts.push(`Level ${prereq.level.level}`);
        }
      }
      if (prereq.race) {
        prereqParts.push(prereq.race.map(r => r.name).join(" or "));
      }
      if (prereq.ability) {
        for (const ab of prereq.ability) {
          for (const [ability, score] of Object.entries(ab)) {
            prereqParts.push(`${ability} ${score}+`);
          }
        }
      }
      if (prereq.spellcasting) {
        prereqParts.push("Spellcasting ability");
      }
      if (prereq.other) {
        prereqParts.push(prereq.other);
      }
    }
    prerequisite = prereqParts.join("; ");
  }

  // Category names
  const categoryNames: Record<string, string> = {
    "G": "General",
    "O": "Origin",
    "FS": "Fighting Style",
    "EB": "Epic Boon",
  };

  const categories = feat.category?.map(c => categoryNames[c] || c) || ["General"];

  return {
    key: buildKey(feat.name, feat.source),
    name: feat.name,
    source: feat.source,
    category: categories,
    prerequisite,
    description: feat.entries,
    repeatable: feat.repeatable || false,
  };
}
