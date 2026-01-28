/**
 * OVERLAY STAMPING UTILITY
 * 
 * ====================================================================
 * THIS FUNCTION IS THE ONLY LEGAL WAY TO EXPORT A RENDER.
 * DO NOT BYPASS. DO NOT DUPLICATE. DO NOT RE-IMPLEMENT ELSEWHERE.
 * ====================================================================
 * 
 * All renders pass through here before download/PDF/share.
 * This ensures deterministic, permanent overlay embedding that
 * cannot be affected by AI variability or UI inconsistencies.
 * 
 * Typography Contract (LOCKED - DO NOT CHANGE):
 * - Upper-left: Tool name | Font: Poppins | Color: #000000 | Size: 16px | Weight: 500
 * - Bottom-right: Manufacturer + Color/Design | Font: Inter | Color: #000000 | Size: 14px | Weight: 300
 * - NO shadow, NO stroke, NO outline - pure black text only
 */

import { getToolLabel, isValidToolKey, type ToolKey } from './tool-registry';

export interface OverlaySpec {
  /** Tool key from registry (e.g., "colorpro", "fadewraps") - PREFERRED */
  toolKey?: ToolKey;
  /** Legacy: free-form tool name - will be mapped to registry if possible */
  toolName?: string;
  /** Manufacturer name (e.g., "3M", "Avery Dennison") */
  manufacturer?: string;
  /** Color or design name (e.g., "Satin Nardo Gray", "Carbon Fiber") */
  colorOrDesignName?: string;
}

// Font loading promises - cached for performance
let poppinsLoaded = false;
let interLoaded = false;

/**
 * Ensures fonts are loaded before drawing
 */
async function ensureFontsLoaded(): Promise<void> {
  if (poppinsLoaded && interLoaded) return;

  try {
    // Check if fonts are available via document.fonts API
    if (document.fonts) {
      await document.fonts.ready;
      
      // Verify Poppins is loaded
      if (document.fonts.check('500 16px Poppins')) {
        poppinsLoaded = true;
      }
      
      // Verify Inter is loaded
      if (document.fonts.check('300 14px Inter')) {
        interLoaded = true;
      }
    }
  } catch (error) {
    console.warn('Font loading check failed, proceeding with fallbacks:', error);
  }
}

/**
 * Loads an image from URL and returns an HTMLImageElement
 */
async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

/**
 * Resolves the display label for the tool
 * Priority: toolKey from registry > legacy toolName mapping > fallback
 */
function resolveToolLabel(overlay: OverlaySpec): string {
  // Priority 1: Use toolKey from registry
  if (overlay.toolKey && isValidToolKey(overlay.toolKey)) {
    return getToolLabel(overlay.toolKey);
  }
  
  // Priority 2: Try to map legacy toolName to registry
  if (overlay.toolName) {
    const normalized = overlay.toolName.toLowerCase().replace(/[™®\s]/g, '');
    if (isValidToolKey(normalized as ToolKey)) {
      return getToolLabel(normalized as ToolKey);
    }
    // Return as-is if not in registry (legacy support)
    return overlay.toolName;
  }
  
  // Priority 3: Fallback to platform label
  return 'RestylePro™';
}

/**
 * Stamps overlay text onto an image and returns a Blob
 * 
 * @param imageUrl - URL of the base render image
 * @param overlay - Overlay specification with tool key/name, manufacturer, color/design name
 * @returns Promise<Blob> - The composited image as a PNG blob
 */
export async function stampOverlayOnImage(
  imageUrl: string,
  overlay: OverlaySpec
): Promise<Blob> {
  // Ensure fonts are loaded
  await ensureFontsLoaded();
  
  // Load the base image
  const img = await loadImage(imageUrl);
  
  // Create canvas with same dimensions as image
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  // Draw the base image
  ctx.drawImage(img, 0, 0);
  
  // Calculate responsive font sizes based on image dimensions
  // Base: 16px for 1920px width, scale proportionally
  const scaleFactor = Math.max(0.5, Math.min(1.5, img.naturalWidth / 1920));
  const toolNameFontSize = Math.round(16 * scaleFactor);
  const labelFontSize = Math.round(14 * scaleFactor);
  const padding = Math.round(12 * scaleFactor);
  
  // Set text rendering settings
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#000000'; // Pure black - NO shadow, NO stroke
  
  // Draw tool name (upper-left) - Poppins Medium
  const toolLabel = resolveToolLabel(overlay);
  if (toolLabel) {
    ctx.font = `500 ${toolNameFontSize}px Poppins, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(toolLabel, padding, padding);
  }
  
  // Build bottom label: manufacturer + colorOrDesignName
  const bottomLabel = [overlay.manufacturer, overlay.colorOrDesignName]
    .filter(Boolean)
    .join(' ')
    .trim();
  
  // Draw bottom label (bottom-right) - Inter Light
  if (bottomLabel) {
    ctx.font = `300 ${labelFontSize}px Inter, sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    
    // Calculate max width (70% of image width)
    const maxWidth = img.naturalWidth * 0.7;
    
    // Measure text and wrap if needed
    const metrics = ctx.measureText(bottomLabel);
    if (metrics.width > maxWidth) {
      // Truncate with ellipsis if too long
      let truncated = bottomLabel;
      while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 10) {
        truncated = truncated.slice(0, -1);
      }
      ctx.fillText(truncated + '...', img.naturalWidth - padding, img.naturalHeight - padding);
    } else {
      ctx.fillText(bottomLabel, img.naturalWidth - padding, img.naturalHeight - padding);
    }
  }
  
  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      },
      'image/png',
      1.0 // Maximum quality
    );
  });
}

/**
 * Stamps overlay and returns as base64 data URL (for PDF embedding)
 */
export async function stampOverlayAsDataUrl(
  imageUrl: string,
  overlay: OverlaySpec
): Promise<string> {
  const blob = await stampOverlayOnImage(imageUrl, overlay);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to data URL'));
      }
    };
    reader.onerror = () => reject(new Error('FileReader error'));
    reader.readAsDataURL(blob);
  });
}
