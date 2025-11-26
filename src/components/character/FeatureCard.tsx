"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, RefreshCw, Zap } from "lucide-react";

interface FeatureCardProps {
  name: string;
  source?: string; // e.g., "Barbarian", "Fighter 2", "Halfling"
  description: string;
  usesTotal?: number;
  usesRemaining?: number;
  rechargeOn?: "short" | "long" | "dawn" | "never";
  onUse?: () => void;
  onRefresh?: () => void;
  className?: string;
  readonly?: boolean;
  expanded?: boolean;
}

export function FeatureCard({
  name,
  source,
  description,
  usesTotal,
  usesRemaining,
  rechargeOn,
  onUse,
  onRefresh,
  className,
  readonly = false,
  expanded: initialExpanded = false,
}: FeatureCardProps) {
  const [expanded, setExpanded] = useState(initialExpanded);

  const hasUses = usesTotal !== undefined && usesTotal > 0;
  const canUse = !readonly && hasUses && (usesRemaining ?? 0) > 0;

  const rechargeLabels = {
    short: "Short Rest",
    long: "Long Rest",
    dawn: "Dawn",
    never: "—",
  };

  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden",
        "bg-gradient-to-b from-gray-800 to-gray-900",
        "border border-gray-700 hover:border-amber-500/30",
        "transition-all duration-200",
        className
      )}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 p-3 text-left hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-100 truncate">{name}</h4>
          {source && (
            <span className="text-xs text-amber-500/70">{source}</span>
          )}
        </div>

        {/* Uses indicator */}
        {hasUses && (
          <div className="flex items-center gap-1.5 mr-2">
            {Array.from({ length: usesTotal }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "w-3 h-3 rounded-full border transition-colors",
                  i < (usesRemaining ?? 0)
                    ? "bg-amber-500 border-amber-400"
                    : "bg-gray-700 border-gray-600"
                )}
              />
            ))}
          </div>
        )}

        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-3 pb-3 pt-0">
          <div className="border-t border-gray-700/50 pt-3">
            {/* Description */}
            <div
              className="text-sm text-gray-400 leading-relaxed prose prose-invert prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: formatDescription(description) }}
            />

            {/* Actions row */}
            {(hasUses || rechargeOn) && (
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-700/50">
                <div className="flex items-center gap-2">
                  {rechargeOn && rechargeOn !== "never" && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" />
                      {rechargeLabels[rechargeOn]}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!readonly && hasUses && usesRemaining !== usesTotal && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRefresh?.();
                      }}
                      className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-400 transition-colors"
                    >
                      Restore
                    </button>
                  )}
                  
                  {canUse && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUse?.();
                      }}
                      className="text-xs px-3 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-medium transition-colors flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3" />
                      Use
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Format description text with basic D&D styling
function formatDescription(text: string): string {
  return text
    // Bold important terms
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Dice notation
    .replace(/(\d+d\d+(?:[+-]\d+)?)/g, '<span class="text-amber-400 font-mono">$1</span>')
    // Spell names (italics)
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Line breaks
    .replace(/\n/g, "<br>");
}

interface FeatureListProps {
  features: Array<{
    name: string;
    source?: string;
    description: string;
    usesTotal?: number;
    usesRemaining?: number;
    rechargeOn?: "short" | "long" | "dawn" | "never";
  }>;
  onUse?: (featureName: string) => void;
  onRefresh?: (featureName: string) => void;
  readonly?: boolean;
  className?: string;
}

export function FeatureList({
  features,
  onUse,
  onRefresh,
  readonly = false,
  className,
}: FeatureListProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {features.map((feature, i) => (
        <FeatureCard
          key={`${feature.name}-${i}`}
          {...feature}
          readonly={readonly}
          onUse={() => onUse?.(feature.name)}
          onRefresh={() => onRefresh?.(feature.name)}
        />
      ))}
    </div>
  );
}
