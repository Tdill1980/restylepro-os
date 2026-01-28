import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Maximize2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { MobileZoomImageModal } from "@/components/visualize/MobileZoomImageModal";
import { Skeleton } from "@/components/ui/skeleton";
import { RenderOverlay } from "@/components/tools/RenderOverlay";
import { downloadWithOverlay, OverlaySpec } from "@/lib/download-with-overlay";
import { useToast } from "@/hooks/use-toast";
import type { InkFusionColor } from "@/lib/wpw-infusion-colors";

interface ColorProToolCoreProps {
  allViews: Array<{ type: string; url: string }>;
  isGenerating: boolean;
  isGeneratingAdditional: boolean;
  selectedSwatch: InkFusionColor | null;
  vehicleName?: string;
  onGenerateAdditional: () => void;
  onClearLastRender: () => void;
  pendingViews?: string[];
  // NEW: Multi-film info for Custom Styling mode with material estimates
  multiFilmInfo?: Array<{ zone: string; manufacturer: string; colorName: string; finish: string; yards?: number }>;
  toolLabel?: string; // "ColorPro™" or "ColorPro™ Custom"
}

const VIEW_LABELS: Record<string, string> = {
  hood_detail: "Hood Detail",
  front: "Hero View",
  side: "Side View",
  rear: "Rear View",
  top: "Top View"
};

