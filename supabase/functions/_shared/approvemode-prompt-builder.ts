import { ASPECT_RATIO_REQUIREMENT } from "./aspect-ratio-requirement.ts";
import { PHOTOREALISM_REQUIREMENT } from "./photorealism-prompt.ts";
import { FORBIDDEN_TEXT_WATERMARK_INSTRUCTIONS } from "./forbidden-text-instructions.ts";
import { STUDIO_ENVIRONMENT } from "./finish-specifications.ts";

export function buildApproveModePrompt(params: {
  vehicle: string;
  colorData: any;
  viewType: string;
}): string {
  const { vehicle, colorData, viewType } = params;
  
  const cameraAngle = viewType === 'front'
    ? 'HERO 3/4 FRONT angle - Front-left corner, showcasing hood and front panels'
    : viewType === 'side'
    ? 'TRUE SIDE PROFILE - Perfect 90 degree side view from driver side showing full vehicle length'
    : viewType === 'passenger-side'
    ? 'TRUE SIDE PROFILE - Perfect 90 degree side view from passenger (right) side showing full vehicle length'
    : viewType === 'rear'
    ? 'REAR 3/4 VIEW - Rear-left corner showing trunk and rear panels'
    : viewType === 'top'
    ? 'TOP VIEW - Overhead perspective showing roof and hood design'
    : 'DRAMATIC HERO ANGLE - Front-right 3/4 view at slightly lower angle, showcasing design details with professional lighting';

  return `${ASPECT_RATIO_REQUIREMENT}

${PHOTOREALISM_REQUIREMENT}

${FORBIDDEN_TEXT_WATERMARK_INSTRUCTIONS}

You are RestylePro™ ApproveMode™ - the industry's most advanced 3D wrap proof system.

🚨 ABSOLUTE REQUIREMENTS FOR PHOTOREALISTIC DESIGN APPLICATION 🚨

1. DESIGN EXTRACTION & FULL COVERAGE (CRITICAL):
   - Extract ONLY the wrap design graphics from the uploaded image
   - ZERO TOLERANCE for background inclusion
   - The uploaded image MAY contain mock-ups, templates, measurement grids, or backgrounds
   - IGNORE ALL backgrounds, templates, grids, text overlays, mock-up vehicles
   - Apply ONLY the actual wrap design/graphics to the ${vehicle}
   - Design must flow with PERFECT continuity across all body panels
   
   🚨 FULL DESIGN VISIBILITY - NO CUTOFFS 🚨
   - ALL text, logos, and graphics from the design MUST be fully visible
   - NEVER crop, cut off, or hide any part of the design
   - Scale the design appropriately so ALL elements fit on the vehicle
   - If the design has text/logos, they must appear COMPLETE and READABLE
   - The ENTIRE design must be visible from the camera angle shown

2. STUDIO PHOTOGRAPHY REQUIREMENTS:
   - Professional DSLR camera: 50mm lens, f/2.8 aperture, 1/250s shutter speed
   - THREE-POINT STUDIO LIGHTING:
     * Soft diffused overhead key light (main illumination)
     * Subtle fill light from front-right (eliminates harsh shadows)  
     * Gentle rim light highlighting vehicle contours and wrap edges
   - Natural shadow fall: 15-20 degrees from vehicle base, soft edges
   ${STUDIO_ENVIRONMENT}

3. WRAP INSTALLATION PERFECTION (MANDATORY):
   - ZERO air bubbles, ZERO wrinkles, ZERO imperfections
   - Perfect adhesion to all body panels
   - Seamless flow across panel gaps and curves  
   - Professional installer quality - flawless application
   - Realistic vinyl texture with appropriate gloss sheen
   - Design maintains proper orientation and scale
   - ALL design elements (text, logos, graphics) remain INTACT and UNCROPPED

4. FINISH: GLOSS - Mirror-like reflections, wet look, maximum shine, sharp highlights

5. 🚫 ABSOLUTELY NO TEXT IN RENDER 🚫
   - DO NOT add ANY text, watermarks, labels, or branding to the image
   - DO NOT render tool names, vehicle names, or any text overlays
   - The rendered image must be COMPLETELY TEXT-FREE
   - Text overlays will be added client-side AFTER generation

CAMERA ANGLE: ${cameraAngle}

BODY PANELS TO WRAP:
✓ Hood, Roof, Trunk/Deck
✓ Doors, Fenders, Quarter panels  
✓ Bumper covers (painted parts only)

NEVER WRAP:
❌ Wheels, Tires, Rims (keep original dark/black)
❌ Windows, Glass
❌ Headlights, Taillights
❌ Grilles, Chrome trim
❌ Badges, Emblems

QUALITY STANDARD: This render will be shown to clients for design approval. It MUST be indistinguishable from a professional automotive photography shoot. FLAWLESS execution required.

OUTPUT: Ultra-photorealistic ${cameraAngle} of ${vehicle} with uploaded custom wrap design applied. MUST be EXACTLY 16:9 landscape (1792x1008 or 1920x1080). Must look like a real photograph taken in a professional studio. NO TEXT OR WATERMARKS IN THE IMAGE.`;
}
