import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "restylepro-freemium";
const FREE_LIMIT = 2;
const BONUS_LIMIT = 2;

interface FreemiumState {
  generationCount: number;
  bonusUnlocked: boolean;
  bonusEmail: string | null;
}

type FreemiumPhase = 'free' | 'engagement' | 'bonus' | 'paywall';

export const useFreemiumLimits = () => {
  const [state, setState] = useState<FreemiumState>({
    generationCount: 0,
    bonusUnlocked: false,
    bonusEmail: null,
  });
  const [isPrivileged, setIsPrivileged] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setState(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse freemium state:", e);
      }
    }
    checkPrivilegedAccess();
  }, []);

  // Check if user is admin or tester
  const checkPrivilegedAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .in('role', ['admin', 'tester']);
        
        if (roles && roles.length > 0) {
          setIsPrivileged(true);
        }
      }
    } catch (e) {
      console.error("Failed to check privileged access:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Save state to localStorage
  const saveState = (newState: FreemiumState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    setState(newState);
  };

  // Calculate current phase
  const getPhase = (): FreemiumPhase => {
    if (isPrivileged) return 'free';
    
    const { generationCount, bonusUnlocked } = state;
    
    if (generationCount < FREE_LIMIT) {
      return 'free';
    }
    
    if (!bonusUnlocked) {
      return 'engagement';
    }
    
    if (generationCount < FREE_LIMIT + BONUS_LIMIT) {
      return 'bonus';
    }
    
    return 'paywall';
  };

  const phase = getPhase();

  // Can user generate? (privileged users bypass, others follow freemium)
  const canGenerate = isPrivileged || phase === 'free' || phase === 'bonus';

  // Remaining renders
  const remainingFree = Math.max(0, FREE_LIMIT - state.generationCount);
  const remainingBonus = state.bonusUnlocked 
    ? Math.max(0, FREE_LIMIT + BONUS_LIMIT - state.generationCount) 
    : 0;
  const totalRemaining = isPrivileged ? 999 : (remainingFree > 0 ? remainingFree : remainingBonus);

  // Increment generation count
  const incrementGeneration = useCallback(() => {
    if (isPrivileged) return;
    
    const newState = {
      ...state,
      generationCount: state.generationCount + 1,
    };
    saveState(newState);
  }, [state, isPrivileged]);

  // Unlock bonus renders (called after social share + email signup)
  const unlockBonus = useCallback(async (email: string) => {
    try {
      // Save to database
      await supabase.from('email_subscribers').insert({
        email,
        source: 'freemium_funnel',
        social_shared: true,
        renders_unlocked: true,
      });

      // Update local state
      const newState = {
        ...state,
        bonusUnlocked: true,
        bonusEmail: email,
      };
      saveState(newState);
      
      return { success: true };
    } catch (error: any) {
      // If email already exists, still unlock bonus locally
      if (error.code === '23505') {
        const newState = {
          ...state,
          bonusUnlocked: true,
          bonusEmail: email,
        };
        saveState(newState);
        return { success: true };
      }
      console.error("Failed to unlock bonus:", error);
      return { success: false, error: error.message };
    }
  }, [state]);

  // Reset (for testing)
  const resetFreemium = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      generationCount: 0,
      bonusUnlocked: false,
      bonusEmail: null,
    });
  }, []);

  return {
    canGenerate,
    phase,
    isPrivileged,
    isLoading,
    generationCount: state.generationCount,
    remainingFree,
    remainingBonus,
    totalRemaining,
    bonusUnlocked: state.bonusUnlocked,
    incrementGeneration,
    unlockBonus,
    resetFreemium,
  };
};
