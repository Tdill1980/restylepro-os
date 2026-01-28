import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============= MANUFACTURER EXTRACTION FROM TEXT =============
// This function detects manufacturer name from swatch text BEFORE AI analysis
// Text detection OVERRIDES AI guessing to ensure correct manufacturer identification
function extractManufacturerFromText(text: string): string | null {
  if (!text) return null;
  const lower = text.toLowerCase();
  
  // 3M detection (highest priority - most common misidentification)
  if (/\b3m\b/i.test(text) || /\b1080[-\s]?[msgcb]\d{2,3}/i.test(text) || /\b2080[-\s]?[msgcb]\d{2,3}/i.test(text)) {
    console.log('🏭 MANUFACTURER DETECTED FROM TEXT: 3M');
    return '3M';
  }
  
  // Avery Dennison detection
  if (/\bavery\s*dennison\b/i.test(lower) || /\bsw[-\s]?900\b/i.test(text) || /\bmpi\s*\d{4}/i.test(text)) {
    console.log('🏭 MANUFACTURER DETECTED FROM TEXT: Avery Dennison');
    return 'Avery Dennison';
  }
  
  // KPMF detection
  if (/\bkpmf\b/i.test(lower) || /\bk[-\s]?75\d{3}\b/i.test(text) || /\bk[-\s]?88\d{3}\b/i.test(text)) {
    console.log('🏭 MANUFACTURER DETECTED FROM TEXT: KPMF');
    return 'KPMF';
  }
  
  // Hexis detection
  if (/\bhexis\b/i.test(lower) || /\bhx[-\s]?\d{5}/i.test(text)) {
    console.log('🏭 MANUFACTURER DETECTED FROM TEXT: Hexis');
    return 'Hexis';
  }
  
  // Oracal/ORAFOL detection
  if (/\boracal\b|\borafol\b/i.test(lower) || /\b970[-\s]?ra\b/i.test(text) || /\b975\b/i.test(text)) {
    console.log('🏭 MANUFACTURER DETECTED FROM TEXT: Oracal');
    return 'Oracal';
  }
  
  // Arlon detection
  if (/\barlon\b/i.test(lower) || /\bslx\b/i.test(text) || /\bdpf[-\s]?\d{4}/i.test(text)) {
    console.log('🏭 MANUFACTURER DETECTED FROM TEXT: Arlon');
    return 'Arlon';
  }
  
  // TeckWrap detection
  if (/\bteckwrap\b|\bteck\s*wrap\b/i.test(lower)) {
    console.log('🏭 MANUFACTURER DETECTED FROM TEXT: TeckWrap');
    return 'TeckWrap';
  }
  
  // Inozetek detection
  if (/\binozetek\b/i.test(lower)) {
    console.log('🏭 MANUFACTURER DETECTED FROM TEXT: Inozetek');
    return 'Inozetek';
  }
  
  // VViViD detection
  if (/\bvvivid\b|\bvivid\b/i.test(lower)) {
    console.log('🏭 MANUFACTURER DETECTED FROM TEXT: VViViD');
    return 'VViViD';
  }
  
  return null; // Let AI detect if no text pattern matched
}

