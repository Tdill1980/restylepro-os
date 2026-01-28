import { useToast } from "@/hooks/use-toast";
import { useFadeWrapLogic } from "@/hooks/useFadeWrapLogic";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { use360SpinLogic } from "@/hooks/use360SpinLogic";
import { useRevisionHistory } from "@/hooks/useRevisionHistory";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FadeColorSelector, FadeColor } from "@/components/fadewraps/FadeColorSelector";
import { FinishSelector } from "@/components/fadewraps/FinishSelector";
import { KitConfigSelector } from "@/components/fadewraps/KitConfigSelector";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import { PaywallModal } from "@/components/PaywallModal";
import { LoginRequiredModal } from "@/components/LoginRequiredModal";
import { UpgradeRequired } from "@/components/UpgradeRequired";
import { RenderQualityRating } from "@/components/RenderQualityRating";
import { MarkAsPerfectButton } from "@/components/MarkAsPerfectButton";
import { Vehicle360Viewer } from "@/components/visualize/Vehicle360Viewer";
import { Vehicle360LoadingState } from "@/components/visualize/Vehicle360LoadingState";
import { DesignRevisionPrompt } from "@/components/tools/DesignRevisionPrompt";
import { RevisionHistoryTimeline } from "@/components/tools/RevisionHistoryTimeline";
import { FadeWrapStylePicker } from "@/components/tools/FadeWrapStylePicker";
import { ProfessionalProofSheet } from "@/components/tools/ProfessionalProofSheet";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Package, Download, ChevronDown, X, Car, RefreshCw, Rotate3D, Lightbulb, Check, FileDown, ClipboardSignature } from "lucide-react";
import { GenerationWizard, FADEWRAPS_TIPS } from "@/components/tools/GenerationWizard";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { RenderOverlay } from "@/components/tools/RenderOverlay";
import { downloadWithOverlay, OverlaySpec } from "@/lib/download-with-overlay";

