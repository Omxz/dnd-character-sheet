// Script to download 5etools data and save locally
// Run with: node scripts/download-data.mjs

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'src', 'data', '5etools');

const BASE_URL = "https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/main/data";

// XPHB Classes to download
const CLASSES = [
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

// Files to download
const FILES_TO_DOWNLOAD = [
  { url: "/races.json", output: "races.json" },
  { url: "/backgrounds.json", output: "backgrounds.json" },
  { url: "/spells/spells-xphb.json", output: "spells-xphb.json" },
  { url: "/items.json", output: "items.json" },
  { url: "/items-base.json", output: "items-base.json" },
  { url: "/feats.json", output: "feats.json" },
];

// Add class files
CLASSES.forEach(cls => {
  FILES_TO_DOWNLOAD.push({
    url: `/class/class-${cls}.json`,
    output: `class-${cls}.json`,
  });
});

async function downloadFile(url, outputPath) {
  console.log(`Downloading ${url}...`);
  
  try {
    const response = await fetch(`${BASE_URL}${url}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Filter to only XPHB/One D&D content where applicable
    const filtered = filterXPHBContent(data, outputPath);
    
    writeFileSync(outputPath, JSON.stringify(filtered, null, 2));
    console.log(`  ✓ Saved to ${outputPath}`);
    
    return true;
  } catch (error) {
    console.error(`  ✗ Failed: ${error.message}`);
    return false;
  }
}

function filterXPHBContent(data, filename) {
  // Filter arrays to only include XPHB (2024) content
  const filtered = { ...data };
  
  const isXPHB = (item) => 
    item.source === "XPHB" || item.edition === "one";
  
  // Filter main arrays
  if (filtered.race) {
    filtered.race = filtered.race.filter(isXPHB);
  }
  if (filtered.background) {
    filtered.background = filtered.background.filter(isXPHB);
  }
  if (filtered.feat) {
    filtered.feat = filtered.feat.filter(isXPHB);
  }
  if (filtered.class) {
    filtered.class = filtered.class.filter(isXPHB);
  }
  if (filtered.subclass) {
    filtered.subclass = filtered.subclass.filter(isXPHB);
  }
  if (filtered.classFeature) {
    filtered.classFeature = filtered.classFeature.filter(f => f.classSource === "XPHB");
  }
  if (filtered.subclassFeature) {
    filtered.subclassFeature = filtered.subclassFeature.filter(f => f.classSource === "XPHB");
  }
  // Spells file is already XPHB-only (spells-xphb.json)
  // Items - keep all for now as characters might use various items
  
  return filtered;
}

async function main() {
  console.log("🎲 D&D 5etools Data Downloader");
  console.log("==============================\n");
  
  // Create data directory
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
    console.log(`Created directory: ${DATA_DIR}\n`);
  }
  
  let success = 0;
  let failed = 0;
  
  for (const file of FILES_TO_DOWNLOAD) {
    const outputPath = join(DATA_DIR, file.output);
    const result = await downloadFile(file.url, outputPath);
    if (result) success++;
    else failed++;
  }
  
  console.log(`\n==============================`);
  console.log(`✓ Downloaded: ${success} files`);
  if (failed > 0) {
    console.log(`✗ Failed: ${failed} files`);
  }
  console.log("\nData is ready! You can now use it in your app.");
}

main().catch(console.error);
