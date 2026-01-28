import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface WrapByTheYardModeProps {
  selectedProduct: any;
  onProductSelect: (product: any) => void;
  yardsNeeded: number;
  onYardsChange: (yards: number) => void;
  pricePerYard?: number;
  patternScale: number;
  onPatternScaleChange: (scale: number) => void;
}

export const WrapByTheYardMode = ({
  selectedProduct,
  onProductSelect,
  yardsNeeded,
  onYardsChange,
  pricePerYard = 95.50,
  patternScale,
  onPatternScaleChange,
}: WrapByTheYardModeProps) => {
  const { data: products, isLoading } = useQuery({
    queryKey: ["wbty_products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wbty_products")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      
      if (error) throw error;
      
      // Filter out products with placeholder images
      return data?.filter(product => 
        product.media_url && 
        !product.media_url.includes('placeholder') &&
        product.media_url.includes('supabase.co/storage')
      ) || [];
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="aspect-square" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="bg-secondary/30 border border-border/50 rounded-lg p-4">
        <p className="text-xs text-muted-foreground/90 italic">
          Select any pattern from 92+ designs across 5 categories → Adjust pattern scale (30%-300%) → Calculate yards needed → Get photorealistic 3D renders showing the pattern on your vehicle
        </p>
      </div>

      {/* Pattern Scale Control */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Pattern Size</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="pattern-scale">Scale: {Math.round(patternScale * 100)}%</Label>
              <span className="text-xs font-semibold text-muted-foreground">
                {patternScale < 0.6 ? '🔬 Micro' : patternScale < 0.8 ? '📉 Small' : patternScale < 1.2 ? '📏 Standard' : patternScale < 2.0 ? '📈 Large' : patternScale < 2.5 ? '🔥 Bold' : '💥 Extreme'}
              </span>
            </div>
            <Slider
              id="pattern-scale"
              min={0.3}
              max={3.0}
              step={0.1}
              value={[patternScale]}
              onValueChange={(value) => onPatternScaleChange(value[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>30%</span>
              <span>100%</span>
              <span>300%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 italic">
              {patternScale < 0.6 && 'Ultra-fine detail - pattern elements will be very small'}
              {patternScale >= 0.6 && patternScale < 0.8 && 'Smaller pattern elements for subtle effect'}
              {patternScale >= 0.8 && patternScale < 1.2 && 'Standard balanced pattern size'}
              {patternScale >= 1.2 && patternScale < 2.0 && 'Larger pattern elements for bold look'}
              {patternScale >= 2.0 && patternScale < 2.5 && 'Dramatic oversized pattern elements'}
              {patternScale >= 2.5 && 'Extreme statement piece - massive pattern elements'}
            </p>
          </div>
        </div>
      </div>

      {/* Yards Calculator */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Yards Needed</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="yards">Number of Yards</Label>
            <Input
              id="yards"
              type="number"
              min="1"
              value={yardsNeeded}
              onChange={(e) => onYardsChange(parseInt(e.target.value) || 1)}
              className="mt-2"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Price per yard: ${pricePerYard.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Pattern Selector */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Pattern</h3>
        <ScrollArea className="h-96">
          <div className="grid grid-cols-1 gap-3 pr-4">
            {products?.map((product) => (
              <button
                key={product.id}
                onClick={() => onProductSelect(product)}
                className={`relative h-40 rounded-lg border-2 transition-all hover:scale-[1.02] overflow-hidden ${
                  selectedProduct?.id === product.id
                    ? "border-primary shadow-lg shadow-primary/20"
                    : "border-border"
                }`}
              >
                <div className="absolute inset-0 flex items-center gap-5 p-4">
                  <div className="w-36 h-36 flex-shrink-0 rounded-md overflow-hidden border border-border/50 bg-background/50">
                    <img
                      src={product.media_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 text-left min-w-0 pr-2">
                    <p className="font-bold text-lg leading-tight mb-1.5">{product.name}</p>
                    {product.category && (
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
        
        {selectedProduct && (
          <div className="mt-4 space-y-3">
            {/* Pattern Info */}
            <div className="p-4 bg-secondary/20 rounded-lg border border-border">
              <h4 className="font-semibold mb-2">{selectedProduct.name}</h4>
              {selectedProduct.category && (
                <p className="text-sm text-muted-foreground">Family: {selectedProduct.category}</p>
              )}
            </div>

            {/* Scale Preview */}
            <div className="p-4 bg-secondary/20 rounded-lg border border-border space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">Scale Preview</h4>
                <span className="text-xs text-muted-foreground">
                  {Math.round(patternScale * 100)}% size
                </span>
              </div>
              
              <div 
                className="w-full h-48 rounded-md border border-border/50 overflow-hidden relative"
                style={{
                  backgroundImage: `url(${selectedProduct.media_url})`,
                  backgroundSize: `${100 / patternScale}%`,
                  backgroundRepeat: 'repeat',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-2 left-2 right-2 text-center">
                  <p className="text-xs font-medium text-foreground/90 bg-background/60 backdrop-blur-sm rounded px-2 py-1 inline-block">
                    Pattern will appear {patternScale < 1 ? 'smaller' : patternScale > 1 ? 'larger' : 'at default size'} on vehicle
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
