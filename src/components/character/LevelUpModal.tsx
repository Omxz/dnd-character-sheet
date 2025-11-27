"use client";

import React, { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Award,
  BookOpen,
  Star,
  Check,
  X,
  Loader2,
  Sword,
  Shield,
  Heart,
  Wand2,
  ScrollText,
  Dices
} from "lucide-react";
import { getClassData, getSubclasses, getClassFeatures, getSpellsForClass } from "@/lib/data";
import { FeatPicker } from "./FeatPicker";
import { applyFeatAbilityBonus, parseFeatKey, getFeats, type FeatData } from "@/lib/feats";
import { getNewFeatureChoicesAtLevel, type FeatureChoice } from "@/lib/feature-choices";
import { FeatureChoiceContent } from "./FeatureChoiceModal";

interface ClassFeature {
  name: string;
  source: string;
  className: string;
  classSource: string;
  level: number;
  entries?: unknown[];
}

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: {
    id: string;
    name: string;
    level: number;
    class_levels: Array<{ class: string; level: number; subclass?: string }>;
    ability_scores: {
      strength: number;
      dexterity: number;
      constitution: number;
      intelligence: number;
      wisdom: number;
      charisma: number;
    };
    max_hp: number;
    spells_known?: { cantrips: string[]; spells: string[] };
    feats?: string[];
    class_feature_choices?: Record<string, string | string[]>;
  };
  onLevelUp: (updates: {
    level: number;
    class_levels: Array<{ class: string; level: number; subclass?: string }>;
    max_hp: number;
    ability_scores?: {
      strength: number;
      dexterity: number;
      constitution: number;
      intelligence: number;
      wisdom: number;
      charisma: number;
    };
    spells_known?: { cantrips: string[]; spells: string[] };
    feats?: string[];
    class_feature_choices?: Record<string, string | string[]>;
  }) => Promise<void>;
}

// Class hit dice
const HIT_DICE: Record<string, number> = {
  barbarian: 12, bard: 8, cleric: 8, druid: 8, fighter: 10, monk: 8,
  paladin: 10, ranger: 10, rogue: 8, sorcerer: 6, warlock: 8, wizard: 6,
};

// Subclass selection levels
const SUBCLASS_LEVELS: Record<string, number> = {
  barbarian: 3, bard: 3, cleric: 1, druid: 2, fighter: 3, monk: 3,
  paladin: 3, ranger: 3, rogue: 3, sorcerer: 1, warlock: 1, wizard: 2,
};

// ASI levels by class
const ASI_LEVELS: Record<string, number[]> = {
  default: [4, 8, 12, 16, 19],
  fighter: [4, 6, 8, 12, 14, 16, 19],
  rogue: [4, 8, 10, 12, 16, 19],
};

// Cantrips known thresholds
const CANTRIPS_KNOWN: Record<string, Record<number, number>> = {
  bard: { 1: 2, 4: 3, 10: 4 },
  cleric: { 1: 3, 4: 4, 10: 5 },
  druid: { 1: 2, 4: 3, 10: 4 },
  sorcerer: { 1: 4, 4: 5, 10: 6 },
  warlock: { 1: 2, 4: 3, 10: 4 },
  wizard: { 1: 3, 4: 4, 10: 5 },
};

// Spells known by level (known-casters)
const SPELLS_KNOWN: Record<string, Record<number, number>> = {
  bard: { 1: 4, 2: 5, 3: 6, 4: 7, 5: 8, 6: 9, 7: 10, 8: 11, 9: 12, 10: 14, 11: 15, 13: 16, 14: 18, 15: 19, 17: 20, 18: 22 },
  sorcerer: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 11, 11: 12, 13: 13, 15: 14, 17: 15 },
  warlock: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 11: 11, 13: 12, 15: 13, 17: 14, 19: 15 },
  ranger: { 2: 2, 3: 3, 5: 4, 7: 5, 9: 6, 11: 7, 13: 8, 15: 9, 17: 10, 19: 11 },
};

