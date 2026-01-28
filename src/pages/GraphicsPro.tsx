import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GraphicsProToolUI } from "@/components/productTools/GraphicsProToolUI";
import { FAQ } from "@/components/FAQ";
import { Button } from "@/components/ui/button";
import { RenderLimitUpsell } from "@/components/RenderLimitUpsell";
import { supabase } from "@/integrations/supabase/client";
import { useRenderLimits } from "@/hooks/useRenderLimits";
import { ToolContainer } from "@/components/layout/ToolContainer";
import { WaitlistGate } from "@/components/WaitlistGate";

const GraphicsPro = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email || null);
    });
  }, []);

  const { showUpsell, setShowUpsell, limitStatus } = useRenderLimits(userEmail);

  return (
    <WaitlistGate toolName="GraphicsPro™">
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>GraphicsPro™ - Multi-Zone Wrap Designer | RestylePro Suite™</title>
        <meta name="description" content="Design custom multi-zone vehicle wraps with GraphicsPro™. Create two-tone designs, racing stripes, chrome deletes, and complex vinyl graphics with AI-powered visualization." />
        <meta property="og:title" content="GraphicsPro™ - Multi-Zone Wrap Designer" />
        <meta property="og:description" content="Design complex multi-zone wraps: two-tone, racing stripes, chrome deletes, accent packages. AI-powered visualization." />
      </Helmet>
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-cyan-500/10 via-purple-500/5 to-background pt-8 pb-4">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="text-foreground">Graphics</span>
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">Pro™</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Design complex multi-zone wraps with natural language. Two-tone, racing stripes, chrome deletes, accent packages—describe it, see it.
            </p>
          </div>
        </section>
        
        {/* GraphicsPro Design Tool */}
        <section className="bg-background/50 pt-2 pb-6 md:pt-3 md:pb-8 overflow-x-hidden">
          <ToolContainer>
            <GraphicsProToolUI />
          </ToolContainer>
        </section>
        
        <RenderLimitUpsell
          isOpen={showUpsell}
          onClose={() => setShowUpsell(false)}
          currentPlan={limitStatus?.tier || 'none'}
          rendersUsed={limitStatus?.used || 0}
          renderLimit={limitStatus?.limit || 0}
        />
        
        {/* FAQ */}
        <FAQ productName="GraphicsPro™" />
        
        {/* Upgrade CTA */}
        <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Unlock Unlimited Custom Designs
            </h2>
            <p className="text-muted-foreground text-lg">
              Create unlimited multi-zone wraps, two-tone designs, and custom graphics for your clients.
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

export default GraphicsPro;
