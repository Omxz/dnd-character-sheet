"use client";

import { useState, useMemo } from "react";
import { getAllClasses } from "@/lib/data/loader";
import type { StepProps } from "../types";
import { cn } from "@/lib/utils";
import { Check, Package, Coins, Sword, Shield, Briefcase } from "lucide-react";

interface EquipmentChoice {
  label: string;
  options: string[][];
}

export function EquipmentStep({ data, updateData }: StepProps) {
  const [selections, setSelections] = useState<Record<number, number>>({});
  const [useGold, setUseGold] = useState(false);

  // Get equipment choices based on class
  const { equipmentChoices, startingGold } = useMemo((): { equipmentChoices: EquipmentChoice[]; startingGold: number } => {
    if (data.class_levels.length === 0) {
      return { equipmentChoices: [], startingGold: 0 };
    }

    const classKey = data.class_levels[0].class;
    const className = classKey.split("|")[0].replace(/-/g, " ").toLowerCase();
    
    // Define equipment choices for each class
    const classEquipment: Record<string, { choices: EquipmentChoice[]; gold: number }> = {
      barbarian: {
        choices: [
          { label: "Weapons", options: [["Greataxe"], ["Any Martial Melee Weapon"]] },
          { label: "Secondary", options: [["Two Handaxes"], ["Any Simple Weapon"]] },
        ],
        gold: 50,
      },
      bard: {
        choices: [
          { label: "Weapons", options: [["Rapier"], ["Longsword"], ["Any Simple Weapon"]] },
          { label: "Pack", options: [["Diplomat's Pack"], ["Entertainer's Pack"]] },
          { label: "Instrument", options: [["Lute"], ["Any Musical Instrument"]] },
        ],
        gold: 100,
      },
      cleric: {
        choices: [
          { label: "Weapons", options: [["Mace"], ["Warhammer (if proficient)"]] },
          { label: "Armor", options: [["Scale Mail"], ["Leather Armor"], ["Chain Mail (if proficient)"]] },
          { label: "Secondary", options: [["Light Crossbow, 20 Bolts"], ["Any Simple Weapon"]] },
          { label: "Pack", options: [["Priest's Pack"], ["Explorer's Pack"]] },
        ],
        gold: 125,
      },
      druid: {
        choices: [
          { label: "Armor", options: [["Leather Armor"]] },
          { label: "Weapons", options: [["Wooden Shield"], ["Any Simple Weapon"]] },
          { label: "Secondary", options: [["Scimitar"], ["Any Simple Melee Weapon"]] },
        ],
        gold: 50,
      },
      fighter: {
        choices: [
          { label: "Armor", options: [["Chain Mail"], ["Leather Armor, Longbow, 20 Arrows"]] },
          { label: "Weapons", options: [["Martial Weapon, Shield"], ["Two Martial Weapons"]] },
          { label: "Ranged", options: [["Light Crossbow, 20 Bolts"], ["Two Handaxes"]] },
        ],
        gold: 150,
      },
      monk: {
        choices: [
          { label: "Weapons", options: [["Shortsword"], ["Any Simple Weapon"]] },
          { label: "Pack", options: [["Dungeoneer's Pack"], ["Explorer's Pack"]] },
        ],
        gold: 25,
      },
      paladin: {
        choices: [
          { label: "Weapons", options: [["Martial Weapon, Shield"], ["Two Martial Weapons"]] },
          { label: "Secondary", options: [["Five Javelins"], ["Any Simple Melee Weapon"]] },
          { label: "Pack", options: [["Priest's Pack"], ["Explorer's Pack"]] },
        ],
        gold: 150,
      },
      ranger: {
        choices: [
          { label: "Armor", options: [["Scale Mail"], ["Leather Armor"]] },
          { label: "Weapons", options: [["Two Shortswords"], ["Two Simple Melee Weapons"]] },
          { label: "Pack", options: [["Dungeoneer's Pack"], ["Explorer's Pack"]] },
        ],
        gold: 100,
      },
      rogue: {
        choices: [
          { label: "Weapons", options: [["Rapier"], ["Shortsword"]] },
          { label: "Ranged", options: [["Shortbow, Quiver, 20 Arrows"], ["Shortsword"]] },
          { label: "Pack", options: [["Burglar's Pack"], ["Dungeoneer's Pack"], ["Explorer's Pack"]] },
        ],
        gold: 100,
      },
      sorcerer: {
        choices: [
          { label: "Weapons", options: [["Light Crossbow, 20 Bolts"], ["Any Simple Weapon"]] },
          { label: "Focus", options: [["Component Pouch"], ["Arcane Focus"]] },
          { label: "Pack", options: [["Dungeoneer's Pack"], ["Explorer's Pack"]] },
        ],
        gold: 75,
      },
      warlock: {
        choices: [
          { label: "Weapons", options: [["Light Crossbow, 20 Bolts"], ["Any Simple Weapon"]] },
          { label: "Focus", options: [["Component Pouch"], ["Arcane Focus"]] },
          { label: "Pack", options: [["Scholar's Pack"], ["Dungeoneer's Pack"]] },
        ],
        gold: 75,
      },
      wizard: {
        choices: [
          { label: "Weapons", options: [["Quarterstaff"], ["Dagger"]] },
          { label: "Focus", options: [["Component Pouch"], ["Arcane Focus"]] },
          { label: "Pack", options: [["Scholar's Pack"], ["Explorer's Pack"]] },
        ],
        gold: 100,
      },
    };

    const result = classEquipment[className] || { choices: [], gold: 50 };
    return { equipmentChoices: result.choices, startingGold: result.gold };
  }, [data.class_levels]);

  const handleSelectionChange = (choiceIndex: number, optionIndex: number) => {
    const newSelections = { ...selections, [choiceIndex]: optionIndex };
    setSelections(newSelections);
    
    // Build equipment list
    const equipment: Array<{ item_key: string; quantity: number }> = [];
    Object.entries(newSelections).forEach(([ci, oi]) => {
      const choice = equipmentChoices[parseInt(ci)];
      if (choice) {
        choice.options[oi].forEach(item => {
          equipment.push({
            item_key: item.toLowerCase().replace(/\s+/g, "-").replace(/,/g, ""),
            quantity: 1,
          });
        });
      }
    });
    
    updateData({ equipment });
  };

  const guessItemType = (itemName: string): string => {
    const name = itemName.toLowerCase();
    if (name.includes("armor") || name.includes("mail") || name.includes("shield")) return "armor";
    if (name.includes("sword") || name.includes("axe") || name.includes("mace") || 
        name.includes("bow") || name.includes("crossbow") || name.includes("dagger") ||
        name.includes("rapier") || name.includes("quarterstaff")) return "weapon";
    return "gear";
  };

  const handleUseGold = (useGoldOption: boolean) => {
    setUseGold(useGoldOption);
    if (useGoldOption) {
      updateData({ equipment: [] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Starting Equipment</h2>
        <p className="text-gray-400">
          Choose your starting equipment or take gold to buy your own.
        </p>
      </div>

      {/* Equipment vs Gold Toggle */}
      {startingGold > 0 && (
        <div className="flex gap-4">
          <button
            onClick={() => handleUseGold(false)}
            className={cn(
              "flex-1 p-4 rounded-lg border-2 transition-colors",
              !useGold
                ? "border-amber-500 bg-amber-500/10"
                : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
            )}
          >
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-amber-500" />
              <div className="text-left">
                <div className="font-medium">Starting Equipment</div>
                <div className="text-sm text-gray-400">Choose from equipment packages</div>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => handleUseGold(true)}
            className={cn(
              "flex-1 p-4 rounded-lg border-2 transition-colors",
              useGold
                ? "border-amber-500 bg-amber-500/10"
                : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
            )}
          >
            <div className="flex items-center gap-3">
              <Coins className="w-6 h-6 text-yellow-500" />
              <div className="text-left">
                <div className="font-medium">Starting Gold</div>
                <div className="text-sm text-gray-400">{startingGold} gp to spend</div>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Equipment Choices */}
      {!useGold && equipmentChoices.length > 0 && (
        <div className="space-y-4">
          {equipmentChoices.map((choice, choiceIndex) => (
            <div key={choiceIndex} className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium mb-3 text-gray-300">{choice.label}</h3>
              <div className="space-y-2">
                {choice.options.map((option, optionIndex) => (
                  <button
                    key={optionIndex}
                    onClick={() => handleSelectionChange(choiceIndex, optionIndex)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-colors",
                      selections[choiceIndex] === optionIndex
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-gray-700 hover:border-gray-600"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {option.map((item, i) => (
                          <span key={i}>
                            {item}
                            {i < option.length - 1 && <span className="text-gray-500">, </span>}
                          </span>
                        ))}
                      </div>
                      {selections[choiceIndex] === optionIndex && (
                        <Check className="w-5 h-5 text-amber-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gold Mode */}
      {useGold && (
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <Coins className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <div className="text-3xl font-bold text-yellow-400 mb-2">
            {startingGold} gp
          </div>
          <p className="text-gray-400">
            You&apos;ll start with this gold to purchase equipment after character creation.
          </p>
        </div>
      )}

      {/* Selected Equipment Summary */}
      {!useGold && data.equipment.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Selected Equipment
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.equipment.map((item, i) => {
              const itemType = guessItemType(item.item_key);
              return (
                <span
                  key={i}
                  className={cn(
                    "px-3 py-1 rounded-full text-sm",
                    itemType === "weapon" ? "bg-red-600/20 text-red-300" :
                    itemType === "armor" ? "bg-blue-600/20 text-blue-300" :
                    "bg-gray-700 text-gray-300"
                  )}
                >
                  {itemType === "weapon" && <Sword className="w-3 h-3 inline mr-1" />}
                  {itemType === "armor" && <Shield className="w-3 h-3 inline mr-1" />}
                  {item.item_key.replace(/-/g, " ")}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* No Equipment Options */}
      {equipmentChoices.length === 0 && (
        <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Select a class first to see equipment options.</p>
        </div>
      )}
    </div>
  );
}
