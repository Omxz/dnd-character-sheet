"use client";

import { useState } from "react";
import { DiceRoller } from "@/components/dice";
import { rollAbilityScores, type DiceRoll } from "@/lib/dice/engine";
import type { StepProps } from "../types";
import { cn, STANDARD_ARRAY, POINT_BUY_COSTS, POINT_BUY_TOTAL, ABILITY_SCORES, formatModifier, getModifier } from "@/lib/utils";
import { Dices, Calculator, Edit, RotateCcw } from "lucide-react";
import type { AbilityScores } from "@/types/database";

type Method = "standard" | "pointbuy" | "roll" | "manual";

const ABILITY_LABELS: Record<string, string> = {
  strength: "Strength",
  dexterity: "Dexterity",
  constitution: "Constitution",
  intelligence: "Intelligence",
  wisdom: "Wisdom",
  charisma: "Charisma",
};

export function AbilityScoresStep({ data, updateData }: StepProps) {
  const [method, setMethod] = useState<Method>("standard");
  const [standardAssignments, setStandardAssignments] = useState<Record<string, number | null>>({});
  const [rolledScores, setRolledScores] = useState<number[]>([]);
  const [rollAssignments, setRollAssignments] = useState<Record<string, number | null>>({});
  const [pointBuyScores, setPointBuyScores] = useState<AbilityScores>({
    strength: 8, dexterity: 8, constitution: 8,
    intelligence: 8, wisdom: 8, charisma: 8,
  });

  // Calculate point buy remaining
  const pointsSpent = Object.values(pointBuyScores).reduce(
    (sum, score) => sum + POINT_BUY_COSTS[score], 0
  );
  const pointsRemaining = POINT_BUY_TOTAL - pointsSpent;

  // Handle standard array assignment
  const handleStandardAssign = (ability: string, score: number) => {
    // Remove previous assignment of this score
    const newAssignments = { ...standardAssignments };
    Object.keys(newAssignments).forEach(key => {
      if (newAssignments[key] === score) {
        newAssignments[key] = null;
      }
    });
    newAssignments[ability] = score;
    setStandardAssignments(newAssignments);

    // Update character data
    const scores: AbilityScores = { ...data.ability_scores };
    ABILITY_SCORES.forEach(ab => {
      scores[ab] = newAssignments[ab] ?? 10;
    });
    updateData({ ability_scores: scores });
  };

  // Handle roll scores
  const handleRollScores = () => {
    const scores = rollAbilityScores();
    setRolledScores(scores);
    setRollAssignments({});
  };

  const handleRollAssign = (ability: string, score: number) => {
    const newAssignments = { ...rollAssignments };
    Object.keys(newAssignments).forEach(key => {
      if (newAssignments[key] === score) {
        newAssignments[key] = null;
      }
    });
    newAssignments[ability] = score;
    setRollAssignments(newAssignments);

    const scores: AbilityScores = { ...data.ability_scores };
    ABILITY_SCORES.forEach(ab => {
      scores[ab] = newAssignments[ab] ?? 10;
    });
    updateData({ ability_scores: scores });
  };

  // Handle point buy
  const handlePointBuyChange = (ability: keyof AbilityScores, delta: number) => {
    const currentScore = pointBuyScores[ability];
    const newScore = currentScore + delta;
    
    if (newScore < 8 || newScore > 15) return;
    
    const newCost = POINT_BUY_COSTS[newScore] - POINT_BUY_COSTS[currentScore];
    if (newCost > pointsRemaining) return;

    const newScores = { ...pointBuyScores, [ability]: newScore };
    setPointBuyScores(newScores);
    updateData({ ability_scores: newScores });
  };

  // Handle manual entry
  const handleManualChange = (ability: keyof AbilityScores, value: string) => {
    const score = parseInt(value) || 10;
    const clampedScore = Math.max(1, Math.min(30, score));
    updateData({
      ability_scores: { ...data.ability_scores, [ability]: clampedScore }
    });
  };

  const methods: { id: Method; label: string; icon: React.ReactNode }[] = [
    { id: "standard", label: "Standard Array", icon: <Calculator className="w-4 h-4" /> },
    { id: "pointbuy", label: "Point Buy", icon: <Calculator className="w-4 h-4" /> },
    { id: "roll", label: "Roll", icon: <Dices className="w-4 h-4" /> },
    { id: "manual", label: "Manual", icon: <Edit className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Ability Scores</h2>
        <p className="text-gray-400">
          Choose how to determine your character&apos;s six ability scores.
        </p>
      </div>

      {/* Method Selector */}
      <div className="flex flex-wrap gap-2">
        {methods.map(m => (
          <button
            key={m.id}
            onClick={() => setMethod(m.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
              method === m.id
                ? "bg-amber-600 text-white"
                : "bg-gray-700 hover:bg-gray-600"
            )}
          >
            {m.icon}
            {m.label}
          </button>
        ))}
      </div>

      {/* Method-specific UI */}
      <div className="bg-gray-800 rounded-lg p-6">
        {method === "standard" && (
          <div className="space-y-4">
            <p className="text-gray-400 mb-4">
              Assign each score to an ability: {STANDARD_ARRAY.join(", ")}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {ABILITY_SCORES.map(ability => (
                <div key={ability} className="space-y-2">
                  <label className="block font-medium capitalize">{ability}</label>
                  <select
                    value={standardAssignments[ability] ?? ""}
                    onChange={(e) => handleStandardAssign(ability, parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                  >
                    <option value="">Select...</option>
                    {STANDARD_ARRAY.map(score => {
                      const used = Object.values(standardAssignments).includes(score) && 
                                   standardAssignments[ability] !== score;
                      return (
                        <option key={score} value={score} disabled={used}>
                          {score} ({formatModifier(getModifier(score))})
                        </option>
                      );
                    })}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {method === "pointbuy" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-gray-400">
                Spend points to increase scores (8-15 range)
              </p>
              <div className={cn(
                "px-3 py-1 rounded-full font-medium",
                pointsRemaining > 0 ? "bg-amber-600" : 
                pointsRemaining === 0 ? "bg-green-600" : "bg-red-600"
              )}>
                {pointsRemaining} points remaining
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {ABILITY_SCORES.map(ability => (
                <div key={ability} className="bg-gray-700 rounded-lg p-4">
                  <label className="block font-medium capitalize mb-2">{ability}</label>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handlePointBuyChange(ability, -1)}
                      disabled={pointBuyScores[ability] <= 8}
                      className="w-8 h-8 rounded bg-gray-600 hover:bg-gray-500 disabled:opacity-50"
                    >
                      -
                    </button>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{pointBuyScores[ability]}</div>
                      <div className="text-sm text-gray-400">
                        {formatModifier(getModifier(pointBuyScores[ability]))}
                      </div>
                    </div>
                    <button
                      onClick={() => handlePointBuyChange(ability, 1)}
                      disabled={pointBuyScores[ability] >= 15 || 
                        POINT_BUY_COSTS[pointBuyScores[ability] + 1] - POINT_BUY_COSTS[pointBuyScores[ability]] > pointsRemaining}
                      className="w-8 h-8 rounded bg-gray-600 hover:bg-gray-500 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 text-center mt-1">
                    Cost: {POINT_BUY_COSTS[pointBuyScores[ability]]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {method === "roll" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-400">
                Roll 4d6, drop the lowest die for each score
              </p>
              <button
                onClick={handleRollScores}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg"
              >
                <Dices className="w-5 h-5" />
                {rolledScores.length > 0 ? "Reroll All" : "Roll Scores"}
              </button>
            </div>
            
            {rolledScores.length > 0 && (
              <>
                <div className="flex flex-wrap gap-2 p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-400 mr-2">Rolled:</span>
                  {rolledScores.map((score, i) => (
                    <span key={i} className="px-3 py-1 bg-amber-600 rounded-full font-bold">
                      {score}
                    </span>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {ABILITY_SCORES.map(ability => (
                    <div key={ability} className="space-y-2">
                      <label className="block font-medium capitalize">{ability}</label>
                      <select
                        value={rollAssignments[ability] ?? ""}
                        onChange={(e) => handleRollAssign(ability, parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                      >
                        <option value="">Select...</option>
                        {rolledScores.map((score, i) => {
                          const usedCount = Object.values(rollAssignments).filter(v => v === score).length;
                          const availableCount = rolledScores.filter(s => s === score).length;
                          const isThisOne = rollAssignments[ability] === score;
                          const available = isThisOne || usedCount < availableCount;
                          return (
                            <option key={`${score}-${i}`} value={score} disabled={!available}>
                              {score} ({formatModifier(getModifier(score))})
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {method === "manual" && (
          <div className="space-y-4">
            <p className="text-gray-400">
              Enter your ability scores manually (1-30)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {ABILITY_SCORES.map(ability => (
                <div key={ability} className="space-y-2">
                  <label className="block font-medium capitalize">{ability}</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={data.ability_scores[ability]}
                    onChange={(e) => handleManualChange(ability, e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-center text-lg font-bold"
                  />
                  <div className="text-center text-sm text-gray-400">
                    {formatModifier(getModifier(data.ability_scores[ability]))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="font-medium mb-3">Current Scores</h3>
        <div className="flex flex-wrap gap-4">
          {ABILITY_SCORES.map(ability => (
            <div key={ability} className="text-center">
              <div className="text-xs text-gray-400 uppercase">{ability.slice(0, 3)}</div>
              <div className="text-xl font-bold">{data.ability_scores[ability]}</div>
              <div className={cn(
                "text-sm",
                getModifier(data.ability_scores[ability]) >= 0 ? "text-green-400" : "text-red-400"
              )}>
                {formatModifier(getModifier(data.ability_scores[ability]))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
