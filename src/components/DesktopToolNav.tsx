import { Link, useLocation } from "react-router-dom";
import { Palette, Layers, Grid3x3, CheckSquare, ImageIcon, Rotate3D } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const tools = [
  { 
    path: "/colorpro", 
    icon: Palette, 
    label: "ColorPro™", 
    color: "cyan",
    description: "Visualize any vinyl wrap color on your vehicle. Upload swatches or browse manufacturer colors.",
    highlight: false
  },
  { 
    path: "/designpro", 
    icon: Layers, 
    label: "DesignPanelPro™", 
    color: "cyan",
    description: "Custom panel designs with AI patterns for commercial wraps.",
    highlight: false
  },
  { 
    path: "/wbty", 
    icon: Grid3x3, 
    label: "PatternPro™", 
    color: "cyan",
    description: "Upload any pattern (carbon, camo, custom prints) to visualize full vehicle wraps.",
    highlight: false
  },
  { 
    path: "/approvemode", 
    icon: CheckSquare, 
    label: "ApprovePro™", 
    color: "cyan",
    description: "Convert 2D design proofs into 3D vehicle visualizations for client approval.",
    highlight: false
  },
  { 
    path: "/gallery", 
    icon: ImageIcon, 
    label: "Gallery", 
    color: "amber",
    description: "Browse community designs and renders. Get inspired by completed wrap projects.",
    highlight: true
  },
];

export const DesktopToolNav = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  if (isMobile) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-card/95 backdrop-blur-lg border border-border/50 rounded-full px-4 py-3 shadow-2xl">
        <div className="flex items-center gap-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = location.pathname === tool.path;
            
            return (
              <Tooltip key={tool.path}>
                <TooltipTrigger asChild>
                  <Link
                    to={tool.path}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full transition-all min-w-[120px] justify-center",
                      isActive 
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/20" 
                        : tool.highlight
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 animate-pulse"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", tool.highlight ? "text-amber-400" : "icon-gradient-blue")} style={{ filter: 'none' }} />
                    <span className={cn("text-sm font-medium", tool.highlight ? "text-amber-400" : "icon-gradient-blue")}>{tool.label}</span>
                    {isActive && <Rotate3D className="h-3 w-3 text-cyan-400 animate-pulse" />}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[220px] text-center">
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
