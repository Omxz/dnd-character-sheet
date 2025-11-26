"use client";

import { useState, useMemo } from "react";
import { getRaces, buildKey } from "@/lib/data/loader";
import type { StepProps } from "../types";
import { cn } from "@/lib/utils";
import { Check, Eye, Users, Footprints } from "lucide-react";

interface ProcessedRace {
  key: string;
  name: string;
  source: string;
  size: string[];
  speed: number;
  darkvision?: number;
  languages: string[];
  traits: string[];
  abilityScoreChoice?: {
    count: number;
    amount: number;
  };
}

function processRace(raw: any): ProcessedRace {
  const speed = typeof raw.speed === "number" ? raw.speed : raw.speed?.walk || 30;
  
  // Extract languages
  const languages: string[] = [];
  if (raw.languageProficiencies) {
    raw.languageProficiencies.forEach((lp: any) => {
      if (lp.common) languages.push("Common");
      Object.keys(lp).forEach(key => {
        if (key !== "common" && key !== "anyStandard" && lp[key] === true) {
          languages.push(key.charAt(0).toUpperCase() + key.slice(1));
        }
      });
    });
  }
  if (languages.length === 0) languages.push("Common");

  // Extract trait names from entries
  const traits: string[] = [];
  if (raw.entries) {
    raw.entries.forEach((entry: any) => {
      if (typeof entry === "object" && entry.name) {
        traits.push(entry.name);
      }
    });
  }

  // Ability score choice (2024 rules - typically choose any)
  let abilityScoreChoice;
  if (raw.ability) {
    const ability = raw.ability[0];
    if (ability?.choose) {
      abilityScoreChoice = {
        count: ability.choose.count || 2,
        amount: ability.choose.amount || 1,
      };
    }
  }

  return {
    key: buildKey(raw.name, raw.source),
    name: raw.name,
    source: raw.source,
    size: raw.size || ["M"],
    speed,
    darkvision: raw.darkvision,
    languages,
    traits,
    abilityScoreChoice,
  };
}

export function RaceStep({ data, updateData }: StepProps) {
  // Process races synchronously from local data
  const races = useMemo(() => {
    const rawRaces = getRaces();
    return rawRaces.map(r => processRace(r));
  }, []);

  const [selectedRace, setSelectedRace] = useState<ProcessedRace | null>(() => {
    if (data.race_key) {
      return races.find(r => r.key === data.race_key) || null;
    }
    return null;
  });

  const handleSelectRace = (race: ProcessedRace) => {
    setSelectedRace(race);
    updateData({
      race_key: race.key,
      subrace_key: null,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Choose Your Race</h2>
        <p className="text-gray-400">
          Your race determines your physical traits, some proficiencies, and special abilities.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Race List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {races.map((race) => (
            <button
              key={race.key}
              onClick={() => handleSelectRace(race)}
              className={cn(
                "w-full text-left p-4 rounded-lg border transition-colors",
                selectedRace?.key === race.key
                  ? "border-amber-500 bg-amber-500/10"
                  : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{race.name}</span>
                {selectedRace?.key === race.key && (
                  <Check className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <div className="flex gap-4 mt-2 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Footprints className="w-4 h-4" />
                  {race.speed} ft
                </span>
                {race.darkvision && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {race.darkvision} ft
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {race.size.join("/")}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Race Details */}
        {selectedRace ? (
          <div className="bg-gray-800 rounded-lg p-4 sticky top-0">
            <h3 className="text-xl font-bold mb-4">{selectedRace.name}</h3>
            
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-gray-400">Size:</span>
                <span className="ml-2">{selectedRace.size.join(" or ")}</span>
              </div>
              
              <div>
                <span className="text-gray-400">Speed:</span>
                <span className="ml-2">{selectedRace.speed} feet</span>
              </div>
              
              {selectedRace.darkvision && (
                <div>
                  <span className="text-gray-400">Darkvision:</span>
                  <span className="ml-2">{selectedRace.darkvision} feet</span>
                </div>
              )}
              
              {selectedRace.languages.length > 0 && (
                <div>
                  <span className="text-gray-400">Languages:</span>
                  <span className="ml-2">{selectedRace.languages.join(", ")}</span>
                </div>
              )}

              {selectedRace.abilityScoreChoice && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <span className="text-amber-400 font-medium">Ability Score Increase:</span>
                  <p className="text-gray-300 mt-1">
                    Choose {selectedRace.abilityScoreChoice.count} ability scores to increase by {selectedRace.abilityScoreChoice.amount}
                  </p>
                </div>
              )}

              {selectedRace.traits.length > 0 && (
                <div className="border-t border-gray-700 pt-4">
                  <h4 className="font-medium mb-2">Racial Traits</h4>
                  <div className="text-gray-300 space-y-1">
                    {selectedRace.traits.map((trait, i) => (
                      <p key={i} className="text-sm">• {trait}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-800/50 rounded-lg p-8 flex items-center justify-center text-gray-500">
            Select a race to see details
          </div>
        )}
      </div>
    </div>
  );
}
