import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUserTier = () => {
  const { data: subscription } = useQuery({
    queryKey: ['user-subscription'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { tier: 'free', status: 'none' };
      }

      // Check for admin or tester role first
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'tester'])
        .maybeSingle();

      if (roleData) {
        return { tier: 'agency', status: 'active' };
      }

      const { data } = await supabase
        .from('user_subscriptions')
        .select('tier, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      
      return data || { tier: 'free', status: 'none' };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  return subscription?.tier || 'free';
};
