/**
 * HARD ENFORCEMENT PROMPT BLOCKS
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * These are the NON-NEGOTIABLE enforcement rules that get injected into
 * every ColorPro render prompt. They LOCK the AI to exact manufacturer specs.
 * 
 * @file hard-enforcement-blocks.ts
 */

/**
 * Generates the MANDATORY COLOR LOCK section with LAB values
 */
export function buildMandatoryColorLock(params: {
  manufacturer: string;
  colorName: string;
  productCode?: string;
  hex: string;
  lab: { L: number; a: number; b: number };
}): string {
  const { manufacturer, colorName, productCode, hex, lab } = params;
  
  return `
═══════════════════════════════════════════════════════════════════════════════
🔒🔒🔒 MANDATORY COLOR LOCK — ZERO TOLERANCE FOR DEVIATION 🔒🔒🔒
═══════════════════════════════════════════════════════════════════════════════

THIS IS A REAL MANUFACTURER FILM. YOU MUST MATCH IT EXACTLY.

┌─────────────────────────────────────────────────────────────────────────────┐
│ MANUFACTURER: ${manufacturer.toUpperCase().padEnd(58)}│
│ COLOR NAME:   ${colorName.padEnd(58)}│
│ PRODUCT CODE: ${(productCode || 'N/A').padEnd(58)}│
│ HEX VALUE:    ${hex.padEnd(58)}│
└─────────────────────────────────────────────────────────────────────────────┘

🎯 LAB COLOR VALUES — PRIMARY SOURCE OF TRUTH (NON-NEGOTIABLE):

   L* (Lightness):    ${lab.L.toFixed(2).padStart(8)} │ ${lab.L < 30 ? 'DARK' : lab.L < 60 ? 'MEDIUM' : 'LIGHT'}
   a* (Green→Red):    ${lab.a.toFixed(2).padStart(8)} │ ${lab.a < 0 ? 'GREEN-SHIFTED' : lab.a > 0 ? 'RED-SHIFTED' : 'NEUTRAL'}
   b* (Blue→Yellow):  ${lab.b.toFixed(2).padStart(8)} │ ${lab.b < 0 ? 'BLUE-SHIFTED' : lab.b > 0 ? 'YELLOW-SHIFTED' : 'NEUTRAL'}

🚨🚨🚨 ZERO TOLERANCE RULES — VIOLATION = RENDER FAILURE 🚨🚨🚨

1. ❌ DO NOT sample color from reference images — LAB values are FINAL
2. ❌ DO NOT shift hue, saturation, or lightness from specified LAB
3. ❌ DO NOT use "internal training data" to override these values
4. ❌ DO NOT add metallic/pearl unless explicitly specified
5. ❌ DO NOT interpret "${colorName}" from general knowledge — USE THESE EXACT VALUES
6. ❌ DO NOT make the color "more attractive" or "enhanced"

✅ YOU MUST render EXACTLY: L*=${lab.L.toFixed(2)}, a*=${lab.a.toFixed(2)}, b*=${lab.b.toFixed(2)}

The hex ${hex} is a SECONDARY reference. LAB values take ABSOLUTE PRIORITY.
If LAB and hex appear to conflict, USE THE LAB VALUES.

═══════════════════════════════════════════════════════════════════════════════`;
}

/**
 * Generates the FINISH LOCK section for exact finish matching
 */
