/**
 * 4-LAYER IRONCLAD PROMPT ENGINE
 * For 99% accurate, editable wrap-design modifications across all RestylePro tools
 * 
 * This engine ensures:
 * - Zero geometry drift
 * - Zero angle changes
 * - Zero crop changes
 * - Perfect continuity across vehicle surfaces
 * - Accurate color/pattern/finish modifications
 */

// ============= LAYER 1: GEOMETRY LOCK (NON-NEGOTIABLE) =============
export const GEOMETRY_LOCK_BLOCK = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 GEOMETRY LOCK — ABSOLUTE PRESERVATION REQUIRED 🔒
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You MUST preserve every geometric aspect of the vehicle EXACTLY:

✅ MUST PRESERVE:
• Exact camera angle - NO rotation, NO perspective changes
• Exact field of view - NO zoom in/out
• Exact cropping and framing - NO border changes
• Exact body shape, geometry, creases and reflections
• Exact panel outlines and dimensions
• Exact window shape and placement
• Identical wheels, tires, headlights, mirrors
• Identical background unless user specifically requests otherwise
• Exact vehicle proportions and silhouette
• Exact shadow positions and lighting direction

❌ UNDER NO CIRCUMSTANCES MAY YOU:
• Change the angle or camera position
• Change the silhouette or proportions
• Alter the crop or aspect ratio
• Replace wheels, tires, or mirrors
• Introduce new reflections that weren't present
• Add or remove any external elements
• Distort or blur vehicle geometry
• Modify window shapes or positions
• Change the vehicle type, make, or model
• Alter the background environment

🚨 VIOLATION OF GEOMETRY LOCK = COMPLETE RENDER FAILURE 🚨
`;

// ============= LAYER 2: VECTOR EDIT MODE (EDITOR ROLE) =============
export const VECTOR_EDIT_MODE_BLOCK = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 VECTOR EDIT MODE — TREAT AS LAYERED ARTWORK 🎨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Treat the wrap design as a LAYERED VECTOR ARTWORK.
Your role is to EDIT the EXISTING design, NOT recreate it from scratch.

✅ ALLOWED MODIFICATIONS:
• Color corrections (hue, saturation, brightness, temperature)
• Finish/material changes (gloss to matte, add metallic, change sheen)
• Shading adjustments (darker/lighter areas)
• Lighting intensity adjustments
• Pattern scale, flow, repetition, or vibrancy adjustments
• Gradient color stops, intensity, angle adjustments
• Selective panel edits ("just the hood", "just the doors")
• Contrast, saturation, clarity, or tonal changes
• Texture adjustments that follow body contours
• Reflectivity and specularity changes

❌ NOT ALLOWED:
• Inventing new patterns that weren't in the original
• Adding decals, logos, text, or symbols not requested
• Altering pattern geometry or flow direction without explicit request
• Breaking panel alignment or wrap continuity
• Changing gradient direction unless specifically requested
• Altering pattern placement on the vehicle
• Adding noise, grunge, or distress effects unless requested
• Removing existing design elements without explicit request
• Creating a completely new design instead of editing

🎯 GOAL: Precise, surgical edits that preserve design intent 🎯
`;

// ============= LAYER 3: REVISION INTERPRETATION RULES =============
export const REVISION_INTERPRETATION_BLOCK = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 REVISION INTERPRETATION — ATOMIC DESIGN OPERATIONS 📝
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Read the user's revision request carefully and break it into ATOMIC OPERATIONS:

OPERATION CATEGORIES:
• 🎨 GLOBAL COLOR EDIT: Affects entire wrap (e.g., "make it more blue")
• 🖌️ LOCAL COLOR EDIT: Affects specific area (e.g., "darken the hood")
• ✨ FINISH EDIT: Material change (e.g., "make it glossier", "add metallic")
• 💡 LIGHTING EDIT: Light intensity/direction (e.g., "more dramatic shadows")
• 🔄 PATTERN MODIFICATION: Scale, flow, repetition changes
• 🌓 SHADING EDIT: Light/dark balance adjustments
• 🌈 GRADIENT EDIT: Gradient stops, direction, intensity
• 📍 PANEL-SPECIFIC EDIT: Targeted area modification

