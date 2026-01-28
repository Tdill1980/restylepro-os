import { ASPECT_RATIO_REQUIREMENT } from "./aspect-ratio-requirement.ts";
import { PHOTOREALISM_REQUIREMENT, BRANDING_INSTRUCTIONS } from "./photorealism-prompt.ts";
import { FORBIDDEN_TEXT_WATERMARK_INSTRUCTIONS } from "./forbidden-text-instructions.ts";
import { getFinishSpecification } from "./finish-specifications.ts";
import { getStudioEnvironment, selectStudioForFinish } from "./studio-environments.ts";
import { buildColorSubstitutionPrompt, STANDARD_FADE_REFERENCE_URL, REFERENCE_IMAGE_COLOR } from "./fade-reference-images.ts";

// Visual reference guidance for seamless gradient quality
export function buildVisualReferenceGuidance(colorHex: string, colorName: string): string {
  return `
📸📸📸 VISUAL REFERENCE — GOLD STANDARD GRADIENT SMOOTHNESS 📸📸📸
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A REFERENCE IMAGE showing PERFECT seamless gradient is provided.
This is your "gold standard" — YOUR RENDER MUST MATCH THIS SMOOTHNESS.

🎨 COLOR SUBSTITUTION (CRITICAL):
• REFERENCE shows: ${REFERENCE_IMAGE_COLOR.name} (${REFERENCE_IMAGE_COLOR.hex}) → Black fade
• YOUR render must show: ${colorName} (${colorHex}) → Black fade
• ONLY the color changes — the SMOOTHNESS must be IDENTICAL

✅ COPY FROM REFERENCE:
✅ The seamless, imperceptible transition quality
✅ The airbrush-style blend where colors mist together
✅ The extended transition width (40%+ of vehicle length)
✅ The "sunset sky" smoothness — no visible boundary

❌ DO NOT:
❌ Create sharper transitions than the reference
❌ Add hard lines that aren't in the reference
❌ Make the fade shorter or more abrupt
❌ Reduce the transition quality in any way

🔍 COMPARISON CHECK:
If your render has MORE visible edges than the reference = REGENERATE
If your render has HARDER transitions than the reference = REGENERATE
Your transition quality MUST MATCH the reference exactly.

The reference is your quality benchmark. Match it precisely.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
}

export function buildFadeWrapsPrompt(params: {
  vehicle: string;
  colorData: any;
  finish: string;
  gradientDirection: string;
  fadeStyle?: string;
  cameraAngle: string;
  addHood?: boolean;
  addFrontBumper?: boolean;
  addRearBumper?: boolean;
  kitSize?: string;
  roofSize?: string;
  viewType?: string;
}): string {
  const { vehicle, colorData, finish, gradientDirection, fadeStyle, cameraAngle, addHood, addFrontBumper, addRearBumper, kitSize, roofSize, viewType } = params;
  
  // Detect if this is a top view for special handling
  const isTopView = viewType === 'top' || cameraAngle?.toLowerCase().includes('top') || cameraAngle?.toLowerCase().includes('overhead');
  
  // Map fadeStyle IDs to AI instructions
  const getFadeStylePrompt = (styleId: string | undefined): string => {
    switch (styleId) {
      case 'crossfade':
        // Enhanced CrossFade™ with seamless ombre model (NO hard lines, NO zones)
        return `✨ CROSSFADE™ - SEAMLESS BI-DIRECTIONAL AIRBRUSH OMBRE ✨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THIS IS A SEAMLESS BI-DIRECTIONAL OMBRE — colors MIST into each other with NO visible edges.

🔒 INKFUSION CROSSFADE™ SEAMLESS BLEND MODEL:
• FRONT: Full InkFusion color, 100% saturation — MISTS toward center
• FRONT-TO-MID: Exponential airbrush blend toward black — IMPERCEPTIBLE transition
• MID (CENTER): Deep black core — colors have MISTED to pure black
• MID-TO-REAR: Exponential airbrush blend from black — IMPERCEPTIBLE transition  
• REAR: Full InkFusion color, 100% saturation — MISTED from center

🎨 VEHICLE-SPACE FADE (NOT CAMERA-SPACE):
• The fade is anchored to the VEHICLE'S FRONT-TO-REAR axis
• It does NOT change based on camera angle
• On SIDE views: visible as seamless horizontal ombre with black misting through middle
• On TOP views: SAME FADE — black mists LEFT-TO-RIGHT through center
• On FRONT views: subtle mid-dark visible on side body
• On REAR views: subtle mid-dark visible on side body

${isTopView ? `
🔝 TOP-DOWN VIEW SPECIFIC RULES (CRITICAL):
• REAPPLY CrossFade™ along vehicle's front-to-rear axis AS SEEN FROM ABOVE
• The BLACK MIDPOINT must be CLEARLY VISIBLE from overhead — seamlessly blended
• Front quarter shows FULL INKFUSION COLOR — misting toward center
• Rear quarter shows FULL INKFUSION COLOR — misting toward center
• Center shows deep black that colors have MISTED into
• BOTH transitions are SEAMLESS AIRBRUSH — NO visible edges or lines
• Apply CURVATURE-WEIGHTED GLOSS reflections (wet ink appearance)
` : ''}

🚫 HARD LINE DETECTION — CROSSFADE FAILURE CONDITIONS:
🚫 If you can see WHERE color meets black = INVALID
🚫 If there are visible "edges" around the black center = INVALID
🚫 If the transitions look like masking tape was used = INVALID
🚫 Colors must MIST into each other like airbrush spray paint

✅ WHAT CROSSFADE IS:
✅ Full color at BOTH ends (front AND rear) — seamlessly misting toward center
✅ Black core visible through the MIDDLE — colors MISTED to this darkness
✅ SEAMLESS EXPONENTIAL transitions — NO visible boundary anywhere
✅ Airbrush-style blend creating imperceptible "pinch" effect in the center`;


      case 'rear_performance':
        return `✨ CROSS FADE STYLE — SEAMLESS UPPER → LOWER BODY OMBRE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is a SEAMLESS VERTICAL AIRBRUSH OMBRE — NOT a hard two-tone split.

PRIMARY COLOR (TOP HALF):
- Roof, A/B/C pillars, window line, and upper door sections in PRIMARY COLOR
- Color is SOLID across the entire upper body from front to rear

SEAMLESS BLEND (MID-BODY):
- The ombre begins roughly at the mid-door body line / beltline
- Colors MIST into each other — NO visible line or edge
- The transition wraps around the entire vehicle at this height
- You CANNOT see where "color stops and black starts"

BLACK (BOTTOM HALF):
- Lower doors, rocker panels, lower quarter panels seamlessly MISTED to pure BLACK
- Black is anchored to the very bottom edges near the ground

🚫 HARD LINE DETECTION — FAILURE CONDITIONS:
🚫 If there is a visible horizontal line at beltline = INVALID
🚫 If it looks like two-tone with masking tape = INVALID
🚫 Colors must MIST imperceptibly into each other

THINK: Two-tone appearance but with SEAMLESS AIRBRUSH OMBRE instead of hard line.`;


      case 'front_back':
        return `✨ FRONT-TO-BACK SEAMLESS AIRBRUSH OMBRE (VEHICLE LONGITUDINAL AXIS) ✨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THIS IS A SEAMLESS HORIZONTAL OMBRE — colors MIST into each other with NO visible edge.

🔒 SEAMLESS BLEND REQUIREMENTS:
• FRONT of vehicle (hood, front bumper, front fenders) = FULL COLOR (100% saturation)
• MIDDLE of vehicle (doors, B-pillar area) = IMPERCEPTIBLE BLEND — mixed hues where you cannot tell if it's more color or more black
• REAR of vehicle (rear quarters, trunk, rear bumper) = BLACK (#000000)
• Transition spans AT LEAST 40% of vehicle length — EXTENDED soft blend

🎯 CAMERA-VIEW-SPECIFIC INSTRUCTIONS:

📸 SIDE VIEW (most common):
• LEFT SIDE of image = FRONT of vehicle = FULL COLOR
• RIGHT SIDE of image = REAR of vehicle = BLACK
• The ombre flows HORIZONTALLY from LEFT to RIGHT — SEAMLESSLY
• You CANNOT see where "color stops and black starts"
• The mid-section shows mixed hues misting into each other

📸 FRONT VIEW:
• Vehicle FRONT faces camera = FULL COLOR visible
• Sides show seamless ombre misting darker as they recede

📸 REAR VIEW:
• Vehicle REAR faces camera = BLACK/DARK visible
• Sides show seamless ombre misting toward color at front

📸 TOP VIEW:
• TOP of image = HOOD = FULL COLOR
• BOTTOM of image = TRUNK = BLACK
• Ombre flows TOP to BOTTOM — SEAMLESSLY

🚫 HARD LINE DETECTION — FAILURE CONDITIONS:
🚫 If there is ANY visible line where colors meet = INVALID
🚫 If you can identify "the exact point" where color changes = INVALID
🚫 If the transition is short/abrupt (less than 40% of body) = INVALID
🚫 If it looks like two-tone with masking tape = INVALID

✅ SUCCESS VALIDATION (SMOOTHNESS CHECK):
✅ Hood = FULL SATURATED COLOR
✅ Front fenders = FULL COLOR  
✅ Mid-doors = IMPERCEPTIBLE BLEND (you cannot see where colors meet)
✅ Rear quarters = Misted to near-black
✅ Trunk/tailgate = BLACK
✅ The transition is SO SMOOTH you cannot identify the boundary

This is a SEAMLESS AIRBRUSH OMBRE — like the reference, front is color, rear mists to black.`;


      case 'top_bottom':
        return `✨ TOP-TO-BOTTOM SEAMLESS AIRBRUSH OMBRE:
Color at roof MISTS imperceptibly to black at rocker panels/lower body.
The ombre flows VERTICALLY from the vehicle's roof down to the ground.
🚫 NO visible horizontal line at beltline — colors blend like airbrush spray paint.`;

      case 'diagonal':
        return `✨ DIAGONAL SEAMLESS AIRBRUSH OMBRE (FRONT-TOP TO REAR-BOTTOM):
Color at front-top corner MISTS imperceptibly to black at rear-bottom.
The ombre cuts diagonally across the entire vehicle body at approximately 45 degrees.
🚫 NO visible diagonal line — colors blend seamlessly like airbrush spray paint.`;


      default:
        return ''; // Standard fades use gradientDirection only
    }
  };

  const fadeStyleInstructions = getFadeStylePrompt(fadeStyle);

  // 🔒 GLOBAL VEHICLE AXIS LOCK (S.A.W. FIX)
  // All fades MUST use vehicle-local axes, NEVER camera or screen axes
  const vehicleAxisLock = `
🔒 VEHICLE-SPACE COORDINATE LOCK (MANDATORY — ALL FADES)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALL FADE GRADIENTS MUST USE VEHICLE-LOCAL AXES, NOT CAMERA OR SCREEN AXES.

VEHICLE COORDINATE SYSTEM:
• X-AXIS (LONGITUDINAL): Front bumper ↔ Rear bumper (front-to-rear)
• Y-AXIS (LATERAL): Driver side ↔ Passenger side (left-to-right)
• Z-AXIS (VERTICAL): Ground ↔ Roof (bottom-to-top)

🚨 CRITICAL: The fade direction is ANCHORED TO THE VEHICLE, not the camera view.
- On SIDE VIEW: Front→Back fade flows LEFT to RIGHT in the image
- On FRONT VIEW: Front→Back fade flows TOWARD the camera (front is closest)
- On REAR VIEW: Front→Back fade flows AWAY from camera (rear is closest)
- On TOP VIEW: Front→Back fade flows TOP to BOTTOM in the image (hood at top, trunk at bottom)
- On 3/4 VIEWS: Fade follows the vehicle's longitudinal axis at the angle shown

❌ STRICTLY PROHIBITED:
❌ DO NOT apply fade relative to screen/image coordinates
❌ DO NOT apply fade relative to camera position
❌ DO NOT apply fade per-panel or per-UV
❌ DO NOT vary fade direction based on which panels are visible

✅ REQUIRED:
✅ Fade is calculated in VEHICLE SPACE first
✅ Then projected onto whatever camera view is shown
✅ Fade MUST look consistent across all views of the same vehicle
✅ The same point on the vehicle has the same fade color regardless of camera angle
`;

  const directionInstructions = gradientDirection === 'top-to-bottom'
    ? `🚨🚨🚨 GRADIENT DIRECTION - ROOF TO ROCKERS (VERTICAL) 🚨🚨🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FULL COLOR: ROOF (highest point of vehicle)
BLACK: ROCKERS/LOWER BODY (near the ground)

SIMPLE RULE: "Color at the SKY, black at the GROUND"
• Roof panel = FULL SATURATED COLOR
• A-pillars, B-pillars, C-pillars = transitioning downward
• Lower doors = misting toward black
• Rocker panels = PURE BLACK

ON SIDE VIEW: Color at TOP of image, black at BOTTOM of image
ON FRONT/REAR VIEW: Roof is colored, bumpers are black
ON TOP VIEW: Entire roof shows color (you're looking at the colored part)

THE FADE RUNS VERTICALLY DOWN THE VEHICLE HEIGHT — roof to rockers.`
    : gradientDirection === 'bottom-to-top'
    ? `🚨🚨🚨 GRADIENT DIRECTION - ROCKERS TO ROOF (VERTICAL INVERTED) 🚨🚨🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FULL COLOR: ROCKERS/LOWER BODY (near the ground)
BLACK: ROOF (highest point of vehicle)

SIMPLE RULE: "Color at the GROUND, black at the SKY"
• Rocker panels = FULL SATURATED COLOR
• Lower doors = full color
• Upper doors = misting toward black
• Roof panel = PURE BLACK

ON SIDE VIEW: Color at BOTTOM of image, black at TOP of image
THE FADE RUNS VERTICALLY UP THE VEHICLE HEIGHT — rockers to roof.`
    : gradientDirection === 'back-to-front'
    ? `🚨🚨🚨 GRADIENT DIRECTION - TRUNK TO HOOD (REVERSED LONGITUDINAL) 🚨🚨🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FULL COLOR: REAR of vehicle (trunk/tailgate, rear bumper)
BLACK: FRONT of vehicle (hood, front bumper)

SIMPLE RULE: "Color at the BACK, black at the FRONT"
• Trunk/tailgate = FULL SATURATED COLOR
• Rear quarter panels = full color
• Center doors = transitioning
• Front fenders = misting toward black
• Hood = PURE BLACK

ON SIDE VIEW: Color at RIGHT of image, black at LEFT of image
ON REAR VIEW: Trunk faces camera = FULL COLOR visible
ON FRONT VIEW: Hood faces camera = BLACK visible
ON TOP VIEW: Trunk at bottom of image = color, hood at top = black

THE FADE RUNS LENGTHWISE — from rear to front of vehicle.`
    : gradientDirection === 'diagonal-front'
    ? `🚨🚨🚨 GRADIENT DIRECTION - DIAGONAL (FRONT-TOP TO REAR-BOTTOM) 🚨🚨🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FULL COLOR: FRONT-TOP corner (where hood meets windshield)
BLACK: REAR-BOTTOM corner (lower rear quarter panels)

SIMPLE RULE: "Color at HOOD, black at LOWER REAR"
• Front windshield pillars + hood = FULL SATURATED COLOR
• Diagonal sweep across vehicle
• Lower rear quarters = PURE BLACK

THE FADE CUTS DIAGONALLY across the vehicle at ~45 degrees.`
    : gradientDirection === 'diagonal-rear'
    ? `🚨🚨🚨 GRADIENT DIRECTION - DIAGONAL (REAR-TOP TO FRONT-BOTTOM) 🚨🚨🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FULL COLOR: REAR-TOP corner (rear window/C-pillar area)
BLACK: FRONT-BOTTOM corner (lower front fenders)

SIMPLE RULE: "Color at REAR ROOF, black at LOWER FRONT"
• Rear roof/C-pillars = FULL SATURATED COLOR
• Diagonal sweep toward front
• Lower front fenders = PURE BLACK

THE FADE CUTS DIAGONALLY across the vehicle at ~45 degrees (rear to front).`
    : `🚨🚨🚨 GRADIENT DIRECTION - HOOD TO TRUNK (LONGITUDINAL) 🚨🚨🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FULL COLOR: FRONT of vehicle (hood, front bumper, front fenders)
BLACK: REAR of vehicle (trunk/tailgate, rear bumper, rear quarters)

SIMPLE RULE: "Color at the NOSE, black at the TAIL"
• Hood = FULL SATURATED COLOR
• Front bumper = FULL COLOR
• Front fenders = FULL COLOR
• Front doors = transitioning toward black
• Rear doors = mostly black with hints of transition
• Rear quarter panels = PURE BLACK
• Trunk/tailgate = PURE BLACK

🔴 VIEW-BY-VIEW APPLICATION (MEMORIZE THIS):

📸 SIDE VIEW:
• LEFT side of image = FRONT of car = FULL COLOR
• RIGHT side of image = REAR of car = BLACK
• Gradient flows LEFT → RIGHT in the image

📸 FRONT VIEW:
• Front faces camera = FULL COLOR visible
• Sides recede showing transition to black at rear

📸 REAR VIEW:
• Rear faces camera = BLACK visible
• Sides recede showing transition to color at front

📸 TOP VIEW (OVERHEAD):
• TOP of image = HOOD = FULL COLOR
• BOTTOM of image = TRUNK = BLACK
• Gradient flows TOP → BOTTOM in the image

📸 3/4 FRONT VIEW:
• Hood and front fenders prominent = FULL COLOR
• Rear visible at angle = showing transition to BLACK

⚠️ THE FADE IS ANCHORED TO THE VEHICLE BODY — not the camera position.
⚠️ The HOOD is ALWAYS the same color regardless of which angle you view it from.
⚠️ The TRUNK is ALWAYS black regardless of which angle you view it from.`;

  const glossFinish = getFinishSpecification(finish);
  
  // Helper to darken hex for ink-density rendering
  const darkenHex = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, Math.floor((num >> 16) * (1 - percent)));
    const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (1 - percent)));
    const b = Math.max(0, Math.floor((num & 0x0000FF) * (1 - percent)));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

  // InkFusion mode uses ink-density rendering with darker render hex
  const displayHex = colorData?.colorHex || '#000000';
  const renderHex = colorData?.renderHex || darkenHex(displayHex, 0.20); // 20% darker fallback
  const inkDensity = colorData?.inkDensity || 1.0;

  // 🔒 INKFUSION RENDER AUTHORITY - Centralized InkFusion rules
  const inkFusionInstructions = colorData?.isInkFusion && displayHex !== '#000000' ? `
🔒 INKFUSION™ RENDER AUTHORITY — CROSSFADE + TOP VIEW LOCK 🔒
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When InkFusion™ is selected, the renderer must use InkFusion Color Profiles as the SOLE SOURCE of color truth.
UI swatches, ColorPro LAB interpolation, vinyl reflectivity, and screen-space gradients are STRICTLY PROHIBITED.

BASE SUBSTRATE: 3M IJ180mC-120 Silver Metallic
COLOR: ${colorData?.colorName || 'Custom'}
UI PREVIEW HEX: ${displayHex} (for reference only — DO NOT USE for rendering)
RENDER HEX: ${renderHex} (USE THIS for actual rendering)
INK DENSITY: ${inkDensity}x
FINISH: ${finish || 'Gloss'} lamination

⚠️ CRITICAL INK-DENSITY RENDERING RULES:
1. The rendered color must be RICHER and DEEPER than ${displayHex}
2. Use ${renderHex} as the base color for all rendering
3. Printed ink absorbs light differently than screens display it
4. This is NOT vinyl — no vinyl clearcoat shimmer
5. Subtle metallic substrate shimmer visible through the printed ink

🎨 NON-LINEAR FADE BEHAVIOR (EXPONENTIAL — MANDATORY):
When fading to black:
- Transition is NON-LINEAR (exponential darkening curve)
- Color SATURATION INCREASES 1.3x as it approaches black (ink richness)
- Mid-fade zone shows BOOSTED saturation before darkening
- Black end must be TRUE BLACK (#000000) with ZERO color bleed
- NEVER use linear RGB interpolation — printed ink doesn't work that way

The fade should feel like AIRBRUSH SPRAY PAINTING, not a digital gradient.

${isTopView && fadeStyle === 'crossfade' ? `
🔝 TOP VIEW CROSSFADE™ LOCK (S.A.W. FIXED — NO GLOSS OVERRIDE):
• reapplyFadeInVehicleAxis: TRUE
• fadeAxis: front-to-rear
• enforceMidBlack: TRUE  
• midBlackStrength: 1.15
• PRESERVE visible black midpoint band from overhead
• Maintain FULL color saturation at front and rear ends
• DO NOT flatten fades or normalize lighting

⚠️ GLOSS/SHEEN IS LOCKED — Do NOT modify glossReflectionModel, specularFalloff, or any material reflection parameters.
` : ''}

🚫 INKFUSION RENDERS MUST CONTAIN:
❌ NO text, labels, captions, or watermarks
❌ NO UI preview colors — use RENDER HEX only
❌ NO linear gradient interpolation

✅ IF UNCERTAINTY EXISTS:
Prefer DARKER, RICHER, print-accurate output over screen vibrancy.
` : '';
  
  // HARD OVERRIDE: Dedicated FadeWraps performance studio (no auto-studio)
  // 🔒 S.A.W. STUDIO ONLY — NO MATERIAL INTERACTION
  const studioEnvironment = `
🏁 FADEWRAPS PERFORMANCE STUDIO (S.A.W. FIXED)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STUDIO ONLY — NO MATERIAL INTERACTION

FLOOR:
- Textured dark concrete floor (#2a2a2a to #1a1a1a, rough surface NOT polished)
- Floor roughness: 0.65 (floor texture only, does NOT affect vehicle paint)
- Floor reflectivity: 0.05 (minimal floor reflection, NOT vehicle)
- Contact shadows enabled beneath vehicle
- FLOOR MUST BE A FLAT, CONTINUOUS PLANE — NO circular pads, NO cyclorama cutouts, NO rounded floor edges
- The floor should extend fully to the left and right edges of the image like a real studio, with no visible shape outline

WALLS/BACKGROUND:
- Light neutral gray studio walls (#E6E6E6)
- Clean, simple background with NO visible ceiling
- Camera must be framed so ONLY walls are visible behind vehicle
- DO NOT show any overhead light fixtures, light panels, or studio hardware

LIGHTING:
- Neutral-white key light (no color gels)
- Soft fill for gradient visibility
- No hard specular override on vehicle paint
- Light sources themselves MUST NOT be visible in the frame

⚠️ VEHICLE GLOSS/SHEEN IS LOCKED — DO NOT modify vehicle paint material properties.

${isTopView ? `
TOP VIEW STUDIO ADJUSTMENTS:
- Overhead camera at 90° looking straight down
- Even lighting from all sides to show gradient clearly
- Floor reflection subtle but visible
- FULL vehicle silhouette visible — roof, hood, trunk from above
- The floor must still appear as a flat, continuous rectangle with NO circular shape or cyclorama visible
- If a circular floor or cyclorama shape appears, the render is INVALID — regenerate with a flat studio floor
` : ''}`;

  // Gloss-specific instructions for FadeWraps
  const glossInstructions = finish?.toLowerCase() === 'gloss' ? `
🔥 GLOSS FINISH WITH CURVATURE-WEIGHTED REFLECTIONS:
• Maximum automotive wet-look shine
• Gloss highlights must MOVE across the fade transitions
• Specular highlights crisp on curves (hood, fenders, roof edge)
• High contrast between lit and shadowed areas
• Glossy clear coat appearance with depth
• Mirror-like reflections visible on curved panels
• Wet showroom car appearance
` : '';

  // Get color info for the critical fade instruction
  const colorName = colorData?.colorName || 'the selected color';
  const colorHex = colorData?.colorHex || '#00CED1';

  return `
🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨
🚨 CRITICAL: THIS IS A SEAMLESS OMBRE GRADIENT — NO HARD LINES 🚨
🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨

YOU MUST RENDER A SEAMLESS AIRBRUSH-STYLE OMBRE GRADIENT.

🎨 FADE COLORS:
• COLOR START: ${colorName} (${colorHex}) - FULL SATURATION
• COLOR END: BLACK (#000000) - PURE BLACK
• TRANSITION: IMPERCEPTIBLE BLEND — you should NOT be able to see where one color ends and the other begins

🔥 MANDATORY FADE BEHAVIOR (AIRBRUSH QUALITY):
• The car body MUST show a SEAMLESS GRADIENT like professional airbrush spray painting
• Colors BLEND IMPERCEPTIBLY — like ombre hair dye or a sunset sky
• The transition is SO SMOOTH you cannot identify the exact point where colors change
• Think: continuous color spectrum, NOT separate regions
• The fade spans AT LEAST 40% of the vehicle length — NO short, abrupt transitions

🚫 HARD LINE / EDGE DETECTION (CRITICAL FAILURE):
🚫 If there is ANY visible line, edge, or boundary where colors meet = INVALID
🚫 If you can draw a line where "color stops and black starts" = INVALID
🚫 If the transition looks like two paint colors meeting = INVALID
🚫 If the fade looks like a hard split or two-tone with a seam = INVALID
🚫 NO HARD EDGES, NO VISIBLE BOUNDARIES, NO LINES ANYWHERE

❌ FAILURE CONDITIONS - IF ANY ARE TRUE, REGENERATE:
❌ DO NOT RENDER A SOLID COLOR CAR
❌ DO NOT RENDER A HARD TWO-TONE SPLIT (no visible line where colors meet)
❌ DO NOT CREATE DISTINCT ZONES WITH EDGES
❌ IF YOU CAN SEE WHERE THE COLOR "STOPS" = FAILURE
❌ THE BLEND MUST BE IMPERCEPTIBLE AND CONTINUOUS

✅ SUCCESS VALIDATION (SMOOTHNESS CHECK):
✅ Is the transition SO SMOOTH you cannot identify the exact boundary?
✅ Does it look like AIRBRUSHED SPRAY PAINT — colors misting into each other?
✅ Could you NOT draw a line showing "where ${colorName} ends and black begins"?
✅ Does it look like a sunset gradient or ombre hair — completely blended?

IF YOU CAN SEE A HARD LINE OR EDGE ANYWHERE = REGENERATE!

🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨

${ASPECT_RATIO_REQUIREMENT}

${PHOTOREALISM_REQUIREMENT}

${FORBIDDEN_TEXT_WATERMARK_INSTRUCTIONS}

❌ NO TEXT RULE (CRITICAL):
❌ DO NOT add ANY text, watermarks, labels, or captions to the image
❌ DO NOT add branding overlays or logos
❌ The output must be a CLEAN CAR IMAGE with NO TEXT of any kind

${studioEnvironment}

${vehicleAxisLock}

${inkFusionInstructions}

🎨 FADEWRAPS™ - SEAMLESS AIRBRUSH OMBRE GRADIENT

${colorData?.isInkFusion ? `Apply a SEAMLESS OMBRE GRADIENT to this ${vehicle} using the InkFusion™ color specified above, fading imperceptibly to BLACK.` : `Apply a SEAMLESS OMBRE GRADIENT to this ${vehicle} based on the provided reference image.`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 WHAT IS A FADEWRAP - SEAMLESS AIRBRUSH BLEND 🔥
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A FadeWrap is a SEAMLESS OMBRE GRADIENT — like professional airbrush spray painting.
The colors mist and blend into each other with NO VISIBLE BOUNDARY.

THINK: 
• Sunset sky — colors transition imperceptibly
• Ombre hair dye — seamless blend from one hue to another
• Airbrush art — spray paint misting colors together

EXAMPLE: ${colorName} at one end gradually MISTS into BLACK at the other end.
- Start with ${colorName.toUpperCase()} at one end — FULL SATURATION
- Colors MIST and BLEND through an IMPERCEPTIBLE transition
- The mid-fade area shows MIXED HUES where you cannot tell if it's more color or more black
- End with BLACK at the other end — PURE BLACK
- The transition spans AT LEAST 40% of the vehicle — EXTENDED SOFT BLEND
- You CANNOT see where one color "stops" and the other "starts"

🚫 ABSOLUTELY NO:
🚫 Hard lines, edges, or visible boundaries
🚫 Two-tone split appearance (like masking tape was used)
🚫 Distinct color regions with seams between them
🚫 Any point where you can say "the color changes HERE"

${fadeStyleInstructions}

${directionInstructions}

📸 VIEW-SPECIFIC FADE ENFORCEMENT (${viewType?.toUpperCase() || cameraAngle?.toUpperCase() || 'SIDE'}):
${viewType === 'rear' || cameraAngle?.toLowerCase().includes('rear') ? `
🔴 REAR VIEW (HERO) — FADE MUST BE VISIBLE:
• Camera faces the REAR of the vehicle (trunk/tailgate faces camera)
• For front_back fade: REAR panels (trunk, rear bumper, rear quarters) are BLACK
• Sides of vehicle visible at edges show transition toward color at front
• The BLACK end of the fade is directly facing the camera
• Fade MUST be clearly visible — this is NOT a solid color render
` : viewType === 'top' || isTopView ? `
🔵 TOP VIEW — FADE MUST BE STRONG AND CLEAR:
• Camera is positioned DIRECTLY OVERHEAD at 90° angle
• FULL vehicle silhouette MUST be visible (hood, roof, trunk, all four corners)
• NO cropping of mirrors, bumpers, or any vehicle extremity
• Vehicle should fill ~80–85% of the frame — not tiny, not cropped
• For front_back fade: HOOD (top of image) = FULL, BRIGHT COLOR; TRUNK (bottom) = DEEP BLACK
• Mid-roof area MUST show a clear mid‑tone transition between color and black
• Gradient must span AT LEAST 70% of the roof length — no short, blunt fade band
• The fade MUST be the star of this view — clearly visible from above
` : viewType === 'front' ? `
🟢 FRONT VIEW — 3/4 FRONT WITH VISIBLE FADE:
• Camera faces the FRONT 3/4 of the vehicle (both headlamps visible)
• NOT a side view, NOT an overhead view
• For front_back fade: FRONT panels (hood, front bumper, front fenders) are FULL COLOR
• Sides of vehicle visible at edges show transition toward black at rear
• The COLOR end of the fade is directly facing the camera
• Fade MUST be clearly visible on side panels near the rear of the car
` : `
🟡 SIDE VIEW — FADE + CAMERA MUST BE CORRECT:
• Camera faces the TRUE SIDE of the vehicle (pure profile view, NOT overhead)
• Horizon line is straight, roof edge is a clean horizontal line — NO strong top-down perspective
• Roof should be a thin strip, NOT a large top surface like a drone shot
• For front_back fade: LEFT side of image (front) = FULL COLOR, RIGHT side (rear) = BLACK
• Fade flows HORIZONTALLY from LEFT to RIGHT in the image
• Hood, doors, quarters all show horizontal gradient progression
• This is the PRIMARY reference view for correct fade direction
• If the roof area is dominant like a top view, the render is INVALID — regenerate as pure side profile
`}

📷 CAMERA FRAMING RULES (MANDATORY):
• NO studio lights, softboxes, rigging, or equipment visible in frame
• Frame shows ONLY the vehicle and neutral studio floor/background
• Clean, professional showroom appearance — no distractions
• Vehicle is the SOLE focus of the image
${isTopView ? `• TOP VIEW: Camera at exact 90° overhead, full silhouette visible, no cropping` : ''}

CAMERA ANGLE: ${cameraAngle}

${glossFinish}

${glossInstructions}

WRAP INSTALLATION QUALITY:
- Professional vinyl wrap installation - perfectly smooth
- Zero bubbles, zero wrinkles, zero imperfections
- Wrap edges tucked and sealed perfectly
- SEAMLESS AIRBRUSH-QUALITY GRADIENT flows across all panels in ${gradientDirection} direction
- Color transition is IMPERCEPTIBLE — NO visible line, edge, or boundary where colors meet
- Gradient colors MIST into each other like spray paint — you cannot see where one ends
- The blend is so smooth it looks like the car was born this way
- MINIMUM TRANSITION WIDTH: 40% of vehicle length — no short, abrupt fades
- ${finish === 'gloss' ? 'Clear glossy laminate with depth and shine showing seamless gradient' : finish === 'satin' ? 'Silk-like satin surface showing seamless gradient' : 'Flat matte non-reflective surface showing seamless gradient'}

PANEL COVERAGE INSTRUCTIONS:
${addHood ? '✅ APPLY GRADIENT TO HOOD' : '❌ Hood remains ORIGINAL PAINT COLOR'}
${addFrontBumper ? '✅ APPLY GRADIENT TO FRONT BUMPER' : '❌ Front bumper remains ORIGINAL COLOR'}
${addRearBumper ? '✅ APPLY GRADIENT TO REAR BUMPER including rear hatch/tailgate' : '❌ Rear bumper remains ORIGINAL COLOR'}

Base kit includes: ${kitSize || 'Standard'} - Two full vehicle sides (doors, fenders, quarter panels)
${roofSize && roofSize !== 'none' ? `Roof: ${roofSize} - APPLY GRADIENT TO ENTIRE ROOF PANEL` : 'Roof: NOT INCLUDED - remains original paint'}
- NEVER wrap wheels, tires, or rims - these MUST remain original/black

🚫 NO TEXT RULE 🚫
DO NOT add ANY text, watermarks, logos, or branding to this image.
The render must be completely text-free.

⚡ ULTRA-HIGH RESOLUTION OUTPUT (MANDATORY):
• 4K output (3840×2160px minimum)
• Tack-sharp detail on all body panels
• No soft focus, no blur, no diffusion
• Professional automotive photography sharpness
• Every reflection crisp and defined
• HDR dynamic range for maximum contrast

OUTPUT: Ultra-photorealistic professional automotive photography showing ${vehicle} wrapped in smooth ${finish} finish gradient fade flowing ${gradientDirection}. Colors blend smoothly from [start color] to [end color] matching the provided swatch. MUST be EXACTLY 16:9 landscape (1792x1008 or 1920x1080). The gradient fade is the HERO of this image - make it PROMINENT, OBVIOUS, and BEAUTIFUL. Must be indistinguishable from a real photograph. NO TEXT.`
;
}
