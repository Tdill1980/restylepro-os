import { useToast } from "@/hooks/use-toast";
import { useWBTYLogic } from "@/hooks/useWBTYLogic";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { useFreemiumLimits } from "@/hooks/useFreemiumLimits";
import { use360SpinLogic } from "@/hooks/use360SpinLogic";
import { useRevisionHistory } from "@/hooks/useRevisionHistory";
import { RevisionHistoryTimeline } from "@/components/tools/RevisionHistoryTimeline";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WrapByTheYardMode } from "@/components/tools/modes/WrapByTheYardMode";
import { WBTYPatternUploader } from "@/components/productTools/WBTYPatternUploader";
import { PaywallModal } from "@/components/PaywallModal";
import { SocialEngagementModal } from "@/components/SocialEngagementModal";
import { FreemiumCounter } from "@/components/FreemiumCounter";
import { UpgradeRequired } from "@/components/UpgradeRequired";
import { RenderQualityRating } from "@/components/RenderQualityRating";
import { MarkAsPerfectButton } from "@/components/MarkAsPerfectButton";
import { Vehicle360Viewer } from "@/components/visualize/Vehicle360Viewer";
import { Vehicle360LoadingState } from "@/components/visualize/Vehicle360LoadingState";
import { DesignRevisionPrompt } from "@/components/tools/DesignRevisionPrompt";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MobileZoomImageModal } from "@/components/visualize/MobileZoomImageModal";
import { Package, Ruler, Download, X, Car, ChevronDown, RotateCw, Rotate3D, Sparkles, ClipboardSignature, Lightbulb, Check } from "lucide-react";
import { ProfessionalProofSheet } from "@/components/tools/ProfessionalProofSheet";
import { GenerationWizard, PATTERNPRO_TIPS } from "@/components/tools/GenerationWizard";
import { RenderOverlay } from "@/components/tools/RenderOverlay";
import { Badge } from "@/components/ui/badge";
import { downloadWithOverlay, OverlaySpec } from "@/lib/download-with-overlay";

