import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { renderClient } from "@/integrations/supabase/renderClient";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionLimits } from "./useSubscriptionLimits";

const STORAGE_KEY = "wbty-generations";
const FREE_LIMIT = 2;

export const useWBTYLogic = () => {
  const { toast } = useToast();
  const { checkCanGenerate, incrementRenderCount } = useSubscriptionLimits();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [yardsNeeded, setYardsNeeded] = useState(2);
  const [generationCount, setGenerationCount] = useState(0);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [visualizationId, setVisualizationId] = useState<string | null>(null);
  const [selectedFinish, setSelectedFinish] = useState<"gloss" | "satin" | "matte">("gloss");
  const [patternScale, setPatternScale] = useState(1.0);
  const [additionalViews, setAdditionalViews] = useState<{ side: string; rear: string; top: string; closeup: string } | null>(null);
  const [isGeneratingAdditional, setIsGeneratingAdditional] = useState(false);
  const [calculatedSquareFeet, setCalculatedSquareFeet] = useState<number | null>(null);
  const [isCalculatingSquareFeet, setIsCalculatingSquareFeet] = useState(false);
  const [uploadMode, setUploadMode] = useState<'curated' | 'custom'>('curated');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const count = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
    setGenerationCount(count);
    setHasReachedLimit(false); // Always allow generation
  }, []);

  const clearLastRender = () => {
    localStorage.removeItem('wbty-last-render');
    localStorage.removeItem('wbty-additional-views');
    setGeneratedImageUrl(null);
    setAdditionalViews(null);
  };

  const { data: products, isLoading } = useQuery({
    queryKey: ["wbty_products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wbty_products")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      
      if (error) throw error;
      
      // Filter out products with placeholder images
      return data?.filter(product => 
        product.media_url && 
        !product.media_url.includes('placeholder') &&
        product.media_url.includes('supabase.co/storage')
      ) || [];
    },
  });

  const pricePerYard = 95.50;
  const totalPrice = yardsNeeded * pricePerYard;

  // Product ID mapping based on pattern families
  const getProductId = (category: string) => {
    const productIdMap: Record<string, string> = {
      "Bape Camo": "42809",
      "Camo & Carbon": "1726",
      "Metal & Marble": "39698",
      "Modern & Trippy": "52489",
      "Wicked & Wild": "4179",
    };
    return productIdMap[category] || "42809";
  };

  const incrementGeneration = () => {
    const newCount = generationCount + 1;
    localStorage.setItem(STORAGE_KEY, newCount.toString());
    setGenerationCount(newCount);
    // No limit check
  };

  const generateRender = async (vehicleYear: string, vehicleMake: string, vehicleModel: string, revisionPrompt?: string) => {
    if (!selectedProduct) {
      toast({ title: "No pattern selected", description: "Please select a WBTY pattern first", variant: "destructive" });
      return false;
    }

    // Check subscription limits
    const canGenerate = await checkCanGenerate();
    if (!canGenerate) {
      setShowUpgradeModal(true);
      return false;
    }

    try {
      setIsGenerating(true);
      setShowFallback(false);
      setAdditionalViews(null); // Reset additional views
      
      // Get user email for security check
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email;
      
      // Generate hero view first
      const heroPayload = {
        vehicleYear,
        vehicleMake,
        vehicleModel,
        revisionPrompt,
        userEmail,
        colorData: {
          colorName: selectedProduct.name,
          hex: "#000000",
          finish: selectedFinish,
          patternUrl: selectedProduct.media_url,
          patternScale: patternScale
        },
        modeType: "wbty",
        viewType: "front",
        customDesignUrl: selectedProduct.media_url,
        useCustomDesign: true,
      };

      const { data: heroData, error: heroError } = await renderClient.functions.invoke("generate-color-render", {
        body: heroPayload,
      });

      if (heroError) throw heroError;

      if (heroData?.renderUrl) {
        setGeneratedImageUrl(heroData.renderUrl);
        setVisualizationId(heroData.renderId);
        localStorage.setItem('wbty-last-render', heroData.renderUrl);
        incrementGeneration();
        
        // Increment render count after successful generation
        await incrementRenderCount();
        
        toast({ title: "✅ Hero View Generated!", description: "Your preview is ready" });
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error("Generation error:", error);
      toast({ 
        title: "Generation failed", 
        description: error.message || "Please try again", 
        variant: "destructive" 
      });
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAdditionalViews = async (vehicleYear: string, vehicleMake: string, vehicleModel: string) => {
    if (!selectedProduct || !generatedImageUrl) {
      toast({ title: "Generate hero view first", description: "Please generate the main view before additional views", variant: "destructive" });
      return false;
    }

    try {
      setIsGeneratingAdditional(true);
      toast({ title: "Generating additional views...", description: "This will take a few moments" });

      // Get user email for security check
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email;

      const basePayload = {
        vehicleYear,
        vehicleMake,
        vehicleModel,
        userEmail,
        colorData: {
          colorName: selectedProduct.name,
          hex: "#000000",
          finish: selectedFinish,
          patternUrl: selectedProduct.media_url,
          patternScale: patternScale
        },
        modeType: "wbty",
        customDesignUrl: selectedProduct.media_url,
        useCustomDesign: true,
      };

      // Generate all additional views in parallel
      const [sideResult, rearResult, topResult, closeupResult] = await Promise.all([
        renderClient.functions.invoke("generate-color-render", { body: { ...basePayload, viewType: "side" } }),
        renderClient.functions.invoke("generate-color-render", { body: { ...basePayload, viewType: "rear" } }),
        renderClient.functions.invoke("generate-color-render", { body: { ...basePayload, viewType: "top" } }),
        renderClient.functions.invoke("generate-color-render", { body: { ...basePayload, viewType: "closeup" } }),
      ]);

      if (sideResult.data?.renderUrl && rearResult.data?.renderUrl && topResult.data?.renderUrl && closeupResult.data?.renderUrl) {
        const views = {
          side: sideResult.data.renderUrl,
          rear: rearResult.data.renderUrl,
          top: topResult.data.renderUrl,
          closeup: closeupResult.data.renderUrl,
        };
        setAdditionalViews(views);
        localStorage.setItem('wbty-additional-views', JSON.stringify(views));
        toast({ title: "✅ All Views Generated!", description: "All additional views are ready" });
        return true;
      }

      return false;
    } catch (error: any) {
      console.error("Additional views generation error:", error);
      toast({ 
        title: "Additional views failed", 
        description: error.message || "Please try again", 
        variant: "destructive" 
      });
      return false;
    } finally {
      setIsGeneratingAdditional(false);
    }
  };

  const calculateSquareFeet = async (vehicleYear: string, vehicleMake: string, vehicleModel: string) => {
    if (!vehicleYear || !vehicleMake || !vehicleModel) {
      toast({ title: "Vehicle required", description: "Please enter year, make, and model", variant: "destructive" });
      return;
    }

    try {
      setIsCalculatingSquareFeet(true);
      const { data, error } = await renderClient.functions.invoke('calculate-film-yards', {
        body: { vehicleYear, vehicleMake, vehicleModel }
      });

      if (error) throw error;

      if (data?.squareFeet) {
        setCalculatedSquareFeet(data.squareFeet);
        toast({ 
          title: "✅ Square Footage Calculated", 
          description: `~${data.squareFeet} sq ft needed for ${vehicleYear} ${vehicleMake} ${vehicleModel}` 
        });
      }
    } catch (error: any) {
      console.error("Square footage calculation error:", error);
      toast({ 
        title: "Calculation failed", 
        description: error.message || "Please try again", 
        variant: "destructive" 
      });
    } finally {
      setIsCalculatingSquareFeet(false);
    }
  };

  const productId = selectedProduct ? getProductId(selectedProduct.category) : "42809";
  const remainingGenerations = Math.max(0, FREE_LIMIT - generationCount);

  // Save design job to database for PrintPro integration
  const saveDesignJob = async (vehicleYear: string, vehicleMake: string, vehicleModel: string) => {
    if (!generatedImageUrl || !selectedProduct) return null;

    try {
      const { data: user } = await supabase.auth.getUser();
      
      const allViewsArray = [];
      if (generatedImageUrl) {
        allViewsArray.push({ type: 'hero', url: generatedImageUrl });
      }
      if (additionalViews) {
        if (additionalViews.side) allViewsArray.push({ type: 'side', url: additionalViews.side });
        if (additionalViews.rear) allViewsArray.push({ type: 'rear', url: additionalViews.rear });
        if (additionalViews.top) allViewsArray.push({ type: 'top', url: additionalViews.top });
        if (additionalViews.closeup) allViewsArray.push({ type: 'closeup', url: additionalViews.closeup });
      }

      const { data, error } = await supabase
        .from('pattern_designs')
        .insert({
          user_id: user?.user?.id || null,
          product_id: selectedProduct?.id || null,
          pattern_image_url: selectedProduct.media_url,
          pattern_name: selectedProduct.name,
          pattern_category: selectedProduct.category || 'Custom',
          pattern_scale: patternScale,
          vehicle_year: vehicleYear,
          vehicle_make: vehicleMake,
          vehicle_model: vehicleModel,
          finish: selectedFinish,
          preview_image_url: generatedImageUrl,
          texture_profile: {
            allViews: allViewsArray,
            heroUrl: generatedImageUrl
          }
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to save design job:', error);
      return null;
    }
  };

  return {
    selectedProduct,
    setSelectedProduct,
    yardsNeeded,
    setYardsNeeded,
    products,
    isLoading,
    pricePerYard,
    totalPrice,
    productId,
    hasReachedLimit,
    remainingGenerations,
    incrementGeneration,
    showFallback,
    setShowFallback,
    generateRender,
    isGenerating,
    generatedImageUrl,
    visualizationId,
    selectedFinish,
    setSelectedFinish,
    patternScale,
    setPatternScale,
    additionalViews,
    generateAdditionalViews,
    isGeneratingAdditional,
    calculatedSquareFeet,
    calculateSquareFeet,
    isCalculatingSquareFeet,
    uploadMode,
    setUploadMode,
    showUpgradeModal,
    setShowUpgradeModal,
    clearLastRender,
    saveDesignJob,
  };
};
