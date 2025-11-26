"use client";

import { useAuth } from "@/components/auth";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Loader2, 
  User,
  Shield,
  Heart,
  Swords,
  Brain,
  Zap,
  Eye,
  MessageCircle,
  Scroll,
  Package,
  Sparkles
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";

interface Character {
  id: string;
  name: string;
  level: number;
  race_key: string;
  subrace_key: string | null;
  class_levels: Array<{ class: string; level: number }>;
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
  skill_proficiencies: string[];
  equipment: Array<{ name: string; quantity: number }>;
  spells_known: { cantrips: string[]; spells: string[] };
  personality_traits: string | null;
  ideals: string | null;
  bonds: string | null;
  flaws: string | null;
  backstory: string | null;
  user_id: string;
  created_at: string;
}

export default function CharacterDetailPage() {
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);

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
      setCharacter(data);
    } catch (err) {
      console.error("Error fetching character:", err);
    } finally {
      setLoading(false);
    }
  }, [user, characterId]);

  useEffect(() => {
    if (user) {
      fetchCharacter();
    }
  }, [user, fetchCharacter]);

  const formatRace = (raceKey: string) => {
    return raceKey.split("|")[0].replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatClass = (classLevels: Array<{ class: string; level: number }>) => {
    if (!classLevels || classLevels.length === 0) return "Unknown";
    return classLevels
      .map(cl => `${cl.class.split("|")[0].replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())} ${cl.level}`)
      .join(" / ");
  };

  const formatBackground = (bgKey: string) => {
    return bgKey.split("|")[0].replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const abilityIcons: Record<string, React.ReactNode> = {
    strength: <Swords className="w-5 h-5" />,
    dexterity: <Zap className="w-5 h-5" />,
    constitution: <Shield className="w-5 h-5" />,
    intelligence: <Brain className="w-5 h-5" />,
    wisdom: <Eye className="w-5 h-5" />,
    charisma: <MessageCircle className="w-5 h-5" />,
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

  const isOwner = character.user_id === user?.id;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/characters"
            className="inline-flex items-center gap-1 text-gray-400 hover:text-white mb-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Characters
          </Link>
          <h1 className="text-3xl font-bold text-white">{character.name}</h1>
          <p className="text-gray-400 mt-1">
            Level {character.level} {formatRace(character.race_key)} {formatClass(character.class_levels)}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Background: {formatBackground(character.background_key)}
          </p>
        </div>

        {isOwner && (
          <Link
            href={`/characters/${character.id}/edit`}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
          >
            Edit Character
          </Link>
        )}
      </div>

      {/* HP Bar */}
      <div className="bg-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="font-bold">Hit Points</span>
          </div>
          <span className="text-lg">
            <span className="text-red-400">{character.current_hp}</span>
            <span className="text-gray-500"> / {character.max_hp}</span>
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-red-500 h-3 rounded-full transition-all"
            style={{ width: `${Math.max(0, Math.min(100, (character.current_hp / character.max_hp) * 100))}%` }}
          />
        </div>
      </div>

      {/* Ability Scores */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-500" />
          Ability Scores
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {Object.entries(character.ability_scores).map(([ability, score]) => (
            <div key={ability} className="bg-gray-700 rounded-lg p-3 text-center">
              <div className="flex justify-center mb-1 text-amber-500">
                {abilityIcons[ability]}
              </div>
              <div className="text-xs text-gray-400 uppercase mb-1">
                {ability.slice(0, 3)}
              </div>
              <div className="text-2xl font-bold">{score}</div>
              <div className="text-sm text-gray-400">{getModifier(score)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      {character.skill_proficiencies && character.skill_proficiencies.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-4">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Scroll className="w-5 h-5 text-amber-500" />
            Skill Proficiencies
          </h2>
          <div className="flex flex-wrap gap-2">
            {character.skill_proficiencies.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-gray-700 rounded-full text-sm capitalize"
              >
                {skill.replace(/-/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Spells */}
      {character.spells_known && (character.spells_known.cantrips?.length > 0 || character.spells_known.spells?.length > 0) && (
        <div className="bg-gray-800 rounded-xl p-4">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Spells Known
          </h2>
          
          {character.spells_known.cantrips?.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Cantrips</h3>
              <div className="flex flex-wrap gap-2">
                {character.spells_known.cantrips.map((spell) => (
                  <span key={spell} className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm">
                    {spell.split("|")[0]}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {character.spells_known.spells?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Spells</h3>
              <div className="flex flex-wrap gap-2">
                {character.spells_known.spells.map((spell) => (
                  <span key={spell} className="px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full text-sm">
                    {spell.split("|")[0]}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Equipment */}
      {character.equipment && character.equipment.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-4">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-500" />
            Equipment
          </h2>
          <div className="grid md:grid-cols-2 gap-2">
            {character.equipment.map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-700 rounded-lg px-3 py-2">
                <span>{item.name}</span>
                {item.quantity > 1 && (
                  <span className="text-gray-400 text-sm">×{item.quantity}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Backstory & Personality */}
      {(character.personality_traits || character.ideals || character.bonds || character.flaws || character.backstory) && (
        <div className="bg-gray-800 rounded-xl p-4">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-amber-500" />
            Character Details
          </h2>
          
          <div className="space-y-4">
            {character.personality_traits && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-1">Personality Traits</h3>
                <p className="text-gray-200">{character.personality_traits}</p>
              </div>
            )}
            {character.ideals && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-1">Ideals</h3>
                <p className="text-gray-200">{character.ideals}</p>
              </div>
            )}
            {character.bonds && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-1">Bonds</h3>
                <p className="text-gray-200">{character.bonds}</p>
              </div>
            )}
            {character.flaws && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-1">Flaws</h3>
                <p className="text-gray-200">{character.flaws}</p>
              </div>
            )}
            {character.backstory && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-1">Backstory</h3>
                <p className="text-gray-200 whitespace-pre-wrap">{character.backstory}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