export const FadeWrapToolUI = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { subscription, checkCanGenerate, incrementRenderCount } = useSubscriptionLimits();
  const { revisionHistory, saveRevision, loadHistory } = useRevisionHistory('fadewraps');
  const {
    selectedPattern, setSelectedPattern, selectedFinish, setSelectedFinish,
    fadeStyle, setFadeStyle,
    kitSize, setKitSize, addHood, setAddHood, addFrontBumper, setAddFrontBumper,
    addRearBumper, setAddRearBumper, roofSize, setRoofSize,
    totalPrice, productId,
    generateRender, isGenerating, generatedImageUrl, visualizationId, additionalViews,
    generateAdditionalViews, isGeneratingAdditional,
    showUpgradeModal, setShowUpgradeModal,
    showLoginModal, setShowLoginModal,
    clearLastRender,
  } = useFadeWrapLogic();

  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [yearError, setYearError] = useState(false);
  const [showAdditionalViews, setShowAdditionalViews] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(true);
  const [expandedImage, setExpandedImage] = useState<{ url: string; title: string } | null>(null);
  const yearInputRef = useRef<HTMLInputElement>(null);
  const [vehicleInputOpen, setVehicleInputOpen] = useState(true);
  const [pullToRefreshActive, setPullToRefreshActive] = useState(false);
  const [revisionPrompt, setRevisionPrompt] = useState("");
  const [isRevising, setIsRevising] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [show360View, setShow360View] = useState(false);
  const [showProofSheet, setShowProofSheet] = useState(false);

  // Timer during generation + tip rotation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isGenerating || isRevising) {
      setElapsedSeconds(0);
      setCurrentTipIndex(0);
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isGenerating, isRevising]);

  // Rotate tips every 5 seconds
  useEffect(() => {
    if (isGenerating || isRevising) {
      const tipInterval = setInterval(() => {
        setCurrentTipIndex(prev => (prev + 1) % FADEWRAPS_TIPS.length);
      }, 5000);
      return () => clearInterval(tipInterval);
    }
  }, [isGenerating, isRevising]);

  // Load revision history on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // 360° Spin Logic
  const {
    isGenerating: is360Generating,
    currentAngle: current360Angle,
    currentAngleLabel,
    generatedPreviews,
    has360Spin,
    totalAngles,
    generate360Spin,
    clear360Spin,
    getSpinImagesArray
  } = use360SpinLogic({
    visualizationId,
    vehicleData: { year, make, model },
    colorData: {
      colorName: selectedPattern?.name || '',
      colorHex: '#000000',
      finish: selectedFinish,
      mode_type: 'fadewraps',
      patternUrl: selectedPattern?.media_url,
      fadeStyle
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
    if (!selectedPattern) {
      toast({ title: "No pattern selected", description: "Please select a FadeWraps pattern first", variant: "destructive" });
      return;
    }
    
    if (!validateYear()) {
      return;
    }

    if (!make || !model) {
      toast({ title: "Vehicle required", description: "Please enter year, make, and model", variant: "destructive" });
      return;
    }

    // Subscription check only applies if user has subscription
    if (subscription) {
      const canGen = await checkCanGenerate();
      if (!canGen) {
        setShowUpgradeModal(true);
        return;
      }
    }

    await generateRender(year, make, model);
    await incrementRenderCount();
  };

  const handleRevisionSubmit = async (prompt: string) => {
    if (!selectedPattern || !year || !make || !model) return;
    const originalUrl = generatedImageUrl;
    setIsRevising(true);
    try {
      await generateRender(year, make, model, prompt);
      // Save revision to history after successful generation
      if (generatedImageUrl) {
        await saveRevision({
          viewType: 'side',
          originalUrl,
          revisedUrl: generatedImageUrl,
          revisionPrompt: prompt
        });
      }
      toast({ title: "Revision applied", description: "New render generated with your changes" });
    } finally {
      setIsRevising(false);
    }
  };

  const handleGenerateAdditionalViews = async () => {
    if (!generatedImageUrl) {
      toast({ title: "No render available", description: "Generate a 3D proof first", variant: "destructive" });
      return;
    }
    
    if (!year || !make || !model) {
      toast({ title: "Vehicle required", description: "Please enter year, make, and model", variant: "destructive" });
      return;
    }
    
    await generateAdditionalViews(year, make, model);
    setShowAdditionalViews(true);
  };

  // Build overlay spec for FadeWraps downloads
  const getFadeWrapsOverlay = (): OverlaySpec => ({
    toolName: 'FadeWraps',
    manufacturer: selectedPattern?.inkFusionColor?.manufacturer || undefined,
    colorOrDesignName: selectedPattern?.name || undefined,
  });

  const handleDownload = async (imageUrl: string, filename: string) => {
    try {
      const overlay = getFadeWrapsOverlay();
      // Remove .png extension from filename if present (downloadWithOverlay adds it)
      const cleanFilename = filename.replace(/\.png$/i, '');
      await downloadWithOverlay(imageUrl, cleanFilename, overlay);
      toast({ title: "Download started", description: `Downloading ${cleanFilename}.png` });
    } catch (error) {
      toast({ title: "Download failed", description: "Please try again", variant: "destructive" });
    }
  };

  const { saveDesignJob } = useFadeWrapLogic();

  const handleSaveAndContinue = async () => {
    if (!generatedImageUrl || !selectedPattern) {
      toast({ title: "No render available", description: "Generate a 3D proof first", variant: "destructive" });
      return;
    }
    
    const savedJob = await saveDesignJob(year, make, model);
    if (savedJob) {
      toast({ title: "Design saved", description: "Redirecting to PrintPro..." });
      window.location.href = `/printpro?designId=${savedJob.id}&type=fadewrap`;
    } else {
      toast({ title: "Save failed", description: "Please try again", variant: "destructive" });
    }
  };

  const handleAddToCart = () => {
    if (!selectedPattern) {
      toast({ title: "No pattern selected", description: "Please select a pattern first", variant: "destructive" });
      return;
    }
    
    // Save design context for purchase flow
    const fadeContext = {
      patternId: selectedPattern.id,
      fadeName: selectedPattern.name,
      patternUrl: selectedPattern.media_url,
      category: selectedPattern.category,
      vehicleYear: year,
      vehicleMake: make,
      vehicleModel: model,
      finish: selectedFinish,
      fadeStyle,
      kitSize,
      renderUrl: generatedImageUrl,
      additionalViews: additionalViews
    };
    localStorage.setItem('fadewrap-purchase-context', JSON.stringify(fadeContext));
    
    window.open(`https://weprintwraps.com/cart/?add-to-cart=${productId}`, '_blank');
    toast({ title: "Added to Cart", description: `${selectedPattern.name} FadeWraps kit added to cart` });
  };

  // Clear 360° when vehicle or pattern changes
  useEffect(() => {
    if (has360Spin) {
      clear360Spin();
      setShow360View(false);
    }
  }, [year, make, model, selectedPattern?.id]);

  return (
    <div ref={containerRef} className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 py-2 pb-24 overflow-x-hidden relative">
      {/* Pull-to-refresh indicator */}
      {pullToRefreshActive && isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-primary/90 text-primary-foreground py-3 flex items-center justify-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">Release to refresh...</span>
        </div>
      )}

      {/* 360° Spin Badge */}
      <div className="mb-4 flex items-center justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-full">
          <Rotate3D className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-sm font-semibold text-cyan-400">360° Spin Views Available</span>
        </div>
      </div>
      {/* Vehicle Input - Collapsible */}
      <Collapsible open={vehicleInputOpen} onOpenChange={setVehicleInputOpen}>
        <Card className="p-3 mb-3">
          <CollapsibleTrigger className="w-full min-h-[44px]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4" />
                <span className="text-sm font-semibold">Vehicle Details</span>
              </div>
              <ChevronDown className={cn("w-4 h-4 transition-transform", vehicleInputOpen && "rotate-180")} />
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="year" className="text-xs">Year *</Label>
                <Input
                  ref={yearInputRef}
                  id="year"
                  type="text"
                  placeholder="2024"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className={cn("mt-1", yearError && "border-destructive animate-pulse")}
                />
              </div>
              <div>
                <Label htmlFor="make" className="text-xs">Make *</Label>
                <Input
                  id="make"
                  type="text"
                  placeholder="Corvette"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="model" className="text-xs">Model *</Label>
                <Input
                  id="model"
                  type="text"
                  placeholder="C8"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Main 2-Column Layout */}
      <Card className="bg-secondary border-border/30 rounded-xl overflow-hidden">
        <div className="flex flex-col lg:grid lg:grid-cols-[350px_1fr] gap-0">
          {/* LEFT SIDEBAR - Configuration & Pricing */}
          <div className="bg-card lg:border-r border-border p-3 sm:p-4 space-y-4 lg:max-h-[800px] lg:overflow-y-auto">
            {/* Fade Style Selector - Primary at top */}
            <Card className="p-4 bg-secondary/20 border-border">
              <FadeWrapStylePicker
                fadeStyle={fadeStyle}
                setFadeStyle={setFadeStyle}
              />
            </Card>

            {/* Fade Color Selector - replaces old tabs */}
            <Card className="p-4 bg-secondary/20 border-border">
              <FadeColorSelector
                selectedColor={selectedPattern ? {
                  id: selectedPattern.id,
                  name: selectedPattern.name,
                  hex: selectedPattern.inkFusionColor?.hex || selectedPattern.hex || '#000000',
                  isInkFusion: selectedPattern.isInkFusion || false,
                  inkFusionColor: selectedPattern.inkFusionColor
                } : null}
                onColorSelect={(color) => setSelectedPattern({
                  id: color.id,
                  name: color.name,
                  hex: color.hex,
                  category: color.isInkFusion ? 'InkFusion' : 'Standard',
                  inkFusionColor: color.inkFusionColor,
                  isInkFusion: color.isInkFusion
                })}
              />
            </Card>

            {/* Finish Selector */}
            <Card className="p-4 bg-secondary/20 border-border">
              <FinishSelector
                selectedFinish={selectedFinish}
                onFinishChange={setSelectedFinish}
              />
            </Card>

            {/* Kit Configuration */}
            <Card className="p-4 bg-secondary/20 border-border">
              <KitConfigSelector
                kitSize={kitSize}
                onKitSizeChange={setKitSize}
                addHood={addHood}
                onAddHoodChange={setAddHood}
                addFrontBumper={addFrontBumper}
                onAddFrontBumperChange={setAddFrontBumper}
                addRearBumper={addRearBumper}
                onAddRearBumperChange={setAddRearBumper}
                roofSize={roofSize}
                onRoofSizeChange={setRoofSize}
              />
            </Card>


            {/* Pricing Summary */}
            <Collapsible open={pricingOpen} onOpenChange={setPricingOpen}>
              <Card className="p-4 bg-secondary/20 border-border">
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    <h3 className="text-sm font-semibold">Pricing Summary</h3>
                  </div>
                  <ChevronDown className={cn("w-5 h-5 transition-transform", pricingOpen && "rotate-180")} />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="font-semibold">Total Price:</span>
                      <span className="text-xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Save & Continue to PrintPro */}
            {generatedImageUrl && (
              <Button
                onClick={handleSaveAndContinue}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                size="lg"
              >
                Save & Continue to PrintPro
              </Button>
            )}

            {/* Add to Cart */}
            <Button
              onClick={handleAddToCart}
              disabled={!selectedPattern}
              className="w-full"
              size="lg"
              variant="outline"
            >
              Add to WPW Cart - ${totalPrice.toFixed(2)}
            </Button>
          </div>

          {/* RIGHT SIDE - Large Preview */}
          <div id="preview-section" className="p-6 bg-background min-h-[600px] space-y-4 relative">
            <h3 className="text-xl font-bold">3D Preview</h3>
            
            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!selectedPattern || isGenerating || !year || !make || !model}
              className="w-full"
              size="lg"
            >
              {isGenerating ? "Generating..." : "Generate 3D Proof"}
            </Button>

            {/* Generation Wizard */}
            {isGenerating && (
              <GenerationWizard
                elapsedSeconds={elapsedSeconds}
                tips={FADEWRAPS_TIPS}
                currentTipIndex={currentTipIndex}
                toolName="FadeWrap"
                gradientFrom="from-pink-500"
                gradientTo="to-purple-500"
              />
            )}

            {/* Hero Preview */}
            {!isGenerating && (
              <div className="aspect-video bg-secondary/20 rounded-lg flex items-center justify-center border border-border overflow-hidden">
                {generatedImageUrl ? (
                  <div
                    className="relative w-full h-full group cursor-pointer"
                    onClick={() =>
                      setExpandedImage({
                        url: generatedImageUrl,
                        title: `${year} ${make} ${model} - ${selectedPattern?.name} - Hero View`,
                      })
                    }
                  >
                    <img
                      src={generatedImageUrl}
                      alt="Generated render"
                      className="w-full h-full object-cover"
                    />
                    {/* Tool branding overlay (tool name + manufacturer + design) */}
                    <RenderOverlay
                      toolName="FadeWraps"
                      manufacturer={selectedPattern?.isInkFusion ? "InkFusion" : undefined}
                      colorOrDesignName={selectedPattern?.name}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() =>
                        handleDownload(
                          generatedImageUrl,
                          `fadewraps-${selectedPattern?.name}-hero.png`,
                        )
                      }
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center px-4">
                    {selectedPattern
                      ? "Click 'Generate 3D Proof' to see your design"
                      : "Select a pattern to begin"}
                  </p>
                )}
              </div>
            )}

            {/* Feedback Rating & Mark as Perfect - Bottom Right */}
            {generatedImageUrl && selectedPattern && visualizationId && (
              <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
                <MarkAsPerfectButton
                  promptSignature={`fadewraps-${selectedPattern.name}-${fadeStyle}-${selectedFinish}`}
                  vehicleSignature={`${year}-${make}-${model}`}
                  renderUrls={additionalViews.reduce((acc, v) => ({ ...acc, [v.type]: v.url }), { hero: generatedImageUrl })}
                  sourceVisualizationId={visualizationId}
                />
                <RenderQualityRating 
                  renderId={visualizationId}
                  renderType="fadewraps"
                  renderUrl={generatedImageUrl}
                />
              </div>
            )}

            {/* Design Revision Prompt - Always visible as selling point */}
            <DesignRevisionPrompt
              onRevisionSubmit={handleRevisionSubmit}
              isGenerating={isRevising || isGenerating}
              disabled={!generatedImageUrl || !selectedPattern || !year || !make || !model}
            />

            {/* Revision History Timeline */}
            {generatedImageUrl && revisionHistory.length > 0 && (
              <RevisionHistoryTimeline
                history={revisionHistory}
                onSelect={(item) => {
                  // Navigate to PrintPro with revision context
                  navigate('/printpro/fadewrap', {
                    state: {
                      designUrl: item.revised_url,
                      revisionPrompt: item.revision_prompt,
                      revisionHistory,
                      sourceTool: 'fadewraps',
                      designName: selectedPattern?.name || 'FadeWrap Design'
                    }
                  });
                }}
              />
            )}

            {/* Generate Additional Views Button */}
            {generatedImageUrl && (
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleGenerateAdditionalViews}
                  disabled={isGeneratingAdditional}
                  className="w-full"
                  variant="outline"
                >
                  {isGeneratingAdditional ? "Generating Views..." : "Generate All Views (4 Angles)"}
                </Button>
                
                {/* Proof Sheet Buttons - appear after views are generated */}
                {additionalViews.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      onClick={() => setShowProofSheet(true)}
                      className="flex-1 gap-2"
                    >
                      <ClipboardSignature className="w-4 h-4" />
                      View Design Proof
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowProofSheet(true)}
                      className="flex-1 gap-2"
                    >
                      <FileDown className="w-4 h-4" />
                      Download PDF
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Generate 360° Spin View Button */}
            {generatedImageUrl && !is360Generating && !has360Spin && (
              <Button
                onClick={generate360Spin}
                disabled={is360Generating || !year || !make || !model}
                className="w-full btn-360-glow"
                size="lg"
              >
                <Rotate3D className="w-5 h-5 mr-2" />
                Generate 360° Spin View
              </Button>
            )}

            {/* 360° Loading State */}
            {is360Generating && (
              <Vehicle360LoadingState
                totalAngles={totalAngles}
                currentAngle={current360Angle}
                currentAngleLabel={currentAngleLabel}
                generatedPreviews={generatedPreviews}
                estimatedTimePerAngle={3}
              />
            )}

            {/* 360° Spin Viewer */}
            {has360Spin && show360View && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Rotate3D className="w-5 h-5 text-cyan-400" />
                    360° Interactive Spin View
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShow360View(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Vehicle360Viewer
                  images={getSpinImagesArray()}
                  autoRotate={false}
                  showAngleIndicator={true}
                  dragSensitivity={2}
                  vehicleName={`${year} ${make} ${model}`}
                  designName={selectedPattern?.name || 'FadeWrap Design'}
                />
              </div>
            )}

            {/* Toggle 360° View Button */}
            {has360Spin && !show360View && (
              <Button
                onClick={() => setShow360View(true)}
                className="w-full btn-360-glow"
                size="lg"
              >
                <Rotate3D className="w-5 h-5 mr-2" />
                View 360° Spin
              </Button>
            )}

            {/* 4-View Grid Display (Hero + 3 Additional) */}
            {showAdditionalViews && additionalViews.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold">4-View Proof (Hero + 3 Angles)</h4>
                <div className="grid grid-cols-2 gap-3">
                  {/* Hero View (Rear 3/4) */}
                  {generatedImageUrl && (
                    <div 
                      className="relative aspect-video bg-secondary/20 rounded-lg overflow-hidden border border-border group cursor-pointer"
                      onClick={() => setExpandedImage({ url: generatedImageUrl, title: `${year} ${make} ${model} - ${selectedPattern?.name} - Rear (Hero)` })}
                    >
                      <img 
                        src={generatedImageUrl} 
                        alt="Hero rear view"
                        className="w-full h-full object-cover"
                      />
                      <RenderOverlay
                        toolName="FadeWraps"
                        manufacturer={selectedPattern?.isInkFusion ? "InkFusion" : undefined}
                        colorOrDesignName={selectedPattern?.name}
                      />
                      <span className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">Rear (Hero)</span>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => { e.stopPropagation(); handleDownload(generatedImageUrl, `fadewraps-${selectedPattern?.name}-hero.png`); }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )}
                  {/* Additional Views (Top, Front, Side) */}
                  {additionalViews.map((view) => (
                    <div 
                      key={view.type} 
                      className="relative aspect-video bg-secondary/20 rounded-lg overflow-hidden border border-border group cursor-pointer" 
                      onClick={() => setExpandedImage({ url: view.url, title: `${year} ${make} ${model} - ${selectedPattern?.name} - ${view.type} View` })}
                    >
                      <img 
                        src={view.url} 
                        alt={`${view.type} view`}
                        className="w-full h-full object-cover"
                      />
                      <RenderOverlay
                        toolName="FadeWraps"
                        manufacturer={selectedPattern?.isInkFusion ? "InkFusion" : undefined}
                        colorOrDesignName={selectedPattern?.name}
                      />
                      <span className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{view.type}</span>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => { e.stopPropagation(); handleDownload(view.url, `fadewraps-${selectedPattern?.name}-${view.type}.png`); }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <PaywallModal 
        open={paywallOpen} 
        onClose={() => setPaywallOpen(false)}
        onShowExample={() => {}}
        productType="fadewraps"
      />

      {/* Fullscreen Image Modal */}
      {expandedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-background/80 hover:bg-background"
              onClick={() => setExpandedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            <img 
              src={expandedImage.url} 
              alt={expandedImage.title}
              className="w-full h-full object-contain pb-20"
            />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-background/95 px-6 py-3 rounded-lg border border-border shadow-lg">
              <p className="text-sm font-medium text-center">{expandedImage.title}</p>
            </div>
          </div>
        </div>
      )}
      
      <UpgradeRequired
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        requiredTier="advanced"
        featureName="FadeWraps™"
      />

      <LoginRequiredModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Please log in to generate renders. Create a free account to get 2 free renders!"
      />

      {/* Professional Proof Sheet Dialog */}
      <Dialog open={showProofSheet} onOpenChange={setShowProofSheet}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-auto p-0">
          <ProfessionalProofSheet
            views={[
              { type: 'rear', url: generatedImageUrl || '', label: 'Rear (Hero)' },
              ...additionalViews.map(v => ({ type: v.type, url: v.url, label: v.type }))
            ].filter(v => v.url)}
            vehicleYear={year}
            vehicleMake={make}
            vehicleModel={model}
            toolName="FadeWraps™"
            designName={selectedPattern?.name || 'FadeWrap Design'}
            manufacturer={selectedPattern?.isInkFusion ? 'InkFusion' : 'FadeWraps'}
            colorName={selectedPattern?.name}
            finish={selectedFinish}
            hex={selectedPattern?.inkFusionColor?.hex || selectedPattern?.hex}
          />
        </DialogContent>
      </Dialog>

      {/* Mobile Sticky 360° Button */}
      {generatedImageUrl && !is360Generating && has360Spin && !show360View && isMobile && (
        <div className="fixed bottom-20 right-4 z-40">
          <Button
            onClick={() => setShow360View(true)}
            size="lg"
            className="btn-360-glow shadow-2xl rounded-full w-14 h-14 p-0"
          >
            <Rotate3D className="w-6 h-6" />
          </Button>
        </div>
      )}
    </div>
  );
};
