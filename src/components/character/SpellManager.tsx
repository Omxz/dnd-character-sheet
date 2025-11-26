"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  X,
  Plus,
  Star,
  Sparkles,
  BookOpen,
  Clock,
  Zap,
  Shield,
  ChevronDown,
  ChevronUp,
  Eye,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getSpells } from "@/lib/data";

interface Spell {
  name: string;
  source: string;
  level: number;
  school: string;
  time?: Array<{ number: number; unit: string }>;
  range?: { type: string; distance?: { type: string; amount?: number } };
  components?: { v?: boolean; s?: boolean; m?: string | { text: string } };
  duration?: Array<{ type: string; duration?: { type: string; amount: number }; concentration?: boolean }>;
  entries?: unknown[];
  classes?: { fromClassList?: Array<{ name: string; source: string }> };
  damageInflict?: string[];
  conditionInflict?: string[];
  savingThrow?: string[];
  miscTags?: string[];
}

interface SpellsKnown {
  cantrips: string[];
  spells: string[];
}

interface SpellManagerProps {
  spellsKnown: SpellsKnown;
  preparedSpells: string[];
  characterClasses: Array<{ class: string; level: number }>;
  spellcastingAbility: string;
  abilityModifier: number;
  proficiencyBonus: number;
  onChange: (spellsKnown: SpellsKnown, preparedSpells: string[]) => void;
}

// School abbreviation mapping
const SCHOOL_NAMES: Record<string, string> = {
  A: "Abjuration",
  C: "Conjuration",
  D: "Divination",
  E: "Enchantment",
  V: "Evocation",
  I: "Illusion",
  N: "Necromancy",
  T: "Transmutation",
};

const SCHOOL_COLORS: Record<string, string> = {
  A: "text-blue-400 bg-blue-900/30 border-blue-700",
  C: "text-yellow-400 bg-yellow-900/30 border-yellow-700",
  D: "text-cyan-400 bg-cyan-900/30 border-cyan-700",
  E: "text-pink-400 bg-pink-900/30 border-pink-700",
  V: "text-red-400 bg-red-900/30 border-red-700",
  I: "text-purple-400 bg-purple-900/30 border-purple-700",
  N: "text-green-400 bg-green-900/30 border-green-700",
  T: "text-orange-400 bg-orange-900/30 border-orange-700",
};

