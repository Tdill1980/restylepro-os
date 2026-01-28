import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductHero } from "@/components/ProductHero";
import { DesignProToolUI } from "@/components/productTools/DesignProToolUI";
import { Button } from "@/components/ui/button";
import { RenderLimitUpsell } from "@/components/RenderLimitUpsell";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRenderLimits } from "@/hooks/useRenderLimits";
import { ToolContainer } from "@/components/layout/ToolContainer";
import { WaitlistGate } from "@/components/WaitlistGate";

export default function DesignPro() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email || null);
    });
  }, []);

  const { showUpsell, setShowUpsell, limitStatus } = useRenderLimits(userEmail);

  // Fetch carousel images from DesignPanelPro (primary)
  const { data: carouselImages } = useQuery({
    queryKey: ["designpro_carousel"],
    queryFn: async () => {
      const { data } = await supabase
        .from("designpanelpro_carousel")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      return data || [];
    },
  });

  const midPoint = Math.ceil((carouselImages?.length || 0) / 2);
  
  const leftSlides = carouselImages?.slice(0, midPoint).map(item => ({
    id: item.id,
    image: item.media_url,
    title: item.title || '',
    subtitle: item.subtitle || '',
  })) || [];
  
  const rightSlides = carouselImages?.slice(midPoint).map(item => ({
    id: item.id,
    image: item.media_url,
    title: item.title || '',
    subtitle: item.subtitle || '',
  })) || [];

  return (
    <WaitlistGate toolName="DesignPanelPro™">
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>DesignPanelPro™ - Professional Wrap Visualization | RestylePro Suite™</title>
        <meta name="description" content="Unified professional wrap design tool. Visualize custom panel designs or FadeWraps with photorealistic 3D vehicle renders." />
        <meta property="og:title" content="DesignPanelPro™ - Professional Wrap Visualization" />
        <meta property="og:description" content="Panel designs + FadeWraps in one powerful tool. Photorealistic 3D vehicle proofs." />
      </Helmet>
      <Header />
      <main className="flex-1">
        <ProductHero
          productName="DesignPanelPro™"
          tagline="Professional wrap visualization with panel designs and FadeWraps. Choose your mode and create stunning 3D vehicle proofs."
          leftSlides={leftSlides}
          rightSlides={rightSlides}
        />
        
        <section id="tool" className="bg-background/50 pt-2 pb-6 md:pt-3 md:pb-8 overflow-x-hidden">
          <ToolContainer>
            <DesignProToolUI />
          </ToolContainer>
        </section>
        
        <RenderLimitUpsell
          isOpen={showUpsell}
          onClose={() => setShowUpsell(false)}
          currentPlan={limitStatus?.tier || 'none'}
          rendersUsed={limitStatus?.used || 0}
          renderLimit={limitStatus?.limit || 0}
        />
        
      </main>
      <Footer />
    </div>
    </WaitlistGate>
  );
}
