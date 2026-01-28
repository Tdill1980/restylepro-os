import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductHero } from "@/components/ProductHero";
import { ImageCarousel } from "@/components/ImageCarousel";
import { WBTYToolUI } from "@/components/productTools/WBTYToolUI";
import { FAQ } from "@/components/FAQ";
import { Button } from "@/components/ui/button";
import { RenderLimitUpsell } from "@/components/RenderLimitUpsell";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRenderLimits } from "@/hooks/useRenderLimits";
import { ToolContainer } from "@/components/layout/ToolContainer";
import { WaitlistGate } from "@/components/WaitlistGate";
const WBTY = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email || null);
    });
  }, []);

  const { showUpsell, setShowUpsell, limitStatus } = useRenderLimits(userEmail);

  const { data: carouselImages } = useQuery({
    queryKey: ["wbty_carousel"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wbty_carousel")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  // Split carousel images into left and right
  const leftSlides = carouselImages
    ?.filter((_, index) => index % 2 === 0)
    .map(img => ({
      id: img.id,
      image: img.media_url,
      title: img.pattern_name || 'WBTY Pattern',
      subtitle: "WBTY™ Pattern"
    })) || [];

  const rightSlides = carouselImages
    ?.filter((_, index) => index % 2 !== 0)
    .map(img => ({
      id: img.id,
      image: img.media_url,
      title: img.pattern_name || 'WBTY Pattern',
      subtitle: "WBTY™ Pattern"
    })) || [];

  return (
    <WaitlistGate toolName="PatternPro™">
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>PatternPro™ - Wrap By The Yard Pattern Visualizer | RestylePro Suite™</title>
        <meta name="description" content="Visualize premium wrap patterns by the yard with PatternPro™. Choose from Metal & Marble, Wicked & Wild, Camo & Carbon, and more. Generate 3D renders with accurate yardage calculations at $95.50/yard." />
        <meta property="og:title" content="PatternPro™ - Wrap By The Yard Pattern Visualizer" />
        <meta property="og:description" content="Premium patterns by the yard. 3D renders with accurate yardage at $95.50/yard." />
      </Helmet>
      <Header />
      
      <main className="flex-1">
        {/* Product Hero */}
        <ProductHero
          productName="PatternPro™"
          tagline="Wrap-By-The-Yard patterns priced per yard at $95.50."
          leftSlides={leftSlides}
          rightSlides={rightSlides}
        />
        
        {/* WBTY Design Tool - immediately after hero */}
        <section className="bg-background/50 pt-2 pb-6 md:pt-3 md:pb-8 overflow-x-hidden">
          <ToolContainer>
            <WBTYToolUI />
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
        <ImageCarousel productType="wbty" />
        
        {/* FAQ */}
        <FAQ productName="PatternPro" />
        
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
              Upgrade Your Plan 🚀
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
    </WaitlistGate>
  );
};

export default WBTY;