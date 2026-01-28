import { useToast } from "@/hooks/use-toast";
import { useColorProLogic } from "@/hooks/useColorProLogic";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { use360SpinLogic } from "@/hooks/use360SpinLogic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ManufacturerColorBrowser } from "@/components/colorpro/ManufacturerColorBrowser";
import { VinylInputMode } from "@/components/tools/modes/VinylInputMode";
import { ColorProToolCore } from "@/components/tools/ColorProToolCore";
import { PaywallModal } from "@/components/PaywallModal";
import { UpgradeRequired } from "@/components/UpgradeRequired";
import { RenderQualityRating } from "@/components/RenderQualityRating";
import { MarkAsPerfectButton } from "@/components/MarkAsPerfectButton";
import { Vehicle360Viewer } from "@/components/visualize/Vehicle360Viewer";
import { Vehicle360LoadingState } from "@/components/visualize/Vehicle360LoadingState";
import { MobileZoomImageModal } from "@/components/visualize/MobileZoomImageModal";
import { ProfessionalProofSheet } from "@/components/tools/ProfessionalProofSheet";
import { DesignRevisionPrompt } from "@/components/tools/DesignRevisionPrompt";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Layers, X, ChevronDown, RefreshCw, RotateCw, Rotate3D, Database, Lightbulb, ClipboardSignature, Car, Upload, Check, Sparkles, Palette, StretchHorizontal, Ban, Circle, Moon, Square } from "lucide-react";
import type { InkFusionColor } from "@/lib/wpw-infusion-colors";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { ProofPreviewCard } from "@/components/tools/ProofPreviewCard";
import { useNavigate } from "react-router-dom";

