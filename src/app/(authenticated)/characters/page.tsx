"use client";

import { useAuth } from "@/components/auth";
import Link from "next/link";
import { Plus, Scroll, Search } from "lucide-react";
import { useState } from "react";

export default function CharactersPage() {
  const { loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // TODO: Fetch characters from Supabase
  const characters: unknown[] = [];

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

      {/* Characters Grid */}
      {characters.length === 0 ? (
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
          {/* Character cards will go here */}
        </div>
      )}
    </div>
  );
}