// ============= TEXT-BASED FINISH EXTRACTION =============
// This function detects finish type from swatch name/text BEFORE AI analysis
// Text detection OVERRIDES AI guessing to ensure accurate finish rendering
function extractFinishFromText(text: string): string | null {
  if (!text) return null;
  const lower = text.toLowerCase();
  
  // Chrome detection (highest priority)
  if (/\bchrome\b|\bmirror\b|\bsuper\s*chrome\b|\bsilver\s*chrome\b/i.test(lower)) {
    console.log('🎯 FINISH DETECTED FROM TEXT: chrome');
    return 'chrome';
  }
  
  // 3M product code patterns: 1080-M = Matte, 1080-G = Gloss, 1080-S = Satin
  if (/\b1080[-\s]?m\d{2,3}/i.test(text) || /\b2080[-\s]?m\d{2,3}/i.test(text)) {
    console.log('🎯 FINISH DETECTED FROM 3M CODE: matte (M-series)');
    return 'matte';
  }
  if (/\b1080[-\s]?g\d{2,3}/i.test(text) || /\b2080[-\s]?g\d{2,3}/i.test(text)) {
    console.log('🎯 FINISH DETECTED FROM 3M CODE: gloss (G-series)');
    return 'gloss';
  }
  if (/\b1080[-\s]?s\d{2,3}/i.test(text) || /\b2080[-\s]?s\d{2,3}/i.test(text)) {
    console.log('🎯 FINISH DETECTED FROM 3M CODE: satin (S-series)');
    return 'satin';
  }
  
  // KPMF K75500 Matte series
  if (/\bk[-\s]?755\d{2}\b/i.test(text) || /\bkpmf.*matte\b/i.test(lower)) {
    console.log('🎯 FINISH DETECTED FROM KPMF CODE: matte (K755xx series)');
    return 'matte';
  }
  
  // KPMF K88000 Gloss series  
  if (/\bk[-\s]?88\d{3}\b/i.test(text) || /\bkpmf.*gloss\b/i.test(lower)) {
    console.log('🎯 FINISH DETECTED FROM KPMF CODE: gloss (K88xxx series)');
    return 'gloss';
  }
  
  // Direct text keywords (case-insensitive)
  if (/\bmatte\b|\bflat\b|\bmat\b/i.test(lower)) {
    console.log('🎯 FINISH DETECTED FROM TEXT: matte');
    return 'matte';
  }
  if (/\bsatin\b|\bsemi[-\s]?gloss\b/i.test(lower)) {
    console.log('🎯 FINISH DETECTED FROM TEXT: satin');
    return 'satin';
  }
  if (/\bgloss\b|\bglossy\b|\bhigh[-\s]?gloss\b/i.test(lower)) {
    console.log('🎯 FINISH DETECTED FROM TEXT: gloss');
    return 'gloss';
  }
  
  // Metallic detection
  if (/\bmetallic\b|\bmetal\s*flake\b/i.test(lower)) {
    console.log('🎯 FINISH DETECTED FROM TEXT: metallic');
    return 'metallic';
  }
  
  // Sparkle detection
  if (/\bsparkle\b|\bglitter\b|\bflake\b/i.test(lower)) {
    console.log('🎯 FINISH DETECTED FROM TEXT: sparkle');
    return 'sparkle';
  }
  
  // Pearl/flip detection
  if (/\bpearl\b|\biridescent\b|\bflip\b|\bcolor[-\s]?shift\b|\bcolor[-\s]?flow\b/i.test(lower)) {
    console.log('🎯 FINISH DETECTED FROM TEXT: pearl');
    return 'pearl';
  }
  
  // Brushed metal detection
  if (/\bbrushed\b|\bbrush\s*metal\b/i.test(lower)) {
    console.log('🎯 FINISH DETECTED FROM TEXT: brushed');
    return 'brushed';
  }
  
  // Carbon fiber detection
  if (/\bcarbon\s*fiber\b|\bcarbon\b/i.test(lower)) {
    console.log('🎯 FINISH DETECTED FROM TEXT: carbon fiber');
    return 'carbon fiber';
  }
  
  return null; // Let AI detect if no text pattern matched
}

