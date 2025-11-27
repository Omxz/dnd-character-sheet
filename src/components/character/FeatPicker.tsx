"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  X,
  CheckCircle2,
  Circle,
  Award,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getFeats,
  checkPrerequisites,
  formatFeatPrerequisites,
  getFeatCategoryLabel,
  isFeatRepeatable,
  createFeatKey,
  type FeatData,
} from "@/lib/feats";
import type { Character } from "@/types/database";

interface FeatPickerProps {
  character: {
    level: number;
    ability_scores: Character["ability_scores"];
    feats?: string[];
    class_levels?: Array<{ class: string; level: number }>;
  };
  selectedFeat: string | null;
  onSelect: (featKey: string | null) => void;
}

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
  G: "text-amber-400 bg-amber-900/30 border-amber-700",
  O: "text-blue-400 bg-blue-900/30 border-blue-700",
  FS: "text-purple-400 bg-purple-900/30 border-purple-700",
  EB: "text-red-400 bg-red-900/30 border-red-700",
};

export function FeatPicker({ character, selectedFeat, onSelect }: FeatPickerProps) {
  const [allFeats, setAllFeats] = useState<FeatData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [expandedFeat, setExpandedFeat] = useState<string | null>(null);

  // Load feats
  useEffect(() => {
    const feats = getFeats();
    setAllFeats(feats);
  }, []);

  // Filter feats
  const filteredFeats = useMemo(() => {
    let feats = allFeats;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      feats = feats.filter((feat) =>
        feat.name.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (categoryFilter) {
      feats = feats.filter((feat) => feat.category === categoryFilter);
    }

    // Sort by name
    return feats.sort((a, b) => a.name.localeCompare(b.name));
  }, [allFeats, searchQuery, categoryFilter]);

  // Check prerequisites for all feats
  const featValidation = useMemo(() => {
    const validation: Record<string, { valid: boolean; reasons: string[] }> = {};
    filteredFeats.forEach((feat) => {
      const key = createFeatKey(feat);
      validation[key] = checkPrerequisites(feat, character);
    });
    return validation;
  }, [filteredFeats, character]);

  // Parse selected feat details from entries - handles 5etools complex structures
  const parseFeatEntries = (entries: unknown[]): string => {
    if (!Array.isArray(entries) || entries.length === 0) return "";

    const parts: string[] = [];

    for (const entry of entries) {
      if (typeof entry === "string") {
        parts.push(entry);
      } else if (typeof entry === "object" && entry !== null) {
        const obj = entry as Record<string, unknown>;

        // Handle nested entries with name (feat benefits)
        if (obj.type === "entries" && obj.name && typeof obj.name === "string") {
          const nestedContent = Array.isArray(obj.entries) ? parseFeatEntries(obj.entries) : "";
          parts.push(`**${obj.name}:** ${nestedContent}`);
        }
        // Handle nested entries without name
        else if (Array.isArray(obj.entries)) {
          parts.push(parseFeatEntries(obj.entries));
        }
        // Handle entry + entrySummary objects
        else if ("entry" in obj) {
          if (typeof obj.entry === "string") {
            parts.push(obj.entry);
          } else if (typeof obj.entry === "object" && obj.entry !== null) {
            parts.push(parseFeatEntries([obj.entry]));
          }
        }
        // Handle items arrays
        else if (Array.isArray(obj.items)) {
          parts.push(parseFeatEntries(obj.items));
        }
        // Handle list structures
        else if (obj.type === "list" && Array.isArray(obj.items)) {
          parts.push(parseFeatEntries(obj.items));
        }
        // Handle table structures
        else if (obj.type === "table" || obj.type === "tableGroup") {
          parts.push("[Table data]");
        }
      }
    }

    return parts.join(" ");
  };

  const handleSelectFeat = (feat: FeatData) => {
    const key = createFeatKey(feat);

    // Check if already selected
    if (selectedFeat === key) {
      onSelect(null);
      setExpandedFeat(null);
      return;
    }

    // Check prerequisites
    const validation = featValidation[key];
    if (!validation.valid) {
      // Show expanded view but don't select
      setExpandedFeat(key);
      return;
    }

    onSelect(key);
    setExpandedFeat(key);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter(null);
  };

  const hasActiveFilters = searchQuery.trim() !== "" || categoryFilter !== null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Choose a Feat</h3>
          <p className="text-sm text-gray-400">
            Select one feat. Prerequisites must be met.
          </p>
        </div>
        {selectedFeat && (
          <button
            onClick={() => {
              onSelect(null);
              setExpandedFeat(null);
            }}
            className="text-sm text-red-400 hover:text-red-300"
          >
            Clear Selection
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-2">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search feats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 flex-wrap">
          {["G", "O", "FS", "EB"].map((category) => (
            <button
              key={category}
              onClick={() =>
                setCategoryFilter(categoryFilter === category ? null : category)
              }
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                categoryFilter === category
                  ? CATEGORY_COLORS[category]
                  : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600"
              )}
            >
              {getFeatCategoryLabel(category)}
            </button>
          ))}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300 hover:bg-gray-600"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-400">
        {filteredFeats.length} feat{filteredFeats.length !== 1 ? "s" : ""} found
      </div>

      {/* Feat List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
        {filteredFeats.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No feats found matching your criteria.
          </div>
        ) : (
          filteredFeats.map((feat) => {
            const key = createFeatKey(feat);
            const validation = featValidation[key];
            const isSelected = selectedFeat === key;
            const isExpanded = expandedFeat === key;
            const isRepeatable = isFeatRepeatable(feat);
            const alreadyHas = character.feats?.includes(key);

            return (
              <div
                key={key}
                className={cn(
                  "border rounded-lg p-3 transition-all cursor-pointer",
                  isSelected
                    ? "bg-amber-900/30 border-amber-700"
                    : validation.valid
                    ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                    : "bg-gray-800/50 border-gray-800 opacity-60"
                )}
              >
                {/* Feat Header */}
                <div
                  className="flex items-start justify-between gap-3"
                  onClick={() => handleSelectFeat(feat)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {/* Selection Icon */}
                      {validation.valid ? (
                        isSelected ? (
                          <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        )
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      )}

                      {/* Feat Name */}
                      <h4
                        className={cn(
                          "font-semibold truncate",
                          validation.valid ? "text-white" : "text-gray-400"
                        )}
                      >
                        {feat.name}
                      </h4>

                      {/* Category Badge */}
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0",
                          CATEGORY_COLORS[feat.category] || "bg-gray-700 text-gray-300"
                        )}
                      >
                        {getFeatCategoryLabel(feat.category)}
                      </span>
                    </div>

                    {/* Prerequisites & Tags */}
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="text-gray-400">
                        Prerequisite: {formatFeatPrerequisites(feat)}
                      </span>
                      {isRepeatable && (
                        <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded-full border border-blue-700">
                          Repeatable
                        </span>
                      )}
                      {alreadyHas && !isRepeatable && (
                        <span className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded-full">
                          Already have
                        </span>
                      )}
                    </div>

                    {/* Prerequisites Not Met */}
                    {!validation.valid && validation.reasons.length > 0 && (
                      <div className="mt-2 text-xs text-red-400">
                        {validation.reasons.map((reason, idx) => (
                          <div key={idx}>• {reason}</div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Expand Icon */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedFeat(isExpanded ? null : key);
                    }}
                    className="text-gray-400 hover:text-white flex-shrink-0"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-700 text-sm text-gray-300 space-y-2">
                    <div className="prose prose-invert prose-sm max-w-none">
                      {parseFeatEntries(feat.entries).split("**").map((part, idx) => {
                        if (idx % 2 === 1) {
                          // This is a bold part (feat benefit name)
                          return (
                            <strong key={idx} className="text-amber-400">
                              {part}
                            </strong>
                          );
                        }
                        return <span key={idx}>{part}</span>;
                      })}
                    </div>

                    {/* Show if feat grants ability score increase */}
                    {feat.ability && feat.ability.length > 0 && (
                      <div className="mt-2 p-2 bg-amber-900/20 border border-amber-700/50 rounded text-xs text-amber-300">
                        <Award className="w-4 h-4 inline-block mr-1" />
                        This feat grants ability score improvements
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Selected Feat Summary */}
      {selectedFeat && (
        <div className="p-3 bg-amber-900/20 border border-amber-700 rounded-lg">
          <div className="flex items-center gap-2 text-amber-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold">
              Selected: {allFeats.find((f) => createFeatKey(f) === selectedFeat)?.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
