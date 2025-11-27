"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { DiceButton } from "./DiceButton";
import { Sword, Wand2, Crosshair } from "lucide-react";

interface AttackRowProps {
  name: string;
  attackBonus: number;
  damage: string;
  damageType: string;
  range?: string;
  properties?: string[];
  isSpell?: boolean;
  onAttackRoll?: (result: number) => void;
  onDamageRoll?: (result: number) => void;
  className?: string;
}

export function AttackRow({
  name,
  attackBonus,
  damage,
  damageType,
  range,
  properties = [],
  isSpell = false,
  onAttackRoll,
  onDamageRoll,
  className,
}: AttackRowProps) {
  const atkStr = attackBonus >= 0 ? `+${attackBonus}` : `${attackBonus}`;
  const Icon = isSpell ? Wand2 : Sword;

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg",
        "bg-gray-900/50 border border-gray-800",
        "hover:border-red-500/30 transition-colors",
        "group",
        className
      )}
    >
      {/* Icon */}
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center",
        isSpell 
          ? "bg-purple-900/50 text-purple-400" 
          : "bg-red-900/50 text-red-400"
      )}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Name & properties */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-200 truncate">{name}</h4>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {range && <span>{range}</span>}
          {properties.length > 0 && (
            <>
              {range && <span>•</span>}
              <span>{properties.join(", ")}</span>
            </>
          )}
        </div>
      </div>

      {/* Attack roll */}
      <DiceButton
        diceFormula={`1d20${atkStr}`}
        label={`${name} Attack`}
        onRoll={(result) => onAttackRoll?.(result)}
        className={cn(
          "px-3 py-1.5 rounded",
          "bg-gray-800 hover:bg-gray-700",
          "border border-gray-700 hover:border-red-500/50",
          "font-mono font-medium text-gray-300 group-hover:text-red-400",
          "transition-colors",
          "flex items-center gap-1.5"
        )}
      >
        <Crosshair className="w-3 h-3" />
        <span className="text-xs text-gray-500">ATK</span>
        <span>{atkStr}</span>
      </DiceButton>

      {/* Damage roll */}
      <DiceButton
        diceFormula={damage}
        label={`${name} Damage`}
        onRoll={(result) => onDamageRoll?.(result)}
        className={cn(
          "px-3 py-1.5 rounded min-w-[100px]",
          "bg-gray-800 hover:bg-gray-700",
          "border border-gray-700 hover:border-red-500/50",
          "text-gray-300 group-hover:text-red-400",
          "transition-colors",
          "flex items-center gap-1.5"
        )}
      >
        <span className="text-xs text-gray-500">DMG</span>
        <span className="font-mono">{damage}</span>
        <span className="text-xs text-gray-500">{damageType}</span>
      </DiceButton>
    </div>
  );
}

interface AttackListProps {
  attacks: Array<{
    name: string;
    attackBonus: number;
    damage: string;
    damageType: string;
    range?: string;
    properties?: string[];
    isSpell?: boolean;
  }>;
  onAttackRoll?: (attackName: string, result: number) => void;
  onDamageRoll?: (attackName: string, result: number) => void;
  className?: string;
}

export function AttackList({
  attacks,
  onAttackRoll,
  onDamageRoll,
  className,
}: AttackListProps) {
  if (attacks.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        No attacks configured
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {attacks.map((attack, i) => (
        <AttackRow
          key={`${attack.name}-${i}`}
          {...attack}
          onAttackRoll={(result) => onAttackRoll?.(attack.name, result)}
          onDamageRoll={(result) => onDamageRoll?.(attack.name, result)}
        />
      ))}
    </div>
  );
}

// Helper to build attacks from equipment and abilities
export interface WeaponData {
  name: string;
  damage: string;
  damageType: string;
  range?: string;
  properties: string[];
  isRanged: boolean;
  isFinesse: boolean;
}

export function buildAttackFromWeapon(
  weapon: WeaponData,
  strMod: number,
  dexMod: number,
  proficiencyBonus: number,
  isProficient: boolean
): AttackRowProps {
  // Determine which modifier to use
  let abilityMod: number;
  if (weapon.isRanged) {
    abilityMod = dexMod;
  } else if (weapon.isFinesse) {
    abilityMod = Math.max(strMod, dexMod);
  } else {
    abilityMod = strMod;
  }

  const attackBonus = abilityMod + (isProficient ? proficiencyBonus : 0);
  
  // Add modifier to damage
  const damageWithMod = abilityMod >= 0 
    ? `${weapon.damage}+${abilityMod}`
    : `${weapon.damage}${abilityMod}`;

  return {
    name: weapon.name,
    attackBonus,
    damage: damageWithMod,
    damageType: weapon.damageType,
    range: weapon.range,
    properties: weapon.properties,
    isSpell: false,
  };
}
