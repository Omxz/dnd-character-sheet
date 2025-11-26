// 5etools data fetching and caching utilities
// Fetches XPHB (2024 edition) data from the 5etools repository

const BASE_URL = "https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/main/data";

// Cache for fetched data
const dataCache = new Map<string, unknown>();

// Generic fetch function with caching
async function fetchData<T>(path: string): Promise<T> {
  const cacheKey = path;
  
  if (dataCache.has(cacheKey)) {
    return dataCache.get(cacheKey) as T;
  }
  
  const response = await fetch(`${BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
  }
  
  const data = await response.json();
  dataCache.set(cacheKey, data);
  return data;
}

// Filter data by XPHB source (2024 rules)
function filterByXPHB<T extends { source?: string; edition?: string }>(items: T[]): T[] {
  return items.filter(item => 
    item.source === "XPHB" || item.edition === "one"
  );
}

// Classes
export interface ClassDataFile {
  class: Array<{
    name: string;
    source: string;
    edition?: string;
    [key: string]: unknown;
  }>;
  subclass: Array<{
    name: string;
    source: string;
    className: string;
    classSource: string;
    [key: string]: unknown;
  }>;
  classFeature: Array<{
    name: string;
    source: string;
    className: string;
    level: number;
    [key: string]: unknown;
  }>;
  subclassFeature?: Array<{
    name: string;
    source: string;
    className: string;
    subclassShortName: string;
    level: number;
    [key: string]: unknown;
  }>;
}

// List of XPHB classes
const XPHB_CLASSES = [
  "barbarian",
  "bard", 
  "cleric",
  "druid",
  "fighter",
  "monk",
  "paladin",
  "ranger",
  "rogue",
  "sorcerer",
  "warlock",
  "wizard",
];

export async function fetchClassData(className: string): Promise<ClassDataFile> {
  return fetchData<ClassDataFile>(`/class/class-${className.toLowerCase()}.json`);
}

export async function fetchAllClasses(): Promise<ClassDataFile[]> {
  const classPromises = XPHB_CLASSES.map(name => fetchClassData(name));
  return Promise.all(classPromises);
}

// Races
export interface RacesDataFile {
  race: Array<{
    name: string;
    source: string;
    edition?: string;
    [key: string]: unknown;
  }>;
}

export async function fetchRaces(): Promise<RacesDataFile> {
  return fetchData<RacesDataFile>("/races.json");
}

export async function fetchXPHBRaces() {
  const data = await fetchRaces();
  return filterByXPHB(data.race);
}

// Backgrounds
export interface BackgroundsDataFile {
  background: Array<{
    name: string;
    source: string;
    edition?: string;
    [key: string]: unknown;
  }>;
}

export async function fetchBackgrounds(): Promise<BackgroundsDataFile> {
  return fetchData<BackgroundsDataFile>("/backgrounds.json");
}

export async function fetchXPHBBackgrounds() {
  const data = await fetchBackgrounds();
  return filterByXPHB(data.background);
}

// Spells
export interface SpellsDataFile {
  spell: Array<{
    name: string;
    source: string;
    level: number;
    school: string;
    [key: string]: unknown;
  }>;
}

export async function fetchSpells(source: string = "spells-xphb"): Promise<SpellsDataFile> {
  return fetchData<SpellsDataFile>(`/spells/${source}.json`);
}

export async function fetchXPHBSpells() {
  const data = await fetchSpells("spells-xphb");
  return data.spell;
}

// Items
export interface ItemsDataFile {
  item: Array<{
    name: string;
    source: string;
    type?: string;
    rarity?: string;
    [key: string]: unknown;
  }>;
  baseitem?: Array<{
    name: string;
    source: string;
    [key: string]: unknown;
  }>;
}

export async function fetchItems(): Promise<ItemsDataFile> {
  return fetchData<ItemsDataFile>("/items.json");
}

export async function fetchBaseItems(): Promise<ItemsDataFile> {
  return fetchData<ItemsDataFile>("/items-base.json");
}

// Feats
export interface FeatsDataFile {
  feat: Array<{
    name: string;
    source: string;
    edition?: string;
    category?: string[];
    [key: string]: unknown;
  }>;
}

export async function fetchFeats(): Promise<FeatsDataFile> {
  return fetchData<FeatsDataFile>("/feats.json");
}

export async function fetchXPHBFeats() {
  const data = await fetchFeats();
  return filterByXPHB(data.feat);
}

// Build lookup keys
export function buildKey(name: string, source: string): string {
  return `${name.toLowerCase()}|${source.toUpperCase()}`;
}

// Parse a key back to name and source
export function parseKey(key: string): { name: string; source: string } {
  const [name, source] = key.split("|");
  return { name, source };
}

// Clear the cache (useful for testing or forced refresh)
export function clearDataCache(): void {
  dataCache.clear();
}
