// Deterministic Fade Specification System
// Converts UI fade style selection into explicit, locked render parameters
// NO AI guessing — all fade parameters are explicitly defined
// EMPHASIS: SEAMLESS AIRBRUSH GRADIENTS — NO HARD LINES

export type FadeStyleKey = "front_back" | "top_bottom" | "diagonal" | "crossfade";

export interface FadeSpec {
  fadeCoordinateSpace: "vehicle";
  fadeAxis: "longitudinal" | "vertical" | "diagonal";
  fadeStart: string;
  fadeEnd: string;
  fadeContinuity: "continuous";
  fadeProfile: "smooth-exponential" | "crossfade-exponential";
  minTransitionWidth: number; // Minimum % of vehicle length for fade transition
  blendCurve: "gaussian" | "exponential";
  midBlackWidth?: number;
  blackFeather?: number;
  prompt: string;
}

export interface StudioLock {
  studioEnvironment: "flat-studio";
  disableCyclorama: boolean;
  disableCurvedBackdrop: boolean;
  floorMaterial: "textured-concrete";
  wallColor: string;
  contactShadows: boolean;
  outputResolution: "4k";
  minWidth: number;
  minHeight: number;
  allowTextOverlay: boolean;
  allowWatermark: boolean;
}

/**
 * Builds deterministic fade specifications from UI selection
 * NO AI interpretation — all parameters are explicit
 * EMPHASIS: Seamless airbrush-style blends with NO hard lines
 */
export function buildFadeSpec(fadeStyle: FadeStyleKey): FadeSpec {
  switch (fadeStyle) {
    case "front_back":
      return {
        fadeCoordinateSpace: "vehicle",
        fadeAxis: "longitudinal",
        fadeStart: "front",
        fadeEnd: "rear",
        fadeContinuity: "continuous",
        fadeProfile: "smooth-exponential",
        minTransitionWidth: 0.40, // 40% minimum transition zone
        blendCurve: "gaussian",
        prompt: `🔒 FADE: SEAMLESS AIRBRUSH FRONT-TO-REAR OMBRE (NO HARD LINES)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
fadeCoordinateSpace: VEHICLE (not screen)
fadeAxis: LONGITUDINAL (front-to-rear)
fadeStart: FRONT (hood, front bumper, front fenders)
fadeEnd: REAR (trunk, rear bumper, rear quarters)
fadeProfile: SMOOTH-EXPONENTIAL (Gaussian-like falloff)
fadeContinuity: CONTINUOUS — seamless across all panels
minTransitionWidth: 40% of vehicle length

🎨 SEAMLESS BLEND REQUIREMENTS:
• 100% FULL COLOR at front (hood, front bumper, front fenders)
• IMPERCEPTIBLE TRANSITION through mid-body — colors MIST into each other
• The center of the fade shows MIXED HUES where you cannot tell if it's more color or more black
• 100% BLACK (#000000) at rear (trunk, rear bumper, rear quarters)
• Transition spans AT LEAST 40% of vehicle length — EXTENDED soft blend

🚫 HARD LINE DETECTION (CRITICAL FAILURE):
🚫 If there is ANY visible line where colors meet = INVALID
🚫 If you can identify the exact point where "color stops" = INVALID
🚫 If it looks like two-tone with masking tape = INVALID
🚫 If the transition is short/abrupt (less than 40% of body) = INVALID

✅ SUCCESS: Seamless airbrush ombre — you CANNOT see where one color ends`
      };

    case "top_bottom":
      return {
        fadeCoordinateSpace: "vehicle",
        fadeAxis: "vertical",
        fadeStart: "top",
        fadeEnd: "bottom",
        fadeContinuity: "continuous",
        fadeProfile: "smooth-exponential",
        minTransitionWidth: 0.40,
        blendCurve: "gaussian",
        prompt: `🔒 FADE: SEAMLESS AIRBRUSH TOP-TO-BOTTOM OMBRE (NO HARD LINES)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
fadeCoordinateSpace: VEHICLE (not screen)
fadeAxis: VERTICAL (roof-to-rockers)
fadeStart: TOP (roof, upper pillars)
fadeEnd: BOTTOM (rockers, lower body)
fadeProfile: SMOOTH-EXPONENTIAL (Gaussian-like falloff)
fadeContinuity: CONTINUOUS — seamless across all panels
minTransitionWidth: 40% of vehicle height

🎨 SEAMLESS BLEND: Color at roof MISTS imperceptibly to black at rockers.
The transition is SO SMOOTH you cannot see where colors meet.
🚫 NO visible line, edge, or boundary — pure airbrush blend.`
      };

    case "diagonal":
      return {
        fadeCoordinateSpace: "vehicle",
        fadeAxis: "diagonal",
        fadeStart: "front_top",
        fadeEnd: "rear_bottom",
        fadeContinuity: "continuous",
        fadeProfile: "smooth-exponential",
        minTransitionWidth: 0.40,
        blendCurve: "gaussian",
        prompt: `🔒 FADE: SEAMLESS AIRBRUSH DIAGONAL OMBRE (NO HARD LINES)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
fadeCoordinateSpace: VEHICLE (not screen)
fadeAxis: DIAGONAL (combines longitudinal + vertical)
fadeStart: FRONT-TOP (hood/roof intersection)
fadeEnd: REAR-BOTTOM (lower rear panels)
fadeProfile: SMOOTH-EXPONENTIAL (Gaussian-like falloff)
fadeContinuity: CONTINUOUS — seamless across all panels

🎨 SEAMLESS BLEND: 45-degree diagonal sweep with IMPERCEPTIBLE transition.
Colors MIST into each other — no visible boundary or edge.
🚫 NO hard diagonal line — pure airbrush gradient sweep.`
      };

    case "crossfade":
      return {
        fadeCoordinateSpace: "vehicle",
        fadeAxis: "longitudinal",
        fadeStart: "front",
        fadeEnd: "rear",
        fadeContinuity: "continuous",
        fadeProfile: "crossfade-exponential",
        minTransitionWidth: 0.25, // Each transition zone
        blendCurve: "exponential",
        midBlackWidth: 0.28,
        blackFeather: 0.18,
        prompt: `🔒 FADE: CROSSFADE™ SEAMLESS BI-DIRECTIONAL OMBRE (NO HARD LINES)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
fadeCoordinateSpace: VEHICLE (not screen)
fadeAxis: LONGITUDINAL (front-to-rear)
fadeProfile: CROSSFADE-EXPONENTIAL (NOT linear)
blendCurve: EXPONENTIAL with Gaussian feathering
midBlackWidth: 0.28
blackFeather: 0.18

🎨 SEAMLESS BLEND MODEL:
• FRONT: Full color 100% — MISTS toward center
• FRONT-MID: Seamless exponential blend toward black (no visible edge)
• CENTER: Deep black core — colors have MISTED to pure black
• MID-REAR: Seamless exponential blend from black toward color
• REAR: Full color 100% — MISTED from center black

🚫 HARD LINE DETECTION (CRITICAL FAILURE):
🚫 NO visible line where color meets black — anywhere
🚫 The transitions must be IMPERCEPTIBLE airbrush blends
🚫 If you can see "edges" of the black zone = INVALID

✅ SUCCESS: Full color at BOTH ends, seamless black center — like airbrush art`
      };
  }
}

