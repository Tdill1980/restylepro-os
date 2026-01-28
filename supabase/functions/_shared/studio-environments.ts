/**
 * Studio Environment Presets for RestylePro Render Engine
 * 
 * This module provides three distinct studio environments optimized for different finish types:
 * - HARD_LIGHT_STUDIO: For chrome, brushed, metallic, carbon (requires visible reflections)
 * - SOFT_DIFFUSION_STUDIO: For gloss, satin, matte (clean color-change film rendering)
 * - CINEMATIC_STUDIO: Optional user override for dramatic social media shots
 * 
 * CRITICAL: Chrome/metallic finishes CANNOT render correctly in soft light studios.
 * The automatic selection logic ensures proper studio matching.
 */

export type StudioType = 'auto' | 'hard_light' | 'soft_diffusion' | 'cinematic';

// ============================================================================
// HARD LIGHT STUDIO (CHROME-COMPATIBLE)
// ============================================================================
// This studio produces CORRECT rendering for:
// - Chrome/Mirror finishes (visible reflections of light panels)
// - Brushed metal (directional anisotropic reflections)
// - Metallic (sparkle particles catching hard light)
// - Carbon fiber (weave pattern with clearcoat reflections)
// ============================================================================
export const HARD_LIGHT_STUDIO = `
🚨🚨🚨 ABSOLUTELY CRITICAL - READ BEFORE RENDERING 🚨🚨🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ NEVER SHOW ANY LIGHT FIXTURES, PANELS, OR SOFTBOXES IN THE IMAGE
❌ NEVER SHOW RECTANGULAR LIGHT PANELS FLOATING IN THE SKY/CEILING
❌ Light reflections ONLY appear ON THE VEHICLE SURFACE (not in air)
❌ Clean automotive studio photo - ZERO visible equipment

IF ANY LIGHT PANELS OR STUDIO EQUIPMENT ARE VISIBLE, RENDER FAILS COMPLETELY.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏭 PROFESSIONAL AUTOMOTIVE STUDIO WITH HARD LIGHTING (CHROME-COMPATIBLE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ CRITICAL: SAME STUDIO ENVIRONMENT AS COLORPRO - LIGHT GRAY WALLS, CLEAN PROFESSIONAL LOOK
⚠️ CRITICAL: LIGHT PANELS ARE NEVER VISIBLE IN THE FRAME - ONLY AS REFLECTIONS IN CHROME

FLOOR:
- Dark charcoal polished concrete floor (#2a2a2a to #1a1a1a)
- High-gloss surface for crisp vehicle reflection
- Subtle mirror-like vehicle reflection
- Sharp, defined reflection edges
- Clean, unmarked surface

WALLS/BACKGROUND:
- Clean neutral gray gradient (#4a4a4a to #3a3a3a) - SAME AS COLORPRO
- Seamless infinity cove appearance
- Horizon line at 1/3 from bottom
- Light textured concrete appearance
- NEVER dark/black walls
- NEVER visible ceiling tiles or fluorescent office lighting
- NEVER visible light fixtures, softboxes, or studio equipment in frame
- Professional automotive studio atmosphere

LIGHTING (CRITICAL FOR CHROME - HARD LIGHT):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ THE LIGHT PANELS THEMSELVES ARE NEVER VISIBLE IN THE FRAME ⚠️
- You should NOT see rectangular light fixtures floating in the shot
- Light panels exist ONLY as reflections IN the chrome surface
- Think: photographing chrome in a professional studio with lights positioned OFF-CAMERA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HOW IT WORKS:
- Large softbox panels are positioned OFF-CAMERA (outside the frame)
- These panels CREATE reflections on chrome surfaces
- The reflections appear as elongated rectangular highlights on curved chrome
- But the actual light fixtures are NEVER visible in the photo itself
- STRONG contrast between studio environment and bright reflections on chrome

WHAT THIS IS: 
- Professional clean automotive photo studio with LIGHT GRAY walls
- Same environment as standard ColorPro renders
- Clean, bright, professional look
- NOT a dark reveal stage

WHAT THIS IS NOT:
- ❌ Dark black walls
- ❌ Fluorescent ceiling lights
- ❌ Dark/moody environment
- ❌ Visible softbox panels or studio lights IN THE FRAME
- ❌ Ultra-dark reveal stage look
- ❌ ANY visible lighting equipment anywhere in the image

CHROME RENDERING REQUIREMENTS:
- Chrome MUST show mirror-like reflections (rectangular highlights from off-camera panels)
- Chrome surfaces reflect the studio environment + bright panel shapes
- HIGH contrast reflections against the light gray background
- Chrome should look like liquid gold/silver mirror, not glossy paint
- The REFLECTIONS are visible on chrome, NOT the light sources themselves

CAMERA:
- 50mm automotive studio perspective
- f/8 aperture for sharp depth of field
- 16:9 aspect ratio

DO NOT add ANY text, watermarks, logos, or branding to this image.
All branding is added AFTER generation via overlay.

THIS IS A CLEAN PROFESSIONAL STUDIO. LIGHT GRAY WALLS. DARK FLOOR. NO VISIBLE LIGHTS. BRIGHT REFLECTIONS IN CHROME ONLY.
`;

