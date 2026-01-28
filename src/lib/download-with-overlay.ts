/**
 * UNIFIED DOWNLOAD HELPER
 * 
 * ====================================================================
 * ALL RENDER DOWNLOADS MUST USE THIS FUNCTION.
 * This ensures every exported image has the overlay permanently stamped.
 * ====================================================================
 * 
 * Uses stampOverlayOnImage() internally to create deterministic exports.
 */

import { stampOverlayOnImage, OverlaySpec } from './overlay-stamper';

export type { OverlaySpec } from './overlay-stamper';

/**
 * Downloads a render image with the overlay permanently stamped
 * 
 * @param imageUrl - URL of the base render image
 * @param filename - Desired filename for the download (without extension)
 * @param overlay - Overlay specification with tool name, manufacturer, color/design name
 */
export async function downloadWithOverlay(
  imageUrl: string,
  filename: string,
  overlay: OverlaySpec
): Promise<void> {
  try {
    // Stamp the overlay onto the image
    const stampedBlob = await stampOverlayOnImage(imageUrl, overlay);
    
    // Create object URL for download
    const objectUrl = URL.createObjectURL(stampedBlob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = `${filename}.png`;
    link.style.display = 'none';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    }, 100);
  } catch (error) {
    console.error('Download with overlay failed:', error);
    throw error;
  }
}

/**
 * Downloads multiple render images with overlays
 * 
 * @param images - Array of { url, filename } objects
 * @param overlay - Overlay specification (same for all images)
 * @param delayMs - Delay between downloads to prevent browser blocking (default: 500ms)
 */
export async function downloadAllWithOverlay(
  images: Array<{ url: string; filename: string }>,
  overlay: OverlaySpec,
  delayMs: number = 500
): Promise<void> {
  for (let i = 0; i < images.length; i++) {
    const { url, filename } = images[i];
    await downloadWithOverlay(url, filename, overlay);
    
    // Add delay between downloads (except for last one)
    if (i < images.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}
