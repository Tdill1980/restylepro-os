import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductHero } from "@/components/ProductHero";
import { ImageCarousel } from "@/components/ImageCarousel";
import { ColorProToolUI } from "@/components/productTools/ColorProToolUI";
import { PricingCard } from "@/components/PricingCard";
import { FAQ } from "@/components/FAQ";
import { Button } from "@/components/ui/button";
import { RenderLimitUpsell } from "@/components/RenderLimitUpsell";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRenderLimits } from "@/hooks/useRenderLimits";
import { ToolContainer } from "@/components/layout/ToolContainer";
import { WaitlistGate } from "@/components/WaitlistGate";

const ColorPro = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Get user email
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email || null);
    });
  }, []);

  const { showUpsell, setShowUpsell, limitStatus } = useRenderLimits(userEmail);
  // Fetch carousel images from database (latest first)
  const { data: carouselImages } = useQuery({
    queryKey: ["inkfusion_carousel"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inkfusion_carousel")
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
      title: `${img.vehicle_name || 'Vehicle'} shown in ${img.color_name || ''}`,
      subtitle: "ColorPro™ Visualization"
    })) || [];

  const rightSlides = carouselImages
    ?.filter((_, index) => index % 2 !== 0)
    .map(img => ({
      id: img.id,
      image: img.media_url,
      title: `${img.vehicle_name || 'Vehicle'} shown in ${img.color_name || ''}`,
      subtitle: "ColorPro™ Visualization"
    })) || [];

  return (
    <WaitlistGate toolName="ColorPro™">
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>ColorPro™ - AI-Calibrated Vinyl Wrap Color Visualizer | RestylePro Suite™</title>
        <meta name="description" content="Visualize any vinyl wrap color on any vehicle with ColorPro™. Browse verified manufacturer color libraries from 3M 2080, Avery SW900, Hexis, and more. Upload any swatch for photorealistic 3D renders." />
        <meta property="og:title" content="ColorPro™ - AI-Calibrated Vinyl Wrap Color Visualizer" />
        <meta property="og:description" content="Browse verified manufacturer color libraries from 3M, Avery, Hexis & more. Upload any swatch for photorealistic 3D vehicle renders instantly." />
      </Helmet>
      <Header />
      
      <main className="flex-1">
        <ProductHero
          productName="ColorPro™"
          tagline="Browse verified manufacturer color libraries from 3M 2080, Avery SW900, Hexis, and more. Every color precisely calibrated with LAB values, reflectivity profiles, and finish characteristics for photorealistic accuracy. Upload any swatch to visualize on any vehicle."
          leftSlides={leftSlides}
          rightSlides={rightSlides}
        />
        
        {/* ColorPro Design Tool - immediately after hero */}
        <section className="bg-background/50 pt-2 pb-6 md:pt-3 md:pb-8 overflow-x-hidden">
          <ToolContainer>
            <ColorProToolUI />
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
        <ImageCarousel productType="inkfusion" />
        
        {/* FAQ */}
        <FAQ productName="ColorPro™" />
        
        {/* Upgrade CTA */}
        <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
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

export default ColorPro;