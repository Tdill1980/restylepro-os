import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { InkFusionColor } from "@/lib/wpw-infusion-colors";
import { useSubscriptionLimits } from "./useSubscriptionLimits";
import { loadAllVinylSwatches, convertVinylSwatchToInkFusionColor, type VinylSwatch } from "@/lib/vinyl-intelligence";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "colorpro-generations";
const FREE_LIMIT = 2;

export type FinishType = 'Gloss' | 'Satin' | 'Matte' | 'Flip' | 'Brushed' | 'Textured' | 'Chrome' | 'Specialty' | 'All';

export const useColorProLogic = () => {
  const { checkCanGenerate, incrementRenderCount } = useSubscriptionLimits();
  const [selectedSwatch, setSelectedSwatch] = useState<InkFusionColor | null>(null);
  const [selectedFinish, setSelectedFinish] = useState<FinishType>('Gloss');
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [generationCount, setGenerationCount] = useState(0);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [visualizationId, setVisualizationId] = useState<string | null>(null);
  const [allViews, setAllViews] = useState<Array<{ type: string; url: string }>>([]);
  const [isGeneratingAdditional, setIsGeneratingAdditional] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [vinylSwatches, setVinylSwatches] = useState<VinylSwatch[]>([]);

  const remainingGenerations = Math.max(0, FREE_LIMIT - generationCount);

  useEffect(() => {
    const count = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
    setGenerationCount(count);
    setHasReachedLimit(false); // Always allow generation; limits handled by subscriptions
    
    // Load vinyl swatches from database
    loadAllVinylSwatches().then(swatches => {
      setVinylSwatches(swatches);
    }).catch(err => {
      console.error('Failed to load vinyl swatches:', err);
    });
  }, []);

  const generateRender = async (options?: { graphicsProPrompt?: string; modeType?: string; viewType?: string; referenceImageUrl?: string | null }) => {
    // GraphicsPro mode allows generating without a swatch (AI selects based on prompt)
    const isGraphicsProMode = options?.modeType === 'GraphicsPro' && options?.graphicsProPrompt;
    
    if (!isGraphicsProMode && (!selectedSwatch || !year || !make || !model)) {
      return { success: false, error: "Missing required fields" };
    }
    
    if (isGraphicsProMode && (!year || !make || !model)) {
      return { success: false, error: "Missing vehicle details" };
    }
    
    // Use provided viewType or default to 'hood_detail'
    const selectedViewType = options?.viewType || 'hood_detail';

    // Check subscription limits
    const canGenerate = await checkCanGenerate();
    if (!canGenerate) {
      setShowUpgradeModal(true);
      return { success: false, error: "Subscription limit reached" };
    }

    setIsGenerating(true);
    setGeneratedImageUrl(null);
    setAllViews([]);

    try {
      // Get user email for gallery storage
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email;

      // GraphicsPro mode: prompt-based, swatch optional
      // ColorPro mode: swatch required
      const useGraphicsPro = options?.modeType === 'GraphicsPro' && options?.graphicsProPrompt;

      let colorDataPayload: Record<string, any> = {};
      let derivedManufacturer = '';

      if (selectedSwatch) {
        // Generate only the hood_detail view initially for color accuracy
        // Extract manufacturer - prioritize explicit manufacturer field, then derive from colorLibrary
        const swatchManufacturer = (selectedSwatch as any).manufacturer;
        derivedManufacturer = swatchManufacturer || '';
        
        if (!derivedManufacturer && selectedSwatch.colorLibrary) {
          const lib = selectedSwatch.colorLibrary.toLowerCase();
          if (lib.includes('avery') || lib === 'avery_sw900') derivedManufacturer = 'Avery Dennison';
          else if (lib.includes('3m') || lib === '3m_2080') derivedManufacturer = '3M';
          else if (lib.includes('hexis')) derivedManufacturer = 'Hexis';
          else if (lib.includes('kpmf')) derivedManufacturer = 'KPMF';
          else if (lib.includes('oracal')) derivedManufacturer = 'Oracal';
          else if (lib.includes('inozetek')) derivedManufacturer = 'Inozetek';
          else if (lib.includes('arlon')) derivedManufacturer = 'Arlon';
          else if (lib.includes('teckwrap')) derivedManufacturer = 'TeckWrap';
          else if (lib.includes('vvivid')) derivedManufacturer = 'VViViD';
        }
        
        // Check if this is a database-matched swatch (from upload with verified match)
        const swatchId = (selectedSwatch as any).swatchId || (selectedSwatch as any).id;
        const isVerifiedMatch = (selectedSwatch as any).isVerifiedMatch || false;
        
        console.log('🎨 ColorPro render request:', {
          colorName: selectedSwatch.name,
          hex: selectedSwatch.hex,
          colorLibrary: selectedSwatch.colorLibrary,
          manufacturer: derivedManufacturer,
          swatchManufacturer,
          swatchId,
          isVerifiedMatch
        });

        // Build colorData payload - conditionally include hex
        colorDataPayload = {
          colorName: selectedSwatch.name,
          finish: selectedFinish.toLowerCase(),
          colorLibrary: selectedSwatch.colorLibrary || 'colorpro',
          manufacturer: derivedManufacturer,
          productCode: (selectedSwatch as any).productCode || null,
          verified: (selectedSwatch as any).verified || false,
          swatchImageUrl: selectedSwatch.swatchImageUrl,
          // Critical: pass swatchId for database lookup of verified material profile
          swatchId: swatchId || null,
          isVerifiedMatch: isVerifiedMatch,
          materialProfile: (selectedSwatch as any).materialProfile || null,
        };

        // CRITICAL: Only include hex if NOT a verified manufacturer match
        // Verified matches must use materialProfile from database - hex causes fallback behavior
        if (!isVerifiedMatch) {
          colorDataPayload.hex = selectedSwatch.hex;
        } else {
          console.log('🎯 Verified manufacturer swatch - excluding hex from request payload');
        }
      } else if (useGraphicsPro) {
        // GraphicsPro mode without swatch - AI will auto-select films based on prompt
        console.log('🎨 GraphicsPro prompt-only mode:', options.graphicsProPrompt);
        colorDataPayload = {
          finish: selectedFinish.toLowerCase(),
          colorLibrary: 'colorpro',
        };
      }

      // Add GraphicsPro prompt to colorData if enabled
      if (useGraphicsPro) {
        colorDataPayload.customStylingPrompt = options.graphicsProPrompt;
        if (options.referenceImageUrl) {
          colorDataPayload.referenceImageUrl = options.referenceImageUrl;
        }
      }
      
      const { data, error } = await supabase.functions.invoke('generate-color-render', {
        body: {
          vehicleYear: year,
          vehicleMake: make,
          vehicleModel: model,
          colorData: colorDataPayload,
          modeType: useGraphicsPro ? 'GraphicsPro' : 'ColorPro',
          viewType: selectedViewType,
          userEmail // Pass user email for gallery storage
        }
      });

      if (error) {
        console.error("Edge function error:", error);
        toast({
          title: "Generation Failed",
          description: error.message || "Edge function returned an error. Check console for details.",
          variant: "destructive"
        });
        throw error;
      }

      if (data?.renderUrl) {
        const newViews = [{ type: selectedViewType, url: data.renderUrl }];
        setGeneratedImageUrl(data.renderUrl);
        setVisualizationId(data.renderId);
        setAllViews(newViews);
        
        // Persist to localStorage
        localStorage.setItem('inkfusion_last_render', JSON.stringify({
          views: newViews,
          timestamp: Date.now()
        }));
        
        // Increment render count after successful generation
        await incrementRenderCount();
        
        toast({
          title: "Render Generated!",
          description: "Your vehicle render is ready.",
        });
        
        return { success: true, imageUrl: data.renderUrl };
      }

      toast({
        title: "Generation Failed",
        description: "No image URL was returned from the render engine.",
        variant: "destructive"
      });
      return { success: false, error: "No image URL returned" };
    } catch (error: any) {
      console.error("🚨 Generation error:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "An unexpected error occurred. Check console for details.",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setIsGenerating(false);
    }
  };

  const [pendingViews, setPendingViews] = useState<string[]>([]);
  
  const generateAdditionalViews = async (options?: { graphicsProPrompt?: string; modeType?: string; referenceImageUrl?: string | null }) => {
    const isGraphicsProMode = options?.modeType === 'GraphicsPro' && options?.graphicsProPrompt;
    
    // GraphicsPro mode: swatch is optional, but vehicle required
    // Standard mode: swatch AND vehicle required
    if (!isGraphicsProMode && !selectedSwatch) {
      return { success: false, error: "Missing required fields" };
    }
    if (!year || !make || !model) {
      return { success: false, error: "Missing vehicle details" };
    }

    setIsGeneratingAdditional(true);
    const additionalViewTypes = ['front', 'rear', 'top'];
    setPendingViews(additionalViewTypes);

    try {
      // Get user email for gallery storage
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email;

      // Use same manufacturer derivation as initial render (only for non-GraphicsPro mode)
      let derivedManufacturer = '';
      if (selectedSwatch) {
        const swatchManufacturer = (selectedSwatch as any).manufacturer;
        derivedManufacturer = swatchManufacturer || '';
        
        if (!derivedManufacturer && selectedSwatch.colorLibrary) {
          const lib = selectedSwatch.colorLibrary.toLowerCase();
          if (lib.includes('avery') || lib === 'avery_sw900') derivedManufacturer = 'Avery Dennison';
          else if (lib.includes('3m') || lib === '3m_2080') derivedManufacturer = '3M';
          else if (lib.includes('hexis')) derivedManufacturer = 'Hexis';
          else if (lib.includes('kpmf')) derivedManufacturer = 'KPMF';
          else if (lib.includes('oracal')) derivedManufacturer = 'Oracal';
          else if (lib.includes('inozetek')) derivedManufacturer = 'Inozetek';
          else if (lib.includes('arlon')) derivedManufacturer = 'Arlon';
          else if (lib.includes('teckwrap')) derivedManufacturer = 'TeckWrap';
          else if (lib.includes('vvivid')) derivedManufacturer = 'VViViD';
        }
      }

      const generatedViews: Array<{ type: string; url: string }> = [...allViews]; // Keep hero view

      // Check if this is a verified database match (only relevant for non-GraphicsPro mode)
      const swatchId = selectedSwatch ? ((selectedSwatch as any).swatchId || (selectedSwatch as any).id) : null;
      const isVerifiedMatch = selectedSwatch ? ((selectedSwatch as any).isVerifiedMatch || false) : false;

      // Generate additional views in parallel with skipLookups optimization
      const promises = additionalViewTypes.map(async (viewType) => {
        // Build colorDataPayload - handle both GraphicsPro and standard modes
        let colorDataPayload: Record<string, any>;
        let useModeType: string;

        if (isGraphicsProMode) {
          // GraphicsPro mode: minimal colorData, AI interprets from prompt
          colorDataPayload = {
            colorName: 'GraphicsPro Custom',
            finish: 'custom',
            colorLibrary: 'colorpro',
            manufacturer: '',
            customStylingPrompt: options?.graphicsProPrompt,
            ...(options?.referenceImageUrl && { referenceImageUrl: options.referenceImageUrl }),
          };
          useModeType = 'GraphicsPro';
        } else {
          // Standard mode: use swatch data
          colorDataPayload = {
            colorName: selectedSwatch!.name,
            finish: selectedFinish.toLowerCase(),
            colorLibrary: selectedSwatch!.colorLibrary || 'colorpro',
            manufacturer: derivedManufacturer,
            swatchImageUrl: selectedSwatch!.swatchImageUrl,
            swatchId: swatchId || null,
            isVerifiedMatch: isVerifiedMatch,
            materialProfile: (selectedSwatch as any)?.materialProfile || null,
          };
          
          // CRITICAL: Same rule as main render - DO NOT send hex for verified matches
          if (!isVerifiedMatch) {
            colorDataPayload.hex = selectedSwatch!.hex;
          } else {
            console.log(`🎯 Verified manufacturer swatch (${viewType} view) - excluding hex`);
          }
          useModeType = 'ColorPro';
        }

        const { data, error } = await supabase.functions.invoke('generate-color-render', {
          body: {
            vehicleYear: year,
            vehicleMake: make,
            vehicleModel: model,
            colorData: colorDataPayload,
            modeType: useModeType,
            viewType,
            userEmail,
            // OPTIMIZATION: Skip redundant lookups - first render already did them
            skipLookups: true,
            // Pass GraphicsPro prompt for additional views
            ...(isGraphicsProMode && { customStylingPrompt: options?.graphicsProPrompt }),
          }
        });

        if (error) throw error;

        if (data?.renderUrl) {
          const newView = { type: viewType, url: data.renderUrl };
          // Update views progressively as each completes
          setAllViews(prev => {
            const exists = prev.some(v => v.type === viewType);
            if (exists) return prev;
            return [...prev, newView];
          });
          setPendingViews(prev => prev.filter(v => v !== viewType));
          return newView;
        }
        return null;
      });

      const results = await Promise.all(promises);
      
      // Final update with all views
      results.forEach(result => {
        if (result && !generatedViews.some(v => v.type === result.type)) {
          generatedViews.push(result);
        }
      });

      // Persist to localStorage
      localStorage.setItem('inkfusion_last_render', JSON.stringify({
        views: generatedViews,
        timestamp: Date.now()
      }));

      return { success: true, views: generatedViews };
    } catch (error: any) {
      console.error("Additional views generation error:", error);
      return { success: false, error: error.message };
    } finally {
      setIsGeneratingAdditional(false);
      setPendingViews([]);
    }
  };

  const getDefaultRenderForColor = async (colorId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('vehicle_render_images')
        .select('image_url')
        .eq('swatch_id', colorId)
        .eq('vehicle_type', 'hero')
        .eq('is_active', true)
        .limit(1);
      
      if (error || !data || data.length === 0) return null;
      return data[0].image_url;
    } catch {
      return null;
    }
  };

  const incrementGeneration = () => {
    const newCount = generationCount + 1;
    localStorage.setItem(STORAGE_KEY, newCount.toString());
    setGenerationCount(newCount);
    setHasReachedLimit(false); // Do not block generation based on local free limit
  };


  const clearLastRender = () => {
    localStorage.removeItem('inkfusion_last_render');
    setAllViews([]);
    setGeneratedImageUrl(null);
  };

  return {
    selectedSwatch,
    setSelectedSwatch,
    selectedFinish,
    setSelectedFinish,
    year,
    setYear,
    make,
    setMake,
    model,
    setModel,
    hasReachedLimit,
    remainingGenerations,
    incrementGeneration,
    showFallback,
    setShowFallback,
    isGenerating,
    generatedImageUrl,
    visualizationId,
    generateRender,
    getDefaultRenderForColor,
    allViews,
    generateAdditionalViews,
    isGeneratingAdditional,
    clearLastRender,
    showUpgradeModal,
    setShowUpgradeModal,
    vinylSwatches,
    pendingViews,
  };
};

// Backward compatibility alias
export const useInkFusionLogic = useColorProLogic;