export const WBTYToolUI = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { subscription, checkCanGenerate, incrementRenderCount } = useSubscriptionLimits();
  const { 
    canGenerate: canGenerateFreemium, phase: freemiumPhase, isPrivileged, 
    totalRemaining, incrementGeneration: incrementFreemium, unlockBonus 
  } = useFreemiumLimits();
  const {
    selectedProduct, setSelectedProduct, yardsNeeded, setYardsNeeded,
    totalPrice, productId, hasReachedLimit, remainingGenerations,
    incrementGeneration, showFallback, setShowFallback, pricePerYard,
    generateRender, isGenerating, generatedImageUrl, visualizationId, selectedFinish, 
    setSelectedFinish, patternScale, setPatternScale, additionalViews,
    generateAdditionalViews, isGeneratingAdditional,
    calculatedSquareFeet, calculateSquareFeet, isCalculatingSquareFeet,
    uploadMode, setUploadMode,
    showUpgradeModal, setShowUpgradeModal,
    clearLastRender,
    saveDesignJob,
  } = useWBTYLogic();

  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [yearError, setYearError] = useState(false);
  const [showAdditionalViews, setShowAdditionalViews] = useState(false);
  const [expandedImage, setExpandedImage] = useState<{ url: string; title: string } | null>(null);
  const [show360View, setShow360View] = useState(false);
  const yearInputRef = useRef<HTMLInputElement>(null);
  const [vehicleInputOpen, setVehicleInputOpen] = useState(true);
  const [showProofSheet, setShowProofSheet] = useState(false);
  const [isRevising, setIsRevising] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

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
        setCurrentTipIndex(prev => (prev + 1) % PATTERNPRO_TIPS.length);
      }, 5000);
      return () => clearInterval(tipInterval);
    }
  }, [isGenerating, isRevising]);

  // Revision history for PatternPro
  const { revisionHistory, saveRevision, loadHistory } = useRevisionHistory('patternpro');

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
    colorData: selectedProduct ? {
      colorName: selectedProduct.name,
      colorHex: '#000000',
      finish: selectedFinish,
      patternUrl: selectedProduct.media_url,
      mode_type: 'wbty'
    } : {
      colorName: '',
      colorHex: '#000000',
      finish: selectedFinish,
      mode_type: 'wbty'
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
    if (!selectedProduct) {
      toast({ title: "No pattern selected", description: "Please select a WBTY pattern first", variant: "destructive" });
      return;
    }
    
    if (!validateYear()) {
      return;
    }

    if (!make || !model) {
      toast({ title: "Vehicle required", description: "Please enter year, make, and model", variant: "destructive" });
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
    if (!selectedProduct || !year || !make || !model) return;
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

  // Build overlay spec for PatternPro downloads
  const getPatternProOverlay = (): OverlaySpec => ({
    toolName: 'PatternPro',
    colorOrDesignName: selectedProduct?.name || undefined,
  });

  const handleDownload = async (imageUrl: string, filename: string) => {
    try {
      const overlay = getPatternProOverlay();
      // Remove .png extension from filename if present (downloadWithOverlay adds it)
      const cleanFilename = filename.replace(/\.png$/i, '');
      await downloadWithOverlay(imageUrl, cleanFilename, overlay);
      toast({ title: "Download started", description: `Downloading ${cleanFilename}.png` });
    } catch (error) {
      toast({ title: "Download failed", description: "Please try again", variant: "destructive" });
    }
  };

  const handleCalculateSquareFeet = async () => {
    if (!year || !make || !model) {
      toast({ title: "Vehicle required", description: "Please enter year, make, and model first", variant: "destructive" });
      return;
    }
    await calculateSquareFeet(year, make, model);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) {
      toast({ title: "No pattern selected", description: "Please select a pattern first", variant: "destructive" });
      return;
    }
    window.open(`https://weprintwraps.com/cart/?add-to-cart=${productId}&quantity=${yardsNeeded}`, '_blank');
    toast({ title: "Added to Cart", description: `${yardsNeeded} yard(s) of ${selectedProduct.name} added to cart` });
  };

  const handleOrderFromPrintPro = () => {
    if (!selectedProduct) {
      toast({ title: "No pattern selected", description: "Please select a pattern first", variant: "destructive" });
      return;
    }
    // Save pattern context for purchase flow
    const patternContext = {
      productId: selectedProduct.id,
      patternName: selectedProduct.name,
      patternUrl: selectedProduct.media_url,
      patternCategory: selectedProduct.category,
      vehicleYear: year,
      vehicleMake: make,
      vehicleModel: model,
      finish: selectedFinish,
      renderUrl: generatedImageUrl,
      additionalViews: additionalViews
    };
    localStorage.setItem('patternpro-purchase-context', JSON.stringify(patternContext));
    window.open(`/printpro/wbty?pattern_id=${selectedProduct.id}`, '_self');
  };

  const handleSaveAndContinue = async () => {
    if (!generatedImageUrl || !selectedProduct) {
      toast({ title: "No render available", description: "Generate a 3D proof first", variant: "destructive" });
      return;
    }
    
    const savedJob = await saveDesignJob(year, make, model);
    if (savedJob) {
      toast({ title: "Design saved", description: "Redirecting to PrintPro..." });
      window.location.href = `/printpro?designId=${savedJob.id}&type=patternpro`;
    } else {
      toast({ title: "Save failed", description: "Please try again", variant: "destructive" });
    }
  };

  const handleViewOnVehicle = (product: any) => {
    const previewSection = document.getElementById('preview-section');
    if (previewSection) {
      previewSection.scrollIntoView({ behavior: 'smooth' });
    }
    toast({
      title: "Pattern Selected",
      description: `${product.name} ready to preview. Select vehicle and generate.`,
    });
  };

  return (
    <>
      <div className="w-full bg-background">
        <div className="bg-background">
          <div className="max-w-7xl mx-auto px-4">
            {/* 360° Badge at Top */}
            <div className="flex justify-center mb-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <Rotate3D className="w-5 h-5 text-cyan-400 icon-360-glow animate-pulse" />
                <span className="text-sm font-medium text-cyan-300">360° Spin Views Available</span>
              </div>
            </div>

            <Card className="bg-secondary border-border/30 rounded-t-xl rounded-b-none p-2 md:p-3">
              <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-3">
                <div className="animate-fade-in text-center md:text-left">
                  <h2 className="text-lg md:text-2xl lg:text-3xl tracking-wide mb-2">
                    <span className="text-white font-bold">Pattern</span>
                    <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 bg-clip-text text-transparent font-bold">Pro</span>
                    <span className="text-white font-bold">™</span>
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground italic mt-1">
                    92+ Specialty Patterns with Precision Scale Control • 360° Spin Views
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground/70 mt-0.5">
                    Visualize & Price Your Wrap in One Screen • Interactive 360° Rotation
                  </p>
                </div>
                
                <div className="text-center md:text-right">
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

        <div className="max-w-7xl mx-auto px-4">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

          {/* Main 2-Column Layout */}
          <Card className="bg-secondary border-border/30 rounded-xl overflow-hidden">
            <div className="flex flex-col md:grid md:grid-cols-[350px_1fr] gap-0">
              {/* LEFT SIDEBAR - Swatches & Pricing */}
              <div className="bg-card md:border-r border-border p-4 space-y-4 md:max-h-[800px] md:overflow-y-auto">
                {/* Pattern Selection */}
                <Tabs value={uploadMode} onValueChange={(v) => setUploadMode(v as 'curated' | 'custom')}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="curated">Curated Library (92 Patterns)</TabsTrigger>
                    <TabsTrigger value="custom">Upload Custom</TabsTrigger>
                  </TabsList>
                  <TabsContent value="curated">
                    <WrapByTheYardMode
                      selectedProduct={selectedProduct}
                      onProductSelect={(product) => {
                        setSelectedProduct(product);
                        handleViewOnVehicle(product);
                      }}
                      yardsNeeded={yardsNeeded}
                      onYardsChange={setYardsNeeded}
                      pricePerYard={pricePerYard}
                      patternScale={patternScale}
                      onPatternScaleChange={setPatternScale}
                    />
                  </TabsContent>
                  <TabsContent value="custom">
                    <WBTYPatternUploader onPatternUploaded={setSelectedProduct} />
                  </TabsContent>
                </Tabs>

                {/* Tech Specs */}
                <Collapsible defaultOpen={false}>
                  <Card className="p-4 bg-secondary/20 border-border">
                    <CollapsibleTrigger className="w-full">
                      <h4 className="text-sm font-semibold mb-3 flex items-center justify-between">
                        <span>Tech Specs</span>
                        <span className="text-primary font-bold text-lg">${pricePerYard.toFixed(2)}/yard</span>
                      </h4>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="text-center p-2 bg-background/50 rounded-lg">
                          <Package className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                          <p className="text-[9px] text-muted-foreground mb-0.5">BASE FILM</p>
                          <p className="text-xs font-semibold">Cast Vinyl</p>
                          <p className="text-[9px]">Premium Print</p>
                        </div>
                        <div className="text-center p-2 bg-background/50 rounded-lg">
                          <Ruler className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                          <p className="text-[9px] text-muted-foreground mb-0.5">WIDTH</p>
                          <p className="text-lg font-bold">60"</p>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>

                {/* Yards Guide */}
                <Card className="p-4 bg-secondary/20 border-border">
                  <h4 className="text-sm font-semibold mb-3">How Many Yards?</h4>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        View Yards Guide
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Wrap By The Yard - Yards Guide</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        <img 
                          src="/wbty-yards-guide.jpg" 
                          alt="How Many Yards Do I Need Guide" 
                          className="w-full h-auto rounded-lg"
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </Card>

                {/* Vehicle Selection Summary */}
                <Card className="p-4 bg-secondary/20 border-border">
                  <h4 className="text-sm font-semibold mb-3">Vehicle Selection</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Vehicle:</span>
                      <span className="text-sm font-medium">{year && make && model ? `${year} ${make} ${model}` : "Not selected"}</span>
                    </div>
                    <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                      WBTY™ pricing is by the yard at $95.50/yard.
                    </p>
                  </div>
                </Card>

                {/* Quantity */}
                <Card className="p-4 bg-secondary/20 border-border">
                  <h4 className="text-sm font-semibold mb-3">Yards Needed</h4>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={() => setYardsNeeded(Math.max(1, yardsNeeded - 1))} className="h-10 w-10">-</Button>
                    <div className="flex-1 text-center">
                      <p className="text-2xl font-bold">{yardsNeeded}</p>
                      <p className="text-xs text-muted-foreground">yard{yardsNeeded !== 1 ? 's' : ''}</p>
                    </div>
                    <Button variant="outline" size="icon" onClick={() => setYardsNeeded(yardsNeeded + 1)} className="h-10 w-10">+</Button>
                  </div>
                </Card>

                {/* Pricing Summary */}
                <Card className="p-4 bg-primary/10 border-primary/20">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Product ID:</span>
                      <span className="font-semibold">{productId}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Price per Yard:</span>
                      <span className="font-semibold">${pricePerYard.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Yards Needed:</span>
                      <span className="font-semibold">{yardsNeeded}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold border-t border-border pt-2 mt-2">
                      <span>Total Price:</span>
                      <span className="text-primary">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-3">
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
                  
                  <Button 
                    onClick={handleAddToCart}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    size="lg"
                    disabled={!selectedProduct}
                    variant={generatedImageUrl ? "outline" : "default"}
                  >
                    {generatedImageUrl ? "Add to WPW Cart" : "Add to Cart"}
                  </Button>
                </div>

                {/* Generations info removed - unlimited generations */}
              </div>

              {/* RIGHT SIDE - Large Preview */}
              <div id="preview-section" className="p-6 bg-background min-h-[600px] space-y-4">
                {/* Finish Selection Buttons */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Select Lamination Finish</Label>
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant={selectedFinish === "gloss" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFinish("gloss")}
                      className="px-6"
                    >
                      Gloss
                    </Button>
                    <Button
                      variant={selectedFinish === "satin" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFinish("satin")}
                      className="px-6"
                    >
                      Satin
                    </Button>
                    <Button
                      variant={selectedFinish === "matte" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFinish("matte")}
                      className="px-6"
                    >
                      Matte
                    </Button>
                  </div>
                </div>

                {/* Pattern Scale Control */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Pattern Scale</Label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0.8"
                      max="1.2"
                      step="0.05"
                      value={patternScale}
                      onChange={(e) => setPatternScale(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Smaller</span>
                      <span className="font-semibold">{((patternScale - 1) * 100).toFixed(0)}%</span>
                      <span>Larger</span>
                    </div>
                  </div>
                </div>

                {/* Generate Button Above Preview */}
                <Button 
                  onClick={handleGenerate} 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  size="lg"
                  disabled={!selectedProduct || !year || !make || !model || isGenerating}
                >
                {isGenerating ? "Generating..." : "Generate 3D Proof"}
                </Button>

                {/* Generation Wizard */}
                {isGenerating && (
                  <GenerationWizard
                    elapsedSeconds={elapsedSeconds}
                    tips={PATTERNPRO_TIPS}
                    currentTipIndex={currentTipIndex}
                    toolName="Pattern"
                    gradientFrom="from-purple-500"
                    gradientTo="to-pink-500"
                  />
                )}
                {!has360Spin && generatedImageUrl && (
                  <div className="flex justify-center -mb-2">
                    <span className="text-xs text-teal-400 animate-bounce flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Export for Instagram Reels!
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
                    <Badge variant="secondary" className="absolute -top-2 -right-2 bg-cyan-500 text-white text-xs px-2">NEW</Badge>
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

                {/* Generate All Views Button - Always visible but disabled until first generation */}
                <Button
                  onClick={handleGenerateAdditionalViews}
                  variant="outline"
                  size="lg"
                  className="w-full"
                  disabled={!generatedImageUrl || isGenerating || isGeneratingAdditional || is360Generating}
                >
                  {isGeneratingAdditional ? "Generating Views..." : "Generate All Views (Side, Rear, Top, Close-Up)"}
                </Button>

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
                        designName={selectedProduct?.name || 'Pattern'}
                      />
                    )}
                  </Card>
                )}
                
                {(!selectedProduct || !year || !make || !model) && (
                  <p className="text-xs text-center text-yellow-500">
                    {!selectedProduct ? "Select a pattern" : "Enter vehicle year, make, and model"}
                  </p>
                )}
                
                {!generatedImageUrl && selectedProduct && year && make && model && (
                  <p className="text-xs text-center text-muted-foreground">
                    Generate a 3D Proof first to unlock additional views
                  </p>
                )}
                
                {/* Preview Section */}
                {selectedProduct && !show360View && (
                  <div>
                    <Card className="p-6 bg-card border-border h-full relative">
                  <div className="h-full flex flex-col gap-4">
                    {isGenerating ? (
                      <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                        <div>
                          <p className="text-lg mb-2">Generating 3D Proof...</p>
                          <p className="text-sm">This may take a moment</p>
                        </div>
                      </div>
                    ) : generatedImageUrl ? (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">Hero View</p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(generatedImageUrl, `${selectedProduct?.name || 'wbty'}-hero-${selectedFinish}.png`)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                          <div 
                            className="flex-1 flex items-center justify-center cursor-pointer rounded-lg overflow-hidden bg-black aspect-video relative"
                            onClick={() => setExpandedImage({ url: generatedImageUrl, title: `${year} ${make} ${model} - ${selectedProduct?.name} - Hero View` })}
                          >
                            <img 
                              src={generatedImageUrl} 
                              alt="Generated 3D Proof"
                              className="w-full h-full object-contain"
                            />
                            {/* Tool branding overlay */}
                            <RenderOverlay
                              toolName="PatternPro"
                              colorOrDesignName={selectedProduct?.name || 'Custom Pattern'}
                            />
                          </div>
                        </div>
                        
                        {/* Feedback Rating & Mark as Perfect - Bottom Right */}
                        {selectedProduct && visualizationId && (
                          <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
                            <MarkAsPerfectButton
                              promptSignature={`patternpro-${selectedProduct.name}-${patternScale}-${selectedFinish}`}
                              vehicleSignature={`${year}-${make}-${model}`}
                              renderUrls={additionalViews ? { hero: generatedImageUrl, ...additionalViews } : { hero: generatedImageUrl }}
                              sourceVisualizationId={visualizationId}
                            />
                            <RenderQualityRating 
                              renderId={visualizationId}
                              renderType="wbty"
                              renderUrl={generatedImageUrl}
                            />
                          </div>
                        )}
                        
                        {/* Generate Customer Approval Proof Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowProofSheet(true)}
                          className="w-full mt-4"
                        >
                          <ClipboardSignature className="w-4 h-4 mr-2" />
                          Generate Customer Approval Proof
                        </Button>

                        {/* Design Revision Prompt - Always visible as selling point */}
                        <DesignRevisionPrompt
                          onRevisionSubmit={handleRevisionSubmit}
                          isGenerating={isRevising || isGenerating}
                          disabled={!generatedImageUrl || !selectedProduct || !year || !make || !model}
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
                        
                        {showAdditionalViews && additionalViews && (
                          <div className={cn("grid gap-4 mt-4", isMobile ? "grid-cols-1" : "grid-cols-2")}>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs text-muted-foreground">Side View</p>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDownload(additionalViews.side, `${selectedProduct?.name || 'wbty'}-side-${selectedFinish}.png`)}
                                  className="h-6 px-2"
                                >
                                  <Download className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="cursor-pointer" onClick={() => setExpandedImage({ url: additionalViews.side, title: `${year} ${make} ${model} - ${selectedProduct?.name} - Side View` })}>
                                <img 
                                  src={additionalViews.side} 
                                  alt="Side View"
                                  className="w-full h-auto object-contain rounded-lg border border-border"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs text-muted-foreground">Rear View</p>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDownload(additionalViews.rear, `${selectedProduct?.name || 'wbty'}-rear-${selectedFinish}.png`)}
                                  className="h-6 px-2"
                                >
                                  <Download className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="cursor-pointer" onClick={() => setExpandedImage({ url: additionalViews.rear, title: `${year} ${make} ${model} - ${selectedProduct?.name} - Rear View` })}>
                                <img 
                                  src={additionalViews.rear} 
                                  alt="Rear View"
                                  className="w-full h-auto object-contain rounded-lg border border-border"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs text-muted-foreground">Top View</p>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDownload(additionalViews.top, `${selectedProduct?.name || 'wbty'}-top-${selectedFinish}.png`)}
                                  className="h-6 px-2"
                                >
                                  <Download className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="cursor-pointer" onClick={() => setExpandedImage({ url: additionalViews.top, title: `${year} ${make} ${model} - ${selectedProduct?.name} - Top View` })}>
                                <img 
                                  src={additionalViews.top} 
                                  alt="Top View"
                                  className="w-full h-auto object-contain rounded-lg border border-border"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs text-muted-foreground">Close-Up Detail</p>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDownload(additionalViews.closeup, `${selectedProduct?.name || 'wbty'}-closeup-${selectedFinish}.png`)}
                                  className="h-6 px-2"
                                >
                                  <Download className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="cursor-pointer" onClick={() => setExpandedImage({ url: additionalViews.closeup, title: `${year} ${make} ${model} - ${selectedProduct?.name} - Close-Up Detail` })}>
                                <img 
                                  src={additionalViews.closeup} 
                                  alt="Close-Up Detail"
                                  className="w-full h-auto object-contain rounded-lg border border-border"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : selectedProduct ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <img 
                            src={selectedProduct.media_url} 
                            alt={selectedProduct.name}
                            className="max-w-full max-h-[500px] object-contain rounded-lg mb-4"
                          />
                          <p className="text-sm text-muted-foreground">Pattern preview - Generate to see on vehicle</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                        <div>
                          <p className="text-lg mb-2">No pattern selected</p>
                          <p className="text-sm">Select a pattern to preview it here</p>
                        </div>
                      </div>
                      )}
                    </div>
                  </Card>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <PaywallModal 
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onShowExample={() => setShowFallback(true)}
        productType="wbty"
      />

      <SocialEngagementModal
        open={socialModalOpen}
        onClose={() => setSocialModalOpen(false)}
        onUnlock={unlockBonus}
      />

      {/* Fullscreen Image Modal */}
      <MobileZoomImageModal
        imageUrl={expandedImage?.url || ''}
        title={expandedImage?.title}
        isOpen={!!expandedImage}
        onClose={() => setExpandedImage(null)}
      />

      {/* Professional Proof Sheet Dialog */}
      <Dialog open={showProofSheet} onOpenChange={setShowProofSheet}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <ProfessionalProofSheet
            views={[
              ...(generatedImageUrl ? [{ type: 'hero' as const, url: generatedImageUrl, label: 'Hero View' }] : []),
              ...(additionalViews?.side ? [{ type: 'side' as const, url: additionalViews.side, label: 'Driver Side' }] : []),
              ...(additionalViews?.rear ? [{ type: 'rear' as const, url: additionalViews.rear, label: 'Rear View' }] : []),
              ...(additionalViews?.top ? [{ type: 'top' as const, url: additionalViews.top, label: 'Top View' }] : []),
              ...(additionalViews?.closeup ? [{ type: 'closeup' as const, url: additionalViews.closeup, label: 'Close-up View' }] : []),
            ]}
            vehicleYear={year}
            vehicleMake={make}
            vehicleModel={model}
            toolName="PatternPro™"
            designName={selectedProduct?.name || 'Custom Pattern'}
            finish={selectedFinish}
          />
        </DialogContent>
      </Dialog>

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
      
      <UpgradeRequired
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        requiredTier="advanced"
        featureName="Wrap By The Yard™"
      />
    </>
  );
};
