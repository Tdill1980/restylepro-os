import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscriptionLimits } from "./useSubscriptionLimits";
import { toast } from "@/hooks/use-toast";
import { parseGraphicsProLabel, detectFinishFromPrompt, detectManufacturerFromPrompt } from "@/lib/graphicspro-label-parser";

const STORAGE_KEY = "graphicspro-generations";

export type ViewType = 'hood_detail' | 'side' | 'front' | 'rear' | 'top';

// Helper to get user email with robust retry
const getUserEmail = async (): Promise<string | null> => {
  // First attempt - check current session
  let { data: { session } } = await supabase.auth.getSession();
  if (session?.user?.email) {
    return session.user.email;
  }
  
  // Second attempt - try getUser
  let { data: { user } } = await supabase.auth.getUser();
  if (user?.email) {
    return user.email;
  }
  
  // Third attempt - refresh session
  const refreshResult = await supabase.auth.refreshSession();
  if (refreshResult.data?.session?.user?.email) {
    return refreshResult.data.session.user.email;
  }
  
  // Final attempts with delays (3 retries, 300ms apart)
  for (let i = 0; i < 3; i++) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const result = await supabase.auth.getSession();
    if (result.data?.session?.user?.email) {
      return result.data.session.user.email;
    }
  }
  
  console.warn('getUserEmail: All attempts failed to get user email');
  return null;
};