export const ColorProToolCore = ({
  allViews,
  isGenerating,
  isGeneratingAdditional,
  selectedSwatch,
  vehicleName = '',
  onGenerateAdditional,
  onClearLastRender,
  pendingViews = [],
  multiFilmInfo,
  toolLabel = "ColorPro™",
}: ColorProToolCoreProps) => {
  const [modalViewIndex, setModalViewIndex] = useState<number | null>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Build overlay spec for downloads
  const getOverlaySpec = (): OverlaySpec => ({
    toolName: toolLabel.replace('™', ''),
    manufacturer: multiFilmInfo && multiFilmInfo.length > 0 ? undefined : getManufacturerName(),
    colorOrDesignName: multiFilmInfo && multiFilmInfo.length > 0 ? getMultiFilmOverlay() : getColorName(),
  });

  const handleDownload = async (url: string, viewType: string) => {
    try {
      const overlay = getOverlaySpec();
      const filename = `${selectedSwatch?.name || 'render'}-${viewType}`;
      await downloadWithOverlay(url, filename, overlay);
      toast({ title: "Download started", description: `Downloading ${filename}.png` });
    } catch (error) {
      console.error('Download failed:', error);
      toast({ title: "Download failed", description: "Please try again", variant: "destructive" });
    }
  };

  const handlePrevImage = () => {
    if (modalViewIndex !== null && modalViewIndex > 0) {
      setModalViewIndex(modalViewIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (modalViewIndex !== null && modalViewIndex < allViews.length - 1) {
      setModalViewIndex(modalViewIndex + 1);
    }
  };

  // Get REAL manufacturer name - never show fake/generic values
  const getManufacturerName = () => {
    if (!selectedSwatch) return '';
    const manufacturer = (selectedSwatch as any).manufacturer;
    // If manufacturer is set and valid, use it
    if (manufacturer && manufacturer !== 'Unknown' && manufacturer !== 'Custom') {
      return manufacturer;
    }
    // Derive from colorLibrary if manufacturer not explicitly set
    const lib = (selectedSwatch as any)?.colorLibrary?.toLowerCase() || '';
    if (lib.includes('avery') || lib === 'avery_sw900') return 'Avery Dennison';
    if (lib.includes('3m') || lib === '3m_2080') return '3M';
    if (lib.includes('hexis')) return 'Hexis';
    if (lib.includes('kpmf')) return 'KPMF';
    if (lib.includes('oracal')) return 'Oracal';
    if (lib.includes('inozetek')) return 'Inozetek';
    if (lib.includes('arlon')) return 'Arlon';
    if (lib.includes('teckwrap')) return 'TeckWrap';
    if (lib.includes('vvivid')) return 'VViViD';
    return manufacturer || '';
  };
  
  // Get color name with product code - e.g., "G212 Black Metallic"
  const getColorName = () => {
    if (!selectedSwatch) return '';
    const name = selectedSwatch.name;
    if (!name || name === 'Unknown' || name === 'Unknown Color') return '';
    
    // Extract product code from sku/code field (e.g., "2080-G212" → "G212")
    const swatch = selectedSwatch as any;
    const fullCode = swatch.code || swatch.sku || swatch.productCode || '';
    const skuOnly = fullCode.includes('-') 
      ? fullCode.split('-').pop() 
      : fullCode;
    
    // Return formatted: "G212 Black Metallic" or just name if no code
    return skuOnly ? `${skuOnly} ${name}` : name;
  };

  // Build multi-film overlay text for Custom Styling with yards
  const getMultiFilmOverlay = () => {
    if (!multiFilmInfo || multiFilmInfo.length === 0) return '';
    return multiFilmInfo.map(f => {
      const zone = f.zone.charAt(0).toUpperCase() + f.zone.slice(1);
      const parts = [f.manufacturer, f.colorName].filter(Boolean);
      const yardsText = f.yards ? ` (${f.yards} yd)` : '';
      return `${zone}: ${parts.join(' ')} ${f.finish}${yardsText}`;
    }).join(' | ');
  };

  if (isGenerating) {
    return (
      <Card className="p-8 bg-card border-border">
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Generating Hero View...</p>
          <p className="text-sm text-muted-foreground">This may take 30-60 seconds</p>
        </div>
      </Card>
    );
  }

  // Always show the persistent container
  const hasLastRender = allViews.length > 0;
  const hasAdditionalViews = allViews.length > 1;
  const currentModalView = modalViewIndex !== null ? allViews[modalViewIndex] : null;

  return (
    <>
      <div className="space-y-4">
        {/* Individual render containers */}
        {allViews.map((view, index) => (
          <Card key={view.type} className="p-4 bg-card border-border">
            <div className="space-y-3">
              {/* Label */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <h4 className="font-semibold text-sm">
                  {VIEW_LABELS[view.type] || view.type}
                </h4>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setModalViewIndex(index)}
                    className="flex-1 sm:flex-initial"
                  >
                    <Maximize2 className="h-4 w-4 mr-2" />
                    Enlarge
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(view.url, view.type)}
                    className="flex-1 sm:flex-initial"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              {/* Image with client-side text overlays - Clickable on mobile */}
              <div 
                className="relative w-full aspect-video rounded-lg overflow-hidden bg-secondary/10 border border-border cursor-pointer active:opacity-75 transition-opacity"
                onClick={() => setModalViewIndex(index)}
              >
                <img
                  src={view.url}
                  alt={`${VIEW_LABELS[view.type]} view`}
                  className="w-full h-full object-cover"
                />
                
                {/* Client-side label overlay (tool name + manufacturer + color/design) */}
                <RenderOverlay
                  toolName="InkFusion"
                  manufacturer={multiFilmInfo && multiFilmInfo.length > 0 ? undefined : getManufacturerName()}
                  colorOrDesignName={multiFilmInfo && multiFilmInfo.length > 0 ? getMultiFilmOverlay() : getColorName()}
                />
              </div>
            </div>
          </Card>
        ))}

        {/* Generate additional views button */}
        {allViews.length === 1 && !isGeneratingAdditional && pendingViews.length === 0 && (
          <Card className="p-4 bg-card border-border">
            <Button
              onClick={onGenerateAdditional}
              variant="outline"
              className="w-full"
              disabled={isGeneratingAdditional}
            >
              Generate Additional Views (Side, Rear, Top)
            </Button>
          </Card>
        )}

        {/* Progressive loading skeletons for pending views */}
        {pendingViews.length > 0 && (
          <>
            {pendingViews.map((viewType) => (
              <Card key={`pending-${viewType}`} className="p-4 bg-card border-border">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <h4 className="font-semibold text-sm text-muted-foreground">
                        Generating {VIEW_LABELS[viewType] || viewType}...
                      </h4>
                    </div>
                  </div>
                  <Skeleton className="w-full aspect-video rounded-lg" />
                </div>
              </Card>
            ))}
          </>
        )}

        {/* Loading additional views (fallback for old behavior) */}
        {isGeneratingAdditional && pendingViews.length === 0 && (
          <Card className="p-6 bg-card border-border">
            <div className="flex flex-col items-center justify-center space-y-3 py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Generating Additional Views...</p>
              <p className="text-xs text-muted-foreground">
                Creating {3 - (allViews.length - 1)} more angles
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Full screen modal with navigation */}
      <MobileZoomImageModal
        imageUrl={currentModalView?.url || ''}
        title={`${VIEW_LABELS[currentModalView?.type || ''] || currentModalView?.type} - ${selectedSwatch?.name || 'Color Wrap'}`}
        isOpen={modalViewIndex !== null}
        onClose={() => setModalViewIndex(null)}
        showNavigation={allViews.length > 1}
        onPrev={modalViewIndex !== null && modalViewIndex > 0 ? handlePrevImage : undefined}
        onNext={modalViewIndex !== null && modalViewIndex < allViews.length - 1 ? handleNextImage : undefined}
        currentIndex={modalViewIndex ?? 0}
        totalCount={allViews.length}
      />
    </>
  );
};

// Backward compatibility alias
export const InkFusionToolCore = ColorProToolCore;
