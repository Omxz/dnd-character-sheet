"use client";

import { useState, useMemo } from "react";
import { getSpells, getSpellsForClass, buildKey } from "@/lib/data/loader";
import type { StepProps } from "../types";
import { cn } from "@/lib/utils";
import { Check, Sparkles, Search } from "lucide-react";

interface SpellInfo {
  key: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string[];
  concentration: boolean;
  ritual: boolean;
}

function processSpell(raw: any): SpellInfo {
  // Format casting time
  let castingTime = "1 action";
  if (raw.time && raw.time[0]) {
    const t = raw.time[0];
    castingTime = `${t.number || 1} ${t.unit || "action"}`;
  }

  // Format range
  let range = "Self";
  if (raw.range) {
    if (raw.range.type === "point") {
      if (raw.range.distance?.type === "self") {
        range = "Self";
      } else if (raw.range.distance?.type === "touch") {
        range = "Touch";
      } else {
        range = `${raw.range.distance?.amount || 0} ${raw.range.distance?.type || "feet"}`;
      }
    } else {
      range = raw.range.type || "Varies";
    }
  }

  // Get components
  const components: string[] = [];
  if (raw.components) {
    if (raw.components.v) components.push("V");
    if (raw.components.s) components.push("S");
    if (raw.components.m) components.push("M");
  }

  // Concentration & ritual
  const concentration = raw.duration?.some((d: any) => d.concentration) || false;
  const ritual = raw.meta?.ritual || false;

  return {
    key: buildKey(raw.name, raw.source),
    name: raw.name,
    level: raw.level,
    school: raw.school || "U",
    castingTime,
    range,
    components,
    concentration,
    ritual,
  };
}

