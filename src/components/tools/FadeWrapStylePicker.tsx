import { cn } from "@/lib/utils";
import { FADE_STYLES, FadeStyleId, getStylePreviewGradient } from "@/lib/fadeStyles";
import { ArrowRight, ArrowDown, ArrowDownRight, ArrowLeftRight } from "lucide-react";

interface FadeWrapStylePickerProps {
  fadeStyle: FadeStyleId;
  setFadeStyle: (style: FadeStyleId) => void;
  colorHex?: string;
}

// Icon for each fade direction
const StyleIcon = ({ styleId }: { styleId: FadeStyleId }) => {
  const iconProps = { className: "w-4 h-4 text-foreground drop-shadow-md" };
  
  switch (styleId) {
    case "front_back":
      return <ArrowRight {...iconProps} />;
    case "top_bottom":
      return <ArrowDown {...iconProps} />;
    case "diagonal":
      return <ArrowDownRight {...iconProps} />;
    case "crossfade":
      // Custom opposing corners icon - two dots at opposite corners
      return (
        <svg className="w-4 h-4 text-foreground drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="20" cy="4" r="3" />
          <circle cx="4" cy="20" r="3" />
        </svg>
      );
    default:
      return <ArrowRight {...iconProps} />;
  }
};

export function FadeWrapStylePicker({
  fadeStyle,
  setFadeStyle,
  colorHex = '#00D4FF'
}: FadeWrapStylePickerProps) {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold text-foreground">Fade Style</h4>
        <p className="text-xs text-muted-foreground">Choose how your color fades to black</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {FADE_STYLES.map((style) => {
          const isSelected = fadeStyle === style.id;
          const gradient = getStylePreviewGradient(style.id, colorHex);
          
          return (
            <button
              key={style.id}
              onClick={() => setFadeStyle(style.id)}
              className={cn(
                "relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                "hover:border-primary/50 hover:scale-[1.02]",
                isSelected 
                  ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-lg" 
                  : "border-border bg-card hover:bg-secondary/30"
              )}
              title={style.description}
            >
              {/* Gradient preview with icon overlay */}
              <div 
                className="relative w-full h-14 rounded-lg overflow-hidden shadow-inner"
                style={{ background: gradient }}
              >
                {/* Direction icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="p-2 rounded-full bg-black/30 backdrop-blur-sm">
                    <StyleIcon styleId={style.id} />
                  </div>
                </div>
                
                {/* Selection glow */}
                {isSelected && (
                  <div 
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: `radial-gradient(ellipse at center, ${colorHex}88 0%, transparent 70%)`
                    }}
                  />
                )}
              </div>
              
              {/* Style label */}
              <span className={cn(
                "text-xs font-medium text-center leading-tight",
                isSelected ? "text-primary" : "text-foreground"
              )}>
                {style.label}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Selected style description + helper text */}
      <div className="text-center pt-1 space-y-1">
        {fadeStyle && (
          <p className="text-xs text-muted-foreground">
            {FADE_STYLES.find(s => s.id === fadeStyle)?.description}
          </p>
        )}
        <p className="text-[10px] text-muted-foreground/70 italic">
          Fade direction is applied relative to the vehicle, not the screen.
        </p>
      </div>
    </div>
  );
}
