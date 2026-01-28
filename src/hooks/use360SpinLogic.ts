import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getAllAngles, getSpinViewAngle } from '@/lib/spin-view-angles';

interface Use360SpinLogicProps {
  visualizationId?: string;
  vehicleData: {
    year: string;
    make: string;
    model: string;
    type?: string;
  };
  colorData: {
    colorName: string;
    colorHex: string;
    finish: string;
    manufacturer?: string;
    colorLibrary?: string;
    [key: string]: any;
  };
}

export function use360SpinLogic({
  visualizationId,
  vehicleData,
  colorData
}: Use360SpinLogicProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [currentAngleLabel, setCurrentAngleLabel] = useState('');
  const [generatedPreviews, setGeneratedPreviews] = useState<{angle: number, url: string, label: string}[]>([]);
  const [spinViewUrls, setSpinViewUrls] = useState<Record<number, string>>({});
  const [has360Spin, setHas360Spin] = useState(false);
  const { toast } = useToast();

  const angles = getAllAngles(); // [0, 30, 60, ..., 330]

  const generate360Spin = useCallback(async () => {
    if (!vehicleData.year || !vehicleData.make || !vehicleData.model) {
      toast({
        title: "Missing vehicle information",
        description: "Please select a vehicle before generating 360° view",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setCurrentAngle(0);
    setCurrentAngleLabel('Generating all angles...');
    setGeneratedPreviews([]);
    const generatedUrls: Record<number, string> = {};
    let completedCount = 0;

    try {
      console.log('🚀 Starting parallel 360° generation for all 12 angles...');
      
      // Generate all 12 angles in parallel using Promise.allSettled
      const generationPromises = angles.map(async (angle) => {
        const angleInfo = getSpinViewAngle(angle);
        
        try {
          const { data, error } = await supabase.functions.invoke('generate-color-render', {
            body: {
              vehicleYear: vehicleData.year,
              vehicleMake: vehicleData.make,
              vehicleModel: vehicleData.model,
              vehicleType: vehicleData.type,
              modeType: colorData.mode_type || 'colorpro',
              colorData: {
                ...colorData,
                mode_type: 'spin_view'
              },
              cameraAngle: angle,
              viewType: 'spin',
              renderOptions: {
                quality: 'high',
                aspectRatio: '16:9'
              }
            }
          });

          if (error) {
            console.error(`❌ Error generating angle ${angle}°:`, error);
            throw new Error(`Failed to generate angle ${angle}°`);
          }

          // Handle both property names: renderUrl (from cache) or imageUrl (from generation)
          const imageUrl = data?.renderUrl || data?.imageUrl;
          if (!imageUrl) {
            throw new Error(`No image URL returned for angle ${angle}°`);
          }

          // Update progress dynamically as each angle completes
          completedCount++;
          setCurrentAngle(completedCount);
          setCurrentAngleLabel(`${completedCount} of ${angles.length} complete`);
          
          // Add to preview strip immediately
          setGeneratedPreviews(prev => [...prev, {
            angle,
            url: imageUrl,
            label: angleInfo?.label || `${angle}°`
          }].sort((a, b) => a.angle - b.angle)); // Keep sorted by angle

          console.log(`✅ Angle ${angle}° completed (${completedCount}/${angles.length})`);
          
          return { angle, imageUrl, success: true };
        } catch (error) {
          console.error(`❌ Failed to generate angle ${angle}°:`, error);
          return { angle, error, success: false };
        }
      });

      // Wait for all promises to settle (success or failure)
      const results = await Promise.allSettled(generationPromises);
      
      // Process results and extract successful URLs
      let successCount = 0;
      let failureCount = 0;
      
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.success) {
          const { angle, imageUrl } = result.value;
          generatedUrls[angle] = imageUrl;
          successCount++;
        } else {
          failureCount++;
          if (result.status === 'rejected') {
            console.error('Promise rejected:', result.reason);
          }
        }
      });

      console.log(`📊 360° Generation Complete: ${successCount} succeeded, ${failureCount} failed`);

      // Only proceed if we have at least some successful renders
      if (successCount === 0) {
        throw new Error('All 360° angle generations failed. Please try again.');
      }

      // Warn if some angles failed
      if (failureCount > 0) {
        toast({
          title: "Partial Success",
          description: `${successCount} of ${angles.length} angles generated. Some angles failed but you can still view the 360° spin.`,
          variant: "default"
        });
      }

      // Update database with spin view URLs (merge with existing render_urls)
      if (visualizationId) {
        // Fetch existing render_urls to preserve other views
        const { data: existingViz } = await supabase
          .from('color_visualizations')
          .select('render_urls')
          .eq('id', visualizationId)
          .single();

        const existingRenderUrls = (existingViz?.render_urls as Record<string, any>) || {};
        
        const { error: updateError } = await supabase
          .from('color_visualizations')
          .update({
            render_urls: {
              ...existingRenderUrls,
              spin_views: generatedUrls
            },
            has_360_spin: true,
            spin_view_count: angles.length
          })
          .eq('id', visualizationId);

        if (updateError) {
          console.error('Error updating visualization with 360° data:', updateError);
        }
      }

      setSpinViewUrls(generatedUrls);
      setHas360Spin(true);

      toast({
        title: "360° Spin View Complete! 🎉",
        description: `All ${angles.length} angles generated successfully. Drag to rotate your vehicle.`
      });
    } catch (error) {
      console.error('Error generating 360° spin:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate 360° view",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setCurrentAngle(0);
    }
  }, [vehicleData, colorData, visualizationId, angles, toast]);

  const clear360Spin = useCallback(() => {
    setSpinViewUrls({});
    setHas360Spin(false);
    setCurrentAngle(0);
  }, []);

  // Convert spinViewUrls object to ordered array for Vehicle360Viewer
  const getSpinImagesArray = useCallback(() => {
    return angles.map(angle => spinViewUrls[angle]).filter(Boolean);
  }, [spinViewUrls, angles]);

  return {
    // State
    isGenerating,
    currentAngle,
    currentAngleLabel,
    generatedPreviews,
    spinViewUrls,
    has360Spin,
    totalAngles: angles.length,

    // Actions
    generate360Spin,
    clear360Spin,
    getSpinImagesArray
  };
}
