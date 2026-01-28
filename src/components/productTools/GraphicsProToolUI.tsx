import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useGraphicsProLogic } from "@/hooks/useGraphicsProLogic";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { useRevisionHistory } from "@/hooks/useRevisionHistory";
import { useProductionFiles } from "@/hooks/useProductionFiles";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaywallModal } from "@/components/PaywallModal";
import { LoginRequiredModal } from "@/components/LoginRequiredModal";
import { UpgradeRequired } from "@/components/UpgradeRequired";
import { ProfessionalProofSheet } from "@/components/tools/ProfessionalProofSheet";
import { DesignRevisionPrompt } from "@/components/tools/DesignRevisionPrompt";
import { BeforeAfterSlider } from "@/components/gallery/BeforeAfterSlider";
import { RevisionHistoryTimeline } from "@/components/tools/RevisionHistoryTimeline";
import { ProductionFilesPanel } from "@/components/graphicspro/ProductionFilesPanel";
import { ProductionUpgradePrompt } from "@/components/graphicspro/ProductionUpgradePrompt";
import { MarkAsPerfectButton } from "@/components/MarkAsPerfectButton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  X, ChevronDown, RefreshCw, Car, 
  Wand2, Loader2, Eye, Download, ClipboardSignature, History, Lightbulb, Check, FileCode
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { RenderOverlay } from "@/components/tools/RenderOverlay";
import { downloadWithOverlay, downloadAllWithOverlay, OverlaySpec } from "@/lib/download-with-overlay";

// V1 Preset images - only the 8 we need
import presetRacingStripes from "@/assets/presets/racing-stripes.png";
import presetChromeDelete from "@/assets/presets/chrome-delete.png";
import presetBlackedOut from "@/assets/presets/blacked-out.png";
import presetCarbonHood from "@/assets/presets/carbon-hood.png";
import presetRoofWrap from "@/assets/presets/roof-wrap.png";
import presetFullBlackout from "@/assets/presets/full-blackout.png";
import rockerGlow from "/assets/stripes/rocker_glow.png";
import beltlineGlow from "/assets/stripes/beltline_glow.png";

// Preset type definition
interface Preset {
  id?: string;
  label: string;
  prompt: string;
  preview: string;
  locked?: boolean; // V1: locked presets cannot be edited
}

// V1 PRESETS - 8 predictable, tested presets only
const V1_PRESETS: Preset[] = [
  { 
    id: "racing_stripes",
    label: "Racing Stripes", 
    prompt: "dual white racing stripes from hood to trunk on gloss black body", 
    preview: presetRacingStripes,
    locked: true 
  },
  { 
    id: "chrome_delete",
    label: "Chrome Delete", 
    prompt: "chrome delete matte black on all chrome trim", 
    preview: presetChromeDelete,
    locked: true 
  },
  { 
    id: "blacked_out",
    label: "Blacked Out", 
    prompt: "murdered out gloss black with matte black chrome delete", 
    preview: presetBlackedOut,
    locked: true 
  },
  { 
    id: "carbon_hood",
    label: "Carbon Hood", 
    prompt: "gloss carbon fiber hood with black weave pattern", 
    preview: presetCarbonHood,
    locked: true 
  },
  { 
    id: "roof_wrap",
    label: "Roof Wrap", 
    prompt: "gloss carbon fiber roof wrap only", 
    preview: presetRoofWrap,
    locked: true 
  },
  { 
    id: "full_blackout",
    label: "Full Blackout", 
    prompt: "full blackout package gloss black roof, mirror caps, chrome delete, window trim, all badges", 
    preview: presetFullBlackout,
    locked: true 
  },
  { 
    id: "rocker_stripe",
    label: "Rocker Stripe", 
    prompt: "clean vinyl rocker stripe along lower body, solid vinyl only", 
    preview: rockerGlow,
    locked: true 
  },
  { 
    id: "beltline_stripe",
    label: "Beltline Stripe", 
    prompt: "clean vinyl beltline stripe along mid-body crease, solid vinyl only", 
    preview: beltlineGlow,
    locked: true 
  },
];

