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
    const { referenceImages, manufacturer, colorName, productCode, userProvidedHex } = await req.json();
    
    if (!referenceImages || !Array.isArray(referenceImages) || referenceImages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'referenceImages array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log(`Validating color from ${referenceImages.length} reference images`);

    // Construct AI prompt for color validation
    const prompt = `You are analyzing real professional vehicle wrap installation photos to extract TRUE vinyl color data.

VINYL PRODUCT:
- Manufacturer: ${manufacturer}
- Color Name: ${colorName}
${productCode ? `- Product Code: ${productCode}` : ''}
${userProvidedHex ? `- User Provided Hex: ${userProvidedHex}` : ''}

TASK:
Analyze these REAL professional installation photos and extract:
1. TRUE HEX COLOR as it appears on the actual wrapped vehicle
2. FINISH TYPE (Gloss, Satin, or Matte) - look at surface reflections and sheen
3. METALLIC detection - does it have visible metallic flakes/sparkle?
4. CONFIDENCE SCORE (0.0 to 1.0) - how confident are you in the color extraction?

CRITICAL RULES:
- Extract the ACTUAL color you see on the wrapped vehicle surface
- For bright colors (teal, cyan, neon, etc.), maintain FULL SATURATION and HIGH BRIGHTNESS
- For metallic finishes, confirm visible sparkle and flake presence
- The hex code MUST match what you actually see in the photos, not theoretical color names
- If photos show inconsistent colors, use the most common/dominant color across images

Return ONLY valid JSON:
{
  "hexCode": "#RRGGBB",
  "finish": "Gloss|Satin|Matte",
  "hasMetallicFlakes": true|false,
  "confidence": 0.0-1.0,
  "reasoning": "Explain what you see in the photos and why you chose this hex"
}`;

    // Prepare messages with images
    const imageContent = referenceImages.map((img: any) => ({
      type: "image_url",
      image_url: { url: img.url }
    }));

    const messages = [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          ...imageContent
        ]
      }
    ];

    // Call Lovable AI with Gemini Vision
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      throw new Error(`AI validation failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error('No response from AI');
    }

    console.log('AI validation response:', aiContent);

    // Parse JSON response
    let validatedData;
    try {
      // Remove markdown code blocks if present
      const cleanContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      validatedData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      throw new Error('AI returned invalid JSON format');
    }

    // Validate response structure
    if (!validatedData.hexCode || !validatedData.finish || typeof validatedData.confidence !== 'number') {
      throw new Error('AI response missing required fields');
    }

    return new Response(
      JSON.stringify({
        success: true,
        validated: {
          hexCode: validatedData.hexCode,
          finish: validatedData.finish,
          hasMetallicFlakes: validatedData.hasMetallicFlakes || false,
          confidence: validatedData.confidence,
          reasoning: validatedData.reasoning,
        },
        originalInput: {
          manufacturer,
          colorName,
          productCode,
          userProvidedHex,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in validate-vinyl-color-from-images:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