export function buildFinishLock(params: {
  finish: string;
  reflectivity?: number;
  metallic_flake?: number;
  finish_profile?: {
    highlight_softness?: number;
    shadow_saturation_falloff?: number;
    anisotropy?: number;
    texture?: string;
  };
  metallic?: boolean;
  pearl?: boolean;
  chrome?: boolean;
}): string {
  const { finish, reflectivity, metallic_flake, finish_profile, metallic, pearl, chrome } = params;
  
  const finishType = finish?.toLowerCase() || 'gloss';
  
  let finishDescription = '';
  if (chrome) {
    finishDescription = 'CHROME — Mirror-like reflections, maximum specularity, no color distortion';
  } else if (finishType.includes('matte')) {
    finishDescription = 'MATTE — Flat non-reflective surface, zero highlights, velvet-like appearance';
  } else if (finishType.includes('satin')) {
    finishDescription = 'SATIN — Soft sheen, silk-like surface, diffused highlights';
  } else if (finishType.includes('brushed')) {
    finishDescription = 'BRUSHED — Directional grain texture, anisotropic highlights, metallic effect';
  } else {
    finishDescription = 'GLOSS — High specularity, wet-look surface, sharp reflections';
  }
  
  return `
═══════════════════════════════════════════════════════════════════════════════
🔒 FINISH LOCK — EXACT MANUFACTURER SPECIFICATION 🔒
═══════════════════════════════════════════════════════════════════════════════

SPECIFIED FINISH: ${finish?.toUpperCase() || 'GLOSS'}
${finishDescription}

┌─────────────────────────────────────────────────────────────────────────────┐
│ MATERIAL PROPERTIES (MANDATORY):                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ Reflectivity:      ${reflectivity !== undefined ? reflectivity.toFixed(2).padStart(6) : '  N/A '}  │ ${reflectivity !== undefined ? (reflectivity < 0.3 ? 'LOW (matte)' : reflectivity < 0.6 ? 'MEDIUM (satin)' : reflectivity < 0.9 ? 'HIGH (gloss)' : 'MAXIMUM (chrome)').padEnd(24) : ''.padEnd(24)}│
│ Metallic Flake:    ${metallic_flake !== undefined ? metallic_flake.toFixed(2).padStart(6) : '  N/A '}  │ ${metallic_flake !== undefined ? (metallic_flake < 0.2 ? 'NONE/MINIMAL' : metallic_flake < 0.5 ? 'SUBTLE SHIMMER' : 'HEAVY FLAKE').padEnd(24) : ''.padEnd(24)}│
│ Is Metallic:       ${metallic ? '  YES ' : '   NO '}  │                                         │
│ Is Pearl:          ${pearl ? '  YES ' : '   NO '}  │                                         │
│ Is Chrome:         ${chrome ? '  YES ' : '   NO '}  │                                         │
└─────────────────────────────────────────────────────────────────────────────┘

${finish_profile ? `
FINISH BEHAVIOR PROFILE:
• Highlight Softness: ${finish_profile.highlight_softness?.toFixed(2) ?? 'N/A'} (${(finish_profile.highlight_softness ?? 0) > 0.6 ? 'diffused highlights' : 'sharp highlights'})
• Shadow Saturation:  ${finish_profile.shadow_saturation_falloff?.toFixed(2) ?? 'N/A'}
• Anisotropy:         ${finish_profile.anisotropy?.toFixed(2) ?? 'N/A'} (${(finish_profile.anisotropy ?? 0) > 0.3 ? 'directional brushed effect' : 'uniform reflection'})
• Texture:            ${finish_profile.texture || 'smooth vinyl film'}
` : ''}

🚨 FINISH ENFORCEMENT — DO NOT VIOLATE:

❌ DO NOT add gloss to matte films
❌ DO NOT add matte to gloss films
❌ DO NOT add chrome properties to non-chrome films
❌ DO NOT add pearl/iridescence to solid colors
❌ DO NOT add metallic flakes unless metallic_flake > 0
❌ DO NOT smooth brushed textures
❌ DO NOT add grain to smooth films

The finish MUST be EXACTLY as specified above.
═══════════════════════════════════════════════════════════════════════════════`;
}

/**
 * Generates the PANEL LOCK section to prevent unwanted recoloring
 */
