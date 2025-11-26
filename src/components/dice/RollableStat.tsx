"use client";

import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { rollDice, hasCritical, hasFumble, type DiceRoll } from "@/lib/dice/engine";
import { playRollSound, initializeSounds } from "@/lib/dice/sounds";
import { cn, formatModifier } from "@/lib/utils";

interface RollableStatProps {
  label: string;
  modifier: number;
  proficient?: boolean;
  expertise?: boolean;
  dieType?: number;
  className?: string;
  onRoll?: (roll: DiceRoll) => void;
}

export const RollableStat: React.FC<RollableStatProps> = ({
  label,
  modifier,
  proficient = false,
  expertise = false,
  dieType = 20,
  className,
  onRoll,
}) => {
  const [lastRoll, setLastRoll] = React.useState<DiceRoll | null>(null);
  const [isRolling, setIsRolling] = React.useState(false);

  const handleClick = useCallback(async () => {
    initializeSounds();
    setIsRolling(true);

    await new Promise(resolve => setTimeout(resolve, 300));

    const formula = modifier >= 0 ? `1d${dieType}+${modifier}` : `1d${dieType}${modifier}`;
    const roll = rollDice(formula, label);
    
    setLastRoll(roll);
    playRollSound(hasCritical(roll), hasFumble(roll));
    onRoll?.(roll);
    
    setIsRolling(false);

    // Clear the result after a few seconds
    setTimeout(() => setLastRoll(null), 3000);
  }, [modifier, dieType, label, onRoll]);

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative flex items-center justify-between px-3 py-2 rounded-lg",
        "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700",
        "transition-colors cursor-pointer group",
        proficient && "border-l-4 border-amber-500",
        expertise && "border-l-4 border-purple-500",
        className
      )}
    >
      <span className="text-sm font-medium">{label}</span>
      
      <div className="flex items-center gap-2">
        {/* Modifier */}
        <span className={cn(
          "font-bold",
          modifier >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
        )}>
          {formatModifier(modifier)}
        </span>

        {/* Roll indicator */}
        <motion.span
          animate={isRolling ? { rotate: 360 } : {}}
          transition={{ duration: 0.3, repeat: isRolling ? Infinity : 0 }}
          className="text-xs text-gray-400 group-hover:text-amber-500"
        >
          🎲
        </motion.span>
      </div>

      {/* Result popup */}
      {lastRoll && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.8 }}
          className={cn(
            "absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg shadow-lg",
            "font-bold text-white z-10",
            hasCritical(lastRoll) && "bg-green-500",
            hasFumble(lastRoll) && "bg-red-500",
            !hasCritical(lastRoll) && !hasFumble(lastRoll) && "bg-amber-500"
          )}
        >
          {lastRoll.total}
          {hasCritical(lastRoll) && <span className="ml-1">!</span>}
        </motion.div>
      )}
    </motion.button>
  );
};

export default RollableStat;
