import { cn } from "@/lib/utils";

/**
 * RENDER OVERLAY - Branding for all tool renders (UI PREVIEW ONLY)
 * 
 * IMPORTANT: This component is for UI preview purposes only.
 * All exported images (downloads, PDFs, share links) MUST use
 * the stampOverlayOnImage() utility from src/lib/overlay-stamper.ts
 * to ensure deterministic, permanent overlay embedding.
 * 
 * Typography Contract (LOCKED - DO NOT CHANGE):
 * - Upper-left: Tool name | Font: Poppins | Color: Black | Weight: Medium
 * - Bottom-right: Manufacturer + Color/Design | Font: Inter | Color: Black | Weight: Light
 */
interface RenderOverlayProps {
  /** Tool name displayed in upper-left (e.g., "ColorPro", "FadeWraps", "DesignPanelPro") */
  toolName?: string;
  /** Manufacturer name (e.g., "3M", "Avery Dennison") - bottom right */
  manufacturer?: string;
  /** Color or design name (e.g., "Satin Nardo Gray", "Carbon Fiber") - bottom right */
  colorOrDesignName?: string;
  /** Additional CSS classes */
  className?: string;
}

export const RenderOverlay = ({
  toolName,
  manufacturer,
  colorOrDesignName,
  className,
}: RenderOverlayProps) => {
  const bottomLabel = [manufacturer, colorOrDesignName].filter(Boolean).join(" ").trim();

  // Don't render if nothing to show
  if (!toolName && !bottomLabel) return null;

  return (
    <>
      {/* Upper-left: Tool name branding - Poppins, Black, Medium */}
      {toolName && (
        <div
          className={cn(
            "absolute top-3 left-3 text-sm font-medium pointer-events-none select-none",
            "font-poppins text-black",
            className,
          )}
        >
          {toolName}
        </div>
      )}

      {/* Bottom-right: Manufacturer + Color/Design name - Inter, Black, Light */}
      {bottomLabel && (
        <div
          className={cn(
            "absolute bottom-3 right-3 text-sm font-light pointer-events-none text-right max-w-[70%] select-none",
            "font-inter text-black",
            className,
          )}
        >
          {bottomLabel}
        </div>
      )}
    </>
  );
};
