"use client";

import { useAuth } from "@/components/auth";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Users, 
  Copy, 
  Check, 
  Loader2, 
  Crown, 
  Trash2,
  User,
  Shield,
  Heart,
  Radio,
  Wifi,
  WifiOff
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface Party {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  owner_id: string;
  created_at: string;
}

interface PartyMember {
  id: string;
  character_id: string;
  joined_at: string;
  character: {
    id: string;
    name: string;
    level: number;
    race_key: string;
    class_levels: Array<{ class: string; level: number }>;
    max_hp: number;
    current_hp?: number;
    user_id: string;
  };
}

export default function PartyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [party, setParty] = useState<Party | null>(null);
  const [members, setMembers] = useState<PartyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [removingMember, setRemovingMember] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [recentUpdates, setRecentUpdates] = useState<Set<string>>(new Set());
  const channelRef = useRef<RealtimeChannel | null>(null);

  const partyId = params.id as string;

  const fetchParty = useCallback(async () => {
    if (!user || !partyId) return;

    const supabase = createClient();
    if (!supabase) return;

    try {
      // Fetch party details
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: partyData, error: partyError } = await (supabase.from("parties") as any)
        .select("*")
        .eq("id", partyId)
        .single();

      if (partyError) throw partyError;
      setParty(partyData);

      // Fetch party members with character details
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: membersData, error: membersError } = await (supabase.from("party_members") as any)
        .select(`
          id,
          character_id,
          joined_at,
          character:characters (
            id,
            name,
            level,
            race_key,
            class_levels,
            max_hp,
            current_hp,
            user_id
          )
        `)
        .eq("party_id", partyId);

      if (membersError) throw membersError;
      setMembers(membersData || []);
    } catch (err) {
      console.error("Error fetching party:", err);
    } finally {
      setLoading(false);
    }
  }, [user, partyId]);

  // Setup realtime subscriptions
  useEffect(() => {
    if (!user || !partyId) return;

    const supabase = createClient();
    if (!supabase) return;

    // Subscribe to party member changes
    const channel = supabase
      .channel(`party:${partyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'party_members',
          filter: `party_id=eq.${partyId}`,
        },
        async (payload) => {
          console.log('Party member change:', payload);
          
          if (payload.eventType === 'INSERT') {
            // New member joined - fetch their character data
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data } = await (supabase.from("party_members") as any)
              .select(`
                id,
                character_id,
                joined_at,
                character:characters (
                  id,
                  name,
                  level,
                  race_key,
                  class_levels,
                  max_hp,
                  current_hp,
                  user_id
                )
              `)
              .eq("id", payload.new.id)
              .single();
            
            if (data) {
              setMembers(prev => [...prev, data]);
              // Highlight the new member
              setRecentUpdates(prev => new Set(prev).add(data.id));
              setTimeout(() => {
                setRecentUpdates(prev => {
                  const next = new Set(prev);
                  next.delete(data.id);
                  return next;
                });
              }, 3000);
            }
          } else if (payload.eventType === 'DELETE') {
            // Member left
            setMembers(prev => prev.filter(m => m.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('Party subscription status:', status);
        setIsLive(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    // Also subscribe to character updates for all current members
    const characterIds = members.map(m => m.character_id);
    if (characterIds.length > 0) {
      const charChannel = supabase
        .channel(`party-characters:${partyId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'characters',
          },
          (payload) => {
            // Check if this character is in our party
            const memberId = members.find(m => m.character_id === payload.new.id)?.id;
            if (memberId) {
              console.log('Character update:', payload.new.name);
              // Update the member's character data
              setMembers(prev => prev.map(m => {
                if (m.character_id === payload.new.id) {
                  return {
                    ...m,
                    character: {
                      ...m.character,
                      ...payload.new,
                    }
                  };
                }
                return m;
              }));
              
              // Highlight the updated member
              setRecentUpdates(prev => new Set(prev).add(memberId));
              setTimeout(() => {
                setRecentUpdates(prev => {
                  const next = new Set(prev);
                  next.delete(memberId);
                  return next;
                });
              }, 2000);
            }
          }
        )
        .subscribe();

      // Store for cleanup
      return () => {
        channel.unsubscribe();
        charChannel.unsubscribe();
      };
    }

    return () => {
      channel.unsubscribe();
    };
  }, [user, partyId, members.length]); // Re-subscribe when members change

  useEffect(() => {
    if (user) {
      fetchParty();
    }
  }, [user, fetchParty]);

  const handleCopyCode = async () => {
    if (!party) return;
    await navigator.clipboard.writeText(party.invite_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDeleteParty = async () => {
    if (!party || !confirm("Are you sure you want to delete this party? This cannot be undone.")) {
      return;
    }

    setDeleting(true);
    const supabase = createClient();
    if (!supabase) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("parties") as any)
        .delete()
        .eq("id", party.id);

      if (error) throw error;
      router.push("/parties");
    } catch (err) {
      console.error("Error deleting party:", err);
      alert("Failed to delete party");
      setDeleting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, characterId: string) => {
    const member = members.find(m => m.id === memberId);
    const isOwnCharacter = member?.character.user_id === user?.id;
    const isOwner = party?.owner_id === user?.id;

    if (!isOwnCharacter && !isOwner) {
      alert("You can only remove your own characters");
      return;
    }

    if (!confirm("Remove this character from the party?")) {
      return;
    }

    setRemovingMember(memberId);
    const supabase = createClient();
    if (!supabase) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("party_members") as any)
        .delete()
        .eq("id", memberId);

      if (error) throw error;
      setMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (err) {
      console.error("Error removing member:", err);
      alert("Failed to remove member");
    } finally {
      setRemovingMember(null);
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

  const isOwner = party?.owner_id === user?.id;

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!party) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <h2 className="text-xl font-bold mb-2">Party Not Found</h2>
        <p className="text-gray-400 mb-6">This party doesn&apos;t exist or you don&apos;t have access.</p>
        <Link
          href="/parties"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Parties
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/parties"
            className="inline-flex items-center gap-1 text-gray-400 hover:text-white mb-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Parties
          </Link>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            {party.name}
            {isOwner && (
              <span title="You own this party">
                <Crown className="w-6 h-6 text-amber-500" />
              </span>
            )}
          </h1>
          {party.description && (
            <p className="text-gray-400 mt-2">{party.description}</p>
          )}
        </div>

        {isOwner && (
          <button
            onClick={handleDeleteParty}
            disabled={deleting}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors flex items-center gap-2"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete Party
          </button>
        )}
      </div>

      {/* Live Indicator */}
      <div className={cn(
        "fixed bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all z-50",
        isLive
          ? "bg-green-900/80 text-green-300 border border-green-700"
          : "bg-gray-800/80 text-gray-400 border border-gray-700"
      )}>
        {isLive ? (
          <>
            <Radio className="w-4 h-4 animate-pulse" />
            Live Updates
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            Connecting...
          </>
        )}
      </div>

      {/* Invite Code */}
      <div className="bg-gray-800 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Invite Code</p>
          <p className="text-2xl font-mono font-bold tracking-widest">{party.invite_code}</p>
        </div>
        <button
          onClick={handleCopyCode}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
        >
          {copiedCode ? (
            <>
              <Check className="w-4 h-4 text-green-400" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Code
            </>
          )}
        </button>
      </div>

      {/* Members */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-500" />
          Party Members ({members.length})
          {isLive && (
            <span className="text-xs font-normal text-green-400 flex items-center gap-1">
              <Wifi className="w-3 h-3" />
              Live
            </span>
          )}
        </h2>

        {members.length === 0 ? (
          <div className="bg-gray-800/50 rounded-xl p-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">No members yet. Share the invite code to add characters!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => {
              const isRecentlyUpdated = recentUpdates.has(member.id);
              const hpPercent = member.character.current_hp !== undefined
                ? (member.character.current_hp / member.character.max_hp) * 100
                : 100;
              
              return (
                <div
                  key={member.id}
                  className={cn(
                    "bg-gray-800 rounded-xl p-4 border group transition-all duration-300",
                    isRecentlyUpdated
                      ? "border-amber-500 ring-2 ring-amber-500/20 animate-pulse"
                      : "border-gray-700"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-600/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <h3 className="font-bold">{member.character.name}</h3>
                        <p className="text-sm text-gray-400">Level {member.character.level}</p>
                      </div>
                    </div>
                    
                    {(isOwner || member.character.user_id === user?.id) && (
                      <button
                        onClick={() => handleRemoveMember(member.id, member.character_id)}
                        disabled={removingMember === member.id}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-all"
                        title="Remove from party"
                      >
                        {removingMember === member.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Shield className="w-4 h-4" />
                      <span>{formatRace(member.character.race_key)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <User className="w-4 h-4" />
                      <span>{formatClass(member.character.class_levels)}</span>
                    </div>
                    
                    {/* HP Bar */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1 text-red-400">
                          <Heart className="w-3 h-3" />
                          HP
                        </span>
                        <span className="text-gray-400">
                          {member.character.current_hp ?? member.character.max_hp} / {member.character.max_hp}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all duration-500",
                            hpPercent > 50
                              ? "bg-green-500"
                              : hpPercent > 25
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          )}
                          style={{ width: `${Math.max(0, Math.min(100, hpPercent))}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/characters/${member.character.id}`}
                    className="mt-3 block w-full text-center py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
                  >
                    View Character
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