export function buildPanelLock(): string {
  return `
═══════════════════════════════════════════════════════════════════════════════
🔒 PANEL LOCK — BODY PANELS ONLY, NOTHING ELSE 🔒
═══════════════════════════════════════════════════════════════════════════════

WRAP THESE EXTERIOR BODY PANELS ONLY:
✓ Hood
✓ Roof
✓ Trunk/Deck lid
✓ Front fenders
✓ Doors (all doors including rear)
✓ Rear quarter panels
✓ Front bumper cover (painted plastic)
✓ Rear bumper cover (painted plastic)
✓ Side skirts/rockers (if painted)
✓ Fender flares (if painted)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨🚨🚨 NEVER WRAP THESE — VIOLATION = RENDER FAILURE 🚨🚨🚨

❌ WINDSHIELD        → MUST remain 100% TRANSPARENT CLEAR GLASS
❌ ALL WINDOWS       → Front, rear, side glass MUST be TRANSPARENT
❌ SUNROOF/MOONROOF  → MUST remain TRANSPARENT
❌ HEADLIGHTS        → MUST stay CLEAR/BLACK housing with internal lights visible
❌ HEADLIGHT LENSES  → MUST be CLEAR/TRANSPARENT
❌ TAILLIGHTS        → MUST stay RED/CLEAR/BLACK with internal lights visible
❌ TAILLIGHT LENSES  → MUST be APPROPRIATE COLOR (red, amber, clear)
❌ FOG LIGHTS        → MUST stay ORIGINAL colors
❌ GRILLES/GRILLS    → MUST stay BLACK/CHROME/SILVER (OEM appearance)
❌ WHEELS/RIMS       → MUST stay BLACK/SILVER/CHROME (do NOT wrap wheels)
❌ TIRES             → MUST stay BLACK RUBBER
❌ CHROME TRIM       → MUST stay CHROME/SILVER unless chrome delete specified
❌ BADGES/EMBLEMS    → MUST stay ORIGINAL unless specified
❌ DOOR HANDLES      → MUST stay ORIGINAL COLOR unless body-colored OEM
❌ SIDE MIRRORS      → MUST stay ORIGINAL unless body-colored OEM
❌ EXHAUST TIPS      → MUST stay CHROME/BLACK METAL
❌ LICENSE PLATE     → MUST be VISIBLE (not wrapped)
❌ RUBBER SEALS      → MUST stay BLACK RUBBER
❌ WIPER BLADES      → MUST stay BLACK
❌ ANTENNA           → MUST stay BLACK

🚨 IF VINYL WRAP APPEARS ON ANY NON-BODY SURFACE, THE RENDER FAILS COMPLETELY.
🚨 GLASS MUST BE 100% TRANSPARENT — colored glass = FAILURE.
🚨 LIGHTS MUST BE ORIGINAL — wrapped lights = FAILURE.

═══════════════════════════════════════════════════════════════════════════════`;
}

/**
 * Generates the TEXTURE LOCK section for accurate texture rendering
 */
