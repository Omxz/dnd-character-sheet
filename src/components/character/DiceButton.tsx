"use client";

import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Dices } from "lucide-react";

interface DiceButtonProps {
  diceFormula: string;
  label: string;
  onRoll?: (result: number, breakdown: string) => void;
  children?: React.ReactNode;
  className?: string;
  showIcon?: boolean;
  variant?: "default" | "compact" | "inline";
}

// Parse and roll dice formula like "1d20+5" or "2d6+3"
function rollDice(formula: string): { total: number; breakdown: string; rolls: number[] } {
  const cleaned = formula.replace(/\s/g, "");
  const parts = cleaned.match(/([+-]?\d*d\d+|[+-]?\d+)/gi);
  
  if (!parts) {
    return { total: 0, breakdown: "Invalid formula", rolls: [] };
  }

  let total = 0;
  const allRolls: number[] = [];
  const rollParts: string[] = [];

  for (const part of parts) {
    const diceMatch = part.match(/([+-]?)(\d*)d(\d+)/i);
    
    if (diceMatch) {
      const sign = diceMatch[1] === "-" ? -1 : 1;
      const count = parseInt(diceMatch[2]) || 1;
      const sides = parseInt(diceMatch[3]);
      
      const dieRolls: number[] = [];
      for (let i = 0; i < count; i++) {
        const roll = Math.floor(Math.random() * sides) + 1;
        dieRolls.push(roll);
        allRolls.push(roll);
      }
      
      const sum = dieRolls.reduce((a, b) => a + b, 0) * sign;
      total += sum;
      rollParts.push(`${count}d${sides}[${dieRolls.join(",")}]`);
    } else {
      const modifier = parseInt(part);
      if (!isNaN(modifier)) {
        total += modifier;
        if (modifier !== 0) {
          rollParts.push(modifier > 0 ? `+${modifier}` : `${modifier}`);
        }
      }
    }
  }

  return {
    total,
    breakdown: rollParts.join(" ") + ` = ${total}`,
    rolls: allRolls,
  };
}

// Check for critical/fumble on d20
function getCritStatus(formula: string, rolls: number[]): "critical" | "fumble" | null {
  if (!formula.includes("d20") || rolls.length === 0) return null;
  const d20Roll = rolls[0];
  if (d20Roll === 20) return "critical";
  if (d20Roll === 1) return "fumble";
  return null;
}

export function DiceButton({
  diceFormula,
  label,
  onRoll,
  children,
  className,
  showIcon = false,
  variant = "inline",
}: DiceButtonProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [lastResult, setLastResult] = useState<{ total: number; breakdown: string; critStatus: "critical" | "fumble" | null } | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [animatingDice, setAnimatingDice] = useState(false);

  const handleRoll = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isRolling) return;

    setIsRolling(true);
    setAnimatingDice(true);
    
    // Dice rolling animation
    setTimeout(() => {
      const result = rollDice(diceFormula);
      const critStatus = getCritStatus(diceFormula, result.rolls);
      setLastResult({ ...result, critStatus });
      setShowTooltip(true);
      setAnimatingDice(false);
      onRoll?.(result.total, result.breakdown);
      setIsRolling(false);

      // Hide tooltip after 4 seconds
      setTimeout(() => setShowTooltip(false), 4000);
    }, 300);
  }, [diceFormula, isRolling, onRoll]);

  const variantClasses = {
    default: cn(
      "px-3 py-2 rounded-lg",
      "bg-gradient-to-r from-red-900/50 to-amber-900/50",
      "border border-amber-500/30 hover:border-amber-500/50",
      "text-amber-400 hover:text-amber-300"
    ),
    compact: cn(
      "px-2 py-1 rounded",
      "bg-gray-800 hover:bg-gray-700",
      "border border-gray-600 hover:border-amber-500/30",
      "text-sm"
    ),
    inline: "",
  };

  return (
    <button
      onClick={handleRoll}
      className={cn(
        "relative inline-flex items-center gap-1",
        "transition-all duration-200",
        "select-none cursor-pointer",
        animatingDice && "animate-bounce",
        variantClasses[variant],
        className
      )}
      title={`Roll ${diceFormula} - ${label}`}
    >
      {showIcon && <Dices className={cn("w-4 h-4", animatingDice && "animate-spin")} />}
      {children}
      
      {/* Result tooltip */}
      {showTooltip && lastResult && (
        <div
          className={cn(
            "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50",
            "px-4 py-3 rounded-lg shadow-xl",
            "text-sm whitespace-nowrap",
            "animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-300",
            lastResult.critStatus === "critical" 
              ? "bg-green-900 border-2 border-green-500" 
              : lastResult.critStatus === "fumble" 
                ? "bg-red-900 border-2 border-red-500"
                : "bg-gray-900 border border-amber-500/50"
          )}
        >
          {/* Crit/Fumble label */}
          {lastResult.critStatus && (
            <div className={cn(
              "text-xs font-bold uppercase tracking-wider mb-1 text-center",
              lastResult.critStatus === "critical" ? "text-green-400" : "text-red-400"
            )}>
              {lastResult.critStatus === "critical" ? "⚔️ Critical Hit! ⚔️" : "💀 Natural 1! 💀"}
            </div>
          )}
          
          <div className="flex items-center gap-2 justify-center">
            <Dices className={cn(
              "w-5 h-5",
              lastResult.critStatus === "critical" 
                ? "text-green-400" 
                : lastResult.critStatus === "fumble" 
                  ? "text-red-400" 
                  : "text-amber-500"
            )} />
            <span className={cn(
              "font-bold text-xl",
              lastResult.critStatus === "critical" 
                ? "text-green-400" 
                : lastResult.critStatus === "fumble" 
                  ? "text-red-400" 
                  : "text-amber-400"
            )}>
              {lastResult.total}
            </span>
          </div>
          
          <div className="text-gray-400 text-xs mt-1 text-center">
            {lastResult.breakdown}
          </div>
          
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className={cn(
              "border-8 border-transparent",
              lastResult.critStatus === "critical" 
                ? "border-t-green-900" 
                : lastResult.critStatus === "fumble" 
                  ? "border-t-red-900"
                  : "border-t-gray-900"
            )} />
          </div>
        </div>
      )}
    </button>
  );
}

// Quick roll button for simple actions
interface QuickRollButtonProps {
  modifier: number;
  label: string;
  onRoll?: (result: number) => void;
  className?: string;
}

export function QuickRollButton({
  modifier,
  label,
  onRoll,
  className,
}: QuickRollButtonProps) {
  const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
  
  return (
    <DiceButton
      diceFormula={`1d20${modStr}`}
      label={label}
      onRoll={(result) => onRoll?.(result)}
      variant="compact"
      showIcon
      className={className}
    >
      <span className="font-medium">{modStr}</span>
    </DiceButton>
  );
}
