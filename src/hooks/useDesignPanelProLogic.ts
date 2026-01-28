import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionLimits } from "./useSubscriptionLimits";

type KitSize = "small" | "medium" | "large" | "xl";
type RoofSize = "none" | "small" | "medium" | "large";

// Error types for better handling
type GenerationError = 'auth_required' | 'limit_reached' | 'generation_failed';

export const useDesignPanelProLogic = () => {
  const { toast } = useToast();
  const { checkCanGenerate, incrementRenderCount } = useSubscriptionLimits();
  const [selectedPanel, setSelectedPanel] = useState<any>(null);
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
  const [showLoginModal, setShowLoginModal] = useState(false);

  const clearLastRender = () => {
    localStorage.removeItem('designpanelpro-last-render');
    localStorage.removeItem('designpanelpro-additional-views');
    setGeneratedImageUrl(null);
    setAllViews([]);
  };

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

  // Fetch all active panels (both curated and custom)
  const { data: curatedPanels, isLoading } = useQuery({
    queryKey: ["designpanelpro_patterns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("designpanelpro_patterns")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      
      if (error) throw error;
      
      return data || [];
    },
  });

  // FadeWraps pricing (exact copy)
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

  const generateRender = async (year: string, make: string, model: string, revisionPrompt?: string): Promise<GenerationError | null> => {
    if (!selectedPanel) return 'generation_failed';
    
    // Check subscription limits
    const canGenerate = await checkCanGenerate();
    if (!canGenerate) {
      setShowUpgradeModal(true);
      return 'limit_reached';
    }
    
    setIsGenerating(true);
    try {
      // Get user email with retry logic
      const userEmail = await getUserEmail();
      
      if (!userEmail) {
        setShowLoginModal(true);
        return 'auth_required';
      }
      
      const { data, error } = await supabase.functions.invoke('generate-color-render', {
        body: {
          vehicleYear: year,
          vehicleMake: make,
          vehicleModel: model,
          modeType: 'designpanelpro',
          viewType: 'front',
          revisionPrompt,
          userEmail,
          colorData: {
            panelName: selectedPanel.ai_generated_name || selectedPanel.name,
            panelUrl: selectedPanel.media_url,
            finish: selectedFinish.toLowerCase(),
            manufacturer: 'DesignPanelPro Patterns',
            colorLibrary: 'designpanelpro'
          }
        }
      });

      if (error) {
        // Check for auth-related errors from edge function
        if (error.message?.includes('userEmail') || error.message?.includes('anonymous')) {
          setShowLoginModal(true);
          return 'auth_required';
        }
        throw error;
      }
      
      if (data?.renderUrl) {
        setGeneratedImageUrl(data.renderUrl);
        setVisualizationId(data.renderId);
        localStorage.setItem('designpanelpro-last-render', data.renderUrl);
        
        // Increment render count after successful generation
        await incrementRenderCount();
        
        toast({ 
          title: "3D Proof Generated", 
          description: "Your DesignPanelPro™ preview is ready!" 
        });
        return null;
      }
      return 'generation_failed';
    } catch (error: any) {
      console.error('Generate render error:', error);
      
      // Check for auth-related error messages
      if (error.message?.includes('userEmail') || error.message?.includes('anonymous') || error.message?.includes('SECURITY')) {
        setShowLoginModal(true);
        return 'auth_required';
      }
      
      toast({ 
        title: "Generation failed", 
        description: error.message, 
        variant: "destructive" 
      });
      return 'generation_failed';
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAdditionalViews = async (year: string, make: string, model: string): Promise<GenerationError | null> => {
    if (!selectedPanel) return 'generation_failed';
    
    setIsGeneratingAdditional(true);
    try {
      // Get user email with retry logic
      const userEmail = await getUserEmail();
      
      if (!userEmail) {
        setShowLoginModal(true);
        return 'auth_required';
      }
      
      // Convert relative path to full URL if needed
      const panelUrl = selectedPanel.media_url.startsWith('http') 
        ? selectedPanel.media_url 
        : `${window.location.origin}${selectedPanel.media_url}`;

      // Generate close-up first (shows pattern detail)
      const closeupPromise = supabase.functions.invoke('generate-color-render', {
        body: {
          vehicleYear: year,
          vehicleMake: make,
          vehicleModel: model,
          modeType: 'designpanelpro',
          viewType: 'closeup',
          userEmail,
          colorData: {
            panelName: selectedPanel.ai_generated_name || selectedPanel.name,
            panelUrl: panelUrl,
            finish: selectedFinish.toLowerCase(),
            panelDimensions: '186x56',
          }
        }
      });

      // Then generate remaining views
      const otherViewsPromises = ['side', 'rear', 'top'].map(viewType =>
        supabase.functions.invoke('generate-color-render', {
          body: {
            vehicleYear: year,
            vehicleMake: make,
            vehicleModel: model,
            modeType: 'designpanelpro',
            viewType,
            userEmail,
            colorData: {
              panelName: selectedPanel.ai_generated_name || selectedPanel.name,
              panelUrl: panelUrl,
              finish: selectedFinish.toLowerCase(),
              panelDimensions: '186x56',
              heroReferenceUrl: generatedImageUrl,
            }
          }
        })
      );

      const allPromises = [closeupPromise, ...otherViewsPromises];
      const results = await Promise.all(allPromises);
      
      const views = results
        .map((result, index) => ({
          type: ['closeup', 'side', 'rear', 'top'][index],
          url: result.data?.renderUrl
        }))
        .filter(view => view.url);

      setAllViews(views);
      localStorage.setItem('designpanelpro-additional-views', JSON.stringify(views));
      toast({ 
        title: "Additional views generated", 
        description: `${views.length} views ready!` 
      });
      return null;
    } catch (error: any) {
      console.error('Generate additional views error:', error);
      
      // Check for auth-related error messages
      if (error.message?.includes('userEmail') || error.message?.includes('anonymous') || error.message?.includes('SECURITY')) {
        setShowLoginModal(true);
        return 'auth_required';
      }
      
      toast({ 
        title: "Generation failed", 
        description: error.message, 
        variant: "destructive" 
      });
      return 'generation_failed';
    } finally {
      setIsGeneratingAdditional(false);
    }
  };

  // Save design job to database for purchase flow
  const saveDesignJob = async (year: string, make: string, model: string) => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('panel_designs')
        .insert({
          user_id: authData?.user?.id || null,
          panel_id: selectedPanel?.id || null,
          vehicle_year: year,
          vehicle_make: make,
          vehicle_model: model,
          finish: selectedFinish.toLowerCase(),
          preview_image_url: generatedImageUrl,
          prompt_state: {
            panelName: selectedPanel?.ai_generated_name || selectedPanel?.name,
            panelUrl: selectedPanel?.media_url,
            thumbnailUrl: selectedPanel?.thumbnail_url || selectedPanel?.clean_display_url || selectedPanel?.media_url,
            allViews: allViews.map(v => ({ type: v.type, url: v.url })),
            heroUrl: generatedImageUrl
          }
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error saving design job:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Failed to save design job:', error);
      return null;
    }
  };

  return {
    selectedPanel,
    setSelectedPanel,
    selectedFinish,
    setSelectedFinish,
    curatedPanels,
    isLoading,
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
    showLoginModal,
    setShowLoginModal,
    clearLastRender,
    saveDesignJob,
  };
};
