// ============================================================
// INGEST-ALL-WRAP-SWATCH-COLORS - OPTIMIZED ENTERPRISE PIPELINE
// All 12 optimizations applied:
// 1. Skip already-validated swatches
// 2. Batch size control with parallel processing
// 3. Reusable processSwatch function
// 4. DataForSEO result caching
// 5. Skip material profile if already validated
// 6. Parallel reference photo ingestion
// 7. Optimized AI prompts (fewer tokens)
// 8. Skip generic color names
// 9. Rate limit protection with delays
// 10. Automatic retry logic
// 11. Condensed logging
// 12. Parallel validation within batches
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ==================== CONFIGURATION ====================
const BATCH_SIZE = 5;           // Process 5 swatches concurrently
const BATCH_DELAY_MS = 1500;    // Delay between batches
const MAX_RETRIES = 3;          // Retry failed operations
const RETRY_DELAY_MS = 500;     // Delay between retries
const MAX_IMAGES_TO_VALIDATE = 6; // Limit images to validate per swatch
const MAX_REFERENCE_PHOTOS = 5;   // Max reference photos to store

// Generic color names to skip DataForSEO for
const GENERIC_COLORS = /^(black|white|red|blue|green|yellow|orange|pink|purple|gray|grey|silver|gold|bronze|brown|beige|tan|cream|ivory|navy|teal|cyan|magenta|lime|olive|maroon|coral|salmon|turquoise|gloss black|matte black|gloss white|matte white|satin black|satin white)$/i;

// Invalid image domains to filter out
const INVALID_DOMAINS = [
  'amazon.com', 'ebay.com', 'youtube.com', 'facebook.com', 
  'instagram.com', 'twitter.com', 'pinterest.com', 'tiktok.com',
  'alibaba.com', 'aliexpress.com', 'wish.com', 'etsy.com'
];

// ==================== UTILITY FUNCTIONS ====================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retry<T>(fn: () => Promise<T>, attempts = MAX_RETRIES): Promise<T> {
  let lastError: Error | null = null;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e as Error;
      console.log(`   ⚠️ Retry ${i + 1}/${attempts}: ${lastError.message?.substring(0, 50)}`);
      if (i < attempts - 1) await sleep(RETRY_DELAY_MS);
    }
  }
  throw lastError;
}

function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const lowerUrl = url.toLowerCase();
  if (INVALID_DOMAINS.some(domain => lowerUrl.includes(domain))) return false;
  const hasImageExtension = /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url);
  const isCDN = /cdn|cloudfront|imgix|imagekit|supabase|storage/i.test(url);
  return hasImageExtension || isCDN;
}

function isGenericColor(colorName: string): boolean {
  return colorName.length < 4 || GENERIC_COLORS.test(colorName.trim());
}

// ==================== DATAFORSEO WITH CACHING ====================

