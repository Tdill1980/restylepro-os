// src/integrations/supabase/renderClient.ts
import { createClient } from '@supabase/supabase-js';

// Lovable Cloud project - has LOVABLE_API_KEY for AI Gateway
const LOVABLE_CLOUD_URL = "https://abgevylqeazbydrtovzp.supabase.co";
const LOVABLE_CLOUD_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiZ2V2eWxxZWF6YnlkcnRvdnpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNzc2MjAsImV4cCI6MjA3ODc1MzYyMH0.Dk43uBRV3a5hSM4No6oIzxE4yQWlGMouGaczj6wgPGY";

export const renderClient = createClient(LOVABLE_CLOUD_URL, LOVABLE_CLOUD_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: false,
    autoRefreshToken: false,
  }
});

// Helper function for invoking render functions
export async function invokeRenderFunction<T = any>(
  functionName: string,
  body: Record<string, any>
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const { data, error } = await renderClient.functions.invoke(functionName, { body });
    if (error) {
      console.error(`Render function error (${functionName}):`, error);
      return { data: null, error };
    }
    return { data, error: null };
  } catch (err: any) {
    console.error(`Render function exception (${functionName}):`, err);
    return { data: null, error: err };
  }
}
