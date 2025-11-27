"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Check, Search, X, BookOpen } from "lucide-react";

interface PrepareSpellsInterfaceProps {
  character: {
    class_levels: Array<{ class: string; level: number }>;
    ability_scores: {
      strength: number;
      dexterity: number;
      constitution: number;
      intelligence: number;
      wisdom: number;
      charisma: number;
    };
    spellbook?: string[]; // For wizards
  };
  availableSpells: Array<{ name: string; level: number }>;
  currentlyPrepared: string[];
  onSave: (preparedSpells: string[]) => void;
  onCancel: () => void;
}

// Classes that prepare spells (not known-casters)
const PREPARED_CASTERS: Record<string, keyof PrepareSpellsInterfaceProps["character"]["ability_scores"]> = {
  cleric: "wisdom",
  druid: "wisdom",
  paladin: "charisma",
  wizard: "intelligence",
};

export function PrepareSpellsInterface({
  character,
  availableSpells,
  currentlyPrepared,
  onSave,
  onCancel,
}: PrepareSpellsInterfaceProps) {
  const [prepared, setPrepared] = useState<string[]>(currentlyPrepared);
  const [searchQuery, setSearchQuery] = useState("");

  // Determine primary class
  const primaryClass = character.class_levels[0];
  const className = primaryClass?.class?.split("|")[0]?.toLowerCase() || "";
  const classLevel = primaryClass?.level || 1;

  // Get spellcasting ability
  const spellcastingAbility = PREPARED_CASTERS[className];
  const abilityMod = spellcastingAbility
    ? Math.floor((character.ability_scores[spellcastingAbility] - 10) / 2)
    : 0;

  // Calculate max prepared spells
  const maxPrepared = Math.max(1, classLevel + abilityMod);

  // For wizards, only show spells from their spellbook
  const spellsToShow = useMemo(() => {
    let spells = availableSpells;

    // Wizards can only prepare from spellbook
    if (className === "wizard" && character.spellbook) {
      spells = spells.filter(spell => character.spellbook!.includes(spell.name));
    }

    // Filter by search query
    if (searchQuery) {
      spells = spells.filter(spell =>
        spell.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Group by level
    const grouped: Record<number, typeof spells> = {};
    for (const spell of spells) {
      if (!grouped[spell.level]) grouped[spell.level] = [];
      grouped[spell.level].push(spell);
    }

    return grouped;
  }, [availableSpells, character.spellbook, className, searchQuery]);

  const toggleSpell = (spellName: string) => {
    if (prepared.includes(spellName)) {
      setPrepared(prepared.filter(s => s !== spellName));
    } else if (prepared.length < maxPrepared) {
      setPrepared([...prepared, spellName]);
    }
  };

  const handleSave = () => {
    onSave(prepared);
  };

  const canPrepare = (spell: { name: string; level: number }) => {
    // Cantrips are always prepared (don't count toward limit)
    if (spell.level === 0) return true;

    // If already prepared, can toggle off
    if (prepared.includes(spell.name)) return true;

    // Check if under limit
    const preparedNonCantrips = prepared.filter(name => {
      const s = availableSpells.find(sp => sp.name === name);
      return s && s.level > 0;
    });
    return preparedNonCantrips.length < maxPrepared;
  };

  // Count non-cantrip prepared spells
  const preparedCount = prepared.filter(name => {
    const spell = availableSpells.find(s => s.name === name);
    return spell && spell.level > 0;
  }).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-white">Prepare Spells</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <p className="text-sm text-gray-400 mb-3">
          You can prepare {maxPrepared} spell{maxPrepared !== 1 ? "s" : ""} (Level + {spellcastingAbility?.toUpperCase().slice(0, 3)} modifier).
          {className === "wizard" && " You can only prepare spells from your spellbook."}
        </p>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search spells..."
              className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Counter */}
          <div className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg whitespace-nowrap">
            <span className={cn(
              "font-medium",
              preparedCount > maxPrepared ? "text-red-400" : "text-amber-400"
            )}>
              {preparedCount} / {maxPrepared}
            </span>
          </div>
        </div>
      </div>

      {/* Spell List */}
      <div className="flex-1 overflow-y-auto p-4">
        {Object.keys(spellsToShow).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <BookOpen className="w-16 h-16 mb-4 opacity-50" />
            <p>No spells found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(spellsToShow)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([level, spells]) => (
                <div key={level}>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">
                    {level === "0" ? "Cantrips" : `Level ${level}`}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {spells.map((spell) => {
                      const isPrepared = prepared.includes(spell.name);
                      const isCantrip = spell.level === 0;
                      const canToggle = canPrepare(spell);

                      return (
                        <button
                          key={spell.name}
                          onClick={() => canToggle && toggleSpell(spell.name)}
                          disabled={!canToggle && !isPrepared}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                            isPrepared
                              ? "bg-amber-900/30 border-amber-500"
                              : canToggle
                              ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                              : "bg-gray-800/50 border-gray-800 opacity-50 cursor-not-allowed"
                          )}
                        >
                          <div
                            className={cn(
                              "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0",
                              isPrepared
                                ? "bg-amber-600 border-amber-500 text-white"
                                : "border-gray-600"
                            )}
                          >
                            {isPrepared && <Check className="w-3 h-3" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-white">{spell.name}</span>
                            {isCantrip && (
                              <span className="text-xs text-gray-500 ml-2">(always prepared)</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 flex justify-between">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium transition-colors"
        >
          Save Prepared Spells
        </button>
      </div>
    </div>
  );
}