APPLICATION RULES:
1. Apply ONLY the specified operations — no additional "improvements"
2. DO NOT modify ANY geometry or composition
3. If instruction is ambiguous, choose the LEAST DESTRUCTIVE interpretation
4. If instruction refers to a panel (hood, doors, bumper, roof), apply ONLY to that region
5. Maintain perfect color/pattern continuity across panel edges
6. Preserve the overall design intent while applying changes
7. Keep all branding overlays in their exact positions

PANEL REFERENCE MAP:
• "Hood" = Front top panel only
• "Roof" = Top center panel only  
• "Doors" = Side panels between fenders
• "Fenders" = Front and rear wheel arch areas
• "Bumper" = Front or rear bumper covers
• "Trunk" / "Tailgate" = Rear top panel
• "Quarter panels" = Rear side panels behind doors

🎯 PRECISION IS PARAMOUNT — Apply exactly what was requested 🎯
`;

// ============= LAYER 4: MULTI-VIEW CONSISTENCY (ApproveMode) =============
export const MULTI_VIEW_CONSISTENCY_BLOCK = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 MULTI-VIEW CONSISTENCY — IDENTICAL ACROSS ALL ANGLES 🔄
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When generating multiple views, you MUST apply revision instructions CONSISTENTLY:

✅ MUST BE IDENTICAL ACROSS ALL VIEWS:
• Same saturation levels and color values
• Same color interpretations (if "more blue" = specific shade, use it everywhere)
• Same finish appearance (gloss level, metallic intensity)
• Same pattern flow direction and scale
• Same gradient color stops and positions
• Same lighting adjustment intensity
• Same shading depth and character

❌ DO NOT INTRODUCE DISCREPANCIES:
• Different colors between left and right sides
• Inconsistent pattern scale on different panels
• Varying finish appearance (gloss on one side, matte-looking on other)
• Different gradient intensities per view
• Inconsistent lighting corrections

CONTINUITY CHECK:
Before finalizing, mentally verify:
"If I placed these views side-by-side, would they look like the SAME vehicle?"

🎯 ALL VIEWS = SAME VEHICLE = SAME REVISION 🎯
`;

// ============= QUICK REVISION CHIP INTERPRETERS =============
export const REVISION_CHIP_EXPANSIONS: Record<string, string> = {
  "Make the colors more vibrant": "Increase color saturation by 20-30% across all wrapped surfaces while maintaining the same hue. Make colors pop more without becoming neon or unnatural.",
  "Add more contrast": "Increase the difference between light and dark areas. Deepen shadows slightly and brighten highlights while preserving the original color palette.",
  "Make it darker/moodier": "Reduce overall brightness by 15-20%. Deepen shadow areas, reduce highlight intensity, and create a more dramatic, subdued atmosphere while maintaining wrap visibility.",
  "Brighter lighting": "Increase the intensity of studio lighting. Add more pronounced highlights, brighter reflections, and a more vibrant overall illumination while keeping the design clearly visible.",
  "More dramatic angle": "This is a GEOMETRY request - not applicable. Maintain current angle exactly and suggest user regenerate with a different view type instead.",
  "Cleaner background": "Simplify the background environment. Reduce any visual noise, ensure clean neutral studio backdrop, and improve contrast between vehicle and background."
};

/**
 * Builds the complete revision prompt block for AI
 * Combines all 4 layers based on the tool and request type
 */
