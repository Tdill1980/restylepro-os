import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RevisionHistoryItem {
  id: string;
  user_id: string;
  tool: string;
  design_id: string | null;
  view_type: string;
  original_url: string | null;
  revised_url: string;
  revision_prompt: string;
  created_at: string;
}

export function useRevisionHistory(tool: string) {
  const [revisionHistory, setRevisionHistory] = useState<RevisionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load revision history for current user and tool
  const loadHistory = useCallback(async (designId?: string) => {
    setIsLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) {
        setRevisionHistory([]);
        return;
      }

      let query = supabase
        .from('design_revision_history')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('tool', tool)
        .order('created_at', { ascending: false })
        .limit(20);

      if (designId) {
        query = query.eq('design_id', designId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to load revision history:', error);
        setRevisionHistory([]);
        return;
      }

      setRevisionHistory(data || []);
    } catch (error) {
      console.error('Error loading revision history:', error);
      setRevisionHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [tool]);

  // Save a new revision to history
  const saveRevision = useCallback(async ({
    viewType,
    originalUrl,
    revisedUrl,
    revisionPrompt,
    designId
  }: {
    viewType: string;
    originalUrl: string | null;
    revisedUrl: string;
    revisionPrompt: string;
    designId?: string;
  }) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) {
        console.warn('No user logged in, cannot save revision');
        return null;
      }

      const { data, error } = await supabase
        .from('design_revision_history')
        .insert({
          user_id: userData.user.id,
          tool,
          design_id: designId || null,
          view_type: viewType,
          original_url: originalUrl,
          revised_url: revisedUrl,
          revision_prompt: revisionPrompt
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to save revision:', error);
        return null;
      }

      // Add to local state
      setRevisionHistory(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error saving revision:', error);
      return null;
    }
  }, [tool]);

  // Clear local history (for UI reset)
  const clearHistory = useCallback(() => {
    setRevisionHistory([]);
  }, []);

  return {
    revisionHistory,
    isLoading,
    loadHistory,
    saveRevision,
    clearHistory
  };
}
