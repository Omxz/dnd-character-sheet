"use client";

import { useAuth } from "@/components/auth";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Loader2, 
  User,
  Shield,
  Swords,
  Scroll,
  Package,
  Sparkles,
  Save,
  BookOpen,
  FileText,
  Camera,
  Heart,
  X
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { AvatarUpload, MulticlassManager, SpellManager } from "@/components/character";

interface Character {
  id: string;
  name: string;
  level: number;
  race_key: string;
  subrace_key: string | null;
  class_levels: Array<{ class: string; level: number; subclass?: string }>;
  background_key: string;
  ability_scores: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  max_hp: number;
  current_hp: number;
  temp_hp?: number;
  skill_proficiencies: string[];
  saving_throw_proficiencies?: string[];
  equipment: Array<{ name: string; quantity: number }>;
  spells_known: { cantrips: string[]; spells: string[] };
  prepared_spells?: string[];
  personality_traits: string | null;
  ideals: string | null;
  bonds: string | null;
  flaws: string | null;
  backstory: string | null;
  user_id: string;
  avatar_url?: string;
  armor_class?: number;
  speed?: number;
  xp?: number;
}

type TabType = "basic" | "abilities" | "combat" | "equipment" | "spells" | "description";

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: "basic", label: "Basic Info", icon: <User className="w-4 h-4" /> },
  { id: "abilities", label: "Abilities", icon: <Shield className="w-4 h-4" /> },
  { id: "combat", label: "Combat", icon: <Swords className="w-4 h-4" /> },
  { id: "equipment", label: "Equipment", icon: <Package className="w-4 h-4" /> },
  { id: "spells", label: "Spells", icon: <Sparkles className="w-4 h-4" /> },
  { id: "description", label: "Description", icon: <FileText className="w-4 h-4" /> },
];

export default function CharacterEditPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("basic");
  const [hasChanges, setHasChanges] = useState(false);

  const characterId = params.id as string;

  const fetchCharacter = useCallback(async () => {
    if (!user || !characterId) return;

    const supabase = createClient();
    if (!supabase) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from("characters") as any)
        .select("*")
        .eq("id", characterId)
        .single();

      if (error) throw error;
      
      // Check ownership
      if (data.user_id !== user.id) {
        router.push(`/characters/${characterId}`);
        return;
      }
      
      setCharacter(data);
    } catch (err) {
      console.error("Error fetching character:", err);
    } finally {
      setLoading(false);
    }
  }, [user, characterId, router]);

  useEffect(() => {
    if (user) {
      fetchCharacter();
    }
  }, [user, fetchCharacter]);

  const updateField = <K extends keyof Character>(field: K, value: Character[K]) => {
    if (!character) return;
    setCharacter({ ...character, [field]: value });
    setHasChanges(true);
  };

  const saveCharacter = async () => {
    if (!character) return;

    setSaving(true);
    const supabase = createClient();
    if (!supabase) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("characters") as any)
        .update({
          name: character.name,
          level: character.level,
          class_levels: character.class_levels,
          ability_scores: character.ability_scores,
          max_hp: character.max_hp,
          current_hp: character.current_hp,
          armor_class: character.armor_class,
          speed: character.speed,
          skill_proficiencies: character.skill_proficiencies,
          saving_throw_proficiencies: character.saving_throw_proficiencies,
          equipment: character.equipment,
          spells_known: character.spells_known,
          prepared_spells: character.prepared_spells,
          personality_traits: character.personality_traits,
          ideals: character.ideals,
          bonds: character.bonds,
          flaws: character.flaws,
          backstory: character.backstory,
          xp: character.xp,
        })
        .eq("id", character.id);

      if (error) throw error;
      
      setHasChanges(false);
    } catch (err) {
      console.error("Error saving character:", err);
      alert("Failed to save character");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!character) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <h2 className="text-xl font-bold mb-2">Character Not Found</h2>
        <p className="text-gray-400 mb-6">This character doesn&apos;t exist or you don&apos;t have access.</p>
        <Link
          href="/characters"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Characters
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700">
        <div className="flex items-center gap-4">
          <Link
            href={`/characters/${character.id}`}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          
          <div>
            <h1 className="text-xl font-bold text-white">Edit: {character.name}</h1>
            <p className="text-gray-400 text-sm">
              Make changes to your character
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="text-amber-400 text-sm">Unsaved changes</span>
          )}
          <button
            onClick={saveCharacter}
            disabled={saving || !hasChanges}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
              hasChanges
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            )}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 p-1 rounded-lg overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap",
              activeTab === tab.id
                ? "bg-gray-700 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        {activeTab === "basic" && (
          <BasicInfoTab character={character} updateField={updateField} />
        )}
        {activeTab === "abilities" && (
          <AbilitiesTab character={character} updateField={updateField} />
        )}
        {activeTab === "combat" && (
          <CombatTab character={character} updateField={updateField} />
        )}
        {activeTab === "equipment" && (
          <EquipmentTab character={character} updateField={updateField} />
        )}
        {activeTab === "spells" && (
          <SpellsTab character={character} updateField={updateField} />
        )}
        {activeTab === "description" && (
          <DescriptionTab character={character} updateField={updateField} />
        )}
      </div>
    </div>
  );
}

