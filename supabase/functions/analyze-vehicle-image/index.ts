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
    const { imageData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing vehicle image with AI...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a vehicle identification expert. Analyze images of vehicles and extract:
- Vehicle Make (manufacturer brand)
- Vehicle Model (specific model name)
- Vehicle Year (if visible from body style/design, otherwise return empty string)
- Primary Color (the main wrap/paint color)
- Finish Type (gloss, matte, satin, or metallic)

Return ONLY valid JSON in this exact format:
{
  "make": "Ford",
  "model": "Raptor",
  "year": "2022",
  "color": "Blue",
  "finish": "gloss"
}

If you cannot identify something with confidence, use an empty string "". Be specific with make/model (e.g., "Ford F-150 Raptor" should be Make: "Ford", Model: "Raptor").`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this vehicle image and identify the make, model, year (if determinable), color, and finish type."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    
    console.log("AI raw response:", aiResponse);

    // Parse the JSON response
    let vehicleData;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                       aiResponse.match(/```\n([\s\S]*?)\n```/) ||
                       [null, aiResponse];
      vehicleData = JSON.parse(jsonMatch[1] || aiResponse);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      throw new Error("AI response was not valid JSON");
    }

    console.log("Extracted vehicle data:", vehicleData);

    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          make: vehicleData.make || "",
          model: vehicleData.model || "",
          year: vehicleData.year || "",
          color: vehicleData.color || "",
          finish: vehicleData.finish || "gloss"
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error in analyze-vehicle-image:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