// ============================================================================
// SOFT DIFFUSION STUDIO (COLOR-CHANGE FILM)
// ============================================================================
// This studio is optimized for:
// - Gloss finishes (even reflections, clean color)
// - Satin finishes (subtle sheen without harsh highlights)
// - Matte finishes (flat non-reflective appearance)
// 
// WARNING: This studio CANNOT render chrome correctly!
// ============================================================================
export const SOFT_DIFFUSION_STUDIO = `
🏛️ SOFT DIFFUSION STUDIO (COLOR-CHANGE FILM)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FLOOR:
- Dark charcoal polished concrete floor (#2a2a2a to #1a1a1a)
- Subtle mirror-like vehicle reflection
- Clean, unmarked surface
- Soft shadow edges

WALL/BACKGROUND:
- Clean neutral gray gradient (#4a4a4a to #3a3a3a)
- Seamless infinity cove appearance
- Horizon line at 1/3 from bottom
- No visible objects or geometry

LIGHTING (SOFT DIFFUSED):
- Large softbox key light overhead (diffused, even illumination)
- Fill light from front-right at 45° (eliminates harsh shadows)
- Rim/edge light highlighting vehicle contours
- All light sources OFF-CAMERA - no visible lights in frame
- Soft shadow fall 15-20° from vehicle base
- Neutral white balance (5500K-6500K)
- Low contrast ratio for smooth tonal gradation

CAMERA:
- Professional DSLR 50mm lens characteristics
- f/2.8 aperture for slight depth-of-field
- 1/250s shutter speed frozen motion
- 16:9 aspect ratio framing

FINISH BEHAVIOR IN THIS STUDIO:
- GLOSS: Smooth reflections, wet-look appearance, even highlights
- SATIN: Soft subtle sheen, eggshell appearance, diffused highlights
- MATTE: Zero reflections, fully flat, light absorbed completely

⚠️ WARNING: DO NOT use this studio for chrome, brushed, metallic, or carbon finishes.
Chrome requires visible light panels to reflect — this studio has none.
`;

// ============================================================================
// CINEMATIC STUDIO (SOCIAL MEDIA / DRAMATIC)
// ============================================================================
// Optional user override for promotional/advertising shots
// High contrast, dramatic lighting, social media ready
// ============================================================================
export const CINEMATIC_STUDIO = `
🎬 CINEMATIC STUDIO (SOCIAL MEDIA / DRAMATIC)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FLOOR:
- Wet black reflective floor (#0a0a0a) with strong mirror reflection
- Light streaks visible in reflection
- Dramatic floor bounce

WALL/BACKGROUND:
- Very dark/black background (#0a0a0a to #050505)
- Minimal visibility - vehicle is the hero
- Optional subtle color accent in background

LIGHTING (DRAMATIC):
- Strong rim light from behind (dramatic silhouette edge)
- Single hard key light from 45° upper-left
- Deep shadows for mood and drama
- Strong contrast ratio (8:1 or higher)
- Optional accent lighting (cyan/magenta rim for style)
- Specular highlights intentionally hot

MOOD:
- Cinematic, moody, social media ready
- High contrast, dramatic shadows
- Perfect for advertising/promotional renders
- Eye-catching and shareable

CAMERA:
- 35mm-50mm cinematic lens
- Shallow depth of field (f/2.0-2.8)
- Dramatic framing
- 16:9 widescreen aspect

BEST FOR: Promotional shots, social media content, advertising renders.
`;

