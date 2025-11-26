"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/auth";
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Types
import type { CharacterData, StepProps } from "./types";

// Step components
import { RaceStep } from "./steps/RaceStep";
import { ClassStep } from "./steps/ClassStep";
import { AbilityScoresStep } from "./steps/AbilityScoresStep";
import { BackgroundStep } from "./steps/BackgroundStep";
import { SkillsStep } from "./steps/SkillsStep";
import { EquipmentStep } from "./steps/EquipmentStep";
import { SpellsStep } from "./steps/SpellsStep";
import { DescriptionStep } from "./steps/DescriptionStep";
import { ReviewStep } from "./steps/ReviewStep";

const STEPS = [
  { id: "race", title: "Race", component: RaceStep },
  { id: "class", title: "Class", component: ClassStep },
  { id: "abilities", title: "Ability Scores", component: AbilityScoresStep },
  { id: "background", title: "Background", component: BackgroundStep },
  { id: "skills", title: "Skills", component: SkillsStep },
  { id: "equipment", title: "Equipment", component: EquipmentStep },
  { id: "spells", title: "Spells", component: SpellsStep },
  { id: "description", title: "Description", component: DescriptionStep },
  { id: "review", title: "Review", component: ReviewStep },
];

const initialCharacterData: CharacterData = {
  name: "",
  race_key: "",
  subrace_key: null,
  class_levels: [],
  background_key: "",
  ability_scores: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  },
  skill_proficiencies: [],
  saving_throw_proficiencies: [],
  tool_proficiencies: [],
  languages: ["Common"],
  feats: [],
  spells_known: {
    cantrips: [],
    spells: [],
  },
  equipment: [],
  personality_traits: "",
  ideals: "",
  bonds: "",
  flaws: "",
  backstory: "",
};

export default function CharacterCreationWizard() {
  const router = useRouter();
  const { user, loading: authLoading, isConfigured } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [characterData, setCharacterData] = useState<CharacterData>(initialCharacterData);
  const [saving, setSaving] = useState(false);
  const [direction, setDirection] = useState(0); // -1 for back, 1 for forward

  useEffect(() => {
    // Only redirect if Supabase is configured and user is not logged in
    if (isConfigured && !authLoading && !user) {
      router.push("/login?redirect=/characters/new");
    }
  }, [user, authLoading, isConfigured, router]);

  const updateData = (updates: Partial<CharacterData>) => {
    setCharacterData(prev => ({ ...prev, ...updates }));
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < STEPS.length) {
      setDirection(step > currentStep ? 1 : -1);
      setCurrentStep(step);
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      goToStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    // TODO: Save to Supabase
    console.log("Saving character:", characterData);
    
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSaving(false);
    router.push("/characters");
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const CurrentStepComponent = STEPS[currentStep].component;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Create Character</h1>
          <span className="text-gray-400">
            Step {currentStep + 1} of {STEPS.length}
          </span>
        </div>

        {/* Step Indicators */}
        <div className="flex gap-1">
          {STEPS.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              className={cn(
                "flex-1 h-2 rounded-full transition-colors",
                index < currentStep && "bg-amber-600",
                index === currentStep && "bg-amber-500",
                index > currentStep && "bg-gray-700"
              )}
              title={step.title}
            />
          ))}
        </div>

        {/* Step Labels */}
        <div className="flex justify-between mt-2 text-sm">
          {STEPS.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              className={cn(
                "transition-colors",
                index === currentStep && "text-amber-500 font-medium",
                index !== currentStep && "text-gray-500 hover:text-gray-300"
              )}
            >
              {index === currentStep ? step.title : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-gray-800/50 rounded-xl p-6 min-h-[400px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -50 }}
            transition={{ duration: 0.2 }}
          >
            <CurrentStepComponent
              data={characterData}
              updateData={updateData}
              onNext={handleNext}
              onBack={handleBack}
              isFirst={currentStep === 0}
              isLast={currentStep === STEPS.length - 1}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-lg transition-colors",
            currentStep === 0
              ? "text-gray-500 cursor-not-allowed"
              : "bg-gray-700 hover:bg-gray-600"
          )}
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        {currentStep === STEPS.length - 1 ? (
          <button
            onClick={handleSave}
            disabled={saving || !characterData.name || !characterData.race_key}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Check className="w-5 h-5" />
            )}
            Create Character
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