// Tab Components
interface TabProps {
  character: Character;
  updateField: <K extends keyof Character>(field: K, value: Character[K]) => void;
}

function BasicInfoTab({ character, updateField }: TabProps) {
  const formatRace = (raceKey: string) => {
    return raceKey.split("|")[0].replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  // Calculate total level from class_levels
  const handleClassLevelsChange = (newClassLevels: Array<{ class: string; level: number; subclass?: string }>) => {
    updateField("class_levels", newClassLevels);
    // Update total level
    const totalLevel = newClassLevels.reduce((sum, cl) => sum + cl.level, 0);
    updateField("level", totalLevel);
  };

  return (
    <div className="space-y-8">
      {/* Character Identity */}
      <div className="flex gap-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-2">
          <AvatarUpload
            currentUrl={character.avatar_url}
            onUpload={async (blob) => {
              console.log("Upload avatar:", blob);
              return null;
            }}
            size="lg"
          />
          <span className="text-xs text-gray-500">Click to change</span>
        </div>

        {/* Basic fields */}
        <div className="flex-1 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Character Name
            </label>
            <input
              type="text"
              value={character.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Total Level
            </label>
            <div className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-amber-400 font-bold">
              {character.level}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Experience Points
            </label>
            <input
              type="number"
              min={0}
              value={character.xp || 0}
              onChange={(e) => updateField("xp", parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Race
            </label>
            <div className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-300">
              {formatRace(character.race_key)}
              {character.subrace_key && (
                <span className="text-gray-500 ml-1">
                  ({formatRace(character.subrace_key)})
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Multiclass Manager */}
      <div className="pt-6 border-t border-gray-700">
        <MulticlassManager
          classLevels={character.class_levels || []}
          totalLevel={character.level}
          onChange={handleClassLevelsChange}
          maxLevel={20}
        />
      </div>
    </div>
  );
}

function AbilitiesTab({ character, updateField }: TabProps) {
  const abilities = character.ability_scores;
  const abilityNames = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"] as const;

  const updateAbility = (ability: string, value: number) => {
    updateField("ability_scores", {
      ...abilities,
      [ability]: Math.max(1, Math.min(30, value)),
    });
  };

  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Ability Scores</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {abilityNames.map((ability) => (
          <div
            key={ability}
            className="p-4 bg-gray-900 rounded-lg border border-gray-700"
          >
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
              {ability}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={30}
                value={abilities[ability]}
                onChange={(e) => updateAbility(ability, parseInt(e.target.value) || 10)}
                className="w-16 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-center text-xl font-bold focus:border-amber-500 focus:outline-none"
              />
              <span className="text-lg text-amber-400 font-medium">
                {getModifier(abilities[ability])}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-gray-700">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Saving Throw Proficiencies</h4>
        <div className="flex flex-wrap gap-2">
          {abilityNames.map((ability) => {
            const isProficient = character.saving_throw_proficiencies?.includes(ability);
            return (
              <button
                key={ability}
                onClick={() => {
                  const current = character.saving_throw_proficiencies || [];
                  const updated = isProficient
                    ? current.filter(a => a !== ability)
                    : [...current, ability];
                  updateField("saving_throw_proficiencies", updated);
                }}
                className={cn(
                  "px-3 py-1 rounded-full text-sm capitalize transition-colors",
                  isProficient
                    ? "bg-amber-600 text-white"
                    : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                )}
              >
                {ability}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CombatTab({ character, updateField }: TabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            <Heart className="w-4 h-4 inline mr-1 text-red-500" />
            Max HP
          </label>
          <input
            type="number"
            min={1}
            value={character.max_hp}
            onChange={(e) => updateField("max_hp", parseInt(e.target.value) || 1)}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Current HP
          </label>
          <input
            type="number"
            min={0}
            max={character.max_hp}
            value={character.current_hp}
            onChange={(e) => updateField("current_hp", parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            <Shield className="w-4 h-4 inline mr-1 text-blue-500" />
            Armor Class
          </label>
          <input
            type="number"
            min={1}
            value={character.armor_class || 10}
            onChange={(e) => updateField("armor_class", parseInt(e.target.value) || 10)}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Speed (ft)
          </label>
          <input
            type="number"
            min={0}
            step={5}
            value={character.speed || 30}
            onChange={(e) => updateField("speed", parseInt(e.target.value) || 30)}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="pt-6 border-t border-gray-700">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Skill Proficiencies</h4>
        <div className="flex flex-wrap gap-2">
          {[
            "acrobatics", "animal-handling", "arcana", "athletics", "deception",
            "history", "insight", "intimidation", "investigation", "medicine",
            "nature", "perception", "performance", "persuasion", "religion",
            "sleight-of-hand", "stealth", "survival"
          ].map((skill) => {
            const isProficient = character.skill_proficiencies?.includes(skill);
            return (
              <button
                key={skill}
                onClick={() => {
                  const current = character.skill_proficiencies || [];
                  const updated = isProficient
                    ? current.filter(s => s !== skill)
                    : [...current, skill];
                  updateField("skill_proficiencies", updated);
                }}
                className={cn(
                  "px-3 py-1 rounded-full text-sm capitalize transition-colors",
                  isProficient
                    ? "bg-amber-600 text-white"
                    : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                )}
              >
                {skill.replace(/-/g, " ")}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EquipmentTab({ character, updateField }: TabProps) {
  const [newItem, setNewItem] = useState({ name: "", quantity: 1 });

  const addItem = () => {
    if (!newItem.name.trim()) return;
    const current = character.equipment || [];
    updateField("equipment", [...current, { name: newItem.name.trim(), quantity: newItem.quantity }]);
    setNewItem({ name: "", quantity: 1 });
  };

  const removeItem = (index: number) => {
    const current = character.equipment || [];
    updateField("equipment", current.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: "name" | "quantity", value: string | number) => {
    const current = character.equipment || [];
    const updated = [...current];
    updated[index] = { ...updated[index], [field]: value };
    updateField("equipment", updated);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Equipment</h3>

      {/* Add new item */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Item name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-amber-500 focus:outline-none"
        />
        <input
          type="number"
          min={1}
          value={newItem.quantity}
          onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
          className="w-20 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-amber-500 focus:outline-none"
        />
        <button
          onClick={addItem}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
        >
          Add
        </button>
      </div>

      {/* Equipment list */}
      <div className="space-y-2">
        {character.equipment?.filter(item => item && typeof item === 'object').map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-3 bg-gray-900 rounded-lg border border-gray-700"
          >
            <input
              type="text"
              value={item.name || ""}
              onChange={(e) => updateItem(index, "name", e.target.value)}
              className="flex-1 px-3 py-1 bg-transparent border-b border-transparent focus:border-gray-600 focus:outline-none"
            />
            <input
              type="number"
              min={1}
              value={item.quantity || 1}
              onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
              className="w-16 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-center focus:border-amber-500 focus:outline-none"
            />
            <button
              onClick={() => removeItem(index)}
              className="p-1 text-gray-500 hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {(!character.equipment || character.equipment.filter(i => i?.name).length === 0) && (
          <p className="text-center py-6 text-gray-500">
            No equipment. Add items above.
          </p>
        )}
      </div>
    </div>
  );
}

function SpellsTab({ character, updateField }: TabProps) {
  // Determine spellcasting ability based on class
  const getSpellcastingAbility = () => {
    const primaryClass = character.class_levels?.[0]?.class.toLowerCase().split("|")[0];
    const abilityMap: Record<string, keyof typeof character.ability_scores> = {
      bard: "charisma",
      cleric: "wisdom",
      druid: "wisdom",
      paladin: "charisma",
      ranger: "wisdom",
      sorcerer: "charisma",
      warlock: "charisma",
      wizard: "intelligence",
    };
    return abilityMap[primaryClass || ""] || "intelligence";
  };

  const spellcastingAbility = getSpellcastingAbility();
  const abilityScore = character.ability_scores[spellcastingAbility];
  const abilityModifier = Math.floor((abilityScore - 10) / 2);
  
  // Calculate proficiency bonus based on total level
  const proficiencyBonus = Math.ceil(1 + character.level / 4);

  const handleSpellsChange = (
    spellsKnown: { cantrips: string[]; spells: string[] },
    preparedSpells: string[]
  ) => {
    updateField("spells_known", spellsKnown);
    updateField("prepared_spells", preparedSpells);
  };

  return (
    <SpellManager
      spellsKnown={character.spells_known || { cantrips: [], spells: [] }}
      preparedSpells={character.prepared_spells || []}
      characterClasses={character.class_levels || []}
      spellcastingAbility={spellcastingAbility}
      abilityModifier={abilityModifier}
      proficiencyBonus={proficiencyBonus}
      onChange={handleSpellsChange}
    />
  );
}

function DescriptionTab({ character, updateField }: TabProps) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Personality Traits
          </label>
          <textarea
            value={character.personality_traits || ""}
            onChange={(e) => updateField("personality_traits", e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-amber-500 focus:outline-none resize-none"
            placeholder="How does your character behave?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Ideals
          </label>
          <textarea
            value={character.ideals || ""}
            onChange={(e) => updateField("ideals", e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-amber-500 focus:outline-none resize-none"
            placeholder="What drives your character?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Bonds
          </label>
          <textarea
            value={character.bonds || ""}
            onChange={(e) => updateField("bonds", e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-amber-500 focus:outline-none resize-none"
            placeholder="What connections matter to your character?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Flaws
          </label>
          <textarea
            value={character.flaws || ""}
            onChange={(e) => updateField("flaws", e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-amber-500 focus:outline-none resize-none"
            placeholder="What are your character's weaknesses?"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          Backstory
        </label>
        <textarea
          value={character.backstory || ""}
          onChange={(e) => updateField("backstory", e.target.value)}
          rows={8}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-amber-500 focus:outline-none resize-none"
          placeholder="Tell your character's story..."
        />
      </div>
    </div>
  );
}
