"use client";

import { useAuth } from "@/components/auth";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Plus, Users, Search, Copy, Check, Loader2, Crown, UserPlus } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

interface Party {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  owner_id: string;
  created_at: string;
  member_count?: number;
}

interface Character {
  id: string;
  name: string;
  race_key: string;
  class_levels: Array<{ class: string; level: number }>;
}

export default function PartiesPage() {
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [parties, setParties] = useState<Party[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const [selectedPartyToJoin, setSelectedPartyToJoin] = useState<Party | null>(null);

  const fetchParties = useCallback(async () => {
    if (!user) return;

    const supabase = createClient();
    if (!supabase) return;

    try {
      // Fetch parties user owns
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: ownedParties, error: ownedError } = await (supabase.from("parties") as any)
        .select("*")
        .eq("owner_id", user.id);

      if (ownedError) throw ownedError;

      // Fetch user's characters first
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: userChars } = await (supabase.from("characters") as any)
        .select("id")
        .eq("user_id", user.id);

      const charIds = userChars?.map((c: { id: string }) => c.id) || [];

      // Fetch parties user is a member of (through their characters)
      let memberParties: Array<{ parties: Party }> = [];
      if (charIds.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error: memberError } = await (supabase.from("party_members") as any)
          .select(`
            party_id,
            parties (*)
          `)
          .in("character_id", charIds);

        if (memberError) throw memberError;
        memberParties = data || [];
      }

      // Combine and dedupe
      const allParties = [...(ownedParties || [])];
      memberParties.forEach((mp) => {
        if (mp.parties && !allParties.find(p => p.id === mp.parties.id)) {
          allParties.push(mp.parties);
        }
      });

      setParties(allParties);
    } catch (err) {
      console.error("Error fetching parties:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchCharacters = useCallback(async () => {
    if (!user) return;

    const supabase = createClient();
    if (!supabase) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from("characters") as any)
        .select("id, name, race_key, class_levels")
        .eq("user_id", user.id);

      if (error) throw error;
      setCharacters(data || []);
    } catch (err) {
      console.error("Error fetching characters:", err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchParties();
      fetchCharacters();
    }
  }, [user, fetchParties, fetchCharacters]);

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleJoinParty = async () => {
    if (joinCode.length !== 6) return;

    setJoining(true);
    setJoinError(null);

    const supabase = createClient();
    if (!supabase) {
      setJoinError("Supabase not configured");
      setJoining(false);
      return;
    }

    try {
      // Find party by invite code
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: party, error: partyError } = await (supabase.from("parties") as any)
        .select("*")
        .eq("invite_code", joinCode.toUpperCase())
        .single();

      if (partyError || !party) {
        setJoinError("Invalid invite code. Please check and try again.");
        setJoining(false);
        return;
      }

      // Check if user has characters
      if (characters.length === 0) {
        setJoinError("You need to create a character first before joining a party.");
        setJoining(false);
        return;
      }

      // Show character selection
      setSelectedPartyToJoin(party);
      setShowCharacterSelect(true);
      setJoining(false);
    } catch (err) {
      console.error("Error joining party:", err);
      setJoinError("Failed to join party. Please try again.");
      setJoining(false);
    }
  };

  const handleSelectCharacter = async (characterId: string) => {
    if (!selectedPartyToJoin) return;

    setJoining(true);
    setJoinError(null);

    const supabase = createClient();
    if (!supabase) return;

    try {
      // Add character to party
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase.from("party_members") as any)
        .insert({
          party_id: selectedPartyToJoin.id,
          character_id: characterId,
        });

      if (insertError) {
        if (insertError.code === "23505") {
          setJoinError("This character is already in the party.");
        } else {
          throw insertError;
        }
        setJoining(false);
        return;
      }

      // Success - refresh parties and close modals
      setShowJoinModal(false);
      setShowCharacterSelect(false);
      setJoinCode("");
      setSelectedPartyToJoin(null);
      await fetchParties();
    } catch (err) {
      console.error("Error adding character to party:", err);
      setJoinError("Failed to join party. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  const filteredParties = parties.filter(party =>
    party.name.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-3xl font-bold text-white">Parties</h1>
          <p className="text-gray-400 mt-1">
            Manage your adventuring parties
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowJoinModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Join Party
          </button>
          <Link
            href="/parties/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Party
          </Link>
        </div>
      </div>

      {/* Search */}
      {parties.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search parties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>
      )}

      {/* Parties Grid */}
      {filteredParties.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h2 className="text-xl font-bold mb-2">No Parties Yet</h2>
          <p className="text-gray-400 mb-6">
            Create a party to adventure with friends, or join one with an invite code
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setShowJoinModal(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Join with Code
            </button>
            <Link
              href="/parties/new"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Party
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParties.map((party) => (
            <div
              key={party.id}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-amber-600/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{party.name}</h3>
                    {party.owner_id === user?.id && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-500">
                        <Crown className="w-3 h-3" />
                        Owner
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {party.description && (
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {party.description}
                </p>
              )}

              {/* Invite Code */}
              {party.owner_id === user?.id && (
                <div className="bg-gray-700/50 rounded-lg p-3 mb-4">
                  <div className="text-xs text-gray-400 mb-1">Invite Code</div>
                  <div className="flex items-center justify-between">
                    <code className="font-mono text-lg tracking-wider text-amber-400">
                      {party.invite_code}
                    </code>
                    <button
                      onClick={() => handleCopyCode(party.invite_code)}
                      className="p-2 hover:bg-gray-600 rounded transition-colors"
                      title="Copy invite code"
                    >
                      {copiedCode === party.invite_code ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <Link
                href={`/parties/${party.id}`}
                className="block w-full text-center py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
              >
                View Party
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Join Party Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            {!showCharacterSelect ? (
              <>
                <h2 className="text-xl font-bold mb-4">Join a Party</h2>
                <p className="text-gray-400 mb-4">
                  Enter the 6-character invite code shared by the party leader
                </p>
                
                {joinError && (
                  <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 text-sm mb-4">
                    {joinError}
                  </div>
                )}

                <input
                  type="text"
                  placeholder="XXXXXX"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                  maxLength={6}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-center text-2xl font-mono tracking-widest"
                />
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowJoinModal(false);
                      setJoinCode("");
                      setJoinError(null);
                    }}
                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleJoinParty}
                    disabled={joinCode.length !== 6 || joining}
                    className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {joining ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Join"
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4">Select a Character</h2>
                <p className="text-gray-400 mb-4">
                  Choose which character to add to <strong>{selectedPartyToJoin?.name}</strong>
                </p>

                {joinError && (
                  <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 text-sm mb-4">
                    {joinError}
                  </div>
                )}

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {characters.map((character) => (
                    <button
                      key={character.id}
                      onClick={() => handleSelectCharacter(character.id)}
                      disabled={joining}
                      className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors disabled:opacity-50"
                    >
                      <div className="font-medium">{character.name}</div>
                      <div className="text-sm text-gray-400">
                        {character.race_key.split("|")[0].replace(/-/g, " ")} {" "}
                        {character.class_levels[0]?.class.split("|")[0].replace(/-/g, " ")} {character.class_levels[0]?.level}
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setShowCharacterSelect(false);
                    setSelectedPartyToJoin(null);
                    setJoinError(null);
                  }}
                  className="w-full mt-4 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Back
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
