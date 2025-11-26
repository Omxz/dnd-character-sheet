"use client";

import { useState, useMemo } from "react";
import { getAllClasses, buildKey } from "@/lib/data/loader";
import type { StepProps } from "../types";
import { cn } from "@/lib/utils";
import { Check, Heart, Sparkles, Shield, Sword } from "lucide-react";

interface ProcessedClass {
  key: string;
  name: string;
  source: string;
  hitDie: number;
  primaryAbility: string;
  savingThrows: string[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  spellcasting?: {
    ability: string;
    type: string;
  };
  subclassTitle: string;
  subclassLevel: number;
  skillChoices?: {
    from: string[];
    count: number;
  };
}

function processClass(raw: any): ProcessedClass {
  const hitDie = raw.hd?.faces || 8;
  const savingThrows = raw.proficiency || [];
  
  // Get armor/weapon proficiencies
  const armorProficiencies = raw.startingProficiencies?.armor || [];
  const weaponProficiencies = raw.startingProficiencies?.weapons || [];
  
  // Determine primary ability based on class
  const primaryAbilities: Record<string, string> = {
    barbarian: "strength",
    bard: "charisma",
    cleric: "wisdom",
    druid: "wisdom",
    fighter: "strength",
    monk: "dexterity",
    paladin: "strength",
    ranger: "dexterity",
    rogue: "dexterity",
    sorcerer: "charisma",
    warlock: "charisma",
    wizard: "intelligence",
  };
  
  // Get skill choices
  let skillChoices;
  if (raw.startingProficiencies?.skills?.[0]?.choose) {
    const choice = raw.startingProficiencies.skills[0].choose;
    skillChoices = {
      from: choice.from || [],
      count: choice.count || 2,
    };
  }

  // Spellcasting info
  let spellcasting;
  if (raw.spellcastingAbility) {
    spellcasting = {
      ability: raw.spellcastingAbility,
      type: raw.casterProgression || "full",
    };
  }

  // Subclass level
  const subclassLevels: Record<string, number> = {
    barbarian: 3, bard: 3, cleric: 3, druid: 2, fighter: 3,
    monk: 3, paladin: 3, ranger: 3, rogue: 3, sorcerer: 3,
    warlock: 3, wizard: 2,
  };

  return {
    key: buildKey(raw.name, raw.source),
    name: raw.name,
    source: raw.source,
    hitDie,
    primaryAbility: primaryAbilities[raw.name.toLowerCase()] || "strength",
    savingThrows,
    armorProficiencies,
    weaponProficiencies,
    spellcasting,
    subclassTitle: raw.subclassTitle || "Subclass",
    subclassLevel: subclassLevels[raw.name.toLowerCase()] || 3,
    skillChoices,
  };
}

export function ClassStep({ data, updateData }: StepProps) {
  // Process classes synchronously from local data
  const classes = useMemo(() => {
    const allClassFiles = getAllClasses();
    const processed: ProcessedClass[] = [];
    
    for (const file of allClassFiles) {
      for (const cls of file.class) {
        if (cls.source === "XPHB") {
          processed.push(processClass(cls));
        }
      }
    }
    
    return processed;
  }, []);

  const [selectedClass, setSelectedClass] = useState<ProcessedClass | null>(() => {
    if (data.class_levels.length > 0) {
      return classes.find(c => c.key === data.class_levels[0].class) || null;
    }
    return null;
  });

  const handleSelectClass = (cls: ProcessedClass) => {
    setSelectedClass(cls);
    updateData({
      class_levels: [{ class: cls.key, level: 1 }],
      saving_throw_proficiencies: cls.savingThrows,
    });
  };

  const getClassIcon = (className: string) => {
    const icons: Record<string, React.ReactNode> = {
      barbarian: <Sword className="w-5 h-5" />,
      bard: <Sparkles className="w-5 h-5" />,
      cleric: <Heart className="w-5 h-5" />,
      druid: <Sparkles className="w-5 h-5" />,
      fighter: <Shield className="w-5 h-5" />,
      monk: <Sparkles className="w-5 h-5" />,
      paladin: <Shield className="w-5 h-5" />,
      ranger: <Sparkles className="w-5 h-5" />,
      rogue: <Sparkles className="w-5 h-5" />,
      sorcerer: <Sparkles className="w-5 h-5" />,
      warlock: <Sparkles className="w-5 h-5" />,
      wizard: <Sparkles className="w-5 h-5" />,
    };
    return icons[className.toLowerCase()] || <Sparkles className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Choose Your Class</h2>
        <p className="text-gray-400">
          Your class defines your character&apos;s abilities, features, and role in the party.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Class List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {classes.map((cls) => (
            <button
              key={cls.key}
              onClick={() => handleSelectClass(cls)}
              className={cn(
                "w-full text-left p-4 rounded-lg border transition-colors",
                selectedClass?.key === cls.key
                  ? "border-amber-500 bg-amber-500/10"
                  : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-amber-500">
                    {getClassIcon(cls.name)}
                  </span>
                  <span className="font-medium">{cls.name}</span>
                </div>
                {selectedClass?.key === cls.key && (
                  <Check className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <div className="flex gap-4 mt-2 text-sm text-gray-400 ml-8">
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  d{cls.hitDie}
                </span>
                {cls.spellcasting && (
                  <span className="text-purple-400">
                    ✦ Spellcaster
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Class Details */}
        {selectedClass ? (
          <div className="bg-gray-800 rounded-lg p-4 sticky top-0 max-h-[400px] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{selectedClass.name}</h3>
            
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400">Hit Die:</span>
                  <span className="ml-2 font-medium text-red-400">d{selectedClass.hitDie}</span>
                </div>
                <div>
                  <span className="text-gray-400">Primary:</span>
                  <span className="ml-2 capitalize">{selectedClass.primaryAbility}</span>
                </div>
              </div>
              
              <div>
                <span className="text-gray-400">Saving Throws:</span>
                <span className="ml-2 capitalize">
                  {selectedClass.savingThrows.join(", ")}
                </span>
              </div>
              
              {selectedClass.armorProficiencies.length > 0 && (
                <div>
                  <span className="text-gray-400">Armor:</span>
                  <span className="ml-2">{selectedClass.armorProficiencies.join(", ")}</span>
                </div>
              )}
              
              {selectedClass.weaponProficiencies.length > 0 && (
                <div>
                  <span className="text-gray-400">Weapons:</span>
                  <span className="ml-2">{selectedClass.weaponProficiencies.join(", ")}</span>
                </div>
              )}

              {selectedClass.spellcasting && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <span className="text-purple-400 font-medium">Spellcasting</span>
                  <div className="mt-2 space-y-1 text-gray-300">
                    <p>Ability: <span className="capitalize">{selectedClass.spellcasting.ability}</span></p>
                    <p>Type: <span className="capitalize">{selectedClass.spellcasting.type} caster</span></p>
                  </div>
                </div>
              )}

              <div>
                <span className="text-gray-400">Subclass:</span>
                <span className="ml-2">
                  {selectedClass.subclassTitle} at level {selectedClass.subclassLevel}
                </span>
              </div>

              {selectedClass.skillChoices && (
                <div className="border-t border-gray-700 pt-4">
                  <h4 className="font-medium mb-2">Skill Proficiencies</h4>
                  <p className="text-gray-300">
                    Choose {selectedClass.skillChoices.count} from: {selectedClass.skillChoices.from.join(", ")}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-800/50 rounded-lg p-8 flex items-center justify-center text-gray-500">
            Select a class to see details
          </div>
        )}
      </div>
    </div>
  );
}
