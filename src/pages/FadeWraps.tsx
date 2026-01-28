import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductHero } from "@/components/ProductHero";
import { ImageCarousel } from "@/components/ImageCarousel";
import { FadeWrapToolUI } from "@/components/productTools/FadeWrapToolUI";
import { PricingCard } from "@/components/PricingCard";
import { FAQ } from "@/components/FAQ";
import { Button } from "@/components/ui/button";
import { RenderLimitUpsell } from "@/components/RenderLimitUpsell";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRenderLimits } from "@/hooks/useRenderLimits";
import { ToolContainer } from "@/components/layout/ToolContainer";
import { WaitlistGate } from "@/components/WaitlistGate";
const FadeWraps = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email || null);
    });
  }, []);

  const { showUpsell, setShowUpsell, limitStatus } = useRenderLimits(userEmail);

  const { data: carouselImages } = useQuery({
    queryKey: ["fadewraps_carousel"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fadewraps_carousel")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Split carousel images for left and right sides
  const leftSlides = carouselImages
    ?.filter((_, index) => index % 2 === 0)
    .map((item) => ({
      id: item.id,
      image: item.media_url,
      title: item.title || item.name,
      subtitle: item.subtitle || item.pattern_name || ""
    })) || [];

  const rightSlides = carouselImages
    ?.filter((_, index) => index % 2 !== 0)
    .map((item) => ({
      id: item.id,
      image: item.media_url,
      title: item.title || item.name,
      subtitle: item.subtitle || item.pattern_name || ""
    })) || [];

  return (
    <WaitlistGate toolName="FadeWraps™">
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>FadeWraps™ - Premium Gradient Wrap Visualizer | RestylePro Suite™</title>
        <meta name="description" content="Create stunning gradient wraps with FadeWraps™. Choose from premium gradient patterns and customize panel kits. Generate photorealistic 3D vehicle renders with accurate pricing." />
        <meta property="og:title" content="FadeWraps™ - Premium Gradient Wrap Visualizer" />
        <meta property="og:description" content="Premium gradient wraps with panel kits. Photorealistic renders with accurate pricing." />
      </Helmet>
      <Header />
      
      <main className="flex-1">
        {/* Product Hero */}
        <ProductHero
          productName="FadeWraps™"
          tagline="Premium gradient patterns with panel kits for easy installation."
          leftSlides={leftSlides}
          rightSlides={rightSlides}
        />
        
        {/* FadeWraps Design Tool - immediately after hero */}
        <section className="bg-background/50 pt-2 pb-6 md:pt-3 md:pb-8 overflow-x-hidden">
          <ToolContainer>
            <FadeWrapToolUI />
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
        <ImageCarousel productType="fadewraps" />
        
        {/* Pricing */}
        <section className="container mx-auto px-4 py-20">
          <PricingCard 
            title="FadeWraps Pro"
            price={349}
            features={[
              "1,000+ Gradient patterns",
              "Custom fade creation",
              "Pattern library",
              "Real-time 3D preview",
              "Export options"
            ]}
          />
        </section>
        
        {/* FAQ */}
        <FAQ productName="FadeWraps" />
        
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

export default FadeWraps;