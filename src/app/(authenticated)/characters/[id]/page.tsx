"use client";

import { useAuth } from "@/components/auth";
import { createClient } from "@/lib/supabase/client";
import { getClassFeatures, getClassData } from "@/lib/data";
import { getClassResources, calculateAC, calculateSpeed, getExtraAttacks, SPELLCASTING_ABILITY } from "@/lib/class-features";
import { getSpell, formatComponents, getDamageAtLevel, type SpellData } from "@/lib/spells";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Loader2, 
  User,
  Shield,
  Swords,
  Scroll,
  Package,
  Sparkles,
  Star,
  Moon,
  Settings,
  Footprints,
  Eye,
  Printer,
  TrendingUp,
  Zap,
  Sun
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  AbilityScoresGrid,
  HPBar,
  DeathSaves,
  SpellSlotTracker,
  SkillsList,
  DND_SKILLS,
  calculateSkillModifier,
  ConditionTracker,
  ConditionType,
  FeatureList,
  CollapsibleSection,
  Card,
  StatBox,
  StatsGrid,
  AttackList,
  SpellList,
  AvatarUpload,
  LevelUpModal,
  ResourceTracker,
  FeatureChoiceModal,
} from "@/components/character";
import { getFeatureChoicesForClass } from "@/lib/feature-choices";

interface Character {
  id: string;
  name: string;
  level: number;
  race_key: string;
  subrace_key: string | null;
  class_levels: Array<{ class: string; level: number; subclass?: string }>;
  background_key: string;
  ability_scores: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  max_hp: number;
  current_hp: number;
  temp_hp?: number;
  skill_proficiencies: string[];
  saving_throw_proficiencies?: string[];
  equipment: Array<{ item_key?: string; name?: string; quantity: number }>;
  spells_known: { cantrips: string[]; spells: string[] };
  prepared_spells?: string[];
  spell_slots_used?: Record<number, number>;
  personality_traits: string | null;
  ideals: string | null;
  bonds: string | null;
  flaws: string | null;
  backstory: string | null;
  user_id: string;
  created_at: string;
  // New fields
  inspiration?: boolean;
  exhaustion?: number;
  xp?: number;
  avatar_url?: string;
  concentration_spell?: string;
  conditions?: string[];
  death_saves?: { successes: number; failures: number };
  armor_class?: number;
  speed?: number;
  proficiency_bonus?: number;
  class_feature_choices?: Record<string, string | string[]>;
  feature_uses?: Record<string, { used: number; max: number }>;
}

