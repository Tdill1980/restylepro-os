import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionLimits } from "./useSubscriptionLimits";
import { FadeStyleId } from "@/lib/fadeStyles";

type KitSize = "small" | "medium" | "large" | "xl";
type RoofSize = "none" | "small" | "medium" | "large";
type DesignProMode = "panels" | "gradients";

export const useDesignProLogic = () => {
  const { toast } = useToast();
  const { checkCanGenerate, incrementRenderCount } = useSubscriptionLimits();
  
  // Mode toggle
  const [mode, setMode] = useState<DesignProMode>("panels");
  
  // Shared state
  const [selectedPattern, setSelectedPattern] = useState<any>(null);
  const [selectedFinish, setSelectedFinish] = useState<'Gloss' | 'Satin' | 'Matte'>('Gloss');
  const [kitSize, setKitSize] = useState<KitSize>("medium");
  const [addHood, setAddHood] = useState(false);
  const [addFrontBumper, setAddFrontBumper] = useState(false);
  const [addRearBumper, setAddRearBumper] = useState(false);
  const [roofSize, setRoofSize] = useState<RoofSize>("none");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [visualizationId, setVisualizationId] = useState<string | null>(null);
  const [allViews, setAllViews] = useState<any[]>([]);
  const [isGeneratingAdditional, setIsGeneratingAdditional] = useState(false);
  const [uploadMode, setUploadMode] = useState<'curated' | 'custom'>('curated');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [lastError, setLastError] = useState<{ type: 'auth' | 'limit' | 'general'; message: string } | null>(null);
  
  // FadeWraps-specific state
  const [gradientScale, setGradientScale] = useState(1.0);
  const [gradientDirection, setGradientDirection] = useState<'front-to-back' | 'back-to-front' | 'top-to-bottom' | 'bottom-to-top' | 'diagonal-front' | 'diagonal-rear'>('front-to-back');
  const [fadeStyle, setFadeStyle] = useState<FadeStyleId>('front_back');

  const clearLastRender = () => {
    localStorage.removeItem('designpro-last-render');
    localStorage.removeItem('designpro-additional-views');
    setGeneratedImageUrl(null);
    setAllViews([]);
  };

  // Fetch patterns based on mode
  const { data: patterns, isLoading } = useQuery({
    queryKey: ["designpro_patterns", mode],
    queryFn: async () => {
      const tableName = mode === "panels" ? "designpanelpro_patterns" : "fadewraps_patterns";
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      
      if (error) throw error;
      
      // For fadewraps, filter to only show uploaded patterns
      if (mode === "gradients") {
        return data?.filter(pattern => 
          pattern.media_url && 
          pattern.media_url.includes('supabase.co/storage')
        ) || [];
      }
      
      return data || [];
    },
  });

  // Pricing (same for both modes)
  const kitPrices = {
    small: 600,
    medium: 710,
    large: 825,
    xl: 990,
  };

  const addonPrices = {
    hood: 160,
    frontBumper: 200,
    rearBumper: 395,
  };

  const roofPrices = {
    none: 0,
    small: 160,
    medium: 225,
    large: 330,
  };

  const calculateTotal = () => {
    let total = kitPrices[kitSize];
    if (addHood) total += addonPrices.hood;
    if (addFrontBumper) total += addonPrices.frontBumper;
    if (addRearBumper) total += addonPrices.rearBumper;
    if (roofSize !== "none") total += roofPrices[roofSize];
    return total;
  };

  const generateRender = async (year: string, make: string, model: string) => {
    if (!selectedPattern) {
      toast({
        title: "Select a design first",
        description: "Please select a panel design from the library.",
        variant: "destructive",
      });
      return;
    }
    
    setLastError(null);
    setIsGenerating(true);
    setGeneratedImageUrl(null);
    setAllViews([]);

    try {
      const vehicle = `${year} ${make} ${model}`;

      if (mode === "panels") {
        // Use dedicated design-panel-generate function (no auth required)
        const { data, error } = await supabase.functions.invoke('design-panel-generate', {
          body: {
            vehicle,
            panelUrl: selectedPattern.media_url,
            panelName: selectedPattern.ai_generated_name || selectedPattern.name,
            finish: selectedFinish,
            viewType: "front",
          }
        });

        if (error) throw error;
        
        if (data?.renderUrl) {
          setGeneratedImageUrl(data.renderUrl);
          localStorage.setItem('designpro-last-render', data.renderUrl);
          toast({ 
            title: "3D Proof Generated", 
            description: "Your DesignPanelPro™ preview is ready!" 
          });
        } else if (data?.error) {
          throw new Error(data.error);
        }
      } else {
        // FadeWraps mode - use existing generate-color-render
        const canGenerate = await checkCanGenerate();
        if (!canGenerate) {
          setLastError({ type: 'limit', message: 'Monthly render limit reached.' });
          setShowUpgradeModal(true);
          return;
        }

        const { data: sessionData } = await supabase.auth.getSession();
        const userEmail = sessionData?.session?.user?.email;
        
        if (!userEmail) {
          setLastError({ type: 'auth', message: 'Please log in to generate FadeWraps renders.' });
          return;
        }

        const { data, error } = await supabase.functions.invoke('generate-color-render', {
          body: {
            vehicleYear: year,
            vehicleMake: make,
            vehicleModel: model,
            modeType: "fadewraps",
            viewType: "side",
            colorData: {
              // Use InkFusion lamination if available, otherwise use selectedFinish
              finish: (selectedPattern as any).inkFusionColor?.lamination?.toLowerCase() || selectedFinish.toLowerCase(),
              colorName: selectedPattern.name,
              // Extract hex from inkFusionColor first (for InkFusion selections), then fallback
              colorHex: (selectedPattern as any).inkFusionColor?.hex || (selectedPattern as any).hex || '#000000',
              patternUrl: selectedPattern.media_url,
              isInkFusion: !selectedPattern.media_url || (selectedPattern as any).isInkFusion === true,
              gradientScale,
              gradientDirection,
              fadeStyle, // Pass exact styleId to backend
              addHood,
              addFrontBumper,
              addRearBumper,
              kitSize,
              roofSize,
              manufacturer: (selectedPattern as any).isInkFusion ? 'InkFusion' : 'FadeWraps Gradients',
              colorLibrary: (selectedPattern as any).isInkFusion ? 'inkfusion' : 'fadewraps'
            },
            userEmail,
          }
        });

        if (error) throw error;
        
        if (data?.renderUrl) {
          setGeneratedImageUrl(data.renderUrl);
          setVisualizationId(data.renderId);
          localStorage.setItem('designpro-last-render', data.renderUrl);
          await incrementRenderCount();
          toast({ 
            title: "3D Proof Generated", 
            description: "Your FadeWraps™ preview is ready!" 
          });
        }
      }
    } catch (error: any) {
      console.error('Generate render error:', error);
      setLastError({ type: 'general', message: error.message || 'Generation failed. Please try again.' });
      toast({ 
        title: "Generation failed", 
        description: error.message || "Please try again", 
        variant: "destructive" 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAdditionalViews = async (year: string, make: string, model: string) => {
    if (!selectedPattern) return;
    
    setIsGeneratingAdditional(true);
    try {
      const vehicle = `${year} ${make} ${model}`;
      const views = mode === "panels" ? ['closeup', 'side', 'rear', 'top'] : ['rear', 'top'];

      if (mode === "panels") {
        // Use dedicated design-panel-generate function for each view
        const promises = views.map(viewType => 
          supabase.functions.invoke('design-panel-generate', {
            body: {
              vehicle,
              panelUrl: selectedPattern.media_url,
              panelName: selectedPattern.ai_generated_name || selectedPattern.name,
              finish: selectedFinish,
              viewType,
            }
          })
        );

        const results = await Promise.all(promises);
        const generatedViews = results
          .map((result, index) => ({
            type: views[index],
            url: result.data?.renderUrl
          }))
          .filter(view => view.url);

        setAllViews(generatedViews);
        localStorage.setItem('designpro-additional-views', JSON.stringify(generatedViews));
        
        toast({ 
          title: "Additional views generated", 
          description: `${generatedViews.length} views ready!` 
        });
      } else {
        // FadeWraps mode - requires auth
        const { data: sessionData } = await supabase.auth.getSession();
        const userEmail = sessionData?.session?.user?.email;
        
        if (!userEmail) {
          toast({
            title: "Authentication required",
            description: "Please log in to generate additional views.",
            variant: "destructive",
          });
          return;
        }

        const resolvedHex = (selectedPattern as any).inkFusionColor?.hex || (selectedPattern as any).hex;
        const isInkFusion = !!(selectedPattern as any).isInkFusion || !!(selectedPattern as any).inkFusionColor;

        const promises = views.map(viewType => 
          supabase.functions.invoke('generate-color-render', {
            body: {
              vehicleYear: year,
              vehicleMake: make,
              vehicleModel: model,
              modeType: "fadewraps",
              viewType,
              colorData: {
                finish: (selectedPattern as any).inkFusionColor?.lamination?.toLowerCase() || selectedFinish.toLowerCase(),
                colorName: selectedPattern.name,
                colorHex: resolvedHex,
                renderHex: (selectedPattern as any).inkFusionColor?.renderHex || null,
                inkDensity: (selectedPattern as any).inkFusionColor?.inkDensity || 1.0,
                patternUrl: selectedPattern.media_url,
                isInkFusion,
                fadeStyle,
                gradientScale,
                gradientDirection,
                addHood,
                addFrontBumper,
                addRearBumper,
                kitSize,
                roofSize,
                manufacturer: isInkFusion ? 'InkFusion' : 'FadeWraps Gradients',
                colorLibrary: isInkFusion ? 'inkfusion' : 'fadewraps'
              },
              userEmail,
            }
          })
        );

        const results = await Promise.all(promises);
        const generatedViews = results
          .map((result, index) => ({
            type: views[index],
            url: result.data?.renderUrl
          }))
          .filter(view => view.url);

        setAllViews(generatedViews);
        localStorage.setItem('designpro-additional-views', JSON.stringify(generatedViews));
        
        toast({ 
          title: "Additional views generated", 
          description: `${generatedViews.length} views ready!` 
        });
      }
    } catch (error: any) {
      console.error('Generate additional views error:', error);
      toast({ 
        title: "Generation failed", 
        description: error.message || "Please try again", 
        variant: "destructive" 
      });
    } finally {
      setIsGeneratingAdditional(false);
    }
  };

  const productId = mode === "panels" ? 'DESIGNPANELPRO_PLACEHOLDER' : "58391";

  return {
    mode,
    setMode,
    selectedPattern,
    setSelectedPattern,
    selectedFinish,
    setSelectedFinish,
    gradientScale,
    setGradientScale,
    gradientDirection,
    setGradientDirection,
    fadeStyle,
    setFadeStyle,
    kitSize,
    setKitSize,
    addHood,
    setAddHood,
    addFrontBumper,
    setAddFrontBumper,
    addRearBumper,
    setAddRearBumper,
    roofSize,
    setRoofSize,
    patterns,
    isLoading,
    totalPrice: calculateTotal(),
    productId,
    generateRender,
    isGenerating,
    generatedImageUrl,
    visualizationId,
    allViews,
    generateAdditionalViews,
    isGeneratingAdditional,
    uploadMode,
    setUploadMode,
    showUpgradeModal,
    setShowUpgradeModal,
    clearLastRender,
    lastError,
    setLastError,
  };
};