export const useGraphicsProLogic = () => {
  const { checkCanGenerate, incrementRenderCount } = useSubscriptionLimits();
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [stylingPrompt, setStylingPrompt] = useState("");
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null);
  const [selectedViewType, setSelectedViewType] = useState<ViewType>('side');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [visualizationId, setVisualizationId] = useState<string | null>(null);
  const [allViews, setAllViews] = useState<Array<{ type: string; url: string }>>([]);
  const [isGeneratingAdditional, setIsGeneratingAdditional] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingViews, setPendingViews] = useState<string[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [styleDescription, setStyleDescription] = useState<string | null>(null);
  const [presetCategory, setPresetCategory] = useState<string | null>(null);

  const generateRender = async (revisionPrompt?: string) => {
    if (!stylingPrompt?.trim()) {
      toast({
        title: "Enter a Style Prompt",
        description: "Describe your wrap design, e.g. 'top half gold chrome, bottom half satin black'",
        variant: "destructive"
      });
      return { success: false, error: "Missing styling prompt" };
    }

    if (!year || !make || !model) {
      toast({
        title: "Vehicle Required",
        description: "Please enter year, make, and model",
        variant: "destructive"
      });
      return { success: false, error: "Missing vehicle details" };
    }

    // Check subscription limits
    const canGenerate = await checkCanGenerate();
    if (!canGenerate) {
      setShowUpgradeModal(true);
      return { success: false, error: "Subscription limit reached" };
    }

    setIsGenerating(true);
    
    // Don't clear views if this is a revision
    if (!revisionPrompt) {
      setGeneratedImageUrl(null);
      setAllViews([]);
    }

    try {
      const userEmail = await getUserEmail();
      
      if (!userEmail) {
        setShowLoginModal(true);
        return { success: false, error: "auth_required" };
      }

      console.log('🎨 GraphicsPro render request:', {
        prompt: stylingPrompt,
        vehicle: `${year} ${make} ${model}`,
        viewType: selectedViewType,
        revision: revisionPrompt ? 'YES' : 'NO'
      });

      const { data, error } = await supabase.functions.invoke('generate-color-render', {
        body: {
          vehicleYear: year,
          vehicleMake: make,
          vehicleModel: model,
          colorData: {
            colorName: parseGraphicsProLabel(stylingPrompt),
            finish: detectFinishFromPrompt(stylingPrompt),
            colorLibrary: 'graphicspro',
            manufacturer: detectManufacturerFromPrompt(stylingPrompt),
            customStylingPrompt: stylingPrompt,
            ...(referenceImageUrl && { referenceImageUrl }),
          },
          modeType: 'GraphicsPro',
          viewType: selectedViewType,
          userEmail,
          selectedPreset,
          styleDescription,
          presetCategory, // Pass to backend for stripe mode detection
          ...(revisionPrompt && { revisionPrompt }),
        }
      });

      if (error) {
        console.error("Edge function error:", error);
        toast({
          title: "Generation Failed",
          description: error.message || "Edge function returned an error.",
          variant: "destructive"
        });
        throw error;
      }

      // Handle print-required redirect
      if (data?.error === 'print_required') {
        return { success: false, error: 'print_required', message: data.message };
      }

      if (data?.renderUrl) {
        const newViews = [{ type: selectedViewType, url: data.renderUrl }];
        setGeneratedImageUrl(data.renderUrl);
        setVisualizationId(data.renderId);
        setAllViews(newViews);
        
        localStorage.setItem(STORAGE_KEY + '_last_render', JSON.stringify({
          views: newViews,
          timestamp: Date.now()
        }));
        
        await incrementRenderCount();
        
        toast({
          title: "Render Generated!",
          description: "Generating additional views...",
        });
        
        // Auto-generate additional views after initial render
        if (!revisionPrompt) {
          // Set pending views immediately for skeleton display
          const additionalViewTypes = ['front', 'rear', 'top'].filter(v => v !== selectedViewType);
          setPendingViews(additionalViewTypes);
          
          // Trigger additional views generation (don't await - let it run in background)
          setTimeout(() => {
            generateAdditionalViewsInternal(userEmail, additionalViewTypes);
          }, 500);
        }
        
        return { success: true, imageUrl: data.renderUrl };
      }

      toast({
        title: "Generation Failed",
        description: "No image URL was returned.",
        variant: "destructive"
      });
      return { success: false, error: "No image URL returned" };
    } catch (error: any) {
      console.error("🚨 Generation error:", error);
      
      // Check for auth-related error messages
      if (error.message?.includes('userEmail') || error.message?.includes('anonymous') || error.message?.includes('SECURITY')) {
        setShowLoginModal(true);
        return { success: false, error: "auth_required" };
      }
      
      toast({
        title: "Generation Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setIsGenerating(false);
    }
  };

  // Internal function for auto-generating additional views (called automatically after first render)
  const generateAdditionalViewsInternal = async (userEmail: string, viewTypes: string[]) => {
    setIsGeneratingAdditional(true);
    
    try {
      const generatedViews: Array<{ type: string; url: string }> = [...allViews];

      const promises = viewTypes.map(async (viewType) => {
        const { data, error } = await supabase.functions.invoke('generate-color-render', {
          body: {
            vehicleYear: year,
            vehicleMake: make,
            vehicleModel: model,
            colorData: {
              colorName: parseGraphicsProLabel(stylingPrompt),
              finish: detectFinishFromPrompt(stylingPrompt),
              colorLibrary: 'graphicspro',
              manufacturer: detectManufacturerFromPrompt(stylingPrompt),
              customStylingPrompt: stylingPrompt,
              ...(referenceImageUrl && { referenceImageUrl }),
            },
            modeType: 'GraphicsPro',
            viewType,
            userEmail,
            skipLookups: true,
          }
        });

        if (error) throw error;

        if (data?.renderUrl) {
          const newView = { type: viewType, url: data.renderUrl };
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
      
      results.forEach(result => {
        if (result && !generatedViews.some(v => v.type === result.type)) {
          generatedViews.push(result);
        }
      });

      localStorage.setItem(STORAGE_KEY + '_last_render', JSON.stringify({
        views: generatedViews,
        timestamp: Date.now()
      }));

      toast({
        title: "All Views Ready!",
        description: "4 view renders completed.",
      });

      return { success: true, views: generatedViews };
    } catch (error: any) {
      console.error("Additional views generation error:", error);
      toast({
        title: "Some Views Failed",
        description: "Primary view is ready. Try generating additional views manually.",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setIsGeneratingAdditional(false);
      setPendingViews([]);
    }
  };

  // Manual trigger for generating additional views (if needed)
  const generateAdditionalViews = async () => {
    if (!stylingPrompt?.trim() || !year || !make || !model) {
      return { success: false, error: "Missing required fields" };
    }

    const userEmail = await getUserEmail();
    if (!userEmail) {
      setShowLoginModal(true);
      return { success: false, error: "auth_required" };
    }

    const additionalViewTypes = ['front', 'rear', 'top'].filter(v => v !== selectedViewType);
    setPendingViews(additionalViewTypes);
    
    return generateAdditionalViewsInternal(userEmail, additionalViewTypes);
  };

  const clearLastRender = () => {
    localStorage.removeItem(STORAGE_KEY + '_last_render');
    setAllViews([]);
    setGeneratedImageUrl(null);
    setVisualizationId(null);
  };

  return {
    year,
    setYear,
    make,
    setMake,
    model,
    setModel,
    stylingPrompt,
    setStylingPrompt,
    referenceImageUrl,
    setReferenceImageUrl,
    selectedViewType,
    setSelectedViewType,
    isGenerating,
    generatedImageUrl,
    visualizationId,
    allViews,
    isGeneratingAdditional,
    pendingViews,
    showUpgradeModal,
    setShowUpgradeModal,
    showLoginModal,
    setShowLoginModal,
    selectedPreset,
    setSelectedPreset,
    styleDescription,
    setStyleDescription,
    presetCategory,
    setPresetCategory,
    generateRender,
    generateAdditionalViews,
    clearLastRender,
  };
};
