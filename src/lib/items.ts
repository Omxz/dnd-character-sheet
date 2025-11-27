// Item data loader and parser for 5etools items data
import itemsData from "@/data/5etools/items.json";
import itemsBaseData from "@/data/5etools/items-base.json";

// Type definitions
export interface Item {
  name: string;
  source: string;
  type?: string;
  rarity?: string;
  weight?: number;
  value?: number;
  entries?: unknown[];
  // Weapon properties
  weapon?: boolean;
  weaponCategory?: string;
  dmg1?: string;
  dmgType?: string;
  range?: string;
  property?: (string | { abbrev?: string })[];
  // Armor properties
  armor?: boolean;
  ac?: number;
  stealth?: boolean;
  strength?: number;
  // Other
  wondrous?: boolean;
  reqAttune?: string | boolean;
  focus?: string[];
}

// Damage type abbreviations
const DAMAGE_TYPES: Record<string, string> = {
  B: "Bludgeoning",
  P: "Piercing",
  S: "Slashing",
  A: "Acid",
  C: "Cold",
  F: "Fire",
  O: "Force",
  L: "Lightning",
  N: "Necrotic",
  I: "Poison",
  Y: "Psychic",
  R: "Radiant",
  T: "Thunder",
};

// Item type abbreviations
const ITEM_TYPES: Record<string, string> = {
  A: "Ammunition",
  AF: "Ammunition (Futuristic)",
  AT: "Artisan's Tools",
  EM: "Eldritch Machine",
  EXP: "Explosive",
  FD: "Food and Drink",
  G: "Adventuring Gear",
  GS: "Gaming Set",
  HA: "Heavy Armor",
  INS: "Instrument",
  LA: "Light Armor",
  M: "Melee Weapon",
  MA: "Medium Armor",
  MNT: "Mount",
  MR: "Master Rune",
  OTH: "Other",
  P: "Potion",
  R: "Ranged Weapon",
  RD: "Rod",
  RG: "Ring",
  S: "Shield",
  SC: "Scroll",
  SCF: "Spellcasting Focus",
  SHP: "Ship",
  T: "Tool",
  TAH: "Tack and Harness",
  TG: "Trade Good",
  VEH: "Vehicle",
  WD: "Wand",
};

// Property abbreviations
const PROPERTIES: Record<string, string> = {
  "2H": "Two-Handed",
  A: "Ammunition",
  AF: "Ammunition (Futuristic)",
  BF: "Burst Fire",
  F: "Finesse",
  H: "Heavy",
  L: "Light",
  LD: "Loading",
  R: "Reach",
  RLD: "Reload",
  S: "Special",
  T: "Thrown",
  V: "Versatile",
};

// Cache for loaded items
let allItemsCache: Item[] | null = null;
let itemMapCache: Map<string, Item> | null = null;

// Get all items (base items + magic items) - XPHB edition preferred
export function getAllItems(): Item[] {
  if (allItemsCache) return allItemsCache;

  const baseItems = (itemsBaseData as { baseitem?: Item[] }).baseitem || [];
  const magicItems = (itemsData as { item?: Item[] }).item || [];

  // Combine and dedupe, preferring XPHB edition
  const itemMap = new Map<string, Item>();

  // Add base items first
  for (const item of baseItems) {
    const key = item.name.toLowerCase();
    const existing = itemMap.get(key);
    // Prefer XPHB edition
    if (!existing || item.source === "XPHB" || (existing.source !== "XPHB" && item.source === "PHB")) {
      itemMap.set(key, item);
    }
  }

  // Add magic items (won't overwrite base items with same name)
  for (const item of magicItems) {
    const key = item.name.toLowerCase();
    if (!itemMap.has(key)) {
      itemMap.set(key, item);
    }
  }

  allItemsCache = Array.from(itemMap.values());
  return allItemsCache;
}

// Build item lookup map
function getItemMap(): Map<string, Item> {
  if (itemMapCache) return itemMapCache;

  itemMapCache = new Map();
  for (const item of getAllItems()) {
    itemMapCache.set(item.name.toLowerCase(), item);
  }
  return itemMapCache;
}

// Get a single item by name
export function getItem(name: string): Item | undefined {
  return getItemMap().get(name.toLowerCase());
}