export const GraphicsProToolUI = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { subscription } = useSubscriptionLimits();
  
  const {
    year, setYear,
    make, setMake,
    model, setModel,
    stylingPrompt, setStylingPrompt,
    referenceImageUrl, setReferenceImageUrl,
    selectedViewType, setSelectedViewType,
    isGenerating,
    generatedImageUrl,
    visualizationId,
    allViews,
    isGeneratingAdditional,
    pendingViews,
    showUpgradeModal, setShowUpgradeModal,
    showLoginModal, setShowLoginModal,
    presetCategory: hookPresetCategory, 
    setPresetCategory: setHookPresetCategory,
    generateRender,
    generateAdditionalViews,
    clearLastRender,
  } = useGraphicsProLogic();

  // Production pipeline
  const {
    productionData,
    isGeneratingProduction,
    subscriptionRequired,
    generateProductionFiles,
    clearProductionFiles
  } = useProductionFiles();

  // Revision system
  const { revisionHistory, saveRevision, loadHistory } = useRevisionHistory("graphicspro");
  const [previousImageUrl, setPreviousImageUrl] = useState<string | null>(null);
  const [isRevising, setIsRevising] = useState(false);
  const [showRevisionHistory, setShowRevisionHistory] = useState(false);

  const [vehicleInputOpen, setVehicleInputOpen] = useState(true);
  const [yearError, setYearError] = useState(false);
  const [isUploadingReference, setIsUploadingReference] = useState(false);
  const [showProofSheet, setShowProofSheet] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const yearInputRef = useRef<HTMLInputElement>(null);
  
  // V1: Simplified preset system - no categories, locked presets only
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  
  // V1: Simplified preset click handler - just set the locked prompt
  const handlePresetClick = (preset: Preset) => {
    setSelectedPreset(preset);
    setStylingPrompt(preset.prompt);
    
    toast({
      title: "Preset Selected",
      description: preset.label,
      duration: 2000
    });
  };

  // Generation tips for countdown wizard
  const generationTips = [
    "Pro Tip: Two-tone designs use darker color as base layer",
    "Did you know? Chrome accents require hard-light studio rendering",
    "Pro Tip: Racing stripes should flow hood → roof → trunk continuously",
    "Fun Fact: Proper chrome delete adds 8-12 hours to install time",
    "Pro Tip: OEM stripes follow factory-correct geometry and proportions",
    "Did you know? Multi-layer vinyl creates depth with stacked colors",
    "Pro Tip: Satin finishes hide imperfections better than gloss",
    "Fun Fact: A full wrap can increase vehicle resale value"
  ];

  // Progress steps for wizard - 11 detailed steps for demo-safe filming
  const getProgressSteps = () => [
    { label: "Detecting vehicle model…", completed: elapsedSeconds >= 2 },
    { label: "Reading wrap instructions…", completed: elapsedSeconds >= 4 },
    { label: "Calculating segmentation zones…", completed: elapsedSeconds >= 7 },
    { label: "Locking top/bottom boundaries…", completed: elapsedSeconds >= 9 },
    { label: "Applying upper-zone wrap…", completed: elapsedSeconds >= 11 },
    { label: "Applying lower-zone wrap…", completed: elapsedSeconds >= 14 },
    { label: "Aligning graphics across views…", completed: elapsedSeconds >= 18 },
    { label: "Rendering angle 1…", completed: elapsedSeconds >= 21 },
    { label: "Rendering angle 2…", completed: elapsedSeconds >= 24 },
    { label: "Rendering angle 3…", completed: elapsedSeconds >= 27 },
    { label: "Finalizing details…", completed: elapsedSeconds >= 30 }
  ];

  // Load revision history when we have a visualization
  useEffect(() => {
    if (visualizationId) {
      loadHistory(visualizationId);
    }
  }, [visualizationId, loadHistory]);

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
        setCurrentTipIndex(prev => (prev + 1) % generationTips.length);
      }, 5000);
      return () => clearInterval(tipInterval);
    }
  }, [isGenerating, isRevising, generationTips.length]);

  // Revision handler
  const handleRevisionSubmit = async (revisionPrompt: string) => {
    if (!generatedImageUrl) return;
    
    const previousUrl = generatedImageUrl;
    setPreviousImageUrl(previousUrl);
    setIsRevising(true);
    
    try {
      const result = await generateRender(revisionPrompt);
      
      if (result.success && result.imageUrl) {
        await saveRevision({
          viewType: selectedViewType,
          originalUrl: previousUrl,
          revisedUrl: result.imageUrl,
          revisionPrompt,
          designId: visualizationId || undefined
        });
        
        toast({
          title: "Revision Applied",
          description: "Your design has been updated.",
          duration: 3000
        });
      }
    } finally {
      setIsRevising(false);
    }
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
    if (!validateYear()) return;
    
    const result = await generateRender();
    
    if (result.success) {
      toast({ 
        title: "Design Generated!", 
        description: "Your custom wrap design is ready. Generate more views for additional angles.",
        duration: 4000 
      });
      document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (result.error === 'print_required') {
      toast({ 
        title: "🎨 This Design Requires Printing", 
        description: "GraphicsPro™ handles color-change film only. Redirecting to DesignPanelPro™...",
        duration: 5000
      });
      setTimeout(() => navigate('/designpro'), 2000);
    }
  };

  const handleGenerateAdditional = async () => {
    const result = await generateAdditionalViews();
    if (result.success) {
      toast({ 
        title: "All Views Complete", 
        description: `Generated ${result.views?.length || 0} total views!`, 
        duration: 3000 
      });
    }
  };

  return (
    <>
      <div className="w-full bg-background overflow-x-hidden">
        <div className="bg-background">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2">
            <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30 rounded-t-xl rounded-b-none p-3 sm:p-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="animate-fade-in text-center md:text-left w-full md:w-auto">
                  <h2 className="text-xl sm:text-2xl md:text-3xl tracking-wide mb-2">
                    <span className="text-foreground font-bold">Graphics</span>
                    <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent font-bold">Pro™</span>
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground italic">
                    Multi-Zone Wraps • Two-Tone • Racing Stripes • Chrome Delete
                  </p>
                </div>
                
                <div className="text-center md:text-right">
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Powered by{" "}
                    <span className="font-bold">
                      <span className="text-foreground">Wrap</span>
                      <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Command AI®</span>
                    </span>
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          {/* Vehicle Input */}
          <Collapsible open={vehicleInputOpen} onOpenChange={setVehicleInputOpen}>
            <Card className="bg-secondary border-border/30 rounded-xl p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <CollapsibleTrigger className="flex-1">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    <span className="text-sm font-semibold">Vehicle Details</span>
                    <ChevronDown className={cn("w-4 h-4 transition-transform", vehicleInputOpen && "rotate-180")} />
                  </div>
                </CollapsibleTrigger>
                {(year || make || model) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setYear('');
                      setMake('');
                      setModel('');
                      toast({
                        title: "Vehicle Cleared",
                        description: "Click an OEM preset to autofill a suggested vehicle.",
                        duration: 3000
                      });
                    }}
                    className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              
              <CollapsibleContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                  <div>
                    <Label htmlFor="year" className="text-xs text-muted-foreground mb-1">Year</Label>
                    <Input
                      ref={yearInputRef}
                      id="year"
                      placeholder="2024"
                      value={year}
                      onChange={(e) => { setYear(e.target.value); setYearError(false); }}
                      className={cn("bg-background border-2", yearError && "border-red-500 animate-pulse")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="make" className="text-xs text-muted-foreground mb-1">Make</Label>
                    <Input
                      id="make"
                      placeholder="Tesla"
                      value={make}
                      onChange={(e) => setMake(e.target.value)}
                      className="bg-background border-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="model" className="text-xs text-muted-foreground mb-1">Model</Label>
                    <Input
                      id="model"
                      placeholder="Model S"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="bg-background border-2"
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 pb-24">
          <div className="flex flex-col lg:grid lg:grid-cols-[400px_1fr] gap-4">
            {/* Left Panel - Design Input */}
            <div className="space-y-4">
              {/* V1 Quick Presets - 8 locked presets, no categories */}
              <Card className="p-4 bg-secondary/20 border-border">
                <Label className="text-sm font-semibold mb-3 block">Select a Style</Label>
                
                {/* V1 Preset Grid - All 8 presets in one view */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {V1_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetClick(preset)}
                      className={cn(
                        "rounded-lg text-xs font-medium transition-all flex flex-col items-center border overflow-hidden",
                        selectedPreset?.id === preset.id
                          ? "border-cyan-500 ring-2 ring-cyan-500/30"
                          : "border-border/50 hover:border-cyan-500/50"
                      )}
                    >
                      <img src={preset.preview} alt={preset.label} className="w-full h-16 object-cover" />
                      <span className="text-center py-2 px-1 text-foreground/80">{preset.label}</span>
                    </button>
                  ))}
                </div>
                
                {/* Selected preset indicator */}
                {selectedPreset && (
                  <div className="mt-3 p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                    <p className="text-xs text-cyan-400">
                      <span className="font-semibold">Active: </span>{selectedPreset.label}
                    </p>
                  </div>
                )}
              </Card>

              {/* V1: Prompt is read-only from preset selection */}
              {selectedPreset && (
                <Card className="p-4 bg-cyan-500/5 border-cyan-500/30">
                  <Label className="text-sm font-semibold mb-2 block">Design Description</Label>
                  <p className="text-sm text-foreground/80 italic p-3 bg-background/50 rounded-lg border border-border/30">
                    "{selectedPreset.prompt}"
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Custom prompts coming soon
                  </p>
                </Card>
              )}

              {/* View Type Selector */}
              <Card className="p-4 bg-secondary/20 border-border">
                <Label className="text-sm font-semibold mb-3 block">Initial View Angle</Label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(['hood_detail', 'side', 'front', 'rear', 'top'] as const).map((view) => (
                    <button
                      key={view}
                      onClick={() => setSelectedViewType(view)}
                      className={cn(
                        "px-2 py-2 rounded-lg text-xs font-medium transition-all",
                        selectedViewType === view
                          ? "bg-cyan-500 text-white"
                          : "bg-background/50 text-foreground hover:bg-background"
                      )}
                    >
                      {view === 'hood_detail' ? 'Hood' : view.charAt(0).toUpperCase() + view.slice(1)}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !stylingPrompt?.trim() || !year || !make || !model}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold py-6 text-lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating... ({elapsedSeconds}s)
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5" />
                    {generatedImageUrl ? "Generate NEW Design" : "Generate Design"}
                  </>
                )}
              </Button>

              {generatedImageUrl && (
                <Button
                  onClick={clearLastRender}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Clear & Start New Design
                </Button>
              )}
            </div>

            {/* Right Panel - Preview */}
            <div id="preview-section" className="space-y-4">
              {isGenerating && (
                <Card className="p-6 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-background border-cyan-500/30 min-h-[400px]">
                  <div className="flex flex-col items-center justify-center h-full space-y-6">
                    {/* Progress Bar */}
                    <div className="w-full max-w-md">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-cyan-400 font-medium">Designing your wrap...</span>
                        <span className="text-muted-foreground">{Math.min(Math.floor((elapsedSeconds / 30) * 100), 95)}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-1000"
                          style={{ width: `${Math.min((elapsedSeconds / 30) * 100, 95)}%` }}
                        />
                      </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                      {getProgressSteps().map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center transition-all",
                            step.completed 
                              ? "bg-cyan-500 text-white" 
                              : "bg-secondary border border-border"
                          )}>
                            {step.completed && <Check className="w-3 h-3" />}
                          </div>
                          <span className={cn(
                            "text-sm",
                            step.completed ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Animated Spinner */}
                    <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
                    
                    {/* Timer */}
                    <p className="text-lg font-semibold text-foreground">
                      Generating... {elapsedSeconds}s
                    </p>

                    {/* Rotating Tip */}
                    <div className="flex items-start gap-2 p-4 bg-secondary/50 rounded-lg max-w-md">
                      <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground italic">
                        {generationTips[currentTipIndex]}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {!isGenerating && generatedImageUrl && (
                <>
                  <Card className="overflow-hidden border-border relative">
                    <img 
                      src={generatedImageUrl} 
                      alt="Generated wrap design" 
                      className="w-full h-auto"
                    />
                    {/* Tool branding overlay */}
                    <RenderOverlay
                      toolName="GraphicsPro"
                      colorOrDesignName={`${year} ${make} ${model}`}
                    />
                  </Card>

                  {/* Additional Views Grid with Skeletons */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {/* Rendered views */}
                    {allViews.map((view) => (
                      <Card key={view.type} className="overflow-hidden border-border">
                        <img src={view.url} alt={view.type} className="w-full h-auto" />
                        <div className="p-2 text-center text-xs font-medium capitalize bg-secondary/50">
                          {view.type.replace('_', ' ')}
                        </div>
                      </Card>
                    ))}
                    
                    {/* Skeleton placeholders for pending views */}
                    {pendingViews.map((viewType) => (
                      <Card key={viewType} className="overflow-hidden border-border">
                        <div className="aspect-video bg-muted animate-pulse flex items-center justify-center">
                          <div className="text-center">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                            <span className="text-xs text-muted-foreground mt-1 block capitalize">
                              {viewType}...
                            </span>
                          </div>
                        </div>
                        <div className="p-2 text-center text-xs font-medium capitalize bg-secondary/50">
                          {viewType.replace('_', ' ')}
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Action Buttons - Mobile responsive */}
                  <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2">
                    
                    <Button
                      onClick={() => setShowProofSheet(true)}
                      variant="outline"
                      className="md:flex-1"
                    >
                      <ClipboardSignature className="h-4 w-4 md:mr-2" />
                      <span className="hidden md:inline">Customer Proof</span>
                      <span className="md:hidden">Proof</span>
                    </Button>

                    <Button
                      onClick={() => setShowRevisionHistory(!showRevisionHistory)}
                      variant="outline"
                      className={cn("md:w-auto", showRevisionHistory && "bg-purple-500/10 border-purple-500/30")}
                    >
                      <History className="h-4 w-4 md:mr-2" />
                      <span className="md:hidden">History</span>
                      <span className="hidden md:inline sr-only">Revision History</span>
                    </Button>

                    <Button
                      onClick={() => generateProductionFiles(generatedImageUrl, stylingPrompt)}
                      disabled={isGeneratingProduction}
                      variant="outline"
                      className="md:flex-1 border-cyan-500/30 hover:bg-cyan-500/10"
                    >
                      {isGeneratingProduction ? (
                        <>
                          <Loader2 className="h-4 w-4 md:mr-2 animate-spin" />
                          <span className="hidden md:inline">Generating...</span>
                        </>
                      ) : (
                        <>
                          <FileCode className="h-4 w-4 md:mr-2" />
                          <span className="hidden md:inline">Production Files</span>
                          <span className="md:hidden">Files</span>
                        </>
                      )}
                    </Button>
                    {/* Mark as Perfect Button */}
                    <MarkAsPerfectButton
                      promptSignature={stylingPrompt || ''}
                      vehicleSignature={`${year} ${make} ${model}`}
                      renderUrls={allViews.reduce((acc, v) => ({ ...acc, [v.type]: v.url }), {})}
                      sourceVisualizationId={visualizationId || undefined}
                      className="flex-1"
                    />
                  </div>

                  {/* Production Upgrade Prompt */}
                  {subscriptionRequired && (
                    <ProductionUpgradePrompt />
                  )}

                  {/* Production Files Panel */}
                  {productionData && (
                    <ProductionFilesPanel productionData={productionData} views={allViews} />
                  )}

                  {/* Revision System */}
                  <DesignRevisionPrompt
                    onRevisionSubmit={handleRevisionSubmit}
                    isGenerating={isRevising}
                    disabled={!generatedImageUrl}
                  />

                  {/* Before/After Comparison */}
                  {previousImageUrl && generatedImageUrl && previousImageUrl !== generatedImageUrl && (
                    <Card className="p-4 bg-secondary/10 border-border">
                      <Label className="text-sm font-semibold mb-3 block">Revision Comparison</Label>
                      <BeforeAfterSlider
                        beforeUrl={previousImageUrl}
                        afterUrl={generatedImageUrl}
                        altText="Design revision comparison"
                      />
                    </Card>
                  )}

                  {/* Revision History */}
                  {showRevisionHistory && revisionHistory.length > 0 && (
                    <Card className="p-4 bg-secondary/10 border-border">
                      <Label className="text-sm font-semibold mb-3 block">Revision History</Label>
                      <RevisionHistoryTimeline
                        history={revisionHistory.map(r => ({
                          id: r.id,
                          view_type: r.view_type || 'side',
                          revision_prompt: r.revision_prompt,
                          original_url: r.original_url || '',
                          revised_url: r.revised_url,
                          created_at: r.created_at || ''
                        }))}
                        onSelect={(rev) => {
                          if (rev.revised_url) {
                            toast({
                              title: "Revision Selected",
                              description: "View restored from history",
                            });
                          }
                        }}
                      />
                    </Card>
                  )}
                </>
              )}

              {!isGenerating && !generatedImageUrl && (
                <Card className="p-12 bg-secondary/10 border-dashed border-2 border-border flex flex-col items-center justify-center min-h-[400px] text-center">
                  <Car className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                    Design Your Custom Wrap
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Select a preset or describe your design. GraphicsPro™ creates two-tone wraps, racing stripes, chrome deletes, and multi-zone designs.
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Proof Sheet Dialog */}
      <Dialog open={showProofSheet} onOpenChange={setShowProofSheet}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <ProfessionalProofSheet
            views={allViews}
            vehicleYear={year}
            vehicleMake={make}
            vehicleModel={model}
            colorName={stylingPrompt.slice(0, 50) + (stylingPrompt.length > 50 ? '...' : '')}
            finish="Custom"
            manufacturer="GraphicsPro™"
            toolName="GraphicsPro™"
          />
        </DialogContent>
      </Dialog>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <PaywallModal
          open={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}

      {/* Login Required Modal */}
      <LoginRequiredModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Please log in to generate renders. Create a free account to get 2 free renders!"
      />
    </>
  );
};
