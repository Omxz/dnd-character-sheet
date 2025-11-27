"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { X, Check, ChevronRight, AlertCircle } from "lucide-react";
import type { FeatureChoice } from "@/lib/feature-choices";

interface FeatureChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  choices: FeatureChoice[];
  currentChoices: Record<string, string | string[]>;
  onSave: (choices: Record<string, string | string[]>) => void;
  characterName?: string;
}

// Extracted content component for reuse in LevelUpModal
interface FeatureChoiceContentProps {
  choices: FeatureChoice[];
  currentChoices: Record<string, string | string[]>;
  onChange: (choices: Record<string, string | string[]>) => void;
}

export function FeatureChoiceContent({
  choices,
  currentChoices,
  onChange,
}: FeatureChoiceContentProps) {
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string | string[]>>(
    currentChoices
  );
  const [activeChoice, setActiveChoice] = useState<string | null>(
    choices.length > 0 ? choices[0].featureName : null
  );

  // Update parent when selections change
  React.useEffect(() => {
    onChange(selectedChoices);
  }, [selectedChoices, onChange]);

  const handleSelectSingle = (featureName: string, optionKey: string) => {
    const choiceKey = featureName.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    setSelectedChoices(prev => ({
      ...prev,
      [choiceKey]: optionKey,
    }));
  };

  const handleToggleMultiple = (featureName: string, optionKey: string, maxCount: number) => {
    const choiceKey = featureName.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const current = selectedChoices[choiceKey];
    const currentArray = Array.isArray(current) ? current : current ? [current] : [];

    if (currentArray.includes(optionKey)) {
      // Remove
      setSelectedChoices(prev => ({
        ...prev,
        [choiceKey]: currentArray.filter(k => k !== optionKey),
      }));
    } else if (currentArray.length < maxCount) {
      // Add
      setSelectedChoices(prev => ({
        ...prev,
        [choiceKey]: [...currentArray, optionKey],
      }));
    }
  };

  const isSelected = (featureName: string, optionKey: string): boolean => {
    const choiceKey = featureName.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const current = selectedChoices[choiceKey];
    if (Array.isArray(current)) {
      return current.includes(optionKey);
    }
    return current === optionKey;
  };

  const getSelectedCount = (featureName: string): number => {
    const choiceKey = featureName.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const current = selectedChoices[choiceKey];
    if (Array.isArray(current)) return current.length;
    return current ? 1 : 0;
  };

  const activeChoiceData = choices.find(c => c.featureName === activeChoice);

  return (
    <div className="flex overflow-hidden rounded-lg border border-gray-700">
      {/* Left sidebar - feature list */}
      <div className="w-64 border-r border-gray-700 overflow-y-auto bg-gray-800/50 max-h-[500px]">
        {choices.map((choice) => {
          const selectedCount = getSelectedCount(choice.featureName);
          const requiredCount = choice.type === "multiple" ? (choice.count || 1) : 1;
          const isChoiceComplete = selectedCount >= requiredCount;

          return (
            <button
              key={choice.featureName}
              onClick={() => setActiveChoice(choice.featureName)}
              className={cn(
                "w-full flex items-center gap-3 p-3 text-left transition-colors border-l-2",
                activeChoice === choice.featureName
                  ? "bg-amber-900/30 border-amber-500 text-white"
                  : "border-transparent hover:bg-gray-700/50 text-gray-300"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-xs",
                isChoiceComplete
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 text-gray-400"
              )}>
                {isChoiceComplete ? <Check className="w-3 h-3" /> : selectedCount}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{choice.featureName}</div>
                <div className="text-xs text-gray-500">
                  Level {choice.level}
                  {choice.type === "multiple" && ` • Choose ${choice.count}`}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          );
        })}
      </div>

      {/* Right content - options */}
      <div className="flex-1 overflow-y-auto p-4 max-h-[500px]">
        {activeChoiceData ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {activeChoiceData.featureName}
              </h3>
              <span className="text-sm text-gray-400">
                {activeChoiceData.type === "multiple" ? (
                  <>
                    {getSelectedCount(activeChoiceData.featureName)} / {activeChoiceData.count} selected
                  </>
                ) : (
                  getSelectedCount(activeChoiceData.featureName) > 0 ? "Selected" : "Choose one"
                )}
              </span>
            </div>

            <div className="grid gap-2">
              {activeChoiceData.options.map((option) => {
                const selected = isSelected(activeChoiceData.featureName, option.key);
                const canSelect = activeChoiceData.type === "single" ||
                  getSelectedCount(activeChoiceData.featureName) < (activeChoiceData.count || 1);

                return (
                  <button
                    key={option.key}
                    onClick={() => {
                      if (activeChoiceData.type === "single") {
                        handleSelectSingle(activeChoiceData.featureName, option.key);
                      } else {
                        handleToggleMultiple(
                          activeChoiceData.featureName,
                          option.key,
                          activeChoiceData.count || 1
                        );
                      }
                    }}
                    disabled={!selected && !canSelect}
                    className={cn(
                      "w-full flex items-start gap-3 p-4 rounded-lg border text-left transition-all",
                      selected
                        ? "bg-amber-900/30 border-amber-500"
                        : canSelect
                        ? "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                        : "bg-gray-800/30 border-gray-800 opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                      selected
                        ? "bg-amber-600 border-amber-500 text-white"
                        : "border-gray-600"
                    )}>
                      {selected && <Check className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white">{option.name}</h4>
                      <p className="text-sm text-gray-400 mt-1">{option.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a feature from the left to configure
          </div>
        )}
      </div>
    </div>
  );
}

export function FeatureChoiceModal({
  isOpen,
  onClose,
  choices,
  currentChoices,
  onSave,
  characterName,
}: FeatureChoiceModalProps) {
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string | string[]>>(
    currentChoices
  );

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(selectedChoices);
    onClose();
  };

  // Check if all choices are complete
  const isComplete = choices.every(choice => {
    const choiceKey = choice.featureName.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const current = selectedChoices[choiceKey];
    if (choice.type === "single") {
      return !!current;
    } else {
      const count = Array.isArray(current) ? current.length : current ? 1 : 0;
      return count >= (choice.count || 1);
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900/95">
          <div>
            <h2 className="text-xl font-bold text-white">Feature Choices</h2>
            {characterName && (
              <p className="text-sm text-gray-400">Configure features for {characterName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden p-4">
          <FeatureChoiceContent
            choices={choices}
            currentChoices={currentChoices}
            onChange={setSelectedChoices}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-700 bg-gray-900/95">
          <div className="flex items-center gap-2 text-sm">
            {!isComplete && (
              <>
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-400">Some choices are incomplete</span>
              </>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium transition-colors"
            >
              Save Choices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
