/**
 * External Database Connection
 *
 * When edge functions run on Lovable Cloud (abgevylqeazbydrtovzp),
 * they need to connect to the EXTERNAL Supabase (kfapjdyythzyvnpdeghu)
 * for data operations.
 *
 * Set these secrets on Lovable Cloud:
 * - EXTERNAL_SUPABASE_URL = https://kfapjdyythzyvnpdeghu.supabase.co
 * - EXTERNAL_SUPABASE_SERVICE_ROLE_KEY = [your service role key]
 * - EXTERNAL_SUPABASE_ANON_KEY = [your anon key]
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Get the external Supabase URL (for data operations)
export function getExternalSupabaseUrl(): string {
  return Deno.env.get('EXTERNAL_SUPABASE_URL') || Deno.env.get('SUPABASE_URL')!;
}

// Get the external Supabase service role key
export function getExternalServiceRoleKey(): string {
  return Deno.env.get('EXTERNAL_SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
}

// Get the external Supabase anon key
export function getExternalAnonKey(): string {
  return Deno.env.get('EXTERNAL_SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_ANON_KEY')!;
}

// Create a Supabase client connected to the EXTERNAL database
export function createExternalClient() {
  const url = getExternalSupabaseUrl();
  const key = getExternalServiceRoleKey();

  console.log(`📊 Connecting to external database: ${url.substring(0, 30)}...`);

  return createClient(url, key);
}

// Create a Supabase client with anon key (for public operations)
export function createExternalAnonClient() {
  const url = getExternalSupabaseUrl();
  const key = getExternalAnonKey();

  return createClient(url, key);
}
