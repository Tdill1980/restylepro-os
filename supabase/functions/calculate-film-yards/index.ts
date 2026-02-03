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
    const { vehicleYear, vehicleMake, vehicleModel } = await req.json();

    if (!vehicleYear || !vehicleMake || !vehicleModel) {
      throw new Error('Missing required vehicle information');
    }

    const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
    if (!GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY not configured');
    }

    console.log(`Calculating yards for: ${vehicleYear} ${vehicleMake} ${vehicleModel}`);

    const prompt = `You are a professional vinyl wrap installer calculating linear yards AND square footage needed for a full vehicle wrap.

Vehicle: ${vehicleYear} ${vehicleMake} ${vehicleModel}

Standard vinyl film width: 60 inches

Calculate BOTH:
1. Total LINEAR YARDS needed for a complete full wrap
2. Total SQUARE FOOTAGE of the vehicle's wrap surface area

Include coverage for:
- All body panels
- Hood
- Roof
- Bumpers
- Mirrors
- Door handles
- Trim pieces
- Waste factor (typically 10-15% for cutting and mistakes)

Consider the exact size category of this specific vehicle model:
- Compact car (Civic, Corolla): ~20-25 yards, ~100-125 sq ft
- Mid-size sedan (Accord, Camry): ~25-30 yards, ~125-150 sq ft
- Full-size sedan (Charger, S-Class): ~30-35 yards, ~150-175 sq ft
- Compact SUV (CR-V, RAV4): ~30-35 yards, ~150-175 sq ft
- Mid-size SUV (Explorer, Pilot): ~35-40 yards, ~175-200 sq ft
- Full-size SUV (Tahoe, Expedition): ~40-50 yards, ~200-250 sq ft
- Truck (F-150, Silverado): ~35-45 yards, ~175-225 sq ft
- Sports car (Corvette, 911): ~20-25 yards, ~100-125 sq ft
- Exotic (Ferrari, Lamborghini): ~25-30 yards, ~125-150 sq ft

Respond with ONLY a JSON object in this exact format:
{
  "yards": <number>,
  "squareFeet": <number>,
  "vehicleCategory": "<category>",
  "reasoning": "<brief explanation>"
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`AI calculation failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      throw new Error('No calculation data in response');
    }

    const result = JSON.parse(responseText);
    
    console.log('Calculated yards:', result.yards);

    return new Response(
      JSON.stringify({ 
        yards: result.yards,
        squareFeet: result.squareFeet,
        category: result.vehicleCategory,
        reasoning: result.reasoning
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error calculating yards:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
