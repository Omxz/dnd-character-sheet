// Dice rolling engine
// Supports standard dice notation and advanced formulas

export interface DiceRoll {
  formula: string;
  rolls: SingleRoll[];
  modifier: number;
  total: number;
  timestamp: Date;
  label?: string;
}

export interface SingleRoll {
  die: number; // d4, d6, d8, d10, d12, d20, d100
  result: number;
  kept: boolean;
  critical?: boolean; // Natural 20 on d20
  fumble?: boolean; // Natural 1 on d20
}

// Parse dice notation like "2d6+5", "4d6kh3", "1d20+7"
export function parseDiceFormula(formula: string): {
  count: number;
  die: number;
  modifier: number;
  keep?: { type: "highest" | "lowest"; count: number };
} | null {
  // Clean up the formula
  const cleaned = formula.toLowerCase().replace(/\s+/g, "");
  
  // Match patterns like: 2d6, 4d6kh3, 1d20+5, d8-2
  const match = cleaned.match(/^(\d*)d(\d+)(k[hl](\d+))?([+-]\d+)?$/);
  
  if (!match) return null;
  
  const count = match[1] ? parseInt(match[1]) : 1;
  const die = parseInt(match[2]);
  const keepType = match[3]?.startsWith("kh") ? "highest" : match[3]?.startsWith("kl") ? "lowest" : undefined;
  const keepCount = match[4] ? parseInt(match[4]) : undefined;
  const modifier = match[5] ? parseInt(match[5]) : 0;
  
  return {
    count,
    die,
    modifier,
    keep: keepType && keepCount ? { type: keepType, count: keepCount } : undefined,
  };
}

// Roll a single die
export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

// Roll dice from a formula
export function rollDice(formula: string, label?: string): DiceRoll {
  const parsed = parseDiceFormula(formula);
  
  if (!parsed) {
    throw new Error(`Invalid dice formula: ${formula}`);
  }
  
  const { count, die, modifier, keep } = parsed;
  
  // Roll all dice
  const rolls: SingleRoll[] = [];
  for (let i = 0; i < count; i++) {
    const result = rollDie(die);
    rolls.push({
      die,
      result,
      kept: true,
      critical: die === 20 && result === 20,
      fumble: die === 20 && result === 1,
    });
  }
  
  // Apply keep highest/lowest
  if (keep) {
    // Sort by result
    const sorted = [...rolls].sort((a, b) => 
      keep.type === "highest" ? b.result - a.result : a.result - b.result
    );
    
    // Mark which ones to keep
    rolls.forEach(roll => {
      roll.kept = sorted.slice(0, keep.count).includes(roll);
    });
  }
  
  // Calculate total
  const diceTotal = rolls
    .filter(r => r.kept)
    .reduce((sum, r) => sum + r.result, 0);
  
  return {
    formula,
    rolls,
    modifier,
    total: diceTotal + modifier,
    timestamp: new Date(),
    label,
  };
}

// Roll ability scores using 4d6 drop lowest
export function rollAbilityScore(): DiceRoll {
  return rollDice("4d6kh3", "Ability Score");
}

// Roll a full set of 6 ability scores
export function rollAbilityScores(): number[] {
  const scores: number[] = [];
  for (let i = 0; i < 6; i++) {
    const roll = rollAbilityScore();
    scores.push(roll.total);
  }
  // Sort descending for easier assignment
  return scores.sort((a, b) => b - a);
}

// Format a roll result for display
export function formatRollResult(roll: DiceRoll): string {
  const diceStr = roll.rolls
    .map(r => {
      if (r.critical) return `**${r.result}**`;
      if (r.fumble) return `~~${r.result}~~`;
      if (!r.kept) return `(${r.result})`;
      return r.result.toString();
    })
    .join(" + ");
  
  let result = `[${diceStr}]`;
  
  if (roll.modifier !== 0) {
    result += roll.modifier > 0 ? ` + ${roll.modifier}` : ` - ${Math.abs(roll.modifier)}`;
  }
  
  result += ` = ${roll.total}`;
  
  return result;
}

// Check if a roll has a critical hit (natural 20)
export function hasCritical(roll: DiceRoll): boolean {
  return roll.rolls.some(r => r.critical && r.kept);
}

// Check if a roll has a fumble (natural 1)
export function hasFumble(roll: DiceRoll): boolean {
  return roll.rolls.some(r => r.fumble && r.kept);
}

// Standard dice types
export const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100] as const;
export type DieType = typeof DICE_TYPES[number];
