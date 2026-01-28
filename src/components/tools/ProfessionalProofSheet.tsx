import React, { useState, useEffect } from 'react';
import { Download, Printer, Share2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { generateProofPdf, generateAndSaveProof, loadShopProfile, type ProofRequest } from '@/lib/proof-service';
import { getToolLabel, type ToolKey } from '@/lib/tool-registry';

interface RenderView {
  type: string;
  url: string;
  label?: string;
}

interface MaterialZone {
  zone: string;
  color: string;
  finish: string;
  manufacturer?: string;
  yardsEstimate: number;
}

interface MaterialEstimateData {
  totalYards: number;
  totalSquareFeet: number;
  vehicleCategory: string;
  zones: MaterialZone[];
}

interface ProfessionalProofSheetProps {
  views: RenderView[];
  vehicleYear?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  /** Tool key from registry - PREFERRED */
  toolKey?: ToolKey;
  /** Legacy: free-form tool name */
  toolName?: string;
  designName?: string;
  manufacturer?: string;
  colorName?: string;
  productCode?: string;
  finish?: string;
  hex?: string;
  shopName?: string;
  shopLogo?: string;
  userTier?: 'basic' | 'pro' | 'elite';
  materialEstimate?: MaterialEstimateData | null;
}

const SHORT_DISCLAIMER = `TERMS & CONDITIONS OF APPROVAL:

1. COLOR ACCURACY: Digital previews are approximate representations. Actual film colors may vary due to lighting conditions, screen calibration, and manufacturer batch variations.

2. PHYSICAL SWATCH REVIEW: Customer confirms they have reviewed physical vinyl swatches prior to approval and understand digital-to-physical color differences.

3. PRE-EXISTING CONDITIONS: Vehicle condition may affect film adhesion and final appearance. Existing paint damage, rust, dents, or previous wrap residue may impact installation quality.

4. PRODUCTION AUTHORIZATION: By signing this approval, customer authorizes production using specified manufacturer vinyl film. Changes after approval may incur additional charges.

5. WARRANTY: Final wrap quality is subject to manufacturer film specifications and proper installation procedures.`;

const MINIMAL_APPROVAL = `I have reviewed the design, colors, and coverage shown in this proof and approve this layout for production. I understand the final wrap is produced using manufacturer vinyl film and may vary slightly from digital previews.`;

export const ProfessionalProofSheet: React.FC<ProfessionalProofSheetProps> = ({
  views,
  vehicleYear,
  vehicleMake,
  vehicleModel,
  toolKey,
  toolName,
  designName,
  manufacturer,
  colorName,
  productCode,
  finish,
  hex,
  shopName: propShopName,
  shopLogo: propShopLogo,
  userTier = 'basic',
  materialEstimate,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [includeDisclaimer, setIncludeDisclaimer] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [needsRevision, setNeedsRevision] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shopProfile, setShopProfile] = useState<{ shop_name?: string; shop_logo_url?: string; default_include_disclaimer?: boolean } | null>(null);

  // Load shop profile on mount
  useEffect(() => {
    loadShopProfile().then(profile => {
      if (profile) {
        setShopProfile(profile);
        if (profile.default_include_disclaimer) {
          setIncludeDisclaimer(true);
        }
      }
    });
  }, []);

  // Resolve tool label from registry
  const resolvedToolKey: ToolKey = toolKey || 'colorpro';
  const displayToolLabel = getToolLabel(resolvedToolKey);

  // Use shop profile values if props not provided
  const shopName = propShopName || shopProfile?.shop_name;
  const shopLogo = propShopLogo || shopProfile?.shop_logo_url;

  const vehicleFullName = [vehicleYear, vehicleMake, vehicleModel].filter(Boolean).join(' ');
  const proofDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Build proof request
  const buildProofRequest = (): ProofRequest => ({
    toolKey: resolvedToolKey,
    views: views.map(v => ({ type: v.type, url: v.url, label: v.label })),
    vehicleInfo: { year: vehicleYear, make: vehicleMake, model: vehicleModel },
    manufacturer,
    filmName: colorName || designName,
    productCode,
    finish,
    customerName: customerName || undefined,
    shopName,
    shopLogoUrl: shopLogo,
    includeTerms: includeDisclaimer,
  });

  // Download PDF
  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const result = await generateProofPdf(buildProofRequest());
      if (result.success && result.pdfUrl) {
        // Open PDF in new tab for download
        window.open(result.pdfUrl, '_blank');
        toast({ title: 'PDF Generated', description: 'Your proof sheet is ready.' });
      } else {
        toast({ title: 'Error', description: result.error || 'Failed to generate PDF', variant: 'destructive' });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Print PDF
  const handlePrint = async () => {
    setIsGenerating(true);
    try {
      const result = await generateProofPdf(buildProofRequest());
      if (result.success && result.pdfUrl) {
        // Open PDF in new tab for printing
        const printWindow = window.open(result.pdfUrl, '_blank');
        if (printWindow) {
          printWindow.onload = () => printWindow.print();
        }
      } else {
        toast({ title: 'Error', description: result.error || 'Failed to generate PDF', variant: 'destructive' });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Save & Share
  const handleSaveAndShare = async () => {
    setIsGenerating(true);
    try {
      const result = await generateAndSaveProof(buildProofRequest());
      if (result.success) {
        if (result.shareUrl) {
          await navigator.clipboard.writeText(result.shareUrl);
          toast({ title: 'Proof Saved!', description: 'Share link copied to clipboard.' });
        } else {
          toast({ title: 'Proof Saved', description: 'PDF generated successfully.' });
        }
      } else {
        toast({ title: 'Error', description: result.error || 'Failed to save proof', variant: 'destructive' });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Map views to 6-grid layout positions
  const getViewByType = (types: string[]) => {
    for (const type of types) {
      const view = views.find(v => v.type.toLowerCase().includes(type.toLowerCase()));
      if (view) return view;
    }
    return undefined;
  };

  const sideView = getViewByType(['side', 'driver', 'left']);
  const passengerView = getViewByType(['passenger', 'right']);
  const heroView = getViewByType(['hero']);
  const frontView = getViewByType(['front']);
  const rearView = getViewByType(['rear', 'back']);
  const topView = getViewByType(['top', 'aerial']);
  const detailView = getViewByType(['hood', 'detail', 'close']);

  const gridViews = {
    driverSide: sideView || heroView,
    front: frontView || heroView,
    rear: rearView,
    passengerSide: passengerView || sideView || heroView,
    top: topView,
    detail: detailView,
  };

  return (
    <div className="w-full bg-background">
      {/* Control Bar */}
      <div className="p-4 border-b border-border bg-muted/30 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Customer Name:</span>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              className="w-64"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handlePrint} disabled={isGenerating} className="gap-2">
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
              Print Proof
            </Button>
            <Button variant="outline" onClick={handleDownload} disabled={isGenerating} className="gap-2">
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Download PDF
            </Button>
            <Button onClick={handleSaveAndShare} disabled={isGenerating} className="gap-2">
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
              Save & Share
            </Button>
          </div>
        </div>
        
        {/* T&C Toggle */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <Checkbox
            id="includeDisclaimer"
            checked={includeDisclaimer}
            onCheckedChange={(checked) => setIncludeDisclaimer(checked === true)}
            className="border-amber-500 data-[state=checked]:bg-amber-500"
          />
          <Label htmlFor="includeDisclaimer" className="text-sm cursor-pointer font-medium">
            Include Full Terms & Conditions (Page 2)
          </Label>
        </div>
      </div>

      {/* Preview - Read-only display */}
      <div className="aspect-[16/9] w-full max-w-[1920px] mx-auto bg-white text-black p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {shopLogo ? (
              <img src={shopLogo} alt={shopName || 'Shop'} className="h-10 object-contain" />
            ) : (
              <div className="text-lg font-bold tracking-tight text-black">
                {displayToolLabel}
              </div>
            )}
            {shopName && !shopLogo && (
              <span className="text-sm text-gray-600 ml-2">{shopName}</span>
            )}
          </div>
          <div className="text-right">
            <h1 className="text-xl font-bold text-black">{vehicleFullName || 'Vehicle'}</h1>
            <p className="text-sm text-gray-600">Design Approval Proof</p>
          </div>
        </div>

        {/* 6-View Grid Layout */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {Object.entries(gridViews).map(([key, view]) => (
            <div key={key} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              {view?.url ? (
                <img src={view.url} alt={key} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              )}
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
          ))}
        </div>

        {/* Film Information Bar */}
        <div className="bg-gray-900 text-white px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {manufacturer && manufacturer !== 'Custom' && (
              <>
                <div>
                  <span className="text-gray-400 text-xs uppercase tracking-wide">Manufacturer</span>
                  <p className="font-semibold">{manufacturer}</p>
                </div>
                <div className="h-8 w-px bg-gray-700" />
              </>
            )}
            {colorName && colorName !== 'Custom Color' && (
              <>
                <div>
                  <span className="text-gray-400 text-xs uppercase tracking-wide">Color</span>
                  <p className="font-semibold">{colorName}</p>
                </div>
                <div className="h-8 w-px bg-gray-700" />
              </>
            )}
            {designName && (
              <>
                <div>
                  <span className="text-gray-400 text-xs uppercase tracking-wide">Design</span>
                  <p className="font-semibold">{designName}</p>
                </div>
                <div className="h-8 w-px bg-gray-700" />
              </>
            )}
            {productCode && (
              <>
                <div>
                  <span className="text-gray-400 text-xs uppercase tracking-wide">Code</span>
                  <p className="font-semibold">{productCode}</p>
                </div>
                <div className="h-8 w-px bg-gray-700" />
              </>
            )}
            <div>
              <span className="text-gray-400 text-xs uppercase tracking-wide">Finish</span>
              <p className="font-semibold">{finish || 'Gloss'}</p>
            </div>
          </div>
          
          {hex && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg border-2 border-white/20" style={{ backgroundColor: hex }} />
              <span className="text-sm font-mono uppercase">{hex}</span>
            </div>
          )}
        </div>

        {/* Customer Approval Section */}
        <div className="border border-gray-300 rounded-lg p-4">
          <h3 className="font-bold text-sm uppercase tracking-wide text-gray-600 mb-3">Customer Approval</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-end gap-4 mb-3">
                <div className="flex-1">
                  <span className="text-xs text-gray-500">Customer Name</span>
                  <div className="border-b border-gray-400 h-6 mt-1 flex items-end">
                    <span className="text-sm">{customerName || ''}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <div className={`w-4 h-4 border-2 border-gray-400 rounded ${isApproved ? 'bg-green-500 border-green-500' : ''}`} />
                  <span className="text-sm">I approve this design</span>
                </label>
                <label className="flex items-center gap-2">
                  <div className={`w-4 h-4 border-2 border-gray-400 rounded ${needsRevision ? 'bg-orange-500 border-orange-500' : ''}`} />
                  <span className="text-sm">Revisions requested</span>
                </label>
              </div>
            </div>
            <div>
              <div className="flex items-end gap-4 mb-4">
                <div className="flex-1">
                  <span className="text-xs text-gray-500">Customer Signature</span>
                  <div className="border-b border-gray-400 h-8 mt-1" />
                </div>
                <div className="w-32">
                  <span className="text-xs text-gray-500">Date</span>
                  <div className="border-b border-gray-400 h-8 mt-1" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer preview text */}
        <div className="mt-3 text-[10px] text-gray-500 leading-tight italic">
          {includeDisclaimer ? 'Full Terms & Conditions will appear on Page 2' : MINIMAL_APPROVAL}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalProofSheet;
