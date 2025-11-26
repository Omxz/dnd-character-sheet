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
function rollDice(formula: string): { total: number; breakdown: string } {
  const cleaned = formula.replace(/\s/g, "");
  const parts = cleaned.match(/([+-]?\d*d\d+|[+-]?\d+)/gi);
  
  if (!parts) {
    return { total: 0, breakdown: "Invalid formula" };
  }

  let total = 0;
  const rolls: string[] = [];

  for (const part of parts) {
    const diceMatch = part.match(/([+-]?)(\d*)d(\d+)/i);
    
    if (diceMatch) {
      const sign = diceMatch[1] === "-" ? -1 : 1;
      const count = parseInt(diceMatch[2]) || 1;
      const sides = parseInt(diceMatch[3]);
      
      const dieRolls: number[] = [];
      for (let i = 0; i < count; i++) {
        dieRolls.push(Math.floor(Math.random() * sides) + 1);
      }
      
      const sum = dieRolls.reduce((a, b) => a + b, 0) * sign;
      total += sum;
      rolls.push(`${count}d${sides}[${dieRolls.join(",")}]`);
    } else {
      const modifier = parseInt(part);
      if (!isNaN(modifier)) {
        total += modifier;
        if (modifier !== 0) {
          rolls.push(modifier > 0 ? `+${modifier}` : `${modifier}`);
        }
      }
    }
  }

  return {
    total,
    breakdown: rolls.join(" ") + ` = ${total}`,
  };
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
  const [lastResult, setLastResult] = useState<{ total: number; breakdown: string } | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleRoll = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isRolling) return;

    setIsRolling(true);
    
    // Quick animation delay
    setTimeout(() => {
      const result = rollDice(diceFormula);
      setLastResult(result);
      setShowTooltip(true);
      onRoll?.(result.total, result.breakdown);
      setIsRolling(false);

      // Hide tooltip after 3 seconds
      setTimeout(() => setShowTooltip(false), 3000);
    }, 150);
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
        isRolling && "animate-pulse",
        variantClasses[variant],
        className
      )}
      title={`Roll ${diceFormula} - ${label}`}
    >
      {showIcon && <Dices className="w-4 h-4" />}
      {children}
      
      {/* Result tooltip */}
      {showTooltip && lastResult && (
        <div
          className={cn(
            "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50",
            "px-3 py-2 rounded-lg",
            "bg-gray-900 border border-amber-500/50",
            "text-sm whitespace-nowrap",
            "animate-in fade-in slide-in-from-bottom-2 duration-200"
          )}
        >
          <div className="flex items-center gap-2">
            <Dices className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-amber-400">{lastResult.total}</span>
            <span className="text-gray-400 text-xs">{lastResult.breakdown}</span>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-8 border-transparent border-t-gray-900" />
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
