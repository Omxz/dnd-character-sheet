"use client";

import type { StepProps } from "../types";
import { User, Heart, Shield, Skull, BookOpen } from "lucide-react";

export function DescriptionStep({ data, updateData }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Character Description</h2>
        <p className="text-gray-400">
          Give your character a name and describe their personality, ideals, bonds, and flaws.
        </p>
      </div>

      {/* Character Name */}
      <div className="bg-gray-800 rounded-lg p-4">
        <label className="flex items-center gap-2 font-medium mb-3">
          <User className="w-5 h-5 text-amber-500" />
          Character Name
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => updateData({ name: e.target.value })}
          placeholder="Enter your character's name..."
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-lg focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Personality Traits */}
      <div className="bg-gray-800 rounded-lg p-4">
        <label className="flex items-center gap-2 font-medium mb-3">
          <Heart className="w-5 h-5 text-red-400" />
          Personality Traits
        </label>
        <textarea
          value={data.personality_traits}
          onChange={(e) => updateData({ personality_traits: e.target.value })}
          placeholder="How does your character typically behave? What quirks do they have?"
          rows={3}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg resize-none focus:outline-none focus:border-amber-500"
        />
        <p className="text-xs text-gray-500 mt-2">
          Example: I&apos;m always polite and respectful. I&apos;ve read every book in the world&apos;s greatest library.
        </p>
      </div>

      {/* Ideals */}
      <div className="bg-gray-800 rounded-lg p-4">
        <label className="flex items-center gap-2 font-medium mb-3">
          <Shield className="w-5 h-5 text-blue-400" />
          Ideals
        </label>
        <textarea
          value={data.ideals}
          onChange={(e) => updateData({ ideals: e.target.value })}
          placeholder="What principles guide your character? What do they believe in?"
          rows={2}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg resize-none focus:outline-none focus:border-amber-500"
        />
        <p className="text-xs text-gray-500 mt-2">
          Example: Knowledge. The path to power and self-improvement is through knowledge.
        </p>
      </div>

      {/* Bonds */}
      <div className="bg-gray-800 rounded-lg p-4">
        <label className="flex items-center gap-2 font-medium mb-3">
          <Heart className="w-5 h-5 text-purple-400" />
          Bonds
        </label>
        <textarea
          value={data.bonds}
          onChange={(e) => updateData({ bonds: e.target.value })}
          placeholder="What connections does your character have? What do they care about most?"
          rows={2}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg resize-none focus:outline-none focus:border-amber-500"
        />
        <p className="text-xs text-gray-500 mt-2">
          Example: I have an ancient text that holds terrible secrets that must not fall into the wrong hands.
        </p>
      </div>

      {/* Flaws */}
      <div className="bg-gray-800 rounded-lg p-4">
        <label className="flex items-center gap-2 font-medium mb-3">
          <Skull className="w-5 h-5 text-yellow-400" />
          Flaws
        </label>
        <textarea
          value={data.flaws}
          onChange={(e) => updateData({ flaws: e.target.value })}
          placeholder="What are your character's weaknesses? What could be used against them?"
          rows={2}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg resize-none focus:outline-none focus:border-amber-500"
        />
        <p className="text-xs text-gray-500 mt-2">
          Example: I am easily distracted by the promise of information. Unlocking an ancient mystery is worth the price of a civilization.
        </p>
      </div>

      {/* Backstory */}
      <div className="bg-gray-800 rounded-lg p-4">
        <label className="flex items-center gap-2 font-medium mb-3">
          <BookOpen className="w-5 h-5 text-green-400" />
          Backstory
        </label>
        <textarea
          value={data.backstory}
          onChange={(e) => updateData({ backstory: e.target.value })}
          placeholder="Tell your character's story. Where did they come from? What shaped them? Why are they adventuring?"
          rows={6}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg resize-none focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Tips */}
      <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-4">
        <h4 className="font-medium text-amber-400 mb-2">Tips for a great backstory</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Consider how your race, class, and background connect</li>
          <li>• Include at least one important NPC from your past</li>
          <li>• Give your character a goal or motivation for adventuring</li>
          <li>• Leave some mysteries for the DM to explore</li>
        </ul>
      </div>
    </div>
  );
}
