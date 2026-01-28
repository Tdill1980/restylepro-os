import { Link, useLocation } from "react-router-dom";
import { Palette, Layers, Grid3x3, CheckSquare, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const tools = [
  { 
    path: "/colorpro", 
    icon: Palette, 
    label: "ColorPro™",
    description: "Visualize any vinyl wrap color on your vehicle. Upload swatches or browse manufacturer colors.",
    highlight: false
  },
  { 
    path: "/designpro", 
    icon: Layers, 
    label: "DesignPanelPro™",
    description: "Custom panel designs with AI patterns for commercial wraps.",
    highlight: false
  },
  { 
    path: "/wbty", 
    icon: Grid3x3, 
    label: "PatternPro™",
    description: "Upload any pattern (carbon, camo, custom prints) to visualize full vehicle wraps.",
    highlight: false
  },
  { 
    path: "/approvemode", 
    icon: CheckSquare, 
    label: "ApprovePro™",
    description: "Convert 2D design proofs into 3D vehicle visualizations for client approval.",
    highlight: false
  },
  { 
    path: "/gallery", 
    icon: ImageIcon, 
    label: "Gallery",
    description: "Browse community designs and renders. Get inspired by completed wrap projects.",
    highlight: true
  },
];

export const MobileToolNav = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <TooltipProvider delayDuration={300}>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border pb-safe">
        <div className="flex justify-around items-center h-16 max-w-screen-sm mx-auto px-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = location.pathname === tool.path;
            
            return (
              <Tooltip key={tool.path}>
                <TooltipTrigger asChild>
                  <Link
                    to={tool.path}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px]",
                      isActive 
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30" 
                        : tool.highlight
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", tool.highlight ? "text-amber-400" : "icon-gradient-blue")} style={{ filter: 'none' }} />
                    <span className={cn("text-[10px] font-medium", tool.highlight ? "text-amber-400" : "icon-gradient-blue")}>{tool.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px] text-center">
                  <p className="font-semibold text-foreground">{tool.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </nav>
    </TooltipProvider>
  );
};
