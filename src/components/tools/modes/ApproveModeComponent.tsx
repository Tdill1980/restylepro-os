import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { renderClient } from "@/integrations/supabase/renderClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ApproveModeRenderDisplay } from "../ApproveModeRenderDisplay";
import { use360SpinLogic } from "@/hooks/use360SpinLogic";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFreemiumLimits } from "@/hooks/useFreemiumLimits";
import { useRevisionHistory } from "@/hooks/useRevisionHistory";
import { RevisionHistoryTimeline } from "@/components/tools/RevisionHistoryTimeline";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Upload, Loader2, Sparkles, FileDown, Save, X, RotateCw, Rotate3D, Maximize2, Download, CheckCircle2, ClipboardSignature } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateProofSheet } from "@/lib/pdf-generator";
import { Badge } from "@/components/ui/badge";
import { Vehicle360Viewer } from "@/components/visualize/Vehicle360Viewer";
import { Vehicle360LoadingState } from "@/components/visualize/Vehicle360LoadingState";
import { MobileZoomImageModal } from "@/components/visualize/MobileZoomImageModal";
import { BeforeAfterSlider } from "@/components/gallery/BeforeAfterSlider";
import { StudioProofLayout } from "../StudioProofLayout";
import { ProfessionalProofSheet } from "../ProfessionalProofSheet";
import { ProofPreviewCard } from "../ProofPreviewCard";
import { PaywallModal } from "@/components/PaywallModal";
import { SocialEngagementModal } from "@/components/SocialEngagementModal";
import { FreemiumCounter } from "@/components/FreemiumCounter";
import { DesignRevisionPrompt } from "@/components/tools/DesignRevisionPrompt";
import { MarkAsPerfectButton } from "@/components/MarkAsPerfectButton";

