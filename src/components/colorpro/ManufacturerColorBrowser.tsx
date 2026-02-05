import { useState, useEffect, useMemo } from "react";
import { dataClient, EXTERNAL_DB_URL } from "@/integrations/supabase/dataClient";
import { Loader2 } from "lucide-react";

// Debug: Log the database URL on module load
console.log("🔗 ManufacturerColorBrowser using database:", EXTERNAL_DB_URL);

// NEW: Use manufacturer_colors as the SOLE source of truth
interface ManufacturerColor {
  id: string;
  manufacturer: string;
  series: string | null;
  product_code: string;
  official_name: string;
  official_hex: string;
  official_swatch_url: string | null;
  lab_l: number | null;
  lab_a: number | null;
  lab_b: number | null;
  finish: string;
  is_ppf: boolean;
  is_verified: boolean;
}

// Compatibility interface for existing consumers
export interface VinylSwatch {
  id: string;
  manufacturer: string;
  series: string | null;
  name: string;
  code: string | null;
  finish: string;
  hex: string;
  media_url: string | null;
  ppf: boolean | null;
  metallic: boolean | null;
  pearl: boolean | null;
  chrome: boolean | null;
  // NEW: LAB values for color accuracy
  lab_l?: number | null;
  lab_a?: number | null;
  lab_b?: number | null;
  // Flag indicating this is from the verified manufacturer_colors table
  isOfficialManufacturerColor?: boolean;
}

interface ManufacturerColorBrowserProps {
  selectedSwatch: { id: string; name: string; hex: string; finish?: string } | null;
  onSwatchSelect: (swatch: VinylSwatch) => void;
}

type CategoryType = "color-change" | "ppf";

// Convert ManufacturerColor to VinylSwatch for compatibility
function convertToVinylSwatch(mc: ManufacturerColor): VinylSwatch {
  return {
    id: mc.id,
    manufacturer: mc.manufacturer,
    series: mc.series,
    name: mc.official_name,
    code: mc.product_code,
    finish: mc.finish,
    hex: mc.official_hex,
    media_url: mc.official_swatch_url,
    ppf: mc.is_ppf,
    metallic: null,
    pearl: null,
    chrome: null,
    lab_l: mc.lab_l,
    lab_a: mc.lab_a,
    lab_b: mc.lab_b,
    isOfficialManufacturerColor: true,
  };
}

