import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PricingCard } from "@/components/PricingCard";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AddToAppCartButton } from "@/components/AddToAppCartButton";

const PRICE_IDS = {
  starter: "price_1SWJgDH1V6OhfCAPSCR5VbT2",   // $24
  advanced: "price_1SWNNuH1V6OhfCAPDChwyuAX", // $59
  complete: "price_1SWO9QH1V6OhfCAPjqYLT7Ko"  // $129
};

const Pricing = () => {
  const navigate = useNavigate();
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      setCurrentSubscription(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleSubscribe = async (tier: 'starter' | 'advanced' | 'complete') => {
    setCheckoutLoading(tier);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to subscribe');
        window.location.assign('/login');
        setCheckoutLoading(null);
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: PRICE_IDS[tier] }
      });

      if (error) {
        toast.error('Unable to start checkout');
        setCheckoutLoading(null);
        return;
      }

      if (!data?.url) {
        toast.error('Unable to start checkout');
        setCheckoutLoading(null);
        return;
      }

      // Open in new tab to avoid iframe restrictions in preview
      window.open(data.url, '_blank');
      setCheckoutLoading(null);
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast.error('Unable to start checkout');
      setCheckoutLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-billing-portal');

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Error opening billing portal:', error);
      toast.error(error.message || 'Failed to open billing portal');
    } finally {
      setLoading(false);
    }
  };

  const starterFeatures = [
    "10 renders per month",
    "Access to ColorPro™ tool",
    "Standard quality renders",
    "Unwatermarked images",
    "Email support",
    "$5 per extra render"
  ];

  const professionalFeatures = [
    "50 renders per month",
    "Everything in Starter",
    "Access to FadeWraps™ & WBTY™",
    "High-resolution renders",
    "Client sharing capabilities",
    "Priority render queue",
    "Advanced presentation tools",
    "$5 per extra render"
  ];

  const businessFeatures = [
    "200 renders per month",
    "Everything in Professional",
    "Full DesignProAI™ Suite access",
    "DesignPanelPro™ & ApproveMode™",
    "Batch generation capabilities",
    "Custom branding options",
    "Priority support",
    "API access (coming soon)",
    "Team collaboration features",
    "$5 per extra render"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <span className="text-foreground">Choose Your Plan & Start Creating Now</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Professional 3D wrap visualization tools for WPWRestylePro™
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground mt-6">
              <span className="flex items-center gap-2">✔ No contracts</span>
              <span className="flex items-center gap-2">✔ Real-time photorealistic wrap previews</span>
              <span className="flex items-center gap-2">✔ Change plans anytime</span>
            </div>
          </div>

          {currentSubscription && (
            <div className="text-center mb-8">
              <div className="inline-block bg-muted p-4 rounded-lg mb-4">
                <p className="text-sm text-muted-foreground mb-2">Current Plan: <strong className="text-foreground">{currentSubscription.tier}</strong></p>
                <p className="text-xs text-muted-foreground">Renders used: {currentSubscription.render_count || 0}</p>
              </div>
              <div>
                <Button 
                  onClick={handleManageSubscription}
                  disabled={loading}
                  variant="outline"
                >
                  Manage Subscription
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto">
            <PricingCard
              title="Restyle Starter"
              price={24}
              features={starterFeatures}
              tagline="Perfect for installers needing 10 designs/month. Upgrade anytime."
              onSubscribe={() => handleSubscribe('starter')}
              isCurrentPlan={currentSubscription?.tier === 'starter'}
              loading={checkoutLoading === 'starter'}
            />
            
            <PricingCard
              title="Restyle Professional"
              price={59}
              features={professionalFeatures}
              tagline="Most Popular — best for daily design workflows with 50 renders/month."
              isPopular={true}
              onSubscribe={() => handleSubscribe('advanced')}
              isCurrentPlan={currentSubscription?.tier === 'advanced'}
              loading={checkoutLoading === 'advanced'}
            />
            
            <PricingCard
              title="Pro Shop"
              price={129}
              features={businessFeatures}
              tagline="For high-volume shops. 200+ renders/month. Priority queue. Batch tools."
              onSubscribe={() => handleSubscribe('complete')}
              isCurrentPlan={currentSubscription?.tier === 'complete'}
              loading={checkoutLoading === 'complete'}
            />
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-6">DesignProAI™ Suite Tools:</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 max-w-5xl mx-auto">
              <div className="p-6 border border-border rounded-lg bg-card">
                <h3 className="font-semibold mb-2">
                  <span className="text-foreground">Ink</span>
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">Fusion™</span>
                </h3>
                <p className="text-sm text-muted-foreground">50+ premium colors with finish options</p>
              </div>
              
              <div className="p-6 border border-border rounded-lg bg-card">
                <h3 className="font-semibold mb-2">
                  <span className="text-foreground">DesignPanel</span>
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">Pro™</span>
                </h3>
                <p className="text-sm text-muted-foreground">Custom panel design library</p>
              </div>
              
              <div className="p-6 border border-border rounded-lg bg-card">
                <h3 className="font-semibold mb-2">
                  <span className="text-foreground">Fade</span>
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">Wraps™</span>
                </h3>
                <p className="text-sm text-muted-foreground">Gradient designs with custom direction</p>
              </div>
              
              <div className="p-6 border border-border rounded-lg bg-card">
                <h3 className="font-semibold mb-2">
                  <span className="text-foreground">WBTY</span>
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">™</span>
                </h3>
                <p className="text-sm text-muted-foreground">92+ patterns with scale control</p>
              </div>
              
              <div className="p-6 border border-border rounded-lg bg-card">
                <h3 className="font-semibold mb-2">
                  <span className="text-foreground">Approve</span>
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">Mode</span>
                </h3>
                <p className="text-sm text-muted-foreground">Before/after comparison tools</p>
              </div>
            </div>
          </div>

          <div className="mt-16 max-w-3xl mx-auto space-y-6">
            <div className="p-8 border border-border rounded-lg bg-card">
              <h2 className="text-2xl font-bold mb-4">Need Extra Renders?</h2>
              <p className="text-muted-foreground mb-4">
                Running low on renders this month? Purchase additional renders as needed.
              </p>
              <AddToAppCartButton
                id="extra-render-pack"
                title="Extra Render Pack"
                priceId="price_1SWNl3H1V6OhfCAPas1HJF05"
                priceDisplay="$5 per render"
              />
            </div>

            <div className="p-8 border border-border rounded-lg bg-card">
              <h2 className="text-2xl font-bold mb-4">Need More Generations?</h2>
              <p className="text-muted-foreground mb-4">
                Contact us for custom Enterprise plans with unlimited generations, dedicated support, and advanced features tailored to your business needs.
              </p>
              <a 
                href="mailto:sales@wrapcloser.com" 
                className="text-primary hover:underline font-semibold"
              >
                Contact Sales →
              </a>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Pricing;