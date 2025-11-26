"use client";

import { useState, useMemo } from "react";
import { getBackgrounds, buildKey } from "@/lib/data/loader";
import type { StepProps } from "../types";
import { cn } from "@/lib/utils";
import { Check, BookOpen, Wrench, Languages } from "lucide-react";

interface ProcessedBackground {
  key: string;
  name: string;
  source: string;
  skillProficiencies: string[];
  toolProficiencies: string[];
  languages: number;
  originFeat?: string;
}

function processBackground(raw: any): ProcessedBackground {
  // Extract skill proficiencies
  const skillProficiencies: string[] = [];
  if (raw.skillProficiencies) {
    raw.skillProficiencies.forEach((sp: Record<string, boolean>) => {
      Object.keys(sp).forEach(skill => {
        if (sp[skill] === true) {
          skillProficiencies.push(skill);
        }
      });
    });
  }

  // Extract tool proficiencies
  const toolProficiencies: string[] = [];
  if (raw.toolProficiencies) {
    raw.toolProficiencies.forEach((tp: Record<string, boolean>) => {
      Object.keys(tp).forEach(tool => {
        if (tp[tool] === true) {
          toolProficiencies.push(tool);
        }
      });
    });
  }

  // Extract origin feat
  let originFeat: string | undefined;
  if (raw.feats) {
    const featEntry = raw.feats[0];
    if (featEntry) {
      originFeat = Object.keys(featEntry)[0];
    }
  }

  // Languages count
  let languages = 0;
  if (raw.languageProficiencies) {
    raw.languageProficiencies.forEach((lp: any) => {
      if (lp.anyStandard) {
        languages += lp.anyStandard;
      }
    });
  }

  return {
    key: buildKey(raw.name, raw.source),
    name: raw.name,
    source: raw.source,
    skillProficiencies,
    toolProficiencies,
    languages,
    originFeat,
  };
}

export function BackgroundStep({ data, updateData }: StepProps) {
  // Process backgrounds synchronously from local data
  const backgrounds = useMemo(() => {
    const rawBackgrounds = getBackgrounds();
    return rawBackgrounds.map(b => processBackground(b));
  }, []);

  const [selectedBackground, setSelectedBackground] = useState<ProcessedBackground | null>(() => {
    if (data.background_key) {
      return backgrounds.find(b => b.key === data.background_key) || null;
    }
    return null;
  });

  const handleSelectBackground = (background: ProcessedBackground) => {
    setSelectedBackground(background);
    
    // Merge background skill proficiencies with existing
    const bgSkills = background.skillProficiencies || [];
    const existingSkills = data.skill_proficiencies.filter(s => !bgSkills.includes(s));
    
    updateData({
      background_key: background.key,
      skill_proficiencies: [...existingSkills, ...bgSkills],
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Choose Your Background</h2>
        <p className="text-gray-400">
          Your background describes your character&apos;s life before adventuring, providing skill proficiencies, 
          tool proficiencies, and an origin feat.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Background List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {backgrounds.map((background) => (
            <button
              key={background.key}
              onClick={() => handleSelectBackground(background)}
              className={cn(
                "w-full text-left p-4 rounded-lg border transition-colors",
                selectedBackground?.key === background.key
                  ? "border-amber-500 bg-amber-500/10"
                  : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-amber-500" />
                  <span className="font-medium">{background.name}</span>
                </div>
                {selectedBackground?.key === background.key && (
                  <Check className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <div className="ml-8 mt-2 text-sm text-gray-400 flex flex-wrap gap-2">
                {background.skillProficiencies.slice(0, 2).map(skill => (
                  <span key={skill} className="px-2 py-0.5 bg-gray-700 rounded capitalize">
                    {skill}
                  </span>
                ))}
                {background.originFeat && (
                  <span className="px-2 py-0.5 bg-purple-600/30 text-purple-300 rounded">
                    ✦ {background.originFeat}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Background Details */}
        {selectedBackground ? (
          <div className="bg-gray-800 rounded-lg p-4 sticky top-0 max-h-[400px] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{selectedBackground.name}</h3>
            
            <div className="space-y-4 text-sm">
              {selectedBackground.skillProficiencies.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Skill Proficiencies</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedBackground.skillProficiencies.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-gray-700 rounded-full capitalize">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedBackground.toolProficiencies.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Wrench className="w-4 h-4" />
                    <span>Tool Proficiencies</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedBackground.toolProficiencies.map((tool, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-700 rounded-full capitalize">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedBackground.languages > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Languages className="w-4 h-4" />
                    <span>Languages</span>
                  </div>
                  <p>Choose {selectedBackground.languages} language(s)</p>
                </div>
              )}

              {selectedBackground.originFeat && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-purple-400 font-medium">Origin Feat</span>
                  </div>
                  <h4 className="font-bold capitalize">{selectedBackground.originFeat}</h4>
                  <p className="text-sm text-gray-300 mt-1">
                    See PHB for full feat details.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-800/50 rounded-lg p-8 flex items-center justify-center text-gray-500">
            Select a background to see details
          </div>
        )}
      </div>
    </div>
  );
}
