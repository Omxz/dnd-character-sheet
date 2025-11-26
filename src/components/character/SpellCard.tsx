"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { DiceButton } from "./DiceButton";
import { 
  Sparkles, 
  Clock, 
  Target, 
  Zap, 
  Wind,
  Shield,
  Volume2,
  Eye,
  Hand,
  BookOpen,
  Check,
  X,
  ArrowUp
} from "lucide-react";

const SPELL_SCHOOLS: Record<string, { color: string; icon: React.ReactNode }> = {
  Abjuration: { color: "text-blue-400", icon: <Shield className="w-4 h-4" /> },
  Conjuration: { color: "text-yellow-400", icon: <Sparkles className="w-4 h-4" /> },
  Divination: { color: "text-purple-400", icon: <Eye className="w-4 h-4" /> },
  Enchantment: { color: "text-pink-400", icon: <Sparkles className="w-4 h-4" /> },
  Evocation: { color: "text-red-400", icon: <Zap className="w-4 h-4" /> },
  Illusion: { color: "text-indigo-400", icon: <Eye className="w-4 h-4" /> },
  Necromancy: { color: "text-green-400", icon: <Sparkles className="w-4 h-4" /> },
  Transmutation: { color: "text-orange-400", icon: <Wind className="w-4 h-4" /> },
  Unknown: { color: "text-gray-400", icon: <Sparkles className="w-4 h-4" /> },
};

interface SpellCardProps {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  duration: string;
  components: string[];
  concentration?: boolean;
  ritual?: boolean;
  description: string;
  atHigherLevels?: string;
  damage?: string;
  damageType?: string;
  savingThrow?: string;
  attackType?: "melee" | "ranged";
  prepared?: boolean;
  onTogglePrepared?: () => void;
  onCast?: (atLevel: number) => void;
  onRollDamage?: (dice: string, damageType: string) => void;
  onRollAttack?: (attackBonus: number) => void;
  spellAttackBonus?: number;
  spellSaveDC?: number;
  maxSpellSlot?: number;
  className?: string;
  compact?: boolean;
}