export default function CharacterDetailPage() {
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showFeatureChoices, setShowFeatureChoices] = useState(false);
  const [classFeatures, setClassFeatures] = useState<Array<{
    name: string;
    source: string;
    description: string;
    level: number;
  }>>([]);
  const [featureFilter, setFeatureFilter] = useState<"all" | number>("all");

  const characterId = params.id as string;

  const fetchCharacter = useCallback(async () => {
    if (!user || !characterId) return;

    const supabase = createClient();
    if (!supabase) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from("characters") as any)
        .select("*")
        .eq("id", characterId)
        .single();

      if (error) throw error;
      setCharacter(data);
    } catch (err) {
      console.error("Error fetching character:", err);
    } finally {
      setLoading(false);
    }
  }, [user, characterId]);

  useEffect(() => {
    if (user) {
      fetchCharacter();
    }
  }, [user, fetchCharacter]);

  // Debug: Log character class_levels
  // Load class features when character is loaded
  useEffect(() => {
    if (!character?.class_levels?.length) return;
    
    const loadFeatures = async () => {
      const allFeatures: Array<{
        name: string;
        source: string;
        description: string;
        level: number;
      }> = [];
      
      for (const cl of character.class_levels) {
        const className = cl.class.split("|")[0];
        
        // Get class features - pass just the class name, not the full key
        const features = getClassFeatures(className, cl.level);
        
        for (const feature of features) {
          // Extract description from entries
          let description = "";
          if (feature.entries && Array.isArray(feature.entries)) {
            description = feature.entries
              .filter((e): e is string => typeof e === "string")
              .join(" ")
              .slice(0, 300);
            if (description.length === 300) description += "...";
          }
          
          allFeatures.push({
            name: feature.name,
            source: className.charAt(0).toUpperCase() + className.slice(1),
            description: description || `A ${className} feature gained at level ${feature.level}.`,
            level: feature.level,
          });
        }
        
        // Get subclass features if character has a subclass
        if (cl.subclass) {
          const subclassName = cl.subclass.split("|")[0];
          const classData = getClassData(className);
          
          if (classData?.subclassFeature) {
            // Find matching subclass features
            const subclassFeatures = classData.subclassFeature.filter(sf => {
              const matchesClass = sf.className.toLowerCase() === className.toLowerCase();
              const matchesSubclass = sf.subclassShortName?.toLowerCase() === subclassName.toLowerCase() ||
                                      sf.name.toLowerCase().includes(subclassName.toLowerCase());
              const matchesLevel = sf.level <= cl.level;
              return matchesClass && matchesSubclass && matchesLevel;
            });
            
            for (const feature of subclassFeatures) {
              let description = "";
              if (feature.entries && Array.isArray(feature.entries)) {
                description = feature.entries
                  .filter((e): e is string => typeof e === "string")
                  .join(" ")
                  .slice(0, 300);
                if (description.length === 300) description += "...";
              }
              
              allFeatures.push({
                name: feature.name,
                source: subclassName.charAt(0).toUpperCase() + subclassName.slice(1),
                description: description || `A ${subclassName} feature gained at level ${feature.level}.`,
                level: feature.level,
              });
            }
          }
        }
      }
      
      // Sort by level
      allFeatures.sort((a, b) => a.level - b.level);
      
      console.log("Setting classFeatures:", allFeatures.length, allFeatures);
      setClassFeatures(allFeatures);
    };
    
    loadFeatures();
  }, [character?.class_levels]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateCharacter = useCallback(async (updates: Partial<Character>) => {
    if (!character) return;

    setSaving(true);
    const supabase = createClient();
    if (!supabase) return;

    // Only include fields that exist in the base schema
    // Fields like inspiration, exhaustion, etc. require running the migration
    const safeFields = [
      'name', 'level', 'race_key', 'subrace_key', 'class_levels', 'background_key',
      'ability_scores', 'current_hp', 'max_hp', 'temp_hp', 'hit_dice_remaining',
      'spell_slots_remaining', 'spells_known', 'spells_prepared',
      'skill_proficiencies', 'saving_throw_proficiencies', 'tool_proficiencies', 'languages',
      'feats', 'equipment', 'currency',
      'personality_traits', 'ideals', 'bonds', 'flaws', 'backstory', 'notes',
      'conditions', 'death_saves', 'is_public'
    ];
    
    // Extended fields from migration (these may fail if migration not run)
    const extendedFields = [
      'inspiration', 'exhaustion', 'xp', 'avatar_url', 'concentration_spell',
      'class_feature_choices', 'feature_uses', 'appearance'
    ];
    
    // Filter updates to only include known fields
    const safeUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (safeFields.includes(key) || extendedFields.includes(key)) {
        safeUpdates[key] = value;
      }
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("characters") as any)
        .update(safeUpdates)
        .eq("id", character.id);

      if (error) {
        // If error mentions a column, it might be the migration fields
        console.warn("Update error (migration may be needed):", error);
        // Try again with only safe fields
        const basicUpdates: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(updates)) {
          if (safeFields.includes(key)) {
            basicUpdates[key] = value;
          }
        }
        if (Object.keys(basicUpdates).length > 0) {
          const { error: retryError } = await (supabase.from("characters") as any)
            .update(basicUpdates)
            .eq("id", character.id);
          if (retryError) throw retryError;
        }
      }
      
      setCharacter({ ...character, ...updates });
    } catch (err) {
      console.error("Error updating character:", err);
    } finally {
      setSaving(false);
    }
  }, [character]);

  const formatRace = (raceKey: string) => {
    return raceKey.split("|")[0].replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatClass = (classLevels: Array<{ class: string; level: number; subclass?: string }>) => {
    if (!classLevels || classLevels.length === 0) return "Unknown";
    return classLevels
      .map(cl => {
        const className = cl.class.split("|")[0].replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
        const subclassName = cl.subclass?.split("|")[0].replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
        return subclassName ? `${className} (${subclassName}) ${cl.level}` : `${className} ${cl.level}`;
      })
      .join(" / ");
  };

  const formatBackground = (bgKey: string) => {
    return bgKey.split("|")[0].replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const getModifier = (score: number) => Math.floor((score - 10) / 2);

  const getProficiencyBonus = (level: number) => Math.ceil(level / 4) + 1;

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!character) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <h2 className="text-xl font-bold mb-2">Character Not Found</h2>
        <p className="text-gray-400 mb-6">This character doesn&apos;t exist or you don&apos;t have access.</p>
        <Link
          href="/characters"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Characters
        </Link>
      </div>
    );
  }

  const isOwner = character.user_id === user?.id;
  const profBonus = character.proficiency_bonus || getProficiencyBonus(character.level);
  const abilities = character.ability_scores;

  // Get primary class info
  const primaryClass = character.class_levels?.[0];
  const primaryClassName = primaryClass?.class.split("|")[0].toLowerCase() || "";
  const primarySubclass = primaryClass?.subclass?.split("|")[0] || null;
  const primaryClassLevel = primaryClass?.level || character.level;

  // Calculate class resources (Ki, Rage, etc.)
  const classResources = getClassResources(
    primaryClassName,
    primarySubclass,
    primaryClassLevel,
    abilities
  );

  // Calculate class-based AC
  const { ac: calculatedAC, source: acSource } = calculateAC(
    primaryClassName,
    primaryClassLevel,
    abilities,
    character.armor_class || 10,
    false, // hasArmor - would need to check equipment
    false  // hasShield - would need to check equipment
  );

  // Calculate class-based speed  
  const calculatedSpeed = calculateSpeed(
    primaryClassName,
    primaryClassLevel,
    30, // base speed - could come from race
    false // hasHeavyArmor
  );

  // Get extra attacks
  const extraAttacks = getExtraAttacks(primaryClassName, primaryClassLevel);

  // Calculate spellcasting stats
  const spellcastingAbility = SPELLCASTING_ABILITY[primaryClassName] || SPELLCASTING_ABILITY[primarySubclass || ""] || null;
  const spellcastingMod = spellcastingAbility ? getModifier(abilities[spellcastingAbility as keyof typeof abilities] || 10) : 0;
  const spellSaveDC = 8 + profBonus + spellcastingMod;
  const spellAttackBonus = profBonus + spellcastingMod;

  // Calculate skills with proficiency
  const abilityMap: Record<string, keyof typeof abilities> = {
    STR: "strength",
    DEX: "dexterity",
    CON: "constitution",
    INT: "intelligence",
    WIS: "wisdom",
    CHA: "charisma",
  };
  
  const skills = DND_SKILLS.map(skill => {
    const abilityScore = abilities[abilityMap[skill.ability]];
    const proficient = character.skill_proficiencies?.includes(skill.name.toLowerCase().replace(/ /g, "-")) || false;
    
    return {
      name: skill.name,
      ability: skill.ability,
      modifier: calculateSkillModifier(abilityScore, profBonus, proficient, false),
      proficient,
    };
  });

  // Get spell slot progression (basic implementation)
  const getSpellSlots = () => {
    const slots = [];
    const casterLevel = character.level; // Simplified - should check class
    
    // Full caster spell slots table
    const slotTable: Record<number, number[]> = {
      1: [2], 2: [3], 3: [4, 2], 4: [4, 3], 5: [4, 3, 2],
      6: [4, 3, 3], 7: [4, 3, 3, 1], 8: [4, 3, 3, 2], 9: [4, 3, 3, 3, 1],
      10: [4, 3, 3, 3, 2], 11: [4, 3, 3, 3, 2, 1], 12: [4, 3, 3, 3, 2, 1],
      13: [4, 3, 3, 3, 2, 1, 1], 14: [4, 3, 3, 3, 2, 1, 1], 15: [4, 3, 3, 3, 2, 1, 1, 1],
      16: [4, 3, 3, 3, 2, 1, 1, 1], 17: [4, 3, 3, 3, 2, 1, 1, 1, 1], 18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
      19: [4, 3, 3, 3, 3, 2, 1, 1, 1], 20: [4, 3, 3, 3, 3, 2, 2, 1, 1],
    };

    const slotsForLevel = slotTable[casterLevel] || [];
    for (let i = 0; i < slotsForLevel.length; i++) {
      slots.push({
        level: i + 1,
        total: slotsForLevel[i],
        used: character.spell_slots_used?.[i + 1] || 0,
      });
    }
    return slots;
  };
  
  // Martial Arts die progression for monks
  const getMartialArtsDie = (level: number) => {
    if (level >= 17) return "1d12";
    if (level >= 11) return "1d10";
    if (level >= 5) return "1d8";
    return "1d6";
  };

  // Build attack data
  const attacks: Array<{
    name: string;
    attackBonus: number;
    damage: string;
    damageType: string;
  }> = [];

  // Add unarmed strike for all characters (monks get better damage)
  if (primaryClassName === "monk") {
    const martialArtsDie = getMartialArtsDie(character.level);
    attacks.push({
      name: "Unarmed Strike",
      attackBonus: getModifier(abilities.dexterity) + profBonus,
      damage: martialArtsDie,
      damageType: "bludgeoning",
    });
    // Monks can also use simple weapons as monk weapons
    attacks.push({
      name: "Monk Weapon",
      attackBonus: getModifier(abilities.dexterity) + profBonus,
      damage: martialArtsDie,
      damageType: "varies",
    });
  } else {
    // Standard unarmed strike for non-monks
    attacks.push({
      name: "Unarmed Strike",
      attackBonus: getModifier(abilities.strength) + profBonus,
      damage: "1",
      damageType: "bludgeoning",
    });
  }

  // Add attacks from equipment
  const weaponKeywords = ["sword", "axe", "bow", "dagger", "mace", "staff", "crossbow", 
                          "spear", "javelin", "handaxe", "hammer", "flail", "halberd",
                          "glaive", "pike", "rapier", "scimitar", "shortsword", "longsword",
                          "greataxe", "greatsword", "maul", "morningstar", "trident", "warhammer",
                          "whip", "blowgun", "dart", "sling", "shortbow", "longbow", "quarterstaff"];
  
  character.equipment
    ?.filter(item => {
      const itemName = item?.name || item?.item_key || "";
      return itemName && weaponKeywords.some(w => itemName.toLowerCase().includes(w));
    })
    .forEach(item => {
      const itemName = item.name || item.item_key || "";
      const displayName = item.name || (item.item_key 
        ? item.item_key.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
        : "Unknown Weapon");
      
      const isFinesse = ["dagger", "rapier", "shortsword", "scimitar", "whip", "dart"].some(w => 
        itemName.toLowerCase().includes(w)
      );
      const isRanged = ["bow", "crossbow", "dart", "sling", "blowgun", "javelin"].some(w => 
        itemName.toLowerCase().includes(w)
      );
      
      // Use DEX for finesse/ranged, STR otherwise (monks always use DEX)
      const abilityMod = (isFinesse || isRanged || primaryClassName === "monk") 
        ? getModifier(abilities.dexterity) 
        : getModifier(abilities.strength);
      
      // Determine damage die based on weapon name
      let damageDie = "1d6";
      if (itemName.toLowerCase().includes("great") || itemName.toLowerCase().includes("maul")) {
        damageDie = "2d6";
      } else if (itemName.toLowerCase().includes("long") || itemName.toLowerCase().includes("battle") ||
                 itemName.toLowerCase().includes("rapier") || itemName.toLowerCase().includes("warhammer")) {
        damageDie = "1d8";
      } else if (itemName.toLowerCase().includes("dagger") || itemName.toLowerCase().includes("dart")) {
        damageDie = "1d4";
      }
      
      // For monks, use martial arts die if better
      if (primaryClassName === "monk") {
        const martialDie = getMartialArtsDie(character.level);
        const martialDieNum = parseInt(martialDie.split("d")[1]);
        const weaponDieNum = parseInt(damageDie.split("d")[1]) || 6;
        if (martialDieNum > weaponDieNum) {
          damageDie = martialDie;
        }
      }
      
      attacks.push({
        name: displayName,
        attackBonus: abilityMod + profBonus,
        damage: damageDie,
        damageType: isRanged ? "piercing" : "slashing",
      });
    });

  // Format spells for SpellList - use real spell data!
  const formattedSpells = [
    ...(character.spells_known?.cantrips || []).map(spellKey => {
      const spellName = spellKey.split("|")[0];
      const spellData = getSpell(spellName);
      
      if (spellData) {
        return {
          name: spellData.name,
          level: 0,
          school: spellData.school,
          castingTime: spellData.castingTime,
          range: spellData.range,
          duration: spellData.duration,
          components: formatComponents(spellData.components),
          concentration: spellData.concentration,
          ritual: spellData.ritual,
          description: spellData.description,
          damage: spellData.damage ? getDamageAtLevel(spellData, character.level) : undefined,
          damageType: spellData.damage?.type,
          savingThrow: spellData.savingThrow,
          attackType: spellData.attackType,
          atHigherLevels: spellData.atHigherLevels,
          spellData, // Keep full data for casting
        };
      }
      
      // Fallback for unknown spells
      return {
        name: spellName,
        level: 0,
        school: "Unknown",
        castingTime: "1 action",
        range: "Self",
        duration: "Instantaneous",
        components: ["V", "S"],
        description: "Spell data not found.",
      };
    }),
    ...(character.spells_known?.spells || []).map(spellKey => {
      const spellName = spellKey.split("|")[0];
      const spellData = getSpell(spellName);
      
      if (spellData) {
        return {
          name: spellData.name,
          level: spellData.level,
          school: spellData.school,
          castingTime: spellData.castingTime,
          range: spellData.range,
          duration: spellData.duration,
          components: formatComponents(spellData.components),
          concentration: spellData.concentration,
          ritual: spellData.ritual,
          description: spellData.description,
          damage: spellData.damage?.dice,
          damageType: spellData.damage?.type,
          savingThrow: spellData.savingThrow,
          attackType: spellData.attackType,
          atHigherLevels: spellData.atHigherLevels,
          prepared: character.prepared_spells?.includes(spellKey),
          spellData, // Keep full data for casting
        };
      }
      
      // Fallback for unknown spells
      return {
        name: spellName,
        level: 1,
        school: "Unknown",
        castingTime: "1 action",
        range: "60 feet",
        duration: "Instantaneous",
        components: ["V", "S"],
        description: "Spell data not found.",
        prepared: character.prepared_spells?.includes(spellKey),
      };
    }),
  ];

  // Format loaded class features for display
  console.log("classFeatures state:", classFeatures.length);
  const features = classFeatures.map(f => ({
    name: f.name,
    source: f.source,
    description: f.description,
  }));
  console.log("features for display:", features.length);

  // Add feature choices (like Fighting Style, Expertise, etc.) with their actual option details
  const displayedChoices: Array<{ name: string; source: string; description: string }> = [];
  if (character.class_feature_choices) {
    const allChoices = getFeatureChoicesForClass(primaryClassName, character.level, primarySubclass || undefined);
    
    for (const [featureKey, selectedValues] of Object.entries(character.class_feature_choices)) {
      // Find the matching feature choice definition
      const choiceDef = allChoices.find(c => 
        c.featureName.toLowerCase().replace(/[^a-z0-9]+/g, "_") === featureKey
      );
      
      if (choiceDef) {
        const selectedArray = Array.isArray(selectedValues) ? selectedValues : [selectedValues];
        
        for (const selectedKey of selectedArray) {
          const option = choiceDef.options.find(o => o.key === selectedKey);
          if (option) {
            displayedChoices.push({
              name: option.name,
              source: choiceDef.featureName,
              description: option.description,
            });
          }
        }
      } else {
        // Fallback for choices not in our definitions
        const displayName = featureKey.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
        const choiceValue = Array.isArray(selectedValues) ? selectedValues.join(", ") : selectedValues;
        displayedChoices.push({
          name: displayName,
          source: "Choice",
          description: `You chose: ${choiceValue.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}`,
        });
      }
    }
  }

  // Combine class features with choices
  const allFeatures = [...features, ...displayedChoices];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700">
        <div className="flex items-center gap-4">
          <Link
            href="/characters"
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          
          <AvatarUpload
            currentUrl={character.avatar_url}
            onUpload={async (blob) => {
              const supabase = createClient();
              if (!supabase || !user) return null;
              
              // Create unique filename
              const fileExt = 'jpg';
              const fileName = `${user.id}/${character.id}-${Date.now()}.${fileExt}`;
              
              // Upload to Supabase Storage
              const { data, error } = await supabase.storage
                .from('avatars')
                .upload(fileName, blob, {
                  cacheControl: '3600',
                  upsert: true,
                  contentType: 'image/jpeg',
                });
              
              if (error) {
                console.error('Upload error:', error);
                return null;
              }
              
              // Get public URL
              const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(data.path);
              
              // Update character with new avatar URL
              await updateCharacter({ avatar_url: publicUrl });
              
              return publicUrl;
            }}
            size="md"
          />
          
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{character.name}</h1>
              {character.inspiration && (
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              )}
              {saving && (
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
              )}
            </div>
            <p className="text-gray-400">
              Level {character.level} {formatRace(character.race_key)} {formatClass(character.class_levels)}
            </p>
            <p className="text-gray-500 text-sm">
              {formatBackground(character.background_key)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
            title="Print Character Sheet"
          >
            <Printer className="w-5 h-5" />
          </button>
          
          {isOwner && (
            <>
              {character.level < 20 && (
                <button
                  onClick={() => setShowLevelUp(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  <TrendingUp className="w-4 h-4" />
                  Level Up
                </button>
              )}
              <Link
                href={`/characters/${character.id}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                Edit
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Core Stats */}
        <div className="space-y-6">
          {/* HP Section */}
          <Card>
            <HPBar
              currentHP={character.current_hp}
              maxHP={character.max_hp}
              tempHP={character.temp_hp || 0}
              onChange={(current, temp) => 
                updateCharacter({ current_hp: current, temp_hp: temp })
              }
              readonly={!isOwner}
            />
            
            {character.current_hp <= 0 && (
              <div className="mt-4">
                <DeathSaves
                  successes={character.death_saves?.successes || 0}
                  failures={character.death_saves?.failures || 0}
                  onChange={(successes, failures) =>
                    updateCharacter({ death_saves: { successes, failures } })
                  }
                  readonly={!isOwner}
                />
              </div>
            )}
          </Card>

          {/* Combat Stats */}
          <StatsGrid columns={3}>
            <StatBox
              label="Armor Class"
              value={calculatedAC}
              icon={<Shield className="w-5 h-5" />}
            />
            <StatBox
              label="Initiative"
              value={`+${getModifier(abilities.dexterity)}`}
              icon={<Swords className="w-5 h-5" />}
            />
            <StatBox
              label="Speed"
              value={`${calculatedSpeed}ft`}
              icon={<Footprints className="w-5 h-5" />}
            />
          </StatsGrid>

          {/* Class Resources (Ki, Rage, etc.) */}
          {classResources.length > 0 && (
            <Card>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                Class Resources
              </h3>
              <ResourceTracker
                resources={classResources.map(r => ({
                  name: r.name,
                  shortName: r.shortName,
                  current: r.max - (character.feature_uses?.[r.name]?.used || 0),
                  max: r.max,
                  rechargeOn: r.rechargeOn as "short" | "long" | "dawn",
                }))}
                onUse={(resourceName) => {
                  if (!isOwner) return;
                  const current = character.feature_uses || {};
                  const resource = current[resourceName] || { used: 0, max: classResources.find(r => r.name === resourceName)?.max || 1 };
                  updateCharacter({
                    feature_uses: {
                      ...current,
                      [resourceName]: { 
                        used: Math.min(resource.used + 1, resource.max),
                        max: resource.max 
                      }
                    }
                  });
                }}
                onRecover={(resourceName, amount) => {
                  if (!isOwner) return;
                  const current = character.feature_uses || {};
                  const resource = current[resourceName] || { used: 0, max: classResources.find(r => r.name === resourceName)?.max || 1 };
                  const recoverAmount = amount ?? resource.max;
                  updateCharacter({
                    feature_uses: {
                      ...current,
                      [resourceName]: { 
                        used: Math.max(0, resource.used - recoverAmount),
                        max: resource.max 
                      }
                    }
                  });
                }}
                readonly={!isOwner}
              />
            </Card>
          )}

          {/* Status Effects */}
          <Card>
            <ConditionTracker
              activeConditions={(character.conditions || []) as ConditionType[]}
              exhaustionLevel={character.exhaustion}
              onToggle={(condition) => {
                if (!isOwner) return;
                const current = character.conditions || [];
                const updated = current.includes(condition)
                  ? current.filter(c => c !== condition)
                  : [...current, condition];
                updateCharacter({ conditions: updated });
              }}
              onExhaustionChange={(level) => updateCharacter({ exhaustion: level })}
              readonly={!isOwner}
            />
          </Card>

          {/* Ability Scores */}
          <Card>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
              Ability Scores
            </h3>
            <AbilityScoresGrid
              abilities={abilities}
              saveProficiencies={character.saving_throw_proficiencies}
              onRoll={(ability, type, result) => {
                console.log(`Rolled ${ability} ${type}: ${result}`);
              }}
            />
          </Card>

          {/* Inspiration Toggle */}
          {isOwner && (
            <button
              onClick={() => updateCharacter({ inspiration: !character.inspiration })}
              className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                character.inspiration
                  ? "bg-amber-900/50 border-amber-500 text-amber-400"
                  : "bg-gray-900 border-gray-700 text-gray-500 hover:border-amber-500/50"
              }`}
            >
              <Star className={`w-5 h-5 ${character.inspiration ? "fill-amber-400" : ""}`} />
              <span className="font-medium">Inspiration</span>
            </button>
          )}
        </div>

        {/* Middle Column - Skills & Attacks */}
        <div className="space-y-6">
          {/* Skills */}
          <CollapsibleSection
            title="Skills"
            icon={<Scroll className="w-5 h-5" />}
            badge={skills.filter(s => s.proficient).length}
          >
            <SkillsList
              skills={skills}
              onRoll={(skillName, result) => {
                console.log(`Rolled ${skillName}: ${result}`);
              }}
            />
          </CollapsibleSection>

          {/* Attacks */}
          <CollapsibleSection
            title="Attacks"
            icon={<Swords className="w-5 h-5" />}
            badge={attacks.length}
          >
            <AttackList
              attacks={attacks}
              onAttackRoll={(name, result) => {
                console.log(`${name} attack: ${result}`);
              }}
              onDamageRoll={(name, result) => {
                console.log(`${name} damage: ${result}`);
              }}
            />
          </CollapsibleSection>

          {/* Equipment */}
          <CollapsibleSection
            title="Equipment"
            icon={<Package className="w-5 h-5" />}
            badge={character.equipment?.filter(i => i?.name || i?.item_key)?.length || 0}
            defaultOpen={true}
          >
            <div className="space-y-1">
              {character.equipment?.filter(item => item?.name || item?.item_key).map((item, index) => {
                // Convert item_key back to display name if name is not present
                const displayName = item.name || (item.item_key 
                  ? item.item_key
                      .split("-")
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ")
                  : "Unknown Item");
                
                return (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-800/50"
                  >
                    <span className="text-gray-300">{displayName}</span>
                    {item.quantity > 1 && (
                      <span className="text-gray-500 text-sm">×{item.quantity}</span>
                    )}
                  </div>
                );
              })}
              {(!character.equipment || character.equipment.filter(i => i?.name || i?.item_key).length === 0) && (
                <p className="text-gray-500 text-sm py-2">No equipment</p>
              )}
            </div>
          </CollapsibleSection>
        </div>

        {/* Right Column - Spells & Features */}
        <div className="space-y-6">
          {/* Spell Slots */}
          {(character.spells_known?.cantrips?.length > 0 || character.spells_known?.spells?.length > 0) && (
            <Card>
              <SpellSlotTracker
                slots={getSpellSlots()}
                onChange={(level, used) => {
                  const currentSlots = character.spell_slots_used || {};
                  updateCharacter({
                    spell_slots_used: { ...currentSlots, [level]: used }
                  });
                }}
                readonly={!isOwner}
              />
              
              {character.concentration_spell && (
                <div className="mt-4 p-3 rounded-lg bg-yellow-900/20 border border-yellow-700/30 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-yellow-400">
                    Concentrating: <strong>{character.concentration_spell}</strong>
                  </span>
                </div>
              )}
            </Card>
          )}

          {/* Spells */}
          {formattedSpells.length > 0 && (
            <CollapsibleSection
              title="Spells"
              icon={<Sparkles className="w-5 h-5" />}
              badge={formattedSpells.length}
            >
              {/* Spellcasting Stats */}
              {spellcastingAbility && (
                <div className="flex gap-4 mb-4 p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase">Spell Save DC</div>
                    <div className="text-xl font-bold text-amber-400">{spellSaveDC}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase">Spell Attack</div>
                    <div className="text-xl font-bold text-amber-400">+{spellAttackBonus}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase">Ability</div>
                    <div className="text-xl font-bold text-gray-300">{spellcastingAbility.slice(0, 3).toUpperCase()}</div>
                  </div>
                </div>
              )}
              <SpellList
                spells={formattedSpells}
                spellAttackBonus={spellAttackBonus}
                spellSaveDC={spellSaveDC}
                onCast={(spellName, atLevel) => {
                  console.log(`Cast ${spellName} at level ${atLevel}`);
                  // Use spell slot
                  if (atLevel > 0) {
                    const currentSlots = character.spell_slots_used || {};
                    const currentUsed = currentSlots[atLevel] || 0;
                    updateCharacter({
                      spell_slots_used: { ...currentSlots, [atLevel]: currentUsed + 1 }
                    });
                  }
                }}
                onRollAttack={(spellName, bonus) => {
                  // Roll spell attack using dice engine
                  console.log(`Spell attack for ${spellName}: +${bonus}`);
                }}
                onRollDamage={(spellName, dice, damageType) => {
                  // Roll spell damage using dice engine
                  console.log(`${spellName} damage: ${dice} ${damageType}`);
                }}
                maxSpellSlot={getSpellSlots().length}
              />
            </CollapsibleSection>
          )}

          {/* Features */}
          <CollapsibleSection
            title="Features & Traits"
            icon={<Star className="w-5 h-5" />}
            badge={allFeatures.length}
            headerAction={
              isOwner && getFeatureChoicesForClass(primaryClassName, character.level, primarySubclass || undefined).length > 0 ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFeatureChoices(true);
                  }}
                  className="px-2 py-1 text-xs bg-amber-600 hover:bg-amber-700 rounded transition-colors"
                >
                  Configure
                </button>
              ) : undefined
            }
          >
            {/* Level filter tabs */}
            {character && (
              <div className="flex flex-wrap gap-1 mb-4 pb-3 border-b border-gray-700">
                <button
                  onClick={() => setFeatureFilter("all")}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    featureFilter === "all"
                      ? "bg-amber-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  All ({allFeatures.length})
                </button>
                {Array.from({ length: character.level }, (_, i) => i + 1).map(lvl => {
                  const count = classFeatures.filter(f => f.level === lvl).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={lvl}
                      onClick={() => setFeatureFilter(lvl)}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        featureFilter === lvl
                          ? "bg-amber-600 text-white"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      }`}
                    >
                      Lvl {lvl} ({count})
                    </button>
                  );
                })}
              </div>
            )}
            
            {/* Filtered features grouped by level */}
            {featureFilter === "all" ? (
              // Group by level when showing all
              <div className="space-y-4">
                {Array.from(new Set(classFeatures.map(f => f.level))).sort((a, b) => a - b).map(level => {
                  const levelFeatures = allFeatures.filter(f => {
                    const classFeature = classFeatures.find(cf => cf.name === f.name);
                    return classFeature?.level === level || (!classFeature && level === 0);
                  });
                  if (levelFeatures.length === 0) return null;
                  return (
                    <div key={level}>
                      <h4 className="text-xs font-semibold text-amber-500/70 uppercase tracking-wider mb-2">
                        Level {level}
                      </h4>
                      <FeatureList
                        features={levelFeatures}
                        onUse={(name) => console.log(`Used ${name}`)}
                        readonly={!isOwner}
                      />
                    </div>
                  );
                })}
                {/* Show feature choices separately */}
                {displayedChoices.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-purple-500/70 uppercase tracking-wider mb-2">
                      Your Choices
                    </h4>
                    <FeatureList
                      features={displayedChoices}
                      readonly={true}
                    />
                  </div>
                )}
              </div>
            ) : (
              // Show only selected level
              <FeatureList
                features={allFeatures.filter(f => {
                  const classFeature = classFeatures.find(cf => cf.name === f.name);
                  return classFeature?.level === featureFilter;
                })}
                onUse={(name) => console.log(`Used ${name}`)}
                readonly={!isOwner}
              />
            )}
          </CollapsibleSection>

          {/* Rest Actions */}
          {isOwner && (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  // Short rest: restore some features
                  console.log("Short rest");
                }}
                className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-blue-900/30 border border-blue-700/50 text-blue-400 hover:bg-blue-900/50 transition-colors"
              >
                <Moon className="w-4 h-4" />
                Short Rest
              </button>
              <button
                onClick={() => {
                  // Long rest: restore HP and spell slots
                  updateCharacter({
                    current_hp: character.max_hp,
                    temp_hp: 0,
                    spell_slots_used: {},
                    exhaustion: Math.max(0, (character.exhaustion || 0) - 1),
                  });
                }}
                className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-purple-900/30 border border-purple-700/50 text-purple-400 hover:bg-purple-900/50 transition-colors"
              >
                <Moon className="w-4 h-4" />
                Long Rest
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Character Details (Collapsible) */}
      {(character.personality_traits || character.ideals || character.bonds || character.flaws || character.backstory) && (
        <CollapsibleSection
          title="Character Details"
          icon={<User className="w-5 h-5" />}
          defaultOpen={false}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {character.personality_traits && (
                <div>
                  <h4 className="text-sm font-semibold text-amber-500/70 mb-1">Personality Traits</h4>
                  <p className="text-gray-300">{character.personality_traits}</p>
                </div>
              )}
              {character.ideals && (
                <div>
                  <h4 className="text-sm font-semibold text-amber-500/70 mb-1">Ideals</h4>
                  <p className="text-gray-300">{character.ideals}</p>
                </div>
              )}
            </div>
            <div className="space-y-4">
              {character.bonds && (
                <div>
                  <h4 className="text-sm font-semibold text-amber-500/70 mb-1">Bonds</h4>
                  <p className="text-gray-300">{character.bonds}</p>
                </div>
              )}
              {character.flaws && (
                <div>
                  <h4 className="text-sm font-semibold text-amber-500/70 mb-1">Flaws</h4>
                  <p className="text-gray-300">{character.flaws}</p>
                </div>
              )}
            </div>
            {character.backstory && (
              <div className="md:col-span-2">
                <h4 className="text-sm font-semibold text-amber-500/70 mb-1">Backstory</h4>
                <p className="text-gray-300 whitespace-pre-wrap">{character.backstory}</p>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Level Up Modal */}
      {showLevelUp && character.class_levels && character.class_levels.length > 0 && (
        <LevelUpModal
          isOpen={showLevelUp}
          onClose={() => setShowLevelUp(false)}
          character={{
            id: character.id,
            name: character.name,
            level: character.level,
            class_levels: character.class_levels,
            ability_scores: character.ability_scores,
            max_hp: character.max_hp,
            spells_known: character.spells_known,
          }}
          onLevelUp={async (updates: {
            level: number;
            class_levels: Array<{ class: string; level: number; subclass?: string }>;
            max_hp: number;
            ability_scores?: typeof character.ability_scores;
            spells_known?: typeof character.spells_known;
          }) => {
            await updateCharacter({
              level: updates.level,
              class_levels: updates.class_levels,
              max_hp: updates.max_hp,
              current_hp: character.current_hp + (updates.max_hp - character.max_hp),
              ability_scores: updates.ability_scores || character.ability_scores,
              spells_known: updates.spells_known || character.spells_known,
            });
            setShowLevelUp(false);
          }}
        />
      )}

      {/* Feature Choice Modal */}
      {showFeatureChoices && (
        <FeatureChoiceModal
          isOpen={showFeatureChoices}
          onClose={() => setShowFeatureChoices(false)}
          choices={getFeatureChoicesForClass(primaryClassName, character.level, primarySubclass || undefined)}
          currentChoices={character.class_feature_choices || {}}
          characterName={character.name}
          onSave={async (choices) => {
            await updateCharacter({ class_feature_choices: choices });
          }}
        />
      )}
    </div>
  );
}
