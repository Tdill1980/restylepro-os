import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// CRITICAL: Only accept actual image URLs, never product/collection pages
function isActualImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const lowerUrl = url.toLowerCase();
  
  // MUST have image file extension
  const hasImageExtension = /\.(jpg|jpeg|png|webp|gif|bmp|tiff?)(\?.*)?$/i.test(url);
  
  // Reject any /products/, /collections/, /posts/, HTML pages
  const invalidPatterns = [
    /\/products\//i,
    /\/product\//i,
    /\/collections\//i,
    /\/posts\//i,
    /\.html(\?|$)/i,
    /facebook\.com/i,
    /youtube\.com/i,
    /pinterest\.com/i,
    /tiktok\.com/i,
    /amazon\.com/i,
    /ebay\.com/i,
  ];
  
  if (invalidPatterns.some(p => p.test(url))) {
    console.log(`❌ Rejected non-image URL: ${url.substring(0, 60)}...`);
    return false;
  }
  
  // Accept if has image extension OR is from known CDN
  if (hasImageExtension) return true;
  
  const knownCdnPatterns = [
    /cdn\./i,
    /\.cloudfront\./i,
    /googleusercontent\.com/i,
    /cloudinary\.com/i,
    /imgur\.com/i,
    /\.shopify\.com.*\/files\//i,
  ];
  
  return knownCdnPatterns.some(p => p.test(url));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { manufacturer, colorName, productCode } = await req.json();
    
    if (!manufacturer || !colorName) {
      return new Response(
        JSON.stringify({ error: 'manufacturer and colorName are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const DATAFORSEO_API_KEY = Deno.env.get('DATAFORSEO_API_KEY');
    if (!DATAFORSEO_API_KEY) {
      throw new Error('DATAFORSEO_API_KEY not configured');
    }

    console.log(`Searching for: ${manufacturer} ${colorName} ${productCode || ''} vinyl wrap`);

    // Construct search query - prioritize vehicle installation photos
    const searchQuery = productCode 
      ? `${manufacturer} ${productCode} ${colorName} vinyl wrap on vehicle`
      : `${manufacturer} ${colorName} vinyl wrap on vehicle`;

    // DataForSEO Google Images API request
    const response = await fetch('https://api.dataforseo.com/v3/serp/google/images/live/advanced', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${DATAFORSEO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        {
          keyword: searchQuery,
          location_code: 2840, // United States
          language_code: "en",
          device: "desktop",
          depth: 20, // Get top 20 results
        }
      ])
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DataForSEO API error:', response.status, errorText);
      throw new Error(`DataForSEO API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('DataForSEO response status:', data.status_code);

    if (data.status_code !== 20000) {
      throw new Error(`DataForSEO error: ${data.status_message}`);
    }

    const results = data.tasks?.[0]?.result?.[0]?.items || [];
    console.log(`Found ${results.length} image results`);

    // Filter for high-quality vehicle wrap photos with VALID IMAGE URLs
    // DataForSEO returns: url (image), source_url (page), title, alt
    const vehiclePhotos = results
      .filter((item: any) => {
        // CRITICAL: Must be actual image URL, not product page
        if (!item.url || !isActualImageUrl(item.url)) {
          return false;
        }
        
        const title = (item.title || '').toLowerCase();
        const altText = (item.alt || '').toLowerCase();
        const sourceUrl = (item.source_url || '').toLowerCase();
        
        // Look for vehicle-related keywords
        const hasVehicleKeywords = 
          title.includes('wrap') || title.includes('vehicle') || title.includes('car') ||
          altText.includes('wrap') || altText.includes('vehicle') || altText.includes('car') ||
          sourceUrl.includes('wrap');
        
        // Exclude irrelevant sources
        const isRelevantSource = !sourceUrl.includes('pinterest') && !sourceUrl.includes('tiktok');
        
        return hasVehicleKeywords && isRelevantSource;
      })
      .slice(0, 3) // Top 3 vehicle photos
      .map((item: any) => ({
        url: item.url,
        title: item.title,
        source: item.source_url,
      }));

    console.log(`Filtered to ${vehiclePhotos.length} vehicle wrap photos`);

    // Fallback: if no vehicle photos, try product sheet/swatch images with valid URLs
    let fallbackPhotos: any[] = [];
    if (vehiclePhotos.length === 0) {
      console.log('No vehicle photos found, falling back to product sheets');
      fallbackPhotos = results
        .filter((item: any) => item.url && isActualImageUrl(item.url))
        .slice(0, 2)
        .map((item: any) => ({
          url: item.url,
          title: item.title,
          source: item.source_url,
        }));
      console.log(`Fallback found ${fallbackPhotos.length} valid product sheet images`);
    }

    const finalPhotos = vehiclePhotos.length > 0 ? vehiclePhotos : fallbackPhotos;

    return new Response(
      JSON.stringify({
        success: true,
        query: searchQuery,
        photos: finalPhotos,
        photoType: vehiclePhotos.length > 0 ? 'vehicle_installation' : 'product_sheet',
        totalFound: results.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-vinyl-product-images:', error);
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
