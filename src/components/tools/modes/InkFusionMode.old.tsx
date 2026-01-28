import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { HeroRenderer } from "../../HeroRenderer";
import { useGenerationLimit } from "@/hooks/useGenerationLimit";
import { PaywallModal } from "../../PaywallModal";
import { useToast } from "@/hooks/use-toast";

export const InkFusionMode = () => {
  const [selectedSwatch, setSelectedSwatch] = useState<any>(null);
  const [showFallback, setShowFallback] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const { hasReachedLimit, incrementGeneration, remainingGenerations } = useGenerationLimit();
  const { toast } = useToast();

  const { data: swatches, isLoading } = useQuery({
    queryKey: ["inkfusion_swatches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inkfusion_swatches")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const handleGenerate = () => {
    if (hasReachedLimit) {
      setPaywallOpen(true);
      return;
    }
    
    incrementGeneration();
    setShowFallback(false);
    toast({
      title: "Preview Generated",
      description: `${remainingGenerations - 1} free previews remaining`,
    });
  };

  const handleShowExample = () => {
    setShowFallback(true);
  };

  return (
    <>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Select Color Swatch</h3>
          <ScrollArea className="h-96 border border-border rounded-lg p-4 bg-secondary/20">
            <div className="grid grid-cols-3 gap-3">
              {swatches?.map((swatch) => (
                <button
                  key={swatch.id}
                  onClick={() => setSelectedSwatch(swatch)}
                  className={`aspect-square rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedSwatch?.id === swatch.id
                      ? "border-primary shadow-lg shadow-primary/20"
                      : "border-border"
                  }`}
                  style={{ backgroundColor: swatch.hex || "#333" }}
                >
                  <div className="w-full h-full flex items-end justify-center p-2">
                    <span className="text-xs font-medium bg-background/80 px-2 py-1 rounded">
                      {swatch.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
          
          {selectedSwatch && (
            <div className="mt-4 p-4 bg-secondary/20 rounded-lg border border-border">
              <h4 className="font-semibold mb-2">{selectedSwatch.name}</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                {selectedSwatch.hex && <p>Hex: {selectedSwatch.hex}</p>}
                {selectedSwatch.finish && <p>Finish: {selectedSwatch.finish}</p>}
              </div>
            </div>
          )}
        </div>
        
        <HeroRenderer 
          selectedColor={selectedSwatch?.hex}
          fallbackImage="/images/fallback/inkfusion/default.png"
          showFallback={showFallback}
          onGenerate={handleGenerate}
          canGenerate={!hasReachedLimit}
        />
      </div>

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onShowExample={handleShowExample}
        productType="inkfusion"
      />
    </>
  );
};
