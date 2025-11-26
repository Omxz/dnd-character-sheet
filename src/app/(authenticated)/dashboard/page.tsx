"use client";

import { useAuth } from "@/components/auth";
import { DiceRoller } from "@/components/dice";
import Link from "next/link";
import { Plus, Scroll, Users, Dices } from "lucide-react";

export default function DashboardPage() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {profile?.display_name || profile?.email?.split("@")[0] || "Adventurer"}!
        </h1>
        <p className="text-gray-400 mt-2">
          Ready for your next adventure?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link
          href="/characters/new"
          className="bg-amber-600 hover:bg-amber-700 rounded-xl p-6 transition-colors group"
        >
          <Plus className="w-8 h-8 mb-4" />
          <h3 className="text-xl font-bold mb-2">Create Character</h3>
          <p className="text-amber-100">
            Start a new adventure with a fresh character
          </p>
        </Link>

        <Link
          href="/characters"
          className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 transition-colors"
        >
          <Scroll className="w-8 h-8 mb-4 text-amber-500" />
          <h3 className="text-xl font-bold mb-2">My Characters</h3>
          <p className="text-gray-400">
            View and manage your existing characters
          </p>
        </Link>

        <Link
          href="/parties"
          className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 transition-colors"
        >
          <Users className="w-8 h-8 mb-4 text-amber-500" />
          <h3 className="text-xl font-bold mb-2">Parties</h3>
          <p className="text-gray-400">
            Join or create adventuring parties
          </p>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Characters */}
        <div className="bg-gray-800/50 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Scroll className="w-5 h-5 text-amber-500" />
            Recent Characters
          </h2>
          <div className="text-gray-400 text-center py-8">
            <Scroll className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No characters yet</p>
            <Link
              href="/characters/new"
              className="inline-block mt-4 text-amber-500 hover:text-amber-400"
            >
              Create your first character →
            </Link>
          </div>
        </div>

        {/* Dice Roller */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Dices className="w-5 h-5 text-amber-500" />
            Quick Roll
          </h2>
          <DiceRoller />
        </div>
      </div>
    </div>
  );
}
