import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { manufacturer, colorName } = await req.json();
    
    if (!manufacturer || !colorName) {
      return new Response(
        JSON.stringify({ error: "Missing manufacturer or colorName" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Fetching hex for: ${manufacturer} - ${colorName}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a vinyl wrap film color database expert. Your job is to return the EXACT official hex color code that represents a specific vinyl wrap film color from a manufacturer's color chart.

RULES:
- Only return colors from ACTUAL manufacturer color charts (3M, Avery Dennison, Hexis, KPMF, Oracal, Arlon, VViViD, TeckWrap, Inozetek, etc.)
- DO NOT GUESS or approximate colors
- If you are not 100% certain of the exact hex code, return "NOT_FOUND"
- Respond ONLY with a hex code like #RRGGBB - no extra text, no explanation
- Consider the full color name including any finish descriptors (Gloss, Matte, Satin, Metallic, etc.)`
          },
          {
            role: "user",
            content: `What is the exact hex color code for this vinyl wrap film?

Manufacturer: ${manufacturer}
Film Color Name: ${colorName}

Return ONLY the hex code (e.g., #1A2B3C) or "NOT_FOUND" if you cannot determine the exact color.`
          }
        ],
        temperature: 0.1,
        max_tokens: 20
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ hex: "NOT_FOUND", error: "AI gateway error" }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "";
    
    console.log(`AI returned: ${content} for ${manufacturer} - ${colorName}`);

    // Validate hex format
    const hexMatch = content.match(/^#[0-9A-Fa-f]{6}$/);
    if (hexMatch) {
      return new Response(
        JSON.stringify({ hex: hexMatch[0].toUpperCase() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ hex: "NOT_FOUND" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in get-vinyl-hex:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ hex: "NOT_FOUND", error: errorMessage }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
