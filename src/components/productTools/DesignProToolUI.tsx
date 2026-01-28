import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDesignProLogic } from "@/hooks/useDesignProLogic";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { UpgradeRequired } from "@/components/UpgradeRequired";
import { RenderQualityRating } from "@/components/RenderQualityRating";
import { MarkAsPerfectButton } from "@/components/MarkAsPerfectButton";
import { PanelUploader } from "@/components/designpanelpro/PanelUploader";
import { PanelLibrary } from "@/components/designpanelpro/PanelLibrary";
import { FadeColorSelector, FadeColor } from "@/components/fadewraps/FadeColorSelector";
import { ProfessionalProofSheet } from "@/components/tools/ProfessionalProofSheet";
import { ChevronDown, X, Car, RefreshCw, Palette, Grid3x3, ShoppingBag, FileText, ClipboardSignature, AlertCircle, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { FadeWrapStylePicker } from "@/components/tools/FadeWrapStylePicker";

export const DesignProToolUI = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { subscription, checkCanGenerate, incrementRenderCount } = useSubscriptionLimits();
  const {
    mode, setMode,
    selectedPattern, setSelectedPattern,
    selectedFinish, setSelectedFinish,
    gradientDirection, setGradientDirection,
    fadeStyle, setFadeStyle,
    patterns, isLoading,
    generateRender, isGenerating,
    generatedImageUrl, visualizationId,
    allViews, generateAdditionalViews, isGeneratingAdditional,
    uploadMode, setUploadMode,
    showUpgradeModal, setShowUpgradeModal,
    clearLastRender,
    lastError, setLastError,
  } = useDesignProLogic();

  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [yearError, setYearError] = useState(false);
  const [expandedImage, setExpandedImage] = useState<{ url: string; title: string } | null>(null);
  const [showProofSheet, setShowProofSheet] = useState(false);
  const yearInputRef = useRef<HTMLInputElement>(null);
  const [vehicleInputOpen, setVehicleInputOpen] = useState(true);
  const [pullToRefreshActive, setPullToRefreshActive] = useState(false);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

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
      toast({ 
        title: "No design selected", 
        description: `Please select a ${mode === "panels" ? "panel design" : "gradient pattern"} first`, 
        variant: "destructive" 
      });
      return;
    }
    
    if (!validateYear()) return;

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

  const handleGenerateAllViews = async () => {
    if (!generatedImageUrl) {
      toast({ title: "No render available", description: "Generate a 3D proof first", variant: "destructive" });
      return;
    }
    
    await generateAdditionalViews(year, make, model);
  };

  // Clear selections when switching modes
  const handleModeChange = (newMode: "panels" | "gradients") => {
    setMode(newMode);
    setSelectedPattern(null);
    clearLastRender();
  };

  return (
    <div ref={containerRef} className="container max-w-7xl mx-auto px-3 sm:px-4 py-2 pb-24 overflow-x-hidden relative">
      {pullToRefreshActive && isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-primary/90 text-primary-foreground py-3 flex items-center justify-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">Release to refresh...</span>
        </div>
      )}

      <Card className="overflow-hidden">
        {/* Header with Mode Toggle */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-4 sm:p-6 border-b space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
            <span className="text-foreground">Design</span>
            <span className="text-gradient-blue">Pro™</span>
              <span className="text-foreground"> Standard</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              Professional vehicle wrap visualization tool
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={mode === "panels" ? "default" : "outline"}
              onClick={() => handleModeChange("panels")}
              className="flex-1 sm:flex-initial"
            >
              <Grid3x3 className="w-4 h-4 mr-2" />
              Panel Designs
            </Button>
            <Button
              variant={mode === "gradients" ? "default" : "outline"}
              onClick={() => handleModeChange("gradients")}
              className="flex-1 sm:flex-initial"
            >
              <Palette className="w-4 h-4 mr-2" />
              FadeWraps
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col xl:grid xl:grid-cols-[380px,1fr] gap-4 sm:gap-6 p-3 sm:p-4 lg:p-6">
          {/* Left Sidebar */}
          <div className="space-y-4">
            {/* Vehicle Information */}
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


            {/* Pattern/Panel Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {mode === "panels" ? "Select Panel" : "Select Fade Color"}
              </h3>
              
              {mode === "panels" ? (
                <Tabs value={uploadMode} onValueChange={(v) => setUploadMode(v as 'curated' | 'custom')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="curated">Curated Library</TabsTrigger>
                    <TabsTrigger value="custom">Upload Custom</TabsTrigger>
                  </TabsList>
                  <TabsContent value="curated" className="mt-4">
                    <PanelLibrary
                      panels={patterns || []}
                      selectedPanel={selectedPattern}
                      onSelectPanel={setSelectedPattern}
                      isLoading={isLoading}
                    />
                  </TabsContent>
                  <TabsContent value="custom" className="mt-4">
                    <PanelUploader onPanelUploaded={setSelectedPattern} />
                  </TabsContent>
                </Tabs>
              ) : (
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
              )}
            </div>

            {/* Fade Style Selector - Show immediately in FadeWraps mode */}
            {mode === "gradients" && (
              <Card className="p-4 bg-secondary/20 border-border">
                <FadeWrapStylePicker
                  fadeStyle={fadeStyle}
                  setFadeStyle={setFadeStyle}
                />
              </Card>
            )}

            {/* Gradient Controls removed - using FadeWrapStylePicker and FadeColorSelector instead */}

            {/* Finish Selector */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Lamination Finish</h3>
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

          </div>

          {/* Right Side - Preview */}
          <div className="space-y-3">
            <Button
              onClick={handleGenerate}
              disabled={!selectedPattern || isGenerating || !year || !make || !model}
              className="w-full"
            >
              {isGenerating ? "Generating..." : "Generate 3D Proof"}
            </Button>

            {/* Inline Error Banner */}
            {lastError && (
              <div className={cn(
                "rounded-lg p-3 flex items-start gap-3 border",
                lastError.type === 'auth' && "bg-amber-500/10 border-amber-500/30 text-amber-200",
                lastError.type === 'limit' && "bg-purple-500/10 border-purple-500/30 text-purple-200",
                lastError.type === 'general' && "bg-destructive/10 border-destructive/30 text-destructive"
              )}>
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium">{lastError.message}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setLastError(null);
                        handleGenerate();
                      }}
                      className="h-7 text-xs"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Retry
                    </Button>
                    {lastError.type === 'auth' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        asChild
                        className="h-7 text-xs"
                      >
                        <Link to="/login">
                          <LogIn className="w-3 h-3 mr-1" />
                          Log In
                        </Link>
                      </Button>
                    )}
                    {lastError.type === 'limit' && (
                      <Button 
                        size="sm" 
                        variant="default" 
                        asChild
                        className="h-7 text-xs"
                      >
                        <Link to="/pricing">
                          Upgrade Plan
                        </Link>
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setLastError(null)}
                      className="h-7 text-xs ml-auto"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {generatedImageUrl && (
              <>
                <div className="relative max-h-[450px] w-full bg-secondary/20 rounded-lg overflow-hidden border border-border flex items-center justify-center">
                  <img 
                    src={generatedImageUrl} 
                    alt="Generated render" 
                    className="max-h-[450px] w-full max-w-full object-contain cursor-pointer"
                    onClick={() => setExpandedImage({ url: generatedImageUrl, title: "Hero View" })}
                  />
                  {/* Branded overlay */}
                  <div className="absolute top-3 left-3 text-[11px] font-bold pointer-events-none text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] [text-shadow:_0_1px_3px_rgba(0,0,0,0.9),_0_0_8px_rgba(0,0,0,0.5)]">
                    {mode === "panels" ? "DesignPanelPro™" : "FadeWraps™"}
                  </div>
                  <div className="absolute bottom-3 right-3 text-[10px] font-semibold pointer-events-none text-right max-w-[70%] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] [text-shadow:_0_1px_3px_rgba(0,0,0,0.9),_0_0_8px_rgba(0,0,0,0.5)]">
                    {year} {make} {model} | {selectedPattern?.name || 'Custom Design'}
                  </div>
                </div>

                <Button
                  onClick={handleGenerateAllViews}
                  disabled={isGeneratingAdditional}
                  variant="outline"
                  className="w-full"
                >
                  {isGeneratingAdditional ? "Generating..." : "Generate Additional Views"}
                </Button>

                {allViews.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {allViews.map((view) => (
                      <div key={view.type} className="aspect-video bg-secondary/20 rounded-lg overflow-hidden border border-border">
                        <img 
                          src={view.url} 
                          alt={`${view.type} view`}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => setExpandedImage({ url: view.url, title: `${view.type} View` })}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 flex-wrap">
                  <RenderQualityRating 
                    renderId={visualizationId || ""} 
                    renderType={mode === "panels" ? "designpanelpro" : "fadewraps"}
                    renderUrl={generatedImageUrl}
                  />
                  <MarkAsPerfectButton
                    promptSignature={`${mode}-${selectedPattern?.name || 'custom'}-${selectedFinish}`}
                    vehicleSignature={`${year}-${make}-${model}`}
                    renderUrls={allViews.reduce((acc, v) => ({ ...acc, [v.type]: v.url }), { hero: generatedImageUrl })}
                    sourceVisualizationId={visualizationId || undefined}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={clearLastRender}
                    className="rounded-full border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    title="Clear & Start New"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>

                {/* Generate Customer Proof Button */}
                <Button
                  onClick={() => setShowProofSheet(true)}
                  variant="secondary"
                  className="w-full gap-2"
                >
                  <ClipboardSignature className="w-4 h-4" />
                  Generate Customer Approval Proof
                </Button>

                {/* Want to Purchase? CTA */}
                <Card className="p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
                  <h3 className="text-lg font-semibold mb-3">Want to Purchase?</h3>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-between h-auto py-3"
                      onClick={() => window.location.href = mode === "panels" 
                        ? "/printpro/designpanelpro" 
                        : "/printpro/fadewrap"}
                    >
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" />
                        <span>Vinyl Wrap Panels</span>
                      </div>
                      <span className="text-primary font-semibold">Starting at $600</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-between h-auto py-3"
                      onClick={() => window.location.href = "/printpro/design-packs"}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>Print Production Files</span>
                      </div>
                      <span className="text-primary font-semibold">$119</span>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Pricing & ordering handled in PrintPro™ Suite
                  </p>
                </Card>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setExpandedImage(null)}
        >
          <button
            onClick={() => setExpandedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X className="w-8 h-8" />
          </button>
          <img 
            src={expandedImage.url} 
            alt={expandedImage.title}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}

      <UpgradeRequired
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        requiredTier="advanced"
      />

      {/* Professional Proof Sheet Dialog */}
      <Dialog open={showProofSheet} onOpenChange={setShowProofSheet}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-auto p-0">
          <ProfessionalProofSheet
            views={[
              { type: 'hero', url: generatedImageUrl || '', label: 'Hero' },
              ...(allViews?.find(v => v.type === 'side') ? [{ type: 'side', url: allViews.find(v => v.type === 'side')!.url, label: 'Driver Side' }] : []),
              ...(allViews?.find(v => v.type === 'passenger-side' || v.type === 'passenger') ? [{ type: 'passenger-side', url: (allViews.find(v => v.type === 'passenger-side' || v.type === 'passenger'))!.url, label: 'Passenger Side' }] : []),
              ...allViews.filter(v => v.type !== 'side' && v.type !== 'passenger-side' && v.type !== 'passenger').map(v => ({ type: v.type, url: v.url, label: v.type }))
            ]}
            vehicleYear={year}
            vehicleMake={make}
            vehicleModel={model}
            toolName={mode === "panels" ? "DesignPanelPro™" : "FadeWraps™"}
            designName={selectedPattern?.name || 'Custom Design'}
            finish={selectedFinish}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
