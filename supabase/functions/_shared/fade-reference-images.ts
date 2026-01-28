/**
 * FadeWraps Reference Image System
 * 
 * Provides visual reference images for fade direction guidance.
 * The AI ignores text prompts for directional instructions - it needs VISUAL REFERENCE.
 * These images show the correct fade direction for each style.
 * 
 * CRITICAL: All fades must be SEAMLESS AIRBRUSH-STYLE OMBRE — NO HARD LINES.
 */

// Gold standard reference image showing PERFECT seamless fade
// This image demonstrates the EXACT smoothness we want in all renders
// HARDCODED full Supabase URL to ensure it's ALWAYS passed to AI regardless of request origin
export const STANDARD_FADE_REFERENCE_URL = 'https://abgevylqeazbydrtovzp.supabase.co/storage/v1/object/public/renders/fade-reference-standard.png';

// The reference image color (teal) - AI should substitute with user's selected color
export const REFERENCE_IMAGE_COLOR = {
  name: 'Teal',
  hex: '#3CD5C8',
  description: 'The reference image shows teal-to-black fade. AI should substitute with user\'s selected color.'
};

// Canonical fade direction reference images
// These are real wrapped vehicle images showing correct fade patterns
export const FADE_REFERENCE_IMAGES: Record<string, {
  url: string;
  description: string;
  searchQuery: string;
}> = {
  // Front-to-back: Front is color, rear is black (like BMW X5 Nebula Cyan)
  'front_back': {
    url: '', // Will be populated by DataForSEO
    description: 'Seamless horizontal ombre: front of vehicle is full color, imperceptibly fades to black at rear — NO visible line',
    searchQuery: 'car vinyl wrap fade front to back gradient side view seamless ombre'
  },
  
  // Top-to-bottom: Roof is color, rockers are black (like Corvette)
  'top_bottom': {
    url: '',
    description: 'Seamless vertical ombre: roof/upper body is color, imperceptibly fades to black at lower body — NO visible line',
    searchQuery: 'car vinyl wrap two tone fade top bottom gradient seamless ombre'
  },
  
  // CrossFade: Color at front AND rear, black in middle
  'crossfade': {
    url: '',
    description: 'Seamless bi-directional ombre: color at front, imperceptibly fades to black in middle, imperceptibly fades back to color at rear',
    searchQuery: 'car wrap crossfade gradient black center fade seamless ombre'
  },
  
  // Diagonal: Front-top is color, rear-bottom is black
  'diagonal': {
    url: '',
    description: 'Seamless diagonal ombre: front-top corner is color, imperceptibly fades diagonally to black at rear-bottom',
    searchQuery: 'car vinyl wrap diagonal fade gradient seamless ombre'
  },
  
  // Standard (default to front_back behavior)
  'standard': {
    url: '',
    description: 'Seamless standard horizontal ombre from front color to rear black — NO visible transition line',
    searchQuery: 'car vinyl wrap fade front to back gradient side view seamless ombre'
  }
};

/**
 * Get reference image info for a fade style
 */
export function getFadeReferenceInfo(fadeStyle: string): typeof FADE_REFERENCE_IMAGES['front_back'] | null {
  const style = fadeStyle?.toLowerCase() || 'front_back';
  return FADE_REFERENCE_IMAGES[style] || FADE_REFERENCE_IMAGES['front_back'];
}

/**
 * Build color substitution instructions for the AI
 * The reference image uses teal, but AI should render with user's selected color
 */
export function buildColorSubstitutionPrompt(userColorHex: string, userColorName: string): string {
  return `
📸 COLOR SUBSTITUTION INSTRUCTIONS (CRITICAL):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The reference image shows a TEAL (${REFERENCE_IMAGE_COLOR.hex}) to BLACK fade.
YOUR render must use the SAME SMOOTHNESS but with DIFFERENT COLORS:

🎨 SUBSTITUTE COLORS:
• REFERENCE COLOR: Teal ${REFERENCE_IMAGE_COLOR.hex} → YOUR COLOR: ${userColorName} (${userColorHex})
• BLACK remains BLACK (#000000) — do not change
• MATCH the EXACT transition smoothness from the reference
• The only difference should be the COLOR — smoothness must be IDENTICAL

❌ DO NOT:
❌ Change the smoothness/gradient quality
❌ Add hard lines that aren't in the reference
❌ Make the transition sharper than the reference

✅ DO:
✅ Copy the EXACT gradient smoothness from the reference
✅ Only substitute ${REFERENCE_IMAGE_COLOR.name} → ${userColorName}
✅ Keep the imperceptible transition quality
`;
}