export function SpellManager({
  spellsKnown,
  preparedSpells,
  characterClasses,
  spellcastingAbility,
  abilityModifier,
  proficiencyBonus,
  onChange,
}: SpellManagerProps) {
  const [allSpells, setAllSpells] = useState<Spell[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSpellPicker, setShowSpellPicker] = useState(false);
  const [pickerLevel, setPickerLevel] = useState<number | null>(null);
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set([0, 1]));

  // Load spells
  useEffect(() => {
    const spells = getSpells();
    setAllSpells(spells as Spell[]);
  }, []);

  // Get class spell lists
  const classNames = characterClasses.map((c) => c.class.toLowerCase().split("|")[0]);

  // Calculate spell save DC and attack bonus
  const spellSaveDC = 8 + proficiencyBonus + abilityModifier;
  const spellAttackBonus = proficiencyBonus + abilityModifier;

  // Calculate max prepared spells (for prepared casters like Cleric, Druid, Paladin, Wizard)
  const maxPreparedSpells = useMemo(() => {
    // Simplified - assumes single class
    const primaryClass = classNames[0];
    const level = characterClasses[0]?.level || 1;

    if (["cleric", "druid", "wizard"].includes(primaryClass)) {
      return Math.max(1, abilityModifier + level);
    }
    if (primaryClass === "paladin") {
      return Math.max(1, abilityModifier + Math.floor(level / 2));
    }
    // Known casters don't prepare
    return null;
  }, [classNames, characterClasses, abilityModifier]);

  // Group spells by level
  const spellsByLevel = useMemo(() => {
    const grouped: Record<number, string[]> = {};

    // Cantrips
    grouped[0] = spellsKnown.cantrips || [];

    // Other spells
    (spellsKnown.spells || []).forEach((spellName) => {
      const spell = allSpells.find(
        (s) => s.name.toLowerCase() === spellName.toLowerCase().split("|")[0]
      );
      const level = spell?.level || 1;
      if (!grouped[level]) grouped[level] = [];
      grouped[level].push(spellName);
    });

    return grouped;
  }, [spellsKnown, allSpells]);

  // Get spell details
  const getSpellDetails = (spellName: string): Spell | undefined => {
    const cleanName = spellName.split("|")[0].toLowerCase();
    return allSpells.find((s) => s.name.toLowerCase() === cleanName);
  };

  // Filter available spells for picker
  const availableSpells = useMemo(() => {
    let filtered = allSpells;

    // Filter by level if specified
    if (pickerLevel !== null) {
      filtered = filtered.filter((s) => s.level === pickerLevel);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          SCHOOL_NAMES[s.school]?.toLowerCase().includes(query)
      );
    }

    // Filter by school
    if (schoolFilter) {
      filtered = filtered.filter((s) => s.school === schoolFilter);
    }

    // Filter by class (optional - could be strict or not)
    // For now, show all spells but indicate which are on class list

    return filtered.slice(0, 50); // Limit for performance
  }, [allSpells, pickerLevel, searchQuery, schoolFilter]);

  // Check if spell is on class list
  const isOnClassList = (spell: Spell): boolean => {
    return (
      spell.classes?.fromClassList?.some((c) =>
        classNames.includes(c.name.toLowerCase())
      ) || false
    );
  };

  // Add spell
  const addSpell = (spell: Spell) => {
    if (spell.level === 0) {
      const newCantrips = [...(spellsKnown.cantrips || []), spell.name];
      onChange({ ...spellsKnown, cantrips: newCantrips }, preparedSpells);
    } else {
      const newSpells = [...(spellsKnown.spells || []), spell.name];
      onChange({ ...spellsKnown, spells: newSpells }, preparedSpells);
    }
    setShowSpellPicker(false);
  };

  // Remove spell
  const removeSpell = (spellName: string, level: number) => {
    if (level === 0) {
      const newCantrips = (spellsKnown.cantrips || []).filter(
        (c) => c.toLowerCase() !== spellName.toLowerCase()
      );
      onChange({ ...spellsKnown, cantrips: newCantrips }, preparedSpells);
    } else {
      const newSpells = (spellsKnown.spells || []).filter(
        (s) => s.toLowerCase() !== spellName.toLowerCase()
      );
      onChange(
        { ...spellsKnown, spells: newSpells },
        preparedSpells.filter((p) => p.toLowerCase() !== spellName.toLowerCase())
      );
    }
  };

  // Toggle prepared
  const togglePrepared = (spellName: string) => {
    const isCurrentlyPrepared = preparedSpells.some(
      (p) => p.toLowerCase() === spellName.toLowerCase()
    );
    if (isCurrentlyPrepared) {
      onChange(
        spellsKnown,
        preparedSpells.filter((p) => p.toLowerCase() !== spellName.toLowerCase())
      );
    } else {
      onChange(spellsKnown, [...preparedSpells, spellName]);
    }
  };

  // Toggle level expansion
  const toggleLevel = (level: number) => {
    const newExpanded = new Set(expandedLevels);
    if (newExpanded.has(level)) {
      newExpanded.delete(level);
    } else {
      newExpanded.add(level);
    }
    setExpandedLevels(newExpanded);
  };

  // Format casting time
  const formatCastingTime = (spell: Spell): string => {
    if (!spell.time?.[0]) return "—";
    const t = spell.time[0];
    return `${t.number} ${t.unit}`;
  };

  // Format duration
  const formatDuration = (spell: Spell): { text: string; concentration: boolean } => {
    if (!spell.duration?.[0]) return { text: "—", concentration: false };
    const d = spell.duration[0];
    const concentration = d.concentration || false;

    if (d.type === "instant") return { text: "Instantaneous", concentration };
    if (d.type === "permanent") return { text: "Permanent", concentration };
    if (d.duration) {
      return {
        text: `${d.duration.amount} ${d.duration.type}${d.duration.amount > 1 ? "s" : ""}`,
        concentration,
      };
    }
    return { text: d.type, concentration };
  };

  // Format components
  const formatComponents = (spell: Spell): string => {
    if (!spell.components) return "—";
    const parts = [];
    if (spell.components.v) parts.push("V");
    if (spell.components.s) parts.push("S");
    if (spell.components.m) parts.push("M");
    return parts.join(", ");
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 text-center">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
            Spellcasting Ability
          </div>
          <div className="text-lg font-bold text-amber-400 capitalize">
            {spellcastingAbility}
          </div>
        </div>
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 text-center">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
            Spell Save DC
          </div>
          <div className="text-lg font-bold text-white">{spellSaveDC}</div>
        </div>
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 text-center">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
            Spell Attack
          </div>
          <div className="text-lg font-bold text-white">
            {spellAttackBonus >= 0 ? "+" : ""}
            {spellAttackBonus}
          </div>
        </div>
        {maxPreparedSpells !== null && (
          <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 text-center">
            <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
              Prepared Spells
            </div>
            <div className="text-lg font-bold">
              <span
                className={
                  preparedSpells.length > maxPreparedSpells
                    ? "text-red-400"
                    : "text-white"
                }
              >
                {preparedSpells.length}
              </span>
              <span className="text-gray-500"> / {maxPreparedSpells}</span>
            </div>
          </div>
        )}
      </div>

      {/* Spell Levels */}
      <div className="space-y-3">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
          const spells = spellsByLevel[level] || [];
          const isExpanded = expandedLevels.has(level);
          const levelName = level === 0 ? "Cantrips" : `Level ${level}`;

          return (
            <div
              key={level}
              className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden"
            >
              {/* Level Header */}
              <button
                onClick={() => toggleLevel(level)}
                className="w-full p-3 flex items-center justify-between hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {level === 0 ? (
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-blue-900/50 border border-blue-700 flex items-center justify-center text-sm font-bold text-blue-400">
                      {level}
                    </div>
                  )}
                  <span className="font-medium">{levelName}</span>
                  <span className="text-gray-500 text-sm">
                    ({spells.length} spell{spells.length !== 1 ? "s" : ""})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPickerLevel(level);
                      setShowSpellPicker(true);
                    }}
                    className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                  >
                    <Plus className="w-4 h-4 text-gray-400" />
                  </button>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Spells List */}
              {isExpanded && spells.length > 0 && (
                <div className="border-t border-gray-700 divide-y divide-gray-700/50">
                  {spells.map((spellName) => {
                    const spell = getSpellDetails(spellName);
                    const isPrepared = preparedSpells.some(
                      (p) => p.toLowerCase() === spellName.toLowerCase()
                    );
                    const duration = spell ? formatDuration(spell) : { text: "—", concentration: false };

                    return (
                      <div
                        key={spellName}
                        className="p-3 flex items-center gap-3 hover:bg-gray-800/50"
                      >
                        {/* Prepared checkbox (not for cantrips) */}
                        {level > 0 && maxPreparedSpells !== null && (
                          <button
                            onClick={() => togglePrepared(spellName)}
                            className="flex-shrink-0"
                            title={isPrepared ? "Unprepare spell" : "Prepare spell"}
                          >
                            {isPrepared ? (
                              <CheckCircle2 className="w-5 h-5 text-amber-400" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-500" />
                            )}
                          </button>
                        )}

                        {/* Spell Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">
                              {spellName.split("|")[0]}
                            </span>
                            {spell && (
                              <span
                                className={cn(
                                  "text-xs px-1.5 py-0.5 rounded border",
                                  SCHOOL_COLORS[spell.school] || "text-gray-400 bg-gray-800 border-gray-600"
                                )}
                              >
                                {SCHOOL_NAMES[spell.school] || spell.school}
                              </span>
                            )}
                            {duration.concentration && (
                              <span className="text-xs text-yellow-500 flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                C
                              </span>
                            )}
                          </div>
                          {spell && (
                            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatCastingTime(spell)}
                              </span>
                              <span>{formatComponents(spell)}</span>
                              <span>{duration.text}</span>
                            </div>
                          )}
                        </div>

                        {/* View Details */}
                        <button
                          onClick={() => setSelectedSpell(spell || null)}
                          className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>

                        {/* Remove */}
                        <button
                          onClick={() => removeSpell(spellName, level)}
                          className="p-1.5 hover:bg-red-900/30 rounded transition-colors"
                          title="Remove spell"
                        >
                          <X className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {isExpanded && spells.length === 0 && (
                <div className="p-4 text-center text-gray-500 text-sm border-t border-gray-700">
                  No {level === 0 ? "cantrips" : "spells"} known at this level
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Spell Picker Modal */}
      {showSpellPicker && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold">
                Add {pickerLevel === 0 ? "Cantrip" : `Level ${pickerLevel} Spell`}
              </h3>
              <button
                onClick={() => {
                  setShowSpellPicker(false);
                  setSearchQuery("");
                  setSchoolFilter(null);
                }}
                className="p-1 hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search and Filters */}
            <div className="p-4 border-b border-gray-700 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search spells..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-amber-500 focus:outline-none"
                  autoFocus
                />
              </div>

              {/* School Filter */}
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(SCHOOL_NAMES).map(([abbr, name]) => (
                  <button
                    key={abbr}
                    onClick={() =>
                      setSchoolFilter(schoolFilter === abbr ? null : abbr)
                    }
                    className={cn(
                      "px-2 py-1 text-xs rounded border transition-colors",
                      schoolFilter === abbr
                        ? SCHOOL_COLORS[abbr]
                        : "text-gray-400 bg-gray-900 border-gray-700 hover:border-gray-600"
                    )}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Spell List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {availableSpells.map((spell) => {
                  const alreadyKnown =
                    spell.level === 0
                      ? spellsKnown.cantrips?.some(
                          (c) => c.toLowerCase() === spell.name.toLowerCase()
                        )
                      : spellsKnown.spells?.some(
                          (s) => s.toLowerCase() === spell.name.toLowerCase()
                        );

                  const onClassList = isOnClassList(spell);

                  return (
                    <button
                      key={spell.name}
                      onClick={() => !alreadyKnown && addSpell(spell)}
                      disabled={alreadyKnown}
                      className={cn(
                        "w-full p-3 rounded-lg border text-left transition-all",
                        alreadyKnown
                          ? "bg-gray-900/50 border-gray-700 opacity-50 cursor-not-allowed"
                          : "bg-gray-900 border-gray-700 hover:border-gray-600 hover:bg-gray-800"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{spell.name}</span>
                          <span
                            className={cn(
                              "text-xs px-1.5 py-0.5 rounded border",
                              SCHOOL_COLORS[spell.school] || "text-gray-400 bg-gray-800 border-gray-600"
                            )}
                          >
                            {SCHOOL_NAMES[spell.school]}
                          </span>
                          {onClassList && (
                            <Star className="w-3 h-3 text-amber-400" />
                          )}
                        </div>
                        {alreadyKnown && (
                          <span className="text-xs text-gray-500">Known</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatCastingTime(spell)} • {formatComponents(spell)} •{" "}
                        {formatDuration(spell).text}
                        {formatDuration(spell).concentration && " (C)"}
                      </div>
                    </button>
                  );
                })}

                {availableSpells.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No spells found matching your criteria
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-700 text-sm text-gray-500 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span>Spells on your class list</span>
            </div>
          </div>
        </div>
      )}

      {/* Spell Details Modal */}
      {selectedSpell && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">{selectedSpell.name}</h3>
                <p className="text-sm text-gray-400">
                  {selectedSpell.level === 0
                    ? `${SCHOOL_NAMES[selectedSpell.school]} cantrip`
                    : `Level ${selectedSpell.level} ${SCHOOL_NAMES[selectedSpell.school]}`}
                </p>
              </div>
              <button
                onClick={() => setSelectedSpell(null)}
                className="p-1 hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2 bg-gray-900 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Casting Time</div>
                  <div className="font-medium flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {formatCastingTime(selectedSpell)}
                  </div>
                </div>
                <div className="p-2 bg-gray-900 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Components</div>
                  <div className="font-medium">
                    {formatComponents(selectedSpell)}
                  </div>
                </div>
                <div className="p-2 bg-gray-900 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Duration</div>
                  <div className="font-medium flex items-center justify-center gap-1">
                    {formatDuration(selectedSpell).concentration && (
                      <Shield className="w-4 h-4 text-yellow-500" />
                    )}
                    {formatDuration(selectedSpell).text}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {selectedSpell.damageInflict?.map((d) => (
                  <span
                    key={d}
                    className="px-2 py-1 bg-red-900/30 text-red-300 rounded text-xs flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3" />
                    {d}
                  </span>
                ))}
                {selectedSpell.conditionInflict?.map((c) => (
                  <span
                    key={c}
                    className="px-2 py-1 bg-purple-900/30 text-purple-300 rounded text-xs"
                  >
                    {c}
                  </span>
                ))}
                {selectedSpell.savingThrow?.map((st) => (
                  <span
                    key={st}
                    className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded text-xs uppercase"
                  >
                    {st} Save
                  </span>
                ))}
              </div>

              {/* Description */}
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">Description</span>
                </div>
                <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {/* Simplified - would need proper entry parsing */}
                  {selectedSpell.entries
                    ?.map((e) => (typeof e === "string" ? e : JSON.stringify(e)))
                    .join("\n\n")}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