serve(async (req) => {
  console.log('🎨 analyze-vinyl-swatch: Request received');
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('❌ LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { swatchImageUrl, uploadedFileName } = await req.json();
    
    if (!swatchImageUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'No swatch image URL provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📸 Analyzing swatch:', swatchImageUrl);
    console.log('📁 Original filename:', uploadedFileName);

    // Create Supabase client for database lookup
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    let supabase: any = null;
    if (supabaseUrl && supabaseKey) {
      supabase = createClient(supabaseUrl, supabaseKey);
    }

    // Build AI analysis prompt with STRICT JSON requirement
    const analysisPrompt = `You are an expert at analyzing vinyl wrap swatch images.

CRITICAL INSTRUCTION: You MUST ALWAYS respond with valid JSON, no matter what. Never respond with plain text explanations.

First, determine if this image is actually a vinyl wrap swatch (a sample of vinyl wrap material, typically with manufacturer labels, product codes, or color information).

If this is NOT a vinyl wrap swatch (e.g., a vehicle photo, design mockup, color palette, texture image, or anything other than an actual vinyl swatch sample), respond with EXACTLY this JSON:
{
  "isValidSwatch": false,
  "errorMessage": "This image appears to be [describe what it is]. Please upload a vinyl wrap swatch image with visible manufacturer label.",
  "confidence": 0
}

If this IS a valid vinyl wrap swatch, analyze it and respond with this JSON structure:
{
  "isValidSwatch": true,
  "manufacturer": "[3M, Avery Dennison, KPMF, Hexis, TeckWrap, Oracal, Arlon, Rwraps, or Unknown]",
  "colorName": "[extracted color name or Unknown]",
  "productCode": "[product code if visible, or null]",
  "series": "[series name like 1080, 2080, SW900, or null]",
  "finishType": "[Gloss, Matte, Satin, Chrome, Metallic, Carbon Fiber, Brushed, or Unknown]",
  "hexColor": "#[6-digit hex color code]",
  "metallic": [true/false],
  "chrome": [true/false],
  "pearl": [true/false],
  "confidence": [0.0 to 1.0]
}

LOOK FOR TEXT ON THE SWATCH:
- Manufacturer names: 3M, Avery, KPMF, Hexis, TeckWrap, Oracal, Arlon, Rwraps
- Product codes like: 1080-G12, SW900-674-S, SP1080, 2080-M196
- Finish indicators: M = Matte, G = Gloss, S = Satin, BR = Brushed, CF = Carbon Fiber
- Color names printed on the swatch or label

REMEMBER: ALWAYS respond with valid JSON. Never explain in plain text.`;

    // Call AI vision API
    console.log('🤖 Calling AI vision for swatch analysis...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: [
              { type: 'text', text: analysisPrompt },
              { type: 'image_url', image_url: { url: swatchImageUrl } }
            ]
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ AI API error:', aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'AI analysis failed. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '';
    console.log('🤖 AI raw response:', content.substring(0, 500));

    // Parse JSON from response with robust fallback
    let analysis: any = null;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        analysis = JSON.parse(jsonMatch[0]);
        console.log('✅ Parsed AI analysis:', analysis);
      } catch (parseError) {
        console.error('⚠️ JSON parse error, creating fallback:', parseError);
        // AI returned something but it's not valid JSON - treat as non-swatch
        analysis = {
          isValidSwatch: false,
          errorMessage: 'Unable to analyze this image. Please upload a clear photo of a vinyl wrap swatch.',
          confidence: 0
        };
      }
    } else {
      // No JSON found at all - AI returned plain text
      console.log('⚠️ No JSON in AI response, creating error object');
      analysis = {
        isValidSwatch: false,
        errorMessage: content.substring(0, 200) || 'This does not appear to be a vinyl swatch image. Please upload a clear photo of a vinyl wrap swatch with visible labeling.',
        confidence: 0
      };
    }

    // CHECK: Is this a valid swatch?
    if (analysis.isValidSwatch === false) {
      console.log('❌ Image is not a valid swatch:', analysis.errorMessage);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: analysis.errorMessage || 'This image does not appear to be a vinyl wrap swatch. Please upload a swatch image with manufacturer labeling.',
          analysis: null 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Apply text extraction overrides for manufacturer
    const textBasedManufacturer = extractManufacturerFromText(content);
    if (textBasedManufacturer) {
      console.log(`🔧 Overriding manufacturer from text: ${analysis.manufacturer} → ${textBasedManufacturer}`);
      analysis.manufacturer = textBasedManufacturer;
    }

    // Apply text extraction overrides for finish
    const textBasedFinish = extractFinishFromText(content);
    if (textBasedFinish) {
      console.log(`🔧 Overriding finish from text: ${analysis.finishType} → ${textBasedFinish}`);
      analysis.finishType = textBasedFinish;
    }

    // Database lookup for verified match
    if (supabase && analysis.manufacturer && analysis.manufacturer !== 'Unknown') {
      try {
        console.log('🔍 Looking up in vinyl_swatches database...');
        
        // Try exact match first
        let query = supabase
          .from('vinyl_swatches')
          .select('*')
          .eq('manufacturer', analysis.manufacturer);
        
        if (analysis.colorName && analysis.colorName !== 'Unknown') {
          query = query.ilike('name', `%${analysis.colorName}%`);
        }
        
        const { data: matches, error: dbError } = await query.limit(5);
        
        if (!dbError && matches && matches.length > 0) {
          const bestMatch = matches[0];
          console.log('✅ Database match found:', bestMatch.name);
          
          analysis.swatchId = bestMatch.id;
          analysis.isVerifiedMatch = true;
          analysis.dbColorName = bestMatch.name;
          analysis.dbFinish = bestMatch.finish;
          analysis.hexColor = bestMatch.hex || analysis.hexColor;
          analysis.productCode = bestMatch.code || analysis.productCode;
          analysis.series = bestMatch.series || analysis.series;
          
          // Include material profile data
          analysis.materialProfile = {
            lab: bestMatch.lab,
            reflectivity: bestMatch.reflectivity,
            metallic_flake: bestMatch.metallic_flake,
            finish_profile: bestMatch.finish_profile,
            material_validated: bestMatch.material_validated,
          };
        }
      } catch (dbError) {
        console.error('⚠️ Database lookup error (non-fatal):', dbError);
      }
    }

    console.log('✅ Final analysis result:', analysis);
    
    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ analyze-vinyl-swatch error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error analyzing swatch' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