async function searchImages(
  query: string, 
  swatchId: string, 
  supabase: any, 
  apiKey: string,
  limit: number = 10
): Promise<any[]> {
  // Check cache first
  const { data: cached } = await supabase
    .from("vinyl_swatch_search_cache")
    .select("results_json")
    .eq("swatch_id", swatchId)
    .eq("search_query", query)
    .maybeSingle();
  
  if (cached?.results_json) {
    console.log(`   📦 Cache hit`);
    return cached.results_json as any[];
  }

  try {
    const response = await fetch("https://api.dataforseo.com/v3/serp/google/images/live/advanced", {
      method: "POST",
      headers: {
        Authorization: `Basic ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify([{
        keyword: query,
        location_code: 2840,
        language_code: "en",
        device: "desktop",
        depth: 20
      }])
    });

    if (!response.ok) {
      console.log(`   ❌ DataForSEO: ${response.status}`);
      return [];
    }

    const json = await response.json();
    const items = json?.tasks?.[0]?.result?.[0]?.items || [];
    
    const validImages = items
      .filter((item: any) => isValidImageUrl(item.source_url || item.url))
      .slice(0, limit)
      .map((item: any) => ({
        url: item.source_url || item.url,
        source_url: item.url
      }));

    // Cache results
    if (validImages.length > 0) {
      await supabase.from("vinyl_swatch_search_cache").upsert({
        swatch_id: swatchId,
        search_query: query,
        results_json: validImages
      }, { onConflict: "swatch_id,search_query" }).catch(() => {});
    }

    return validImages;
  } catch (error) {
    console.log(`   ❌ DataForSEO error`);
    return [];
  }
}

// ==================== AI VISION VALIDATION (OPTIMIZED PROMPT) ====================

async function validateSwatchImage(imageUrl: string, apiKey: string): Promise<{ isValid: boolean; score: number }> {
  // Compact prompt to minimize tokens
  const prompt = `Is this a real vinyl wrap swatch? Return JSON: {"score": 0.0-1.0, "isValid": true/false}`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }],
      }),
    });

    if (!response.ok) return { isValid: false, score: 0 };

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[^}]+\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return { isValid: parsed.isValid === true, score: parsed.score || 0 };
    }
    return { isValid: false, score: 0 };
  } catch {
    return { isValid: false, score: 0 };
  }
}

// ==================== MATERIAL PROFILE EXTRACTION ====================

async function extractMaterialProfile(imageUrl: string, apiKey: string, finish: string, hex: string): Promise<any | null> {
  // Skip SVG files - they don't work with vision AI
  if (imageUrl.toLowerCase().endsWith('.svg')) {
    console.log(`   ⏭️ Skipping SVG file`);
    return null;
  }

  // Convert image to base64 since AI gateway can't fetch from Supabase storage
  let base64Image: string;
  try {
    const imgResponse = await fetch(imageUrl);
    if (!imgResponse.ok) {
      console.log(`   ❌ Failed to fetch image: ${imgResponse.status}`);
      return null;
    }
    const contentType = imgResponse.headers.get('content-type') || 'image/png';
    const arrayBuffer = await imgResponse.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    base64Image = `data:${contentType};base64,${btoa(binary)}`;
  } catch (e) {
    console.log(`   ❌ Image fetch error: ${(e as Error).message?.substring(0, 40)}`);
    return null;
  }

  const prompt = `Analyze this vinyl wrap swatch image. Extract the LAB color values and material properties.
Return ONLY a JSON object with this exact structure:
{"lab":{"L":50,"a":0,"b":0},"reflectivity":0.5,"metallic_flake":0.1,"finish_profile":{"highlight_softness":0.5,"shadow_saturation_falloff":0.3,"anisotropy":0.2,"texture":"smooth glossy"},"corrected_hex":"#RRGGBB","confidence":0.8}

Requirements:
- L: 0-100 (lightness)
- a: -128 to 127 (green to red)
- b: -128 to 127 (blue to yellow)
- reflectivity: 0-1 (0=matte, 1=chrome mirror)
- metallic_flake: 0-1 (0=no flakes, 1=heavy metallic)
- confidence: your confidence 0-1

Current finish type: ${finish}
Current hex: ${hex}`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: base64Image } }
          ]
        }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`   ❌ AI API error: ${response.status} - ${errorText.substring(0, 100)}`);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Try to extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.lab && typeof parsed.lab.L === 'number') {
        console.log(`   🔬 Extracted LAB(${parsed.lab.L?.toFixed(0)}, ${parsed.lab.a?.toFixed(0)}, ${parsed.lab.b?.toFixed(0)})`);
        return parsed;
      }
    }
    console.log(`   ⚠️ No valid LAB in response: ${content.substring(0, 50)}`);
    return null;
  } catch (e) {
    console.log(`   ❌ Extract error: ${(e as Error).message?.substring(0, 50)}`);
    return null;
  }
}

// ==================== PARALLEL REFERENCE PHOTO INGESTION ====================

async function storeReferencePhotos(
  supabase: any,
  swatchId: string,
  manufacturer: string,
  colorName: string,
  apiKey: string
): Promise<number> {
  const photos = await searchImages(
    `${manufacturer} ${colorName} vinyl wrap car vehicle`,
    `${swatchId}-refs`,
    supabase,
    apiKey,
    MAX_REFERENCE_PHOTOS
  );

  if (photos.length === 0) return 0;

  // Parallel upserts
  await Promise.all(photos.map(photo => 
    supabase.from('vinyl_reference_images').upsert({
      swatch_id: swatchId,
      manufacturer,
      color_name: colorName,
      image_url: photo.url,
      source_url: photo.source_url,
      image_type: 'vehicle_installation',
      is_verified: false,
      score: 0.5
    }, { onConflict: 'swatch_id,image_url', ignoreDuplicates: true }).catch(() => {})
  ));

  return photos.length;
}

// ==================== MAIN SWATCH PROCESSOR ====================

async function processSwatch(
  swatch: any, 
  supabase: any, 
  lovableApiKey: string, 
  dataForSeoKey: string
): Promise<{ success: boolean; message: string }> {
  const { id, name, manufacturer, finish, hex, lab, material_validated, media_url } = swatch;
  const tag = `[${manufacturer}] ${name}`;
  
  console.log(`🎨 ${tag}`);

  try {
    const isGeneric = isGenericColor(name);
    let bestImage: string | null = null;
    let bestScore = 0;

    // Check if existing media_url is valid (not a broken placeholder)
    if (media_url && media_url.includes('wrap-files/swatches')) {
      // Real uploaded file - trust it
      bestImage = media_url;
      bestScore = 0.7;
    } else if (media_url) {
      // Placeholder URL - verify it exists
      try {
        const checkRes = await fetch(media_url, { method: 'HEAD' });
        if (checkRes.ok) {
          bestImage = media_url;
          bestScore = 0.5;
        } else {
          console.log(`   ⚠️ media_url 404, searching for images...`);
        }
      } catch {
        console.log(`   ⚠️ media_url unreachable, searching...`);
      }
    }

    // STEP 1: Search for better swatch images if no valid image yet
    if (!isGeneric && !bestImage) {
      const query = `${manufacturer} ${name} vinyl wrap swatch`;
      const images = await retry(() => searchImages(query, id, supabase, dataForSeoKey, 10));

      if (images.length > 0) {
        // Parallel validation (limited batch)
        const toValidate = images.slice(0, MAX_IMAGES_TO_VALIDATE);
        const validations = await Promise.all(
          toValidate.map(async (img) => {
            if (!isValidImageUrl(img.url)) return { url: img.url, isValid: false, score: 0 };
            const result = await validateSwatchImage(img.url, lovableApiKey);
            return { url: img.url, ...result };
          })
        );

        for (const v of validations) {
          if (v.isValid && v.score > bestScore) {
            bestScore = v.score;
            bestImage = v.url;
          }
        }
        if (bestImage) console.log(`   ✅ Best: score=${bestScore.toFixed(2)}`);
      }
    }

    if (!bestImage) {
      console.log(`   ⚠️ No swatch found`);
      return { success: false, message: "No valid swatch" };
    }

    // STEP 2: Extract material profile (Faster & Safe Mode)
    // Extract when material is not yet validated OR LAB is missing
    let material: any = null;
    if (!material_validated || !lab) {
      material = await retry(() => extractMaterialProfile(bestImage!, lovableApiKey, finish, hex));
      if (material?.lab) {
        console.log(`   🔬 LAB(${material.lab.L?.toFixed(0)}, ${material.lab.a?.toFixed(0)}, ${material.lab.b?.toFixed(0)})`);
      }
    } else {
      console.log(`   ⏭️ Material already validated`);
    }

    // STEP 3: Update vinyl_swatches
    const updateData: any = { verified: true, updated_at: new Date().toISOString() };
    
    if (bestImage && bestImage !== media_url) {
      updateData.media_url = bestImage;
    }

    if (material) {
      if (material.lab) updateData.lab = material.lab;
      if (typeof material.reflectivity === 'number') updateData.reflectivity = material.reflectivity;
      if (typeof material.metallic_flake === 'number') updateData.metallic_flake = material.metallic_flake;
      if (material.finish_profile) updateData.finish_profile = material.finish_profile;
      if (material.corrected_hex && material.confidence >= 0.8) {
        updateData.hex = material.corrected_hex;
      }
      updateData.material_validated = true;
      updateData.ai_confidence = bestScore;
    }

    await supabase.from('vinyl_swatches').update(updateData).eq('id', id);

    // STEP 4: Store reference photos (parallel)
    const refCount = await storeReferencePhotos(supabase, id, manufacturer, name, dataForSeoKey);
    
    if (refCount > 0) {
      await supabase.from('vinyl_swatches').update({
        reference_image_count: refCount,
        has_reference_bundle: true
      }).eq('id', id);
    }

    console.log(`   📸 ${refCount} refs stored`);
    return { success: true, message: `OK, ${refCount} refs` };

  } catch (e) {
    console.log(`   ❌ ${(e as Error).message?.substring(0, 40)}`);
    return { success: false, message: (e as Error).message };
  }
}

// ==================== MAIN HANDLER ====================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  const dataForSeoKey = Deno.env.get('DATAFORSEO_API_KEY');

  if (!lovableApiKey) {
    return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  if (!dataForSeoKey) {
    return new Response(JSON.stringify({ error: 'DATAFORSEO_API_KEY not configured' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await req.json().catch(() => ({}));
    const { 
      manufacturer: filterManufacturer,
      limit = 100,
      offset = 0,
      onlyMissingMedia = false,
      onlyMissingMaterial = false,
      skipValidated = true
    } = body;

    console.log(`\n${"=".repeat(50)}`);
    console.log(`🚀 OPTIMIZED SWATCH INGESTION`);
    console.log(`${"=".repeat(50)}`);
    console.log(`Batch: ${BATCH_SIZE}, Delay: ${BATCH_DELAY_MS}ms`);
    console.log(`Filter: ${filterManufacturer || 'ALL'}, Limit: ${limit}, Offset: ${offset}`);

    // Build optimized query
    let query = supabase.from('vinyl_swatches').select('*');

    if (filterManufacturer) {
      query = query.ilike('manufacturer', `%${filterManufacturer}%`);
    }

    if (skipValidated) {
      query = query.or('verified.is.null,verified.eq.false');
    }

    if (onlyMissingMedia) {
      query = query.or('media_url.is.null,media_url.eq.');
    }

    if (onlyMissingMaterial) {
      query = query.or('material_validated.is.null,material_validated.eq.false');
    }

    query = query.order('manufacturer').order('name').range(offset, offset + limit - 1);

    const { data: swatches, error: fetchError } = await query;

    if (fetchError) {
      console.error('Query error:', fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!swatches || swatches.length === 0) {
      return new Response(JSON.stringify({ status: 'complete', message: 'No swatches to process', processed: 0 }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log(`\n📊 Processing ${swatches.length} swatches\n`);

    const results = { success: 0, failed: 0, errors: [] as string[] };

    // Process in batches with controlled concurrency
    for (let i = 0; i < swatches.length; i += BATCH_SIZE) {
      const batch = swatches.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(swatches.length / BATCH_SIZE);

      console.log(`\n📦 Batch ${batchNum}/${totalBatches}`);

      // Parallel processing within batch
      const batchResults = await Promise.all(
        batch.map(swatch => processSwatch(swatch, supabase, lovableApiKey, dataForSeoKey))
      );

      for (const result of batchResults) {
        if (result.success) results.success++;
        else {
          results.failed++;
          if (results.errors.length < 10) results.errors.push(result.message);
        }
      }

      // Rate limit protection
      if (i + BATCH_SIZE < swatches.length) {
        console.log(`   ⏳ Cooling ${BATCH_DELAY_MS}ms...`);
        await sleep(BATCH_DELAY_MS);
      }
    }

    console.log(`\n${"=".repeat(50)}`);
    console.log(`✅ COMPLETE: ${results.success} success, ${results.failed} failed`);
    console.log(`${"=".repeat(50)}\n`);

    return new Response(JSON.stringify({
      status: 'complete',
      processed: swatches.length,
      success: results.success,
      failed: results.failed,
      errors: results.errors.slice(0, 5)
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (e) {
    console.error('Pipeline error:', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
