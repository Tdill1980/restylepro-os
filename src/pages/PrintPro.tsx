import { Header } from "@/components/Header";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Download, ShoppingCart, FileText, Share2, Loader2, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Vehicle360Viewer } from "@/components/visualize/Vehicle360Viewer";
import {
  PrintProCard,
  PrintProCardHeader,
  PrintProCardTitle,
  PrintProCardDescription,
  PrintProCardContent,
} from "@/components/printpro/PrintProCard";
import { generatePrintProPoster } from "@/lib/printpro-poster-generator";
import { trackQuoteEvent, generateQuoteId } from "@/lib/track-conversion";

interface PromptState {
  panelName?: string;
  panelUrl?: string;
  allViews?: Array<{ type: string; url: string }>;
  heroUrl?: string;
}

interface DesignJob {
  id: string;
  user_id: string | null;
  panel_id: string | null;
  vehicle_year: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  finish: string | null;
  preview_image_url: string | null;
  prompt_state: PromptState | null;
}

interface RevisionHistoryItem {
  id: string;
  revision_prompt: string;
  created_at: string;
}

interface LocationState {
  designUrl?: string;
  revisionPrompt?: string;
  revisionHistory?: RevisionHistoryItem[];
  sourceTool?: string;
  designName?: string;
}

const PrintPro = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const locationState = location.state as LocationState | null;
  
  const designId = searchParams.get("designId");
  const jobType = searchParams.get("type") || "panel";
  
  const [job, setJob] = useState<DesignJob | null>(null);
  const [loading, setLoading] = useState(!!designId);

  // Revision data from navigation state
  const incomingDesignUrl = locationState?.designUrl || null;
  const incomingRevisionPrompt = locationState?.revisionPrompt || '';
  const incomingHistory = locationState?.revisionHistory || [];
  const sourceTool = locationState?.sourceTool || '';
  const designName = locationState?.designName || 'Custom Design';

  // Fetch design job if designId is provided
  useEffect(() => {
    async function loadDesignJob() {
      if (!designId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("panel_designs")
          .select("*")
          .eq("id", designId)
          .single();

        if (error) throw error;
        if (data) {
          setJob({
            id: data.id,
            user_id: data.user_id,
            panel_id: data.panel_id,
            vehicle_year: data.vehicle_year,
            vehicle_make: data.vehicle_make,
            vehicle_model: data.vehicle_model,
            finish: data.finish,
            preview_image_url: data.preview_image_url,
            prompt_state: data.prompt_state as PromptState | null,
          });
        }
      } catch (err) {
        console.error("Failed to load design job:", err);
        toast.error("Could not load design");
      } finally {
        setLoading(false);
      }
    }

    loadDesignJob();
  }, [designId]);

  const handleDownloadCatalog = async () => {
    try {
      toast.loading("Generating color catalog PDF...");
      await generatePrintProPoster();
      toast.dismiss();
      toast.success("Color catalog downloaded successfully!");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to generate color catalog");
      console.error(error);
    }
  };

  // Calculate SQFT and tier
  const calculateTier = (sqft: number) => {
    if (sqft < 150) return { tier: "small", price: 600 };
    if (sqft < 250) return { tier: "medium", price: 710 };
    if (sqft < 350) return { tier: "large", price: 825 };
    return { tier: "xl", price: 990 };
  };

  const estimatedSqft = 250; // Default estimate, can be calculated from vehicle
  const { tier, price } = calculateTier(estimatedSqft);

  // Handle WPW checkout
  const handleCheckout = () => {
    if (job?.id) {
      // Track conversion event (fire-and-forget)
      trackQuoteEvent({
        eventType: "order_now_clicked",
        quoteId: generateQuoteId(),
        productType: "printpro",
        metadata: { 
          jobId: job.id,
          tier,
          price,
          vehicleInfo: `${job.vehicle_year} ${job.vehicle_make} ${job.vehicle_model}`,
          designName: job.prompt_state?.panelName 
        },
      });
      
      window.location.href = `https://weprintwraps.com/cart?job_id=${job.id}&tier=${tier}`;
    }
  };

  // Get images for 360 viewer
  const get360Images = (): string[] => {
    if (!job?.prompt_state?.allViews) return [];
    return job.prompt_state.allViews.map(v => v.url).filter(Boolean);
  };

  const heroUrl = job?.prompt_state?.heroUrl || job?.preview_image_url;
  const spinImages = get360Images();
  const hasSpinView = spinImages.length >= 4;

  const products = [
    {
      title: (
        <>
          <span className="text-foreground">Ink</span>
          <span className="text-gradient-designpro">Fusion™</span>
          <span className="text-foreground"> Premium Printed Film</span>
        </>
      ),
      description: "Custom color printed vinyl film with metallic and gloss finishes",
      route: "/printpro/inkfusion",
    },
    {
      title: "Printable Reflective Film",
      description: "High-visibility reflective film sold by square foot",
      route: "/printpro/reflective",
    },
    {
      title: (
        <>
          <span className="text-foreground">Fade</span>
          <span className="text-gradient-designpro">Wrap™</span>
          <span className="text-foreground"> Printed Panels</span>
        </>
      ),
      description: "Pre-printed gradient fade panels with custom configuration",
      route: "/printpro/fadewrap",
    },
    {
      title: (
        <>
          <span className="text-foreground">Pattern</span>
          <span className="text-gradient-designpro">Pro™</span>
          <span className="text-foreground"> Printed Rolls</span>
        </>
      ),
      description: "Pre-printed patterns sold by the yard",
      route: "/printpro/wbty",
    },
    {
      title: "Full-Design Print Packs",
      description: "Complete design kits - printed panels OR production files",
      route: "/printpro/design-packs",
    },
    {
      title: (
        <>
          <span className="text-foreground">Approve</span>
          <span className="text-gradient-designpro">Pro™</span>
          <span className="text-foreground"> Print Service</span>
        </>
      ),
      description: "Upload your design and we'll print it by square foot",
      route: "/printpro/custom-upload",
    },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Apple-grade checkout UI when a design job is loaded
  if (job && designId) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/printpro")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Print<span className="bg-gradient-to-r from-[#D946EF] to-[#9b87f5] bg-clip-text text-transparent">Pro</span>™ Checkout
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Review your design and order printed wrap panels
            </p>
          </div>

          {/* Two-column Apple-style layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* LEFT COLUMN - Visuals */}
            <div className="lg:col-span-7 space-y-6">
              {/* Hero or 360 Viewer */}
              <div className="rounded-2xl overflow-hidden shadow-xl bg-card border border-border">
                {hasSpinView ? (
                  <Vehicle360Viewer
                    images={spinImages}
                    vehicleName={`${job.vehicle_year || ''} ${job.vehicle_make || ''} ${job.vehicle_model || ''}`}
                    designName={job.prompt_state?.panelName || "Custom Design"}
                  />
                ) : heroUrl ? (
                  <img 
                    src={heroUrl} 
                    alt="Design preview" 
                    className="w-full aspect-video object-cover"
                  />
                ) : (
                  <div className="w-full aspect-video bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground">No preview available</p>
                  </div>
                )}
              </div>

              {/* Project Details Card */}
              <div className="p-6 bg-card rounded-2xl shadow-lg border border-border space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Project Details</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Vehicle</p>
                    <p className="font-medium text-foreground">
                      {job.vehicle_year} {job.vehicle_make} {job.vehicle_model}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Design</p>
                    <p className="font-medium text-foreground">
                      {job.prompt_state?.panelName || "Custom Wrap"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Finish</p>
                    <p className="font-medium text-foreground capitalize">
                      {job.finish || "Gloss"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Estimated Coverage</p>
                    <p className="font-medium text-foreground">{estimatedSqft} sq.ft.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - Order Panel */}
            <div className="lg:col-span-5 space-y-6">
              {/* Revision Notes Section (if coming from a tool with revision) */}
              {incomingRevisionPrompt && (
                <div className="p-4 border border-border/40 rounded-xl bg-background/30">
                  <h3 className="font-semibold mb-2 text-foreground">Revision Notes</h3>
                  <p className="text-sm text-muted-foreground">{incomingRevisionPrompt}</p>
                </div>
              )}

              {incomingHistory && incomingHistory.length > 0 && (
                <div className="p-4 border border-border/40 rounded-xl bg-background/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">Revision History</h3>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1 max-h-[120px] overflow-y-auto">
                    {incomingHistory.map((h) => (
                      <li key={h.id} className="flex justify-between">
                        <span className="truncate flex-1">• {h.revision_prompt}</span>
                        <span className="text-[10px] opacity-50 ml-2 shrink-0">
                          {new Date(h.created_at).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Main CTA Card */}
              <div className="bg-card rounded-2xl shadow-xl border border-border p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Ready to Order?</h2>
                  <p className="text-muted-foreground mt-1">
                    Your design is saved and ready for production
                  </p>
                </div>

                {/* Pricing */}
                <div className="p-4 bg-muted/50 rounded-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Recommended Size</p>
                      <p className="text-lg font-bold text-foreground uppercase">{tier}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Starting at</p>
                      <p className="text-2xl font-bold text-primary">${price}</p>
                    </div>
                  </div>
                </div>

                {/* Primary CTA */}
                <Button
                  size="lg"
                  className="w-full py-6 text-lg bg-gradient-to-r from-[#D946EF] to-[#9b87f5] hover:opacity-90"
                  onClick={handleCheckout}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Order Printed Wrap
                </Button>

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => toast.info("PDF proof generation coming soon")}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Download Proof
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => toast.info("Share functionality coming soon")}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Design
                  </Button>
                </div>
              </div>

              {/* Size Guide */}
              <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Size Guide</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className={tier === "small" ? "font-bold text-primary" : "text-muted-foreground"}>Small (under 150 sq.ft.)</span>
                    <span className="font-medium">$600</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className={tier === "medium" ? "font-bold text-primary" : "text-muted-foreground"}>Medium (150-250 sq.ft.)</span>
                    <span className="font-medium">$710</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className={tier === "large" ? "font-bold text-primary" : "text-muted-foreground"}>Large (250-350 sq.ft.)</span>
                    <span className="font-medium">$825</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className={tier === "xl" ? "font-bold text-primary" : "text-muted-foreground"}>XL (over 350 sq.ft.)</span>
                    <span className="font-medium">$990</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default product catalog view
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Print<span className="bg-gradient-to-r from-[#D946EF] to-[#9b87f5] bg-clip-text text-transparent">Pro</span>™
          </h1>
          <p className="text-xl text-muted-foreground">
            Custom printed vinyl films and design packages
          </p>
          
          <Button
            onClick={handleDownloadCatalog}
            className="mt-6 bg-gradient-to-r from-[#D946EF] to-[#9b87f5] hover:opacity-90"
            size="lg"
          >
            <Download className="mr-2 h-5 w-5" />
            Download Color Catalog PDF
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <PrintProCard
              key={product.route}
              className="cursor-pointer transition-transform hover:scale-105"
              onClick={() => navigate(product.route)}
            >
              <PrintProCardHeader>
                <PrintProCardTitle>{product.title}</PrintProCardTitle>
                <PrintProCardDescription>{product.description}</PrintProCardDescription>
              </PrintProCardHeader>
              <PrintProCardContent>
                <button className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  View Product
                </button>
              </PrintProCardContent>
            </PrintProCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrintPro;
