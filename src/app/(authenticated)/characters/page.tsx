"use client";

import { useAuth } from "@/components/auth";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Plus, Scroll, Search, Loader2, User, Trash2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

interface Character {
  id: string;
  name: string;
  level: number;
  race_key: string;
  subrace_key: string | null;
  class_levels: Array<{ class: string; level: number }>;
  background_key: string;
  max_hp: number;
  created_at: string;
}

export default function CharactersPage() {
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchCharacters = useCallback(async () => {
    if (!user) return;

    const supabase = createClient();
    if (!supabase) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from("characters") as any)
        .select("id, name, level, race_key, subrace_key, class_levels, background_key, max_hp, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCharacters(data || []);
    } catch (err) {
      console.error("Error fetching characters:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchCharacters();
    }
  }, [user, fetchCharacters]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this character? This cannot be undone.")) {
      return;
    }

    setDeleting(id);
    const supabase = createClient();
    if (!supabase) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("characters") as any)
        .delete()
        .eq("id", id);

      if (error) throw error;
      setCharacters(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error("Error deleting character:", err);
      alert("Failed to delete character");
    } finally {
      setDeleting(null);
    }
  };

  const formatRace = (raceKey: string) => {
    return raceKey.split("|")[0].replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatClass = (classLevels: Array<{ class: string; level: number }>) => {
    if (!classLevels || classLevels.length === 0) return "Unknown";
    return classLevels
      .map(cl => `${cl.class.split("|")[0].replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())} ${cl.level}`)
      .join(" / ");
  };

  const filteredCharacters = characters.filter(character =>
    character.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">My Characters</h1>
          <p className="text-gray-400 mt-1">
            Manage your adventurers
          </p>
        </div>
        <Link
          href="/characters/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Character
        </Link>
      </div>

      {/* Search */}
      {characters.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search characters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>
      )}

      {/* Characters Grid */}
      {filteredCharacters.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-12 text-center">
          <Scroll className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h2 className="text-xl font-bold mb-2">No Characters Yet</h2>
          <p className="text-gray-400 mb-6">
            Create your first character to begin your adventure
          </p>
          <Link
            href="/characters/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Character
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCharacters.map((character) => (
            <div
              key={character.id}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-amber-600/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{character.name}</h3>
                    <p className="text-sm text-gray-400">Level {character.level}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(character.id)}
                  disabled={deleting === character.id}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-all"
                  title="Delete character"
                >
                  {deleting === character.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Race</span>
                  <span>{formatRace(character.race_key)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Class</span>
                  <span>{formatClass(character.class_levels)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">HP</span>
                  <span className="text-red-400">{character.max_hp}</span>
                </div>
              </div>

              <Link
                href={`/characters/${character.id}`}
                className="block w-full text-center py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
              >
                View Character
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
