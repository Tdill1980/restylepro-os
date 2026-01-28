export function getFinishSpecification(finish: string | object | null | undefined): string {
  // Handle null/undefined
  if (!finish) return '';
  
  // Handle object (finish_profile from DB is JSONB)
  let finishString: string;
  if (typeof finish === 'object') {
    // Extract type from finish_profile object like {"type": "chrome", ...}
    finishString = (finish as any).type || '';
  } else {
    finishString = String(finish);
  }
  
  if (!finishString) return '';
  const f = finishString.toLowerCase();
  
  if (f === 'gloss') {
    return `GLOSS FINISH - REALISTIC GLOSSY AUTOMOTIVE VINYL WRAP

CRITICAL: Real glossy vinyl wrap with lamination - MUST LOOK SHINY AND GLOSSY!
Pattern must be visible but surface MUST be SHINY with good reflections.

MANDATORY GLOSS CHARACTERISTICS:
- Surface MUST look GLOSSY and SHINY - this is a gloss finish!
- Pattern remains visible but with beautiful glossy shine over it
- Smooth reflective surface with professional automotive shine
- Good light reflections showing glossy quality
- Highlights where light hits curved surfaces
- Reflections should be present but soft enough to see pattern
- Professional vinyl wrap with glossy clear coat lamination
- Fresh installation with excellent shine and depth
- Think high-end glossy vinyl wrap - shiny but not pure mirror
- Clearly MUCH shinier than satin or matte finishes
- Balance: glossy shiny appearance with pattern visible underneath

VISUAL REFERENCE:
Professional glossy vinyl wrap on luxury/exotic car - obviously shiny and glossy with good reflections, pattern visible through the gloss.

CRITICAL: Must look GLOSSY and SHINY - if it looks flat or dull, render FAILS.`;
  }
  
  if (f === 'satin') {
    return `SATIN FINISH - REALISTIC SATIN AUTOMOTIVE VINYL WRAP

CRITICAL: Real satin vinyl wrap - soft sheen, NOT glossy, NOT flat.
Pattern must be clearly visible with subtle sophisticated sheen.

MANDATORY SATIN CHARACTERISTICS:
- Soft subtle sheen - between matte and gloss
- Silk-like eggshell appearance
- Pattern clearly visible with gentle sheen
- NO sharp reflections or glossy shine
- Light creates soft diffused glow
- Semi-matte professional appearance
- Gentle light bloom on curves
- Some light interaction but NO crisp highlights
- CLEARLY less reflective than gloss
- CLEARLY more sheen than matte
- Professional satin vinyl lamination

VISUAL REFERENCE:
Professional satin vinyl wrap - eggshell finish, sophisticated subtle sheen.

CRITICAL: If glossy/shiny OR completely flat, render FAILS.`;
  }
  
  if (f === 'matte' || f === 'flat') {
    return `MATTE FINISH - REALISTIC MATTE AUTOMOTIVE VINYL WRAP

CRITICAL: Real matte vinyl wrap - completely flat, NO shine whatsoever.
Pattern must be clearly visible with zero reflections.

MANDATORY MATTE CHARACTERISTICS:
- Completely flat NON-REFLECTIVE surface
- Absolutely ZERO shine, sheen, or reflections
- Pattern fully visible with flat appearance
- Light absorbed and diffused completely
- Flat like premium matte wall paint
- Professional matte vinyl texture
- NO wet look, NO shine, NO gloss
- DRAMATICALLY different from gloss
- Think premium flat finish

VISUAL REFERENCE:
Professional matte vinyl wrap - completely flat, no shine.

CRITICAL: If ANY shine or reflection visible, render FAILS.`;
  }
  
  if (f === 'chrome' || f === 'mirror') {
    return `CHROME FINISH - REALISTIC MIRROR-LIKE AUTOMOTIVE VINYL WRAP

CRITICAL: Real chrome vinyl wrap - MUST be MIRROR-LIKE with high reflectivity.
Surface must reflect studio environment sharply and clearly.

MANDATORY CHROME CHARACTERISTICS:
- Mirror-like reflective surface - this is CHROME!
- High-polish specular highlights
- Sharp reflections of studio lights and floor
- Zero diffusion - crisp clear reflections
- Polished metallic depth with hard reflections
- Reflects surrounding environment clearly
- High-contrast metallic appearance
- Think polished mirror chrome finish
- Surface should act like a curved mirror
- Dramatically more reflective than gloss

VISUAL REFERENCE:
Professional chrome vinyl wrap - mirror-like finish reflecting studio environment sharply.

CRITICAL: If surface looks dull, painted, or non-reflective, render FAILS.`;
  }
  
  if (f === 'brushed' || f === 'brushed metal') {
    return `BRUSHED METAL FINISH - REALISTIC BRUSHED AUTOMOTIVE VINYL WRAP

CRITICAL: Real brushed metal vinyl wrap - directional linear texture.
Surface must show anisotropic metallic streaking.

MANDATORY BRUSHED METAL CHARACTERISTICS:
- Linear directional texture (anisotropic)
- Visible metallic streak pattern in ONE direction
- Medium contrast reflections following grain direction
- NOT mirror-like - softer than chrome
- NOT glossy - metallic but textured
- Highlights stretch along grain direction
- Brushed aluminum or steel appearance
- Professional brushed metal vinyl texture
- Think brushed stainless steel appliance

VISUAL REFERENCE:
Professional brushed metal vinyl wrap - linear grain texture with directional reflections.

CRITICAL: If surface looks smooth/glossy without linear texture, render FAILS.`;
  }
  
  if (f === 'carbon' || f === 'carbon fiber') {
    return `CARBON FIBER FINISH - REALISTIC CARBON FIBER AUTOMOTIVE VINYL WRAP

CRITICAL: Real carbon fiber vinyl wrap - visible woven pattern with clearcoat.
Surface must show high-frequency weave structure with subtle gloss.

MANDATORY CARBON FIBER CHARACTERISTICS:
- Visible woven 2x2 twill pattern
- High-frequency weave detail preserved
- Subtle clearcoat reflection over weave
- NOT mirror-like - weave texture visible
- Slight metallic reflectance in fibers
- Professional carbon fiber realism
- Woven structure clearly visible at all angles
- Think high-end dry carbon with clearcoat
- Pattern scales correctly on vehicle surfaces

VISUAL REFERENCE:
Professional carbon fiber vinyl wrap - visible weave pattern with subtle clearcoat gloss.

CRITICAL: If weave pattern not visible or looks like plain black, render FAILS.`;
  }
  
  if (f === 'metallic') {
    return `METALLIC FINISH - REALISTIC METALLIC AUTOMOTIVE VINYL WRAP

CRITICAL: Real metallic vinyl wrap - visible sparkle/flake depth.
Surface must show metallic particle reflections under light.

MANDATORY METALLIC CHARACTERISTICS:
- Metallic flake/sparkle clearly visible
- Deep reflective color with particle depth
- Gloss or satin base with embedded flakes
- Flakes catch light at different angles
- Professional metallic vinyl appearance
- NOT flat paint - depth and dimension required
- Sparkle particles must be visible
- Think automotive metallic paint with clearcoat
- Color-shifting sparkle under studio lights

VISUAL REFERENCE:
Professional metallic vinyl wrap - visible sparkle particles with depth and dimension.

CRITICAL: If surface looks flat without visible metallic particles, render FAILS.`;
  }
  
  if (f === 'sparkle') {
    return `SPARKLE LAMINATE FINISH - REALISTIC METALLIC SPARKLE OVER VINYL WRAP

CRITICAL: Real sparkle laminate overlay - fine metallic flakes visible ONLY in highlights.
This is a SUBTLE sparkle effect, NOT chrome, NOT glitter, NOT color-shift.

MANDATORY SPARKLE LAMINATE CHARACTERISTICS:
- FINE metallic flake particles (very small, not chunky glitter)
- Sparkle visible ONLY where light hits curved surfaces and highlights
- Base color remains fully visible and unchanged
- Flake density: LOW to MEDIUM (35-40% coverage)
- Reflectivity: SUBTLE (0.3-0.4) - NOT mirror-like
- Sparkle appears as tiny pinpoint reflections, not broad shine
- Color underneath MUST remain true and unaffected
- NO rainbow effect, NO color shifting
- NO chrome appearance, NO mirror reflections
- Think: premium pearlescent clear coat with fine sparkle
- Sparkle enhances the color, does not replace it

PROHIBITED EFFECTS (RENDER FAILS IF PRESENT):
- Chrome or mirror-like reflections
- Chunky glitter or large flakes
- Rainbow/prismatic color shifting
- Washed-out or altered base color
- Over-bright sparkle that dominates the color

VISUAL REFERENCE:
Professional sparkle laminate overlay on vinyl wrap - subtle fine metallic flakes catch light on curves and edges while base color remains pure and prominent.

CRITICAL: If sparkle looks like chrome, glitter, or alters the base color, render FAILS.`;
  }
  
  // Default fallback for unknown finishes - treat as gloss
  return `GLOSS FINISH (DEFAULT) - REALISTIC GLOSSY AUTOMOTIVE VINYL WRAP
Surface MUST be GLOSSY and SHINY with good light reflections.
Professional vinyl wrap appearance with glossy lamination.`;
}

// ============================================================================
// LEGACY EXPORT - Use studio-environments.ts for new code
// This constant is kept for backward compatibility
// ============================================================================
import { SOFT_DIFFUSION_STUDIO, HARD_LIGHT_STUDIO, getStudioEnvironment, selectStudioForFinish, selectStudioForZones } from "./studio-environments.ts";

// Re-export studio system for easy access
export { SOFT_DIFFUSION_STUDIO, HARD_LIGHT_STUDIO, getStudioEnvironment, selectStudioForFinish, selectStudioForZones };

// LEGACY: Default to soft diffusion for backward compatibility
// New code should use getStudioEnvironment() with proper finish detection
export const STUDIO_ENVIRONMENT = SOFT_DIFFUSION_STUDIO;
