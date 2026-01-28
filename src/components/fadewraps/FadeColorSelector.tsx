import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { inkFusionColors, InkFusionColor } from "@/lib/wpw-infusion-colors";

// Standard fade colors (non-InkFusion)
const STANDARD_FADES = [
  { id: 'std-blue', name: 'Blue', hex: '#0057FF' },
  { id: 'std-red', name: 'Red', hex: '#C1121F' },
  { id: 'std-green', name: 'Green', hex: '#0B6E4F' },
  { id: 'std-yellow', name: 'Yellow', hex: '#FFD700' },
  { id: 'std-orange', name: 'Orange', hex: '#FF8C00' },
  { id: 'std-purple', name: 'Purple', hex: '#7B2D8E' },
  { id: 'std-cyan', name: 'Cyan', hex: '#00CED1' },
  { id: 'std-pink', name: 'Pink', hex: '#FF69B4' },
];

export interface FadeColor {
  id: string;
  name: string;
  hex: string;
  isInkFusion: boolean;
  inkFusionColor?: InkFusionColor;
}

interface FadeColorSelectorProps {
  selectedColor: FadeColor | null;
  onColorSelect: (color: FadeColor) => void;
}

export const FadeColorSelector = ({ selectedColor, onColorSelect }: FadeColorSelectorProps) => {
  const [mode, setMode] = useState<'inkfusion' | 'standard'>('inkfusion');

  const handleInkFusionSelect = (color: InkFusionColor) => {
    onColorSelect({
      id: color.id,
      name: `${color.name} → Black`,
      hex: color.hex,
      isInkFusion: true,
      inkFusionColor: color
    });
  };

  const handleStandardSelect = (fade: typeof STANDARD_FADES[0]) => {
    onColorSelect({
      id: fade.id,
      name: `${fade.name} → Black`,
      hex: fade.hex,
      isInkFusion: false
    });
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-semibold">Select Fade Color</Label>
      
      {/* Mode Toggle */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setMode('inkfusion')}
          className={cn(
            "py-3 px-4 rounded-lg border-2 font-medium transition-all text-sm",
            mode === 'inkfusion'
              ? "border-purple-500 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300"
              : "border-border hover:border-purple-500/50"
          )}
        >
          ✨ InkFusion™
        </button>
        <button
          onClick={() => setMode('standard')}
          className={cn(
            "py-3 px-4 rounded-lg border-2 font-medium transition-all text-sm",
            mode === 'standard'
              ? "border-primary bg-primary/10 text-primary"
              : "border-border hover:border-primary/50"
          )}
        >
          Standard Colors
        </button>
      </div>

      {/* Color Grid */}
      {mode === 'inkfusion' ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">50 exclusive AI-calibrated custom colors</p>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[280px] overflow-y-auto pr-1">
            {inkFusionColors.map((color) => (
              <button
                key={color.id}
                onClick={() => handleInkFusionSelect(color)}
                className={cn(
                  "relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all group",
                  selectedColor?.id === color.id
                    ? "border-purple-500 ring-2 ring-purple-500/30"
                    : "border-border hover:border-purple-500/50"
                )}
                title={`${color.name} → Black`}
              >
                {/* Panel Preview: Color → Black */}
                <div 
                  className="w-full h-full"
                  style={{
                    background: `linear-gradient(to bottom, ${color.hex}, #000000)`
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1">
                  <p className="text-white text-[10px] font-medium truncate text-center">
                    {color.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Generic fade colors</p>
          <div className="grid grid-cols-4 gap-2">
            {STANDARD_FADES.map((fade) => (
              <button
                key={fade.id}
                onClick={() => handleStandardSelect(fade)}
                className={cn(
                  "relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all",
                  selectedColor?.id === fade.id
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border hover:border-primary/50"
                )}
                title={`${fade.name} → Black`}
              >
                {/* Panel Preview: Color → Black */}
                <div 
                  className="w-full h-full"
                  style={{
                    background: `linear-gradient(to bottom, ${fade.hex}, #000000)`
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1">
                  <p className="text-white text-[10px] font-medium truncate text-center">
                    {fade.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Summary */}
      {selectedColor && (
        <Card className="p-3 bg-secondary/30 border-border">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-14 rounded-md border border-border"
              style={{
                background: `linear-gradient(to bottom, ${selectedColor.hex}, #000000)`
              }}
            />
            <div>
              <p className="font-semibold text-sm">{selectedColor.name}</p>
              <p className="text-xs text-muted-foreground">
                {selectedColor.isInkFusion ? 'InkFusion™ Printed' : 'Standard Fade'}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
