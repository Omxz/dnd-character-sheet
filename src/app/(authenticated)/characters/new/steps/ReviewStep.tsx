"use client";

import type { StepProps } from "../types";
import { cn, formatModifier, getModifier, ABILITY_ABBREVIATIONS, getProficiencyBonus } from "@/lib/utils";
import { 
  User, Users, BookOpen, Sword, Shield, Sparkles, 
  Heart, Dices, Check, AlertCircle 
} from "lucide-react";

export function ReviewStep({ data, updateData }: StepProps) {
  // Validation checks
  const issues: string[] = [];
  
  if (!data.name.trim()) {
    issues.push("Character needs a name");
  }
  if (!data.race_key) {
    issues.push("Select a race");
  }
  if (data.class_levels.length === 0) {
    issues.push("Select a class");
  }
  if (!data.background_key) {
    issues.push("Select a background");
  }

  const totalLevel = data.class_levels.reduce((sum, cl) => sum + cl.level, 0) || 1;
  const profBonus = getProficiencyBonus(totalLevel);

  // Calculate HP (Constitution modifier + hit die max for level 1)
  const conMod = getModifier(data.ability_scores.constitution);
  const hitDie = data.class_levels.length > 0 ? getHitDie(data.class_levels[0].class) : 8;
  const maxHP = hitDie + conMod;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Review Your Character</h2>
        <p className="text-gray-400">
          Review your character before finalizing. Make sure everything looks correct.
        </p>
      </div>

      {/* Validation Issues */}
      {issues.length > 0 && (
        <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-400 font-medium mb-2">
            <AlertCircle className="w-5 h-5" />
            Please fix the following issues:
          </div>
          <ul className="list-disc list-inside text-red-300 space-y-1">
            {issues.map((issue, i) => (
              <li key={i}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Character Overview Card */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700">
        <div className="flex items-start gap-6">
          {/* Avatar Placeholder */}
          <div className="w-24 h-24 rounded-lg bg-gray-700 flex items-center justify-center text-4xl">
            <User className="w-12 h-12 text-gray-500" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-2xl font-bold">
              {data.name || "Unnamed Character"}
            </h3>
            <div className="text-gray-400 mt-1">
              {formatRaceKey(data.race_key)} {formatClassLevels(data.class_levels)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {formatBackgroundKey(data.background_key)}
            </div>

            <div className="flex gap-6 mt-4 text-sm">
              <div>
                <span className="text-gray-400">Level</span>
                <div className="text-xl font-bold">{totalLevel}</div>
              </div>
              <div>
                <span className="text-gray-400">Hit Points</span>
                <div className="text-xl font-bold text-red-400">{maxHP}</div>
              </div>
              <div>
                <span className="text-gray-400">Proficiency</span>
                <div className="text-xl font-bold text-amber-400">+{profBonus}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ability Scores */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Dices className="w-5 h-5 text-amber-500" />
          Ability Scores
        </h4>
        <div className="grid grid-cols-6 gap-2">
          {Object.entries(data.ability_scores).map(([ability, score]) => (
            <div key={ability} className="text-center p-3 bg-gray-700 rounded-lg">
              <div className="text-xs text-gray-400 uppercase">
                {ABILITY_ABBREVIATIONS[ability]}
              </div>
              <div className="text-2xl font-bold">{score}</div>
              <div className={cn(
                "text-sm",
                getModifier(score) >= 0 ? "text-green-400" : "text-red-400"
              )}>
                {formatModifier(getModifier(score))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills & Proficiencies */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            Skill Proficiencies
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.skill_proficiencies.length > 0 ? (
              data.skill_proficiencies.map(skill => (
                <span key={skill} className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded capitalize text-sm">
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-gray-500">None selected</span>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Saving Throws
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.saving_throw_proficiencies.length > 0 ? (
              data.saving_throw_proficiencies.map(save => (
                <span key={save} className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded capitalize text-sm">
                  {save}
                </span>
              ))
            ) : (
              <span className="text-gray-500">None</span>
            )}
          </div>
        </div>
      </div>

      {/* Equipment */}
      {data.equipment.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Sword className="w-5 h-5 text-red-400" />
            Equipment
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.equipment.map((item, i) => (
              <span key={i} className="px-2 py-1 bg-gray-700 rounded text-sm capitalize">
                {item.item_key.replace(/-/g, " ")}
                {item.quantity > 1 && ` (×${item.quantity})`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Spells */}
      {(data.spells_known.cantrips.length > 0 || data.spells_known.spells.length > 0) && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Spells
          </h4>
          
          {data.spells_known.cantrips.length > 0 && (
            <div className="mb-3">
              <div className="text-sm text-gray-400 mb-2">Cantrips</div>
              <div className="flex flex-wrap gap-2">
                {data.spells_known.cantrips.map(spell => (
                  <span key={spell} className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-sm">
                    {spell}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {data.spells_known.spells.length > 0 && (
            <div>
              <div className="text-sm text-gray-400 mb-2">1st Level Spells</div>
              <div className="flex flex-wrap gap-2">
                {data.spells_known.spells.map(spell => (
                  <span key={spell} className="px-2 py-1 bg-purple-600/30 text-purple-200 rounded text-sm">
                    {spell}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Description Summary */}
      {(data.personality_traits || data.ideals || data.bonds || data.flaws || data.backstory) && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400" />
            Character Details
          </h4>
          <div className="space-y-3 text-sm">
            {data.personality_traits && (
              <div>
                <span className="text-gray-400">Personality: </span>
                <span>{data.personality_traits}</span>
              </div>
            )}
            {data.ideals && (
              <div>
                <span className="text-gray-400">Ideals: </span>
                <span>{data.ideals}</span>
              </div>
            )}
            {data.bonds && (
              <div>
                <span className="text-gray-400">Bonds: </span>
                <span>{data.bonds}</span>
              </div>
            )}
            {data.flaws && (
              <div>
                <span className="text-gray-400">Flaws: </span>
                <span>{data.flaws}</span>
              </div>
            )}
            {data.backstory && (
              <div>
                <span className="text-gray-400">Backstory: </span>
                <span className="line-clamp-3">{data.backstory}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ready Message */}
      {issues.length === 0 && (
        <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4 flex items-center gap-3">
          <Check className="w-6 h-6 text-green-400" />
          <div>
            <p className="font-medium text-green-400">Ready to create!</p>
            <p className="text-sm text-gray-400">
              Click &quot;Create Character&quot; to save your character.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions
function formatRaceKey(key: string): string {
  if (!key) return "";
  return key.split("|")[0].replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function formatBackgroundKey(key: string): string {
  if (!key) return "";
  return key.split("|")[0].replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function formatClassLevels(levels: { class: string; level: number }[]): string {
  if (levels.length === 0) return "";
  return levels.map(cl => {
    const name = cl.class.split("|")[0].replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    return `${name} ${cl.level}`;
  }).join(" / ");
}

function getHitDie(classKey: string): number {
  const className = classKey.split("|")[0].toLowerCase();
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
  return hitDice[className] || 8;
}
