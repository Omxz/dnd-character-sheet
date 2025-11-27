"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, Info, HelpCircle } from "lucide-react";

// Spell slot level descriptions
const SLOT_DESCRIPTIONS: Record<number, string> = {
  1: "1st level spells like Shield, Magic Missile, Cure Wounds",
  2: "2nd level spells like Hold Person, Misty Step, Scorching Ray",
  3: "3rd level spells like Fireball, Counterspell, Fly",
  4: "4th level spells like Greater Invisibility, Polymorph, Banishment",
  5: "5th level spells like Hold Monster, Wall of Force, Raise Dead",
  6: "6th level spells like Disintegrate, Chain Lightning, Heal",
  7: "7th level spells like Teleport, Resurrection, Forcecage",
  8: "8th level spells like Maze, Power Word Stun, Dominate Monster",
  9: "9th level spells like Wish, Power Word Kill, Meteor Swarm",
};

interface SpellSlot {
  level: number;
  total: number;
  used: number;
}

interface SpellSlotTrackerProps {
  slots: SpellSlot[];
  onChange?: (level: number, used: number) => void;
  className?: string;
  readonly?: boolean;
}

export function SpellSlotTracker({
  slots,
  onChange,
  className,
  readonly = false,
}: SpellSlotTrackerProps) {
  const handleSlotClick = (level: number, index: number, currentUsed: number, total: number) => {
    if (readonly) return;
    
    // If clicking on a used slot, restore it (and all after)
    // If clicking on an unused slot, use it (and all before)
    const isUsed = index < currentUsed;
    const newUsed = isUsed ? index : index + 1;
    onChange?.(level, Math.min(newUsed, total));
  };

  const handleReset = (level: number) => {
    if (readonly) return;
    onChange?.(level, 0);
  };

  if (slots.length === 0 || slots.every(s => s.total === 0)) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-medium text-gray-300">Spell Slots</h3>
      </div>

      <div className="grid gap-2">
        {slots.filter(s => s.total > 0).map(({ level, total, used }) => (
          <div
            key={level}
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg",
              "bg-gray-900/50 border border-gray-800",
              "hover:border-purple-500/30 transition-colors",
              "group"
            )}
          >
            {/* Level indicator with tooltip */}
            <div className="relative">
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  "bg-gradient-to-br from-purple-900 to-purple-950",
                  "border border-purple-700/50",
                  "text-sm font-bold text-purple-300",
                  "cursor-help"
                )}
                title={SLOT_DESCRIPTIONS[level] || `Level ${level} spell slot`}
              >
                {level}
              </div>
              {/* Tooltip on hover */}
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-20 hidden group-hover:block">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-xs text-gray-300 w-48 shadow-xl">
                  <div className="font-medium text-purple-400 mb-1">Level {level} Slot</div>
                  <div>{SLOT_DESCRIPTIONS[level] || `Cast ${level}${level === 1 ? 'st' : level === 2 ? 'nd' : level === 3 ? 'rd' : 'th'} level spells`}</div>
                </div>
              </div>
            </div>

            {/* Slot bubbles */}
            <div className="flex-1 flex items-center gap-1">
              {Array.from({ length: total }, (_, i) => {
                const isUsed = i < used;
                return (
                  <button
                    key={i}
                    onClick={() => handleSlotClick(level, i, used, total)}
                    disabled={readonly}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 transition-all duration-200",
                      "flex items-center justify-center",
                      isUsed
                        ? "bg-gray-700 border-gray-600 text-gray-500"
                        : "bg-gradient-to-br from-purple-500 to-purple-700 border-purple-400 shadow-lg shadow-purple-500/30",
                      !readonly && !isUsed && "hover:scale-110 hover:shadow-purple-500/50",
                      !readonly && isUsed && "hover:border-purple-500/50"
                    )}
                  >
                    {isUsed && (
                      <span className="text-xs">✕</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Count display */}
            <div className="text-xs text-gray-500 w-12 text-right">
              {total - used}/{total}
            </div>

            {/* Reset button */}
            {!readonly && used > 0 && (
              <button
                onClick={() => handleReset(level)}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Compact inline version for character overview
interface SpellSlotCompactProps {
  slots: SpellSlot[];
  className?: string;
}

export function SpellSlotCompact({ slots, className }: SpellSlotCompactProps) {
  const availableSlots = slots.filter(s => s.total > 0);
  
  if (availableSlots.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {availableSlots.map(({ level, total, used }) => (
        <div
          key={level}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded",
            "bg-purple-900/30 border border-purple-800/50",
            "text-xs"
          )}
        >
          <span className="text-purple-400 font-medium">L{level}</span>
          <span className="text-gray-400">
            {total - used}/{total}
          </span>
        </div>
      ))}
    </div>
  );
}

// Pact slots for warlocks
interface PactSlotTrackerProps {
  slots: number;
  used: number;
  level: number;
  onChange?: (used: number) => void;
  readonly?: boolean;
}

export function PactSlotTracker({
  slots,
  used,
  level,
  onChange,
  readonly = false,
}: PactSlotTrackerProps) {
  if (slots === 0) return null;

  return (
    <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border border-emerald-700/50">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-emerald-400" />
        <span className="text-sm font-medium text-emerald-300">Pact Magic</span>
        <span className="text-xs text-gray-500">(Level {level})</span>
      </div>

      <div className="flex items-center gap-2">
        {Array.from({ length: slots }, (_, i) => {
          const isUsed = i < used;
          return (
            <button
              key={i}
              onClick={() => {
                if (readonly) return;
                const newUsed = isUsed ? i : i + 1;
                onChange?.(newUsed);
              }}
              disabled={readonly}
              className={cn(
                "w-8 h-8 rounded-lg border-2 transition-all duration-200",
                isUsed
                  ? "bg-gray-700 border-gray-600"
                  : "bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 shadow-lg shadow-emerald-500/30",
                !readonly && "hover:scale-105"
              )}
            />
          );
        })}
        <span className="text-sm text-gray-400 ml-2">
          {slots - used}/{slots}
        </span>
      </div>
    </div>
  );
}
