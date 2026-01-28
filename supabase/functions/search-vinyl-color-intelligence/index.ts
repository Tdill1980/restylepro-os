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
    const { manufacturer, colorName, finishType, userProvidedHex } = await req.json();
    
    if (!manufacturer || !colorName) {
      throw new Error('Manufacturer and color name are required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('🔍 Searching color intelligence for:', { manufacturer, colorName, finishType, userProvidedHex });

    // Call Lovable AI to reason about this specific vinyl color
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: `You are a vinyl wrap expert with access to thousands of professional installation photos, manufacturer product sheets, and real-world wrapped vehicles.

TASK: Analyze this specific vinyl product and return REAL-WORLD color intelligence.

MANUFACTURER: ${manufacturer}
COLOR NAME: ${colorName}
FINISH TYPE: ${finishType || 'unknown'}
USER PROVIDED HEX: ${userProvidedHex || 'not provided'}

🔍 SEARCH YOUR TRAINING DATA:
- Look for professional installation photos of this EXACT manufacturer color
- Reference Metro Restyling, Fellers, manufacturer websites
- Find real vehicles wrapped in this product
- Analyze how this color appears on actual wrapped cars in daylight photos

🎨 COLOR INTELLIGENCE TO RETURN:
1. TRUE HEX COLOR: What hex code best matches how this vinyl looks on REAL vehicles (not just manufacturer swatch)?
   - If user provided hex is wildly inaccurate (e.g., dark when product is bright), CORRECT it
   - Example: If user says #660099 for "Super Chrome Purple" but real product is bright metallic purple, return #7B2D8E instead

2. FINISH DETECTION: Detect special finishes from color name keywords:
   - "chrome", "mirror", "super chrome" → chrome finish
   - "metallic", "metal flake" → metallic finish  
   - "pearl", "iridescent" → pearl finish
   - "matte", "flat" → matte finish
   - "satin", "semi-gloss" → satin finish
   - Otherwise → gloss finish

3. METALLIC PROPERTIES:
   - Does this vinyl have metallic flakes? (micro/small/medium/large)
   - Pearl or iridescent effects?
   - Chrome or mirror-like reflectivity?

4. REAL-WORLD APPEARANCE DESCRIPTION:
   Write 2-3 sentences describing HOW THIS VINYL LOOKS on actual wrapped vehicles.
   - Visual intensity (bright, vivid, dark, subtle?)
   - Special effects (sparkle, color shift, mirror-like?)
   - Professional installation reference ("like you see on high-end exotics", "popular for commercial fleets")

5. CONFIDENCE SCORE: How confident are you in this color intelligence? (0.0-1.0)
   - 0.9-1.0: Exact product match found in training data
   - 0.7-0.89: Strong familiarity with this manufacturer line
   - 0.5-0.69: General understanding of color family
   - <0.5: Limited data available

CRITICAL COLOR ACCURACY RULES:
- Teal/Cyan/Turquoise colors (#00A0A0 to #20E0E0) must be BRIGHT electric blue-green, NOT dark blue
- Chrome colors must have high brightness (80-90%) and metallic properties
- Metallic colors must show prominent visible flake effects
- If user hex seems wrong vs. product name, CORRECT it based on real product appearance

Return ONLY valid JSON:
{
  "correctedHex": "#RRGGBB",
  "detectedFinish": "gloss|satin|matte|chrome|metallic|pearl",
  "hasMetallicFlakes": true|false,
  "flakeLevel": "none|micro|small|medium|large",
  "hasPearl": true|false,
  "isChrome": true|false,
  "realWorldDescription": "How this vinyl looks on actual vehicles (2-3 sentences)",
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation of color intelligence source"
}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ AI API error:', response.status, errorText);
      throw new Error(`AI API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    console.log('🤖 AI Response:', aiResponse);

    // Parse JSON from AI response
    let intelligence;
    try {
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                       aiResponse.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiResponse;
      intelligence = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      throw new Error('Failed to parse AI response as JSON');
    }

    console.log('✅ Color intelligence complete:', intelligence);

    return new Response(
      JSON.stringify({
        success: true,
        intelligence: {
          correctedHex: intelligence.correctedHex || userProvidedHex || '#000000',
          detectedFinish: intelligence.detectedFinish || finishType || 'gloss',
          hasMetallicFlakes: intelligence.hasMetallicFlakes || false,
          flakeLevel: intelligence.flakeLevel || 'none',
          hasPearl: intelligence.hasPearl || false,
          isChrome: intelligence.isChrome || false,
          realWorldDescription: intelligence.realWorldDescription || '',
          confidence: intelligence.confidence || 0.5,
          reasoning: intelligence.reasoning || ''
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in search-vinyl-color-intelligence:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
