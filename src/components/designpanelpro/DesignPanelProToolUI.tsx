import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDesignPanelProLogic } from "@/hooks/useDesignPanelProLogic";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { useFreemiumLimits } from "@/hooks/useFreemiumLimits";
import { use360SpinLogic } from "@/hooks/use360SpinLogic";
import { useRevisionHistory } from "@/hooks/useRevisionHistory";
import { RevisionHistoryTimeline } from "@/components/tools/RevisionHistoryTimeline";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaywallModal } from "@/components/PaywallModal";
import { SocialEngagementModal } from "@/components/SocialEngagementModal";
import { LoginRequiredModal } from "@/components/LoginRequiredModal";
import { FreemiumCounter } from "@/components/FreemiumCounter";
import { UpgradeRequired } from "@/components/UpgradeRequired";
import { PanelUploader } from "./PanelUploader";
import { PanelLibrary } from "./PanelLibrary";
import { RenderQualityRating } from "@/components/RenderQualityRating";
import { Vehicle360Viewer } from "@/components/visualize/Vehicle360Viewer";
import { Vehicle360LoadingState } from "@/components/visualize/Vehicle360LoadingState";
import { MobileZoomImageModal } from "@/components/visualize/MobileZoomImageModal";
import { DesktopRenderModal } from "@/components/visualize/DesktopRenderModal";
import { DesignRevisionPrompt } from "@/components/tools/DesignRevisionPrompt";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Download, ChevronDown, Loader2, Image as ImageIcon, X, Car, RefreshCw, RotateCw, Rotate3D, Layers, ShoppingCart, ClipboardSignature, Lightbulb, Check } from "lucide-react";
import { GenerationWizard, DESIGNPANELPRO_TIPS } from "@/components/tools/GenerationWizard";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ProofPreviewCard } from "@/components/tools/ProofPreviewCard";
import { ProfessionalProofSheet } from "@/components/tools/ProfessionalProofSheet";
import { RenderOverlay } from "@/components/tools/RenderOverlay";