// Search items by name
export function searchItems(query: string, limit = 20): Item[] {
  if (!query || query.length < 2) return [];

  const lowerQuery = query.toLowerCase();
  const items = getAllItems();

  // Score and sort results
  const scored = items
    .map((item) => {
      const lowerName = item.name.toLowerCase();
      let score = 0;

      // Exact match
      if (lowerName === lowerQuery) score = 100;
      // Starts with query
      else if (lowerName.startsWith(lowerQuery)) score = 80;
      // Contains query
      else if (lowerName.includes(lowerQuery)) score = 60;
      // Fuzzy match (words match)
      else {
        const queryWords = lowerQuery.split(/\s+/);
        const matchedWords = queryWords.filter((w) => lowerName.includes(w));
        if (matchedWords.length > 0) {
          score = 20 + (matchedWords.length / queryWords.length) * 30;
        }
      }

      // Prefer XPHB source
      if (item.source === "XPHB") score += 5;

      return { item, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((x) => x.item);
}

// Get items by category
export function getItemsByCategory(category: string): Item[] {
  const items = getAllItems();
  const lowerCat = category.toLowerCase();

  return items.filter((item) => {
    if (lowerCat === "weapon" || lowerCat === "weapons") {
      return item.weapon || item.type === "M" || item.type === "R";
    }
    if (lowerCat === "armor") {
      return item.armor || ["LA", "MA", "HA", "S"].includes(item.type || "");
    }
    if (lowerCat === "adventuring gear" || lowerCat === "gear") {
      return item.type === "G";
    }
    if (lowerCat === "tools") {
      return item.type === "AT" || item.type === "T" || item.type === "GS" || item.type === "INS";
    }
    if (lowerCat === "magic" || lowerCat === "magic items") {
      return item.rarity && item.rarity !== "none";
    }
    if (lowerCat === "potions") {
      return item.type === "P";
    }
    if (lowerCat === "scrolls") {
      return item.type === "SC";
    }
    return false;
  });
}

// Format item for display
export function formatItem(item: Item): {
  name: string;
  type: string;
  rarity: string;
  weight: string;
  value: string;
  damage: string;
  properties: string[];
  ac: string;
  description: string;
  attunement: string;
} {
  // Get type string
  let type = "Item";
  if (item.type) {
    const baseType = item.type.split("|")[0];
    type = ITEM_TYPES[baseType] || item.type;
  }
  if (item.weapon) type = item.weaponCategory === "martial" ? "Martial Weapon" : "Simple Weapon";
  if (item.armor) type = "Armor";

  // Rarity
  const rarity = item.rarity && item.rarity !== "none" 
    ? item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1) 
    : "";

  // Weight
  const weight = item.weight ? `${item.weight} lb.` : "";

  // Value (in cp, convert to gp/sp/cp)
  let value = "";
  if (item.value) {
    if (item.value >= 100) {
      value = `${Math.floor(item.value / 100)} gp`;
    } else if (item.value >= 10) {
      value = `${Math.floor(item.value / 10)} sp`;
    } else {
      value = `${item.value} cp`;
    }
  }

  // Damage
  let damage = "";
  if (item.dmg1) {
    const dmgType = item.dmgType ? DAMAGE_TYPES[item.dmgType] || item.dmgType : "";
    damage = `${item.dmg1}${dmgType ? ` ${dmgType}` : ""}`;
  }

  // Properties
  const properties: string[] = [];
  if (item.property) {
    for (const prop of item.property) {
      // Handle both string and object properties
      const propStr = typeof prop === "string" ? prop : (prop as { abbrev?: string })?.abbrev || "";
      if (propStr) {
        const baseProp = propStr.split("|")[0];
        const propName = PROPERTIES[baseProp] || baseProp;
        properties.push(propName);
      }
    }
  }
  if (item.range) {
    properties.push(`Range ${item.range}`);
  }

  // AC
  let ac = "";
  if (item.ac) {
    ac = `AC ${item.ac}`;
    if (item.type === "LA") ac += " + Dex";
    if (item.type === "MA") ac += " + Dex (max 2)";
  }
  if (item.stealth) {
    ac += " (Stealth Disadvantage)";
  }

  // Description
  let description = "";
  if (item.entries) {
    description = item.entries
      .filter((e): e is string => typeof e === "string")
      .join(" ")
      .replace(/\{@\w+\s+([^}|]+)(?:\|[^}]*)?\}/g, "$1") // Remove 5etools tags
      .slice(0, 500);
    if (description.length === 500) description += "...";
  }

  // Attunement
  let attunement = "";
  if (item.reqAttune) {
    if (typeof item.reqAttune === "string") {
      attunement = `Requires Attunement ${item.reqAttune}`;
    } else {
      attunement = "Requires Attunement";
    }
  }

  return {
    name: item.name,
    type,
    rarity,
    weight,
    value,
    damage,
    properties,
    ac,
    description,
    attunement,
  };
}

// Get weapon categories for filtering
export function getWeaponCategories(): string[] {
  return ["Simple Melee", "Simple Ranged", "Martial Melee", "Martial Ranged"];
}

// Get armor categories
export function getArmorCategories(): string[] {
  return ["Light Armor", "Medium Armor", "Heavy Armor", "Shield"];
}

// Common item categories for quick selection
export function getItemCategories(): { name: string; key: string }[] {
  return [
    { name: "All Items", key: "all" },
    { name: "Weapons", key: "weapons" },
    { name: "Armor & Shields", key: "armor" },
    { name: "Adventuring Gear", key: "gear" },
    { name: "Tools", key: "tools" },
    { name: "Magic Items", key: "magic" },
    { name: "Potions", key: "potions" },
  ];
}
