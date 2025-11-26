"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { 
  Skull, 
  Zap, 
  Eye, 
  EyeOff, 
  Shield, 
  Flame, 
  Snowflake,
  Wind,
  Droplets,
  Moon,
  Sun,
  AlertTriangle,
  Ghost,
  Sparkles,
  Volume2,
  VolumeX,
  type LucideIcon
} from "lucide-react";

// All D&D 5e conditions
export const CONDITIONS = {
  blinded: { icon: EyeOff, color: "bg-gray-600", description: "Can't see, auto-fails sight checks" },
  charmed: { icon: Sparkles, color: "bg-pink-600", description: "Can't attack charmer, charmer has social advantage" },
  deafened: { icon: VolumeX, color: "bg-gray-600", description: "Can't hear, auto-fails hearing checks" },
  exhaustion: { icon: Moon, color: "bg-purple-700", description: "Cumulative levels of exhaustion" },
  frightened: { icon: Ghost, color: "bg-purple-600", description: "Disadvantage while source visible, can't approach" },
  grappled: { icon: Shield, color: "bg-orange-600", description: "Speed becomes 0" },
  incapacitated: { icon: AlertTriangle, color: "bg-red-700", description: "Can't take actions or reactions" },
  invisible: { icon: Eye, color: "bg-blue-600", description: "Can't be seen, attacks have advantage" },
  paralyzed: { icon: Zap, color: "bg-yellow-600", description: "Incapacitated, auto-fail STR/DEX, attacks have advantage" },
  petrified: { icon: Snowflake, color: "bg-slate-500", description: "Transformed to stone, incapacitated" },
  poisoned: { icon: Droplets, color: "bg-green-600", description: "Disadvantage on attacks and ability checks" },
  prone: { icon: Wind, color: "bg-amber-700", description: "Disadvantage on attacks, melee attacks have advantage against" },
  restrained: { icon: Shield, color: "bg-orange-700", description: "Speed 0, attack disadvantage, DEX saves disadvantage" },
  stunned: { icon: Skull, color: "bg-red-600", description: "Incapacitated, auto-fail STR/DEX, attacks have advantage" },
  unconscious: { icon: Moon, color: "bg-gray-800", description: "Incapacitated, drop items, prone, auto-crits in 5ft" },
  concentrating: { icon: Sun, color: "bg-amber-500", description: "Maintaining concentration on a spell" },
} as const;

export type ConditionType = keyof typeof CONDITIONS;

interface ConditionBadgeProps {
  condition: ConditionType;
  level?: number; // For exhaustion
  active?: boolean;
  onClick?: () => void;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ConditionBadge({
  condition,
  level,
  active = true,
  onClick,
  showLabel = true,
  size = "md",
  className,
}: ConditionBadgeProps) {
  const { icon: Icon, color, description } = CONDITIONS[condition];

  const sizeClasses = {
    sm: "h-6 text-xs gap-1 px-2",
    md: "h-8 text-sm gap-1.5 px-3",
    lg: "h-10 text-base gap-2 px-4",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <button
      onClick={onClick}
      title={description}
      className={cn(
        "inline-flex items-center rounded-full font-medium transition-all",
        sizeClasses[size],
        active ? color : "bg-gray-800",
        active ? "text-white" : "text-gray-500",
        onClick && "cursor-pointer hover:scale-105 hover:shadow-lg",
        !active && "opacity-50",
        className
      )}
    >
      <Icon className={iconSizes[size]} />
      {showLabel && (
        <span className="capitalize">
          {condition}
          {condition === "exhaustion" && level ? ` ${level}` : ""}
        </span>
      )}
    </button>
  );
}

interface ConditionTrackerProps {
  activeConditions: ConditionType[];
  exhaustionLevel?: number;
  onToggle?: (condition: ConditionType) => void;
  onExhaustionChange?: (level: number) => void;
  readonly?: boolean;
  className?: string;
}

export function ConditionTracker({
  activeConditions,
  exhaustionLevel = 0,
  onToggle,
  onExhaustionChange,
  readonly = false,
  className,
}: ConditionTrackerProps) {
  const allConditions = Object.keys(CONDITIONS) as ConditionType[];

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
        Conditions
      </h3>

      {/* Active conditions */}
      <div className="flex flex-wrap gap-2">
        {activeConditions.length === 0 ? (
          <span className="text-sm text-gray-600">No active conditions</span>
        ) : (
          activeConditions.map((condition) => (
            <ConditionBadge
              key={condition}
              condition={condition}
              level={condition === "exhaustion" ? exhaustionLevel : undefined}
              active
              onClick={readonly ? undefined : () => onToggle?.(condition)}
            />
          ))
        )}
      </div>

      {/* Exhaustion slider (if has exhaustion) */}
      {activeConditions.includes("exhaustion") && !readonly && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-900/20 border border-purple-700/30">
          <span className="text-xs text-purple-400">Level:</span>
          {[1, 2, 3, 4, 5, 6].map((level) => (
            <button
              key={level}
              onClick={() => onExhaustionChange?.(level)}
              className={cn(
                "w-6 h-6 rounded text-xs font-bold transition-all",
                level <= exhaustionLevel
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-500 hover:bg-gray-700"
              )}
            >
              {level}
            </button>
          ))}
        </div>
      )}

      {/* Add condition dropdown */}
      {!readonly && (
        <details className="group">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400 list-none">
            + Add condition
          </summary>
          <div className="mt-2 p-2 rounded-lg bg-gray-900 border border-gray-700 max-h-48 overflow-y-auto">
            <div className="flex flex-wrap gap-1">
              {allConditions
                .filter((c) => !activeConditions.includes(c))
                .map((condition) => (
                  <ConditionBadge
                    key={condition}
                    condition={condition}
                    active={false}
                    size="sm"
                    onClick={() => onToggle?.(condition)}
                  />
                ))}
            </div>
          </div>
        </details>
      )}
    </div>
  );
}

// Quick status indicators for character cards
interface StatusIndicatorsProps {
  conditions: ConditionType[];
  concentration?: string | null;
  className?: string;
}

export function StatusIndicators({ conditions, concentration, className }: StatusIndicatorsProps) {
  if (conditions.length === 0 && !concentration) return null;

  return (
    <div className={cn("flex items-center gap-1 flex-wrap", className)}>
      {concentration && (
        <ConditionBadge condition="concentrating" size="sm" showLabel={false} />
      )}
      {conditions.slice(0, 3).map((condition) => (
        <ConditionBadge
          key={condition}
          condition={condition}
          size="sm"
          showLabel={false}
        />
      ))}
      {conditions.length > 3 && (
        <span className="text-xs text-gray-500">+{conditions.length - 3}</span>
      )}
    </div>
  );
}
