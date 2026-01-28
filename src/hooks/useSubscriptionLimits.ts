import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const RENDER_LIMITS: Record<string, number> = {
  starter: 10,
  advanced: 50,
  complete: 200,
  agency: 999999,
  free: 0
};

interface Subscription {
  id: string;
  tier: string;
  status: string;
  render_count: number;
  stripe_subscription_item_extra: string | null;
  render_reset_date: string | null;
  billing_cycle_start: string;
  billing_cycle_end: string;
}

export const useSubscriptionLimits = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSubscription();
    
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        checkSubscription();
      }
      if (event === 'SIGNED_OUT') {
        setSubscription(null);
        setLoading(false);
      }
    });
    
    return () => authSub.unsubscribe();
  }, []);

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Check for admin or tester role - grants unlimited access
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'tester'])
        .limit(1)
        .maybeSingle();

      if (roleError) {
        console.error('Error checking admin/tester role:', roleError);
      }

      if (roleData) {
        // Admin/tester gets unlimited access
        setSubscription({
          id: 'admin-unlimited',
          tier: 'agency',
          status: 'active',
          render_count: 0,
          stripe_subscription_item_extra: null,
          render_reset_date: null,
          billing_cycle_start: new Date().toISOString(),
          billing_cycle_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        });
        setLoading(false);
        return;
      }

      const { data, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (subError) {
        console.error('Error fetching subscription:', subError);
      }

      setSubscription(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkCanGenerate = async (): Promise<boolean> => {
    // No subscription = use freemium funnel (handled elsewhere)
    if (!subscription) {
      return true; // Let freemium handle it
    }

    // Admins/testers bypass all limits
    if (subscription.tier === 'agency') {
      return true;
    }

    const limit = RENDER_LIMITS[subscription.tier as keyof typeof RENDER_LIMITS] || 0;
    const currentCount = subscription.render_count || 0;

    if (currentCount >= limit) {
      if (subscription.stripe_subscription_item_extra) {
        try {
          const { error } = await supabase.functions.invoke('report-extra-render', {
            body: { subscription_item_id: subscription.stripe_subscription_item_extra }
          });
          if (error) {
            toast.error('Failed to track usage');
            return false;
          }
          toast.info('Extra render ($5) will be added to your next invoice');
        } catch (error) {
          return false;
        }
      } else {
        toast.error(`Monthly limit of ${limit} renders reached`);
        return false;
      }
    }

    return true;
  };

  const incrementRenderCount = async () => {
    if (!subscription || subscription.tier === 'agency') return;

    try {
      const newCount = (subscription.render_count || 0) + 1;
      
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ render_count: newCount } as any)
        .eq('id', subscription.id);

      if (!error) {
        setSubscription({ ...subscription, render_count: newCount });
      }
    } catch (error) {
      console.error('Error updating render count:', error);
    }
  };

  return {
    subscription,
    loading,
    checkCanGenerate,
    incrementRenderCount,
    refetch: checkSubscription
  };
};
