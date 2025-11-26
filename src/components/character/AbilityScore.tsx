"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { DiceButton } from "./DiceButton";

interface AbilityScoreProps {
  name: string;
  abbreviation: string;
  score: number;
  modifier: number;
  saveProficient?: boolean;
  className?: string;
  onRoll?: (type: "check" | "save", result: number) => void;
}

export function AbilityScore({
  name,
  abbreviation,
  score,
  modifier,
  saveProficient = false,
  className,
  onRoll,
}: AbilityScoreProps) {
  const modifierStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;

  return (
    <div
      className={cn(
        "relative flex flex-col items-center p-3 rounded-lg",
        "bg-gradient-to-b from-gray-800 to-gray-900",
        "border border-gray-700 hover:border-amber-500/30",
        "transition-all duration-300",
        "group",
        className
      )}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 rounded-lg bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Ability Name */}
      <span className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">
        {abbreviation}
      </span>

      {/* Main Modifier - clickable for ability check */}
      <DiceButton
        diceFormula={`1d20${modifierStr}`}
        label={`${name} Check`}
        onRoll={(result: number) => onRoll?.("check", result)}
        className="relative z-10"
      >
        <span
          className={cn(
            "text-2xl font-bold cursor-pointer",
            "text-amber-400 group-hover:text-amber-300",
            "transition-colors"
          )}
        >
          {modifierStr}
        </span>
      </DiceButton>

      {/* Score Box */}
      <div
        className={cn(
          "mt-2 w-10 h-10 rounded-full flex items-center justify-center",
          "bg-gray-950 border-2 border-gray-700",
          "text-sm font-medium text-gray-300"
        )}
      >
        {score}
      </div>

      {/* Save indicator */}
      <div className="mt-2 flex items-center gap-1">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            saveProficient ? "bg-amber-500" : "bg-gray-700"
          )}
        />
        <DiceButton
          diceFormula={`1d20${modifierStr}`}
          label={`${name} Save`}
          onRoll={(result: number) => onRoll?.("save", result)}
          className="text-[9px] uppercase tracking-wider text-gray-500 hover:text-amber-400 cursor-pointer"
        >
          Save
        </DiceButton>
      </div>

      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-amber-500/20 rounded-tl-lg" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-amber-500/20 rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-amber-500/20 rounded-bl-lg" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-amber-500/20 rounded-br-lg" />
    </div>
  );
}

interface AbilityScoresGridProps {
  abilities: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  saveProficiencies?: string[];
  onRoll?: (ability: string, type: "check" | "save", result: number) => void;
}

const ABILITY_ABBREV: Record<string, string> = {
  strength: "STR",
  dexterity: "DEX",
  constitution: "CON",
  intelligence: "INT",
  wisdom: "WIS",
  charisma: "CHA",
};

export function AbilityScoresGrid({
  abilities,
  saveProficiencies = [],
  onRoll,
}: AbilityScoresGridProps) {
  const getModifier = (score: number) => Math.floor((score - 10) / 2);

  return (
    <div className="grid grid-cols-6 gap-2">
      {Object.entries(abilities).map(([name, score]) => (
        <AbilityScore
          key={name}
          name={name.charAt(0).toUpperCase() + name.slice(1)}
          abbreviation={ABILITY_ABBREV[name]}
          score={score}
          modifier={getModifier(score)}
          saveProficient={saveProficiencies.includes(name)}
          onRoll={(type, result) => onRoll?.(name, type, result)}
        />
      ))}
    </div>
  );
}
