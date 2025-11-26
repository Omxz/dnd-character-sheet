import { createBrowserClient, type SupabaseClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

// Check for environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let supabaseClient: SupabaseClient<Database> | null = null;

export function createClient(): SupabaseClient<Database> | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== "undefined") {
      console.warn(
        "Supabase environment variables are not set. " +
        "Copy .env.local.example to .env.local and fill in your Supabase credentials."
      );
    }
    return null;
  }
  
  if (!supabaseClient) {
    supabaseClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  
  return supabaseClient;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}