export const ColorProToolUI = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { subscription, checkCanGenerate, incrementRenderCount } = useSubscriptionLimits();
  const {
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
  } = useColorProLogic();


  const [paywallOpen, setPaywallOpen] = useState(false);
  const [exampleImageUrl, setExampleImageUrl] = useState<string | null>(null);
  const [yearError, setYearError] = useState(false);
  const yearInputRef = useRef<HTMLInputElement>(null);
  const [isColorSectionOpen, setIsColorSectionOpen] = useState(true);
  const [selectedColorMode, setSelectedColorMode] = useState<'upload' | 'manual' | 'database'>('upload');
  const [selectedViewType] = useState<'hood_detail'>('hood_detail');
  const [expandedImage, setExpandedImage] = useState<{ url: string; title: string } | null>(null);
  const [vehicleInputOpen, setVehicleInputOpen] = useState(true);
  const [pullToRefreshActive, setPullToRefreshActive] = useState(false);
  const [show360View, setShow360View] = useState(false);
  const [highlightColorSection, setHighlightColorSection] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showProofSheet, setShowProofSheet] = useState(false);
  const [isRevising, setIsRevising] = useState(false);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const colorSectionRef = useRef<HTMLDivElement>(null);

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
    colorData: selectedSwatch ? {
      colorName: selectedSwatch.name,
      colorHex: selectedSwatch.hex,
      finish: selectedFinish,
      manufacturer: (selectedSwatch as any).manufacturer,
      colorLibrary: (selectedSwatch as any).colorLibrary,
      mode_type: 'colorpro'
    } : {
      colorName: '',
      colorHex: '#000000',
      finish: selectedFinish,
      mode_type: 'inkfusion'
    }
  });

  // Pull-to-refresh for mobile
  useEffect(() => {
    if (!isMobile) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        touchStartY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (window.scrollY !== 0) return;
      
      const touchY = e.touches[0].clientY;
      const pullDistance = touchY - touchStartY.current;
      
      if (pullDistance > 80) {
        setPullToRefreshActive(true);
      }
    };

    const handleTouchEnd = () => {
      if (pullToRefreshActive) {
        window.location.reload();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: true });
      container.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [isMobile, pullToRefreshActive]);

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

  // Live elapsed timer during generation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isGenerating) {
      setElapsedSeconds(0);
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating]);

  // Rotating tips for during generation
  const generationTips = [
    "Pro Tip: Matte finishes hide imperfections better than gloss",
    "Did you know? 3M 2080 series is the industry standard for color change",
    "Fun Fact: A full wrap can increase vehicle resale value",
    "Pro Tip: Darker colors show dust more easily than lighter ones",
    "Did you know? Chrome wraps require more maintenance than standard vinyl",
    "Pro Tip: PPF can be combined with color change for ultimate protection",
    "Fun Fact: Vehicle wraps can last 5-7 years with proper care",
    "Pro Tip: Always have your wrap installed in a dust-free environment"
  ];

  // Get current tip based on elapsed time (rotate every 5 seconds)
  const getCurrentTip = () => {
    const tipIndex = Math.floor(elapsedSeconds / 5) % generationTips.length;
    return generationTips[tipIndex];
  };

  // Progress steps with checkmarks
  const getProgressSteps = () => [
    { label: "Vehicle identified", completed: elapsedSeconds >= 2 },
    { label: "Color matched", completed: elapsedSeconds >= 6 },
    { label: "Applying wrap finish", completed: elapsedSeconds >= 12 },
    { label: "Rendering photorealistic details", completed: elapsedSeconds >= 20 }
  ];

  // Get dynamic status message based on elapsed time
  const getGenerationStatusMessage = () => {
    if (elapsedSeconds < 5) return "Starting AI render...";
    if (elapsedSeconds < 15) return "Processing vehicle details...";
    if (elapsedSeconds < 25) return "Applying color wrap...";
    if (elapsedSeconds < 40) return "Rendering photorealistic details...";
    return "Almost done, hang tight...";
  };

  const validateYear = () => {
    if (!year || year.trim() === '') {
      setYearError(true);
      setVehicleInputOpen(true);
      yearInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      yearInputRef.current?.focus();
      setTimeout(() => setYearError(false), 2000);
      return false;
    }
    return true;
  };

  const handleGenerate = async () => {
    console.log('🚀 handleGenerate called', { selectedSwatch, year, make, model });
    
    // ColorPro mode - swatch required
    if (!selectedSwatch) {
      toast({ 
        title: "🎨 Pick a Color First!", 
        description: "Scroll down and choose a manufacturer film color to visualize", 
        variant: "destructive",
        duration: 5000
      });
      
      setHighlightColorSection(true);
      setTimeout(() => setHighlightColorSection(false), 3000);
      setIsColorSectionOpen(true);
      setSelectedColorMode('database');
      
      if (colorSectionRef.current) {
        colorSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (!validateYear()) return;
    if (!make || !model) {
      toast({ title: "Vehicle required", description: "Please enter year, make, and model", variant: "destructive" });
      return;
    }
    
    if (subscription) {
      const canGen = await checkCanGenerate();
      if (!canGen) {
        setShowUpgradeModal(true);
        return;
      }
    }

    setShowFallback(false);
    setExampleImageUrl(null);
    
    const result = await generateRender({
      modeType: "ColorPro",
      viewType: selectedViewType,
    });
    
    if (result.success) {
      await incrementRenderCount();
      incrementGeneration();
      toast({ 
        title: "Hero View Generated", 
        description: "Your 3D wrap preview is ready! Generate additional views for more angles.", 
        duration: 4000 
      });
      document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      toast({ title: "Generation Failed", description: result.error || "Please try again", variant: "destructive" });
    }
  };

  const handleGenerateAdditional = async () => {
    const result = await generateAdditionalViews({
      modeType: "ColorPro",
    });
    
    if (result.success) {
      toast({ 
        title: "All Views Complete", 
        description: `Generated ${result.views?.length || 0} total views of your wrapped vehicle!`, 
        duration: 3000 
      });
    } else {
      toast({ title: "Generation Failed", description: result.error || "Please try again", variant: "destructive" });
    }
  };

  const handleShowExample = async () => {
    if (!selectedSwatch) {
      toast({ title: "No color selected", description: "Please select a color first", variant: "destructive" });
      return;
    }
    
    const imageUrl = await getDefaultRenderForColor(selectedSwatch.id);
    if (imageUrl) {
      setExampleImageUrl(imageUrl);
      setShowFallback(true);
      toast({ title: "Example Loaded", description: "Showing sample vehicle render", duration: 2000 });
    } else {
      toast({ title: "No Example Available", description: "No example render found for this color", variant: "destructive" });
    }
  };

  const handleRevisionSubmit = async (prompt: string) => {
    if (!year || !make || !model) return;
    setIsRevising(true);
    try {
      await generateRender({
        modeType: "ColorPro",
        viewType: selectedViewType,
      });
      toast({ title: "Revision applied", description: "New render generated with your changes" });
    } finally {
      setIsRevising(false);
    }
  };

  const handleViewOnVehicle = (color: InkFusionColor) => {
    const previewSection = document.getElementById('preview-section');
    if (previewSection) {
      previewSection.scrollIntoView({ behavior: 'smooth' });
    }
    toast({
      title: "Color Selected",
      description: `${color.name} ready to preview. Select vehicle and generate.`,
    });
  };

  return (
    <>
      <div ref={containerRef} className="w-full bg-background overflow-x-hidden relative">
        {/* Pull-to-refresh indicator */}
        {pullToRefreshActive && isMobile && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-primary/90 text-primary-foreground py-3 flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Release to refresh...</span>
          </div>
        )}
        
        <div className="bg-background">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2">
            <Card className="bg-secondary border-border/30 rounded-t-xl rounded-b-none p-3 sm:p-4 md:p-3">
              <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-3">
              <div className="animate-fade-in text-center md:text-left w-full md:w-auto">
                  <h2 className="text-xl sm:text-2xl md:text-2xl lg:text-3xl tracking-wide mb-2">
                    <span className="text-white font-bold">Color</span>
                    <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 bg-clip-text text-transparent font-bold">Pro™</span>
                    <Badge variant="outline" className="ml-2 text-xs bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/50 text-amber-400">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI-Calibrated
                    </Badge>
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground italic mt-1">
                    Verified Manufacturer Color Libraries — 3M, Avery, Hexis & More
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground/70 mt-0.5">
                    LAB Color Accuracy • Reflectivity Profiles • Finish Characteristics • Photorealistic Renders
                  </p>
                </div>
                
                <div className="text-center md:text-right w-full md:w-auto">
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Powered by{" "}
                    <span className="font-bold">
                      <span className="text-white">Wrap</span>
                      <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">Command AI®</span>
                    </span>
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <Collapsible open={vehicleInputOpen} onOpenChange={setVehicleInputOpen}>
            <Card className="bg-secondary border-border/30 rounded-xl p-3 mb-3">
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    <span className="text-sm font-semibold">Vehicle Details</span>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", vehicleInputOpen && "rotate-180")} />
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <p className="text-sm text-muted-foreground mb-3">Select Your Vehicle</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="year" className="text-xs text-muted-foreground mb-1">Year</Label>
                    <Input
                      ref={yearInputRef}
                      id="year"
                      type="text"
                      placeholder="2024"
                      value={year}
                      onChange={(e) => {
                        setYear(e.target.value);
                        setYearError(false);
                      }}
                      className={cn(
                        "bg-background border-2 border-border/50 transition-all",
                        yearError && "border-red-500 animate-pulse"
                      )}
                    />
                  </div>

                  <div>
                    <Label htmlFor="make" className="text-xs text-muted-foreground mb-1">Make</Label>
                    <Input
                      id="make"
                      type="text"
                      placeholder="Nissan"
                      value={make}
                      onChange={(e) => setMake(e.target.value)}
                      className="bg-background border-2 border-border/50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="model" className="text-xs text-muted-foreground mb-1">Model</Label>
                    <Input
                      id="model"
                      type="text"
                      placeholder="Z"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="bg-background border-2 border-border/50"
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 pb-24">
          <div className="flex flex-col lg:grid lg:grid-cols-[320px_1fr] gap-3 sm:gap-4 md:gap-6">
            <div className="space-y-3 sm:space-y-4">
              {/* Finish Selector */}
              <Card className="p-3 sm:p-4 bg-secondary/20 border-border">
                <Label className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 block">Select Lamination Finish</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Gloss', 'Satin', 'Matte'] as const).map((finish) => (
                    <button
                      key={finish}
                      onClick={() => setSelectedFinish(finish)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-xs font-medium transition-all",
                        selectedFinish === finish
                          ? "bg-primary text-primary-foreground"
                          : "bg-background/50 text-foreground hover:bg-background"
                      )}
                    >
                      {finish}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Color Mode Selector */}
              <Card 
                ref={colorSectionRef}
                className={cn(
                  "p-3 sm:p-4 bg-secondary/20 border-border transition-all duration-500",
                  highlightColorSection && "ring-4 ring-cyan-500 ring-offset-2 ring-offset-background animate-pulse border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.5)]"
                )}
              >
                <Label className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 block">Color Selection Mode</Label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => setSelectedColorMode('upload')}
                    className={cn(
                      "px-4 py-3 rounded-lg text-sm font-medium transition-all text-left border-2 relative",
                      selectedColorMode === 'upload'
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/50"
                        : "bg-background/50 text-foreground hover:bg-background border-primary/50 hover:border-primary hover:shadow-md hover:shadow-primary/30"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      <div>
                        <div className="font-semibold">Upload Vinyl Swatch (AI Auto-Detect)</div>
                        <div className="text-xs opacity-80 mt-0.5">AI detects manufacturer, color & finish automatically</div>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedColorMode('database')}
                    className={cn(
                      "px-4 py-3 rounded-lg text-sm font-medium transition-all text-left border-2 relative",
                      selectedColorMode === 'database'
                        ? "bg-cyan-500/20 text-foreground border-cyan-500 shadow-lg shadow-cyan-500/30"
                        : "bg-background/50 text-foreground hover:bg-background border-cyan-500/30 hover:border-cyan-500/50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-cyan-400" />
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          Choose Manufacturer Film Color
                          <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300 text-xs">
                            {vinylSwatches?.length || 368}
                          </Badge>
                        </div>
                        <div className="text-xs opacity-80 mt-0.5">3M, Avery, Hexis, KPMF, Oracal & more</div>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedColorMode('manual')}
                    className={cn(
                      "px-4 py-3 rounded-lg text-sm font-medium transition-all text-left",
                      selectedColorMode === 'manual'
                        ? "bg-primary text-primary-foreground"
                        : "bg-background/50 text-foreground hover:bg-background"
                    )}
                  >
                    <div className="font-semibold">Manual Vinyl Entry</div>
                    <div className="text-xs opacity-80 mt-0.5">Type manufacturer name & color manually</div>
                  </button>
                </div>
              </Card>

              {/* Collapsible Color Selection */}
              <Collapsible open={isColorSectionOpen} onOpenChange={setIsColorSectionOpen}>
                <Card className="p-4 bg-secondary/20 border-border">
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold">
                        {selectedColorMode === 'upload' ? 'Upload Vinyl Swatch' : selectedColorMode === 'manual' ? 'Manual Vinyl Entry' : 'Choose Manufacturer Film Color'}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {isColorSectionOpen ? 'Click to collapse' : 'Click to expand'}
                      </span>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    {selectedColorMode === 'database' ? (
                      <ManufacturerColorBrowser
                        selectedSwatch={selectedSwatch}
                        onSwatchSelect={(swatch) => {
                          const swatchWithFinish = { ...swatch, finish: selectedFinish };
                          setSelectedSwatch(swatchWithFinish as any);
                          setExampleImageUrl(null);
                        }}
                      />
                    ) : (
                      <VinylInputMode
                        selectedMode={selectedColorMode as 'upload' | 'manual'}
                        onSwatchSelect={(swatch) => {
                          const swatchWithFinish = { ...swatch, finish: selectedFinish };
                          setSelectedSwatch(swatchWithFinish);
                          setExampleImageUrl(null);
                        }}
                      />
                    )}
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* Color selection options displayed here - GraphicsPro moved above */}

            </div>

            <div id="preview-section" className="space-y-4">
              {/* CLEAR BUTTON - Only show when renders exist */}
              {allViews.length > 0 && (
                <Card className="p-4 bg-secondary/20 border-border">
                  <Button
                    onClick={() => {
                      clearLastRender();
                      toast({ 
                        title: "Cleared", 
                        description: "Ready to generate a new design", 
                        duration: 2000 
                      });
                    }}
                    variant="destructive"
                    size="lg"
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear & Start New Design
                  </Button>
                </Card>
              )}

              {/* GENERATE ADDITIONAL VIEWS - Only show when hero view exists */}
              {generatedImageUrl && allViews.length === 1 && !isGeneratingAdditional && !is360Generating && (
                <div className="space-y-2">
                  <Button
                    onClick={handleGenerateAdditional}
                    variant="outline"
                    className="w-full bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border-primary/30"
                  >
                    <Layers className="mr-2 h-4 w-4" />
                    Generate Additional Views (3 more angles)
                  </Button>
                </div>
              )}

              {/* 360° SPIN VIEW - Show whenever render exists */}
              {generatedImageUrl && (
                <Button
                  onClick={() => {
                    const spinImages = getSpinImagesArray();
                    if (has360Spin && spinImages.length > 0) {
                      // Has spin images - toggle to view them
                      setShow360View(true);
                    } else {
                      // No spin images - generate them
                      console.log('🎯 Starting 360° generation...', { year, make, model, selectedSwatch });
                      generate360Spin();
                    }
                  }}
                  disabled={is360Generating || !selectedSwatch || !year || !make || !model}
                  variant="outline"
                  className={cn(
                    "w-full gap-2 transition-all duration-300 relative",
                    is360Generating && "btn-360-glow-generating animate-pulse",
                    has360Spin && getSpinImagesArray().length > 0 && "bg-cyan-500/20 border-cyan-500/50 hover:bg-cyan-500/30",
                    (!has360Spin || getSpinImagesArray().length === 0) && !is360Generating && "btn-360-glow border-0 animate-pulse shadow-lg shadow-cyan-500/50"
                  )}
                >
                  <Rotate3D className={cn("w-5 h-5", (has360Spin && getSpinImagesArray().length > 0) ? "text-cyan-400" : !is360Generating && "icon-360-glow")} />
                  <span className="font-semibold">
                    {is360Generating ? "Generating 360° Spin..." : (has360Spin && getSpinImagesArray().length > 0) ? "✓ View 360° Spin" : "Enable 360° Spin View"}
                  </span>
                  {!is360Generating && (!has360Spin || getSpinImagesArray().length === 0) && (
                    <Badge variant="secondary" className="absolute -top-2 -right-2 bg-cyan-500 text-white text-xs px-2">NEW</Badge>
                  )}
                </Button>
              )}

              {/* 360° LOADING STATE */}
              {is360Generating && (
                <Vehicle360LoadingState
                  totalAngles={totalAngles}
                  currentAngle={current360Angle}
                  onCancel={clear360Spin}
                />
              )}

              {/* 360° VIEWER */}
              {has360Spin && show360View && (
                <Card id="spin-viewer-section" className="overflow-hidden bg-secondary/30 border-border/30 p-4">
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

              {/* STANDARD RENDER DISPLAY - ColorPro Mode */}
              {(generatedImageUrl || exampleImageUrl) && !show360View && (
                <Card className="overflow-hidden bg-secondary/30 border-border/30">
                  {has360Spin && (
                    <div className="p-3 border-b border-border/30 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShow360View(true)}
                      >
                        <RotateCw className="mr-2 h-4 w-4" />
                        View 360° Spin
                      </Button>
                    </div>
                  )}
                  <ColorProToolCore
                    allViews={allViews}
                    isGenerating={isGenerating}
                    isGeneratingAdditional={isGeneratingAdditional}
                    selectedSwatch={selectedSwatch}
                    onGenerateAdditional={handleGenerateAdditional}
                    onClearLastRender={clearLastRender}
                    pendingViews={pendingViews}
                  />
                  {generatedImageUrl && (
                    <div className="p-3 border-t border-border/30">
                      <RenderQualityRating
                        renderId={visualizationId || generatedImageUrl || ''}
                        renderType="colorpro"
                        renderUrl={generatedImageUrl || ''}
                      />
                    </div>
                  )}
                </Card>
              )}

              {/* Render quality rating + Mark as Perfect - ColorPro */}
              {generatedImageUrl && selectedSwatch && visualizationId && (
                <Card className="p-4 bg-secondary/20 border-border space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <RenderQualityRating 
                      renderId={visualizationId}
                      renderType="colorpro"
                      renderUrl={generatedImageUrl}
                    />
                    <MarkAsPerfectButton
                      promptSignature={`${(selectedSwatch as any)?.manufacturer || ''} ${(selectedSwatch as any)?.name || ''} ${selectedFinish || ''}`}
                      vehicleSignature={`${year} ${make} ${model}`}
                      renderUrls={allViews.reduce((acc, v) => ({ ...acc, [v.type]: v.url }), {})}
                      sourceVisualizationId={visualizationId}
                    />
                  </div>
                </Card>
              )}

              {/* Customer Approval Proof - ColorPro Mode */}
              {generatedImageUrl && selectedSwatch && (
                <ProofPreviewCard
                  onGenerateProof={() => setShowProofSheet(true)}
                  hasRender={!!generatedImageUrl}
                  manufacturer={(() => {
                    // Get real manufacturer name - never show fake/generic values
                    const mfr = (selectedSwatch as any)?.manufacturer;
                    if (mfr && mfr !== 'Unknown' && mfr !== 'Custom') return mfr;
                    // Derive from colorLibrary if manufacturer not set
                    const lib = (selectedSwatch as any)?.colorLibrary?.toLowerCase() || '';
                    if (lib.includes('avery')) return 'Avery Dennison';
                    if (lib.includes('3m')) return '3M';
                    if (lib.includes('hexis')) return 'Hexis';
                    if (lib.includes('kpmf')) return 'KPMF';
                    if (lib.includes('oracal')) return 'Oracal';
                    if (lib.includes('inozetek')) return 'Inozetek';
                    if (lib.includes('arlon')) return 'Arlon';
                    if (lib.includes('teckwrap')) return 'TeckWrap';
                    if (lib.includes('vvivid')) return 'VViViD';
                    return mfr || '';
                  })()}
                  colorName={selectedSwatch?.name && selectedSwatch.name !== 'Unknown' ? selectedSwatch.name : ''}
                  vehicleName={`${year} ${make} ${model}`.trim()}
                />
              )}

              {/* Design Revision Prompt - Always visible as selling point */}
              <DesignRevisionPrompt
                onRevisionSubmit={handleRevisionSubmit}
                isGenerating={isRevising || isGenerating}
                disabled={!generatedImageUrl || !year || !make || !model}
              />

              <Card className="p-4 bg-secondary/20 border-border">
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleGenerate}
                    disabled={
                      isGenerating ||
                      !selectedSwatch ||
                      !year || !make || !model
                    }
                    size="lg"
                    className={cn(
                      "w-full bg-gradient-blue text-white transition-all",
                      !isGenerating && "animate-pulse-glow hover:shadow-[0_0_40px_rgba(56,189,248,0.9)]",
                      isGenerating && "opacity-90"
                    )}
                  >
                  {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Generating... {elapsedSeconds}s</span>
                      </div>
                    ) : allViews.length > 0 
                      ? "Generate New Render" 
                      : "Generate Hyper Realistic Color Change Render"}
                  </Button>
                  
                  {/* Enhanced Generation Progress Indicator */}
                  {isGenerating && (
                    <div className="space-y-4 p-4 bg-card/50 rounded-lg border border-border/50">
                      {/* Progress bar with percentage */}
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>{getGenerationStatusMessage()}</span>
                          <span>{Math.min(Math.round((elapsedSeconds / 45) * 100), 95)}%</span>
                        </div>
                        <div className="w-full bg-secondary/50 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 h-full rounded-full transition-all duration-1000 animate-pulse" 
                            style={{ width: `${Math.min((elapsedSeconds / 45) * 100, 95)}%` }}
                          />
                        </div>
                      </div>

                      {/* Progress checkmarks */}
                      <div className="grid grid-cols-2 gap-2">
                        {getProgressSteps().map((step, index) => (
                          <div 
                            key={index}
                            className={cn(
                              "flex items-center gap-2 text-xs transition-all duration-500",
                              step.completed ? "text-cyan-400" : "text-muted-foreground/50"
                            )}
                          >
                            {step.completed ? (
                              <Check className="h-3.5 w-3.5 text-cyan-400" />
                            ) : (
                              <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30" />
                            )}
                            <span>{step.label}</span>
                          </div>
                        ))}
                      </div>

                      {/* Rotating tips */}
                      <div className="flex items-start gap-2 p-3 bg-secondary/30 rounded-md border border-border/30">
                        <Lightbulb className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground animate-fade-in">
                          {getCurrentTip()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Call-out badge for 360° button */}
                  {!has360Spin && generatedImageUrl && (
                    <div className="flex justify-center -mb-2">
                      <span className="text-xs text-teal-400 animate-bounce flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Export for Instagram Reels!
                      </span>
                    </div>
                  )}

                  {/* 360° Spin View Button - REPOSITIONED for prominence */}
                  <Button
                    onClick={generate360Spin}
                    disabled={!generatedImageUrl || is360Generating || has360Spin}
                    className={cn(
                      "w-full gap-2 transition-all duration-300",
                      !has360Spin && generatedImageUrl && !is360Generating 
                        ? "btn-360-glow border-0" 
                        : ""
                    )}
                    size="lg"
                  >
                    <Rotate3D className="w-5 h-5" />
                    <span className="font-semibold">
                      {has360Spin ? "✓ 360° View Ready" : "Generate 360° Spin View"}
                    </span>
                  </Button>
                  <p className="text-xs text-center text-muted-foreground -mt-1">
                    {!generatedImageUrl 
                      ? "Generate a render first to enable 360°" 
                      : has360Spin 
                        ? "✓ 12 angles ready • Drag to rotate • Export for Reels"
                        : "12 angles • ~2 min • Export for Reels"
                    }
                  </p>

                  {/* 360° Loading State */}
                  {is360Generating && (
                    <Vehicle360LoadingState
                      totalAngles={totalAngles}
                      currentAngle={current360Angle}
                      estimatedTimePerAngle={10}
                    />
                  )}

                  {/* 360° Viewer with Toggle */}
                  {has360Spin && (
                    <Card className="p-4 bg-secondary/20 border-border">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                          <Rotate3D className="w-4 h-4" />
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
                          designName={selectedSwatch?.name || 'Color Wrap'}
                        />
                      )}
                    </Card>
                  )}

                  {/* Sticky 360° Button for Mobile */}
                  {isMobile && generatedImageUrl && !has360Spin && !is360Generating && (
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

                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground text-center">
                      {subscription && subscription.tier !== 'free'
                        ? "Unlimited previews included with your plan"
                        : remainingGenerations > 0 
                          ? `${remainingGenerations} free previews remaining`
                          : "Free limit reached - continue generating!"}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>


      <PaywallModal 
        open={paywallOpen} 
        onClose={() => setPaywallOpen(false)} 
        onShowExample={handleShowExample}
        productType="ColorPro™" 
      />

      {/* Fullscreen Image Modal */}
      <MobileZoomImageModal
        imageUrl={expandedImage?.url || ''}
        title={expandedImage?.title}
        isOpen={!!expandedImage}
        onClose={() => setExpandedImage(null)}
      />
      
      <UpgradeRequired
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        requiredTier="starter"
        featureName="ColorPro™ Color Rendering"
      />

      {/* Professional Proof Sheet Dialog */}
      <Dialog open={showProofSheet} onOpenChange={setShowProofSheet}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <ProfessionalProofSheet
            views={[
              ...(generatedImageUrl ? [{ type: 'hero', url: generatedImageUrl, label: 'Hero View' }] : []),
              ...(allViews?.find(v => v.type === 'side') ? [{ type: 'side', url: allViews.find(v => v.type === 'side')!.url, label: 'Driver Side' }] : []),
              ...(allViews?.find(v => v.type === 'front') ? [{ type: 'front', url: allViews.find(v => v.type === 'front')!.url, label: 'Front View' }] : []),
              ...(allViews?.find(v => v.type === 'rear') ? [{ type: 'rear', url: allViews.find(v => v.type === 'rear')!.url, label: 'Rear View' }] : []),
              ...(allViews?.find(v => v.type === 'top') ? [{ type: 'top', url: allViews.find(v => v.type === 'top')!.url, label: 'Top View' }] : []),
              ...(allViews?.find(v => v.type === 'hood_detail') ? [{ type: 'detail', url: allViews.find(v => v.type === 'hood_detail')!.url, label: 'Hood Detail' }] : []),
            ]}
            vehicleYear={year}
            vehicleMake={make}
            vehicleModel={model}
            toolKey="colorpro"
            manufacturer={(() => {
              // Get real manufacturer name - never show fake/generic values
              const mfr = (selectedSwatch as any)?.manufacturer;
              if (mfr && mfr !== 'Unknown' && mfr !== 'Custom') return mfr;
              // Derive from colorLibrary if manufacturer not set
              const lib = (selectedSwatch as any)?.colorLibrary?.toLowerCase() || '';
              if (lib.includes('avery')) return 'Avery Dennison';
              if (lib.includes('3m')) return '3M';
              if (lib.includes('hexis')) return 'Hexis';
              if (lib.includes('kpmf')) return 'KPMF';
              if (lib.includes('oracal')) return 'Oracal';
              if (lib.includes('inozetek')) return 'Inozetek';
              if (lib.includes('arlon')) return 'Arlon';
              if (lib.includes('teckwrap')) return 'TeckWrap';
              if (lib.includes('vvivid')) return 'VViViD';
              return mfr || '';
            })()}
            colorName={selectedSwatch?.name && selectedSwatch.name !== 'Unknown' ? selectedSwatch.name : 'Custom Color'}
            productCode={(selectedSwatch as any)?.code || (selectedSwatch as any)?.productCode || ''}
            finish={selectedFinish}
            hex={selectedSwatch?.hex}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

// Backward compatibility alias
export const InkFusionToolUI = ColorProToolUI;