export function LevelUpModal({ isOpen, onClose, character, onLevelUp }: LevelUpModalProps) {
  const [step, setStep] = useState(0);
  const [selectedSubclass, setSelectedSubclass] = useState<string | null>(null);
  const [hpRoll, setHpRoll] = useState<number | null>(null);
  const [hpMethod, setHpMethod] = useState<"roll" | "average" | null>(null);
  const [asiChoice, setAsiChoice] = useState<"asi" | "feat" | null>(null);
  const [asiBoosts, setAsiBoosts] = useState<Record<string, number>>({});
  const [selectedFeat, setSelectedFeat] = useState<string | null>(null);
  const [newSpells, setNewSpells] = useState<string[]>([]);
  const [newCantrips, setNewCantrips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [featuresAtLevel, setFeaturesAtLevel] = useState<ClassFeature[]>([]);
  const [subclassOptions, setSubclassOptions] = useState<Array<{ name: string; shortName: string; source: string }>>([]);
  const [availableSpells, setAvailableSpells] = useState<Array<{ name: string; level: number }>>([]);
  const [allFeats, setAllFeats] = useState<FeatData[]>([]);
  const [featureChoicesAtLevel, setFeatureChoicesAtLevel] = useState<FeatureChoice[]>([]);
  const [featureChoiceSelections, setFeatureChoiceSelections] = useState<Record<string, string | string[]>>({});

  // Calculate level info
  const currentLevel = character.level;
  const newLevel = currentLevel + 1;
  const primaryClass = character.class_levels[0];
  const primaryClassName = primaryClass?.class?.split("|")[0]?.toLowerCase() || "";
  const newClassLevel = (primaryClass?.level || 0) + 1;

  // What this level provides
  const hitDie = HIT_DICE[primaryClassName] || 8;
  const subclassLevel = SUBCLASS_LEVELS[primaryClassName] || 3;
  const needsSubclass = !primaryClass?.subclass && newClassLevel === subclassLevel;
  
  const asiLevelsForClass = ASI_LEVELS[primaryClassName] || ASI_LEVELS.default;
  const isAsiLevel = asiLevelsForClass.includes(newClassLevel);

  // Spellcasting checks
  const isSpellcaster = ["bard", "cleric", "druid", "paladin", "ranger", "sorcerer", "warlock", "wizard"].includes(primaryClassName);
  const isKnownCaster = ["bard", "sorcerer", "warlock", "ranger"].includes(primaryClassName);
  
  // Calculate cantrip gains
  const getCantripsAtLevel = (level: number) => {
    const table = CANTRIPS_KNOWN[primaryClassName];
    if (!table) return 0;
    let count = 0;
    for (const [lvl, num] of Object.entries(table)) {
      if (parseInt(lvl) <= level) count = num;
    }
    return count;
  };
  
  const cantripsAtPrevLevel = getCantripsAtLevel(currentLevel);
  const cantripsAtNewLevel = getCantripsAtLevel(newLevel);
  const newCantripsCount = cantripsAtNewLevel - cantripsAtPrevLevel;

  // Calculate spell gains
  const getSpellsAtLevel = (level: number) => {
    const table = SPELLS_KNOWN[primaryClassName];
    if (!table) return 0;
    let count = 0;
    for (const [lvl, num] of Object.entries(table)) {
      if (parseInt(lvl) <= level) count = num;
    }
    return count;
  };
  
  const spellsAtPrevLevel = getSpellsAtLevel(currentLevel);
  const spellsAtNewLevel = getSpellsAtLevel(newLevel);
  const newSpellsCount = isKnownCaster ? Math.max(0, spellsAtNewLevel - spellsAtPrevLevel) : 0;

  // New spell level unlocked?
  const maxSpellLevelAtPrev = Math.min(9, Math.ceil(currentLevel / 2));
  const maxSpellLevelAtNew = Math.min(9, Math.ceil(newLevel / 2));
  const newSpellLevel = maxSpellLevelAtNew > maxSpellLevelAtPrev ? maxSpellLevelAtNew : null;

  // Constitution modifier
  const conMod = Math.floor((character.ability_scores.constitution - 10) / 2);

  // Load data when modal opens
  useEffect(() => {
    if (!isOpen || !primaryClassName) return;

    // Load features for this level
    try {
      const allFeatures = getClassFeatures(primaryClassName, newClassLevel);
      const levelFeatures = allFeatures.filter((f: ClassFeature) => f.level === newClassLevel);
      setFeaturesAtLevel(levelFeatures);
    } catch (err) {
      console.error("Error loading features:", err);
    }

    // Load subclass options if needed
    if (needsSubclass) {
      try {
        const subs = getSubclasses(primaryClassName);
        setSubclassOptions(subs.map((s: { name: string; shortName?: string; source: string }) => ({
          name: s.name,
          shortName: s.shortName || s.name,
          source: s.source,
        })));
      } catch (err) {
        console.error("Error loading subclasses:", err);
      }
    }

    // Load available spells for spell selection
    if (isSpellcaster && (newCantripsCount > 0 || newSpellsCount > 0)) {
      try {
        const classSpells = getSpellsForClass(primaryClassName);
        setAvailableSpells(
          classSpells
            .filter((s: { level: number }) => s.level <= maxSpellLevelAtNew)
            .map((s: { name: string; level: number }) => ({ name: s.name, level: s.level }))
        );
      } catch (err) {
        console.error("Error loading spells:", err);
      }
    }

    // Load feats for feat selection
    if (isAsiLevel) {
      try {
        const feats = getFeats();
        setAllFeats(feats);
      } catch (err) {
        console.error("Error loading feats:", err);
      }
    }

    // Load feature choices for this level
    try {
      const choices = getNewFeatureChoicesAtLevel(
        primaryClassName,
        newClassLevel,
        primaryClass?.subclass
      );
      setFeatureChoicesAtLevel(choices);
    } catch (err) {
      console.error("Error loading feature choices:", err);
    }

    // Reset state
    setStep(0);
    setSelectedSubclass(null);
    setHpRoll(null);
    setHpMethod(null);
    setAsiChoice(null);
    setAsiBoosts({});
    setSelectedFeat(null);
    setNewSpells([]);
    setNewCantrips([]);
    setFeatureChoiceSelections({});
  }, [isOpen, primaryClassName, newClassLevel, needsSubclass, isSpellcaster, newCantripsCount, newSpellsCount, maxSpellLevelAtNew, isAsiLevel]);

  // Build step list
  const steps = useMemo(() => {
    const s = [
      { id: "overview", label: "Overview", icon: <Sparkles className="w-4 h-4" /> },
    ];

    if (featuresAtLevel.length > 0) {
      s.push({ id: "features", label: "Features", icon: <Star className="w-4 h-4" /> });
    }

    if (needsSubclass) {
      s.push({ id: "subclass", label: "Subclass", icon: <Shield className="w-4 h-4" /> });
    }

    if (featureChoicesAtLevel.length > 0) {
      s.push({ id: "feature-choices", label: "Choices", icon: <BookOpen className="w-4 h-4" /> });
    }

    s.push({ id: "hp", label: "HP", icon: <Heart className="w-4 h-4" /> });

    if (isAsiLevel) {
      s.push({ id: "asi", label: "ASI", icon: <Sword className="w-4 h-4" /> });
    }

    if (newCantripsCount > 0 || newSpellsCount > 0 || newSpellLevel) {
      s.push({ id: "spells", label: "Spells", icon: <Wand2 className="w-4 h-4" /> });
    }

    s.push({ id: "confirm", label: "Confirm", icon: <Check className="w-4 h-4" /> });

    return s;
  }, [featuresAtLevel.length, needsSubclass, featureChoicesAtLevel.length, isAsiLevel, newCantripsCount, newSpellsCount, newSpellLevel]);

  const currentStepData = steps[step];

  // HP functions
  const rollHP = () => {
    const roll = Math.floor(Math.random() * hitDie) + 1;
    setHpRoll(Math.max(1, roll + conMod));
    setHpMethod("roll");
  };

  const takeAverage = () => {
    const avg = Math.ceil(hitDie / 2) + 1;
    setHpRoll(Math.max(1, avg + conMod));
    setHpMethod("average");
  };

  // ASI functions
  const handleAsiBoost = (ability: string, delta: number) => {
    const current = asiBoosts[ability] || 0;
    const total = Object.values(asiBoosts).reduce((a, b) => a + b, 0);
    
    if (delta > 0 && total >= 2) return;
    if (delta < 0 && current <= 0) return;
    
    setAsiBoosts({ ...asiBoosts, [ability]: Math.max(0, Math.min(2, current + delta)) });
  };

  const asiTotal = Object.values(asiBoosts).reduce((a, b) => a + b, 0);

  // Spell selection
  const toggleSpell = (spellName: string, isCantrip: boolean) => {
    if (isCantrip) {
      if (newCantrips.includes(spellName)) {
        setNewCantrips(newCantrips.filter(s => s !== spellName));
      } else if (newCantrips.length < newCantripsCount) {
        setNewCantrips([...newCantrips, spellName]);
      }
    } else {
      if (newSpells.includes(spellName)) {
        setNewSpells(newSpells.filter(s => s !== spellName));
      } else if (newSpells.length < newSpellsCount) {
        setNewSpells([...newSpells, spellName]);
      }
    }
  };

  // Validation
  const canProceed = () => {
    switch (currentStepData.id) {
      case "subclass": return !!selectedSubclass;
      case "hp": return hpRoll !== null;
      case "asi":
        if (asiChoice === "feat") return !!selectedFeat;
        if (asiChoice === "asi") return asiTotal === 2;
        return false;
      case "spells":
        return newCantrips.length === newCantripsCount &&
               (newSpellsCount === 0 || newSpells.length === newSpellsCount);
      default: return true;
    }
  };

  // Confirm level up
  const handleConfirm = async () => {
    setLoading(true);
    try {
      const updates: Parameters<typeof onLevelUp>[0] = {
        level: newLevel,
        class_levels: character.class_levels.map((cl, i) => 
          i === 0 
            ? { ...cl, level: newClassLevel, ...(selectedSubclass && { subclass: selectedSubclass }) }
            : cl
        ),
        max_hp: character.max_hp + (hpRoll || 0),
      };

      if (isAsiLevel && asiChoice === "asi") {
        const newScores = { ...character.ability_scores };
        for (const [ability, boost] of Object.entries(asiBoosts)) {
          const key = ability as keyof typeof newScores;
          newScores[key] = Math.min(20, newScores[key] + boost);
        }
        updates.ability_scores = newScores;
      }

      if (isAsiLevel && asiChoice === "feat" && selectedFeat) {
        // Add feat to character's feats array
        const currentFeats = character.feats || [];
        updates.feats = [...currentFeats, selectedFeat];

        // Apply any ability score bonuses from the feat
        const { name } = parseFeatKey(selectedFeat);
        const featData = allFeats.find((f) => f.name.toLowerCase() === name.toLowerCase());
        if (featData) {
          const newScores = applyFeatAbilityBonus(featData, character.ability_scores);
          if (JSON.stringify(newScores) !== JSON.stringify(character.ability_scores)) {
            updates.ability_scores = newScores;
          }
        }
      }

      if (newCantrips.length > 0 || newSpells.length > 0) {
        updates.spells_known = {
          cantrips: [...(character.spells_known?.cantrips || []), ...newCantrips],
          spells: [...(character.spells_known?.spells || []), ...newSpells],
        };
      }

      await onLevelUp(updates);
      onClose();
    } catch (err) {
      console.error("Error leveling up:", err);
    } finally {
      setLoading(false);
    }
  };

  // Format entries
  const formatEntries = (entries: unknown[]): string => {
    return entries
      .map(e => {
        if (typeof e === "string") return e;
        if (typeof e === "object" && e !== null && "entries" in e) {
          return formatEntries((e as { entries: unknown[] }).entries);
        }
        return "";
      })
      .join("\n\n");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-2xl border border-gray-700 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900/50 to-yellow-900/50 p-4 border-b border-amber-700/30 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Level Up!</h2>
                <p className="text-amber-400 text-sm">{character.name} → Level {newLevel}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-1">
            {steps.map((s, i) => (
              <React.Fragment key={s.id}>
                <button
                  onClick={() => i < step && setStep(i)}
                  disabled={i > step}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                    i === step
                      ? "bg-amber-500 text-black"
                      : i < step
                      ? "bg-amber-500/30 text-amber-400 cursor-pointer hover:bg-amber-500/40"
                      : "bg-gray-700 text-gray-500 cursor-not-allowed"
                  )}
                >
                  {s.icon}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < steps.length - 1 && <ChevronRight className="w-3 h-3 text-gray-600 flex-shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* Overview */}
          {currentStepData.id === "overview" && (
            <div className="space-y-6">
              <div className="text-center py-4">
                <Award className="w-16 h-16 mx-auto mb-4 text-amber-400" />
                <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
                <p className="text-gray-400">{character.name} is ready to advance to Level {newLevel}.</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <ScrollText className="w-4 h-4 text-amber-400" />
                  What You&apos;ll Gain at Level {newLevel}
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-gray-300">
                    <Heart className="w-4 h-4 text-red-400" />
                    Hit Points: 1d{hitDie} + {conMod} CON
                  </li>
                  {featuresAtLevel.length > 0 && (
                    <li className="flex items-center gap-2 text-gray-300">
                      <Star className="w-4 h-4 text-yellow-400" />
                      {featuresAtLevel.length} New Feature{featuresAtLevel.length > 1 ? "s" : ""}: {featuresAtLevel.map(f => f.name).join(", ")}
                    </li>
                  )}
                  {needsSubclass && (
                    <li className="flex items-center gap-2 text-gray-300">
                      <Shield className="w-4 h-4 text-blue-400" />
                      Choose Your Subclass
                    </li>
                  )}
                  {isAsiLevel && (
                    <li className="flex items-center gap-2 text-gray-300">
                      <Sword className="w-4 h-4 text-purple-400" />
                      Ability Score Improvement or Feat
                    </li>
                  )}
                  {newSpellLevel && (
                    <li className="flex items-center gap-2 text-gray-300">
                      <Wand2 className="w-4 h-4 text-cyan-400" />
                      Unlock Level {newSpellLevel} Spell Slots
                    </li>
                  )}
                  {newCantripsCount > 0 && (
                    <li className="flex items-center gap-2 text-gray-300">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      Learn {newCantripsCount} New Cantrip{newCantripsCount > 1 ? "s" : ""}
                    </li>
                  )}
                  {newSpellsCount > 0 && (
                    <li className="flex items-center gap-2 text-gray-300">
                      <BookOpen className="w-4 h-4 text-blue-400" />
                      Learn {newSpellsCount} New Spell{newSpellsCount > 1 ? "s" : ""}
                    </li>
                  )}
                </ul>
              </div>

              <p className="text-center text-gray-500 text-sm">
                <span className="capitalize">{primaryClassName}</span> Level {primaryClass?.level || 1} → Level {newClassLevel}
              </p>
            </div>
          )}

          {/* Features */}
          {currentStepData.id === "features" && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                New Features at Level {newClassLevel}
              </h3>
              <p className="text-gray-400 text-sm">These are the class features you gain at this level.</p>
              <div className="space-y-3">
                {featuresAtLevel.map((feature, idx) => (
                  <div key={idx} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <h4 className="font-bold text-amber-400 mb-2">{feature.name}</h4>
                    <div className="text-sm text-gray-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {feature.entries ? formatEntries(feature.entries).slice(0, 500) : "No description available."}
                      {feature.entries && formatEntries(feature.entries).length > 500 && "..."}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subclass */}
          {currentStepData.id === "subclass" && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                Choose Your Subclass
              </h3>
              <p className="text-gray-400 text-sm">
                At level {subclassLevel}, you choose a specialization that shapes your {primaryClassName}&apos;s abilities.
              </p>
              <div className="grid gap-2 max-h-[300px] overflow-y-auto">
                {subclassOptions.map((sc) => (
                  <button
                    key={sc.name}
                    onClick={() => setSelectedSubclass(`${sc.name.toLowerCase().replace(/\s+/g, "-")}|${sc.source}`)}
                    className={cn(
                      "p-4 rounded-lg border text-left transition-all",
                      selectedSubclass?.startsWith(sc.name.toLowerCase().replace(/\s+/g, "-"))
                        ? "bg-amber-900/30 border-amber-500"
                        : "bg-gray-800 border-gray-700 hover:border-gray-600"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{sc.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({sc.source})</span>
                      </div>
                      {selectedSubclass?.startsWith(sc.name.toLowerCase().replace(/\s+/g, "-")) && (
                        <Check className="w-5 h-5 text-amber-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* HP */}
          {currentStepData.id === "hp" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-400" />
                Increase Hit Points
              </h3>
              <p className="text-gray-400 text-sm">Roll your 1d{hitDie} hit die or take the average (rounded up).</p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={rollHP}
                  className={cn(
                    "p-4 rounded-lg border transition-all flex flex-col items-center",
                    hpMethod === "roll" ? "bg-red-900/30 border-red-500" : "bg-gray-800 border-gray-700 hover:border-gray-600"
                  )}
                >
                  <Dices className="w-8 h-8 mb-2 text-red-400" />
                  <div className="text-lg font-bold">Roll</div>
                  <div className="text-xs text-gray-400">1d{hitDie} + {conMod}</div>
                </button>
                <button
                  onClick={takeAverage}
                  className={cn(
                    "p-4 rounded-lg border transition-all flex flex-col items-center",
                    hpMethod === "average" ? "bg-blue-900/30 border-blue-500" : "bg-gray-800 border-gray-700 hover:border-gray-600"
                  )}
                >
                  <BookOpen className="w-8 h-8 mb-2 text-blue-400" />
                  <div className="text-lg font-bold">Average</div>
                  <div className="text-xs text-gray-400">{Math.ceil(hitDie / 2) + 1} + {conMod}</div>
                </button>
              </div>

              {hpRoll !== null && (
                <div className="text-center p-6 bg-green-900/20 rounded-lg border border-green-700/30">
                  <div className="text-4xl font-bold text-green-400 mb-2">+{hpRoll} HP</div>
                  <p className="text-gray-400 text-sm">New Max HP: {character.max_hp} → {character.max_hp + hpRoll}</p>
                </div>
              )}
            </div>
          )}

          {/* ASI */}
          {currentStepData.id === "asi" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Sword className="w-5 h-5 text-purple-400" />
                Ability Score Improvement
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => { setAsiChoice("asi"); setAsiBoosts({}); }}
                  className={cn(
                    "p-4 rounded-lg border transition-all",
                    asiChoice === "asi" ? "bg-purple-900/30 border-purple-500" : "bg-gray-800 border-gray-700 hover:border-gray-600"
                  )}
                >
                  <div className="text-lg font-bold mb-1">+2 to Abilities</div>
                  <div className="text-xs text-gray-400">Increase one by 2 or two by 1</div>
                </button>
                <button
                  onClick={() => setAsiChoice("feat")}
                  className={cn(
                    "p-4 rounded-lg border transition-all",
                    asiChoice === "feat" ? "bg-amber-900/30 border-amber-500" : "bg-gray-800 border-gray-700 hover:border-gray-600"
                  )}
                >
                  <div className="text-lg font-bold mb-1">Choose a Feat</div>
                  <div className="text-xs text-gray-400">Gain a special ability</div>
                </button>
              </div>

              {asiChoice === "asi" && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">Distribute 2 points ({2 - asiTotal} remaining)</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"] as const).map((ability) => {
                      const current = character.ability_scores[ability];
                      const boost = asiBoosts[ability] || 0;
                      const newValue = Math.min(20, current + boost);
                      
                      return (
                        <div key={ability} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                          <div className="text-xs uppercase text-gray-500 mb-1 truncate">{ability}</div>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold">
                              {newValue}
                              {boost > 0 && <span className="text-green-400 text-sm ml-1">+{boost}</span>}
                            </span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleAsiBoost(ability, -1)}
                                disabled={boost <= 0}
                                className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-30 text-sm"
                              >-</button>
                              <button
                                onClick={() => handleAsiBoost(ability, 1)}
                                disabled={asiTotal >= 2 || newValue >= 20}
                                className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-30 text-sm"
                              >+</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {asiChoice === "feat" && (
                <FeatPicker
                  character={{
                    level: newLevel,
                    ability_scores: character.ability_scores,
                    feats: character.feats,
                    class_levels: character.class_levels,
                  }}
                  selectedFeat={selectedFeat}
                  onSelect={setSelectedFeat}
                />
              )}
            </div>
          )}

          {/* Spells */}
          {currentStepData.id === "spells" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-cyan-400" />
                Learn New Spells
              </h3>

              {newSpellLevel && (
                <div className="bg-cyan-900/20 rounded-lg p-4 border border-cyan-700/30">
                  <p className="text-cyan-300">🎉 You&apos;ve unlocked <strong>Level {newSpellLevel} spell slots</strong>!</p>
                </div>
              )}

              {newCantripsCount > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Choose {newCantripsCount} Cantrip{newCantripsCount > 1 ? "s" : ""} ({newCantrips.length}/{newCantripsCount})</h4>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {availableSpells.filter(s => s.level === 0).map((spell) => {
                      const known = character.spells_known?.cantrips?.includes(spell.name);
                      const selected = newCantrips.includes(spell.name);
                      return (
                        <button
                          key={spell.name}
                          onClick={() => !known && toggleSpell(spell.name, true)}
                          disabled={known}
                          className={cn(
                            "p-2 rounded border text-left text-sm transition-all",
                            known ? "bg-gray-800/50 border-gray-700 text-gray-500 cursor-not-allowed"
                              : selected ? "bg-purple-900/30 border-purple-500"
                              : "bg-gray-800 border-gray-700 hover:border-gray-600"
                          )}
                        >
                          {spell.name}
                          {known && <span className="text-xs text-gray-600 ml-1">(known)</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {newSpellsCount > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Choose {newSpellsCount} Spell{newSpellsCount > 1 ? "s" : ""} ({newSpells.length}/{newSpellsCount})</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => {
                      const spellsAtLvl = availableSpells.filter(s => s.level === lvl);
                      if (spellsAtLvl.length === 0 || lvl > maxSpellLevelAtNew) return null;
                      
                      return (
                        <div key={lvl}>
                          <div className="text-xs uppercase text-gray-500 mb-1">Level {lvl}</div>
                          <div className="grid grid-cols-2 gap-1">
                            {spellsAtLvl.map((spell) => {
                              const known = character.spells_known?.spells?.includes(spell.name);
                              const selected = newSpells.includes(spell.name);
                              return (
                                <button
                                  key={spell.name}
                                  onClick={() => !known && toggleSpell(spell.name, false)}
                                  disabled={known}
                                  className={cn(
                                    "p-1.5 rounded border text-left text-xs transition-all",
                                    known ? "bg-gray-800/50 border-gray-700 text-gray-500 cursor-not-allowed"
                                      : selected ? "bg-blue-900/30 border-blue-500"
                                      : "bg-gray-800 border-gray-700 hover:border-gray-600"
                                  )}
                                >
                                  {spell.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Confirm */}
          {currentStepData.id === "confirm" && (
            <div className="space-y-6">
              <div className="text-center py-4">
                <Check className="w-16 h-16 mx-auto mb-4 text-green-400" />
                <h3 className="text-2xl font-bold mb-2">Ready to Level Up!</h3>
                <p className="text-gray-400">Review your choices and confirm.</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">New Level</span>
                  <span className="font-bold text-amber-400">{newLevel}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">HP Increase</span>
                  <span className="font-bold text-green-400">+{hpRoll || 0}</span>
                </div>
                {selectedSubclass && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Subclass</span>
                    <span className="font-bold text-blue-400 capitalize">{selectedSubclass.split("|")[0].replace(/-/g, " ")}</span>
                  </div>
                )}
                {asiChoice && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">ASI/Feat</span>
                    <span className="font-bold text-purple-400">
                      {asiChoice === "feat" ? "Feat" : Object.entries(asiBoosts).filter(([, v]) => v > 0).map(([k, v]) => `${k.slice(0, 3).toUpperCase()} +${v}`).join(", ")}
                    </span>
                  </div>
                )}
                {newCantrips.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">New Cantrips</span>
                    <span className="font-bold text-purple-300">{newCantrips.join(", ")}</span>
                  </div>
                )}
                {newSpells.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">New Spells</span>
                    <span className="font-bold text-blue-300">{newSpells.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-between flex-shrink-0">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : onClose()}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 0 ? "Cancel" : "Back"}
          </button>

          {currentStepData.id === "confirm" ? (
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Confirm Level Up
            </button>
          ) : (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