export const ManufacturerColorBrowser = ({
  selectedSwatch,
  onSwatchSelect,
}: ManufacturerColorBrowserProps) => {
  const [allColors, setAllColors] = useState<VinylSwatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("color-change");
  const [selectedManufacturer, setSelectedManufacturer] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Fetch from manufacturer_colors (authoritative source)
  useEffect(() => {
    const fetchColors = async () => {
      setIsLoading(true);

      console.log("🔍 ManufacturerColorBrowser: Starting fetch...");
      console.log("🌐 Using dataClient URL:", (dataClient as any).supabaseUrl || "unknown");

      // FIRST: Try manufacturer_colors (new authoritative table)
      // Note: Removed is_verified filter since newly inserted colors may not have it set
      const { data: mfcData, error: mfcError } = await dataClient
        .from("manufacturer_colors")
        .select("*")
        .order("manufacturer", { ascending: true })
        .order("official_name", { ascending: true });

      console.log("📊 Query complete. Data:", mfcData?.length || 0, "rows. Error:", mfcError);

      if (mfcError) {
        console.error("❌ Error fetching manufacturer_colors:", mfcError);
        console.error("❌ Error details:", JSON.stringify(mfcError, null, 2));
      }

      console.log(`📊 manufacturer_colors query returned ${mfcData?.length || 0} rows`);

      if (mfcData && mfcData.length > 0) {
        // Log sample data for debugging
        const sample = mfcData.slice(0, 3);
        console.log("📋 Sample data:", sample.map(c => ({
          name: c.official_name,
          is_ppf: c.is_ppf,
          is_verified: c.is_verified
        })));

        console.log(`✅ Loaded ${mfcData.length} colors from manufacturer_colors (authoritative)`);
        setAllColors(mfcData.map(convertToVinylSwatch));
        setIsLoading(false);
        return;
      }

      // FALLBACK: Use vinyl_swatches if manufacturer_colors is empty
      console.warn("⚠️ manufacturer_colors empty, falling back to vinyl_swatches");
      const { data, error } = await dataClient
        .from("vinyl_swatches")
        .select("*")
        .eq("verified", true)
        .order("manufacturer", { ascending: true })
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching vinyl swatches:", error);
      } else {
        setAllColors((data || []).map(d => ({
          ...d,
          isOfficialManufacturerColor: false,
        })));
      }
      setIsLoading(false);
    };

    fetchColors();
  }, []);

  // Split colors by category
  const { colorChangeFilms, ppfFilms } = useMemo(() => {
    // Color change = NOT PPF (ppf is false or null)
    const colorChange = allColors.filter((c) => c.ppf !== true);
    const ppf = allColors.filter((c) => c.ppf === true);

    console.log(`🎨 Category split: ${colorChange.length} color-change, ${ppf.length} PPF (total: ${allColors.length})`);

    return { colorChangeFilms: colorChange, ppfFilms: ppf };
  }, [allColors]);

  // Get manufacturers for current category
  const manufacturers = useMemo(() => {
    const colors = selectedCategory === "color-change" ? colorChangeFilms : ppfFilms;
    const manufacturerCounts = colors.reduce((acc, color) => {
      acc[color.manufacturer] = (acc[color.manufacturer] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(manufacturerCounts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
  }, [selectedCategory, colorChangeFilms, ppfFilms]);

  // Get colors for selected manufacturer
  const displayColors = useMemo(() => {
    if (!selectedManufacturer) return [];
    const colors = selectedCategory === "color-change" ? colorChangeFilms : ppfFilms;
    return colors.filter((c) => c.manufacturer === selectedManufacturer);
  }, [selectedManufacturer, selectedCategory, colorChangeFilms, ppfFilms]);

  // Reset manufacturer when category changes
  useEffect(() => {
    setSelectedManufacturer(null);
  }, [selectedCategory]);

  // Auto-select first manufacturer if none selected
  useEffect(() => {
    if (!selectedManufacturer && manufacturers.length > 0) {
      setSelectedManufacturer(manufacturers[0].name);
    }
  }, [manufacturers, selectedManufacturer]);

  const handleImageError = (colorId: string) => {
    setFailedImages(prev => new Set(prev).add(colorId));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Category Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedCategory("color-change")}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            selectedCategory === "color-change"
              ? "bg-primary text-primary-foreground"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          }`}
        >
          Color Change ({colorChangeFilms.length})
        </button>
        <button
          onClick={() => setSelectedCategory("ppf")}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            selectedCategory === "ppf"
              ? "bg-primary text-primary-foreground"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          }`}
        >
          PPF ({ppfFilms.length})
        </button>
      </div>

      {/* Manufacturer Grid - Wrap layout */}
      {manufacturers.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {manufacturers.map((mfr) => (
            <button
              key={mfr.name}
              onClick={() => setSelectedManufacturer(mfr.name)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                selectedManufacturer === mfr.name
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-foreground hover:bg-muted"
              }`}
            >
              {mfr.name} ({mfr.count})
            </button>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-4 text-sm">
          No {selectedCategory === "ppf" ? "PPF" : "color change"} films available
        </p>
      )}

      {/* Colors Grid */}
      {selectedManufacturer && displayColors.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {selectedManufacturer} • {displayColors.length} colors
            {displayColors[0]?.isOfficialManufacturerColor && (
              <span className="ml-2 text-green-500">✓ Official</span>
            )}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[400px] overflow-y-auto pr-1">
            {displayColors.map((color) => {
              const isSelected = selectedSwatch?.id === color.id;
              const imageUrl = color.media_url;
              const showFallback = !imageUrl || failedImages.has(color.id);
              const fullName = `${color.manufacturer} ${color.name}${color.code ? ` (${color.code})` : ''}`;

              return (
                <button
                  key={color.id}
                  onClick={() => onSwatchSelect(color)}
                  title={fullName}
                  className={`p-2.5 rounded-lg text-left transition-all ${
                    isSelected
                      ? "ring-2 ring-primary bg-primary/10"
                      : "bg-card border border-border hover:border-primary/50"
                  }`}
                >
                  {/* Swatch Image - Official URL or hex fallback */}
                  <div className="w-full aspect-square rounded-md mb-2 border border-border/30 overflow-hidden">
                    {!showFallback ? (
                      <img
                        src={imageUrl}
                        alt={fullName}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(color.id)}
                      />
                    ) : color.hex ? (
                      <div 
                        className="w-full h-full" 
                        style={{ backgroundColor: color.hex }}
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-[8px] text-muted-foreground text-center px-1">{color.name}</span>
                      </div>
                    )}
                  </div>
                  {/* Manufacturer */}
                  <p className="text-[10px] text-primary font-medium leading-tight">
                    {color.manufacturer}
                  </p>
                  {/* Name - Allow wrapping for full display */}
                  <p className="text-xs font-medium text-foreground leading-tight mt-0.5 line-clamp-2 min-h-[2.25rem]">
                    {color.name}
                  </p>
                  {/* Code - Full display */}
                  {color.code && (
                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{color.code}</p>
                  )}
                  {/* Finish */}
                  <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{color.finish}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
