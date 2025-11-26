"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Heart, HeartCrack, Shield, Zap, Minus, Plus } from "lucide-react";

interface HPBarProps {
  currentHP: number;
  maxHP: number;
  tempHP?: number;
  onChange?: (current: number, temp: number) => void;
  className?: string;
  readonly?: boolean;
}

export function HPBar({
  currentHP,
  maxHP,
  tempHP = 0,
  onChange,
  className,
  readonly = false,
}: HPBarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>("");

  const healthPercent = Math.max(0, Math.min(100, (currentHP / maxHP) * 100));
  const tempPercent = Math.min(100 - healthPercent, (tempHP / maxHP) * 100);

  // Determine health state for colors
  const getHealthColor = () => {
    if (currentHP <= 0) return "from-gray-700 to-gray-800";
    if (healthPercent <= 25) return "from-red-700 to-red-900";
    if (healthPercent <= 50) return "from-orange-600 to-orange-800";
    return "from-green-600 to-green-800";
  };

  const adjustHP = (delta: number) => {
    if (readonly) return;
    
    let newCurrent = currentHP;
    let newTemp = tempHP;

    if (delta < 0 && tempHP > 0) {
      // Damage eats temp HP first
      const damageToTemp = Math.min(tempHP, Math.abs(delta));
      newTemp = tempHP - damageToTemp;
      delta += damageToTemp;
    }

    if (delta !== 0) {
      newCurrent = Math.max(0, Math.min(maxHP, currentHP + delta));
    }

    onChange?.(newCurrent, newTemp);
  };

  const handleEditSubmit = () => {
    if (!editValue) {
      setIsEditing(false);
      return;
    }

    const value = editValue.trim();
    const match = value.match(/^([+-])?(\d+)$/);

    if (match) {
      const sign = match[1];
      const num = parseInt(match[2]);

      if (sign === "+") {
        adjustHP(num);
      } else if (sign === "-") {
        adjustHP(-num);
      } else {
        // Direct set
        onChange?.(Math.max(0, Math.min(maxHP, num)), tempHP);
      }
    }

    setEditValue("");
    setIsEditing(false);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* HP Header */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {currentHP <= 0 ? (
            <HeartCrack className="w-4 h-4 text-red-500 animate-pulse" />
          ) : (
            <Heart className="w-4 h-4 text-red-500" />
          )}
          <span className="text-gray-400 uppercase tracking-wider text-xs">Hit Points</span>
        </div>

        {tempHP > 0 && (
          <div className="flex items-center gap-1 text-cyan-400">
            <Shield className="w-3 h-3" />
            <span className="text-xs">+{tempHP} temp</span>
          </div>
        )}
      </div>

      {/* HP Bar */}
      <div className="relative h-8 rounded-lg overflow-hidden bg-gray-900 border border-gray-700">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>

        {/* Health fill */}
        <div
          className={cn(
            "absolute inset-y-0 left-0 transition-all duration-500",
            "bg-gradient-to-r",
            getHealthColor()
          )}
          style={{ width: `${healthPercent}%` }}
        />

        {/* Temp HP fill */}
        {tempHP > 0 && (
          <div
            className="absolute inset-y-0 bg-cyan-500/40 transition-all duration-500"
            style={{
              left: `${healthPercent}%`,
              width: `${tempPercent}%`,
            }}
          />
        )}

        {/* HP Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleEditSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEditSubmit();
                if (e.key === "Escape") {
                  setIsEditing(false);
                  setEditValue("");
                }
              }}
              placeholder="+5 or -3 or 15"
              className="w-24 bg-transparent text-center text-white font-bold outline-none"
              autoFocus
            />
          ) : (
            <button
              onClick={() => !readonly && setIsEditing(true)}
              className={cn(
                "font-bold text-white drop-shadow-lg",
                !readonly && "hover:text-amber-300 cursor-pointer"
              )}
            >
              {currentHP} / {maxHP}
            </button>
          )}
        </div>

        {/* Segment markers */}
        <div className="absolute inset-0 flex pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex-1 border-r border-white/10 last:border-r-0"
            />
          ))}
        </div>
      </div>

      {/* Quick adjust buttons */}
      {!readonly && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => adjustHP(-5)}
            className="px-2 py-1 rounded bg-red-900/50 hover:bg-red-800/50 text-red-400 text-xs transition-colors flex items-center gap-1"
          >
            <Minus className="w-3 h-3" />5
          </button>
          <button
            onClick={() => adjustHP(-1)}
            className="px-2 py-1 rounded bg-red-900/50 hover:bg-red-800/50 text-red-400 text-xs transition-colors flex items-center gap-1"
          >
            <Minus className="w-3 h-3" />1
          </button>
          <Zap className="w-4 h-4 text-gray-600" />
          <button
            onClick={() => adjustHP(1)}
            className="px-2 py-1 rounded bg-green-900/50 hover:bg-green-800/50 text-green-400 text-xs transition-colors flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />1
          </button>
          <button
            onClick={() => adjustHP(5)}
            className="px-2 py-1 rounded bg-green-900/50 hover:bg-green-800/50 text-green-400 text-xs transition-colors flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />5
          </button>
        </div>
      )}
    </div>
  );
}

// Death saves tracker
interface DeathSavesProps {
  successes: number;
  failures: number;
  onChange?: (successes: number, failures: number) => void;
  readonly?: boolean;
}

export function DeathSaves({
  successes,
  failures,
  onChange,
  readonly = false,
}: DeathSavesProps) {
  const toggleSuccess = (index: number) => {
    if (readonly) return;
    const newSuccesses = successes === index + 1 ? index : index + 1;
    onChange?.(newSuccesses, failures);
  };

  const toggleFailure = (index: number) => {
    if (readonly) return;
    const newFailures = failures === index + 1 ? index : index + 1;
    onChange?.(successes, newFailures);
  };

  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg bg-gray-900/50 border border-gray-800">
      <span className="text-xs uppercase tracking-wider text-gray-500">Death Saves</span>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-green-500">✓</span>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <button
                key={`success-${i}`}
                onClick={() => toggleSuccess(i)}
                className={cn(
                  "w-4 h-4 rounded-full border-2 transition-all",
                  i < successes
                    ? "bg-green-500 border-green-400"
                    : "bg-transparent border-gray-600 hover:border-green-500/50"
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <button
                key={`failure-${i}`}
                onClick={() => toggleFailure(i)}
                className={cn(
                  "w-4 h-4 rounded-full border-2 transition-all",
                  i < failures
                    ? "bg-red-500 border-red-400"
                    : "bg-transparent border-gray-600 hover:border-red-500/50"
                )}
              />
            ))}
          </div>
          <span className="text-xs text-red-500">✗</span>
        </div>
      </div>
    </div>
  );
}
