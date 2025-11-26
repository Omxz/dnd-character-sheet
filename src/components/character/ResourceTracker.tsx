"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Zap, RotateCcw, Sun, Moon, Info } from "lucide-react";

interface Resource {
  name: string;
  shortName: string;
  current: number;
  max: number;
  rechargeOn: "short" | "long" | "dawn" | "never";
  description?: string;
}

interface ResourceTrackerProps {
  resources: Resource[];
  onUse: (resourceName: string, amount?: number) => void;
  onRecover: (resourceName: string, amount?: number) => void;
  readonly?: boolean;
  className?: string;
}

const rechargeIcons = {
  short: <Moon className="w-3 h-3" />,
  long: <Sun className="w-3 h-3" />,
  dawn: <Sun className="w-3 h-3" />,
  never: null,
};

const rechargeLabels = {
  short: "Short Rest",
  long: "Long Rest",
  dawn: "Dawn",
  never: "Unlimited",
};

export function ResourceTracker({
  resources,
  onUse,
  onRecover,
  readonly = false,
  className,
}: ResourceTrackerProps) {
  if (resources.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {resources.map((resource) => (
        <ResourceBar
          key={resource.name}
          resource={resource}
          onUse={() => onUse(resource.name)}
          onRecover={() => onRecover(resource.name)}
          readonly={readonly}
        />
      ))}
    </div>
  );
}

interface ResourceBarProps {
  resource: Resource;
  onUse: () => void;
  onRecover: () => void;
  readonly?: boolean;
}

function ResourceBar({ resource, onUse, onRecover, readonly }: ResourceBarProps) {
  const { name, shortName, current, max, rechargeOn, description } = resource;
  const percentage = max > 0 ? (current / max) * 100 : 0;
  const isEmpty = current === 0;
  const isFull = current >= max;

  // Color based on resource type
  const getResourceColor = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("ki")) return "from-cyan-600 to-cyan-400";
    if (lowerName.includes("rage")) return "from-red-600 to-red-400";
    if (lowerName.includes("channel") || lowerName.includes("divinity")) return "from-yellow-600 to-yellow-400";
    if (lowerName.includes("sorcery")) return "from-purple-600 to-purple-400";
    if (lowerName.includes("inspiration")) return "from-pink-600 to-pink-400";
    if (lowerName.includes("superiority")) return "from-orange-600 to-orange-400";
    if (lowerName.includes("lay on hands")) return "from-green-600 to-green-400";
    if (lowerName.includes("wild shape")) return "from-emerald-600 to-emerald-400";
    if (lowerName.includes("arcane")) return "from-blue-600 to-blue-400";
    return "from-amber-600 to-amber-400";
  };

  const getBorderColor = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("ki")) return "border-cyan-500/50";
    if (lowerName.includes("rage")) return "border-red-500/50";
    if (lowerName.includes("channel") || lowerName.includes("divinity")) return "border-yellow-500/50";
    if (lowerName.includes("sorcery")) return "border-purple-500/50";
    if (lowerName.includes("inspiration")) return "border-pink-500/50";
    if (lowerName.includes("superiority")) return "border-orange-500/50";
    if (lowerName.includes("lay on hands")) return "border-green-500/50";
    if (lowerName.includes("wild shape")) return "border-emerald-500/50";
    if (lowerName.includes("arcane")) return "border-blue-500/50";
    return "border-amber-500/50";
  };

  return (
    <div 
      className={cn(
        "p-3 rounded-lg border bg-gray-900/50 transition-all",
        getBorderColor(name),
        isEmpty && "opacity-60"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="font-medium text-white">{shortName}</span>
          {description && (
            <div className="group relative">
              <Info className="w-3 h-3 text-gray-500 cursor-help" />
              <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-gray-800 rounded-lg text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-gray-700">
                {description}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">
            <span className={isEmpty ? "text-gray-500" : "text-white"}>{current}</span>
            <span className="text-gray-500">/{max}</span>
          </span>
          {rechargeIcons[rechargeOn] && (
            <span className="text-gray-500 text-xs flex items-center gap-1" title={rechargeLabels[rechargeOn]}>
              {rechargeIcons[rechargeOn]}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-all duration-300",
            getResourceColor(name)
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Buttons */}
      {!readonly && (
        <div className="flex gap-2">
          <button
            onClick={onUse}
            disabled={isEmpty}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs font-medium transition-colors",
              isEmpty
                ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                : "bg-gray-800 hover:bg-gray-700 text-white"
            )}
          >
            <Zap className="w-3 h-3" />
            Use
          </button>
          <button
            onClick={onRecover}
            disabled={isFull}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs font-medium transition-colors",
              isFull
                ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                : "bg-gray-800 hover:bg-gray-700 text-green-400"
            )}
          >
            <RotateCcw className="w-3 h-3" />
            +1
          </button>
        </div>
      )}

      {/* Pips for small max values */}
      {max <= 10 && max > 0 && (
        <div className="flex gap-1 mt-2 justify-center">
          {Array.from({ length: max }, (_, i) => (
            <button
              key={i}
              onClick={() => {
                if (readonly) return;
                // Toggle: if clicking on a filled pip, use down to that point
                // If clicking on empty pip, recover up to that point
                if (i < current) {
                  onUse();
                } else {
                  onRecover();
                }
              }}
              disabled={readonly}
              className={cn(
                "w-4 h-4 rounded-full border-2 transition-all",
                i < current
                  ? `bg-gradient-to-r ${getResourceColor(name)} border-transparent`
                  : "bg-gray-900 border-gray-600 hover:border-gray-500",
                readonly && "cursor-default"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Compact version for sidebar or header
interface CompactResourceProps {
  name: string;
  current: number;
  max: number;
  onClick?: () => void;
}

export function CompactResource({ name, current, max, onClick }: CompactResourceProps) {
  const percentage = max > 0 ? (current / max) * 100 : 0;
  
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 transition-colors"
    >
      <Zap className="w-3 h-3 text-amber-400" />
      <span className="text-xs font-medium text-white">{name}</span>
      <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-gray-400">{current}/{max}</span>
    </button>
  );
}