export const DesignPanelProToolUI = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { subscription, checkCanGenerate, incrementRenderCount } = useSubscriptionLimits();
  const { 
    canGenerate: canGenerateFreemium, phase: freemiumPhase, isPrivileged, 
    totalRemaining, incrementGeneration: incrementFreemium, unlockBonus 
  } = useFreemiumLimits();
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [paywallModalOpen, setPaywallModalOpen] = useState(false);
  
  // FadeWraps is now a separate standalone tool at /fadewraps
  const {
    selectedPanel, setSelectedPanel, selectedFinish, setSelectedFinish,
    curatedPanels, isLoading,
    generateRender, isGenerating, generatedImageUrl, visualizationId, allViews,
    generateAdditionalViews, isGeneratingAdditional, uploadMode, setUploadMode,
    showUpgradeModal, setShowUpgradeModal,
    showLoginModal, setShowLoginModal,
    clearLastRender,
    saveDesignJob,
  } = useDesignPanelProLogic();
  const [isSavingDesign, setIsSavingDesign] = useState(false);
  const [recentPanels, setRecentPanels] = useState<any[]>([]);

  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [yearError, setYearError] = useState(false);
  const [expandedImage, setExpandedImage] = useState<{ url: string; title: string } | null>(null);
  const [show360View, setShow360View] = useState(false);
  const [splitView360, setSplitView360] = useState(false);
  const yearInputRef = useRef<HTMLInputElement>(null);
  const [vehicleInputOpen, setVehicleInputOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('designpanelpro-sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [pullToRefreshActive, setPullToRefreshActive] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState<number>(-1);
  const [showProofSheet, setShowProofSheet] = useState(false);
  const [isRevising, setIsRevising] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

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
        setCurrentTipIndex(prev => (prev + 1) % DESIGNPANELPRO_TIPS.length);
      }, 5000);
      return () => clearInterval(tipInterval);
    }
  }, [isGenerating, isRevising]);

  // Revision history for DesignPanelPro
  const { revisionHistory, saveRevision, loadHistory } = useRevisionHistory('designpanelpro');

  // Load revision history on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem('designpanelpro-sidebar-collapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

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
    colorData: selectedPanel ? {
      colorName: selectedPanel.ai_generated_name || selectedPanel.name,
      colorHex: '#000000',
      finish: selectedFinish,
      panelUrl: selectedPanel.media_url,
      mode_type: 'designpanelpro'
    } : {
      colorName: '',
      colorHex: '#000000',
      finish: selectedFinish,
      mode_type: 'designpanelpro'
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

  // Track recently viewed panels (last 5 selections)
  useEffect(() => {
    if (!selectedPanel) return;
    setRecentPanels((prev) => {
      const filtered = prev.filter((p) => p.id !== selectedPanel.id);
      return [selectedPanel, ...filtered].slice(0, 5);
    });
  }, [selectedPanel]);

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
    if (!selectedPanel) {
      toast({ title: "No panel selected", description: "Please select or upload a panel design first", variant: "destructive" });
      return;
    }
    
    if (!validateYear()) return;

    if (!make || !model) {
      toast({ title: "Vehicle required", description: "Please enter year, make, and model", variant: "destructive" });
      return;
    }

    // Check freemium limits first (unless privileged)
    if (!isPrivileged && !canGenerateFreemium) {
      if (freemiumPhase === 'engagement') {
        setSocialModalOpen(true);
      } else if (freemiumPhase === 'paywall') {
        setPaywallModalOpen(true);
      }
      return;
    }

    // Then check subscription limits for subscribed users
    if (subscription && !isPrivileged) {
      const canGenerate = await checkCanGenerate();
      if (!canGenerate) {
        return;
      }
    }

    await generateRender(year, make, model);
    
    // Track both freemium and subscription usage
    if (!isPrivileged) {
      incrementFreemium();
    }
    if (subscription) {
      await incrementRenderCount();
    }
  };

  const handleRevisionSubmit = async (prompt: string) => {
    if (!selectedPanel || !year || !make || !model) return;
    const originalUrl = generatedImageUrl;
    setIsRevising(true);
    try {
      await generateRender(year, make, model, prompt);
      // Save revision to history
      if (generatedImageUrl) {
        await saveRevision({
          viewType: 'main',
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

  const handleGenerateAllViews = async () => {
    if (!generatedImageUrl) {
      toast({ title: "No render available", description: "Generate a 3D proof first", variant: "destructive" });
      return;
    }
    
    await generateAdditionalViews(year, make, model);
  };


  return (
    <div ref={containerRef} className="container max-w-7xl mx-auto px-3 sm:px-4 py-2 pb-24 overflow-x-hidden relative">
      {/* Pull-to-refresh indicator */}
      {pullToRefreshActive && isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-primary/90 text-primary-foreground py-3 flex items-center justify-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">Release to refresh...</span>
        </div>
      )}
      
      {/* 360° Badge at Top */}
      <div className="flex justify-center mb-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
          <Rotate3D className="w-5 h-5 text-cyan-400 icon-360-glow animate-pulse" />
          <span className="text-sm font-medium text-cyan-300">360° Spin Views Available</span>
        </div>
      </div>

      <Card className="overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-4 sm:p-6 border-b">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">
                <span className="text-foreground">DesignPanel</span>
                <span className="text-gradient-blue">Pro™</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-1 mb-2">
                Premium panel designs for professional wraps • 360° Spin Views
              </p>
              <p className="text-xs text-muted-foreground/80 italic border-l-2 border-primary/30 pl-3">
                Transform any premium vinyl panel design (186" x 56") into stunning, photorealistic 3D vehicle proofs with interactive 360° rotation. Upload your own custom panels or select from our curated library of professional designs—instantly visualize how they'll look on any vehicle before printing.
              </p>
            </div>

        {/* Main Content */}
        <div className="flex flex-col xl:grid xl:grid-cols-[380px,1fr] gap-4 sm:gap-6 p-3 sm:p-4 lg:p-6">
          {/* Left Sidebar - Configuration */}
          <div className="space-y-4">
            {/* Vehicle Information - Collapsible */}
            <Collapsible open={vehicleInputOpen} onOpenChange={setVehicleInputOpen}>
              <Card className="bg-secondary border-border/30 p-3">
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
                  <p className="text-sm text-muted-foreground mb-3">Select Your Vehicle</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                        placeholder="Ford"
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
                        placeholder="Mustang"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="bg-background border-2 border-border/50"
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Panel Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Panel</h3>
              <Tabs value={uploadMode} onValueChange={(v) => setUploadMode(v as 'curated' | 'custom')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="curated">Curated Library</TabsTrigger>
                  <TabsTrigger value="custom">Upload Custom</TabsTrigger>
                </TabsList>
                <TabsContent value="curated" className="mt-4">
                  <PanelLibrary
                    panels={curatedPanels || []}
                    selectedPanel={selectedPanel}
                    onSelectPanel={setSelectedPanel}
                    isLoading={isLoading}
                  />
                </TabsContent>
                <TabsContent value="custom" className="mt-4">
                  <PanelUploader onPanelUploaded={setSelectedPanel} />
                </TabsContent>
              </Tabs>
            </div>

            {/* Finish Selector */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Lamination Finish</h3>
              <div className="grid grid-cols-3 gap-3">
                {(['Gloss', 'Satin', 'Matte'] as const).map((finish) => (
                  <button
                    key={finish}
                    onClick={() => setSelectedFinish(finish)}
                    className={cn(
                      "py-3 px-4 rounded-lg border-2 font-medium transition-all",
                      selectedFinish === finish
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    {finish}
                  </button>
                ))}
              </div>
            </div>

            {/* Recently Viewed Designs */}
            {recentPanels.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Recently Viewed Designs
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {recentPanels.map((panel) => (
                    <Card
                      key={panel.id}
                      className="cursor-pointer overflow-hidden border-border/60 hover:border-primary/60 hover:shadow-md transition-all"
                      onClick={() => setSelectedPanel(panel)}
                    >
                      <div className="relative" style={{ aspectRatio: '3.32 / 1' }}>
                        <img
                          src={panel.clean_display_url || panel.media_url}
                          alt={panel.ai_generated_name || panel.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2 bg-background">
                        <p className="text-xs font-medium truncate">{panel.ai_generated_name || panel.name}</p>
                        <p className="text-[10px] text-muted-foreground">186" × 56"</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

           </div>

          {/* Right Side - Preview Window */}
          <div className="space-y-4">
            {/* Generate Buttons Above Preview */}
            <div className="space-y-2">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !selectedPanel}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate 3D Proof"
                )}
              </Button>

              {/* Call-out badge for 360° button */}
              {!has360Spin && generatedImageUrl && (
                <div className="flex justify-center -mb-2">
                  <span className="text-xs text-cyan-400 animate-pulse flex items-center gap-1">
                    ✨ NEW: Export for Instagram Reels!
                  </span>
                </div>
              )}

              {/* 360° Spin View Button - Always visible when render exists */}
              {generatedImageUrl && (
                <Button
                  onClick={generate360Spin}
                  disabled={is360Generating || has360Spin}
                  className={cn(
                    "w-full gap-2 transition-all duration-300 relative",
                    is360Generating && "btn-360-glow-generating animate-pulse",
                    !has360Spin && !is360Generating && generatedImageUrl && "btn-360-glow border-0 animate-pulse shadow-lg shadow-cyan-500/50"
                  )}
                  size="lg"
                >
                  <Rotate3D className={cn("w-5 h-5", !has360Spin && !is360Generating && "icon-360-glow")} />
                  <span className="font-semibold">
                    {is360Generating ? "Generating 360° Spin..." : has360Spin ? "✓ 360° View Ready" : "Generate 360° Spin View"}
                  </span>
                  {!has360Spin && !is360Generating && (
                    <Badge variant="secondary" className="absolute -top-2 -right-2 bg-cyan-500 text-white text-xs">NEW</Badge>
                  )}
                </Button>
              )}
              <p className="text-xs text-center text-muted-foreground -mt-1">
                {!generatedImageUrl 
                  ? "Generate a render first to enable 360°" 
                  : has360Spin 
                    ? "✓ 12 angles ready • Drag to rotate • Export for Reels"
                    : "12 angles • ~2 min • Export for Reels"
                }
              </p>

              <Button
                onClick={handleGenerateAllViews}
                disabled={isGeneratingAdditional || !selectedPanel || !year || !make || !model || is360Generating}
                variant="outline"
                className="w-full"
              >
                {isGeneratingAdditional ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating All Views...
                  </>
                ) : (
                  "Generate All Views"
                )}
              </Button>
            </div>

            {/* 360° Loading State */}
            {is360Generating && (
              <Vehicle360LoadingState
                totalAngles={totalAngles}
                currentAngle={current360Angle}
                onCancel={clear360Spin}
              />
            )}

            {/* Generation Wizard for Panel Renders */}
            {isGenerating && (
              <GenerationWizard
                elapsedSeconds={elapsedSeconds}
                tips={DESIGNPANELPRO_TIPS}
                currentTipIndex={currentTipIndex}
                toolName="Panel Design"
                gradientFrom="from-cyan-500"
                gradientTo="to-blue-500"
              />
            )}

            {/* 360° Viewer with Toggle */}
            {has360Spin && (
              <Card id="spin-viewer-section" className="p-4 bg-secondary/20 border-border">
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
                    designName={selectedPanel?.name || 'Panel Design'}
                  />
                )}
              </Card>
            )}

            {/* Preview Window */}
            {!show360View && (
              <Card className={cn(
                "bg-secondary/30 flex items-center justify-center overflow-hidden",
                isMobile ? "aspect-square" : "aspect-video"
              )}>
                {has360Spin && generatedImageUrl && (
                  <div className="absolute top-4 right-4 z-10">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShow360View(true)}
                    >
                      <RotateCw className="mr-2 h-4 w-4" />
                      View 360°
                    </Button>
                  </div>
                )}
                {generatedImageUrl ? (
                <div className="relative w-full h-full flex flex-col">
                  {/* Render Image */}
                  <div className="relative w-full h-full group cursor-pointer" onClick={() => setExpandedImage({ url: generatedImageUrl, title: `${year} ${make} ${model} - Front View` })}>
                    <img
                      src={generatedImageUrl}
                      alt="Generated render"
                      className="w-full h-full object-contain"
                    />
                    {/* Tool branding overlay */}
                    <RenderOverlay
                      toolName="DesignPanelPro"
                      colorOrDesignName={selectedPanel?.ai_generated_name || selectedPanel?.name}
                    />
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <RenderQualityRating 
                        renderId={visualizationId || generatedImageUrl || ''}
                        renderType="designpanelpro"
                        renderUrl={generatedImageUrl || ''}
                      />
                    </div>
                  </div>
                  {/* Info Card BELOW Image */}
                  <div className="bg-background/95 backdrop-blur-sm px-4 py-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Last Design Generated</p>
                    <p className="text-sm font-semibold">{year} {make} {model}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedPanel?.ai_generated_name || selectedPanel?.name} • {selectedFinish}
                    </p>
                  </div>
                </div>
              ) : selectedPanel ? (
                <div className="relative w-full h-full">
                  <img
                    src={selectedPanel.clean_display_url || selectedPanel.media_url}
                    alt={selectedPanel.ai_generated_name || selectedPanel.name}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-4 left-4 bg-background/90 px-4 py-2 rounded-lg">
                    <p className="text-sm font-medium">
                      {selectedPanel.ai_generated_name || selectedPanel.name}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Select or upload a panel design to preview</p>
                </div>
              )}
              </Card>
            )}

              {/* Customer Approval Proof - USP Feature */}
              {generatedImageUrl && (
                <ProofPreviewCard
                  onGenerateProof={() => setShowProofSheet(true)}
                  hasRender={!!generatedImageUrl}
                  designName={selectedPanel?.ai_generated_name || selectedPanel?.name}
                  vehicleName={`${year} ${make} ${model}`.trim()}
                  className="mt-4"
                />
              )}

              {/* Design Revision Prompt - Always visible as selling point */}
              <div className="mt-4">
                <DesignRevisionPrompt
                  onRevisionSubmit={handleRevisionSubmit}
                  isGenerating={isRevising || isGenerating}
                  disabled={!generatedImageUrl || !selectedPanel || !year || !make || !model}
                />

                {/* Revision History Timeline */}
                {revisionHistory.length > 0 && (
                  <RevisionHistoryTimeline
                    history={revisionHistory}
                    onSelect={(item) => {
                      if (item.revised_url) {
                        setExpandedImage({ url: item.revised_url, title: `Revision: ${item.revision_prompt}` });
                      }
                    }}
                    className="mt-4"
                  />
                )}
              </div>

              {/* Order This Design CTA */}
              {generatedImageUrl && (
                <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg">
                  <p className="text-sm font-medium mb-3 text-center">Want to purchase this design?</p>
                  <div className="flex gap-2 flex-col sm:flex-row">
                    <Button 
                      onClick={async () => {
                        setIsSavingDesign(true);
                        try {
                          // Save design to database first
                          const savedDesign = await saveDesignJob(year, make, model);
                          if (savedDesign?.id) {
                            navigate(`/printpro/designpanelpro?designId=${savedDesign.id}`);
                          } else {
                            // Fallback to localStorage if DB save fails
                            const designContext = {
                              panelId: selectedPanel?.id,
                              panelName: selectedPanel?.ai_generated_name || selectedPanel?.name,
                              panelUrl: selectedPanel?.media_url,
                              thumbnailUrl: selectedPanel?.thumbnail_url || selectedPanel?.clean_display_url || selectedPanel?.media_url,
                              vehicleYear: year,
                              vehicleMake: make,
                              vehicleModel: model,
                              finish: selectedFinish,
                              renderUrl: generatedImageUrl,
                              allViews: allViews
                            };
                            localStorage.setItem('designpanelpro-purchase-context', JSON.stringify(designContext));
                            navigate(`/printpro/designpanelpro?panelId=${selectedPanel?.id}`);
                          }
                        } finally {
                          setIsSavingDesign(false);
                        }
                      }}
                      className="flex-1"
                      variant="default"
                      disabled={isSavingDesign}
                    >
                      {isSavingDesign ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <ShoppingCart className="w-4 h-4 mr-2" />
                      )}
                      Order Printed Wrap
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={async () => {
                        setIsSavingDesign(true);
                        try {
                          // Save design to database first
                          const savedDesign = await saveDesignJob(year, make, model);
                          if (savedDesign?.id) {
                            navigate(`/printpro/design-packs?designId=${savedDesign.id}`);
                          } else {
                            // Fallback to localStorage
                            const designContext = {
                              panelId: selectedPanel?.id,
                              panelName: selectedPanel?.ai_generated_name || selectedPanel?.name,
                              panelUrl: selectedPanel?.media_url,
                              vehicleYear: year,
                              vehicleMake: make,
                              vehicleModel: model,
                              finish: selectedFinish,
                              renderUrl: generatedImageUrl
                            };
                            localStorage.setItem('designpanelpro-purchase-context', JSON.stringify(designContext));
                            navigate(`/printpro/design-packs?panelId=${selectedPanel?.id}`);
                          }
                        } finally {
                          setIsSavingDesign(false);
                        }
                      }}
                      className="flex-1"
                      disabled={isSavingDesign}
                    >
                      Buy Design Files
                    </Button>
                  </div>
                </div>
              )}

              {/* Additional Views */}
            {allViews.length > 0 && (
              <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-2")}>
                {allViews.map((view) => (
                  <Card 
                    key={view.type} 
                    className="overflow-hidden group relative aspect-video bg-secondary/30 cursor-pointer"
                    onClick={() => setExpandedImage({ url: view.url, title: `${year} ${make} ${model} - ${view.type.charAt(0).toUpperCase() + view.type.slice(1)} View` })}
                  >
                    <img
                      src={view.url}
                      alt={view.type}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-background/90 px-2 py-1 rounded text-xs font-medium capitalize">
                      {view.type}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer - Product Branding */}
        <div className="border-t p-4 bg-secondary/30">
          <div className="text-sm">
            <span className="font-medium">
              <span className="text-foreground">DesignPanel</span>
              <span className="text-gradient-blue">Pro™</span>
            </span>
          </div>
        </div>
      </Card>

      {/* Mobile Zoom Image Modal */}
      <MobileZoomImageModal
        imageUrl={expandedImage?.url || ''}
        title={expandedImage?.title}
        isOpen={!!expandedImage}
        onClose={() => setExpandedImage(null)}
      />
      
      <UpgradeRequired
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        requiredTier="complete"
        featureName="DesignPanelPro™"
      />

      <SocialEngagementModal
        open={socialModalOpen}
        onClose={() => setSocialModalOpen(false)}
        onUnlock={unlockBonus}
      />

      <PaywallModal
        open={paywallModalOpen}
        onClose={() => setPaywallModalOpen(false)}
      />

      <LoginRequiredModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Please log in to generate renders. Create a free account to get 2 free renders!"
      />

      {/* Professional Proof Sheet Dialog */}
      <Dialog open={showProofSheet} onOpenChange={setShowProofSheet}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto p-0">
          <ProfessionalProofSheet
            views={allViews.map(v => ({ type: v.type, url: v.url, label: v.type }))}
            vehicleYear={year}
            vehicleMake={make}
            vehicleModel={model}
            toolName="DesignPanelPro™"
            designName={selectedPanel?.ai_generated_name || selectedPanel?.name}
            finish={selectedFinish}
          />
        </DialogContent>
      </Dialog>

      {/* Sticky 360° Button on Mobile */}
      {isMobile && generatedImageUrl && !has360Spin && !is360Generating && (
        <div className="fixed bottom-4 left-4 right-4 z-40">
          <Button
            onClick={generate360Spin}
            className="w-full btn-360-glow py-4 text-base font-semibold gap-2 shadow-2xl"
            size="lg"
          >
            <Rotate3D className="w-5 h-5" />
            Generate 360° Spin View
          </Button>
        </div>
      )}
    </div>
  );
};
