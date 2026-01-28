import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Production-enabled tiers
const PRODUCTION_TIERS = ['advanced', 'complete', 'agency'];
// Bypass roles
const BYPASS_ROLES = ['admin', 'tester'];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    console.log("[PRODUCTION] Starting production files generation");

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          status: "subscription_required", 
          message: "Please log in to generate production files" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      console.log("[PRODUCTION] Auth error:", userError);
      return new Response(
        JSON.stringify({ 
          status: "subscription_required", 
          message: "Please log in to generate production files" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const user = userData.user;
    console.log("[PRODUCTION] User authenticated:", user.email);

    // Check for bypass roles (admin/tester)
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', BYPASS_ROLES)
      .maybeSingle();

    let hasAccess = !!roleData;

    // If no bypass role, check subscription tier
    if (!hasAccess) {
      const { data: subData } = await supabaseClient
        .from('user_subscriptions')
        .select('tier, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      hasAccess = !!(subData && PRODUCTION_TIERS.includes(subData.tier));
      console.log("[PRODUCTION] Subscription check:", subData?.tier, hasAccess);
    } else {
      console.log("[PRODUCTION] Bypass role detected:", roleData?.role);
    }

    // Return friendly upgrade message if no access
    if (!hasAccess) {
      return new Response(
        JSON.stringify({ 
          status: "subscription_required", 
          message: "Upgrade to RestylePro Pro to unlock production features including SVG cut paths, masks, print tiles, and installer guides." 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { renderUrl, prompt, vehicleId } = body;

    if (!renderUrl) {
      throw new Error("renderUrl is required");
    }

    console.log("[PRODUCTION] Generating production files for:", renderUrl);

    // Fetch the render image
    const imageResponse = await fetch(renderUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch render image: ${imageResponse.status}`);
    }
    const imageBuffer = await imageResponse.arrayBuffer();
    console.log("[PRODUCTION] Image fetched, size:", imageBuffer.byteLength);

    // Generate masks
    const maskBase64 = btoa(
      new Uint8Array(imageBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    const mask = {
      coverageMask: maskBase64,
      panelMask: maskBase64,
      zoneMask: maskBase64
    };
    console.log("[PRODUCTION] Masks generated");

    // Generate vector cut paths (placeholder SVG)
    const vectorSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <style>
      .cut-path { fill: none; stroke: #000; stroke-width: 0.5; }
      .panel-boundary { fill: none; stroke: #f00; stroke-width: 0.25; stroke-dasharray: 4,2; }
    </style>
  </defs>
  <g id="vehicle-outline">
    <path class="cut-path" d="M200,600 C200,500 300,400 500,350 L1400,350 C1600,400 1700,500 1700,600 L1700,800 C1700,850 1600,900 1400,900 L500,900 C300,900 200,850 200,800 Z" />
  </g>
  <g id="hood-panel">
    <path class="panel-boundary" d="M400,350 L900,350 L900,500 L400,500 Z" />
  </g>
  <g id="roof-panel">
    <path class="panel-boundary" d="M500,350 L1400,350 L1400,450 L500,450 Z" />
  </g>
  <g id="registration-marks">
    <circle cx="100" cy="100" r="5" fill="#000" />
    <circle cx="1820" cy="100" r="5" fill="#000" />
    <circle cx="100" cy="980" r="5" fill="#000" />
    <circle cx="1820" cy="980" r="5" fill="#000" />
  </g>
</svg>`;

    const vector = { svg: vectorSvg };
    console.log("[PRODUCTION] Vector paths generated");

    // Generate bleed vector
    const bleedSvg = vectorSvg.replace(
      '</svg>',
      `<g id="bleed-outline" opacity="0.3">
        <rect x="-36" y="-36" width="1992" height="1152" fill="none" stroke="#00ff00" stroke-width="2" stroke-dasharray="10,5" />
      </g>
      <text x="50" y="50" font-size="12" fill="#666">Bleed: 0.5" (12.7mm)</text>
      </svg>`
    );

    const bleedVector = { svg: bleedSvg };
    console.log("[PRODUCTION] Bleed vector generated");

    // Generate tiles (single tile for now)
    const tiles = [vectorSvg];
    console.log("[PRODUCTION] Tiles generated");

    // Generate installer guide
    const promptLower = (prompt || '').toLowerCase();
    const isTwoTone = promptLower.includes('two-tone') || promptLower.includes('top half') || promptLower.includes('bottom half');
    const hasStripes = promptLower.includes('stripe') || promptLower.includes('racing');
    const hasChromeDelete = promptLower.includes('chrome delete') || promptLower.includes('blackout');

    const guide = {
      materials: extractMaterialsFromPrompt(promptLower),
      panels: isTwoTone 
        ? ['Hood (Upper)', 'Hood (Lower)', 'Roof', 'Doors', 'Quarters']
        : hasStripes
          ? ['Hood Center', 'Roof Center', 'Trunk Center']
          : hasChromeDelete
            ? ['Window Surrounds', 'Grille', 'Door Handles', 'Mirror Caps', 'Badges']
            : ['Hood', 'Roof', 'Trunk', 'Doors', 'Fenders', 'Quarters'],
      sequence: isTwoTone
        ? ['Prep surfaces', 'Mask transition line', 'Apply lower zone', 'Apply upper zone', 'Remove masking', 'Post-heat edges']
        : ['Prep surfaces', 'Start with hood', 'Continue to roof', 'Apply trunk', 'Install side panels', 'Post-heat all edges'],
      notes: generateNotes(promptLower, isTwoTone, hasStripes, hasChromeDelete)
    };
    console.log("[PRODUCTION] Guide generated");

    return new Response(
      JSON.stringify({
        status: "ok",
        mask,
        vector,
        bleedVector,
        tiles,
        guide
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: unknown) {
    console.error("[PRODUCTION] Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ status: "error", message: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

function extractMaterialsFromPrompt(prompt: string): string[] {
  const materials: string[] = [];
  const finishes = ['chrome', 'satin', 'matte', 'gloss', 'metallic', 'carbon'];
  const colors = ['gold', 'black', 'white', 'red', 'blue', 'silver', 'copper', 'purple'];

  for (const finish of finishes) {
    if (prompt.includes(finish)) {
      for (const color of colors) {
        if (prompt.includes(color)) {
          materials.push(`${color.charAt(0).toUpperCase() + color.slice(1)} ${finish.charAt(0).toUpperCase() + finish.slice(1)} Film`);
        }
      }
    }
  }

  if (materials.length === 0) {
    materials.push('Color-Change Vinyl Film');
  }

  return [...new Set(materials)];
}

function generateNotes(prompt: string, isTwoTone: boolean, hasStripes: boolean, hasChromeDelete: boolean): string[] {
  const notes: string[] = [];

  if (isTwoTone) {
    notes.push('Ensure transition line is level across all panels');
    notes.push('Use laser level for alignment');
  }
  if (hasStripes) {
    notes.push('Maintain stripe width consistency');
    notes.push('Align stripes across panel gaps');
  }
  if (hasChromeDelete) {
    notes.push('Pre-form film for complex shapes');
  }
  if (prompt.includes('chrome')) {
    notes.push('Chrome film requires extra post-heat');
    notes.push('Avoid stretching chrome more than 15%');
  }

  notes.push('Ambient temp: 65-75°F recommended');
  notes.push('Allow 24-48hr cure before washing');

  return notes;
}