export function buildTextureLock(params: {
  finish: string;
  texture?: string;
  chrome?: boolean;
  metallic?: boolean;
}): string {
  const { finish, texture, chrome, metallic } = params;
  
  const finishLower = finish?.toLowerCase() || '';
  
  let textureInstructions = '';
  
  if (chrome) {
    textureInstructions = `
CHROME TEXTURE REQUIREMENTS:
• Mirror-like surface that reflects environment
• Zero color variation across surface (uniform chrome)
• Sharp, undistorted reflections
• NO color tinting of reflections
• Chrome reflects surrounding colors accurately without absorbing them`;
  } else if (finishLower.includes('brushed')) {
    textureInstructions = `
BRUSHED TEXTURE REQUIREMENTS:
• Visible directional grain/brush marks
• Grain follows consistent direction (typically horizontal on body panels)
• Anisotropic highlights that stretch in grain direction
• Metallic sheen visible in grain
• DO NOT smooth out the brushed texture`;
  } else if (finishLower.includes('carbon')) {
    textureInstructions = `
CARBON FIBER TEXTURE REQUIREMENTS:
• Visible weave pattern (2x2 twill weave typical)
• 3D depth in the weave texture
• Subtle gloss between weave fibers
• Pattern scale consistent across all panels
• DO NOT make carbon fiber too shiny or too matte`;
  } else if (finishLower.includes('matte')) {
    textureInstructions = `
MATTE TEXTURE REQUIREMENTS:
• Completely flat, non-reflective surface
• Zero specular highlights
• Soft, velvet-like appearance
• No "hot spots" from lighting
• DO NOT add any gloss or shine`;
  } else if (finishLower.includes('satin')) {
    textureInstructions = `
SATIN TEXTURE REQUIREMENTS:
• Soft sheen, not fully reflective
• Diffused highlights (no sharp reflections)
• Silk-like surface appearance
• Between matte and gloss in reflectivity
• Elegant, understated finish`;
  } else {
    textureInstructions = `
GLOSS TEXTURE REQUIREMENTS:
• High reflectivity, wet-look surface
• Sharp, clear reflections of studio environment
• Smooth, mirror-like finish on body panels
• Uniform gloss across all wrapped panels
• Professional car-show quality finish`;
  }
  
  if (metallic && !chrome) {
    textureInstructions += `

METALLIC EFFECT REQUIREMENTS:
• Visible metallic particles/flakes in paint
• Flakes catch light at different angles
• Sparkle effect visible in direct lighting
• Metallic depth visible in the color
• DO NOT make flakes too large or too sparse`;
  }
  
  return `
═══════════════════════════════════════════════════════════════════════════════
🔒 TEXTURE LOCK — MANUFACTURER EXACT TEXTURE 🔒
═══════════════════════════════════════════════════════════════════════════════

SPECIFIED TEXTURE: ${texture || finish || 'Smooth Vinyl'}
${textureInstructions}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 TEXTURE VIOLATIONS — DO NOT COMMIT:

❌ DO NOT add artistic smoothing to textured films
❌ DO NOT add pearl to non-pearl films
❌ DO NOT add color gradients (unless flip film)
❌ DO NOT add extra sparkle to non-metallic films
❌ DO NOT change weave pattern on carbon fiber
❌ DO NOT add grain to smooth glossy films
❌ DO NOT flatten brushed textures

The texture MUST match the manufacturer specification EXACTLY.
This is a product visualization, NOT artistic interpretation.

═══════════════════════════════════════════════════════════════════════════════`;
}

/**
 * Generates complete HARD ENFORCEMENT block combining all locks
 */
export function buildCompleteHardEnforcement(params: {
  manufacturer: string;
  colorName: string;
  productCode?: string;
  hex: string;
  lab: { L: number; a: number; b: number };
  finish: string;
  reflectivity?: number;
  metallic_flake?: number;
  finish_profile?: any;
  metallic?: boolean;
  pearl?: boolean;
  chrome?: boolean;
  texture?: string;
}): string {
  const colorLock = buildMandatoryColorLock({
    manufacturer: params.manufacturer,
    colorName: params.colorName,
    productCode: params.productCode,
    hex: params.hex,
    lab: params.lab,
  });
  
  const finishLock = buildFinishLock({
    finish: params.finish,
    reflectivity: params.reflectivity,
    metallic_flake: params.metallic_flake,
    finish_profile: params.finish_profile,
    metallic: params.metallic,
    pearl: params.pearl,
    chrome: params.chrome,
  });
  
  const panelLock = buildPanelLock();
  
  const textureLock = buildTextureLock({
    finish: params.finish,
    texture: params.texture,
    chrome: params.chrome,
    metallic: params.metallic,
  });
  
  return `
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
▓                                                                             ▓
▓   🔐 HARD ENFORCEMENT MODE ACTIVE — STRICT MANUFACTURER ACCURACY 🔐         ▓
▓                                                                             ▓
▓   This render uses REAL manufacturer film data.                             ▓
▓   ZERO artistic interpretation. ZERO deviation.                             ▓
▓   Match the specifications EXACTLY or the render FAILS.                     ▓
▓                                                                             ▓
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

${colorLock}

${finishLock}

${panelLock}

${textureLock}

▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
▓   END HARD ENFORCEMENT MODE — ABOVE RULES ARE NON-NEGOTIABLE               ▓
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓`;
}
