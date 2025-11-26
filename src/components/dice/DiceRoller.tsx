"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  rollDice, 
  hasCritical, 
  hasFumble, 
  formatRollResult,
  type DiceRoll,
  DICE_TYPES,
  type DieType,
} from "@/lib/dice/engine";
import { playRollSound, initializeSounds, setSoundEnabled, isSoundEnabled } from "@/lib/dice/sounds";
import { cn } from "@/lib/utils";
import { Volume2, VolumeX, Dices } from "lucide-react";

interface DiceRollerProps {
  onRoll?: (roll: DiceRoll) => void;
  compact?: boolean;
  className?: string;
}

// Die face SVGs for each type
const DieFace: React.FC<{ die: DieType; result?: number; rolling?: boolean }> = ({ 
  die, 
  result, 
  rolling 
}) => {
  const baseClasses = "w-12 h-12 flex items-center justify-center rounded-lg font-bold text-lg";
  
  const dieColors: Record<DieType, string> = {
    4: "bg-red-500 text-white",
    6: "bg-blue-500 text-white",
    8: "bg-green-500 text-white",
    10: "bg-purple-500 text-white",
    12: "bg-orange-500 text-white",
    20: "bg-amber-500 text-white",
    100: "bg-pink-500 text-white",
  };

  return (
    <motion.div
      className={cn(baseClasses, dieColors[die], "shadow-lg")}
      animate={rolling ? {
        rotateX: [0, 360, 720, 1080],
        rotateY: [0, 180, 360, 540],
        scale: [1, 1.2, 1.1, 1],
      } : {}}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <span className="drop-shadow-md">
        {rolling ? "?" : result || `d${die}`}
      </span>
    </motion.div>
  );
};

export const DiceRoller: React.FC<DiceRollerProps> = ({ 
  onRoll, 
  compact = false,
  className 
}) => {
  const [currentRoll, setCurrentRoll] = useState<DiceRoll | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [formula, setFormula] = useState("1d20");
  const [rollHistory, setRollHistory] = useState<DiceRoll[]>([]);
  const [soundOn, setSoundOn] = useState(true);

  // Initialize sounds on first interaction
  const handleInitSounds = useCallback(() => {
    initializeSounds();
  }, []);

  const handleRoll = useCallback(async (customFormula?: string) => {
    handleInitSounds();
    const formulaToRoll = customFormula || formula;
    
    setIsRolling(true);
    
    // Simulate rolling animation
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      const roll = rollDice(formulaToRoll);
      setCurrentRoll(roll);
      setRollHistory(prev => [roll, ...prev.slice(0, 9)]); // Keep last 10 rolls
      
      // Play sound
      playRollSound(hasCritical(roll), hasFumble(roll));
      
      onRoll?.(roll);
    } catch (error) {
      console.error("Invalid formula:", error);
    }
    
    setIsRolling(false);
  }, [formula, onRoll, handleInitSounds]);

  const handleQuickRoll = useCallback((die: DieType) => {
    handleRoll(`1d${die}`);
  }, [handleRoll]);

  const toggleSound = useCallback(() => {
    const newState = !soundOn;
    setSoundOn(newState);
    setSoundEnabled(newState);
  }, [soundOn]);

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <input
          type="text"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          className="w-24 px-2 py-1 text-sm border rounded dark:bg-gray-800 dark:border-gray-700"
          placeholder="1d20+5"
          onKeyDown={(e) => e.key === "Enter" && handleRoll()}
        />
        <button
          onClick={() => handleRoll()}
          disabled={isRolling}
          className="px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50 flex items-center gap-1"
        >
          <Dices className="w-4 h-4" />
          Roll
        </button>
        {currentRoll && (
          <span className={cn(
            "font-bold text-lg",
            hasCritical(currentRoll) && "text-green-500",
            hasFumble(currentRoll) && "text-red-500"
          )}>
            {currentRoll.total}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("bg-gray-100 dark:bg-gray-900 rounded-xl p-4 shadow-lg", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Dices className="w-5 h-5" />
          Dice Roller
        </h3>
        <button
          onClick={toggleSound}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"
          title={soundOn ? "Mute sounds" : "Enable sounds"}
        >
          {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>

      {/* Quick Roll Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {DICE_TYPES.map(die => (
          <button
            key={die}
            onClick={() => handleQuickRoll(die)}
            disabled={isRolling}
            className="px-3 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 font-medium disabled:opacity-50 transition-colors"
          >
            d{die}
          </button>
        ))}
      </div>

      {/* Custom Formula */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-amber-500 outline-none"
          placeholder="2d6+5, 4d6kh3..."
          onKeyDown={(e) => e.key === "Enter" && handleRoll()}
        />
        <button
          onClick={() => handleRoll()}
          disabled={isRolling}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 font-medium transition-colors"
        >
          Roll
        </button>
      </div>

      {/* Roll Result Display */}
      <AnimatePresence mode="wait">
        {(currentRoll || isRolling) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-inner"
          >
            {/* Dice Animation */}
            <div className="flex justify-center gap-2 mb-3 flex-wrap">
              {isRolling ? (
                <DieFace die={20} rolling />
              ) : currentRoll?.rolls.map((roll, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.1, type: "spring" }}
                >
                  <div className={cn(
                    "w-12 h-12 flex items-center justify-center rounded-lg font-bold text-lg shadow-lg",
                    roll.critical && "bg-green-500 text-white ring-2 ring-green-300",
                    roll.fumble && "bg-red-500 text-white ring-2 ring-red-300",
                    !roll.critical && !roll.fumble && roll.kept && "bg-amber-500 text-white",
                    !roll.kept && "bg-gray-400 text-gray-600 opacity-50"
                  )}>
                    {roll.result}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Result */}
            {currentRoll && !isRolling && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <div className={cn(
                  "text-4xl font-bold mb-1",
                  hasCritical(currentRoll) && "text-green-500",
                  hasFumble(currentRoll) && "text-red-500"
                )}>
                  {currentRoll.total}
                  {hasCritical(currentRoll) && (
                    <span className="ml-2 text-lg">CRITICAL!</span>
                  )}
                  {hasFumble(currentRoll) && (
                    <span className="ml-2 text-lg">FUMBLE!</span>
                  )}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formatRollResult(currentRoll)}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roll History */}
      {rollHistory.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">History</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {rollHistory.map((roll, i) => (
              <div
                key={roll.timestamp.getTime()}
                className={cn(
                  "text-sm flex justify-between items-center px-2 py-1 rounded",
                  i === 0 && "bg-amber-100 dark:bg-amber-900/30"
                )}
              >
                <span className="text-gray-500 dark:text-gray-400">{roll.formula}</span>
                <span className={cn(
                  "font-medium",
                  hasCritical(roll) && "text-green-500",
                  hasFumble(roll) && "text-red-500"
                )}>
                  {roll.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiceRoller;