export function SpellsStep({ data, updateData }: StepProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [selectedSpell, setSelectedSpell] = useState<SpellInfo | null>(null);
  const [selectedCantrips, setSelectedCantrips] = useState<string[]>(data.spells_known.cantrips);
  const [selectedSpells, setSelectedSpells] = useState<string[]>(data.spells_known.spells);

  // Determine if class is a spellcaster and get limits
  const { isSpellcaster, cantripsLimit, spellsLimit, availableSpells } = useMemo(() => {
    if (data.class_levels.length === 0) {
      return { isSpellcaster: false, cantripsLimit: 0, spellsLimit: 0, availableSpells: [] };
    }

    const classKey = data.class_levels[0].class;
    const className = classKey.split("|")[0].replace(/-/g, " ").toLowerCase();

    // Spellcasting info per class at level 1
    const spellcastingInfo: Record<string, { cantrips: number; spells: number }> = {
      bard: { cantrips: 2, spells: 4 },
      cleric: { cantrips: 3, spells: 0 }, // Prepared caster
      druid: { cantrips: 2, spells: 0 }, // Prepared caster
      sorcerer: { cantrips: 4, spells: 2 },
      warlock: { cantrips: 2, spells: 2 },
      wizard: { cantrips: 3, spells: 6 }, // Spellbook
      paladin: { cantrips: 0, spells: 0 }, // No spells at level 1
      ranger: { cantrips: 0, spells: 0 }, // No spells at level 1
    };

    const info = spellcastingInfo[className];
    if (!info) {
      return { isSpellcaster: false, cantripsLimit: 0, spellsLimit: 0, availableSpells: [] };
    }

    // Get spells for this class
    const classSpells = getSpellsForClass(className);
    const processed = classSpells
      .filter(s => s.level <= 1) // Only cantrips and 1st level
      .map(s => processSpell(s));

    return {
      isSpellcaster: true,
      cantripsLimit: info.cantrips,
      spellsLimit: info.spells,
      availableSpells: processed,
    };
  }, [data.class_levels]);

  // Filter spells
  const filteredSpells = useMemo(() => {
    return availableSpells.filter(spell => {
      if (levelFilter !== null && spell.level !== levelFilter) return false;
      if (searchQuery && !spell.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [availableSpells, levelFilter, searchQuery]);

  const cantrips = filteredSpells.filter(s => s.level === 0);
  const leveledSpells = filteredSpells.filter(s => s.level === 1);

  const handleCantripToggle = (spellName: string) => {
    let newSelection: string[];
    if (selectedCantrips.includes(spellName)) {
      newSelection = selectedCantrips.filter(s => s !== spellName);
    } else if (selectedCantrips.length < cantripsLimit) {
      newSelection = [...selectedCantrips, spellName];
    } else {
      return;
    }
    setSelectedCantrips(newSelection);
    updateData({
      spells_known: {
        ...data.spells_known,
        cantrips: newSelection,
      },
    });
  };

  const handleSpellToggle = (spellName: string) => {
    let newSelection: string[];
    if (selectedSpells.includes(spellName)) {
      newSelection = selectedSpells.filter(s => s !== spellName);
    } else if (spellsLimit === 0 || selectedSpells.length < spellsLimit) {
      newSelection = [...selectedSpells, spellName];
    } else {
      return;
    }
    setSelectedSpells(newSelection);
    updateData({
      spells_known: {
        ...data.spells_known,
        spells: newSelection,
      },
    });
  };

  if (!isSpellcaster) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Spells</h2>
          <p className="text-gray-400">
            Your class doesn&apos;t have spellcasting at level 1.
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">
            You can skip this step. Some classes gain spellcasting at higher levels,
            or through subclass features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Choose Your Spells</h2>
        <p className="text-gray-400">
          Select cantrips and 1st-level spells for your character.
        </p>
      </div>

      {/* Limits Display */}
      <div className="flex gap-4">
        {cantripsLimit > 0 && (
          <div className="bg-gray-800 rounded-lg px-4 py-2">
            <span className="text-gray-400">Cantrips: </span>
            <span className={cn(
              "font-bold",
              selectedCantrips.length === cantripsLimit ? "text-green-400" : "text-amber-400"
            )}>
              {selectedCantrips.length}/{cantripsLimit}
            </span>
          </div>
        )}
        {spellsLimit > 0 && (
          <div className="bg-gray-800 rounded-lg px-4 py-2">
            <span className="text-gray-400">Spells: </span>
            <span className={cn(
              "font-bold",
              selectedSpells.length === spellsLimit ? "text-green-400" : "text-amber-400"
            )}>
              {selectedSpells.length}/{spellsLimit}
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search spells..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setLevelFilter(null)}
            className={cn(
              "px-3 py-2 rounded-lg",
              levelFilter === null ? "bg-amber-600" : "bg-gray-700"
            )}
          >
            All
          </button>
          <button
            onClick={() => setLevelFilter(0)}
            className={cn(
              "px-3 py-2 rounded-lg",
              levelFilter === 0 ? "bg-amber-600" : "bg-gray-700"
            )}
          >
            Cantrips
          </button>
          <button
            onClick={() => setLevelFilter(1)}
            className={cn(
              "px-3 py-2 rounded-lg",
              levelFilter === 1 ? "bg-amber-600" : "bg-gray-700"
            )}
          >
            1st Level
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Spell List */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {/* Cantrips Section */}
          {(levelFilter === null || levelFilter === 0) && cantrips.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-400 mb-2">Cantrips</h3>
              <div className="space-y-1">
                {cantrips.map(spell => (
                  <button
                    key={spell.key}
                    onClick={() => {
                      handleCantripToggle(spell.name);
                      setSelectedSpell(spell);
                    }}
                    disabled={!selectedCantrips.includes(spell.name) && selectedCantrips.length >= cantripsLimit}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-colors",
                      selectedCantrips.includes(spell.name)
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-gray-700 hover:border-gray-600 bg-gray-800/50 disabled:opacity-50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{spell.name}</span>
                      {selectedCantrips.includes(spell.name) && (
                        <Check className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {spell.castingTime} • {spell.range}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 1st Level Spells */}
          {(levelFilter === null || levelFilter === 1) && leveledSpells.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-400 mb-2">1st Level Spells</h3>
              <div className="space-y-1">
                {leveledSpells.map(spell => (
                  <button
                    key={spell.key}
                    onClick={() => {
                      handleSpellToggle(spell.name);
                      setSelectedSpell(spell);
                    }}
                    disabled={spellsLimit > 0 && !selectedSpells.includes(spell.name) && selectedSpells.length >= spellsLimit}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-colors",
                      selectedSpells.includes(spell.name)
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-gray-700 hover:border-gray-600 bg-gray-800/50 disabled:opacity-50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{spell.name}</span>
                        {spell.concentration && (
                          <span className="text-xs px-1.5 py-0.5 bg-purple-600/30 text-purple-300 rounded">C</span>
                        )}
                        {spell.ritual && (
                          <span className="text-xs px-1.5 py-0.5 bg-blue-600/30 text-blue-300 rounded">R</span>
                        )}
                      </div>
                      {selectedSpells.includes(spell.name) && (
                        <Check className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {spell.castingTime} • {spell.range}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredSpells.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No spells found matching your search.
            </div>
          )}
        </div>

        {/* Spell Details */}
        {selectedSpell ? (
          <div className="bg-gray-800 rounded-lg p-4 sticky top-0">
            <h3 className="text-xl font-bold mb-2">{selectedSpell.name}</h3>
            <div className="text-sm text-gray-400 mb-4">
              {selectedSpell.level === 0 ? "Cantrip" : `Level ${selectedSpell.level}`} • {selectedSpell.school}
            </div>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400">Casting Time:</span>
                <span className="ml-2">{selectedSpell.castingTime}</span>
              </div>
              <div>
                <span className="text-gray-400">Range:</span>
                <span className="ml-2">{selectedSpell.range}</span>
              </div>
              <div>
                <span className="text-gray-400">Components:</span>
                <span className="ml-2">{selectedSpell.components.join(", ") || "None"}</span>
              </div>
              {selectedSpell.concentration && (
                <div className="p-2 bg-purple-600/20 rounded text-purple-300">
                  ✦ Requires Concentration
                </div>
              )}
              {selectedSpell.ritual && (
                <div className="p-2 bg-blue-600/20 rounded text-blue-300">
                  ✦ Can be cast as Ritual
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-800/50 rounded-lg p-8 flex items-center justify-center text-gray-500">
            Click a spell to see details
          </div>
        )}
      </div>
    </div>
  );
}
