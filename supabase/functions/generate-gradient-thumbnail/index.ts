import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { gradientName, startColor, endColor, direction } = await req.json();
    
    if (!gradientName) {
      return new Response(
        JSON.stringify({ error: "Missing gradientName" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Generating gradient thumbnail: ${gradientName} (${startColor} → ${endColor})`);

    // Build descriptive prompt for gradient
    const start = startColor || "vibrant color";
    const end = endColor || "black";
    const dir = direction || "vertical";
    
    const prompt = `Generate a high-quality gradient swatch tile for a vehicle wrap product called "${gradientName}". 

Requirements:
- 512x512 square image
- Smooth ${dir} gradient from ${start} to ${end}
- Professional vinyl wrap appearance with subtle texture
- Clean, modern look suitable for automotive applications
- The gradient should be dramatic and eye-catching
- Make it look like a real product swatch photo

Do NOT add any text, logos, or watermarks to the image.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate gradient thumbnail" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "No image generated" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generated gradient thumbnail for: ${gradientName}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl,
        gradientName 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in generate-gradient-thumbnail:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