export const ApproveModeComponent = () => {
  const [searchParams] = useSearchParams();
  const [selectedExample, setSelectedExample] = useState<any>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { 
    canGenerate: canGenerateFreemium, phase: freemiumPhase, isPrivileged, 
    totalRemaining, incrementGeneration: incrementFreemium, unlockBonus 
  } = useFreemiumLimits();
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  
  // Generator state
  const [designFile, setDesignFile] = useState<{ url: string; fileName: string } | null>(null);
  const [uploadingDesign, setUploadingDesign] = useState(false);
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [allViews, setAllViews] = useState<Array<{ type: string; url: string; label: string }>>([]);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 6 });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSavingToGallery, setIsSavingToGallery] = useState(false);
  const [expandedImageIndex, setExpandedImageIndex] = useState<number | null>(null);
  const [show360View, setShow360View] = useState(false);
  const [visualizationId, setVisualizationId] = useState<string | null>(null);
  const [selectedCompareView, setSelectedCompareView] = useState(0);
  const [showStudioProof, setShowStudioProof] = useState(false);
  const [showProofSheet, setShowProofSheet] = useState(false);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [isRevising, setIsRevising] = useState(false);

  // Revision history for ApprovePro
  const { revisionHistory, saveRevision, loadHistory } = useRevisionHistory('approvemode');

  // Load revision history on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // 360° Spin View Logic
  const {
    isGenerating: is360Generating,
    currentAngle: current360Angle,
    has360Spin,
    totalAngles,
    generate360Spin,
    clear360Spin,
    getSpinImagesArray
  } = use360SpinLogic({
    visualizationId,
    vehicleData: {
      year: year || '',
      make: make || '',
      model: model || '',
    },
    colorData: {
      colorName: '',
      colorHex: '#000000',
      finish: 'gloss',
      designUrl: designFile?.url,
      mode_type: 'approvemode'
    }
  });

  // Auto-show 360° viewer when generation completes
  useEffect(() => {
    if (has360Spin) {
      setShow360View(true);
      // Auto-scroll to 360° viewer section
      setTimeout(() => {
        const spinSection = document.getElementById('spin-viewer-section');
        if (spinSection) {
          spinSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, [has360Spin]);

  const { data: examples, isLoading } = useQuery({
    queryKey: ["approvemode_examples"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("approvemode_examples")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Auto-rotate examples every 3 seconds
  useEffect(() => {
    if (!examples || examples.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentExampleIndex((prev) => (prev + 1) % examples.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [examples]);

  // Clear renders when vehicle details change (to prevent stale renders)
  const [previousVehicle, setPreviousVehicle] = useState<string>('');
  useEffect(() => {
    const currentVehicle = `${year}-${make}-${model}`;
    // Only clear if there are existing renders AND the vehicle actually changed (not initial load)
    if (previousVehicle && currentVehicle !== previousVehicle && allViews.length > 0) {
      setAllViews([]);
      setGeneratedImageUrl(null);
      setVisualizationId(null);
      clear360Spin();
      toast({
        title: 'Vehicle changed',
        description: 'Previous renders cleared. Generate new views for this vehicle.',
      });
    }
    setPreviousVehicle(currentVehicle);
  }, [year, make, model]);

  // Function to clear all renders manually
  const handleClearRenders = () => {
    setAllViews([]);
    setGeneratedImageUrl(null);
    setVisualizationId(null);
    clear360Spin();
    toast({
      title: 'Renders cleared',
      description: 'Ready to generate new views.',
    });
  };

  // Load visualization from URL parameter
  useEffect(() => {
    const visualizationIdParam = searchParams.get('visualizationId');
    if (!visualizationIdParam) return;

    const loadVisualization = async () => {
      try {
        const { data, error } = await supabase
          .from('color_visualizations')
          .select('*')
          .eq('id', visualizationIdParam)
          .single();

        if (error) throw error;
        if (!data) return;

        // Set vehicle info
        setYear(data.vehicle_year?.toString() || '');
        setMake(data.vehicle_make || '');
        setModel(data.vehicle_model || '');

        // Set design file if exists
        if (data.custom_design_url) {
          setDesignFile({
            url: data.custom_design_url,
            fileName: data.design_file_name || 'Loaded Design'
          });
        }

        // Load render URLs into allViews
        const renderUrls = data.render_urls as Record<string, any> | null;
        if (renderUrls) {
          const viewLabels: Record<string, string> = {
            'front': 'Front',
            'side': 'Driver Side',
            'passenger-side': 'Passenger Side',
            'rear': 'Rear',
            'top': 'Top',
            'hero': 'Hero View'
          };

          const loadedViews = Object.entries(renderUrls)
            .filter(([key, val]) => !key.includes('spin') && typeof val === 'string')
            .map(([viewType, url]) => {
              const urlStr = url as string;
              const cacheBustedUrl = `${urlStr}${urlStr.includes('?') ? '&' : '?'}cb=${Date.now()}`;
              return {
                type: viewType,
                url: cacheBustedUrl,
                label: viewLabels[viewType] || viewType
              };
            });

          if (loadedViews.length > 0) {
            setAllViews(loadedViews);
            setGeneratedImageUrl(loadedViews[0].url);
          }
        }

        setVisualizationId(visualizationIdParam);
        toast({ title: 'Visualization loaded', description: 'All views from gallery have been loaded' });
      } catch (error: any) {
        console.error('Error loading visualization:', error);
        toast({ title: 'Failed to load visualization', variant: 'destructive' });
      }
    };

    loadVisualization();
  }, [searchParams]);

  const handleDesignUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Please upload PNG or JPG', variant: 'destructive' });
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Maximum file size is 20MB', variant: 'destructive' });
      return;
    }

    try {
      setUploadingDesign(true);
      const fileName = `${crypto.randomUUID()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage
        .from('wrap-files')
        .upload(`approvemode/${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('wrap-files')
        .getPublicUrl(`approvemode/${fileName}`);

      setDesignFile({ url: publicUrl, fileName: file.name });
      toast({ title: 'Design uploaded successfully' });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploadingDesign(false);
    }
  };

  const generateWithTimeout = async (viewType: string, timeoutMs = 90000) => {
    // Get user email for authentication
    const { data: { user } } = await supabase.auth.getUser();
    const userEmail = user?.email;
    
    if (!userEmail) {
      throw new Error('Authentication required. Please log in to generate renders.');
    }
    
    // Build colorData payload for ApproveMode - just design info
    const colorData: any = {
      designUrl: designFile.url,
      designName: designFile.fileName
    };
    
    return Promise.race([
      renderClient.functions.invoke('generate-color-render', {
        body: {
          vehicleYear: year,
          vehicleMake: make,
          vehicleModel: model,
          colorData,
          modeType: 'approvemode',
          viewType,
          userEmail
        }
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout generating ${viewType} view`)), timeoutMs)
      )
    ]);
  };

  const handleGenerate = async () => {
    if (!designFile || !year || !make || !model) {
      toast({ title: 'Missing information', description: 'Please upload a design and enter vehicle details', variant: 'destructive' });
      return;
    }

    // Check freemium limits first (unless privileged)
    if (!isPrivileged && !canGenerateFreemium) {
      if (freemiumPhase === 'engagement') {
        setSocialModalOpen(true);
      } else if (freemiumPhase === 'paywall') {
        setPaywallOpen(true);
      }
      return;
    }

    setIsGenerating(true);
    setGeneratedImageUrl(null);
    setAllViews([]);
    setGenerationProgress({ current: 1, total: 6 });

    try {
      // Generate all 6 views at once
      const viewTypes = ['front', 'side', 'passenger-side', 'rear', 'top', 'hero'];
      const viewLabels: Record<string, string> = {
        'front': 'Front',
        'side': 'Driver Side',
        'passenger-side': 'Passenger Side',
        'rear': 'Rear',
        'top': 'Top',
        'hero': 'Hero View'
      };
      
      // Generate all views in parallel
      const viewPromises = viewTypes.map(viewType => 
        generateWithTimeout(viewType).catch(error => {
          console.error(`Failed to generate ${viewType}:`, error);
          return { error, viewType };
        })
      );

      const results = await Promise.all(viewPromises);
      
      // Process results - collect all successful views with cache-busting
      const newViews = results
        .map((result: any, index) => {
          const viewType = viewTypes[index];
          if (!result.error && result.data?.renderUrl) {
            const cacheBustedUrl = `${result.data.renderUrl}${result.data.renderUrl.includes('?') ? '&' : '?'}cb=${Date.now()}`;
            return { 
              type: viewType, 
              url: cacheBustedUrl, 
              label: viewLabels[viewType] 
            };
          }
          return null;
        })
        .filter((v): v is { type: string; url: string; label: string } => v !== null);

      if (newViews.length === 0) {
        throw new Error('Failed to generate any views');
      }

      // Set the first view as hero image and store all views
      setGeneratedImageUrl(newViews[0].url);
      setAllViews(newViews);

      // Track freemium usage
      if (!isPrivileged) {
        incrementFreemium();
      }

      const successCount = newViews.length;
      const failedCount = 6 - successCount;

      toast({
        title: `${successCount} views generated!`,
        description: failedCount > 0 
          ? `${failedCount} views failed. You can download the PDF or save to gallery.`
          : "All 6 professional views ready! Download PDF or save to gallery.",
      });

    } catch (error: any) {
      console.error('Generation error:', error);
      toast({ title: 'Generation failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevisionSubmit = async (revisionPrompt: string) => {
    if (!designFile || !year || !make || !model) return;
    
    const originalUrl = generatedImageUrl;
    setIsRevising(true);
    setGeneratedImageUrl(null);
    setAllViews([]);

    try {
      // Generate all 6 views with revision prompt
      const viewTypes = ['front', 'side', 'passenger-side', 'rear', 'top', 'hero'];
      const viewLabels: Record<string, string> = {
        'front': 'Front',
        'side': 'Driver Side',
        'passenger-side': 'Passenger Side',
        'rear': 'Rear',
        'top': 'Top',
        'hero': 'Hero View'
      };
      
      const colorData: any = {
        designUrl: designFile.url,
        designName: designFile.fileName
      };
      
      // Generate all views in parallel with revision prompt
      const viewPromises = viewTypes.map(viewType => 
        renderClient.functions.invoke('generate-color-render', {
          body: {
            vehicleYear: year,
            vehicleMake: make,
            vehicleModel: model,
            colorData,
            modeType: 'approvemode',
            viewType,
            revisionPrompt
          }
        }).catch(error => ({ error, viewType }))
      );

      const results = await Promise.all(viewPromises);
      
      const newViews = results
        .map((result: any, index) => {
          const viewType = viewTypes[index];
          if (!result.error && result.data?.renderUrl) {
            const cacheBustedUrl = `${result.data.renderUrl}${result.data.renderUrl.includes('?') ? '&' : '?'}cb=${Date.now()}`;
            return { 
              type: viewType, 
              url: cacheBustedUrl, 
              label: viewLabels[viewType] 
            };
          }
          return null;
        })
        .filter((v): v is { type: string; url: string; label: string } => v !== null);

      if (newViews.length === 0) {
        throw new Error('Failed to generate any views');
      }

      setGeneratedImageUrl(newViews[0].url);
      setAllViews(newViews);

      // Save revision to history
      await saveRevision({
        viewType: 'all_views',
        originalUrl,
        revisedUrl: newViews[0].url,
        revisionPrompt
      });

      toast({
        title: "Revision applied!",
        description: `${newViews.length} views regenerated with your changes`,
      });

    } catch (error: any) {
      console.error('Revision error:', error);
      toast({ title: 'Revision failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsRevising(false);
    }
  };


  const handleGenerateProofSheet = async () => {
    if (allViews.length < 6) {
      toast({ 
        title: 'Not all views generated', 
        description: 'Please generate all 6 views before creating the proof sheet', 
        variant: 'destructive' 
      });
      return;
    }

    // Debug logging: show exactly what views are going into the PDF
    console.log('ApprovePro - allViews before PDF:', allViews);
    console.table(
      allViews.map((v, idx) => ({
        index: idx,
        type: v.type,
        url: v.url,
        label: v.label,
      }))
    );

    const pdfViews = allViews;

    setIsGeneratingPDF(true);
    try {
      await generateProofSheet({
        views: pdfViews,
        vehicleInfo: { year, make, model },
        designName: designFile?.fileName || 'Custom Design'
      });
      
      toast({
        title: "Proof sheet generated!",
        description: "PDF has been downloaded successfully",
      });
    } catch (error: any) {
      console.error('PDF generation error:', error);
      toast({ 
        title: 'PDF generation failed', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  const handleSaveToGallery = async () => {
    if (allViews.length < 6) {
      toast({ 
        title: 'Not all views generated', 
        description: 'Please generate all 6 views before saving to gallery', 
        variant: 'destructive' 
      });
      return;
    }

    setIsSavingToGallery(true);
    try {
      const vehicleName = `${year} ${make} ${model}`;
      const designName = designFile?.fileName || 'Custom Design';

      // Insert all 6 views into approvemode_carousel with before_url
      const insertPromises = allViews.map((view, index) => {
        return supabase.from('approvemode_carousel').insert({
          media_url: view.url,
          before_url: designFile?.url || null,
          name: `${vehicleName} - ${view.label}`,
          vehicle_name: vehicleName,
          color_name: designName,
          title: view.label,
          subtitle: `${designName} on ${vehicleName}`,
          sort_order: index,
          is_active: true
        });
      });

      const results = await Promise.all(insertPromises);
      
      // Check for errors
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        throw new Error(`Failed to save ${errors.length} views: ${errors[0].error?.message}`);
      }

      toast({
        title: "Saved to gallery!",
        description: "All 6 views have been saved to the gallery",
      });
    } catch (error: any) {
      console.error('Save to gallery error:', error);
      toast({ 
        title: 'Failed to save to gallery', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setIsSavingToGallery(false);
    }
  };
  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 360° Badge at Top */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
          <Rotate3D className="w-5 h-5 text-cyan-400 icon-360-glow animate-pulse" />
          <span className="text-sm font-medium text-cyan-300">360° Spin Views Available</span>
        </div>
      </div>

      {/* Description - Fleet Expansion USP */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-4">
        <p className="text-sm font-semibold text-foreground text-center mb-1">
          One Design → <span className="text-cyan-400">Any Vehicle</span>
        </p>
        <p className="text-xs text-muted-foreground/90 text-center">
          Upload your 2D design proof → Enter vehicle details → See photorealistic 3D renders instantly
        </p>
      </div>


      {/* Generator Section - Compact Layout */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Generate Professional 3D Views</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Design Upload */}
          <div className="space-y-4">
            <Label>Upload 2D Design</Label>
            <div className="border-2 border-dashed rounded-lg p-4">
              {designFile ? (
                <div className="space-y-3">
                  <img src={designFile.url} alt="Design" className="w-full rounded" />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setDesignFile(null)}
                  >
                    Upload Different Design
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={handleDesignUpload}
                    disabled={uploadingDesign}
                  />
                  <div className="space-y-2 text-center">
                    {uploadingDesign ? (
                      <Loader2 className="w-10 h-10 mx-auto animate-spin text-muted-foreground" />
                    ) : (
                      <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
                    )}
                    <p className="text-sm text-muted-foreground">
                      {uploadingDesign ? 'Uploading...' : 'Click to upload design'}
                    </p>
                    <p className="text-xs text-muted-foreground">PNG or JPG (max 20MB)</p>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Vehicle Info & Generate */}
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-base font-semibold">
                Vehicle Details
              </Label>
              <p className="text-xs text-muted-foreground">
                Enter the vehicle you want to visualize your design on
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input
                type="text"
                placeholder="Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Make"
                value={make}
                onChange={(e) => setMake(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>

            {/* Clear Renders Button - appears when renders exist */}
            {allViews.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearRenders}
                className="w-full text-muted-foreground hover:text-destructive hover:border-destructive"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Renders & Start Fresh
              </Button>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={handleGenerate}
              disabled={!designFile || !year || !make || !model || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating All 6 Views...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate All 6 Professional Views
                </>
              )}
            </Button>

            {/* Call-out badge for 360° button */}
            {!has360Spin && allViews.length > 0 && (
              <div className="flex justify-center -mb-2">
                <span className="text-xs text-cyan-400 animate-pulse flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> ✨ NEW: Export for Instagram Reels!
                </span>
              </div>
            )}

            {/* 360° Spin View Button - Always visible when render exists */}
            {designFile && year && make && model && (
              <Button
                onClick={generate360Spin}
                disabled={is360Generating || has360Spin}
                className={cn(
                  "w-full gap-2 transition-all duration-300 relative",
                  is360Generating && "btn-360-glow-generating animate-pulse",
                  !has360Spin && !is360Generating && designFile && year && make && model && "btn-360-glow border-0 animate-pulse shadow-lg shadow-cyan-500/50"
                )}
                size="lg"
              >
                <Rotate3D className={cn("w-5 h-5", !has360Spin && !is360Generating && "icon-360-glow")} />
                <span className="font-semibold">
                  {is360Generating ? "Generating 360° Spin..." : has360Spin ? "✓ 360° View Ready" : "Generate 360° Spin View"}
                </span>
                {!is360Generating && !has360Spin && (
                  <Badge variant="secondary" className="absolute -top-2 -right-2 bg-cyan-500 text-white text-xs px-2">NEW</Badge>
                )}
              </Button>
            )}
            <p className="text-xs text-center text-muted-foreground -mt-1">
              {!designFile || !year || !make || !model
                ? "Complete all fields first to enable 360°" 
                : has360Spin 
                  ? "✓ 12 angles ready • Drag to rotate • Export for Reels"
                  : "12 angles • ~2 min • Export for Reels"
              }
            </p>

            {/* Generate Proof Sheet Button - appears after views are generated */}
            {allViews.length > 0 && (
              <div className="space-y-2">
                <Button
                  className="w-full"
                  size="lg"
                  variant="default"
                  onClick={handleGenerateProofSheet}
                  disabled={isGeneratingPDF || allViews.length < 6 || is360Generating}
                >
                  {isGeneratingPDF ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4 mr-2" />
                      Download Design Proof Sheet (PDF)
                    </>
                  )}
                </Button>

                <Button
                  className="w-full"
                  size="lg"
                  variant="secondary"
                  onClick={() => setShowProofSheet(true)}
                >
                  <ClipboardSignature className="w-4 h-4 mr-2" />
                  Generate Customer Approval Proof
                </Button>
              </div>
            )}

            {/* Design Revision Prompt - Always visible as selling point */}
            <DesignRevisionPrompt
              onRevisionSubmit={handleRevisionSubmit}
              isGenerating={isRevising || isGenerating}
              disabled={allViews.length === 0 || !designFile || !year || !make || !model}
            />

            {/* Revision History Timeline */}
            {revisionHistory.length > 0 && (
              <RevisionHistoryTimeline
                history={revisionHistory}
                onSelect={(item) => {
                  if (item.revised_url) {
                    setExpandedImageIndex(0);
                  }
                }}
                className="mt-4"
              />
            )}

            {/* 360° Loading State */}
            {is360Generating && (
              <Vehicle360LoadingState
                totalAngles={totalAngles}
                currentAngle={current360Angle}
                onCancel={clear360Spin}
              />
            )}

            {/* 360° Viewer with Toggle */}
            {has360Spin && (
              <Card id="spin-viewer-section" className="p-4 bg-secondary/20 border-border mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <RotateCw className="w-4 h-4" />
                    360° Spin View
                  </h4>
                  <div className="flex gap-2">
                    <Button 
                      variant={show360View ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShow360View(true)}
                    >
                      360° View
                    </Button>
                    <Button 
                      variant={!show360View ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShow360View(false)}
                    >
                      Standard Views
                    </Button>
                  </div>
                </div>
                
                {show360View && (
                  <Vehicle360Viewer
                    images={getSpinImagesArray()}
                    autoRotate={false}
                    showAngleIndicator={true}
                    vehicleName={`${year} ${make} ${model}`}
                    designName={designFile?.fileName || 'Design'}
                  />
                )}
              </Card>
            )}

            {/* Save to Gallery Button - appears after views are generated */}
            {allViews.length > 0 && (
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  className="flex-1"
                  size="lg"
                  variant="outline"
                  onClick={handleSaveToGallery}
                  disabled={isSavingToGallery || allViews.length < 6}
                >
                  {isSavingToGallery ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving to Gallery...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save All Views to Gallery
                    </>
                  )}
                </Button>
                <MarkAsPerfectButton
                  promptSignature={`approvemode-${designFile?.fileName || 'custom'}`}
                  vehicleSignature={`${year}-${make}-${model}`}
                  renderUrls={allViews.reduce((acc, v) => ({ ...acc, [v.type]: v.url }), {})}
                  sourceVisualizationId={visualizationId || undefined}
                />
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center">
              {allViews.length === 0 
                ? 'Generates all 6 professional angles: Front, Driver Side, Passenger Side, Rear, Top, and Hero'
                : allViews.length === 6
                ? 'All views generated! Download PDF proof sheet or save to gallery.'
                : `Generated ${allViews.length} of 6 views. ${6 - allViews.length} failed.`
              }
            </p>
          </div>
        </div>
      </Card>

      {/* 2D → 3D Transformation - Open Studio Proof Layout */}
      {allViews.length > 0 && designFile && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-2 text-center">
            2D → 3D Transformation Complete
          </h3>
          <p className="text-center text-muted-foreground text-sm mb-4">
            Your design proof has been transformed into {allViews.length} photorealistic 3D renders
          </p>
          
          {/* Preview Grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-cyan-500/50">
              <img src={designFile.url} alt="2D Proof" className="w-full h-full object-contain bg-neutral-900" />
              <div className="absolute bottom-1 left-1 bg-cyan-500/80 px-2 py-0.5 rounded text-[10px] font-bold text-white">
                2D PROOF
              </div>
            </div>
            {allViews.slice(0, 2).map((view, idx) => (
              <div key={view.type} className="relative aspect-video rounded-lg overflow-hidden border border-border">
                <img src={view.url} alt={view.label} className="w-full h-full object-cover" />
                <div className="absolute bottom-1 left-1 bg-black/70 px-2 py-0.5 rounded text-[10px] font-medium text-white">
                  {view.label}
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={() => setShowStudioProof(true)}
            className="w-full"
            size="lg"
          >
            <Maximize2 className="w-4 h-4 mr-2" />
            Open Studio Proof Layout
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            View full 2D proof alongside all {allViews.length} 3D renders in a clean studio layout
          </p>
        </Card>
      )}

      {/* 360° Loading State */}
      {is360Generating && (
        <Vehicle360LoadingState
          totalAngles={totalAngles}
          currentAngle={current360Angle}
          onCancel={clear360Spin}
        />
      )}

      {/* 360° Viewer */}
      {has360Spin && show360View && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">360° Spin View</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShow360View(false)}
            >
              Show Standard Views
            </Button>
          </div>
          <Vehicle360Viewer
            images={getSpinImagesArray()}
            autoRotate={false}
            showAngleIndicator={true}
          />
        </Card>
      )}

      {/* Professional 6-View Display */}
      {allViews.length > 0 && !show360View && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">6-View Professional Proof</h3>
            {has360Spin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShow360View(true)}
              >
                <RotateCw className="mr-2 h-4 w-4" />
                View 360°
              </Button>
            )}
          </div>
          <ApproveModeRenderDisplay
            views={allViews}
            vehicleInfo={{ year, make, model }}
            designName={designFile?.fileName || 'Custom Design'}
            isGenerating={isGenerating}
            generationProgress={generationProgress}
          />
        </Card>
      )}

      {/* Customer Approval Proof - USP Feature */}
      {allViews.length > 0 && (
        <ProofPreviewCard
          onGenerateProof={() => setShowProofSheet(true)}
          hasRender={allViews.length > 0}
          designName={designFile?.fileName || 'Custom Design'}
          vehicleName={`${year} ${make} ${model}`.trim()}
        />
      )}

      {/* Before & After Carousel with CTA */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Before & After Examples</h3>
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Before/After Slider (3 columns = 60% width) */}
          <div className="lg:col-span-3">
            {examples && examples.length > 0 ? (
              <Card className="overflow-hidden border-border">
                <BeforeAfterSlider
                  beforeUrl={examples[currentExampleIndex].before_url}
                  afterUrl={examples[currentExampleIndex].after_url}
                  altText={examples[currentExampleIndex].name || 'Before/After'}
                />
                <div className="p-3 bg-secondary/20 flex justify-between items-center">
                  <p className="font-medium text-sm">{examples[currentExampleIndex].name}</p>
                  {examples.length > 1 && (
                    <div className="flex gap-2">
                      {examples.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentExampleIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx === currentExampleIndex ? 'bg-primary w-4' : 'bg-muted-foreground/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <div className="h-64 border border-border rounded-lg flex items-center justify-center bg-black">
                <p className="text-muted-foreground">No examples available</p>
              </div>
            )}
          </div>

          {/* Right: CTA Card (2 columns = 40% width) */}
          <div className="lg:col-span-2">
            <Card className="h-full bg-gradient-to-br from-primary/10 to-secondary/30 border-primary/30 p-6 flex flex-col justify-center">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Download className="w-8 h-8 text-primary" />
                  <h4 className="text-xl font-bold">Downloadable Design Proofs</h4>
                </div>
                <p className="text-muted-foreground">
                  Every ApprovePro™ render comes with <span className="text-foreground font-medium">high-resolution downloadable proofs</span> for each view angle.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Professional client presentations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Print-ready resolution</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>360° spin view exports</span>
                  </li>
                </ul>
                <Button 
                  className="w-full mt-2"
                  onClick={() => document.getElementById('design-upload-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Try ApprovePro™ Now
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Modal with Navigation */}
      <MobileZoomImageModal
        imageUrl={expandedImageIndex !== null && allViews[expandedImageIndex] ? allViews[expandedImageIndex].url : ''}
        title={expandedImageIndex !== null && allViews[expandedImageIndex] ? `${allViews[expandedImageIndex].label} - ${year} ${make} ${model}` : ''}
        isOpen={expandedImageIndex !== null}
        onClose={() => setExpandedImageIndex(null)}
        showNavigation={allViews.length > 1}
        onPrev={expandedImageIndex !== null && expandedImageIndex > 0 ? () => setExpandedImageIndex(expandedImageIndex - 1) : undefined}
        onNext={expandedImageIndex !== null && expandedImageIndex < allViews.length - 1 ? () => setExpandedImageIndex(expandedImageIndex + 1) : undefined}
        currentIndex={expandedImageIndex ?? 0}
        totalCount={allViews.length}
      />

      {/* Studio Proof Layout Modal */}
      {designFile && (
        <StudioProofLayout
          designProofUrl={designFile.url}
          designName={designFile.fileName}
          vehicleInfo={{ year, make, model }}
          views={allViews}
          isOpen={showStudioProof}
          onClose={() => setShowStudioProof(false)}
          onDownloadPDF={allViews.length >= 6 ? handleGenerateProofSheet : undefined}
        />
      )}

      {/* Sticky 360° Button for Mobile */}
      {isMobile && allViews.length > 0 && !has360Spin && !is360Generating && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-background to-transparent">
          <Button
            onClick={generate360Spin}
            className="w-full btn-360-glow border-0 gap-2"
            size="lg"
          >
            <Rotate3D className="w-5 h-5" />
            Generate 360° Spin View
          </Button>
        </div>
      )}

      <SocialEngagementModal
        open={socialModalOpen}
        onClose={() => setSocialModalOpen(false)}
        onUnlock={unlockBonus}
      />

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
      />

      {/* Professional Proof Sheet Dialog */}
      <Dialog open={showProofSheet} onOpenChange={setShowProofSheet}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-auto p-0">
          <ProfessionalProofSheet
            views={allViews}
            vehicleYear={year}
            vehicleMake={make}
            vehicleModel={model}
            manufacturer="Custom Design"
            colorName={designFile?.fileName || "Design Proof"}
            finish="gloss"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};