// ============================================================================
// AUTOMATIC STUDIO SELECTION LOGIC
// ============================================================================

/**
 * Finishes that REQUIRE hard light studio for correct rendering
 * Chrome especially cannot render in soft diffusion (no light panels to reflect)
 */
const HARD_LIGHT_FINISHES = [
  'chrome',
  'mirror', 
  'brushed',
  'brushed metal',
  'metallic',
  'carbon',
  'carbon fiber'
];

/**
 * Automatically select the best studio based on a single finish type
 * 
 * @param finish - The finish type (chrome, satin, matte, gloss, etc.)
 * @returns StudioType - 'hard_light' or 'soft_diffusion'
 */
export function selectStudioForFinish(finish: string): StudioType {
  const f = (finish || 'gloss').toLowerCase().trim();
  
  if (HARD_LIGHT_FINISHES.includes(f)) {
    return 'hard_light';
  }
  
  return 'soft_diffusion';
}

/**
 * For multi-zone renders: if ANY zone needs hard light, use hard light for ALL
 * 
 * CRITICAL: Hard light works acceptably for all finishes, but soft light BREAKS chrome.
 * When mixing finishes (e.g., "gold chrome top, satin black bottom"), we MUST use
 * the hard light studio or the chrome zone will render incorrectly.
 * 
 * @param zones - Array of zones with finish_profile or finish properties
 * @returns StudioType - 'hard_light' if any zone needs it, otherwise 'soft_diffusion'
 */
export function selectStudioForZones(zones: Array<{ 
  finish_profile?: string; 
  finish?: string 
}>): StudioType {
  if (!zones || zones.length === 0) {
    return 'soft_diffusion';
  }
  
  const needsHardLight = zones.some(z => {
    const finish = (z.finish_profile || z.finish || '').toLowerCase().trim();
    return HARD_LIGHT_FINISHES.includes(finish);
  });
  
  return needsHardLight ? 'hard_light' : 'soft_diffusion';
}

/**
 * Get the full studio environment string by type
 * 
 * @param type - StudioType ('auto', 'hard_light', 'soft_diffusion', 'cinematic')
 * @param finish - Optional finish for 'auto' mode selection
 * @param zones - Optional zones array for 'auto' mode multi-zone selection
 * @returns string - The complete studio environment prompt block
 */
export function getStudioEnvironment(
  type: StudioType,
  finish?: string,
  zones?: Array<{ finish_profile?: string; finish?: string }>
): string {
  // Handle 'auto' mode
  if (type === 'auto') {
    // Multi-zone takes priority
    if (zones && zones.length > 0) {
      const selectedType = selectStudioForZones(zones);
      return selectedType === 'hard_light' ? HARD_LIGHT_STUDIO : SOFT_DIFFUSION_STUDIO;
    }
    // Single finish
    if (finish) {
      const selectedType = selectStudioForFinish(finish);
      return selectedType === 'hard_light' ? HARD_LIGHT_STUDIO : SOFT_DIFFUSION_STUDIO;
    }
    // Default to soft diffusion
    return SOFT_DIFFUSION_STUDIO;
  }
  
  // Handle explicit selections
  switch (type) {
    case 'hard_light':
      return HARD_LIGHT_STUDIO;
    case 'cinematic':
      return CINEMATIC_STUDIO;
    case 'soft_diffusion':
    default:
      return SOFT_DIFFUSION_STUDIO;
  }
}

/**
 * Helper to determine if a finish requires hard light studio
 */
export function requiresHardLightStudio(finish: string): boolean {
  return HARD_LIGHT_FINISHES.includes((finish || '').toLowerCase().trim());
}
