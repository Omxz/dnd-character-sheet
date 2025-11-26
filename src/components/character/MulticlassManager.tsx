"use client";

import { useState, useEffect } from "react";
import { Plus, X, ChevronDown, Loader2, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { findClass, getSubclasses } from "@/lib/data";

interface ClassLevel {
  class: string;
  level: number;
  subclass?: string;
}

interface MulticlassManagerProps {
  classLevels: ClassLevel[];
  totalLevel: number;
  onChange: (classLevels: ClassLevel[]) => void;
  maxLevel?: number;
}

interface ClassInfo {
  name: string;
  source: string;
  hitDie: number;
  primaryAbility: string;
  multiclassRequirements?: string;
  proficienciesGained?: string[];
  subclassLevel?: number;
}

interface SubclassInfo {
  name: string;
  source: string;
  shortName: string;
}

// PHB 2024 multiclass requirements
const MULTICLASS_REQUIREMENTS: Record<string, { abilities: string[]; minScore: number }> = {
  barbarian: { abilities: ["strength"], minScore: 13 },
  bard: { abilities: ["charisma"], minScore: 13 },
  cleric: { abilities: ["wisdom"], minScore: 13 },
  druid: { abilities: ["wisdom"], minScore: 13 },
  fighter: { abilities: ["strength", "dexterity"], minScore: 13 }, // OR
  monk: { abilities: ["dexterity", "wisdom"], minScore: 13 }, // AND
  paladin: { abilities: ["strength", "charisma"], minScore: 13 }, // AND
  ranger: { abilities: ["dexterity", "wisdom"], minScore: 13 }, // AND
  rogue: { abilities: ["dexterity"], minScore: 13 },
  sorcerer: { abilities: ["charisma"], minScore: 13 },
  warlock: { abilities: ["charisma"], minScore: 13 },
  wizard: { abilities: ["intelligence"], minScore: 13 },
};

// Subclass level thresholds per class
const SUBCLASS_LEVELS: Record<string, number> = {
  barbarian: 3,
  bard: 3,
  cleric: 1,
  druid: 2,
  fighter: 3,
  monk: 3,
  paladin: 3,
  ranger: 3,
  rogue: 3,
  sorcerer: 1,
  warlock: 1,
  wizard: 2,
};

// Standard classes available for multiclassing
const AVAILABLE_CLASSES = [
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

export function MulticlassManager({
  classLevels,
  totalLevel,
  onChange,
  maxLevel = 20,
}: MulticlassManagerProps) {
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [selectedNewClass, setSelectedNewClass] = useState<string | null>(null);
  const [classDataCache, setClassDataCache] = useState<Record<string, ClassInfo>>({});
  const [subclassCache, setSubclassCache] = useState<Record<string, SubclassInfo[]>>({});
  const [loadingClass, setLoadingClass] = useState<string | null>(null);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);

  // Get current classes that character has
  const currentClasses = classLevels.map((cl) => cl.class.toLowerCase().split("|")[0]);
  
  // Available classes to multiclass into
  const availableNewClasses = AVAILABLE_CLASSES.filter(
    (c) => !currentClasses.includes(c)
  );

  // Total levels used
  const usedLevels = classLevels.reduce((sum, cl) => sum + cl.level, 0);
  const remainingLevels = maxLevel - usedLevels;

  // Load class data for display
  useEffect(() => {
    classLevels.forEach((cl) => {
      const className = cl.class.toLowerCase().split("|")[0];
      if (!classDataCache[className]) {
        try {
          const data = findClass(className);
          if (data) {
            setClassDataCache((prev) => ({
              ...prev,
              [className]: {
                name: data.name,
                source: data.source,
                hitDie: data.hd?.faces || 8,
                primaryAbility: typeof data.primaryAbility === 'object' && data.primaryAbility !== null 
                  ? String((data.primaryAbility as Record<string, unknown>).entry || "Unknown")
                  : "Unknown",
                subclassLevel: SUBCLASS_LEVELS[className] || 3,
              },
            }));
          }
        } catch (err) {
          console.error(`Failed to load class data for ${className}:`, err);
        }
      }
    });
  }, [classLevels, classDataCache]);

  // Load subclasses when expanded
  const loadSubclasses = async (className: string) => {
    if (subclassCache[className]) return;
    
    setLoadingClass(className);
    try {
      const subclasses = await getSubclasses(className);
      setSubclassCache((prev) => ({
        ...prev,
        [className]: subclasses.map((sc) => ({
          name: sc.name,
          source: sc.source,
          shortName: sc.shortName || sc.name,
        })),
      }));
    } catch (err) {
      console.error(`Failed to load subclasses for ${className}:`, err);
    } finally {
      setLoadingClass(null);
    }
  };

  const handleAddClass = () => {
    if (!selectedNewClass || remainingLevels < 1) return;

    const newClassLevel: ClassLevel = {
      class: selectedNewClass,
      level: 1,
    };

    onChange([...classLevels, newClassLevel]);
    setIsAddingClass(false);
    setSelectedNewClass(null);
  };

  const handleRemoveClass = (index: number) => {
    // Don't allow removing the last class
    if (classLevels.length <= 1) return;

    const newLevels = [...classLevels];
    newLevels.splice(index, 1);
    onChange(newLevels);
  };

  const handleLevelChange = (index: number, newLevel: number) => {
    if (newLevel < 1 || newLevel > 20) return;

    // Check if total would exceed max
    const otherLevels = classLevels
      .filter((_, i) => i !== index)
      .reduce((sum, cl) => sum + cl.level, 0);
    
    if (otherLevels + newLevel > maxLevel) {
      newLevel = maxLevel - otherLevels;
    }

    const newLevels = [...classLevels];
    newLevels[index] = { ...newLevels[index], level: newLevel };
    onChange(newLevels);
  };

  const handleSubclassChange = (index: number, subclass: string | undefined) => {
    const newLevels = [...classLevels];
    newLevels[index] = { ...newLevels[index], subclass };
    onChange(newLevels);
  };

  const formatClassName = (classKey: string) => {
    return classKey
      .split("|")[0]
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getSubclassLevel = (classKey: string) => {
    const className = classKey.toLowerCase().split("|")[0];
    return SUBCLASS_LEVELS[className] || 3;
  };

  const needsSubclass = (classLevel: ClassLevel) => {
    const subclassLevel = getSubclassLevel(classLevel.class);
    return classLevel.level >= subclassLevel && !classLevel.subclass;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Class Levels</h3>
          <p className="text-sm text-gray-400">
            Total Level: {usedLevels} / {maxLevel}
          </p>
        </div>

        {availableNewClasses.length > 0 && remainingLevels >= 1 && (
          <button
            onClick={() => setIsAddingClass(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 rounded-lg text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Class
          </button>
        )}
      </div>

      {/* Class List */}
      <div className="space-y-3">
        {classLevels.map((classLevel, index) => {
          const className = classLevel.class.toLowerCase().split("|")[0];
          const classInfo = classDataCache[className];
          const subclassLevel = getSubclassLevel(classLevel.class);
          const showSubclass = classLevel.level >= subclassLevel;
          const isExpanded = expandedClass === className;
          const subclasses = subclassCache[className] || [];

          return (
            <div
              key={index}
              className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden"
            >
              {/* Main Row */}
              <div className="p-4 flex items-center gap-4">
                {/* Class Info */}
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => {
                    setExpandedClass(isExpanded ? null : className);
                    if (!isExpanded) loadSubclasses(className);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">
                      {formatClassName(classLevel.class)}
                    </span>
                    {classLevel.subclass && (
                      <span className="text-amber-400 text-sm">
                        ({formatClassName(classLevel.subclass)})
                      </span>
                    )}
                    {needsSubclass(classLevel) && (
                      <span className="flex items-center gap-1 text-red-400 text-xs">
                        <AlertTriangle className="w-3 h-3" />
                        Needs subclass
                      </span>
                    )}
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-gray-400 transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </div>
                  {classInfo && (
                    <p className="text-xs text-gray-500 mt-1">
                      d{classInfo.hitDie} hit die • Subclass at level {subclassLevel}
                    </p>
                  )}
                </div>

                {/* Level Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLevelChange(index, classLevel.level - 1)}
                    disabled={classLevel.level <= 1}
                    className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-bold text-lg">
                    Lv{classLevel.level}
                  </span>
                  <button
                    onClick={() => handleLevelChange(index, classLevel.level + 1)}
                    disabled={remainingLevels < 1 || classLevel.level >= 20}
                    className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Remove Button */}
                {classLevels.length > 1 && (
                  <button
                    onClick={() => handleRemoveClass(index)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Expanded Section - Subclass Selection */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-0 border-t border-gray-700 mt-0">
                  <div className="pt-4">
                    {showSubclass ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Subclass Selection
                        </label>
                        {loadingClass === className ? (
                          <div className="flex items-center gap-2 text-gray-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading subclasses...
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {subclasses.map((sc) => (
                              <button
                                key={sc.name}
                                onClick={() =>
                                  handleSubclassChange(
                                    index,
                                    classLevel.subclass === sc.name
                                      ? undefined
                                      : sc.name
                                  )
                                }
                                className={cn(
                                  "p-3 rounded-lg border text-left transition-all",
                                  classLevel.subclass === sc.name
                                    ? "bg-amber-900/30 border-amber-500 text-amber-100"
                                    : "bg-gray-800 border-gray-600 hover:border-gray-500"
                                )}
                              >
                                <span className="font-medium">{sc.shortName}</span>
                                <span className="text-xs text-gray-500 ml-1">
                                  ({sc.source})
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Info className="w-4 h-4" />
                        Reach level {subclassLevel} to choose a subclass
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Class Modal */}
      {isAddingClass && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold">Add Multiclass</h3>
              <button
                onClick={() => {
                  setIsAddingClass(false);
                  setSelectedNewClass(null);
                }}
                className="p-1 hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              <p className="text-sm text-gray-400 mb-4">
                Select a class to multiclass into. You have {remainingLevels} level
                {remainingLevels !== 1 ? "s" : ""} available.
              </p>

              <div className="space-y-2">
                {availableNewClasses.map((className) => {
                  const req = MULTICLASS_REQUIREMENTS[className];
                  const isSelected = selectedNewClass === className;

                  return (
                    <button
                      key={className}
                      onClick={() => setSelectedNewClass(className)}
                      className={cn(
                        "w-full p-3 rounded-lg border text-left transition-all",
                        isSelected
                          ? "bg-amber-900/30 border-amber-500"
                          : "bg-gray-900 border-gray-700 hover:border-gray-600"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">{className}</span>
                        <span className="text-xs text-gray-500">
                          d{getHitDie(className)} HD
                        </span>
                      </div>
                      {req && (
                        <p className="text-xs text-gray-500 mt-1">
                          Requires: {req.abilities.join(" or ")} {req.minScore}+
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setIsAddingClass(false);
                  setSelectedNewClass(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddClass}
                disabled={!selectedNewClass}
                className={cn(
                  "flex-1 px-4 py-2 rounded-lg transition-colors",
                  selectedNewClass
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-gray-700 text-gray-500 cursor-not-allowed"
                )}
              >
                Add Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
        <div className="flex items-start gap-2 text-sm text-gray-400">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-300">Multiclassing Rules</p>
            <p className="mt-1">
              When multiclassing, you gain the 1st-level features of the new class
              but not all proficiencies. Check your DM for specific rules.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper to get hit die for a class
function getHitDie(className: string): number {
  const hitDice: Record<string, number> = {
    barbarian: 12,
    bard: 8,
    cleric: 8,
    druid: 8,
    fighter: 10,
    monk: 8,
    paladin: 10,
    ranger: 10,
    rogue: 8,
    sorcerer: 6,
    warlock: 8,
    wizard: 6,
  };
  return hitDice[className.toLowerCase()] || 8;
}
