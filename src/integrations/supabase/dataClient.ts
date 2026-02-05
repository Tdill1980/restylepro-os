// src/integrations/supabase/dataClient.ts
// This client ALWAYS connects to the External Supabase (kfapjdyythzyvnpdeghu)
// for all data operations (swatches, colors, visualizations, etc.)
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// External Supabase - where ALL data lives
const EXTERNAL_SUPABASE_URL = "https://kfapjdyythzyvnpdeghu.supabase.co";
const EXTERNAL_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmYXBqZHl5dGh6eXZucGRlZ2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MTQ3MTcsImV4cCI6MjA2MjQ5MDcxN30.9AweNRSqMc-FeE35C_mfTtgDAMxFa9AVi9o-BPR4y8U";

// Data client for all database operations
export const dataClient = createClient<Database>(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Export URL for debugging
export const EXTERNAL_DB_URL = EXTERNAL_SUPABASE_URL;