/**
 * Creates locked studio environment parameters
 * Prevents drift back to cyclorama/white backgrounds
 */
export function buildStudioLock(): StudioLock {
  return {
    studioEnvironment: "flat-studio",
    disableCyclorama: true,
    disableCurvedBackdrop: true,
    floorMaterial: "textured-concrete",
    wallColor: "#E6E6E6",
    contactShadows: true,
    outputResolution: "4k",
    minWidth: 4096,
    minHeight: 2304,
    allowTextOverlay: false,
    allowWatermark: false
  };
}

/**
 * Formats studio lock as prompt constraint block
 */
export function formatStudioLockPrompt(lock: StudioLock): string {
  return `
🔒 STUDIO ENVIRONMENT — LOCKED (NON-NEGOTIABLE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• studioEnvironment: ${lock.studioEnvironment}
• Floor: Dark textured concrete (#2a2a2a), FLAT plane, NO curves
• Walls: Light gray (${lock.wallColor}), FLAT, NO cyclorama dome
• disableCyclorama: ${lock.disableCyclorama} — NO curved floor/wall transitions
• disableCurvedBackdrop: ${lock.disableCurvedBackdrop} — NO rounded edges anywhere
• Output: 4K minimum (${lock.minWidth}x${lock.minHeight})
• NO TEXT/WATERMARKS in image (client overlay handles branding)

⚠️ FLAT CONTINUOUS FLOOR ONLY — no circular pads, no cyclorama cutouts
`;
}

/**
 * Formats fade spec as prompt constraint block
 * EMPHASIS: Seamless airbrush blends with NO hard lines
 */
export function formatFadeSpecPrompt(spec: FadeSpec): string {
  return `
🔒 FADE DIRECTION — SEAMLESS AIRBRUSH OMBRE (NO HARD LINES)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• fadeCoordinateSpace: ${spec.fadeCoordinateSpace}
• fadeAxis: ${spec.fadeAxis}
• fadeStart: ${spec.fadeStart}
• fadeEnd: ${spec.fadeEnd}
• fadeProfile: ${spec.fadeProfile} (Gaussian-like smooth falloff)
• fadeContinuity: ${spec.fadeContinuity}
• blendCurve: ${spec.blendCurve} — colors MIST into each other
• minTransitionWidth: ${spec.minTransitionWidth * 100}% of vehicle — EXTENDED soft blend
${spec.midBlackWidth ? `• midBlackWidth: ${spec.midBlackWidth}` : ''}
${spec.blackFeather ? `• blackFeather: ${spec.blackFeather}` : ''}

🚫 CRITICAL: NO HARD LINES, NO VISIBLE EDGES, NO BOUNDARIES
The transition must be IMPERCEPTIBLE — like airbrush spray paint.

${spec.prompt}
`;
}
