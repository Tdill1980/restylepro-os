import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { PrintProCard, PrintProCardHeader, PrintProCardTitle, PrintProCardDescription, PrintProCardContent } from "./PrintProCard";
import { PrintProSwatch } from "./PrintProSwatch";
import { PrintProRenderCarousel } from "./PrintProRenderCarousel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { trackQuoteEvent, generateQuoteId } from "@/lib/track-conversion";

const FadeWrapPrintedProductPage = () => {
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [addHood, setAddHood] = useState(false);
  const [addFrontBumper, setAddFrontBumper] = useState(false);
  const [addRearBumper, setAddRearBumper] = useState(false);
  const [kitSize, setKitSize] = useState<"compact" | "midsize" | "fullsize">("midsize");
  const [roofSize, setRoofSize] = useState<"standard" | "panoramic" | "none">("none");
  const [renderViews, setRenderViews] = useState<Array<{ type: string; url: string }>>([]);
  const [isLoadingRenders, setIsLoadingRenders] = useState(false);

  // Fetch FadeWraps colors from database
  const { data: colors, isLoading } = useQuery({
    queryKey: ["fadewraps-colors-printpro"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fadewraps_patterns")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const calculatePanelPrice = () => {
    let basePrice = kitSize === "compact" ? 299 : kitSize === "midsize" ? 399 : 499;
    if (addHood) basePrice += 150;
    if (addFrontBumper) basePrice += 100;
    if (addRearBumper) basePrice += 100;
    if (roofSize === "standard") basePrice += 200;
    if (roofSize === "panoramic") basePrice += 250;
    return basePrice;
  };

  const handleColorClick = async (index: number) => {
    setSelectedColor(index);
    const color = colors?.[index];
    if (!color) return;

    setIsLoadingRenders(true);
    
    try {
      // Fetch pre-stored renders from vehicle_render_images table
      const { data: renders, error } = await supabase
        .from('vehicle_render_images')
        .select('*')
        .eq('swatch_id', color.id)
        .eq('product_type', 'fadewraps')
        .eq('is_active', true);
      
      if (error) {
        console.error('Error fetching renders:', error);
        setRenderViews([]);
        return;
      }
      
      // Map database records to view format
      const views = renders?.map(render => ({
        type: render.vehicle_type,
        url: render.image_url
      })) || [];
      
      setRenderViews(views);
    } catch (error) {
      console.error('Error loading renders:', error);
      setRenderViews([]);
    } finally {
      setIsLoadingRenders(false);
    }
  };

  const handleAddToCart = () => {
    if (selectedColor !== null && colors) {
      const color = colors[selectedColor];
      const price = calculatePanelPrice();
      
      // Track conversion event (fire-and-forget)
      trackQuoteEvent({
        eventType: "order_now_clicked",
        quoteId: generateQuoteId(),
        productType: "fadewrap",
        metadata: { 
          colorId: color.id, 
          colorName: color.name, 
          kitSize, 
          addHood, 
          addFrontBumper, 
          addRearBumper, 
          roofSize, 
          price 
        },
      });
      
      // Redirect to WPW with FadeWrap panel kit
      window.open(
        `https://weprintwraps.com/cart/?add-to-cart=FADEWRAP_${color.id}&panels=${kitSize}&hood=${addHood}&front=${addFrontBumper}&rear=${addRearBumper}&roof=${roofSize}&price=${price}`,
        "_blank"
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <PrintProCard className="mb-8">
          <PrintProCardHeader>
            <PrintProCardTitle>
              <span className="text-foreground">Fade</span><span className="text-gradient-designpro">Wrap™</span><span className="text-foreground"> Printed Panels</span>
            </PrintProCardTitle>
            <PrintProCardDescription>
              Pre-printed gradient fade panels ready to install. Select your gradient color and panel configuration.
            </PrintProCardDescription>
          </PrintProCardHeader>
        </PrintProCard>

        <PrintProCard className="mb-8">
          <PrintProCardHeader>
            <PrintProCardTitle className="text-lg">Select Gradient Color</PrintProCardTitle>
          </PrintProCardHeader>
          <PrintProCardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {colors?.map((color, idx) => (
                  <PrintProSwatch
                    key={color.id}
                    color={{
                      name: color.name,
                      hex: "#9b87f5",
                      finish: "Gloss",
                    }}
                    selected={selectedColor === idx}
                    onClick={() => handleColorClick(idx)}
                  />
                ))}
              </div>
            )}
          </PrintProCardContent>
        </PrintProCard>

        <PrintProCard className="mb-8">
          <PrintProCardHeader>
            <PrintProCardTitle className="text-lg">Panel Configuration</PrintProCardTitle>
          </PrintProCardHeader>
          <PrintProCardContent className="space-y-6">
            <div>
              <Label className="text-base mb-3 block">Base Kit Size</Label>
              <RadioGroup value={kitSize} onValueChange={(value: any) => setKitSize(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="compact" id="compact" />
                  <Label htmlFor="compact">Compact (Fenders + Doors) - $299</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="midsize" id="midsize" />
                  <Label htmlFor="midsize">Midsize (Fenders + Doors + Quarter Panels) - $399</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fullsize" id="fullsize" />
                  <Label htmlFor="fullsize">Full-Size (Complete Side Coverage) - $499</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-base">Add-On Panels</Label>
              <div className="flex items-center space-x-2">
                <Checkbox id="hood" checked={addHood} onCheckedChange={(checked) => setAddHood(checked === true)} />
                <Label htmlFor="hood">Hood Panel (+$150)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="frontBumper" checked={addFrontBumper} onCheckedChange={(checked) => setAddFrontBumper(checked === true)} />
                <Label htmlFor="frontBumper">Front Bumper (+$100)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="rearBumper" checked={addRearBumper} onCheckedChange={(checked) => setAddRearBumper(checked === true)} />
                <Label htmlFor="rearBumper">Rear Bumper (+$100)</Label>
              </div>
            </div>

            <div>
              <Label className="text-base mb-3 block">Roof Panel</Label>
              <RadioGroup value={roofSize} onValueChange={(value: any) => setRoofSize(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="none" />
                  <Label htmlFor="none">No Roof Panel</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="standard" id="standard" />
                  <Label htmlFor="standard">Standard Roof (+$200)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="panoramic" id="panoramic" />
                  <Label htmlFor="panoramic">Panoramic Roof (+$250)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xl font-semibold">Total: ${calculatePanelPrice()}</p>
            </div>
          </PrintProCardContent>
        </PrintProCard>

        {(selectedColor !== null || isLoadingRenders) && (
          <PrintProCard className="mb-8">
            <PrintProCardHeader>
              <PrintProCardTitle className="text-lg">3D Vehicle Preview</PrintProCardTitle>
              <PrintProCardDescription>
                See how {colors?.[selectedColor || 0]?.name} gradient looks on a vehicle
              </PrintProCardDescription>
            </PrintProCardHeader>
            <PrintProCardContent>
              <PrintProRenderCarousel
                views={renderViews}
                colorName={colors?.[selectedColor || 0]?.name || ""}
                colorHex="#9b87f5"
                finish="Gradient"
                isGenerating={isLoadingRenders}
              />
            </PrintProCardContent>
          </PrintProCard>
        )}

        <div className="flex justify-center">
          <Button 
            size="lg" 
            disabled={selectedColor === null}
            onClick={handleAddToCart}
            className="bg-gradient-to-r from-[#D946EF] to-[#9b87f5] hover:opacity-90"
          >
            Order FadeWrap™ Panel Kit - ${calculatePanelPrice()}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FadeWrapPrintedProductPage;
