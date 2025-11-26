"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Loader2, Users } from "lucide-react";
import Link from "next/link";

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude confusing characters
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function NewPartyPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError("You must be logged in to create a party");
      return;
    }

    if (!name.trim()) {
      setError("Party name is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      if (!supabase) {
        throw new Error("Supabase not configured");
      }

      const inviteCode = generateInviteCode();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: insertError } = await (supabase.from("parties") as any)
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          owner_id: user.id,
          invite_code: inviteCode,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      console.log("Party created:", data);
      router.push("/parties");
    } catch (err: unknown) {
      console.error("Error creating party:", err);
      setError(err instanceof Error ? err.message : "Failed to create party");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/parties"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Parties
        </Link>
        <h1 className="text-3xl font-bold">Create New Party</h1>
        <p className="text-gray-400 mt-2">
          Create a party and invite your friends to join your adventure
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <div className="bg-gray-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-gray-700">
            <div className="w-16 h-16 rounded-xl bg-amber-600/20 flex items-center justify-center">
              <Users className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Party Details</h2>
              <p className="text-gray-400">Set up your adventuring party</p>
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Party Name <span className="text-red-400">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., The Dragon Slayers"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's your party's story? What adventure are you on?"
              rows={4}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none resize-none"
            />
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
          <h3 className="font-medium text-blue-400 mb-2">How it works</h3>
          <ul className="text-sm text-blue-300/80 space-y-1">
            <li>• After creating your party, you'll get an invite code</li>
            <li>• Share the code with friends so they can join</li>
            <li>• Party members can see each other's characters</li>
            <li>• Great for coordinating during game sessions!</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/parties"
            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-center transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="flex-1 px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Party"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
