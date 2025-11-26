"use client";

import { useState, useMemo } from "react";
import { getAllClasses } from "@/lib/data/loader";
import type { StepProps } from "../types";
import { cn, SKILLS } from "@/lib/utils";
import { Check, AlertCircle } from "lucide-react";

interface SkillChoice {
  from: string[];
  count: number;
}

export function SkillsStep({ data, updateData }: StepProps) {
  // Get skill choices from class data
  const skillChoices = useMemo<SkillChoice | null>(() => {
    if (data.class_levels.length === 0) return null;
    
    const classKey = data.class_levels[0].class;
    const className = classKey.split("|")[0].replace(/-/g, " ");
    
    const allClassFiles = getAllClasses();
    for (const file of allClassFiles) {
      const cls = file.class.find(
        (c: any) => c.name.toLowerCase() === className.toLowerCase() && c.source === "XPHB"
      );
      
      if (cls?.startingProficiencies?.skills?.[0]?.choose) {
        const choice = cls.startingProficiencies.skills[0].choose;
        return {
          from: choice.from || [],
          count: choice.count || 2,
        };
      }
    }
    return null;
  }, [data.class_levels]);

  const [classSkillsSelected, setClassSkillsSelected] = useState<string[]>([]);

  // Skills from background are already set
  const backgroundSkills = data.skill_proficiencies.filter(
    s => !classSkillsSelected.includes(s)
  );

  const handleSkillToggle = (skill: string) => {
    const isSelected = classSkillsSelected.includes(skill);
    let newSelection: string[];

    if (isSelected) {
      newSelection = classSkillsSelected.filter(s => s !== skill);
    } else {
      if (skillChoices && classSkillsSelected.length >= skillChoices.count) {
        // Replace oldest selection
        newSelection = [...classSkillsSelected.slice(1), skill];
      } else {
        newSelection = [...classSkillsSelected, skill];
      }
    }

    setClassSkillsSelected(newSelection);
    
    // Combine background skills with class skill selections
    updateData({
      skill_proficiencies: [...backgroundSkills, ...newSelection],
    });
  };

  const allSelectedSkills = [...backgroundSkills, ...classSkillsSelected];
  const remainingChoices = skillChoices ? skillChoices.count - classSkillsSelected.length : 0;

  // Convert SKILLS object to array for mapping
  const skillsArray = Object.entries(SKILLS).map(([name, ability]) => ({ name, ability }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Choose Your Skills</h2>
        <p className="text-gray-400">
          Select skill proficiencies for your character based on your class and background.
        </p>
      </div>

      {/* Background Skills (fixed) */}
      {backgroundSkills.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="font-medium mb-3 text-gray-400">From Background</h3>
          <div className="flex flex-wrap gap-2">
            {backgroundSkills.map(skill => (
              <span
                key={skill}
                className="px-4 py-2 bg-purple-600/30 text-purple-300 rounded-lg capitalize flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Class Skills (choosable) */}
      {skillChoices && (
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">From Class</h3>
            <span className={cn(
              "px-3 py-1 rounded-full text-sm",
              remainingChoices > 0 ? "bg-amber-600" : "bg-green-600"
            )}>
              {remainingChoices > 0 
                ? `Choose ${remainingChoices} more` 
                : "All skills selected"}
            </span>
          </div>
          
          <p className="text-sm text-gray-400 mb-4">
            Choose {skillChoices.count} skills from the following options:
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {skillChoices.from.map(skill => {
              const isFromBackground = backgroundSkills.includes(skill);
              const isSelected = classSkillsSelected.includes(skill);
              
              return (
                <button
                  key={skill}
                  onClick={() => !isFromBackground && handleSkillToggle(skill)}
                  disabled={isFromBackground}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-colors capitalize",
                    isFromBackground
                      ? "border-gray-700 bg-gray-700/30 text-gray-500 cursor-not-allowed"
                      : isSelected
                      ? "border-amber-500 bg-amber-500/10"
                      : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{skill}</span>
                    {isSelected && <Check className="w-4 h-4 text-amber-500" />}
                    {isFromBackground && (
                      <span className="text-xs text-gray-500">(bg)</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!skillChoices && data.class_levels.length > 0 && (
        <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
          <div>
            <p className="text-yellow-400 font-medium">No class skill options found</p>
            <p className="text-gray-400 text-sm">
              Skill choices for your class could not be loaded. You can add skills manually later.
            </p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="font-medium mb-3">All Skill Proficiencies</h3>
        {allSelectedSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {allSelectedSkills.map(skill => (
              <span
                key={skill}
                className="px-3 py-1 bg-amber-600/30 text-amber-300 rounded-full capitalize"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No skills selected yet</p>
        )}
      </div>

      {/* All Skills Reference */}
      <details className="bg-gray-800/50 rounded-lg">
        <summary className="p-4 cursor-pointer text-gray-400 hover:text-white">
          View all skills
        </summary>
        <div className="p-4 pt-0 grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {skillsArray.map(skill => (
            <div
              key={skill.name}
              className={cn(
                "p-2 rounded capitalize",
                allSelectedSkills.includes(skill.name)
                  ? "bg-amber-600/20 text-amber-300"
                  : "text-gray-500"
              )}
            >
              <span className="font-medium">{skill.name}</span>
              <span className="text-xs ml-1 opacity-70">({skill.ability.slice(0, 3)})</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