/**
 * Build the AI prompt section that tells the model to follow the reference image
 * CRITICAL: Emphasizes SEAMLESS AIRBRUSH OMBRE — NO HARD LINES
 * Now includes visual reference guidance with color substitution
 */
export function buildFadeReferencePromptSection(
  fadeStyle: string, 
  hasReferenceImage: boolean,
  userColorHex?: string,
  userColorName?: string
): string {
  const style = fadeStyle?.toLowerCase() || 'front_back';
  
  // Visual reference guidance section - always include if we have the standard reference
  const visualReferenceGuidance = userColorHex && userColorName ? `
📸 VISUAL REFERENCE GUIDANCE — GOLD STANDARD SMOOTHNESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A REFERENCE IMAGE showing PERFECT gradient smoothness is provided.
This is your "gold standard" — match this EXACT level of smoothness.

The reference shows: Teal (#3CD5C8) → Black fade
YOUR render must show: ${userColorName} (${userColorHex}) → Black fade

🎨 COLOR SUBSTITUTION RULES:
• Replace TEAL with ${userColorName} (${userColorHex})
• Keep BLACK as BLACK (#000000)
• MATCH the IDENTICAL smoothness — the transition quality must be the SAME
• The ONLY difference should be the color — NOT the gradient quality

✅ WHAT TO COPY FROM REFERENCE:
✅ The seamless, imperceptible transition
✅ The airbrush-quality blend where colors mist together
✅ The extended transition width (40%+ of vehicle)
✅ The professional "sunset sky" smoothness

❌ DO NOT:
❌ Create a sharper transition than the reference
❌ Add any hard lines that aren't in the reference
❌ Make the fade shorter or more abrupt
❌ Change the gradient quality in any way

If your output has MORE visible edges than the reference = INVALID
If your output has HARDER transitions than the reference = INVALID
Match the reference smoothness EXACTLY, only change the color.
` : '';
  
  // Common smoothness requirements for ALL fade styles
  const smoothnessRequirements = `
🚫 HARD LINE DETECTION — CRITICAL FAILURE CONDITIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 If there is ANY visible line, edge, or boundary where colors meet = INVALID
🚫 If you can draw a line showing "where color stops and black starts" = INVALID
🚫 If it looks like two-tone with masking tape was used = INVALID
🚫 If the transition is short/abrupt instead of extended = INVALID

The reference image shows a SEAMLESS AIRBRUSH OMBRE.
Your output must match this SMOOTHNESS — like sunset sky, ombre hair dye.
Colors MIST into each other with NO VISIBLE BOUNDARY.
The transition spans at least 40% of the vehicle — EXTENDED soft blend.
`;
  
  const referenceInstructions: Record<string, string> = {
    'front_back': `
🔒 FADE DIRECTION REFERENCE — SEAMLESS FRONT-TO-REAR OMBRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A reference image showing the CORRECT seamless fade is attached.

YOU MUST MATCH the SMOOTHNESS in this reference image:
• In the reference: FRONT of vehicle = FULL COLOR
• In the reference: REAR of vehicle = BLACK
• The fade is SEAMLESS AIRBRUSH STYLE — colors MIST into each other
• You CANNOT see where one color "stops" and the other "starts"
• The transition spans at least 40% of the vehicle length

❌ IF YOUR OUTPUT SHOWS A HARD LINE WHERE COLORS MEET = WRONG
❌ IF YOUR OUTPUT SHOWS TOP-TO-BOTTOM FADE = WRONG
❌ IF YOUR OUTPUT SHOWS SHORT/ABRUPT TRANSITION = WRONG
❌ IF YOU CAN DRAW A LINE SHOWING "WHERE COLOR ENDS" = WRONG

✅ Your output MUST be seamless airbrush ombre — NO visible edge
✅ Hood/front bumper = COLOR (full saturation)
✅ Mid-body = IMPERCEPTIBLE BLEND (mixed hues)
✅ Trunk/rear bumper = BLACK (pure black)
✅ The transition is SO SMOOTH you cannot identify the boundary
${smoothnessRequirements}`,

    'top_bottom': `
🔒 FADE DIRECTION REFERENCE — SEAMLESS TOP-TO-BOTTOM OMBRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A reference image showing the CORRECT seamless fade is attached.

YOU MUST MATCH the SMOOTHNESS in this reference image:
• In the reference: ROOF/UPPER BODY = FULL COLOR
• In the reference: ROCKERS/LOWER BODY = BLACK
• The fade is SEAMLESS AIRBRUSH STYLE — colors MIST into each other
• The transition flows VERTICALLY with NO visible boundary

❌ IF YOUR OUTPUT SHOWS A HARD LINE AT BELTLINE = WRONG
❌ IF YOUR OUTPUT SHOWS FRONT-TO-BACK FADE = WRONG
❌ IF YOU CAN SEE WHERE "COLOR STOPS" = WRONG

✅ Your output MUST be seamless airbrush ombre — NO visible edge
✅ Roof/pillars/upper doors = COLOR
✅ Mid-door = IMPERCEPTIBLE BLEND
✅ Rockers/lower panels = BLACK
${smoothnessRequirements}`,

    'crossfade': `
🔒 FADE DIRECTION REFERENCE — SEAMLESS CROSSFADE BI-DIRECTIONAL OMBRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A reference image showing the CORRECT seamless CrossFade pattern is attached.

YOU MUST MATCH the SMOOTHNESS in this reference image:
• FRONT of vehicle = FULL COLOR — MISTS toward center
• MIDDLE of vehicle = BLACK CORE — colors have MISTED to black
• REAR of vehicle = FULL COLOR — MISTED from center black
• BOTH transitions are SEAMLESS AIRBRUSH STYLE — NO visible edges

❌ IF YOUR OUTPUT SHOWS HARD EDGES AT BLACK ZONE BOUNDARIES = WRONG
❌ IF YOUR OUTPUT SHOWS ONLY FRONT-TO-BACK = WRONG
❌ IF YOU CAN SEE "LINES" WHERE COLOR MEETS BLACK = WRONG

✅ Your output MUST show seamless bi-directional ombre
✅ Hood/front = COLOR (full saturation)
✅ Center doors = BLACK (seamlessly misted from both ends)
✅ Trunk/rear = COLOR (full saturation)
✅ BOTH transitions are imperceptible airbrush blends
${smoothnessRequirements}`,

    'diagonal': `
🔒 FADE DIRECTION REFERENCE — SEAMLESS DIAGONAL OMBRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A reference image showing the CORRECT seamless diagonal fade is attached.

YOU MUST MATCH the SMOOTHNESS in this reference image:
• FRONT-TOP corner = FULL COLOR
• REAR-BOTTOM corner = BLACK
• The fade cuts diagonally with SEAMLESS AIRBRUSH transition
• NO visible diagonal line or edge — colors MIST into each other

❌ IF YOUR OUTPUT SHOWS A HARD DIAGONAL LINE = WRONG
❌ IF YOUR OUTPUT SHOWS HORIZONTAL OR VERTICAL FADE = WRONG
❌ IF YOU CAN SEE WHERE COLORS MEET = WRONG

✅ Your output MUST show seamless diagonal ombre sweep
✅ The 45-degree transition is imperceptible airbrush blend
${smoothnessRequirements}`
  };

  // Combine visual reference guidance with direction instructions
  let result = visualReferenceGuidance;
  
  if (hasReferenceImage) {
    result += '\n\n' + (referenceInstructions[style] || referenceInstructions['front_back']);
  }
  
  return result;
}

/**
 * Get the standard fade reference image URL for inclusion in AI prompts
 */
export function getStandardFadeReferenceUrl(): string {
  // Return the public URL path that will be converted to full URL by the caller
  return STANDARD_FADE_REFERENCE_URL;
}
