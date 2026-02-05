import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createExternalClient } from "../_shared/external-db.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyRequest {
  manufacturer: string;
  colorName: string;
  colorType?: string;
  userProvidedHex?: string;
  swatchImageUrl?: string;
}

interface ColorVerificationResult {
  exists: boolean;
  verified: boolean;
  color: {
    id: string;
    manufacturer: string;
    name: string;
    hex: string;
    finish: string;
    color_type: string;
    series?: string;
    code?: string;
    metallic: boolean;
    pearl: boolean;
    chrome: boolean;
    popularity_score: number;
  } | null;
  confidence: number;
  message: string;
  source: 'database' | 'ai_verified' | 'rejected';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { manufacturer, colorName, colorType, userProvidedHex, swatchImageUrl } = await req.json() as VerifyRequest;

    if (!manufacturer || !colorName) {
      return new Response(
        JSON.stringify({ error: 'Manufacturer and color name are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Connect to EXTERNAL database for data operations
    const supabase = createExternalClient();

    // STEP 1: Check database first
    console.log(`🔍 Checking database for: ${manufacturer} - ${colorName}`);
    
    const { data: existingColors, error: searchError } = await supabase
      .from('vinyl_swatches')
      .select('*')
      .ilike('manufacturer', `%${manufacturer}%`)
      .ilike('name', `%${colorName}%`)
      .eq('verified', true)
      .limit(1);

    if (searchError) {
      console.error('Database search error:', searchError);
    }

    // If found in database, increment popularity and return
    if (existingColors && existingColors.length > 0) {
      const color = existingColors[0];
      console.log(`✅ Found in database: ${color.name} (ID: ${color.id})`);
      
      // Increment popularity
      await supabase
        .from('vinyl_swatches')
        .update({ 
          popularity_score: (color.popularity_score || 0) + 1,
          search_count: (color.search_count || 0) + 1,
          last_verified_at: new Date().toISOString()
        })
        .eq('id', color.id);

      const result: ColorVerificationResult = {
        exists: true,
        verified: true,
        color: {
          id: color.id,
          manufacturer: color.manufacturer,
          name: color.name,
          hex: color.hex,
          finish: color.finish,
          color_type: color.color_type || 'gloss',
          series: color.series,
          code: color.code,
          metallic: color.metallic || false,
          pearl: color.pearl || false,
          chrome: color.chrome || false,
          popularity_score: (color.popularity_score || 0) + 1,
        },
        confidence: 1.0,
        message: 'Color found in verified database',
        source: 'database'
      };

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // STEP 2: Not in database - verify with AI
    console.log(`🤖 Color not in database, verifying with AI: ${manufacturer} - ${colorName}`);
    
    const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
    if (!GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY not configured');
    }

    const verificationPrompt = `You are a vinyl wrap color verification expert. Verify if this vinyl wrap color exists in real manufacturer catalogs.

MANUFACTURER: ${manufacturer}
COLOR NAME: ${colorName}
${userProvidedHex ? `USER PROVIDED HEX: ${userProvidedHex}` : ''}
${colorType ? `COLOR TYPE: ${colorType}` : ''}

CRITICAL RULES:
1. Only verify colors that ACTUALLY EXIST in real manufacturer catalogs
2. Do NOT invent or hallucinate colors
3. Be strict - if unsure, set confidence below 0.5
4. Common manufacturers: Avery Dennison (SW900, Conform Chrome), 3M (2080, 1080), Hexis (HX30, HX20), KPMF (K75400, K77000), Oracal (970RA), Inozetek, TeckWrap, VViViD, GSWF, STEK, Arlon

RESPOND WITH ONLY VALID JSON (no markdown, no explanation):
{
  "exists": boolean,
  "confidence": number (0.0 to 1.0),
  "correctedHex": "#XXXXXX",
  "finish": "Gloss" | "Matte" | "Satin",
  "colorType": "gloss" | "matte" | "satin" | "metallic" | "flip" | "iridescent" | "pearl" | "neon" | "chrome" | "color_ppf" | "matte_ppf" | "gloss_ppf",
  "series": "series name or null",
  "productCode": "product code or null",
  "isMetallic": boolean,
  "isPearl": boolean,
  "isChrome": boolean,
  "reasoning": "brief explanation"
}`;

    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'You are a vinyl wrap color expert. Respond only with valid JSON.\n\n' + verificationPrompt }]
        }]
      })
    });

    if (!aiResponse.ok) {
      console.error('Gemini API verification failed:', await aiResponse.text());
      throw new Error('AI verification service unavailable');
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    console.log('AI response:', aiContent);

    // Parse AI response
    let verification;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        verification = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return rejection for unparseable responses
      const result: ColorVerificationResult = {
        exists: false,
        verified: false,
        color: null,
        confidence: 0,
        message: 'Unable to verify color - AI response unparseable',
        source: 'rejected'
      };
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const confidence = verification.confidence || 0;
    console.log(`AI Confidence: ${confidence}, Exists: ${verification.exists}`);

    // STEP 3: Save based on confidence
    if (verification.exists && confidence >= 0.50) {
      const isAutoVerified = confidence >= 0.85;
      const hex = verification.correctedHex || userProvidedHex || '#808080';
      
      console.log(`💾 Saving to database (verified=${isAutoVerified}): ${manufacturer} - ${colorName}`);
      
      const { data: newColor, error: insertError } = await supabase
        .from('vinyl_swatches')
        .insert({
          manufacturer: manufacturer,
          name: colorName,
          hex: hex,
          finish: verification.finish || 'Gloss',
          color_type: verification.colorType || colorType || 'gloss',
          series: verification.series || null,
          code: verification.productCode || null,
          metallic: verification.isMetallic || false,
          pearl: verification.isPearl || false,
          chrome: verification.isChrome || false,
          ai_confidence: confidence,
          verified: isAutoVerified,
          source: 'ai_verified',
          popularity_score: 0,
          search_count: 1,
          last_verified_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error('Failed to save verified color');
      }

      const result: ColorVerificationResult = {
        exists: true,
        verified: isAutoVerified,
        color: {
          id: newColor.id,
          manufacturer: newColor.manufacturer,
          name: newColor.name,
          hex: newColor.hex,
          finish: newColor.finish,
          color_type: newColor.color_type || 'gloss',
          series: newColor.series,
          code: newColor.code,
          metallic: newColor.metallic || false,
          pearl: newColor.pearl || false,
          chrome: newColor.chrome || false,
          popularity_score: 0,
        },
        confidence: confidence,
        message: isAutoVerified 
          ? 'Color verified and saved to database' 
          : 'Color saved pending admin verification',
        source: 'ai_verified'
      };

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // STEP 4: Reject low confidence colors
    console.log(`❌ Color rejected (confidence too low): ${confidence}`);
    
    const result: ColorVerificationResult = {
      exists: false,
      verified: false,
      color: null,
      confidence: confidence,
      message: `Color could not be verified (confidence: ${(confidence * 100).toFixed(0)}%). This may not be a real manufacturer color.`,
      source: 'rejected'
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Verification error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});