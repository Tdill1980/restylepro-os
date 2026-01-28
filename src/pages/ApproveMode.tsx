import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductHero } from "@/components/ProductHero";
import { ImageCarousel } from "@/components/ImageCarousel";
import { FAQ } from "@/components/FAQ";
import { ApproveModeComponent } from "@/components/tools/modes/ApproveModeComponent";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RenderLimitUpsell } from "@/components/RenderLimitUpsell";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { useRenderLimits } from "@/hooks/useRenderLimits";
import { ToolContainer } from "@/components/layout/ToolContainer";
import { WaitlistGate } from "@/components/WaitlistGate";

const ApproveMode = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email || null);
    });
  }, []);

  const { showUpsell, setShowUpsell, limitStatus } = useRenderLimits(userEmail);
  // Fetch carousel images from database
  const { data: carouselImages } = useQuery({
    queryKey: ["approvemode_carousel"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("approvemode_carousel")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  // Left carousel shows 2D design proofs (before_url), right shows 3D renders (media_url)
  const leftSlides = carouselImages?.filter(img => img.before_url).map(img => ({
    id: img.id,
    image: img.before_url!,
    title: img.vehicle_name || 'ApprovePro',
    subtitle: "BEFORE - 2D Proof"
  })) || [];

  const rightSlides = carouselImages?.map(img => ({
    id: img.id,
    image: img.media_url,
    title: img.vehicle_name || 'ApprovePro',
    subtitle: "AFTER - 3D Render"
  })) || [];

  return (
    <WaitlistGate toolName="ApprovePro™">
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>ApprovePro™ - 2D to 3D Design Converter | RestylePro Suite™</title>
        <meta name="description" content="Fleet expansion made easy! Upload your existing wrap design and visualize it on ANY new vehicle. Perfect for clients adding trucks, vans, or cars to their fleet. Get instant 3D approval renders." />
        <meta property="og:title" content="ApprovePro™ - 2D to 3D Design Converter" />
        <meta property="og:description" content="Convert 2D designs into photorealistic 3D renders. Boost approval rates instantly." />
      </Helmet>
      <Header />
      
      <main className="flex-1">
        {/* Product Hero */}
        <ProductHero
          productName="ApprovePro™"
          tagline="Upload your 2D design proof → See it rendered on any vehicle in seconds. Same vehicle, new vehicle, any vehicle. Instant client approval."
          leftSlides={leftSlides}
          rightSlides={rightSlides}
        />
        
        {/* Fleet Expansion USP Callout */}
        <section className="container mx-auto px-4 -mt-4 mb-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-foreground mb-3">
                Perfect for Client Approvals
              </h3>
              <p className="text-muted-foreground mb-4">
                Need to show a client how their design will look? Upload your 2D proof and visualize it 
                on the same vehicle or a completely different one — <span className="text-cyan-400 font-semibold">instant photorealistic renders</span>.
              </p>
              
              {/* How It Works Steps */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-background/50 rounded-lg border border-border/50">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <span className="text-cyan-400 font-bold">1</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">Upload</p>
                  <p className="text-xs text-muted-foreground">Your 2D Design Proof</p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg border border-border/50">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <span className="text-cyan-400 font-bold">2</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">Enter</p>
                  <p className="text-xs text-muted-foreground">Any Vehicle Details</p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg border border-border/50">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <span className="text-cyan-400 font-bold">3</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">Visualize</p>
                  <p className="text-xs text-muted-foreground">Photorealistic 3D Render</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* ApproveMode Tool - immediately after hero */}
        <section className="bg-background/50 py-8 overflow-x-hidden">
          <ToolContainer>
            <Card className="bg-secondary border-border/30 rounded-xl p-4 md:p-6">
              <ApproveModeComponent />
            </Card>
          </ToolContainer>
        </section>
        
        <RenderLimitUpsell
          isOpen={showUpsell}
          onClose={() => setShowUpsell(false)}
          currentPlan={limitStatus?.tier || 'none'}
          rendersUsed={limitStatus?.used || 0}
          renderLimit={limitStatus?.limit || 0}
        />
        
        {/* Image Carousel */}
        <ImageCarousel productType="approvemode" />
        
        {/* FAQ */}
        <FAQ productName="ApprovePro" />
        
        {/* Upgrade CTA */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Unlock More Designs & Unlimited Creativity
            </h2>
            <p className="text-muted-foreground text-lg">
              Your imagination shouldn't have limits. Upgrade now and generate more
              wrap previews for clients who are ready to buy.
            </p>
            <Button 
              onClick={() => window.location.href='/pricing'}
              size="lg"
              className="px-8 py-6 text-lg font-semibold"
            >
              Upgrade Your Plan
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
    </WaitlistGate>
  );
};

export default ApproveMode;