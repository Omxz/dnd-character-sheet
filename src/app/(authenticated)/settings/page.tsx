"use client";

import { useAuth } from "@/components/auth";
import { useState } from "react";
import { User, Volume2, VolumeX, Save, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { profile, updateProfile, loading } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [soundEnabled, setSoundEnabled] = useState(profile?.sound_enabled ?? true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({
      display_name: displayName || null,
      sound_enabled: soundEnabled,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Section */}
      <section className="bg-gray-800/50 rounded-xl p-6 space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <User className="w-5 h-5 text-amber-500" />
          Profile
        </h2>

        <div>
          <label className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            value={profile?.email || ""}
            disabled
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg opacity-50 cursor-not-allowed"
          />
          <p className="text-sm text-gray-500 mt-1">
            Email cannot be changed
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your display name"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>
      </section>

      {/* Preferences Section */}
      <section className="bg-gray-800/50 rounded-xl p-6 space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          {soundEnabled ? (
            <Volume2 className="w-5 h-5 text-amber-500" />
          ) : (
            <VolumeX className="w-5 h-5 text-amber-500" />
          )}
          Preferences
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Dice Sound Effects</p>
            <p className="text-sm text-gray-400">
              Play sounds when rolling dice
            </p>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              soundEnabled ? "bg-amber-600" : "bg-gray-600"
            }`}
          >
            <span
              className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                soundEnabled ? "left-7" : "left-1"
              }`}
            />
          </button>
        </div>
      </section>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center justify-center gap-2 w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg transition-colors font-medium"
      >
        {saving ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : saved ? (
          <>
            <Save className="w-5 h-5" />
            Saved!
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            Save Changes
          </>
        )}
      </button>
    </div>
  );
}
