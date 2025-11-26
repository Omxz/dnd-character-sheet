"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { DiceButton } from "./DiceButton";

interface SkillRowProps {
  name: string;
  ability: string;
  modifier: number;
  proficient?: boolean;
  expertise?: boolean;
  onRoll?: (result: number) => void;
  className?: string;
}

export function SkillRow({
  name,
  ability,
  modifier,
  proficient = false,
  expertise = false,
  onRoll,
  className,
}: SkillRowProps) {
  const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;

  return (
    <div
      className={cn(
        "flex items-center gap-2 py-1.5 px-2 rounded",
        "hover:bg-gray-800/50 transition-colors group",
        className
      )}
    >
      {/* Proficiency indicator */}
      <div className="flex items-center gap-0.5">
        <div
          className={cn(
            "w-2 h-2 rounded-full border transition-colors",
            expertise
              ? "bg-amber-500 border-amber-400"
              : proficient
              ? "bg-amber-500/60 border-amber-500/80"
              : "bg-transparent border-gray-600"
          )}
        />
        {expertise && (
          <div className="w-2 h-2 rounded-full bg-amber-500 border border-amber-400" />
        )}
      </div>

      {/* Skill name */}
      <span className="flex-1 text-sm text-gray-300">{name}</span>

      {/* Ability tag */}
      <span className="text-[10px] uppercase text-gray-600 w-8">
        {ability}
      </span>

      {/* Modifier - clickable */}
      <DiceButton
        diceFormula={`1d20${modStr}`}
        label={`${name} (${ability})`}
        onRoll={(result) => onRoll?.(result)}
        className={cn(
          "w-10 text-right font-mono text-sm font-medium",
          "text-gray-400 group-hover:text-amber-400",
          "transition-colors"
        )}
      >
        {modStr}
      </DiceButton>
    </div>
  );
}

interface SkillsListProps {
  skills: Array<{
    name: string;
    ability: string;
    modifier: number;
    proficient: boolean;
    expertise?: boolean;
  }>;
  onRoll?: (skillName: string, result: number) => void;
  className?: string;
}

export function SkillsList({ skills, onRoll, className }: SkillsListProps) {
  return (
    <div className={cn("space-y-0.5", className)}>
      {skills.map((skill) => (
        <SkillRow
          key={skill.name}
          name={skill.name}
          ability={skill.ability}
          modifier={skill.modifier}
          proficient={skill.proficient}
          expertise={skill.expertise}
          onRoll={(result) => onRoll?.(skill.name, result)}
        />
      ))}
    </div>
  );
}

// Default D&D 5e skills
export const DND_SKILLS = [
  { name: "Acrobatics", ability: "DEX" },
  { name: "Animal Handling", ability: "WIS" },
  { name: "Arcana", ability: "INT" },
  { name: "Athletics", ability: "STR" },
  { name: "Deception", ability: "CHA" },
  { name: "History", ability: "INT" },
  { name: "Insight", ability: "WIS" },
  { name: "Intimidation", ability: "CHA" },
  { name: "Investigation", ability: "INT" },
  { name: "Medicine", ability: "WIS" },
  { name: "Nature", ability: "INT" },
  { name: "Perception", ability: "WIS" },
  { name: "Performance", ability: "CHA" },
  { name: "Persuasion", ability: "CHA" },
  { name: "Religion", ability: "INT" },
  { name: "Sleight of Hand", ability: "DEX" },
  { name: "Stealth", ability: "DEX" },
  { name: "Survival", ability: "WIS" },
] as const;

// Helper to calculate skill modifiers
export function calculateSkillModifier(
  abilityScore: number,
  proficiencyBonus: number,
  proficient: boolean,
  expertise: boolean
): number {
  const abilityMod = Math.floor((abilityScore - 10) / 2);
  if (expertise) return abilityMod + proficiencyBonus * 2;
  if (proficient) return abilityMod + proficiencyBonus;
  return abilityMod;
}
