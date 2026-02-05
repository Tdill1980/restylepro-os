import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createExternalClient, getExternalSupabaseUrl, getExternalServiceRoleKey } from "../_shared/external-db.ts";

// Declare EdgeRuntime for Supabase background tasks
declare const EdgeRuntime: { waitUntil: (promise: Promise<unknown>) => void };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FLIP_FILM_KEYWORDS = [
  'flip', 'chameleon', 'colorflow', 'color flow', 'iridescent', 
  'psychedelic', 'color shift', 'volcanic', 'flare', 'prism',
  'prismatic', 'dichroic', 'holographic', 'spectral'
];

function isFlipFilm(name: string): boolean {
  const lower = name.toLowerCase();
  return FLIP_FILM_KEYWORDS.some(keyword => lower.includes(keyword));
}

async function searchVinylImages(
  supabaseUrl: string,
  supabaseKey: string,
  manufacturer: string,
  colorName: string,
  productCode?: string | null
): Promise<Array<{ url: string; source: string; title: string; isVehicle: boolean }>> {
  console.log(`Calling search-vinyl-product-images for: ${manufacturer} ${colorName}`);
  
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/search-vinyl-product-images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        manufacturer,
        colorName,
        productCode
      }),
    });

    if (!response.ok) {
      console.error('search-vinyl-product-images failed:', response.status);
      return [];
    }

    const data = await response.json();
    const photos = data.photos || [];
    
    console.log(`Found ${photos.length} images via search function`);
    
    return photos.map((photo: any) => ({
      url: photo.url || photo,
      source: photo.source || '',
      title: photo.title || `${manufacturer} ${colorName}`,
      isVehicle: photo.title?.toLowerCase().includes('wrap') || 
                 photo.title?.toLowerCase().includes('install') || 
                 photo.title?.toLowerCase().includes('vehicle') ||
                 data.photoType === 'vehicle_installation'
    }));
  } catch (error) {
    console.error('Error in searchVinylImages:', error);
    return [];
  }
}

async function processBackfill(
  supabaseUrl: string,
  supabaseServiceKey: string,
  batchSize: number,
  startFrom: number,
  manufacturerFilter: string | null,
  forceRefresh: boolean
) {
  const supabase = createExternalClient();

  console.log(`Starting backfill - batch: ${batchSize}, offset: ${startFrom}, manufacturer: ${manufacturerFilter || 'all'}`);

  // Get colors that need reference bundles
  let query = supabase
    .from('vinyl_swatches')
    .select('id, manufacturer, name, code, finish, series')
    .eq('verified', true);

  if (!forceRefresh) {
    query = query.eq('has_reference_bundle', false);
  }

  if (manufacturerFilter) {
    query = query.ilike('manufacturer', `%${manufacturerFilter}%`);
  }

  const { data: colors, error: fetchError } = await query
    .order('manufacturer', { ascending: true })
    .order('name', { ascending: true })
    .range(startFrom, startFrom + batchSize - 1);

  if (fetchError) {
    console.error('Error fetching colors:', fetchError);
    return;
  }

  if (!colors || colors.length === 0) {
    console.log('No colors found needing reference bundles');
    return;
  }

  console.log(`Processing ${colors.length} colors in background`);

  for (const color of colors) {
    try {
      console.log(`Processing: ${color.manufacturer} ${color.name}`);

      // Search for reference images
      const images = await searchVinylImages(
        supabaseUrl,
        supabaseServiceKey,
        color.manufacturer,
        color.name,
        color.code
      );

      // Determine if this is a flip film
      const flipFilm = isFlipFilm(color.name);

      if (images.length > 0) {
        // Store reference images
        const insertData = images.map(img => ({
          swatch_id: color.id,
          manufacturer: color.manufacturer,
          color_name: color.name,
          product_code: color.code,
          image_url: img.url,
          source_url: img.source,
          image_type: img.isVehicle ? 'vehicle_installation' : 'product_sheet',
          search_query: `${color.manufacturer} ${color.code || ''} ${color.name} vinyl wrap on vehicle`,
          color_characteristics: {
            finish: color.finish,
            series: color.series,
            is_flip: flipFilm
          }
        }));

        // Upsert to handle duplicates
        const { error: insertError } = await supabase
          .from('vinyl_reference_images')
          .upsert(insertData, { 
            onConflict: 'swatch_id,image_url',
            ignoreDuplicates: true 
          });

        if (insertError) {
          console.error(`Error inserting references for ${color.name}:`, insertError);
        }
      }

      // Update swatch with flags
      const { error: updateError } = await supabase
        .from('vinyl_swatches')
        .update({
          has_reference_bundle: images.length > 0,
          is_flip_film: flipFilm,
          needs_reference_review: flipFilm,
          reference_image_count: images.length
        })
        .eq('id', color.id);

      if (updateError) {
        console.error(`Error updating swatch ${color.name}:`, updateError);
      }

      console.log(`✅ Completed: ${color.manufacturer} ${color.name} - ${images.length} images`);

      // Rate limit to respect API limits (300ms between calls)
      await new Promise(resolve => setTimeout(resolve, 300));

    } catch (colorError) {
      console.error(`Error processing ${color.manufacturer} ${color.name}:`, colorError);
    }
  }

  console.log(`✅ Backfill batch complete for ${manufacturerFilter || 'all manufacturers'}`);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createExternalClient();

    // Parse request body for optional parameters
    let batchSize = 50;
    let startFrom = 0;
    let manufacturerFilter: string | null = null;
    let forceRefresh = false;

    try {
      const body = await req.json();
      batchSize = body.batchSize || 50;
      startFrom = body.startFrom || 0;
      manufacturerFilter = body.manufacturerFilter || body.manufacturer || null;
      forceRefresh = body.forceRefresh || false;
    } catch {
      // Use defaults if no body
    }

    // Get count of remaining colors before starting
    let countQuery = supabase
      .from('vinyl_swatches')
      .select('*', { count: 'exact', head: true })
      .eq('verified', true)
      .eq('has_reference_bundle', false);

    if (manufacturerFilter) {
      countQuery = countQuery.ilike('manufacturer', `%${manufacturerFilter}%`);
    }

    const { count: remainingCount } = await countQuery;

    // Start background processing
    EdgeRuntime.waitUntil(
      processBackfill(
        supabaseUrl,
        supabaseServiceKey,
        batchSize,
        startFrom,
        manufacturerFilter,
        forceRefresh
      )
    );

    // Return immediately
    return new Response(JSON.stringify({
      success: true,
      message: `Backfill started in background for ${manufacturerFilter || 'all manufacturers'}`,
      stats: {
        batchSize,
        startFrom,
        remainingColors: remainingCount || 0,
        manufacturer: manufacturerFilter || 'all'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Backfill error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Handle shutdown gracefully
addEventListener('beforeunload', (ev: Event) => {
  console.log('Function shutting down, backfill may be incomplete:', (ev as any).detail?.reason);
});