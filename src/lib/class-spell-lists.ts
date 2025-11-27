// Class spell list mappings for D&D 5e 2024
// Maps spell names to the classes that can learn them
// This is necessary because the 5etools XPHB data doesn't include class associations yet

export const CLASS_SPELL_LISTS: Record<string, string[]> = {
  // CANTRIPS (Level 0)
  "acid splash": ["sorcerer", "wizard"],
  "blade ward": ["bard", "sorcerer", "warlock", "wizard"],
  "chill touch": ["sorcerer", "warlock", "wizard"],
  "dancing lights": ["bard", "sorcerer", "wizard"],
  "druidcraft": ["druid"],
  "eldritch blast": ["warlock"],
  "elementalism": ["druid", "sorcerer", "wizard"],
  "fire bolt": ["sorcerer", "wizard"],
  "friends": ["bard", "sorcerer", "warlock", "wizard"],
  "guidance": ["cleric", "druid"],
  "light": ["bard", "cleric", "sorcerer", "wizard"],
  "mage hand": ["bard", "sorcerer", "warlock", "wizard"],
  "mending": ["bard", "cleric", "druid", "sorcerer", "wizard"],
  "message": ["bard", "sorcerer", "wizard"],
  "mind sliver": ["sorcerer", "warlock", "wizard"],
  "minor illusion": ["bard", "sorcerer", "warlock", "wizard"],
  "poison spray": ["druid", "sorcerer", "warlock", "wizard"],
  "prestidigitation": ["bard", "sorcerer", "warlock", "wizard"],
  "produce flame": ["druid"],
  "ray of frost": ["sorcerer", "wizard"],
  "resistance": ["cleric", "druid"],
  "sacred flame": ["cleric"],
  "shillelagh": ["druid"],
  "shocking grasp": ["sorcerer", "wizard"],
  "spare the dying": ["cleric"],
  "starry wisp": ["bard", "druid"],
  "thaumaturgy": ["cleric"],
  "thorn whip": ["druid"],
  "thunderclap": ["bard", "druid", "sorcerer", "wizard"],
  "true strike": ["bard", "sorcerer", "warlock", "wizard"],
  "vicious mockery": ["bard"],

  // Level 1
  "alarm": ["ranger", "wizard"],
  "animal friendship": ["bard", "druid", "ranger"],
  "armor of agathys": ["warlock"],
  "arms of hadar": ["warlock"],
  "bane": ["bard", "cleric"],
  "bless": ["cleric", "paladin"],
  "burning hands": ["sorcerer", "wizard"],
  "charm person": ["bard", "druid", "sorcerer", "warlock", "wizard"],
  "chromatic orb": ["sorcerer", "wizard"],
  "color spray": ["sorcerer", "wizard"],
  "command": ["cleric", "paladin"],
  "compelled duel": ["paladin"],
  "comprehend languages": ["bard", "sorcerer", "warlock", "wizard"],
  "create or destroy water": ["cleric", "druid"],
  "cure wounds": ["bard", "cleric", "druid", "paladin", "ranger"],
  "detect evil and good": ["cleric", "paladin"],
  "detect magic": ["bard", "cleric", "druid", "paladin", "ranger", "sorcerer", "wizard"],
  "detect poison and disease": ["cleric", "druid", "paladin", "ranger"],
  "disguise self": ["bard", "sorcerer", "wizard"],
  "dissonant whispers": ["bard"],
  "divine favor": ["paladin"],
  "divine smite": ["paladin"],
  "ensnaring strike": ["ranger"],
  "entangle": ["druid"],
  "expeditious retreat": ["sorcerer", "warlock", "wizard"],
  "faerie fire": ["bard", "druid"],
  "false life": ["sorcerer", "wizard"],
  "feather fall": ["bard", "sorcerer", "wizard"],
  "find familiar": ["wizard"],
  "fog cloud": ["druid", "ranger", "sorcerer", "wizard"],
  "goodberry": ["druid", "ranger"],
  "grease": ["wizard"],
  "guiding bolt": ["cleric"],
  "healing word": ["bard", "cleric", "druid"],
  "hellish rebuke": ["warlock"],
  "heroism": ["bard", "paladin"],
  "hex": ["warlock"],
  "hunter's mark": ["ranger"],
  "identify": ["bard", "wizard"],
  "illusory script": ["bard", "warlock", "wizard"],
  "inflict wounds": ["cleric"],
  "jump": ["druid", "ranger", "sorcerer", "wizard"],
  "longstrider": ["bard", "druid", "ranger", "wizard"],
  "mage armor": ["sorcerer", "wizard"],
  "magic missile": ["sorcerer", "wizard"],
  "protection from evil and good": ["cleric", "paladin", "warlock", "wizard"],
  "purify food and drink": ["cleric", "druid", "paladin"],
  "ray of sickness": ["sorcerer", "wizard"],
  "sanctuary": ["cleric"],
  "shield": ["sorcerer", "wizard"],
  "shield of faith": ["cleric", "paladin"],
  "silent image": ["bard", "sorcerer", "wizard"],
  "sleep": ["bard", "sorcerer", "wizard"],
  "speak with animals": ["bard", "druid", "ranger"],
  "thunderwave": ["bard", "druid", "sorcerer", "wizard"],
  "unseen servant": ["bard", "warlock", "wizard"],
  "witch bolt": ["sorcerer", "warlock", "wizard"],

  // Level 2
  "aid": ["cleric", "paladin"],
  "alter self": ["sorcerer", "wizard"],
  "animal messenger": ["bard", "druid", "ranger"],
  "arcane lock": ["wizard"],
  "augury": ["cleric"],
  "barkskin": ["druid", "ranger"],
  "beast sense": ["druid", "ranger"],
  "blindness/deafness": ["bard", "cleric", "sorcerer", "wizard"],
  "blur": ["sorcerer", "wizard"],
  "calm emotions": ["bard", "cleric"],
  "cloud of daggers": ["bard", "sorcerer", "warlock", "wizard"],
  "continual flame": ["cleric", "wizard"],
  "crown of madness": ["bard", "sorcerer", "warlock", "wizard"],
  "darkness": ["sorcerer", "warlock", "wizard"],
  "darkvision": ["druid", "ranger", "sorcerer", "wizard"],
  "detect thoughts": ["bard", "sorcerer", "wizard"],
  "enhance ability": ["bard", "cleric", "druid", "sorcerer"],
  "enlarge/reduce": ["sorcerer", "wizard"],
  "enthrall": ["bard", "warlock"],
  "find steed": ["paladin"],
  "flame blade": ["druid"],
  "flaming sphere": ["druid", "wizard"],
  "gentle repose": ["cleric", "wizard"],
  "gust of wind": ["druid", "sorcerer", "wizard"],
  "heat metal": ["bard", "druid"],
  "hold person": ["bard", "cleric", "druid", "sorcerer", "warlock", "wizard"],
  "invisibility": ["bard", "sorcerer", "warlock", "wizard"],
  "knock": ["bard", "sorcerer", "wizard"],
  "lesser restoration": ["bard", "cleric", "druid", "paladin", "ranger"],
  "levitate": ["sorcerer", "wizard"],
  "locate animals or plants": ["bard", "druid", "ranger"],
  "locate object": ["bard", "cleric", "druid", "paladin", "ranger", "wizard"],
  "magic weapon": ["paladin", "wizard"],
  "mirror image": ["sorcerer", "warlock", "wizard"],
  "misty step": ["sorcerer", "warlock", "wizard"],
  "moonbeam": ["druid"],
  "pass without trace": ["druid", "ranger"],
  "prayer of healing": ["cleric"],
  "protection from poison": ["cleric", "druid", "paladin", "ranger"],
  "ray of enfeeblement": ["warlock", "wizard"],
  "scorching ray": ["sorcerer", "wizard"],
  "see invisibility": ["bard", "sorcerer", "wizard"],
  "shatter": ["bard", "sorcerer", "warlock", "wizard"],
  "silence": ["bard", "cleric", "ranger"],
  "spider climb": ["sorcerer", "warlock", "wizard"],
  "spike growth": ["druid", "ranger"],
  "spiritual weapon": ["cleric"],
  "suggestion": ["bard", "sorcerer", "warlock", "wizard"],
  "warding bond": ["cleric"],
  "web": ["sorcerer", "wizard"],
  "zone of truth": ["bard", "cleric", "paladin"],

  // Level 3
  "counterspell": ["sorcerer", "warlock", "wizard"],
  "dispel magic": ["bard", "cleric", "druid", "paladin", "sorcerer", "warlock", "wizard"],
  "fear": ["bard", "sorcerer", "warlock", "wizard"],
  "fly": ["sorcerer", "warlock", "wizard"],
  "gaseous form": ["sorcerer", "warlock", "wizard"],
  "hunger of hadar": ["warlock"],
  "hypnotic pattern": ["bard", "sorcerer", "warlock", "wizard"],
  "magic circle": ["cleric", "paladin", "warlock", "wizard"],
  "major image": ["bard", "sorcerer", "warlock", "wizard"],
  "remove curse": ["cleric", "paladin", "warlock", "wizard"],
  "tongues": ["bard", "cleric", "sorcerer", "warlock", "wizard"],
  "vampiric touch": ["sorcerer", "warlock", "wizard"],

  // Level 4
  "banishment": ["cleric", "paladin", "sorcerer", "warlock", "wizard"],
  "blight": ["druid", "sorcerer", "warlock", "wizard"],
  "dimension door": ["bard", "sorcerer", "warlock", "wizard"],
  "hallucinatory terrain": ["bard", "druid", "warlock", "wizard"],
  "summon aberration": ["warlock", "wizard"],
  "summon greater demon": ["warlock", "wizard"],

  // Level 5
  "contact other plane": ["warlock", "wizard"],
  "danse macabre": ["warlock", "wizard"],
  "dream": ["bard", "warlock", "wizard"],
  "hold monster": ["bard", "sorcerer", "warlock", "wizard"],
  "scrying": ["bard", "cleric", "druid", "warlock", "wizard"],
  "synaptic static": ["bard", "sorcerer", "warlock", "wizard"],

  // Level 6
  "arcane gate": ["sorcerer", "warlock", "wizard"],
  "circle of death": ["sorcerer", "warlock", "wizard"],
  "conjure fey": ["druid", "warlock"],
  "create undead": ["cleric", "warlock", "wizard"],
  "eyebite": ["bard", "sorcerer", "warlock", "wizard"],
  "flesh to stone": ["warlock", "wizard"],
  "mass suggestion": ["bard", "sorcerer", "warlock", "wizard"],
  "mental prison": ["sorcerer", "warlock", "wizard"],
  "scatter": ["sorcerer", "warlock", "wizard"],
  "soul cage": ["warlock", "wizard"],
  "summon fiend": ["warlock", "wizard"],
  "true seeing": ["bard", "cleric", "sorcerer", "warlock", "wizard"],

  // Level 7
  "crown of stars": ["sorcerer", "warlock", "wizard"],
  "etherealness": ["bard", "cleric", "sorcerer", "warlock", "wizard"],
  "finger of death": ["sorcerer", "warlock", "wizard"],
  "forcecage": ["bard", "warlock", "wizard"],
  "plane shift": ["cleric", "druid", "sorcerer", "warlock", "wizard"],

  // Level 8
  "demiplane": ["warlock", "wizard"],
  "dominate monster": ["bard", "sorcerer", "warlock", "wizard"],
  "feeblemind": ["bard", "druid", "warlock", "wizard"],
  "glibness": ["bard", "warlock"],
  "maddening darkness": ["warlock", "wizard"],
  "power word stun": ["bard", "sorcerer", "warlock", "wizard"],

  // Level 9
  "astral projection": ["cleric", "warlock", "wizard"],
  "foresight": ["bard", "druid", "warlock", "wizard"],
  "imprisonment": ["warlock", "wizard"],
  "power word kill": ["bard", "sorcerer", "warlock", "wizard"],
  "psychic scream": ["bard", "sorcerer", "warlock", "wizard"],
  "true polymorph": ["bard", "warlock", "wizard"],
  "weird": ["warlock", "wizard"],
};

/**
 * Get all spells for a specific class
 */
export function getSpellNamesForClass(className: string): Set<string> {
  const normalizedClass = className.toLowerCase();
  const spellNames = new Set<string>();

  for (const [spellName, classes] of Object.entries(CLASS_SPELL_LISTS)) {
    if (classes.includes(normalizedClass)) {
      spellNames.add(spellName.toLowerCase());
    }
  }

  return spellNames;
}

/**
 * Check if a spell is available to a class
 */
export function isSpellAvailableToClass(spellName: string, className: string): boolean {
  const normalizedSpell = spellName.toLowerCase();
  const normalizedClass = className.toLowerCase();
  const classes = CLASS_SPELL_LISTS[normalizedSpell];
  return classes ? classes.includes(normalizedClass) : false;
}