export function buildRevisionPromptBlock(params: {
  revisionPrompt: string;
  toolType: 'colorpro' | 'designpanelpro' | 'patternpro' | 'wbty' | 'fadewraps' | 'approvemode' | 'graphicspro';
  isMultiView?: boolean;
  currentViewType?: string;
  styleDNA?: string | null;
  selectedPreset?: string | null;
  originalPrompt?: string | null; // Add original prompt to detect stripe intent
}): string {
  const { revisionPrompt, toolType, isMultiView = false, currentViewType, styleDNA, selectedPreset, originalPrompt } = params;
  
  // ============= STRIPE MODE DETECTION FOR REVISIONS =============
  const stripeIntent = originalPrompt ? (
    /stripe|rocker|beltline|shoulder|swoosh|accent|panel sweep|panel stripe|body line|pinstripe|quarter sweep/i.test(originalPrompt)
  ) && !(
    originalPrompt.toLowerCase().includes('two tone') ||
    originalPrompt.toLowerCase().includes('two-tone') ||
    (originalPrompt.toLowerCase().includes('top half') && originalPrompt.toLowerCase().includes('bottom half'))
  ) : false;

  // ============= STRIPE-ONLY REVISION MODE =============
  if (stripeIntent) {
    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 STRIPE-ONLY REVISION MODE 🔒
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are updating a VINYL STRIPE DESIGN. NOT a full-body wrap.

USER REVISION REQUEST:
"${revisionPrompt}"

CRITICAL STRIPE REVISION RULES:

✅ ALLOWED:
• Change stripe COLOR (e.g., "make stripe red instead of gold")
• Change stripe FINISH (e.g., "make stripe chrome instead of gloss")
• Adjust stripe WIDTH slightly
• Adjust stripe BRIGHTNESS/SATURATION

❌ STRICTLY FORBIDDEN:
• DO NOT recolor the vehicle body
• DO NOT introduce new geometric shapes
• DO NOT add extra color zones
• DO NOT create two-tone body wraps
• DO NOT add random logos or graphics
• DO NOT convert stripe to full-body wrap
• DO NOT add diagonal blocks or panels

PRESERVE:
• Exact stripe PLACEMENT (rocker, beltline, shoulder, etc.)
• Exact stripe GEOMETRY
• Vehicle body color UNCHANGED
• Stripe type and location LOCKED

Apply ONLY the user's requested change to the STRIPE ITSELF.
The vehicle body color must remain EXACTLY as it was.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎬 EXECUTE STRIPE REVISION NOW 🎬
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
  }
  
  // ============= STANDARD REVISION MODE =============
  
  // Expand quick chip prompts if they match
  let expandedPrompt = revisionPrompt;
  for (const [chip, expansion] of Object.entries(REVISION_CHIP_EXPANSIONS)) {
    if (revisionPrompt.toLowerCase().includes(chip.toLowerCase())) {
      expandedPrompt = expansion;
      break;
    }
  }

  // Tool-specific context
  const toolContext = {
    colorpro: "solid vinyl wrap color",
    designpanelpro: "printed panel design wrap",
    patternpro: "repeating pattern wrap",
    wbty: "fabric/texture pattern wrap",
    fadewraps: "gradient fade wrap",
    approvemode: "custom 2D design wrap proof",
    graphicspro: "multi-zone vinyl wrap design"
  };

  let revisionBlock = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 DESIGN REVISION MODE — 4-LAYER IRONCLAD ENGINE 🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOOL CONTEXT: ${toolType.toUpperCase()} — ${toolContext[toolType]}
${currentViewType ? `CURRENT VIEW: ${currentViewType.toUpperCase()}` : ''}

${GEOMETRY_LOCK_BLOCK}

${VECTOR_EDIT_MODE_BLOCK}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 USER REVISION REQUEST 🎯
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"${expandedPrompt}"

${REVISION_INTERPRETATION_BLOCK}
`;

  // Add style DNA preservation for GraphicsPro
  if (styleDNA) {
    revisionBlock += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 STYLE DNA PRESERVATION (CRITICAL) 🎨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Maintain the original artistic style throughout all revisions:
${styleDNA}

✅ PRESERVE:
• Line weight and stroke geometry
• Curve flow and flourish patterns
• Symmetry and balance
• Multi-line relationships
• Accent layer structure

❌ DO NOT alter style DNA during revisions unless explicitly requested.
`;
  }

  // Add preset preservation
  if (selectedPreset) {
    revisionBlock += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 OEM PRESET GEOMETRY LOCK 🔒
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Maintain OEM geometry from preset: ${selectedPreset}

• OEM stripe layout LOCKED
• OEM proportions LOCKED
• OEM placement rules LOCKED
• User can modify COLOR/FINISH only
• NEVER change stripe width, spacing, or geometry during revision
`;
  }

  // Add zone geometry preservation for two-tone splits
  revisionBlock += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 ZONE GEOMETRY PRESERVATION (CRITICAL) 🔒
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOU MUST MAINTAIN THE ORIGINAL TOP/BOTTOM ZONE SPLIT:

• If original had GOLD CHROME top half → keep GOLD CHROME in TOP HALF only
• If original had SATIN BLACK bottom half → keep SATIN BLACK in BOTTOM HALF only

DO NOT:
- Raise or lower the dividing line
- Change zone definitions  
- Alter geometry from the original render
- Allow colors to bleed into opposite zones

Zoning MUST remain identical across all views and revisions.
`;

  // Add panel stripe type preservation
  revisionBlock += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 PANEL STRIPE TYPE PRESERVATION 🔒
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If the original design used a PANEL STRIPE TYPE:

• ROCKER STRIPE → Stays on LOWER BODY (8-14" from ground)
• BELTLINE STRIPE → Stays at MID-BODY CREASE (window sill height)
• SHOULDER STRIPE → Stays BELOW WINDOW LINE
• QUARTER SWEEP → Stays on REAR QUARTER PANELS
• SWOOSH → Maintains FENDER-TO-QUARTER continuous flow

DO NOT:
- Shift stripe to a different panel region
- Change vertical placement of stripes
- Convert one stripe type to another
- Allow stripe drift between views
- Alter stripe width or proportions

Stripe type and placement MUST be identical in all revision angles.
User can modify stripe COLOR and FINISH only.
`;

  // Add multi-view consistency for ApproveMode or when generating multiple views
  if (isMultiView || toolType === 'approvemode' || toolType === 'graphicspro') {
    revisionBlock += `
${MULTI_VIEW_CONSISTENCY_BLOCK}
`;
  }

  revisionBlock += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎬 EXECUTE REVISION NOW 🎬
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Apply the user's revision request using the rules above.
Output ONLY the revised render with changes applied.
Preserve ALL geometric and spatial properties exactly.
Maintain perfect wrap continuity across all surfaces.
${styleDNA ? 'Preserve original STYLE DNA completely.' : ''}
${selectedPreset ? 'Preserve OEM PRESET geometry exactly.' : ''}

🔴 FINAL CHECK: Does this revision match EXACTLY what the user asked for? 🔴
`;

  return revisionBlock;
}

/**
 * Validates if a revision request can be processed
 * Returns warnings for requests that might cause issues
 */
export function validateRevisionRequest(prompt: string): {
  isValid: boolean;
  warnings: string[];
  suggestedAction?: string;
} {
  const warnings: string[] = [];
  let suggestedAction: string | undefined;

  const lowerPrompt = prompt.toLowerCase();

  // Check for geometry-changing requests
  const geometryKeywords = ['different angle', 'change angle', 'rotate', 'different view', 'zoom in', 'zoom out', 'crop', 'wider shot', 'closer'];
  if (geometryKeywords.some(kw => lowerPrompt.includes(kw))) {
    warnings.push("This request involves camera/geometry changes which may not be fully achievable in revision mode.");
    suggestedAction = "Consider regenerating with a different view type instead of using revision mode.";
  }

  // Check for vehicle-changing requests
  const vehicleKeywords = ['different car', 'change vehicle', 'different truck', 'change to a'];
  if (vehicleKeywords.some(kw => lowerPrompt.includes(kw))) {
    warnings.push("Changing the vehicle type requires a full regeneration, not a revision.");
    suggestedAction = "Start a new render with the desired vehicle.";
  }

  // Check for very vague requests
  if (prompt.length < 10) {
    warnings.push("Very short revision requests may produce unpredictable results. Consider being more specific.");
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    suggestedAction
  };
}