export function SpellCard({
  name,
  level,
  school,
  castingTime,
  range,
  duration,
  components,
  concentration = false,
  ritual = false,
  description,
  atHigherLevels,
  damage,
  damageType,
  savingThrow,
  attackType,
  prepared,
  onTogglePrepared,
  onCast,
  onRollDamage,
  onRollAttack,
  spellAttackBonus = 5,
  spellSaveDC = 13,
  maxSpellSlot = 9,
  className,
  compact = false,
}: SpellCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [castLevel, setCastLevel] = useState(level);
  
  const schoolData = SPELL_SCHOOLS[school] || { color: "text-gray-400", icon: <Sparkles className="w-4 h-4" /> };
  const isCantrip = level === 0;

  const componentIcons: Record<string, React.ReactNode> = {
    V: <span title="Verbal"><Volume2 className="w-3 h-3" /></span>,
    S: <span title="Somatic"><Hand className="w-3 h-3" /></span>,
    M: <span title="Material"><BookOpen className="w-3 h-3" /></span>,
  };

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg",
          "bg-gray-900/50 border border-gray-800",
          "hover:border-purple-500/30 transition-colors",
          prepared === false && "opacity-50",
          className
        )}
      >
        <span className={cn("text-sm", schoolData.color)}>{schoolData.icon}</span>
        <span className="flex-1 text-sm text-gray-300 truncate">{name}</span>
        {concentration && (
          <span className="text-xs text-yellow-500" title="Concentration">C</span>
        )}
        {ritual && (
          <span className="text-xs text-blue-500" title="Ritual">R</span>
        )}
        <span className="text-xs text-gray-500">
          {isCantrip ? "Cantrip" : `Lvl ${level}`}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden",
        "bg-gradient-to-br from-gray-800/80 to-gray-900",
        "border border-gray-700 hover:border-purple-500/30",
        "transition-all duration-200",
        prepared === false && "opacity-60",
        className
      )}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-800/50 transition-colors"
      >
        {/* Prepared checkbox */}
        {onTogglePrepared && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePrepared();
            }}
            className={cn(
              "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
              prepared
                ? "bg-purple-600 border-purple-500 text-white"
                : "bg-transparent border-gray-600 hover:border-purple-500/50"
            )}
          >
            {prepared && <Check className="w-3 h-3" />}
          </button>
        )}

        {/* School icon */}
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-gray-800", schoolData.color)}>
          {schoolData.icon}
        </div>

        {/* Name & level */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-100 truncate">{name}</h4>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className={schoolData.color}>{school}</span>
            <span>•</span>
            <span>{isCantrip ? "Cantrip" : `Level ${level}`}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5">
          {concentration && (
            <span className="px-1.5 py-0.5 rounded text-xs bg-yellow-900/50 text-yellow-500 border border-yellow-700/50">
              C
            </span>
          )}
          {ritual && (
            <span className="px-1.5 py-0.5 rounded text-xs bg-blue-900/50 text-blue-500 border border-blue-700/50">
              R
            </span>
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4">
          <div className="border-t border-gray-700/50 pt-3 space-y-3">
            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Clock className="w-3 h-3 text-amber-500" />
                <span>{castingTime}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <Target className="w-3 h-3 text-red-500" />
                <span>{range}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <Clock className="w-3 h-3 text-blue-500" />
                <span>{duration}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                {components.map((c) => (
                  <span key={c} className="text-purple-400">
                    {componentIcons[c.charAt(0)] || c}
                  </span>
                ))}
              </div>
            </div>

            {/* Damage / Attack / Save info */}
            {(damage || attackType || savingThrow) && (
              <div className="flex flex-wrap gap-2">
                {attackType && (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-900/30 border border-red-700/50">
                    <Zap className="w-3 h-3 text-red-400" />
                    <span className="text-xs text-red-300">
                      {attackType === "melee" ? "Melee" : "Ranged"} Attack +{spellAttackBonus}
                    </span>
                    {onRollAttack && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRollAttack(spellAttackBonus);
                        }}
                        className="ml-1 px-1.5 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-xs"
                      >
                        Roll
                      </button>
                    )}
                  </div>
                )}
                {savingThrow && (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-yellow-900/30 border border-yellow-700/50">
                    <Shield className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-yellow-300">
                      DC {spellSaveDC} {savingThrow.charAt(0).toUpperCase() + savingThrow.slice(1)} Save
                    </span>
                  </div>
                )}
                {damage && (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-orange-900/30 border border-orange-700/50">
                    <Zap className="w-3 h-3 text-orange-400" />
                    <span className="text-xs text-orange-300">
                      {damage} {damageType || "damage"}
                    </span>
                    {onRollDamage && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRollDamage(damage, damageType || "damage");
                        }}
                        className="ml-1 px-1.5 py-0.5 rounded bg-orange-600 hover:bg-orange-500 text-white text-xs"
                      >
                        Roll
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">
              {description}
            </div>

            {/* At higher levels */}
            {atHigherLevels && (
              <div className="p-2 rounded-lg bg-purple-900/20 border border-purple-700/30">
                <p className="text-xs text-purple-300 whitespace-pre-wrap">
                  <strong>At Higher Levels:</strong> {atHigherLevels}
                </p>
              </div>
            )}

            {/* Cast button with level selector */}
            {onCast && !isCantrip && (
              <div className="flex items-center gap-3 pt-2 border-t border-gray-700/50">
                <span className="text-xs text-gray-500">Cast at level:</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: maxSpellSlot - level + 1 }, (_, i) => level + i).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setCastLevel(lvl)}
                      className={cn(
                        "w-6 h-6 rounded text-xs font-medium transition-all",
                        lvl === castLevel
                          ? "bg-purple-600 text-white"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      )}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => onCast(castLevel)}
                  className="ml-auto px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" />
                  Cast
                  {castLevel > level && (
                    <ArrowUp className="w-3 h-3 text-purple-300" />
                  )}
                </button>
              </div>
            )}

            {/* Cantrip cast button */}
            {onCast && isCantrip && (
              <div className="pt-2 border-t border-gray-700/50">
                <button
                  onClick={() => onCast(0)}
                  className="px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" />
                  Cast
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface SpellListProps {
  spells: Array<{
    name: string;
    level: number;
    school: string;
    castingTime: string;
    range: string;
    duration: string;
    components: string[];
    concentration?: boolean;
    ritual?: boolean;
    description: string;
    atHigherLevels?: string;
    damage?: string;
    damageType?: string;
    savingThrow?: string;
    attackType?: "melee" | "ranged";
    prepared?: boolean;
  }>;
  onTogglePrepared?: (spellName: string) => void;
  onCast?: (spellName: string, atLevel: number) => void;
  onRollDamage?: (spellName: string, dice: string, damageType: string) => void;
  onRollAttack?: (spellName: string, attackBonus: number) => void;
  spellAttackBonus?: number;
  spellSaveDC?: number;
  maxSpellSlot?: number;
  showByLevel?: boolean;
  className?: string;
}

export function SpellList({
  spells,
  onTogglePrepared,
  onCast,
  onRollDamage,
  onRollAttack,
  spellAttackBonus = 5,
  spellSaveDC = 13,
  maxSpellSlot = 9,
  showByLevel = true,
  className,
}: SpellListProps) {
  if (spells.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No spells known</p>
      </div>
    );
  }

  if (!showByLevel) {
    return (
      <div className={cn("space-y-2", className)}>
        {spells.map((spell) => (
          <SpellCard
            key={spell.name}
            {...spell}
            onTogglePrepared={onTogglePrepared ? () => onTogglePrepared(spell.name) : undefined}
            onCast={onCast ? (level) => onCast(spell.name, level) : undefined}
            onRollDamage={onRollDamage && spell.damage ? (dice, type) => onRollDamage(spell.name, dice, type) : undefined}
            onRollAttack={onRollAttack && spell.attackType ? (bonus) => onRollAttack(spell.name, bonus) : undefined}
            spellAttackBonus={spellAttackBonus}
            spellSaveDC={spellSaveDC}
            maxSpellSlot={maxSpellSlot}
          />
        ))}
      </div>
    );
  }

  // Group by level
  const byLevel = spells.reduce((acc, spell) => {
    const lvl = spell.level;
    if (!acc[lvl]) acc[lvl] = [];
    acc[lvl].push(spell);
    return acc;
  }, {} as Record<number, typeof spells>);

  const levels = Object.keys(byLevel).map(Number).sort((a, b) => a - b);

  return (
    <div className={cn("space-y-6", className)}>
      {levels.map((level) => (
        <div key={level}>
          <h4 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
            {level === 0 ? "Cantrips" : `Level ${level} Spells`}
          </h4>
          <div className="space-y-2">
            {byLevel[level].map((spell) => (
              <SpellCard
                key={spell.name}
                {...spell}
                onTogglePrepared={onTogglePrepared ? () => onTogglePrepared(spell.name) : undefined}
                onCast={onCast ? (lvl) => onCast(spell.name, lvl) : undefined}
                onRollDamage={onRollDamage && spell.damage ? (dice, type) => onRollDamage(spell.name, dice, type) : undefined}
                onRollAttack={onRollAttack && spell.attackType ? (bonus) => onRollAttack(spell.name, bonus) : undefined}
                spellAttackBonus={spellAttackBonus}
                spellSaveDC={spellSaveDC}
                maxSpellSlot={maxSpellSlot}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
