import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SPIN_VIEW_ANGLES, getSpinViewAngle, isValidAngle } from "../_shared/spin-view-angles.ts";
import { buildFadeWrapsPrompt } from "../_shared/fadewraps-prompt-builder.ts";
import { buildApproveModePrompt } from "../_shared/approvemode-prompt-builder.ts";
import { buildRestyleProRenderPrompt } from "../_shared/render-prompt-builder.ts";
import { buildRevisionPromptBlock, validateRevisionRequest } from "../_shared/revision-prompt-engine.ts";
import { buildColorProPrompt } from "../_shared/colorpro-prompt-builder.ts";
import { buildGraphicsProPrompt, detectFamousLivery, type FamousLivery } from "../_shared/graphicspro-prompt-builder.ts";
import { runColorProEnhancedPreProcessor, formatEnhancedFilmZones, formatEnhancedGraphics } from "../_shared/colorpro-enhanced-preprocessor.ts";
import { getFadeReferenceInfo, buildFadeReferencePromptSection, STANDARD_FADE_REFERENCE_URL, buildColorSubstitutionPrompt } from "../_shared/fade-reference-images.ts";
import { buildVisualReferenceGuidance } from "../_shared/fadewraps-prompt-builder.ts";

// === GraphicsPro Label Helpers - ALWAYS generates intelligent labels ===
const KNOWN_FILMS_MAP: Record<string, string> = {
  gold: "TeckWrap Chrome Gold",
  silver: "TeckWrap Chrome Silver",
  red: "Oracal Gloss Red Metallic",
  blue: "3M 2080 Gloss Blue Metallic",
  white: "KPMF Gloss White",
  black: "3M 2080 Gloss Black",
  purple: "3M Gloss Plum Explosion",
  green: "Avery Dennison Gloss Green",
  orange: "Avery Dennison Gloss Orange",
  yellow: "3M Gloss Bright Yellow",
  bronze: "KPMF Gloss Bronze",
  copper: "Avery Dennison Gloss Copper Metallic",
  gray: "3M Gloss Anthracite",
  grey: "3M Gloss Anthracite",
  pink: "Avery Dennison Gloss Pink",
  teal: "3M 2080 Gloss Teal",
  navy: "KPMF Gloss Dark Blue",
  beige: "Avery Dennison Matte Beige",
  brown: "3M 2080 Matte Brown Metallic",
  champagne: "KPMF Gloss Champagne Gold",
  rose: "TeckWrap Rose Gold",
  mint: "Avery Dennison Matte Mint",
  lavender: "3M Gloss Lavender",
  burgundy: "KPMF Gloss Wine Red",
  charcoal: "3M 2080 Gloss Charcoal Metallic",
};

function cap(str: string): string {
  if (!str) return '';
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

// INTELLIGENT film label picker - NEVER returns generic labels
function pickFilm(hint: string): string {
  if (!hint) return "Avery Dennison Gloss Black";
  const lower = hint.toLowerCase();
  
  // Check for explicit manufacturer mentions FIRST
  if (lower.includes('3m')) {
    const colorMatch = Object.keys(KNOWN_FILMS_MAP).find(c => lower.includes(c));
    return colorMatch ? `3M 2080 ${cap(lower.includes('matte') ? 'Matte' : lower.includes('satin') ? 'Satin' : 'Gloss')} ${cap(colorMatch)}` : '3M 2080 Gloss Black';
  }
  if (lower.includes('avery')) {
    const colorMatch = Object.keys(KNOWN_FILMS_MAP).find(c => lower.includes(c));
    return colorMatch ? `Avery Dennison ${cap(lower.includes('matte') ? 'Matte' : lower.includes('satin') ? 'Satin' : 'Gloss')} ${cap(colorMatch)}` : 'Avery Dennison Gloss Black';
  }
  if (lower.includes('kpmf')) {
    const colorMatch = Object.keys(KNOWN_FILMS_MAP).find(c => lower.includes(c));
    return colorMatch ? `KPMF ${cap(lower.includes('matte') ? 'Matte' : lower.includes('satin') ? 'Satin' : 'Gloss')} ${cap(colorMatch)}` : 'KPMF Gloss Black';
  }
  if (lower.includes('teckwrap')) {
    const colorMatch = Object.keys(KNOWN_FILMS_MAP).find(c => lower.includes(c));
    return colorMatch ? `TeckWrap ${cap(lower.includes('chrome') ? 'Chrome' : lower.includes('matte') ? 'Matte' : 'Gloss')} ${cap(colorMatch)}` : 'TeckWrap Gloss Black';
  }
  if (lower.includes('oracal')) {
    const colorMatch = Object.keys(KNOWN_FILMS_MAP).find(c => lower.includes(c));
    return colorMatch ? `Oracal ${cap(lower.includes('matte') ? 'Matte' : 'Gloss')} ${cap(colorMatch)}` : 'Oracal Gloss Black';
  }
  if (lower.includes('hexis')) {
    const colorMatch = Object.keys(KNOWN_FILMS_MAP).find(c => lower.includes(c));
    return colorMatch ? `Hexis ${cap(lower.includes('matte') ? 'Matte' : 'Gloss')} ${cap(colorMatch)}` : 'Hexis Gloss Black';
  }
  if (lower.includes('inozetek')) {
    const colorMatch = Object.keys(KNOWN_FILMS_MAP).find(c => lower.includes(c));
    return colorMatch ? `Inozetek ${cap(lower.includes('matte') ? 'Matte' : 'Gloss')} ${cap(colorMatch)}` : 'Inozetek Gloss Black';
  }
  
  // Check for color + finish combinations from our map
  for (const [color, film] of Object.entries(KNOWN_FILMS_MAP)) {
    if (lower.includes(color)) {
      if (lower.includes("matte")) return film.replace("Gloss", "Matte").replace("Chrome", "Matte");
      if (lower.includes("satin")) return film.replace("Gloss", "Satin").replace("Chrome", "Satin");
      if (lower.includes("chrome")) return `TeckWrap Chrome ${cap(color)}`;
      if (lower.includes("brushed")) return `3M 2080 Brushed ${cap(color)}`;
      if (lower.includes("metallic")) return film.includes("Metallic") ? film : film + " Metallic";
      return film;
    }
  }
  
  // Fallback with intelligent manufacturer selection based on finish
  if (lower.includes('chrome')) return 'TeckWrap Chrome Black';
  if (lower.includes('matte')) return '3M 2080 Matte Black';
  if (lower.includes('satin')) return 'Avery Dennison Satin Black';
  if (lower.includes('brushed')) return '3M 2080 Brushed Black Metallic';
  
  return "Avery Dennison Gloss Black";
}

// Parse GraphicsPro label from styling prompt - ALWAYS returns descriptive label
function parseGraphicsProLabel(prompt: string): string {
  if (!prompt || !prompt.trim()) return "Avery Dennison Gloss Black";
  const lower = prompt.toLowerCase().trim();

  // Two-tone: "top half X, bottom half Y"
  const twoToneMatch = lower.match(/(?:top\s*half|upper\s*(?:half)?)\s+(.+?)(?:,|\s+)(?:bottom\s*half|lower\s*(?:half)?)\s+(.+?)(?:\.|$)/i);
  if (twoToneMatch) {
    return `${pickFilm(twoToneMatch[1])} | ${pickFilm(twoToneMatch[2])}`;
  }

  // Chrome delete
  if (/chrome\s*delete/i.test(lower)) {
    const colorMatch = lower.match(/(matte|satin|gloss)?\s*(black|white|gray|grey)/i);
    if (colorMatch) return `${cap(colorMatch[1] || 'Matte')} ${cap(colorMatch[2])} Chrome Delete`;
    return "Matte Black Chrome Delete";
  }

  // Racing stripes
  if (/stripe/i.test(lower)) {
    const colorMatch = lower.match(/(white|black|red|blue|gold|silver|orange|yellow|green)\s*(?:racing\s*)?stripe/i);
    if (colorMatch) return `${cap(colorMatch[1])} Racing Stripes`;
    return "White Racing Stripes";
  }

  // Roof wrap
  if (/roof\s*(?:wrap|only)/i.test(lower)) {
    const colorMatch = lower.match(/(black|white|carbon|gloss|matte|satin)/i);
    if (colorMatch) return `${cap(colorMatch[1])} Roof Wrap`;
    return "Gloss Black Roof Wrap";
  }

  // Accent/trim package
  if (/accent|trim\s*(?:package|wrap)/i.test(lower)) {
    const colorMatch = lower.match(/(black|chrome|carbon|gold|silver)/i);
    if (colorMatch) return `${cap(colorMatch[1])} Accent Package`;
    return "Gloss Black Accent Package";
  }

  // Mirror caps
  if (/mirror\s*cap/i.test(lower)) {
    const colorMatch = lower.match(/(black|carbon|chrome|white)/i);
    if (colorMatch) return `${cap(colorMatch[1])} Mirror Caps`;
    return "Carbon Fiber Mirror Caps";
  }

  // Full body wrap
  const fullBodyMatch = lower.match(/(?:full\s*(?:body|wrap)|entire\s*(?:car|vehicle))\s*(?:in\s*)?(.+?)(?:\.|$)/i);
  if (fullBodyMatch) return pickFilm(fullBodyMatch[1]);

  // Fallback: extract colors and generate label
  return pickFilm(prompt);
}

// Helper function to validate that a URL is an actual image, not a product page
function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  const lowerUrl = url.toLowerCase();
  
  // Reject known non-image URLs (product pages, videos, listings)
  const invalidPatterns = [
    /amazon\.com\/(dp|gp|product)\//i,
    /amazon\.com\/.*\/dp\//i,
    /youtube\.com\/watch/i,
    /youtu\.be\//i,
    /ebay\.com\/itm/i,
    /buywrap\.com\/products/i,
    /metrorestyling\.com\/products/i,
    /rvinyl\.com\/products/i,
    /\/products\//i,
    /\/product\//i,
  ];
  
  if (invalidPatterns.some(p => p.test(url))) {
    console.log(`❌ Rejected invalid URL (product page): ${url.substring(0, 80)}...`);
    return false;
  }
  
  // Accept URLs with image file extensions
  const imageExtensions = /\.(jpg|jpeg|png|webp|gif|bmp|tiff?)(\?.*)?$/i;
  if (imageExtensions.test(url)) return true;
  
  // Accept URLs from known CDN/image hosting patterns
  const validCdnPatterns = [
    /cdn\./i,
    /\.cloudfront\./i,
    /supabase.*storage/i,
    /googleusercontent\.com/i,
    /imgur\.com/i,
    /cloudinary\.com/i,
    /images?\./i,
    /\/images?\//i,
    /media\./i,
    /static\./i,
  ];
  
  if (validCdnPatterns.some(p => p.test(url))) return true;
  
  // Default: reject unknown URLs to be safe
  console.log(`⚠️ Rejected unknown URL format: ${url.substring(0, 80)}...`);
  return false;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 generate-color-render INVOKED - Timestamp:', new Date().toISOString());
    
    const requestBody = await req.json();
    const { 
      vehicleYear, 
      vehicleMake, 
      vehicleModel, 
      colorData, 
      modeType, 
      viewType = 'front', 
      cameraAngle, // NEW: Specific angle for 360° generation (0-330 in 30° increments)
      userEmail,
      // OPTIMIZATION: Skip redundant lookups for additional views
      skipLookups = false,
      cachedMaterialProfile = null,
      cachedReferenceUrls = null,
      // REVISION SYSTEM: User-provided modification instructions
      revisionPrompt = null,
      // CUSTOM STYLING MODE: Job ID for saving results
      customStylingJobId = null,
      // Support customStylingPrompt at top level for additional views
      customStylingPrompt: topLevelStylingPrompt = null,
      // STRIPE MODE: Preset category from frontend
      presetCategory = null,
      selectedPreset = null,
      styleDescription = null,
      // Studio / camera overrides from frontend
      tool = null,
      studio = null,
      cameraProfile = null,
      lighting = null,
      disableAutoStudio = false,
      // FadeWraps: allow passing full URL for the standard fade reference (optional)
      standardFadeReferenceUrl: standardFadeReferenceUrlOverride = null,
    } = requestBody;

    // Resolve a FULL URL for the FadeWraps gold-standard reference image
    // V1 FIX: STANDARD_FADE_REFERENCE_URL is now a hardcoded full Supabase URL
    // No longer relying on requestOrigin which could be null
    const standardFadeReferenceUrl =
      (typeof standardFadeReferenceUrlOverride === 'string' && standardFadeReferenceUrlOverride.startsWith('http'))
        ? standardFadeReferenceUrlOverride
        : STANDARD_FADE_REFERENCE_URL; // This is now a full URL, not a relative path
    
    // HARD OVERRIDE: Force dedicated FadeWraps studio + camera when tool is fadewraps
    let effectiveStudio = studio;
    let effectiveCameraProfile = cameraProfile;
    let effectiveLighting = lighting;
    let effectiveDisableAutoStudio = disableAutoStudio;
    const effectiveTool = tool || modeType;

    if (effectiveTool === 'fadewraps' || modeType === 'fadewraps') {
      effectiveStudio = 'fadewraps_performance';
      effectiveCameraProfile = 'full_vehicle';
      effectiveLighting = 'neutral_studio';
      effectiveDisableAutoStudio = true;
    }
    
    // Merge customStylingPrompt from top level into colorData if missing
    const effectiveColorData = colorData ? {
      ...colorData,
      customStylingPrompt: colorData.customStylingPrompt || topLevelStylingPrompt
    } : (topLevelStylingPrompt ? { customStylingPrompt: topLevelStylingPrompt } : null);

    // ============= SECURITY: REQUIRE AUTHENTICATION =============
    // Block anonymous/unauthenticated requests entirely
    if (!userEmail) {
      console.log('❌ SECURITY: No userEmail provided - blocking anonymous request');
      return new Response(
        JSON.stringify({ 
          error: 'Authentication required. Please log in to generate renders.',
          authRequired: true
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============= CONTENT MODERATION =============
    // Initialize Supabase client early for moderation checks
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if user is blocked
    const { data: blockedUser } = await supabase
      .from('blocked_users')
      .select('id, reason')
      .eq('email', userEmail)
      .maybeSingle();
    
    if (blockedUser) {
      console.log('❌ SECURITY: Blocked user attempted generation:', userEmail);
      return new Response(
        JSON.stringify({ 
          error: 'Your account has been suspended. Contact support for assistance.',
          blocked: true
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Expanded blocklist: Political, Pornography, Profanity, Hate Speech, Drugs
    const BLOCKED_TERMS = [
      // Political/Terrorism
      'palestine', 'israel', 'hamas', 'hezbollah', 'isis', 'taliban',
      'nazi', 'swastika', 'confederate', 'rebel fist', 'freedom fighter',
      'political', 'terrorist', 'militia', 'uprising', 'revolution',
      'genocide', 'ethnic cleansing', 'war crime',
      
      // Pornography/Adult Content
      'porn', 'xxx', 'nude', 'naked', 'sex', 'erotic', 'hentai', 
      'nsfw', 'adult content', 'explicit', 'genitals', 'breasts',
      'penetration', 'orgasm', 'fetish', 'bondage',
      
      // Profanity (common vulgar terms)
      'fuck', 'shit', 'bitch', 'cunt', 'dick', 'cock', 'pussy',
      'asshole', 'bastard', 'whore', 'slut',
      
      // Hate Speech/Slurs
      'nigger', 'faggot', 'retard', 'kike', 'spic', 'chink',
      'wetback', 'beaner', 'white power', 'black power',
      'racial slur', 'hate speech',
      
      // Drug Paraphernalia
      'crack pipe', 'drug paraphernalia'
    ];
    
    const contentToCheck = [
      colorData?.colorName,
      colorData?.patternName,
      colorData?.designName,
      colorData?.customStylingPrompt,
      vehicleMake,
      vehicleModel
    ].filter(Boolean).join(' ').toLowerCase();
    
    const blockedTermFound = BLOCKED_TERMS.find(term => contentToCheck.includes(term));
    
    if (blockedTermFound) {
      console.log('❌ SECURITY: Content moderation violation detected - term:', blockedTermFound);
      
      // Log the blocked attempt for audit
      await supabase.from('moderation_log').insert({
        user_email: userEmail,
        blocked_term: blockedTermFound,
        attempted_content: contentToCheck.substring(0, 500),
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || null
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Content policy violation. This type of content is not allowed.',
          contentViolation: true
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Log revision prompt if present
    if (revisionPrompt) {
      console.log('📝 REVISION MODE - User revision instructions:', revisionPrompt);
    }
    
    console.log('📦 Request body received:', JSON.stringify({ 
      vehicleYear, 
      vehicleMake, 
      vehicleModel, 
      modeType, 
      viewType, 
      cameraAngle, 
      colorData: colorData ? { ...colorData, hex: colorData.hex } : null,
      userEmail 
    }, null, 2));

    // ============= GOLDEN TEMPLATE CACHE LOOKUP =============
    // Check if we have a cached "perfect" render for this exact request
    if (modeType === 'GraphicsPro' && effectiveColorData?.customStylingPrompt && !revisionPrompt) {
      const promptSignature = effectiveColorData.customStylingPrompt.toLowerCase().trim();
      const vehicleSignature = `${vehicleYear} ${vehicleMake} ${vehicleModel}`;
      
      console.log('🔍 Checking golden template cache for:', { promptSignature, vehicleSignature });
      
      const { data: goldenTemplate, error: cacheError } = await supabase
        .from('render_templates')
        .select('*')
        .eq('prompt_signature', promptSignature)
        .eq('vehicle_signature', vehicleSignature)
        .eq('is_golden_template', true)
        .maybeSingle();
      
      if (cacheError) {
        console.log('⚠️ Golden template lookup error:', cacheError.message);
      } else if (goldenTemplate && goldenTemplate.render_urls) {
        console.log('✅ GOLDEN TEMPLATE CACHE HIT! Returning cached perfect render');
        
        // Increment use count
        await supabase
          .from('render_templates')
          .update({ use_count: (goldenTemplate.use_count || 0) + 1 })
          .eq('id', goldenTemplate.id);
        
        // Return the cached render for the requested view
        const cachedUrls = goldenTemplate.render_urls as Record<string, string>;
        const cachedUrl = cachedUrls[viewType] || cachedUrls['side'] || Object.values(cachedUrls)[0];
        
        if (cachedUrl) {
          return new Response(
            JSON.stringify({ 
              success: true, 
              renderUrl: cachedUrl,
              allViews: cachedUrls,
              fromCache: true,
              cacheTemplateId: goldenTemplate.id,
              message: 'Served from golden template cache'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        console.log('📭 No golden template found, proceeding with AI generation');
      }
    }

    // Validate cameraAngle if provided
    if (cameraAngle !== undefined && !isValidAngle(cameraAngle)) {
      return new Response(
        JSON.stringify({ 
          error: `Invalid camera angle: ${cameraAngle}. Must be one of: ${SPIN_VIEW_ANGLES.map(v => v.angle).join(', ')}` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!vehicleYear || !vehicleMake || !vehicleModel || !modeType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Declare web search variables at function scope for ColorPro custom colors
    let webSearchPhotos: any[] = [];
    let validatedColorData: any = null;

    // ============= CHECK ADMIN/TESTER ROLE FIRST (BYPASS LIMITS) =============
    let isPrivilegedUser = false;
    if (userEmail) {
      try {
        console.log('🔍 Checking admin/tester role for email:', userEmail);
        
        // Get the authenticated user from the JWT token in the request
        const authHeader = req.headers.get('Authorization');
        if (authHeader) {
          const token = authHeader.replace('Bearer ', '');
          const { data: { user }, error: authUserError } = await supabase.auth.getUser(token);
          
          if (authUserError) {
            console.log('⚠️ Could not verify auth token:', authUserError.message);
          } else if (user) {
            console.log('✅ Authenticated user ID:', user.id);
            
            // Check if this specific user has admin OR tester role
            const { data: userRoleData, error: roleError } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', user.id)
              .in('role', ['admin', 'tester']);
            
            if (roleError) {
              console.log('⚠️ Role check error:', roleError.message);
            } else if (userRoleData && userRoleData.length > 0) {
              isPrivilegedUser = true;
              const roles = userRoleData.map(r => r.role).join(', ');
              console.log(`✅ Privileged user detected (${roles}) - bypassing render limits`);
            } else {
              console.log('ℹ️ User is authenticated but not admin/tester');
            }
          }
        } else {
          console.log('ℹ️ No auth header provided');
        }
      } catch (error) {
        console.error('❌ Role check exception:', error);
      }
    }

    // ============= CHECK RENDER LIMITS (NON-PRIVILEGED ONLY) =============
    if (!isPrivilegedUser) {
      console.log('🔒 Checking render limits for:', userEmail);
      
      try {
        // First check subscription-based limits via RPC
        const { data: limitCheck, error: limitError } = await supabase
          .rpc('can_generate_render', { user_email: userEmail });

        if (limitError) {
          console.error('Error checking subscription limits:', limitError);
        } else if (limitCheck && !limitCheck.can_generate) {
          console.log('❌ Subscription render limit exceeded:', limitCheck);
          return new Response(
            JSON.stringify({ 
              error: limitCheck.message,
              limitExceeded: true,
              limitStatus: limitCheck
            }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // SECONDARY CHECK: Hard limit for non-subscribed users (prevent freemium abuse)
        // Check renders in last 24 hours for this email
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: recentRenders, error: recentError } = await supabase
          .from('color_visualizations')
          .select('id', { count: 'exact', head: true })
          .eq('customer_email', userEmail)
          .gte('created_at', twentyFourHoursAgo);
        
        if (!recentError && recentRenders !== null) {
          const renderCount = (recentRenders as any)?.length || 0;
          const FREEMIUM_DAILY_LIMIT = 2;
          
          // If no active subscription and exceeded daily limit
          if (!limitCheck?.can_generate && renderCount >= FREEMIUM_DAILY_LIMIT) {
            console.log(`❌ Freemium daily limit exceeded: ${renderCount}/${FREEMIUM_DAILY_LIMIT}`);
            return new Response(
              JSON.stringify({ 
                error: 'Daily render limit reached. Please subscribe for unlimited renders.',
                limitExceeded: true,
                dailyLimit: FREEMIUM_DAILY_LIMIT,
                used: renderCount
              }),
              { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
        
        console.log('✅ Render limits OK:', limitCheck);
      } catch (error) {
        console.error('Limit check exception:', error);
        // Block on limit check failure for security
        return new Response(
          JSON.stringify({ error: 'Could not verify render limits. Please try again.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // FadeWraps and WBTY both use patterns, others use solid colors
    if ((modeType === 'wbty' || modeType === 'fadewraps') && !colorData) {
      return new Response(
        JSON.stringify({ error: 'colorData required for pattern-based modes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (modeType !== 'wbty' && modeType !== 'fadewraps' && modeType !== 'approvemode' && modeType !== 'CustomStyling' && modeType !== 'ColorProEnhanced' && !colorData) {
      return new Response(
        JSON.stringify({ error: 'colorData required for non-WBTY modes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ColorProEnhanced requires a styling prompt (check effectiveColorData which merges top-level prompt)
    if (modeType === 'ColorProEnhanced' && (!effectiveColorData || !effectiveColorData.customStylingPrompt)) {
      console.log('❌ ColorProEnhanced missing customStylingPrompt. colorData:', colorData, 'topLevelPrompt:', topLevelStylingPrompt);
      return new Response(
        JSON.stringify({ error: 'customStylingPrompt required for ColorProEnhanced mode' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============= GRAPHICSPRO PRINT-ONLY CONTENT DETECTION =============
    // GraphicsPro handles COLOR-CHANGE FILM only, not printed designs
    if ((modeType === 'GraphicsPro' || modeType === 'ColorProEnhanced') && effectiveColorData?.customStylingPrompt) {
      const PRINT_ONLY_KEYWORDS = [
        'photo', 'picture', 'image', 'galaxy', 'marble', 'camo', 'camouflage',
        'printed', 'print', 'texture', 'realistic flames', 'photo wrap',
        'forest', 'ocean', 'sunset', 'landscape', 'portrait', 'graphic design',
        'artwork', 'illustration', 'digital print', 'full print'
      ];
      
      const promptLower = effectiveColorData.customStylingPrompt.toLowerCase();
      const printKeywordFound = PRINT_ONLY_KEYWORDS.find(kw => promptLower.includes(kw));
      
      if (printKeywordFound) {
        console.log('🎨 PRINT-ONLY CONTENT DETECTED in GraphicsPro prompt:', printKeywordFound);
        return new Response(
          JSON.stringify({ 
            error: 'print_required',
            message: 'This design requires printing. GraphicsPro™ handles color-change film only. Try DesignPanelPro™ for printed wraps, textures, and photo-based designs.'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ApproveMode requires a design URL
    if (modeType === 'approvemode' && (!colorData || !colorData.designUrl)) {
      return new Response(
        JSON.stringify({ error: 'designUrl required for ApproveMode' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
    if (!GOOGLE_AI_API_KEY) {
      console.error('GOOGLE_AI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Helper function to convert image URL to base64 for Gemini API
    async function imageUrlToBase64(url: string): Promise<{ mimeType: string; data: string } | null> {
      try {
        // If already a data URL, extract the base64 part
        if (url.startsWith('data:')) {
          const matches = url.match(/^data:([^;]+);base64,(.+)$/);
          if (matches) {
            return { mimeType: matches[1], data: matches[2] };
          }
          return null;
        }

        // Fetch the image and convert to base64
        const response = await fetch(url);
        if (!response.ok) {
          console.warn(`Failed to fetch image: ${url}`);
          return null;
        }

        const contentType = response.headers.get('content-type') || 'image/png';
        const arrayBuffer = await response.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

        return { mimeType: contentType, data: base64 };
      } catch (error) {
        console.warn(`Error converting image to base64: ${url}`, error);
        return null;
      }
    }

    // ============= RENDER CACHING LOGIC =============
    // Check if we already have a cached render for this exact request
    console.log('🔍 Checking cache for existing render...');
    
    try {
      // Some modes (like FadeWraps) intentionally skip cache to guarantee fresh renders
      let skipCache = false;

      let cacheQuery = supabase
        .from('color_visualizations')
        .select('id, render_urls, generation_status')
        .eq('vehicle_year', parseInt(vehicleYear))
        .eq('vehicle_make', vehicleMake.trim().toLowerCase())
        .eq('vehicle_model', vehicleModel.trim().toLowerCase())
        .eq('mode_type', modeType)
        .eq('generation_status', 'completed');

      // Add mode-specific cache matching
      if (modeType === 'approvemode' && effectiveColorData?.designUrl) {
        cacheQuery = cacheQuery.eq('custom_design_url', effectiveColorData.designUrl);
      } else if ((modeType === 'CustomStyling' || modeType === 'ColorProEnhanced' || modeType === 'GraphicsPro') && effectiveColorData?.customStylingPrompt) {
        // ==========================================================
        // COLORPRO ENHANCED CACHE — PROMPT-SPECIFIC MATCHING
        // ==========================================================
        const promptKey = effectiveColorData.customStylingPrompt
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim()
          .substring(0, 200);
        cacheQuery = cacheQuery.eq('custom_styling_prompt_key', promptKey);
        console.log('🆕 Using ColorProEnhanced promptKey:', promptKey);
      } else if ((modeType === 'inkfusion' || modeType === 'colorpro' || modeType === 'ColorPro') && effectiveColorData?.colorName) {
        // For color modes, match BOTH color name AND hex code to prevent manufacturer collisions
        cacheQuery = cacheQuery.eq('color_name', effectiveColorData.colorName);
        if (effectiveColorData?.hex) {
          cacheQuery = cacheQuery.eq('color_hex', effectiveColorData.hex);
        }
      } else if (modeType === 'wbty' && effectiveColorData?.patternUrl) {
        // For WBTY pattern mode, match on pattern URL
        cacheQuery = cacheQuery.eq('custom_swatch_url', effectiveColorData.patternUrl);
      } else if (modeType === 'fadewraps') {
        // For FadeWraps, SKIP caching entirely to force fresh generation
        // FadeWraps prompt engineering is actively being developed and cached renders may have wrong fade direction
        console.log('⚠️ FADEWRAPS: Skipping cache - always generate fresh render for fade direction accuracy');
        skipCache = true;
      } else if (modeType === 'designpanelpro' && effectiveColorData?.panelUrl) {
        // For DesignPanelPro, match on the specific panel URL
        cacheQuery = cacheQuery.eq('custom_swatch_url', effectiveColorData.panelUrl);
      }

      if (!skipCache) {
        const { data: cachedRenders, error: cacheError } = await cacheQuery.limit(1).maybeSingle();

        if (cacheError) {
          console.warn('Cache lookup error:', cacheError);
        } else if (cachedRenders && cachedRenders.render_urls) {
          // Check if the specific view exists in cached renders
          const renderUrls = cachedRenders.render_urls as Record<string, any>;
          
          // 360° spin: Check for specific angle in spin_views
          if (cameraAngle !== undefined) {
            const spinViews = renderUrls.spin_views as Record<number, string> | undefined;
            const cachedAngleUrl = spinViews?.[cameraAngle];
            
            if (cachedAngleUrl) {
              console.log(`✅ Cache HIT! Found existing 360° angle ${cameraAngle}° render`);
              return new Response(
                JSON.stringify({ 
                  renderUrl: cachedAngleUrl,
                  cached: true,
                  cacheId: cachedRenders.id
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            } else {
              console.log(`⚠️ Cache MISS for 360° angle ${cameraAngle}°, proceeding with generation`);
            }
          } else {
            // Legacy view type cache lookup
            const cachedViewUrl = renderUrls[viewType];
            
            if (cachedViewUrl) {
              console.log(`✅ Cache HIT! Found existing ${viewType} render`);
              return new Response(
                JSON.stringify({ 
                  renderUrl: cachedViewUrl,
                  cached: true,
                  cacheId: cachedRenders.id
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            } else {
              console.log(`⚠️ Cache PARTIAL: Found record but missing ${viewType} view`);
            }
          }
        } else {
          console.log('❌ Cache MISS: No matching render found, proceeding with generation');
        }
      } else {
        console.log('🧹 Cache completely bypassed for this mode, forcing fresh generation.');
      }
    } catch (cacheCheckError) {
      console.error('Error checking cache:', cacheCheckError);
      // Continue with generation if cache check fails
    }
    // ============= END CACHING LOGIC =============

    const vehicle = `${vehicleYear} ${vehicleMake} ${vehicleModel}`;
    
    // ============= DETERMINE CAMERA POSITIONING (360° OR LEGACY) =============
    // Determine camera positioning based on cameraAngle (360°) or viewType (legacy)
    let cameraPositioning: string;
    
    if (cameraAngle !== undefined) {
      // Use 360° spin view angle configuration
      const spinView = getSpinViewAngle(cameraAngle);
      if (spinView) {
        cameraPositioning = spinView.cameraPrompt;
        console.log(`📸 Using 360° angle: ${cameraAngle}° (${spinView.label})`);
      } else {
        cameraPositioning = 'FRONT 3/4 VIEW - Default camera angle';
        console.warn(`⚠️ Invalid angle ${cameraAngle}, using default`);
      }
    } else {
      // Legacy viewType-based positioning - DRASTICALLY DIFFERENT ANGLES
      cameraPositioning = viewType === 'closeup' 
        ? 'ULTRA-TIGHT CLOSE-UP - Camera 2 feet from vehicle, showing ONLY hood surface texture and paint reflection detail, NO full vehicle visible'
        : viewType === 'hood_detail'
        ? 'HOOD EXTREME CLOSE-UP - Camera 3 feet from vehicle front, pointing DOWN at 60° angle, frame shows ONLY the hood surface, front grille edge, and windshield base. Frame crops ABOVE headlights. NO wheels visible. Tight crop on hood metallic/pearl detail.'
        : viewType === 'front' || viewType === 'hero'
        ? 'HERO 3/4 FRONT FULL VEHICLE - Camera 25 feet back, positioned at LEFT-FRONT corner at 30° angle from vehicle centerline, LOW camera height at wheel level, showing ENTIRE vehicle from front bumper to rear bumper, ALL 4 wheels fully visible, dramatic upward angle emphasizing vehicle presence'
        : viewType === 'side'
        ? 'TRUE SIDE PROFILE - Camera perpendicular to vehicle at 90° to its length, pure profile view with minimal vertical tilt, camera at door handle height, showing full vehicle length from front to rear bumper, BOTH side wheels visible, roof appearing as a thin strip only'
        : viewType === 'rear'
        ? 'HERO 3/4 REAR FULL VEHICLE - Camera 25 feet back, positioned at LEFT-REAR corner at 150° angle from vehicle front, LOW camera height at wheel level, showing full rear end including tailgate/trunk and BOTH side body panels, ALL 4 wheels fully visible, clear sense of vehicle depth (NOT a flat side view)'
        : viewType === 'top'
        ? 'TRUE OVERHEAD AERIAL - Camera positioned DIRECTLY above vehicle at perfect 90° vertical angle, pointing STRAIGHT DOWN at roof. Pure bird-eye view showing complete vehicle silhouette - roof, hood, trunk visible from above. ZERO side perspective, like a drone photo from directly overhead.'
        : 'FRONT 3/4 VIEW - Default camera angle';
      console.log(`📸 Using legacy viewType: ${viewType}`);
    }
    // ============= END CAMERA POSITIONING =============
    
    let aiPrompt = '';
    let patternImageUrl = null;
    let referenceImages: string[] = []; // For AI Reference Learning System
    let referenceImageBase64: string | null = null; // For CustomStyling reference image
    let multiZoneLabel = ''; // For GraphicsPro two-tone zone labels

    // ===============================================================
    // CUSTOM STYLING MODE — DEPRECATED (Replaced by ColorPro Enhanced)
    // ===============================================================
    if (modeType === 'CustomStyling') {
      console.log('⚠️ CustomStyling Mode is DEPRECATED - use ColorProEnhanced instead');
      return new Response(
        JSON.stringify({
          error: "Custom Styling mode has been replaced. Use ColorPro Enhanced mode instead.",
          deprecated: true,
          suggestedMode: 'ColorProEnhanced'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ===============================================================
    // COLORPRO ENHANCED / GRAPHICSPRO MODE — Multi-Zone + Graphics via ColorPro Engine
    // ===============================================================
    // CRITICAL: GraphicsPro from frontend maps to this handler!
    if (modeType === 'ColorProEnhanced' || modeType === 'GraphicsPro') {
      console.log(`🚀 ${modeType} Mode Activated - Multi-zone via ColorPro engine`);
      
      // Use effectiveColorData which merges top-level customStylingPrompt
      const { customStylingPrompt, referenceImageUrl } = effectiveColorData || {};
      
      console.log('📝 ColorProEnhanced customStylingPrompt:', customStylingPrompt);
      console.log('📝 presetCategory:', presetCategory);
      
      if (!customStylingPrompt) {
        console.log('❌ Still missing customStylingPrompt after merge. effectiveColorData:', effectiveColorData);
        return new Response(
          JSON.stringify({ error: 'customStylingPrompt required for ColorProEnhanced mode' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const promptLower = customStylingPrompt.toLowerCase();
      
      // ============= FAMOUS LIVERY ENGINE - MUST CHECK FIRST =============
      // Canonical liveries (Martini, Gulf, Rothmans, etc.) need visual grounding
      // This MUST fire BEFORE generic stripe detection to prevent simplification
      const liveryInfo = detectFamousLivery(customStylingPrompt);
      
      if (liveryInfo) {
        console.log(`🏁🏁🏁 FAMOUS LIVERY DETECTED: ${liveryInfo.name} 🏁🏁🏁`);
        console.log(`📸 Fetching DataForSEO reference images for: ${liveryInfo.searchQueries[0]}`);
        
        // Fetch reference images via DataForSEO for visual grounding
        const liveryReferenceImages: string[] = [];
        const DATAFORSEO_API_KEY = Deno.env.get('DATAFORSEO_API_KEY');
        
        if (DATAFORSEO_API_KEY) {
          for (const query of liveryInfo.searchQueries.slice(0, 2)) {
            try {
              console.log(`🔍 DataForSEO query: "${query}"`);
              const searchResponse = await fetch('https://api.dataforseo.com/v3/serp/google/images/live/advanced', {
                method: 'POST',
                headers: {
                  'Authorization': `Basic ${DATAFORSEO_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify([{
                  keyword: query,
                  location_code: 2840,
                  language_code: "en",
                  device: "desktop",
                  depth: 10,
                }])
              });
              
              if (searchResponse.ok) {
                const searchData = await searchResponse.json();
                const results = searchData.tasks?.[0]?.result?.[0]?.items || [];
                console.log(`📸 Found ${results.length} images for query: "${query}"`);
                
                // Filter for valid image URLs only
                for (const item of results.slice(0, 3)) {
                  if (item.url && isValidImageUrl(item.url)) {
                    liveryReferenceImages.push(item.url);
                    console.log(`✅ Added livery reference: ${item.url.substring(0, 80)}...`);
                  }
                }
              }
            } catch (e) {
              console.error(`Failed to fetch livery images for query: ${query}`, e);
            }
          }
        } else {
          console.warn('⚠️ DATAFORSEO_API_KEY not configured - livery render without visual grounding');
        }
        
        console.log(`📸 Total livery reference images: ${liveryReferenceImages.length}`);
        
        // Build SPECIALIZED livery prompt with visual grounding
        const useHardLight = promptLower.includes('chrome') || promptLower.includes('metallic');
        const studioEnv = useHardLight
          ? `HARD LIGHT STUDIO - Light gray walls (#4a4a4a to #3a3a3a), dark charcoal polished concrete floor, visible rectangular softbox reflections`
          : `SOFT DIFFUSION STUDIO - Light gray walls (#4a4a4a to #3a3a3a), dark charcoal floor, diffused lighting, soft shadows`;
        
        aiPrompt = `
=== 🏁🏁🏁 GRAPHICSPRO FAMOUS RACING LIVERY MODE 🏁🏁🏁 ===

THIS IS A FAMOUS, HISTORICALLY DOCUMENTED RACING LIVERY.
YOU MUST RENDER IT WITH EXACT HISTORICAL ACCURACY.

=== VEHICLE ===
${vehicle}

=== LIVERY: ${liveryInfo.name.toUpperCase()} ===

${liveryInfo.rules}

=== STRIPE CONFIGURATION ===
${liveryInfo.stripeConfig}

=== COLORS ===
${liveryInfo.colors.join(', ')}

=== BASE VEHICLE COLOR ===
${liveryInfo.baseColor}

${liveryReferenceImages.length > 0 ? `
=== 📸 REFERENCE IMAGES PROVIDED (CRITICAL) ===
${liveryReferenceImages.length} REFERENCE IMAGES are included showing the EXACT livery design.

YOU MUST:
• STUDY the reference images VERY CAREFULLY
• COUNT the number of stripes in the references
• MATCH the exact stripe colors, widths, and spacing
• REPLICATE the stripe layout precisely on the target vehicle
• The references show the CORRECT design - copy it faithfully

DO NOT:
❌ Simplify to a single stripe - liveries have MULTIPLE stripes
❌ Change the historical color palette
❌ Ignore the reference images
❌ Create your own interpretation

The reference images are your PRIMARY source of truth.
=== END REFERENCE INSTRUCTIONS ===
` : `
⚠️ NO REFERENCE IMAGES AVAILABLE - Follow rules PRECISELY
`}

=== STUDIO ENVIRONMENT ===
${studioEnv}

=== CAMERA POSITION ===
${viewType?.toUpperCase() || 'SIDE'} VIEW - Professional automotive photography angle

=== OUTPUT QUALITY ===
Ultra-high resolution 4K output (3840×2160px minimum)
Tack-sharp detail on all body panels
Professional DSLR automotive photography quality

=== 🚨 CRITICAL FAILURE CONDITIONS 🚨 ===
❌ RENDER FAILS if only ONE stripe is generated (${liveryInfo.name} requires MULTIPLE stripes)
❌ RENDER FAILS if wrong colors are used
❌ RENDER FAILS if stripe configuration doesn't match historical livery
❌ RENDER FAILS if base vehicle color is wrong

=== GENERATE NOW ===
Create hyper-photorealistic render of ${vehicle} with the EXACT ${liveryInfo.name.toUpperCase()}.
MATCH THE REFERENCE IMAGES. RENDER ALL STRIPES. USE CORRECT COLORS.
`.trim();

        console.log('🏁 LIVERY MODE PROMPT BUILT - Skipping stripe/two-tone handlers');
        
        // Add livery references to webSearchPhotos for AI vision call
        webSearchPhotos = liveryReferenceImages.map(url => ({
          url,
          title: liveryInfo.name,
          source: 'livery_reference'
        }));
        
        // Set multi-zone label for display
        multiZoneLabel = `${liveryInfo.name} - ${liveryInfo.colors.join(' | ')}`;
        
        // SKIP to AI generation - bypass all other handlers
      } else {
      
      // ============= STRIPE MODE v2 - EARLY DETECTION & BYPASS =============
      // This MUST fire BEFORE the complex multi-zone preprocessors
      // Stripe categories that bypass full config: OEM, vintage, bodylines
      const STRIPE_CATEGORIES = ['bodylines', 'oem', 'vintage'];
      const isStripeCategoryMode = STRIPE_CATEGORIES.includes(presetCategory ?? '');
      
      const stripeIntent = (
        isStripeCategoryMode || // OEM, vintage, bodylines tabs = ALWAYS stripe mode
        selectedPreset?.toLowerCase().includes('stripe') ||
        selectedPreset?.toLowerCase().includes('beltline') ||
        selectedPreset?.toLowerCase().includes('rocker') ||
        selectedPreset?.toLowerCase().includes('shoulder') ||
        selectedPreset?.toLowerCase().includes('sweep') ||
        selectedPreset?.toLowerCase().includes('oem') ||
        selectedPreset?.toLowerCase().includes('hockey') ||
        selectedPreset?.toLowerCase().includes('bumblebee') ||
        selectedPreset?.toLowerCase().includes('rally') ||
        selectedPreset?.toLowerCase().includes('heritage') ||
        /stripe|rocker|beltline|shoulder|swoosh|panel sweep|panel stripe|body line|pinstripe|quarter sweep|oem|racing|rally|hockey|bumblebee|heritage/i.test(promptLower)
      ) && !(
        // NOT a two-tone request
        promptLower.includes('two tone') ||
        promptLower.includes('two-tone') ||
        (promptLower.includes('top half') && promptLower.includes('bottom half')) ||
        (promptLower.includes('upper half') && promptLower.includes('lower half')) ||
        (promptLower.includes('left side') && promptLower.includes('right side')) ||
        (promptLower.includes('left half') && promptLower.includes('right half'))
      );
      
      if (stripeIntent) {
        console.log('🎯 STRIPE MODE ACTIVATED - Bypassing complex preprocessors');
        
        // Detect base vehicle color from "on [color] car" pattern
        let detectedBaseColor = '';
        const baseColorMatch = promptLower.match(/\bon\s+(\w+)\s+(?:car|vehicle|truck|suv)/i);
        if (baseColorMatch) {
          detectedBaseColor = baseColorMatch[1].charAt(0).toUpperCase() + baseColorMatch[1].slice(1);
        }
        
        // Detect if chrome/metallic finish needed for hard light studio
        const useHardLight = promptLower.includes('chrome') || promptLower.includes('metallic') || promptLower.includes('brushed');
        const studioEnv = useHardLight
          ? `HARD LIGHT STUDIO - Light gray walls (#4a4a4a to #3a3a3a), dark charcoal polished concrete floor, visible rectangular softbox reflections, high contrast for chrome surfaces`
          : `SOFT DIFFUSION STUDIO - Light gray walls (#4a4a4a to #3a3a3a), dark charcoal floor, diffused lighting, soft shadows`;
        
        // Build CLEAN stripe-only prompt - bypasses ALL complex engines
        aiPrompt = `
=== GRAPHICSPRO STRIPE MODE — VINYL STRIPES ONLY ===

You are generating VINYL STRIPES on a vehicle. NOT a full-body wrap.
This is NOT a two-tone wrap. This is NOT a multi-zone color split.

=== VEHICLE ===
${vehicle}

=== STUDIO ENVIRONMENT ===
${studioEnv}

=== CAMERA POSITION ===
${viewType?.toUpperCase() || 'SIDE'} VIEW - Professional automotive photography angle

=== OUTPUT QUALITY ===
Ultra-high resolution 4K output (3840×2160px minimum)
Tack-sharp detail on all body panels
Professional DSLR automotive photography quality

=== USER STRIPE REQUEST ===
"${customStylingPrompt}"

=== STRIPE-ONLY RULES (CRITICAL) ===

1. VEHICLE BODY COLOR MUST REMAIN UNCHANGED
   ${detectedBaseColor ? `• Base vehicle color: ${detectedBaseColor.toUpperCase()} - the ENTIRE car body stays this color` : '• Keep the vehicle in its original factory/base color'}
   • Hood, doors, fenders, quarters, roof - ALL stay the BASE COLOR
   • Do NOT repaint ANY body panels

2. APPLY STRIPE COLORS ONLY TO THE STRIPE LINE ITSELF
   • A stripe is a THIN ACCENT LINE (1-6 inches wide typically)
   • Only the stripe geometry gets the user's specified colors
   • The stripe sits ON TOP of the base body color

3. STRIPE TYPE DEFINITIONS:
   • ROCKER STRIPE: Horizontal line along lower body (8-14" from ground)
   • BELTLINE STRIPE: Mid-body line at window sill height (2-4" wide)
   • SHOULDER STRIPE: Upper body line just below window line
   • QUARTER PANEL SWEEP: Flowing accent on rear quarter panels
   • FENDER-TO-QUARTER SWOOSH: Continuous arc from front fender to rear

4. MULTI-COLOR STRIPE INTERPRETATION:
   • "Red and gold stripe" = Red stripe WITH gold accent/outline, NOT two car halves
   • Primary color = main stripe body
   • Secondary color = outline/accent layer on the stripe

=== WHAT THIS IS NOT ===
❌ NOT a two-tone wrap (car painted two different colors)
❌ NOT a multi-zone split (top half/bottom half)
❌ NOT large color blocks or panels
❌ NOT a full-body recolor

=== WHAT THIS IS ===
✅ A thin decorative stripe line on an otherwise single-color car
✅ Clean vinyl installer-style stripe geometry
✅ Colors apply ONLY to the stripe, not the vehicle body

=== IGNORE PRESET IMAGE COLORS (CRITICAL) ===
• DO NOT copy any colors from preset thumbnail images
• DO NOT add neon, glow, backlight, illumination, or lighting effects
• DO NOT add purple, blue, or orange glow halos
• Preset images are GEOMETRY DIAGRAMS ONLY - ignore their colors completely
• Use ONLY the colors explicitly specified by the user
• If user does NOT specify colors, use neutral white/black vinyl for the stripe

=== STRIPE GEOMETRY MUST BE IDENTICAL IN ALL VIEWS ===
• Same width, same placement, same colors across all render angles
• NO drift between views

=== DO NOT DO THESE THINGS ===
• DO NOT create full-body two-tone sections
• DO NOT paint half the car one color and half another
• DO NOT create diagonal color blocks
• DO NOT add random shapes or logos
• DO NOT recolor the vehicle body
• DO NOT apply preset two-tone patterns
• DO NOT add neon glow or lighting effects

=== NEGATIVE PROMPT ===
NO two-tone body wraps, NO multi-zone color splits, NO full-body recolors,
NO diagonal blocks, NO half-car painting, NO top/bottom splits,
NO random shapes, NO logos unless requested, NO neon, NO glow,
NO backlight effects, NO illumination, NO purple/blue/orange halos.

=== GENERATE NOW ===
Create hyper-photorealistic render of ${vehicle} with ONLY the requested STRIPE.
Vehicle body color remains UNCHANGED. Only the stripe line gets the specified colors.
Use clean solid vinyl with NO glow or lighting effects.
`.trim();

        console.log('🎯 STRIPE MODE PROMPT LENGTH:', aiPrompt.length);
        // Skip the rest of the GraphicsPro preprocessor - go directly to AI generation
      } else {
        // ============= TWO-TONE DETECTION - EARLY BYPASS =============
        // Check if this is a two-tone request BEFORE running any preprocessors
        const twoToneIntent = (
          promptLower.includes('two tone') ||
          promptLower.includes('two-tone') ||
          (promptLower.includes('top half') && promptLower.includes('bottom half')) ||
          (promptLower.includes('upper half') && promptLower.includes('lower half')) ||
          (promptLower.includes('top') && promptLower.includes('bottom') && (promptLower.includes('chrome') || promptLower.includes('satin') || promptLower.includes('matte') || promptLower.includes('gloss')))
        );
        
        if (twoToneIntent) {
          console.log('🎨 TWO-TONE MODE ACTIVATED - Direct bypass for reliability');
          
          // Parse top/bottom colors directly from prompt
          // Pattern: "top half [color1] [finish1], bottom half [color2] [finish2]"
          // Or: "top half [finish1] [color1] bottom half [finish2] [color2]"
          let topColor = 'Gold';
          let topFinish = 'Chrome';
          let bottomColor = 'Black';
          let bottomFinish = 'Satin';
          
          // Try to extract colors from prompt
          const topMatch = promptLower.match(/top\s+(?:half\s+)?(\w+)\s*(\w*)\s*(?:chrome|satin|matte|gloss|metallic)?/i);
          const bottomMatch = promptLower.match(/bottom\s+(?:half\s+)?(\w+)\s*(\w*)\s*(?:chrome|satin|matte|gloss|metallic)?/i);
          
          // More specific parsing for "gold chrome" vs "chrome gold" patterns
          if (promptLower.includes('gold chrome') || promptLower.includes('chrome gold')) {
            topColor = 'Gold';
            topFinish = 'Chrome';
          }
          if (promptLower.includes('satin black') || promptLower.includes('black satin')) {
            bottomColor = 'Black';
            bottomFinish = 'Satin';
          }
          
          // Check for specific finish keywords in top section
          if (promptLower.match(/top.*(chrome)/i)) topFinish = 'Chrome';
          if (promptLower.match(/top.*(satin)/i)) topFinish = 'Satin';
          if (promptLower.match(/top.*(matte)/i)) topFinish = 'Matte';
          if (promptLower.match(/top.*(gloss)/i)) topFinish = 'Gloss';
          
          // Check for specific finish keywords in bottom section
          if (promptLower.match(/bottom.*(chrome)/i)) bottomFinish = 'Chrome';
          if (promptLower.match(/bottom.*(satin)/i)) bottomFinish = 'Satin';
          if (promptLower.match(/bottom.*(matte)/i)) bottomFinish = 'Matte';
          if (promptLower.match(/bottom.*(gloss)/i)) bottomFinish = 'Gloss';
          
          // Extract color names
          const colorMatch1 = promptLower.match(/top\s+(?:half\s+)?(gold|silver|black|white|red|blue|green|purple|orange|pink|gray|grey)/i);
          const colorMatch2 = promptLower.match(/bottom\s+(?:half\s+)?(gold|silver|black|white|red|blue|green|purple|orange|pink|gray|grey)/i);
          if (colorMatch1) topColor = colorMatch1[1].charAt(0).toUpperCase() + colorMatch1[1].slice(1);
          if (colorMatch2) bottomColor = colorMatch2[1].charAt(0).toUpperCase() + colorMatch2[1].slice(1);
          
          // Detect if chrome finish - needs hard light studio
          const needsHardLight = topFinish.toLowerCase() === 'chrome' || bottomFinish.toLowerCase() === 'chrome';
          const studioEnv = needsHardLight
            ? `HARD LIGHT STUDIO - Light gray walls (#4a4a4a to #3a3a3a), dark charcoal polished concrete floor, visible rectangular softbox reflections, high contrast for chrome mirror reflections`
            : `SOFT DIFFUSION STUDIO - Light gray walls, dark charcoal floor, diffused lighting`;
          
          console.log(`🎨 TWO-TONE: Top=${topColor} ${topFinish}, Bottom=${bottomColor} ${bottomFinish}, Studio=${needsHardLight ? 'HARD' : 'SOFT'}`);
          
          // Build TWO-TONE SPECIFIC prompt - completely bypasses ColorPro's single-color logic
          aiPrompt = `
=== GRAPHICSPRO TWO-TONE WRAP — MANDATORY TWO-COLOR VEHICLE ===

🚨🚨🚨 THIS IS A TWO-TONE WRAP. THE VEHICLE MUST HAVE TWO DISTINCT COLORS. 🚨🚨🚨

If the entire vehicle appears as ONE color, the render FAILS COMPLETELY.

=== VEHICLE ===
${vehicle}

=== STUDIO ENVIRONMENT ===
${studioEnv}

=== CAMERA POSITION ===
${viewType?.toUpperCase() || 'SIDE'} VIEW - Professional automotive photography angle

=== OUTPUT QUALITY ===
Ultra-high resolution 4K output (3840×2160px minimum)
Tack-sharp detail on all body panels
Professional DSLR automotive photography quality
16:9 aspect ratio MANDATORY

=== THE TWO ZONES (READ CAREFULLY) ===

🔴 TOP HALF (Upper 50% of vehicle):
   COLOR: ${topColor.toUpperCase()}
   FINISH: ${topFinish.toUpperCase()}
   INCLUDES: Hood, Roof, A/B/C pillars, Upper doors (above beltline), Upper fenders, Upper quarters
   ${topFinish.toLowerCase() === 'chrome' ? 'CHROME REQUIREMENTS: Mirror-like perfect reflections, visible softbox reflections, extremely high reflectivity' : ''}

🔵 BOTTOM HALF (Lower 50% of vehicle):
   COLOR: ${bottomColor.toUpperCase()}
   FINISH: ${bottomFinish.toUpperCase()}
   INCLUDES: Lower doors (below beltline), Lower fenders, Lower quarters, Rockers, Lower bumpers
   ${bottomFinish.toLowerCase() === 'satin' ? 'SATIN REQUIREMENTS: Soft sheen, minimal reflection, smooth matte-like appearance with slight gloss' : ''}

=== SPLIT LINE LOCATION (CRITICAL) ===
The dividing line between TOP and BOTTOM is at the BELTLINE:
• The beltline is the horizontal crease that runs along the door handles
• Everything ABOVE this line = TOP zone (${topColor} ${topFinish})
• Everything BELOW this line = BOTTOM zone (${bottomColor} ${bottomFinish})
• The split must be a SHARP, CLEAN horizontal line - NO gradient, NO fade

=== VISUAL VERIFICATION CHECKLIST ===
✓ Can you see ${topColor.toUpperCase()} color on the hood? → REQUIRED
✓ Can you see ${topColor.toUpperCase()} color on the roof? → REQUIRED  
✓ Can you see ${bottomColor.toUpperCase()} color on the lower doors? → REQUIRED
✓ Can you see ${bottomColor.toUpperCase()} color on the rockers? → REQUIRED
✓ Is there a clear horizontal split line visible? → REQUIRED

=== FAILURE CONDITIONS (RENDER REJECTED IF) ===
❌ Entire vehicle is ONE solid color
❌ Only roof is different color (need full upper 50%)
❌ Colors blend/gradient together (need sharp separation)
❌ Wrong colors in wrong zones
❌ Split line is diagonal or curved (must be horizontal at beltline)

=== WHAT YOU ARE RENDERING ===
A ${vehicle} with a professional TWO-TONE vinyl wrap:
- TOP HALF: ${topColor} ${topFinish} vinyl
- BOTTOM HALF: ${bottomColor} ${bottomFinish} vinyl
- Split at beltline (door handle height)

=== NO TEXT RULE ===
DO NOT add ANY text, watermarks, logos, or branding to this image.

GENERATE THE TWO-TONE WRAP NOW. BOTH COLORS MUST BE CLEARLY VISIBLE.
`.trim();

          console.log('🎨 TWO-TONE PROMPT LENGTH:', aiPrompt.length);
          // Skip the rest - go directly to AI generation
        } else {
        // ============= STANDARD MULTI-ZONE MODE =============
      
        // 1) Run the ColorPro Enhanced Pre-Processor
        const enhancedProfile = await runColorProEnhancedPreProcessor(
          customStylingPrompt,
          vehicle,
          revisionPrompt,
          supabase
        );
        
        console.log('✨ Enhanced Profile:', JSON.stringify({
          zoneCount: enhancedProfile.overrideFilmZones.length,
          graphicCount: enhancedProfile.overrideGraphics.length,
          multiFilmInfo: enhancedProfile.multiFilmInfo
        }));
        
        // 2) Build the ColorPro base prompt using the PRIMARY zone
        const primaryZone = enhancedProfile.overrideFilmZones[0];
        if (!primaryZone) {
          return new Response(
            JSON.stringify({ error: 'No valid zones found in styling prompt' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Use GraphicsProPrompt builder for GraphicsPro mode, ColorPro for ColorProEnhanced
        if (modeType === 'GraphicsPro') {
          // ✅ CORRECT: Use GraphicsPro prompt builder
          aiPrompt = buildGraphicsProPrompt({
            userPrompt: customStylingPrompt,
            vehicle,
            viewType,
            cameraPositioning,
            revisionPrompt,
            styleDescription,
            selectedPreset,
            presetCategory,
            hasReferenceImage: !!referenceImageUrl,
          });
          console.log('✅ GraphicsPro: Using buildGraphicsProPrompt');
        } else {
          // ColorProEnhanced mode - use ColorPro builder with zone block
          aiPrompt = buildColorProPrompt({
            vehicle,
            colorName: primaryZone.colorName,
            manufacturer: primaryZone.manufacturer,
            hex: primaryZone.hex,
            finish: primaryZone.finish,
            cameraAngle: cameraPositioning,
            viewType,
            lab: primaryZone.lab,
            reflectivity: primaryZone.reflectivity,
            metallic_flake: primaryZone.metallic_flake,
            materialValidated: primaryZone.materialValidated,
            graphicsProZoneBlock: enhancedProfile.overrideFilmZones.length > 1 
              ? formatEnhancedFilmZones(enhancedProfile.overrideFilmZones)
              : undefined,
            zones: enhancedProfile.overrideFilmZones.map(z => ({
              finish_profile: z.finish_profile,
              finish: z.finish
            })),
            toolBranding: 'ColorPro™',
          });
        }
      
      // Append graphics if present (cut vinyl overlays)
      if (enhancedProfile.overrideGraphics.length > 0) {
        aiPrompt += formatEnhancedGraphics(enhancedProfile.overrideGraphics);
      }
      
      // 5) Handle reference image if provided
      if (referenceImageUrl) {
        try {
          console.log('Fetching reference image:', referenceImageUrl);
          const refResponse = await fetch(referenceImageUrl, {
            headers: { 'User-Agent': 'Deno/1.0' }
          });
          
          if (refResponse.ok) {
            const refBlob = await refResponse.arrayBuffer();
            const uint8Array = new Uint8Array(refBlob);
            let binaryString = '';
            const chunkSize = 8192;
            for (let i = 0; i < uint8Array.length; i += chunkSize) {
              const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
              binaryString += String.fromCharCode.apply(null, Array.from(chunk));
            }
            const contentType = refResponse.headers.get('content-type') || 'image/jpeg';
            referenceImageBase64 = `data:${contentType};base64,${btoa(binaryString)}`;
            console.log('Reference image loaded successfully');
            
            // Add reference image instructions to the prompt
            aiPrompt += `

=== 🎯 REFERENCE IMAGE PROVIDED (CRITICAL) ===

A reference image has been uploaded showing the EXACT style wanted.

YOU MUST:
• STUDY the reference image carefully
• MATCH the exact curve flow, scallop pattern, edge treatment
• REPLICATE the stripe style, width, and placement from the reference
• ADAPT the design to fit the target vehicle's proportions
• MAINTAIN the same visual language (thick/thin lines, flowing curves, layered effects)

DO NOT:
• Ignore the reference image
• Create a generic design instead  
• Change the style significantly from the reference

The reference image is your PRIMARY source of design direction.
=== END REFERENCE IMAGE INSTRUCTIONS ===
`;
          }
        } catch (error) {
          console.warn('Failed to load reference image, continuing without it:', error);
        }
      }
      
      console.log('✅ ColorPro Enhanced prompt built with', enhancedProfile.overrideFilmZones.length, 'zones');
      
      // Build multi-zone label for display (e.g., "TeckWrap Chrome Gold | KPMF Satin Black")
      if (enhancedProfile.multiFilmInfo && enhancedProfile.multiFilmInfo.length > 1) {
        multiZoneLabel = enhancedProfile.multiFilmInfo
          .filter(z => z.zone !== 'body') // Exclude spurious body zone for two-tone
          .map(z => `${z.manufacturer} ${z.colorName}`.trim())
          .join(' | ');
        console.log('📝 Multi-zone label:', multiZoneLabel);
      } else if (enhancedProfile.multiFilmInfo && enhancedProfile.multiFilmInfo.length === 1) {
        const zone = enhancedProfile.multiFilmInfo[0];
        multiZoneLabel = `${zone.manufacturer} ${zone.colorName}`.trim();
      }
        } // Close the else block for standard multi-zone mode (from twoToneIntent else)
      } // Close the stripeIntent else block
      } // Close the liveryInfo else block
    }
    // WBTY uses repeating patterns, FadeWraps uses gradients
    else if (modeType === 'wbty' || modeType === 'fadewraps') {
      const { 
        patternUrl, finish = 'gloss', patternScale = 1, gradientScale = 1, gradientDirection = 'front-to-back',
        fadeStyle, colorName, colorHex,
        addHood = false, addFrontBumper = false, addRearBumper = false, kitSize, roofSize,
        isInkFusion = false,
        fadeSpec // 🔒 S.A.W. DETERMINISTIC FADE SPEC from frontend
      } = colorData || {};
      
      // 🔒 S.A.W. STUDIO LOCK from frontend (prevents drift to cyclorama/white)
      const studioLock = requestBody.studioLock;
      
      // InkFusion colors don't need a pattern URL - they use hex color for gradient
      const needsPatternUrl = modeType === 'wbty' || (modeType === 'fadewraps' && !isInkFusion);
      
      if (!patternUrl && needsPatternUrl) {
        return new Response(
          JSON.stringify({ error: `Pattern URL required for ${modeType.toUpperCase()} mode` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // For FadeWraps with InkFusion (no pattern), build prompt from color data directly
      if (modeType === 'fadewraps' && isInkFusion) {
        console.log('🎨 FadeWraps InkFusion mode - using hex-based gradient rendering');
        console.log(`📸 FadeWraps viewType: ${viewType}, fadeStyle: ${fadeStyle}`);
        
        // 🔒 S.A.W. DETERMINISTIC LOGGING - verify params are correct
        if (fadeSpec) {
          console.log('🎯 DETERMINISTIC FADE SPEC RECEIVED:', JSON.stringify({
            fadeAxis: fadeSpec.fadeAxis,
            fadeStart: fadeSpec.fadeStart,
            fadeEnd: fadeSpec.fadeEnd,
            fadeProfile: fadeSpec.fadeProfile
          }));
        } else {
          console.warn('⚠️ NO FADE SPEC RECEIVED - using default fade logic');
        }
        
        if (studioLock) {
          console.log('🔒 STUDIO LOCK RECEIVED:', JSON.stringify({
            studioEnvironment: studioLock.studioEnvironment,
            disableCyclorama: studioLock.disableCyclorama,
            wallColor: studioLock.wallColor
          }));
        }
        
        // ============= FETCH FADE DIRECTION REFERENCE IMAGES =============
        // CRITICAL: AI ignores text prompts for directional instructions - needs VISUAL REFERENCE
        const fadeReferenceInfo = getFadeReferenceInfo(fadeStyle || 'front_back');
        let fadeDirectionReferenceImages: string[] = [];
        
        if (fadeReferenceInfo) {
          console.log(`🔍 Fetching fade direction reference images for style: ${fadeStyle || 'front_back'}`);
          console.log(`🔍 Search query: ${fadeReferenceInfo.searchQuery}`);
          
          try {
            const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
            const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
            
            if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
              const searchResponse = await fetch(`${SUPABASE_URL}/functions/v1/search-vinyl-product-images`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
                },
                body: JSON.stringify({
                  query: fadeReferenceInfo.searchQuery,
                  maxResults: 3
                })
              });
              
              if (searchResponse.ok) {
                const searchData = await searchResponse.json();
                fadeDirectionReferenceImages = (searchData.photos || [])
                  .filter((p: any) => isValidImageUrl(p.url))
                  .map((p: any) => p.url)
                  .slice(0, 3);
                console.log(`✅ Found ${fadeDirectionReferenceImages.length} fade direction reference images`);
              } else {
                console.error('❌ Fade reference search failed:', searchResponse.status);
              }
            }
          } catch (err) {
            console.error('❌ Fade reference search error:', err);
          }
        }
        
        // Store for contentParts builder
        if (fadeDirectionReferenceImages.length > 0) {
          webSearchPhotos = fadeDirectionReferenceImages.map(url => ({ url }));
        }
        
        // 🔒 INKFUSION HARD GATE — Enforce InkFusion-specific render parameters
        const inkFusionParams = {
          materialType: 'printed-ink',
          allowTextOverlay: false,
          allowWatermark: false,
          disableColorPro: true,
          disableVinylReflectivity: true,
          // 🔒 S.A.W. FREEZE EXISTING SHEEN — Do NOT override gloss/specular
          lockExistingMaterialResponse: true,
          preventGlossOverride: true,
          preventSpecularOverride: true,
          reuseMaterialCache: true,
          // 🏗️ S.A.W. STUDIO ENVIRONMENT ONLY (no material interaction)
          studioEnvironment: studioLock?.studioEnvironment || 'neutral-concrete',
          floorMaterial: studioLock?.floorMaterial || 'textured-concrete',
          floorRoughness: 0.65,
          floorReflectivity: 0.05,
          wallColor: studioLock?.wallColor || '#E6E6E6',
          contactShadows: true,
          disableCyclorama: studioLock?.disableCyclorama ?? true,
          disableCurvedBackdrop: studioLock?.disableCurvedBackdrop ?? true,
          // 📸 S.A.W. REQUIRED VIEWS with material cache
          requiredViews: ['side', 'rear_3q', 'front_3q', 'top']
        };
        
        // 🔒 CROSSFADE ZONE MODEL — Remove direction, use zone-based fade
        const effectiveFadeStyle = fadeStyle;
        const useZoneModel = fadeStyle === 'crossfade';
        
        console.log(`🎨 InkFusion params: ${JSON.stringify(inkFusionParams)}`);
        console.log(`🔥 CrossFade zone model: ${useZoneModel}`);
        
        // Build base prompt
        aiPrompt = buildFadeWrapsPrompt({
          vehicle,
          colorData: {
            ...colorData,
            colorHex: colorHex || colorName,
            isInkFusion: true,
            finish: finish || 'Gloss',
            ...inkFusionParams,
            // 🔒 S.A.W. PASS DETERMINISTIC FADE SPEC TO PROMPT BUILDER
            fadeSpec
          },
          finish,
          gradientDirection: useZoneModel ? 'crossfade-zones' : gradientDirection,
          fadeStyle: effectiveFadeStyle,
          cameraAngle: cameraPositioning,
          addHood,
          addFrontBumper,
          addRearBumper,
          kitSize,
          roofSize,
          viewType // Pass viewType for top-view specific handling
        });
        
        // 🔒 S.A.W. APPEND DETERMINISTIC FADE SPEC CONSTRAINT BLOCK
        if (fadeSpec && fadeSpec.prompt) {
          aiPrompt += `

${fadeSpec.prompt}
`;
          console.log('✅ Appended deterministic fade spec constraint to prompt');
        }
        
        // 🔒 S.A.W. APPEND STUDIO LOCK CONSTRAINT BLOCK
        if (studioLock) {
          aiPrompt += `

🔒 STUDIO ENVIRONMENT — LOCKED (NON-NEGOTIABLE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• studioEnvironment: ${studioLock.studioEnvironment}
• Floor: Dark textured concrete (#2a2a2a), FLAT plane, NO curves
• Walls: Light gray (${studioLock.wallColor}), FLAT, NO cyclorama dome
• disableCyclorama: ${studioLock.disableCyclorama} — NO curved floor/wall transitions
• disableCurvedBackdrop: ${studioLock.disableCurvedBackdrop} — NO rounded edges anywhere
• Output: 4K minimum (${studioLock.minWidth}x${studioLock.minHeight})
• NO TEXT/WATERMARKS in image (client overlay handles branding)

⚠️ FLAT CONTINUOUS FLOOR ONLY — no circular pads, no cyclorama cutouts
`;
          console.log('✅ Appended studio lock constraint to prompt');
        }
        
        // Append fade reference prompt section if we have reference images
        if (fadeDirectionReferenceImages.length > 0) {
          const fadeReferencePrompt = buildFadeReferencePromptSection(fadeStyle || 'front_back', true);
          aiPrompt += '\n\n' + fadeReferencePrompt;
          console.log('✅ Added fade direction reference prompt section');
        }
      }
      
      // Pattern-based rendering (original logic)
      if (patternUrl && !isInkFusion) {
        console.log(`Fetching pattern image for ${modeType.toUpperCase()} mode:`, patternUrl);
        try {
        // Validate URL format
        if (!patternUrl.startsWith('http://') && !patternUrl.startsWith('https://')) {
          throw new Error(`Invalid pattern URL format: ${patternUrl}`);
        }

        const patternResponse = await fetch(patternUrl, {
          headers: {
            'User-Agent': 'Deno/1.0'
          }
        });
        
        if (!patternResponse.ok) {
          throw new Error(`Failed to fetch pattern: ${patternResponse.status} ${patternResponse.statusText}`);
        }

        const patternBlob = await patternResponse.arrayBuffer();
        
        // Convert array buffer to base64 in chunks to avoid stack overflow
        const uint8Array = new Uint8Array(patternBlob);
        let binaryString = '';
        const chunkSize = 8192; // Process in 8KB chunks
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
          binaryString += String.fromCharCode.apply(null, Array.from(chunk));
        }
        const base64Pattern = btoa(binaryString);
        
        patternImageUrl = `data:image/png;base64,${base64Pattern}`;
        console.log('Pattern image loaded successfully, size:', patternBlob.byteLength);
      } catch (error: any) {
        console.error('Failed to fetch pattern image:', error);
        console.error('Pattern URL was:', patternUrl);
        return new Response(
          JSON.stringify({ error: `Failed to load pattern image: ${error?.message || 'Unknown error'}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
        }

        // Different prompts for WBTY vs FadeWraps
        if (modeType === 'fadewraps') {
        aiPrompt = buildFadeWrapsPrompt({
          vehicle,
          colorData,
          finish,
          gradientDirection,
          fadeStyle,
          cameraAngle: cameraPositioning,
          addHood,
          addFrontBumper,
          addRearBumper,
          kitSize,
          roofSize,
          viewType // Pass viewType for top-view specific handling
        });
      } else {
        // WBTY mode = repeating pattern tiles - UNIFIED BUILDER
        console.log("🎨 Using Unified Builder Suite (PatternPro Mode)");
        
        const patternName = colorData?.patternName || colorData?.colorName || "Custom Pattern";
        const patternNameLower = patternName.toLowerCase();
        
        // Auto-detect pattern category
        const patternCategory =
          ["marble", "stone", "granite", "onyx"].some(v => patternNameLower.includes(v)) ? "marble" as const :
          ["carbon", "fiber", "kevlar", "weave", "honeycomb"].some(v => patternNameLower.includes(v)) ? "carbon" as const :
          ["camo", "tactical", "multicam", "military"].some(v => patternNameLower.includes(v)) ? "camo" as const :
          ["hex", "grid", "geometric"].some(v => patternNameLower.includes(v)) ? "geometric" as const :
          "abstract" as const;
        
        aiPrompt = buildRestyleProRenderPrompt({
          mode: "pattern",
          vehicle,
          cameraPositioning,
          viewType,
          patternName,
          patternCategory,
          patternScale,
          finish,
          textureProfile: colorData?.textureProfile || null,
          environment: "studio",
          debugMode: false,
        });
        
        console.log("✅ Unified Builder PatternPro active");
        }
      } // Close if (patternUrl && !isInkFusion)
    } else if (modeType === 'designpanelpro') {
      // DesignPanelPro mode - custom panel designs
      const { panelUrl, panelName, finish = 'gloss' } = colorData || {};
      
      if (!panelUrl) {
        return new Response(
          JSON.stringify({ error: 'Panel URL is required for DesignPanelPro mode' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Fetching panel image for DesignPanelPro mode:', panelUrl);
      try {
        const panelResponse = await fetch(panelUrl, {
          headers: { 'User-Agent': 'Deno/1.0' }
        });
        
        if (!panelResponse.ok) {
          throw new Error(`Failed to fetch panel: ${panelResponse.status}`);
        }

        // Get actual content type from response
        const contentType = panelResponse.headers.get('content-type') || 'image/png';
        
        const panelBlob = await panelResponse.arrayBuffer();
        const uint8Array = new Uint8Array(panelBlob);
        let binaryString = '';
        const chunkSize = 8192;
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
          binaryString += String.fromCharCode.apply(null, Array.from(chunk));
        }
        const base64Panel = btoa(binaryString);
        
        // Use actual content type instead of hardcoding
        patternImageUrl = `data:${contentType};base64,${base64Panel}`;
        console.log('Panel image loaded successfully, size:', panelBlob.byteLength, 'type:', contentType);
      } catch (error: any) {
        console.error('Failed to fetch panel image:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to load panel image' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const cameraAngle = viewType === 'front'
        ? 'TIGHT CLOSE-UP FRONT 3/4 VIEW - Camera close to vehicle at FRONT-LEFT corner. Hood and wrapped panels fill 70% of frame showing panel design detail. Hood, grille, front bumper prominent with panel pattern clearly visible. Vehicle facing toward camera. Close framing for maximum design visibility.'
        : viewType === 'closeup' || viewType === 'hood_closeup'
        ? 'Professional photorealistic tight close-up shot. Zoomed in 35% on the mid driver-side panel with high micro-detail and crisp reflections.'
        : viewType === 'hood_detail'
        ? 'EXTREME CLOSE-UP CENTERED VIEW of hood - Camera positioned directly above the center of the hood, pointing straight down with a slight artistic tilt. The hood surface fills 80% of the frame showing vinyl wrap texture, finish properties, and true color accuracy. Include subtle reflections and realistic lighting. Background shows minimal context (small portions of windshield/side panels). Professional automotive photography lighting.'
        : viewType === 'side'
        ? 'Professional photorealistic full-vehicle wrap proof. TIGHT SIDE PROFILE - Perfect 90 degree side view from driver side. Full, seamless side wrap coverage extending from front fender to rear quarter panel.'
        : viewType === 'rear'
        ? 'Professional photorealistic rear view vehicle wrap proof. Show full wrap coverage across the entire rear end, including rear bumper, trunk area, quarter panel edges, and all visible curved surfaces. High-detail studio lighting.'
        : viewType === 'top'
        ? 'TIGHT TOP VIEW - Overhead drone perspective close to vehicle looking straight down. Vehicle fills frame showing roof, hood, and trunk panel design from above. Panel pattern and flow clearly visible. Close framing to maximize pattern detail.'
        : 'EXTREME CLOSE-UP of hood panel showing pattern texture and finish detail';

      // DesignPanelPro gets detailed emphatic finish prompts (pattern-obscuring elements removed)
      const designPanelProGlossFinish = finish.toLowerCase() === 'gloss' 
  ? `🚨 GLOSS FINISH - MAXIMUM REFLECTIVE SHINE 🚨

CRITICAL - THIS IS GLOSS, NOT SATIN:
You MUST render a HIGH-GLOSS, HIGHLY REFLECTIVE automotive vinyl wrap.
This is the GLOSSIEST finish - WET LOOK, MIRROR-LIKE shine is REQUIRED.

MANDATORY GLOSS CHARACTERISTICS (ALL REQUIRED):
✨ VERY HIGH gloss - MAXIMUM automotive wet-look shine
✨ STRONG specular highlights - crisp, bright reflections on curves
✨ SHARP light reflections - like freshly waxed luxury car
✨ Mirror-like quality - significant environmental reflections
✨ Intense shine particularly on hood, roof, and fender curves
✨ High contrast between lit and shadowed areas
✨ Glossy clear coat over design - think wet showroom car
✨ Strong white highlights where light hits directly
✨ Deep, rich color depth from gloss finish
✨ VERY SHINY - this is the MOST reflective finish option

VISUAL MARKERS OF GLOSS (MUST INCLUDE):
- Bright white specular highlights on curves
- Strong environmental reflections (sky, surroundings)
- Crisp, sharp light catchlights
- Wet-looking surface appearance
- High contrast shiny areas vs shadowed areas
- Mirror-like quality in finish

REFERENCE: Professional high-gloss automotive clear coat - maximum shine, wet look, strong reflections.

🚨 IF THIS DOESN'T LOOK VERY SHINY AND REFLECTIVE, YOU FAILED 🚨`
  : finish.toLowerCase() === 'satin'
  ? `🚨 SATIN FINISH - SOFT SHEEN, NO GLOSS 🚨

CRITICAL - THIS IS SATIN, NOT GLOSS OR MATTE:
You MUST render a SATIN finish - soft, subtle sheen with NO sharp reflections.
This is the MIDDLE ground - more sheen than matte, MUCH LESS shine than gloss.

MANDATORY SATIN CHARACTERISTICS (ALL REQUIRED):
🎨 Soft subtle sheen - silk-like eggshell appearance
🎨 NO sharp specular highlights - NO crisp reflections
🎨 NO mirror-like reflections - NO wet look
🎨 Gentle diffused glow instead of shine
🎨 Semi-matte appearance with soft light interaction
🎨 Smooth but NOT shiny surface
🎨 Light creates soft bloom, NOT sharp highlights
🎨 Eggshell or pearl-like finish quality
🎨 Sophisticated understated appearance
🎨 NO glossy clear coat appearance

VISUAL MARKERS OF SATIN (MUST INCLUDE):
- Soft diffused light on curves (NOT sharp highlights)
- NO crisp white specular points
- NO environmental reflections or mirror effects
- Gentle overall glow vs sharp shine
- Uniform appearance without gloss hotspots
- Think satin fabric or eggshell paint

CRITICAL DISTINCTIONS:
❌ NOT GLOSS: NO wet look, NO sharp reflections, NO mirror shine
❌ NOT MATTE: Has soft sheen, NOT completely flat
✅ SATIN: Soft subtle glow, silk-like, sophisticated

REFERENCE: Professional satin automotive vinyl - soft sheen like silk fabric or eggshell, NO gloss.

🚨 IF THIS LOOKS SHINY OR GLOSSY, YOU FAILED 🚨`
  : `🚨 MATTE FINISH - COMPLETELY FLAT, ZERO SHINE 🚨

CRITICAL: Real matte vinyl wrap - completely flat, NO shine whatsoever.

MANDATORY MATTE CHARACTERISTICS:
- Completely flat NON-REFLECTIVE surface
- Absolutely ZERO shine, sheen, or reflections
- Light absorbed and diffused completely
- Flat like premium matte wall paint
- Professional matte vinyl texture
- NO wet look, NO shine, NO gloss
- DRAMATICALLY different from gloss
- Think premium flat finish

VISUAL REFERENCE:
Professional matte vinyl wrap - completely flat, no shine.

CRITICAL: If ANY shine or reflection visible, render FAILS.`;

      // InkFusion keeps existing detailed prompts for stability
      const inkFusionGlossFinish = finish.toLowerCase() === 'gloss' 
  ? `🚨 GLOSS FINISH - MAXIMUM REFLECTIVE SHINE 🚨

CRITICAL - THIS IS GLOSS, NOT SATIN:
You MUST render a HIGH-GLOSS, HIGHLY REFLECTIVE automotive vinyl wrap.
This is the GLOSSIEST finish - WET LOOK, MIRROR-LIKE shine is REQUIRED.

MANDATORY GLOSS CHARACTERISTICS (ALL REQUIRED):
✨ VERY HIGH gloss - MAXIMUM automotive wet-look shine
✨ STRONG specular highlights - crisp, bright reflections on curves
✨ SHARP light reflections - like freshly waxed luxury car
✨ Mirror-like quality - significant environmental reflections
✨ Intense shine particularly on hood, roof, and fender curves
✨ High contrast between lit and shadowed areas
✨ Glossy clear coat over design - think wet showroom car
✨ Strong white highlights where light hits directly
✨ Deep, rich color depth from gloss finish
✨ VERY SHINY - this is the MOST reflective finish option

VISUAL MARKERS OF GLOSS (MUST INCLUDE):
- Bright white specular highlights on curves
- Strong environmental reflections (sky, surroundings)
- Crisp, sharp light catchlights
- Wet-looking surface appearance
- High contrast shiny areas vs shadowed areas
- Mirror-like quality in finish

REFERENCE: Professional high-gloss automotive clear coat - maximum shine, wet look, strong reflections.

🚨 IF THIS DOESN'T LOOK VERY SHINY AND REFLECTIVE, YOU FAILED 🚨
Panel design visible BUT with STRONG glossy wet-look finish clearly apparent.`
  : finish.toLowerCase() === 'satin'
  ? `🚨 SATIN FINISH - SOFT SHEEN, NO GLOSS 🚨

CRITICAL - THIS IS SATIN, NOT GLOSS OR MATTE:
You MUST render a SATIN finish - soft, subtle sheen with NO sharp reflections.
This is the MIDDLE ground - more sheen than matte, MUCH LESS shine than gloss.

MANDATORY SATIN CHARACTERISTICS (ALL REQUIRED):
🎨 Soft subtle sheen - silk-like eggshell appearance
🎨 NO sharp specular highlights - NO crisp reflections
🎨 NO mirror-like reflections - NO wet look
🎨 Gentle diffused glow instead of shine
🎨 Semi-matte appearance with soft light interaction
🎨 Smooth but NOT shiny surface
🎨 Light creates soft bloom, NOT sharp highlights
🎨 Eggshell or pearl-like finish quality
🎨 Sophisticated understated appearance
🎨 NO glossy clear coat appearance

VISUAL MARKERS OF SATIN (MUST INCLUDE):
- Soft diffused light on curves (NOT sharp highlights)
- NO crisp white specular points
- NO environmental reflections or mirror effects
- Gentle overall glow vs sharp shine
- Uniform appearance without gloss hotspots
- Think satin fabric or eggshell paint

CRITICAL DISTINCTIONS:
❌ NOT GLOSS: NO wet look, NO sharp reflections, NO mirror shine
❌ NOT MATTE: Has soft sheen, NOT completely flat
✅ SATIN: Soft subtle glow, silk-like, sophisticated

REFERENCE: Professional satin automotive vinyl - soft sheen like silk fabric or eggshell, NO gloss.

🚨 IF THIS LOOKS SHINY OR GLOSSY, YOU FAILED 🚨
If you see sharp highlights or wet-look shine, it's WRONG - must be soft satin.`
  : `🚨 MATTE FINISH - COMPLETELY FLAT, ZERO SHINE 🚨

CRITICAL: Real matte vinyl wrap - completely flat, NO shine whatsoever.
Panel design must be clearly visible with zero reflections.

MANDATORY MATTE CHARACTERISTICS:
- Completely flat NON-REFLECTIVE surface
- Absolutely ZERO shine, sheen, or reflections
- Panel design fully visible with flat appearance
- Light absorbed and diffused completely
- Flat like premium matte wall paint
- Professional matte vinyl texture
- NO wet look, NO shine, NO gloss
- DRAMATICALLY different from gloss
- Think premium flat finish

VISUAL REFERENCE:
Professional matte vinyl wrap - completely flat, no shine.

CRITICAL: If ANY shine or reflection visible, render FAILS.`;

      // Select which finish prompts to use based on modeType
      const glossFinish = modeType === 'designpanelpro' ? designPanelProGlossFinish : inkFusionGlossFinish;

      // ============= USE UNIFIED BUILDER SUITE (DESIGNPANELPRO MODE) =============
      console.log("📐 Using Unified Builder Suite (DesignPanelPro Mode)");
      
      aiPrompt = buildRestyleProRenderPrompt({
        mode: "panel",
        vehicle,
        cameraPositioning,
        viewType,
        panelName: panelName || "Panel Preview",
        panelUrl,
        dpi: 150,
        bleedInches: 0.125,
        panels: colorData?.panels || [],
        environment: "studio",
        debugMode: false,
      });
      
      // Append critical DesignPanelPro-specific instructions
      aiPrompt += `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINISH SPECIFICATION: ${finish.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${glossFinish}

🚨 CRITICAL: PANEL DESIGN MUST BE INSTALLED ON VEHICLE 🚨
ABSOLUTELY FORBIDDEN:
❌ DO NOT show the flat panel design image/file next to the vehicle
❌ DO NOT display the panel design as a separate graphic element
❌ The design must ONLY appear as INSTALLED WRAP on vehicle surface

PROFESSIONAL WRAP INSTALLATION:
- Perfectly smooth application - ZERO bubbles, wrinkles, or visible seams
- Design wraps around curves realistically with proper 3D perspective
- Color accuracy must EXACTLY match the reference panel colors
- NEVER wrap wheels, tires, rims, windows, lights, or emblems

🚫 NO TEXT RULE 🚫
DO NOT add ANY text, watermarks, logos, or branding to this image.

OUTPUT: Ultra-photorealistic ${vehicle} with panel design INSTALLED as wrap in ${finish} finish. MUST be EXACTLY 16:9 landscape.`;
      
      console.log("✅ Unified Builder DesignPanelPro active");
    } else if (modeType === 'approvemode') {
      // ApproveMode - any 2D design uploaded by user
      const { designUrl, designName = 'Custom Design' } = colorData || {};
      
      if (!designUrl) {
        return new Response(
          JSON.stringify({ error: 'Design URL required for ApproveMode' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Fetching ApproveMode design:', designUrl);
      try {
        if (!designUrl.startsWith('http://') && !designUrl.startsWith('https://')) {
          throw new Error(`Invalid design URL format: ${designUrl}`);
        }

        const designResponse = await fetch(designUrl, {
          headers: { 'User-Agent': 'Deno/1.0' }
        });
        
        if (!designResponse.ok) {
          throw new Error(`Failed to fetch design: ${designResponse.status} ${designResponse.statusText}`);
        }

        const designBlob = await designResponse.arrayBuffer();
        const uint8Array = new Uint8Array(designBlob);
        let binaryString = '';
        const chunkSize = 8192;
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
          binaryString += String.fromCharCode.apply(null, Array.from(chunk));
        }
        const base64Design = btoa(binaryString);
        patternImageUrl = `data:image/png;base64,${base64Design}`;
        console.log('Design image loaded successfully');
      } catch (error: any) {
        console.error('Failed to fetch design image:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to load design image', details: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const cameraAngle = viewType === 'front'
        ? 'HERO 3/4 FRONT angle - Front-left corner, showcasing hood and front panels'
        : viewType === 'side'
        ? 'TRUE SIDE PROFILE - Perfect 90 degree side view from driver side showing full vehicle length'
        : viewType === 'passenger-side'
        ? 'TRUE SIDE PROFILE - Perfect 90 degree side view from passenger (right) side showing full vehicle length'
        : viewType === 'rear'
        ? 'REAR 3/4 VIEW - Rear-left corner showing trunk and rear panels'
        : viewType === 'top'
        ? 'TOP VIEW - Overhead perspective showing roof and hood design'
        : 'DRAMATIC HERO ANGLE - Front-right 3/4 view at slightly lower angle, showcasing design details with professional lighting';

      aiPrompt = `🚨🚨🚨 CRITICAL IMAGE FORMAT REQUIREMENT 🚨🚨🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ MANDATORY ASPECT RATIO - READ THIS FIRST ⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OUTPUT IMAGE MUST BE:
✅ EXACTLY 16:9 LANDSCAPE aspect ratio
✅ Resolution: 1920x1080 pixels OR 1792x1008 pixels
✅ Width ÷ Height = 1.777... (16÷9)

ABSOLUTELY FORBIDDEN:
❌ NO square images (1:1 ratio)
❌ NO portrait orientation
❌ NO other aspect ratios (4:3, 3:2, etc.)
❌ ZERO deviation from 16:9

🔴 THIS IS NON-NEGOTIABLE - ASPECT RATIO VERIFICATION REQUIRED 🔴
Before generating, VERIFY: Is output 16:9 landscape? If NO, STOP and RECONFIGURE.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨🚨🚨 UNIVERSAL PHOTOREALISM REQUIREMENT 🚨🚨🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ MANDATORY - THIS MUST LOOK LIKE A REAL PHOTOGRAPH ⚠️

CRITICAL PHOTOREALISM STANDARDS:
✅ Professional DSLR camera quality (Canon EOS R5, Nikon Z9, Sony A1 level)
✅ Real automotive photography standards - NOT CGI, NOT AI art, NOT illustration
✅ Zero AI artifacts, zero synthetic appearance, zero "rendered" look
✅ Must be INDISTINGUISHABLE from an actual photograph taken in a real studio
✅ Real camera sensor characteristics: subtle grain, natural chromatic aberration
✅ Professional depth of field: subject sharp, subtle background softness
✅ Authentic automotive lighting: soft diffused studio lights, natural reflections
✅ Real-world materials: authentic vinyl texture, genuine surface reflections
✅ True photographic color rendition: accurate color temperature, natural saturation
✅ Physical realism: correct shadows, believable reflections, real-world proportions

PROFESSIONAL CAMERA SPECIFICATIONS:
- Camera: Full-frame DSLR (50MP+ sensor)
- Lens: 50mm f/1.8 prime lens
- Settings: f/2.8 aperture, 1/250s shutter, ISO 400
- Color: Natural daylight balance (5500K)
- Focus: Tack-sharp on vehicle with subtle depth-of-field
- Post-processing: Minimal - natural film-like grade

🔴 ABSOLUTE REQUIREMENT: If this doesn't look like it could be in a professional automotive magazine photoshoot, it FAILS COMPLETELY.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚫 FORBIDDEN TEXT/WATERMARK INSTRUCTIONS 🚫
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ DO NOT add ANY text, logos, or watermarks from the uploaded design file
❌ DO NOT copy designer signatures, brand names, or copyright text
❌ DO NOT include ANY text visible in the source design (unless text is part of the design itself)
❌ IGNORE any watermarks like "DESIGNS", company names, designer credits
❌ The ONLY text allowed is the mandatory branding overlay specified below
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are RestylePro™ ApproveMode™ - the industry's most advanced 3D wrap proof system.

🚨 ABSOLUTE REQUIREMENTS FOR PHOTOREALISTIC DESIGN APPLICATION 🚨

1. DESIGN EXTRACTION (CRITICAL):
   - Extract ONLY the wrap design graphics from the uploaded image
   - ZERO TOLERANCE for background inclusion
   - The uploaded image MAY contain mock-ups, templates, measurement grids, or backgrounds
   - IGNORE ALL backgrounds, templates, grids, text overlays, mock-up vehicles
   - Apply ONLY the actual wrap design/graphics to the ${vehicle}
   - Design must flow with PERFECT continuity across all body panels

2. STUDIO PHOTOGRAPHY REQUIREMENTS:
   - Professional DSLR camera: 50mm lens, f/2.8 aperture, 1/250s shutter speed
   - THREE-POINT STUDIO LIGHTING:
     * Soft diffused overhead key light (main illumination)
     * Subtle fill light from front-right (eliminates harsh shadows)  
     * Gentle rim light highlighting vehicle contours and wrap edges
   - Natural shadow fall: 15-20 degrees from vehicle base, soft edges
   - Textured polished concrete floor with subtle reflections
   - Clear horizontal line where floor meets wall
   - Medium-dark neutral gray wall gradient
   - Clean, minimalist automotive studio aesthetic
   - Perfect color accuracy, professional depth of field

3. WRAP INSTALLATION PERFECTION (MANDATORY):
   - ZERO air bubbles, ZERO wrinkles, ZERO imperfections
   - Perfect adhesion to all body panels
   - Seamless flow across panel gaps and curves  
   - Professional installer quality - flawless application
   - Realistic vinyl texture with appropriate gloss sheen
   - Design maintains proper orientation and scale

4. FINISH: GLOSS - Mirror-like reflections, wet look, maximum shine, sharp highlights

5. 🚫 NO TEXT RULE 🚫
   DO NOT add ANY text, watermarks, logos, or branding to this image.
   The render must be completely text-free.

CAMERA ANGLE: ${cameraAngle}

BODY PANELS TO WRAP:
✓ Hood, Roof, Trunk/Deck
✓ Doors, Fenders, Quarter panels  
✓ Bumper covers (painted parts only)

NEVER WRAP:
❌ Wheels, Tires, Rims (keep original dark/black)
❌ Windows, Glass
❌ Headlights, Taillights
❌ Grilles, Chrome trim
❌ Badges, Emblems

QUALITY STANDARD: This render will be shown to clients for design approval. It MUST be indistinguishable from a professional automotive photography shoot. FLAWLESS execution required.

OUTPUT: Ultra-photorealistic ${cameraAngle} of ${vehicle} with uploaded custom wrap design applied. MUST be EXACTLY 16:9 landscape (1792x1008 or 1920x1080). Must look like a real photograph taken in a professional studio. NO TEXT OR BRANDING.`;
    } else {
      // Solid color mode (ColorPro, Material, etc.)
      // ============= SOLID COLOR MODE (ColorPro) - CENTRALIZED PROMPT =============
      let { colorName, hex, finish = 'gloss', colorLibrary = 'colorpro', swatchImageUrl, manufacturer } = colorData || {};

      // Normalize manufacturer to avoid accidental AI overrides (e.g. "Avery Dennison" vs "Avery")
      const normalizedManufacturer = typeof manufacturer === 'string'
        ? (manufacturer.toLowerCase().includes('avery') ? 'Avery' : manufacturer.toLowerCase().includes('3m') ? '3M' : manufacturer)
        : manufacturer;

      // 🔒 PRIORITY: Database finish (dbFinish) overrides AI-detected finish for verified swatches
      if (colorData?.dbFinish && colorData.isVerifiedMatch) {
        console.log(`🔒 USING DATABASE FINISH: ${colorData.dbFinish} (was: ${finish})`);
        finish = colorData.dbFinish;
      }

      // ============= 🔒 HARD-LOCKED DATAFORSEO PIPELINE FOR SWATCH UPLOADS 🔒 =============
      // MANDATORY: For uploaded swatches, DataForSEO MUST return wrapped vehicle images
      // If no real-world references found, we CANNOT do realistic renders
      let isUploadedSwatch = !!swatchImageUrl;
      let wrappedVehicleImages: string[] = [];
      let renderMode: 'realistic' | 'abstract' = 'realistic';
      let abstractReason: string | null = null;

      if (isUploadedSwatch && normalizedManufacturer && colorName) {
        console.log('🔒 SWATCH UPLOAD DETECTED - Initiating MANDATORY DataForSEO search');
        console.log(`📸 Searching for: ${normalizedManufacturer} ${colorName} ${finish} wrapped vehicles`);

        const DATAFORSEO_API_KEY = Deno.env.get('DATAFORSEO_API_KEY');

        if (!DATAFORSEO_API_KEY) {
          console.warn('⚠️ DATAFORSEO_API_KEY not configured - cannot ground swatch in reality');
        } else {
          // Build multiple search queries for best results
          const searchQueries = [
            `${normalizedManufacturer} ${colorName} ${finish} vinyl wrap car`,
            `${normalizedManufacturer} ${colorName} wrapped vehicle`,
            `${colorName} ${finish} wrap installed car`,
          ];

          for (const query of searchQueries) {
            if (wrappedVehicleImages.length >= 3) break; // Got enough

            try {
              console.log(`🔍 DataForSEO query: "${query}"`);
              const searchResponse = await fetch('https://api.dataforseo.com/v3/serp/google/images/live/advanced', {
                method: 'POST',
                headers: {
                  'Authorization': `Basic ${DATAFORSEO_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify([{
                  keyword: query,
                  location_code: 2840,
                  language_code: "en",
                  device: "desktop",
                  depth: 15,
                }])
              });

              if (searchResponse.ok) {
                const searchData = await searchResponse.json();
                const results = searchData.tasks?.[0]?.result?.[0]?.items || [];
                console.log(`📸 Found ${results.length} images for query: "${query}"`);

                // Filter for valid VEHICLE images (not product pages)
                for (const item of results) {
                  if (wrappedVehicleImages.length >= 5) break;
                  if (item.url && isValidImageUrl(item.url)) {
                    // Prioritize images that look like wrapped vehicles
                    const titleLower = (item.title || '').toLowerCase();
                    const isVehiclePhoto = titleLower.includes('wrap') ||
                      titleLower.includes('car') ||
                      titleLower.includes('vehicle') ||
                      titleLower.includes('installed') ||
                      titleLower.includes('vinyl');
                    if (isVehiclePhoto || wrappedVehicleImages.length < 2) {
                      wrappedVehicleImages.push(item.url);
                      console.log(`✅ Added wrapped vehicle reference: ${item.url.substring(0, 60)}...`);
                    }
                  }
                }
              }
            } catch (e) {
              console.error(`DataForSEO search failed for query: ${query}`, e);
            }
          }
        }

        // 🔒 DATABASE MATCH BYPASS - If verified database match, skip abstract mode requirement
        const isVerifiedDbMatch = colorData?.isVerifiedMatch === true;

        // 🔒 HARD REQUIREMENT CHECK - Must have 2+ images for realistic mode UNLESS we have DB match
        if (wrappedVehicleImages.length < 2 && !isVerifiedDbMatch) {
          console.warn(`⚠️ INSUFFICIENT REFERENCE IMAGES (${wrappedVehicleImages.length}) and no DB match - Downgrading to ABSTRACT mode`);
          renderMode = 'abstract';
          abstractReason = `No real-world wrapped vehicle references found for ${normalizedManufacturer} ${colorName}. Showing color preview.`;
        } else if (wrappedVehicleImages.length < 2 && isVerifiedDbMatch) {
          console.log(`✅ DATABASE MATCH FOUND - Using realistic mode despite limited references (verified: ${normalizedManufacturer} ${colorName})`);
          renderMode = 'realistic';
        } else {
          console.log(`✅ GROUNDED IN REALITY: ${wrappedVehicleImages.length} wrapped vehicle references found`);
          // Populate webSearchPhotos for use in AI call
          webSearchPhotos = wrappedVehicleImages.map(url => ({
            url,
            title: `${normalizedManufacturer} ${colorName} wrapped vehicle`,
            source: 'dataforseo_mandatory'
          }));
        }
      }

      // ============= AI COLOR INTELLIGENCE SYSTEM =============
      let colorIntelligence: any = null;

      // HARDWIRED: If we have a swatchId, we treat it as a database-authoritative match
      // and we DO NOT run any AI-based "corrections".
      const swatchIdPresent = !!(colorData?.id || colorData?.swatchId);

      // Extract isVerifiedMatch flag from colorData - if true, skip AI overrides
      const isVerifiedMatch = colorData?.isVerifiedMatch === true || swatchIdPresent;

      // Only run AI Color Intelligence for NON-verified matches
      if (!isVerifiedMatch && normalizedManufacturer && normalizedManufacturer !== 'InkFusion' && normalizedManufacturer !== 'Avery' && normalizedManufacturer !== '3M') {
        console.log('🔍 Getting AI color intelligence for custom manufacturer:', { manufacturer: normalizedManufacturer, colorName, finish, hex });
      } else if (isVerifiedMatch) {
        console.log('✅ Skipping AI color intelligence - using verified database match');
      }

      if (!isVerifiedMatch && normalizedManufacturer && normalizedManufacturer !== 'InkFusion' && normalizedManufacturer !== 'Avery' && normalizedManufacturer !== '3M') {
        try {
          const intelligenceResponse = await supabase.functions.invoke('search-vinyl-color-intelligence', {
            body: { manufacturer: normalizedManufacturer, colorName, finishType: finish, userProvidedHex: hex }
          });
          
          if (intelligenceResponse.data?.success && intelligenceResponse.data.intelligence) {
            colorIntelligence = intelligenceResponse.data.intelligence;
            console.log('✅ AI Color Intelligence received:', colorIntelligence);
            
            if (colorIntelligence.correctedHex && colorIntelligence.confidence >= 0.7) {
              console.log(`🎨 Using AI-corrected hex: ${colorIntelligence.correctedHex} (was: ${hex})`);
              hex = colorIntelligence.correctedHex;
            }
            
            if (colorIntelligence.detectedFinish && colorIntelligence.confidence >= 0.7) {
              console.log(`✨ Using AI-detected finish: ${colorIntelligence.detectedFinish} (was: ${finish})`);
              finish = colorIntelligence.detectedFinish;
            }
          }
        } catch (error) {
          console.error('⚠️ Color intelligence fetch failed, continuing with original values:', error);
        }
      }
      
      // ============= COLOR-FLIP/CHAMELEON DETECTION =============
      const colorFlipKeywords = ['flip', 'chameleon', 'colorflow', 'iridescent', 'psychedelic', 'color shift', 'colorshift', 'duo', 'duotone', 'multitone', 'color flip', 'satin flip'];
      const isColorFlipFilm = colorFlipKeywords.some(keyword => 
        colorName.toLowerCase().includes(keyword) || 
        (colorData?.series && colorData.series.toLowerCase().includes(keyword))
      );
      
      if (isColorFlipFilm) {
        console.log(`🌈 COLOR-FLIP FILM DETECTED: ${colorName}`);
      }
      
      // ============= MATERIAL PROFILE FROM manufacturer_colors (AUTHORITATIVE) =============
      // PRIORITY: manufacturer_colors is the authoritative source of truth
      // Only fall back to vinyl_swatches if not found in manufacturer_colors
      let materialProfile: { lab?: any; reflectivity?: number; metallic_flake?: number; finish_profile?: any; material_validated?: boolean } = {};
      let swatchMediaUrl: string | null = null; // Official swatch image from authoritative source
      const swatchId = colorData?.id || colorData?.swatchId;
      let isFromOfficialSource = false;
      
      // OPTIMIZATION: Use cached data if provided (for additional views)
      if (skipLookups && cachedMaterialProfile) {
        materialProfile = cachedMaterialProfile;
        console.log('⚡ Using cached material profile (skipLookups=true)');
      } else if (swatchId || (normalizedManufacturer && colorName)) {
        console.log(`🔬 Fetching material profile - checking manufacturer_colors FIRST`);
        
        // STEP 1: Try manufacturer_colors table (authoritative source)
        try {
          let mfcQuery = supabase
            .from('manufacturer_colors')
            .select('id, official_name, official_hex, official_swatch_url, lab_l, lab_a, lab_b, finish, manufacturer, product_code')
            .eq('is_verified', true);
          
          // Try to match by ID first, then by manufacturer + name
          if (swatchId) {
            mfcQuery = mfcQuery.eq('id', swatchId);
          } else if (normalizedManufacturer && colorName) {
            mfcQuery = mfcQuery
              .eq('manufacturer', normalizedManufacturer)
              .ilike('official_name', colorName);
          }
          
          const { data: mfcData, error: mfcError } = await mfcQuery.maybeSingle();
          
          if (mfcData && !mfcError) {
            console.log('✅ AUTHORITATIVE SOURCE: Found in manufacturer_colors table');
            isFromOfficialSource = true;
            
            // Build LAB object if values exist
            if (mfcData.lab_l !== null && mfcData.lab_a !== null && mfcData.lab_b !== null) {
              materialProfile.lab = {
                l: mfcData.lab_l,
                a: mfcData.lab_a,
                b: mfcData.lab_b
              };
            }
            materialProfile.material_validated = true;
            
            // Use official swatch URL as the authoritative reference
            if (mfcData.official_swatch_url) {
              swatchMediaUrl = mfcData.official_swatch_url;
              console.log('🔒 Using OFFICIAL swatch URL from manufacturer_colors:', swatchMediaUrl);
            }
            
            // Override color data with authoritative values
            if (mfcData.official_hex) {
              hex = mfcData.official_hex;
              console.log('🔒 Using OFFICIAL hex from manufacturer_colors:', hex);
            }
            if (mfcData.official_name) {
              colorName = mfcData.official_name;
              console.log('🔒 Using OFFICIAL name from manufacturer_colors:', colorName);
            }
            if (mfcData.finish) {
              finish = mfcData.finish;
              console.log('🔒 Using OFFICIAL finish from manufacturer_colors:', finish);
            }
            
            console.log('✅ Material profile loaded from AUTHORITATIVE source:', {
              hasLab: !!materialProfile.lab,
              material_validated: materialProfile.material_validated,
              hasOfficialSwatchImage: !!swatchMediaUrl,
              productCode: mfcData.product_code
            });
          }
        } catch (e) {
          console.error('⚠️ Failed to query manufacturer_colors:', e);
        }
        
        // STEP 2: Fall back to vinyl_swatches ONLY if not found in manufacturer_colors
        if (!isFromOfficialSource && swatchId) {
          console.log('⚠️ Not found in manufacturer_colors, falling back to vinyl_swatches');
          try {
            const { data: swatchData, error: swatchError } = await supabase
              .from('vinyl_swatches')
              .select('lab, reflectivity, metallic_flake, finish_profile, material_validated, media_url')
              .eq('id', swatchId)
              .single();
            
            if (swatchData && !swatchError) {
              materialProfile = {
                lab: swatchData.lab,
                reflectivity: swatchData.reflectivity,
                metallic_flake: swatchData.metallic_flake,
                finish_profile: swatchData.finish_profile,
                material_validated: swatchData.material_validated
              };
              // Store swatch media_url as fallback reference
              if (swatchData.media_url) {
                swatchMediaUrl = swatchData.media_url;
                console.log('📷 Fallback swatch media_url:', swatchMediaUrl);
              }
              console.log('✅ Material profile loaded from vinyl_swatches (fallback):', {
                hasLab: !!materialProfile.lab,
                reflectivity: materialProfile.reflectivity,
                metallic_flake: materialProfile.metallic_flake,
                material_validated: materialProfile.material_validated,
                hasSwatchImage: !!swatchMediaUrl
              });
            }
          } catch (e) {
            console.error('⚠️ Failed to fetch material profile from vinyl_swatches:', e);
          }
        }
      }
      
      // ============= STORED REFERENCE IMAGES (CHECK FIRST - FAST) =============
      let storedReferenceUrls: string[] = [];
      let hasStoredReferences = false;
      
      // OPTIMIZATION: Use cached reference URLs if provided (for additional views)
      if (skipLookups && cachedReferenceUrls && cachedReferenceUrls.length > 0) {
        storedReferenceUrls = cachedReferenceUrls;
        hasStoredReferences = true;
        webSearchPhotos = cachedReferenceUrls.map((url: string) => ({ 
          url, 
          title: `${manufacturer} ${colorName}`,
          source: 'cached_reference'
        }));
        console.log(`⚡ Using ${cachedReferenceUrls.length} cached reference URLs (skipLookups=true)`);
      } else if (manufacturer && manufacturer !== 'InkFusion') {
        console.log(`🔍 Checking stored references for: ${manufacturer} ${colorName}`);
        
        let refQuery = supabase
          .from('vinyl_reference_images')
          .select('image_url, image_type, color_characteristics, is_verified, score')
          .eq('manufacturer', manufacturer)
          .ilike('color_name', colorName);
        
        if (swatchId) {
          refQuery = supabase
            .from('vinyl_reference_images')
            .select('image_url, image_type, color_characteristics, is_verified, score')
            .eq('swatch_id', swatchId);
        }
        
        const { data: storedRefs, error: refError } = await refQuery
          .order('is_verified', { ascending: false })
          .order('score', { ascending: false, nullsFirst: false })
          .order('image_type', { ascending: true })
          .limit(5);
        
        if (storedRefs && storedRefs.length > 0 && !refError) {
          const validRefs = storedRefs.filter(r => isValidImageUrl(r.image_url));
          
          if (validRefs.length > 0) {
            hasStoredReferences = true;
            storedReferenceUrls = validRefs.map(r => r.image_url);
            console.log(`✅ Found ${validRefs.length} VALID stored reference images`);
            
            webSearchPhotos = validRefs.map(r => ({ 
              url: r.image_url, 
              title: `${manufacturer} ${colorName}`,
              source: 'stored_reference'
            }));
          }
        }
      }
      
      // ============= MANDATORY WEB IMAGE SEARCH =============
      // ALWAYS search for manufacturer images when no stored references exist
      // This ensures we use REAL manufacturer film images, not just hex colors
      const shouldSearchWeb = !hasStoredReferences && manufacturer && manufacturer !== 'InkFusion';
      const isColorFlowFilm = isColorFlipFilm || (finish || '').toLowerCase().includes('colorflow');
      
      // For ColorFlow/flip films: ALWAYS search fresh (color-shift requires real photos)
      const forceSearch = isColorFlowFilm && manufacturer && manufacturer !== 'InkFusion';
      
      if (shouldSearchWeb || forceSearch) {
        console.log(`🔍 MANDATORY DataForSEO search for: ${manufacturer} ${colorName} (forceSearch=${forceSearch})`);
        try {
          const searchResponse = await fetch(`${supabaseUrl}/functions/v1/search-vinyl-product-images`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ manufacturer, colorName, productCode: colorData?.productCode }),
          });

          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            console.log(`✅ Found ${searchData.photos?.length || 0} web images from DataForSEO`);
            webSearchPhotos = searchData.photos || [];
            
            // CRITICAL: Store reference images in database for future renders
            // This is MANDATORY - every successful search populates our reference library
            if (webSearchPhotos.length > 0) {
              // Filter to only actual image URLs before storing
              const validPhotos = webSearchPhotos.filter(photo => isValidImageUrl(photo.url));
              console.log(`📸 SAVING ${validPhotos.length} valid manufacturer images to database (filtered from ${webSearchPhotos.length} web results)`);
              
              const swatchIdToUse = swatchId || colorData?.id || null;
              
              const insertPromises = validPhotos.slice(0, 5).map(photo => 
                supabase.from('vinyl_reference_images').upsert({
                  swatch_id: swatchIdToUse,
                  manufacturer,
                  color_name: colorName,
                  product_code: colorData?.productCode || colorData?.code || null,
                  image_url: photo.url,
                  source_url: photo.source || null,
                  image_type: photo.title?.toLowerCase().includes('wrap') ? 'vehicle_installation' : 'product_sheet',
                  search_query: `${manufacturer} ${colorData?.productCode || ''} ${colorName} vinyl wrap`,
                  color_characteristics: { finish, is_flip: isColorFlipFilm },
                  is_verified: true,
                  verified_at: new Date().toISOString()
                }, { onConflict: 'image_url', ignoreDuplicates: true })
              );
              
              // Execute all inserts and update swatch flags
              Promise.all(insertPromises).then(async () => {
                console.log('✅ SAVED manufacturer reference images to vinyl_reference_images table');
                
                // Update vinyl_swatches to mark reference bundle as complete
                if (swatchIdToUse) {
                  await supabase.from('vinyl_swatches').update({
                    has_reference_bundle: true,
                    is_flip_film: isColorFlipFilm,
                    reference_image_count: validPhotos.length
                  }).eq('id', swatchIdToUse);
                  console.log('✅ Updated vinyl_swatches.has_reference_bundle = true');
                }
              }).catch(e => console.error('❌ Failed to store reference images:', e));
            }

            // Validate color from real photos
            if (webSearchPhotos.length > 0) {
              console.log('🤖 Validating color from real product photos...');
              const validateResponse = await fetch(`${supabaseUrl}/functions/v1/validate-vinyl-color-from-images`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  referenceImages: webSearchPhotos,
                  manufacturer, colorName,
                  productCode: colorData?.productCode,
                  userProvidedHex: hex,
                }),
              });

              if (validateResponse.ok) {
                const validateData = await validateResponse.json();
                validatedColorData = validateData.validated;
                console.log('✅ Color validated from real photos:', {
                  originalHex: hex,
                  validatedHex: validatedColorData.hexCode,
                  confidence: validatedColorData.confidence,
                });

                if (validatedColorData.confidence >= 0.7) {
                  hex = validatedColorData.hexCode;
                  console.log(`🎨 Using validated hex from real photos: ${hex}`);
                }
              }
            }
          }
        } catch (error) {
          console.error('Web search error (non-fatal):', error);
        }
      }
      
      // ============= CRITICAL: SWATCH MEDIA_URL IS PRIMARY REFERENCE =============
      // The swatch image from vinyl_swatches IS the real manufacturer color - use it FIRST
      // Web search results are supplementary references, not primary
      if (swatchMediaUrl) {
        console.log('🎯 USING SWATCH MEDIA_URL AS PRIMARY COLOR REFERENCE (THIS IS THE REAL MANUFACTURER COLOR)');
        // Prepend swatch to stored references so it's always first
        storedReferenceUrls = [swatchMediaUrl, ...storedReferenceUrls.filter(url => url !== swatchMediaUrl)];
        hasStoredReferences = true;
      } else if (storedReferenceUrls.length === 0 && webSearchPhotos.length === 0) {
        console.warn('⚠️ NO SWATCH IMAGE OR REFERENCE IMAGES - rendering from hex only (less accurate)');
      }
      
      // ============= LOAD REFERENCE IMAGES FOR AI =============
      let referenceImages: string[] = [];
      
      if (storedReferenceUrls.length > 0) {
        console.log(`📸 Loading ${storedReferenceUrls.length} reference images...`);
        for (const refUrl of storedReferenceUrls.slice(0, 3)) {
          try {
            const imgResponse = await fetch(refUrl, { headers: { 'User-Agent': 'Deno/1.0' } });
            if (imgResponse.ok) {
              const imgBlob = await imgResponse.arrayBuffer();
              const uint8Array = new Uint8Array(imgBlob);
              let binaryString = '';
              const chunkSize = 8192;
              for (let i = 0; i < uint8Array.length; i += chunkSize) {
                const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
                binaryString += String.fromCharCode.apply(null, Array.from(chunk));
              }
              referenceImages.push(`data:image/png;base64,${btoa(binaryString)}`);
              console.log(`✅ Loaded stored reference image ${referenceImages.length}`);
            }
          } catch (e) {
            console.error('Failed to load stored reference image:', e);
          }
        }
      } else if (manufacturer && colorName && finish) {
        console.log('🔍 Searching database for quality-verified reference renders...');
        try {
          const refResponse = await supabase.functions.invoke('find-reference-renders', {
            body: { manufacturer, colorName, finish, hex }
          });

          if (refResponse.data?.references && refResponse.data.references.length > 0) {
            console.log(`✅ Found ${refResponse.data.references.length} quality-verified reference renders`);
            
            for (const ref of refResponse.data.references) {
              try {
                const imgResponse = await fetch(ref.url, { headers: { 'User-Agent': 'Deno/1.0' } });
                if (imgResponse.ok) {
                  const imgBlob = await imgResponse.arrayBuffer();
                  const uint8Array = new Uint8Array(imgBlob);
                  let binaryString = '';
                  const chunkSize = 8192;
                  for (let i = 0; i < uint8Array.length; i += chunkSize) {
                    const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
                    binaryString += String.fromCharCode.apply(null, Array.from(chunk));
                  }
                  referenceImages.push(`data:image/png;base64,${btoa(binaryString)}`);
                  console.log(`✅ Loaded reference image ${referenceImages.length}`);
                }
              } catch (e) {
                console.error('Failed to load reference image:', e);
              }
            }
          }
        } catch (e) {
          console.error('Error fetching reference renders:', e);
        }
      }
      
      // Load custom swatch image if provided
      if (swatchImageUrl) {
        try {
          if (swatchImageUrl.startsWith('http://') || swatchImageUrl.startsWith('https://')) {
            const swatchResponse = await fetch(swatchImageUrl, { headers: { 'User-Agent': 'Deno/1.0' } });
            if (swatchResponse.ok) {
              const swatchBlob = await swatchResponse.arrayBuffer();
              const uint8Array = new Uint8Array(swatchBlob);
              let binaryString = '';
              const chunkSize = 8192;
              for (let i = 0; i < uint8Array.length; i += chunkSize) {
                const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
                binaryString += String.fromCharCode.apply(null, Array.from(chunk));
              }
              patternImageUrl = `data:image/png;base64,${btoa(binaryString)}`;
              console.log('✅ Custom swatch image loaded');
            }
          }
        } catch (e) {
          console.error('Failed to load custom swatch image:', e);
        }
      }

      // ============= USE UNIFIED BUILDER SUITE (COLORPRO STRICT MODE) =============
      console.log('🎯 Using Unified Builder Suite (ColorPro Strict Mode)');
      
      // 🔒 HARD-LOCKED: For swatch uploads, use wrapped vehicle images as PRIMARY references
      const effectiveReferenceUrls = isUploadedSwatch && wrappedVehicleImages.length >= 2
        ? [...wrappedVehicleImages, ...(storedReferenceUrls || [])]
        : storedReferenceUrls;
      
      // Build prompt with render mode awareness
      if (isUploadedSwatch && renderMode === 'abstract') {
        // ABSTRACT MODE: No real-world references, generate concept preview only
        console.log('⚠️ ABSTRACT MODE: Generating color concept preview (not grounded in reality)');
        
        // 🔒 HARD-LOCKED STUDIO ENVIRONMENT (same as ColorPro realistic mode)
        const ABSTRACT_STUDIO = `
=== 🎬 STUDIO ENVIRONMENT (MANDATORY - DO NOT DEVIATE) ===

STUDIO WALLS: Light gray walls (#4a4a4a to #3a3a3a gradient)
FLOOR: Dark charcoal polished concrete (#2a2a2a to #1a1a1a)
LIGHTING: Professional automotive photography studio lighting
- Main key light: Large softbox from upper-right
- Fill light: From left side
- Rim lights: Behind vehicle for edge definition

DO NOT use: Black backgrounds, dark walls, outdoor environments, or any non-studio setting.
THIS IS A CONTROLLED STUDIO SHOOT with LIGHT GRAY WALLS and DARK POLISHED FLOOR.
`;

        // 🔒 FINISH ENFORCEMENT - MATTE vs GLOSS vs SATIN
        const finishLower = (finish || '').toLowerCase();
        let FINISH_ENFORCEMENT = '';
        if (finishLower.includes('matte') || finishLower.includes('mat')) {
          FINISH_ENFORCEMENT = `
=== 🔒 FINISH ENFORCEMENT: MATTE (CRITICAL) ===
The finish is MATTE - this means:
• COMPLETELY FLAT, NON-REFLECTIVE surface
• ZERO shine, ZERO gloss, ZERO specularity
• NO mirror reflections, NO highlights
• Soft, velvety appearance that absorbs light
• Like brushed concrete or velvet - NO wet look whatsoever
YOU MUST render this as TRUE MATTE with absolutely NO glossy appearance.
`;
        } else if (finishLower.includes('satin')) {
          FINISH_ENFORCEMENT = `
=== 🔒 FINISH ENFORCEMENT: SATIN ===
The finish is SATIN - this means:
• Soft subtle sheen, silk-like appearance
• Low reflectivity, diffused highlights
• Smooth but not mirror-like
• Somewhere between matte and gloss
`;
        } else if (finishLower.includes('gloss') || finishLower.includes('high gloss')) {
          FINISH_ENFORCEMENT = `
=== 🔒 FINISH ENFORCEMENT: GLOSS ===
The finish is GLOSS - this means:
• SHINY reflective surface with sharp highlights
• Mirror-like reflections visible
• Wet-look appearance with high specularity
`;
        }

        aiPrompt = `
=== 🎨 COLOR PREVIEW MODE 🎨 ===

VEHICLE: ${vehicle}
${ABSTRACT_STUDIO}

COLOR INFORMATION:
- Color Name: ${colorName}
- Manufacturer: ${manufacturer || 'Unknown'}
- Hex Code: ${hex}
- Finish: ${finish}
${FINISH_ENFORCEMENT}

CAMERA: ${cameraPositioning}

OUTPUT: Render ${vehicle} with ${colorName} ${finish} color from ${manufacturer || 'Unknown'}.
Show the vehicle with this EXACT color and EXACT finish type.
Professional automotive photography quality.

=== NO TEXT RULE ===
DO NOT add ANY text, watermarks, logos, or branding to this image.

Ultra-high resolution 4K output (3840×2160px minimum), 16:9 aspect ratio.
Tack-sharp detail on all body panels. No soft focus.
`.trim();
      } else {
        // REALISTIC MODE: Grounded in real wrapped vehicle photos
        aiPrompt = buildRestyleProRenderPrompt({
          mode: "color",
          vehicle,
          cameraPositioning,
          viewType,
          colorName,
          manufacturer: manufacturer || '',
          hex,
          finish,
          lab: materialProfile.lab,
          reflectivity: materialProfile.reflectivity,
          metallic_flake: materialProfile.metallic_flake,
          finish_profile: materialProfile.finish_profile,
          referenceImages: effectiveReferenceUrls,
          isColorFlipFilm,
          validatedColorData,
          colorIntelligence,
          environment: "studio",
          debugMode: false,
        });
        
        // 🔒 For swatch uploads with DataForSEO references, add grounding instructions
        if (isUploadedSwatch && wrappedVehicleImages.length >= 2) {
          aiPrompt += `

=== 📸 MANDATORY: GROUNDED IN REAL WRAPPED VEHICLES 📸 ===

${wrappedVehicleImages.length} REAL WRAPPED VEHICLE REFERENCE IMAGES are provided.

YOU MUST:
• USE the reference images as PRIMARY source of truth for color appearance
• MATCH how the vinyl actually looks when installed on real vehicles
• The swatch image shows the COLOR only - wrapped vehicles show BEHAVIOR
• Reference images show: real-world reflections, panel curves, lighting interaction

DO NOT:
• Ignore the wrapped vehicle reference photos
• Guess at color behavior based only on hex code
• Create your own interpretation of how the finish should look

The wrapped vehicle photos ARE your ground truth for material behavior.
=== END GROUNDING INSTRUCTIONS ===
`;
        }
      }
      
      console.log(`✅ Unified Builder ColorPro ${renderMode === 'abstract' ? 'Abstract' : 'Strict'} Mode active`);
    }

    // ============= APPEND REVISION INSTRUCTIONS IF PROVIDED (4-LAYER IRONCLAD ENGINE) =============
    if (revisionPrompt && typeof revisionPrompt === 'string' && revisionPrompt.trim()) {
      console.log('📝 REVISION MODE: Activating 4-Layer Ironclad Prompt Engine');
      
      // Validate the revision request
      const validation = validateRevisionRequest(revisionPrompt);
      if (validation.warnings.length > 0) {
        console.log('⚠️ Revision warnings:', validation.warnings);
        if (validation.suggestedAction) {
          console.log('💡 Suggested action:', validation.suggestedAction);
        }
      }
      
      // Determine tool type for context
      const toolType = modeType === 'wbty' ? 'patternpro' 
        : modeType === 'inkfusion' || modeType === 'colorpro' || modeType === 'ColorPro' ? 'colorpro'
        : modeType as 'colorpro' | 'designpanelpro' | 'patternpro' | 'wbty' | 'fadewraps' | 'approvemode';
      
      // Check if this is a multi-view generation (ApproveMode typically generates 6 views)
      const isMultiView = modeType === 'approvemode';
      
      // Build the complete 4-layer revision prompt block
      const revisionBlock = buildRevisionPromptBlock({
        revisionPrompt: revisionPrompt.trim(),
        toolType,
        isMultiView,
        currentViewType: viewType
      });
      
      aiPrompt += revisionBlock;
      console.log('✅ 4-Layer Ironclad Engine activated with:', {
        tool: toolType,
        isMultiView,
        viewType,
        promptLength: revisionPrompt.length
      });
    }

    console.log('Calling Google Gemini API');

    // Retry logic for transient errors (timeouts, 503s)
    let aiData: { imageUrl?: string; error?: { message?: string; code?: number } } = {};
    let lastError;
    const maxRetries = 3;

    // Build Gemini request parts - collect all image URLs to convert
    const imagesToConvert: { url: string; label: string }[] = [];

    // FadeWraps: ALWAYS include the gold-standard visual reference image (if resolvable)
    if (modeType === 'fadewraps' && standardFadeReferenceUrl) {
      console.log('📸 Adding FadeWraps gold-standard gradient reference image');
      imagesToConvert.push({ url: standardFadeReferenceUrl, label: 'fade-reference' });
    }

    // For ColorProEnhanced/GraphicsPro - add reference image if provided
    if ((modeType === 'ColorProEnhanced' || modeType === 'GraphicsPro') && referenceImageBase64) {
      console.log(`📸 Adding ${modeType} reference image for style inspiration`);
      imagesToConvert.push({ url: referenceImageBase64, label: 'style-reference' });
    }

    // For DesignPanelPro, WBTY, ApproveMode, and FadeWraps - panel/pattern image is PRIMARY
    if (patternImageUrl && (modeType === 'designpanelpro' || modeType === 'wbty' || modeType === 'approvemode' || modeType === 'fadewraps')) {
      console.log(`📸 Adding pattern/design image as PRIMARY reference for ${modeType}`);
      imagesToConvert.push({ url: patternImageUrl, label: 'pattern-primary' });
    }

    // Add web search photos (for ColorPro color reference)
    if (webSearchPhotos && webSearchPhotos.length > 0) {
      const validPhotos = webSearchPhotos.filter(photo => isValidImageUrl(photo.url));
      console.log(`📸 Adding ${validPhotos.length}/${webSearchPhotos.length} validated reference photos to AI prompt`);
      for (const photo of validPhotos) {
        imagesToConvert.push({ url: photo.url, label: 'web-reference' });
      }
    }

    // Add database reference images (if found and no web photos)
    if ((!webSearchPhotos || webSearchPhotos.length === 0) && referenceImages && referenceImages.length > 0) {
      console.log(`📸 Adding ${referenceImages.length} database reference images to AI prompt`);
      for (const refImg of referenceImages) {
        imagesToConvert.push({ url: refImg, label: 'db-reference' });
      }
    }

    // For ColorPro/InkFusion - pattern/swatch image comes after references
    if (patternImageUrl && modeType !== 'designpanelpro' && modeType !== 'wbty' && modeType !== 'approvemode' && modeType !== 'fadewraps') {
      imagesToConvert.push({ url: patternImageUrl, label: 'swatch' });
    }

    // Convert all images to base64 for Gemini API
    console.log(`Converting ${imagesToConvert.length} images to base64 for Gemini...`);
    const geminiParts: any[] = [{ text: aiPrompt }];

    for (const img of imagesToConvert) {
      const base64Data = await imageUrlToBase64(img.url);
      if (base64Data) {
        geminiParts.push({
          inlineData: {
            mimeType: base64Data.mimeType,
            data: base64Data.data
          }
        });
        console.log(`✅ Converted ${img.label} image to base64`);
      } else {
        console.warn(`⚠️ Failed to convert ${img.label} image, skipping`);
      }
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_AI_API_KEY}`;

        const aiResponse = await fetch(geminiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [{
              parts: geminiParts
            }],
            generationConfig: {
              responseModalities: ["TEXT", "IMAGE"],
              responseMimeType: "text/plain"
            }
          })
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error(`Google Gemini API HTTP error (attempt ${attempt}/${maxRetries}):`, errorText);

          if (aiResponse.status === 429) {
            return new Response(
              JSON.stringify({ error: 'Rate limit reached. Please try again in a moment.' }),
              { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          if (aiResponse.status === 403) {
            return new Response(
              JSON.stringify({ error: 'API key invalid or quota exceeded.' }),
              { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          throw new Error(`Google Gemini API failed: ${aiResponse.status}`);
        }

        const geminiData = await aiResponse.json();
        console.log(`AI response received (attempt ${attempt}/${maxRetries})`);

        // Check if response contains an error
        if (geminiData.error) {
          const errorMsg = geminiData.error.message || 'Unknown error';
          const errorCode = geminiData.error.code;

          console.error(`Gemini error (attempt ${attempt}/${maxRetries}):`, {
            code: errorCode,
            message: errorMsg
          });

          // Don't retry for regional restrictions or safety blocks
          if (errorCode === 400 && (errorMsg.includes('blocked') || errorMsg.includes('SAFETY'))) {
            throw new Error(`Image generation blocked. Please try a different prompt or tool.`);
          }

          // Retry for transient errors (503, timeout, unavailable)
          if (errorCode === 503 || errorMsg.includes('Deadline') || errorMsg.includes('UNAVAILABLE') || errorMsg.includes('overloaded')) {
            if (attempt < maxRetries) {
              const waitTime = Math.pow(2, attempt) * 1000;
              console.log(`Retrying after ${waitTime}ms due to transient error...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              continue;
            }
          }

          throw new Error(`Gemini API error: ${errorMsg}`);
        }

        // Extract image from Gemini response format
        // Gemini returns: { candidates: [{ content: { parts: [{ inlineData: { mimeType, data } }] } }] }
        const candidates = geminiData.candidates;
        if (!candidates || candidates.length === 0) {
          console.error('No candidates in Gemini response');
          throw new Error('No response from Gemini API');
        }

        const parts = candidates[0]?.content?.parts;
        if (!parts || parts.length === 0) {
          console.error('No parts in Gemini response');
          throw new Error('No content in Gemini response');
        }

        // Find the image part in the response
        let imageBase64: string | null = null;
        let imageMimeType = 'image/png';

        for (const part of parts) {
          if (part.inlineData) {
            imageBase64 = part.inlineData.data;
            imageMimeType = part.inlineData.mimeType || 'image/png';
            break;
          }
        }

        if (!imageBase64) {
          console.error('No image data in Gemini response');
          throw new Error('No image generated by Gemini');
        }

        // Convert to data URL format for consistency with existing code
        const imageUrl = `data:${imageMimeType};base64,${imageBase64}`;
        aiData.imageUrl = imageUrl;
        console.log('✅ Successfully extracted image from Gemini response');

        // Success - break out of retry loop
        break;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`Attempt ${attempt}/${maxRetries} failed:`, errorMsg);
        
        if (attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000;
          console.log(`Retrying after ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    // Check if we exhausted all retries
    if (!aiData || aiData.error || !aiData.imageUrl) {
      return new Response(
        JSON.stringify({ 
          error: 'AI generation timed out after multiple attempts. The service is temporarily busy.',
          details: lastError?.message || 'Please try again in a moment'
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const imageUrl = aiData.imageUrl;

    // Supabase client already initialized at the top for caching
    const base64Data = imageUrl.split(',')[1];
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    const timestamp = Date.now();
    const fileName = `renders/${modeType}/${timestamp}_${vehicleMake}_${vehicleModel}_${viewType}.png`;
    
    console.log('Uploading to storage:', fileName);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('wrap-files')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Failed to upload render: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('wrap-files')
      .getPublicUrl(fileName);

    console.log('Render uploaded successfully:', publicUrl);

    // ============= CACHE STORAGE LOGIC =============
    // Store render in color_visualizations for caching future requests
    console.log('💾 Storing render in cache...');
    
    try {
      // Check if a visualization record already exists for this design
      let existingViz = null;
      
      let vizQuery = supabase
        .from('color_visualizations')
        .select('id, render_urls')
        .eq('vehicle_year', parseInt(vehicleYear))
        .eq('vehicle_make', vehicleMake.trim().toLowerCase())
        .eq('vehicle_model', vehicleModel.trim().toLowerCase())
        .eq('mode_type', modeType);

      // Add mode-specific matching
      if (modeType === 'approvemode' && effectiveColorData?.designUrl) {
        vizQuery = vizQuery.eq('custom_design_url', effectiveColorData.designUrl);
      } else if ((modeType === 'CustomStyling' || modeType === 'ColorProEnhanced') && effectiveColorData?.customStylingPrompt) {
        // CustomStyling/ColorProEnhanced: match on prompt key
        const promptKey = effectiveColorData.customStylingPrompt
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim()
          .substring(0, 200);
        vizQuery = vizQuery.eq('custom_styling_prompt_key', promptKey);
      } else if (modeType === 'inkfusion' && effectiveColorData?.colorName) {
        vizQuery = vizQuery.eq('color_name', effectiveColorData.colorName);
      } else if ((modeType === 'wbty' || modeType === 'fadewraps') && effectiveColorData?.patternUrl) {
        vizQuery = vizQuery.eq('custom_swatch_url', effectiveColorData.patternUrl);
      }

      const { data: existingData } = await vizQuery.limit(1).maybeSingle();
      existingViz = existingData;

      if (existingViz) {
        // Update existing record with new view
        console.log('Updating existing visualization record:', existingViz.id);
        const currentRenderUrls = (existingViz.render_urls as Record<string, any> || {});
        
        let updatedRenderUrls;
        
        // 360° spin: Store under spin_views[angle]
        if (cameraAngle !== undefined) {
          updatedRenderUrls = {
            ...currentRenderUrls,
            spin_views: {
              ...(currentRenderUrls.spin_views || {}),
              [cameraAngle]: publicUrl
            }
          };
          console.log(`✅ Stored 360° angle ${cameraAngle}° under spin_views`);
        } else {
          // Legacy view type storage
          updatedRenderUrls = {
            ...currentRenderUrls,
            [viewType]: publicUrl
          };
          console.log(`✅ Stored ${viewType} view`);
        }

        const { error: updateError } = await supabase
          .from('color_visualizations')
          .update({
            render_urls: updatedRenderUrls,
            generation_status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingViz.id);

        if (updateError) {
          console.error('Error updating visualization:', updateError);
        } else {
          console.log(`✅ Updated cache record with new render`);
        }
      } else {
        // Create new visualization record
        console.log('Creating new visualization record for user:', userEmail);
        const vizData: any = {
          vehicle_year: parseInt(vehicleYear),
          vehicle_make: vehicleMake.trim().toLowerCase(),
          vehicle_model: vehicleModel.trim().toLowerCase(),
        mode_type: modeType,
        // Use multiZoneLabel for GraphicsPro two-tone, otherwise use colorData
        // NEVER save "Unknown", empty, "Custom", or generic names - use descriptive fallback
        color_name: (() => {
          // Priority 1: multiZoneLabel from zone interpreter (if it's NOT generic)
          if (multiZoneLabel && multiZoneLabel.trim() && 
              !multiZoneLabel.toLowerCase().includes('custom ') &&
              !multiZoneLabel.includes('Custom |') &&
              multiZoneLabel !== 'Unknown' &&
              multiZoneLabel !== 'Custom') {
            // Clean up any "Custom" manufacturers in multi-zone labels
            const cleanedLabel = multiZoneLabel
              .split(' | ')
              .map((part: string) => {
                if (part.trim().startsWith('Custom ')) {
                  // Re-parse this zone's color
                  const colorPart = part.replace(/^Custom\s+/i, '');
                  return pickFilm(colorPart);
                }
                return part;
              })
              .join(' | ');
            return cleanedLabel;
          }
          // Priority 2: colorData.colorName if valid (not generic)
          const name = colorData?.colorName || colorData?.name;
          if (name && name.trim() && 
              name !== 'GraphicsPro Custom' && 
              name !== 'Custom' && 
              name !== 'Custom Color' &&
              name !== 'Unknown' &&
              name !== '(1)' &&
              !name.toLowerCase().startsWith('custom ')) {
            return name;
          }
          // Priority 3: Parse from styling prompt using intelligent label parser
          if (colorData?.customStylingPrompt) {
            return parseGraphicsProLabel(colorData.customStylingPrompt);
          }
          // Priority 4: Construct from manufacturer + finish (if manufacturer is valid)
          const mfr = colorData?.manufacturer;
          if (mfr && mfr !== 'Custom' && mfr.trim()) {
            const colorPart = colorData?.name || colorData?.colorName || '';
            const fin = colorData?.finish || 'Gloss';
            return `${mfr} ${cap(fin)} ${colorPart}`.trim();
          }
          // Priority 5: Use hex to generate a descriptive name
          const hex = colorData?.hex;
          if (hex && hex !== '#000000' && hex !== '#888888') {
            return `${colorData?.finish || 'Gloss'} Custom Wrap`;
          }
          return 'Avery Dennison Gloss Black';
        })(),
          color_hex: colorData?.hex || '#000000',
          finish_type: colorData?.finish || 'gloss',
          customer_email: userEmail, // SECURITY: Always require authenticated user email
          render_urls: { [viewType]: publicUrl },
          generation_status: 'completed',
          is_saved: true // ALL renders are saved to public gallery
        };

        // Add mode-specific fields
        if (modeType === 'approvemode' && effectiveColorData?.designUrl) {
          vizData.custom_design_url = effectiveColorData.designUrl;
          vizData.uses_custom_design = true;
          vizData.design_file_name = effectiveColorData.designName || 'custom-design';
        } else if ((modeType === 'CustomStyling' || modeType === 'ColorProEnhanced') && effectiveColorData?.customStylingPrompt) {
          // Store prompt key for cache matching
          const promptKey = effectiveColorData.customStylingPrompt
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim()
            .substring(0, 200);
          vizData.custom_styling_prompt_key = promptKey;
        } else if ((modeType === 'wbty' || modeType === 'fadewraps') && effectiveColorData?.patternUrl) {
          vizData.custom_swatch_url = effectiveColorData.patternUrl;
        } else if (modeType === 'ColorPro' && effectiveColorData?.manufacturer) {
          // Store manufacturer for proper gallery display (NEVER use InkFusion fallback)
          vizData.infusion_color_id = colorData?.manufacturer || '';
        }

        const { data: newViz, error: insertError } = await supabase
          .from('color_visualizations')
          .insert(vizData)
          .select('id')
          .single();

        if (insertError) {
          console.error('Error creating visualization:', insertError);
        } else {
          console.log('✅ Created new public gallery record:', newViz.id);
        }
      }
    } catch (cacheError) {
      console.error('Cache storage error:', cacheError);
      // Don't fail the request if caching fails
    }
    // ============= END CACHE STORAGE LOGIC =============

    // Legacy: Also save to vehicle_renders table for backwards compatibility
    const { data: renderRecord, error: dbError } = await supabase
      .from('vehicle_renders')
      .insert({
        vehicle_year: vehicleYear,
        vehicle_make: vehicleMake,
        vehicle_model: vehicleModel,
        mode_type: modeType,
        render_url: publicUrl,
        color_data: colorData || {}
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      // Don't throw - vehicle_renders is legacy
    }

    // Auto-save hero/front view to carousel if applicable
    if (viewType === 'front' || viewType === 'hero' || viewType === 'closeup') {
      const carouselTable = modeType === 'wbty' ? 'wbty_carousel' 
        : modeType === 'fadewraps' ? 'fadewraps_carousel'
        : 'inkfusion_carousel';
      const finishType = colorData?.finish || 'gloss';
      
      const carouselData: any = {
        name: `${vehicleMake || 'Vehicle'} ${vehicleModel || ''} ${vehicleYear || ''}`.trim(),
        media_url: publicUrl,
        vehicle_name: `${vehicleMake || ''} ${vehicleModel || ''}`.trim(),
        is_active: true,
        sort_order: Math.floor(Date.now() / 1000) % 100000
      };

      if (modeType === 'wbty' || modeType === 'fadewraps') {
        const patternName = colorData?.colorName || colorData?.patternName || 'Custom Pattern';
        carouselData.pattern_name = patternName;
        carouselData.title = patternName;
        carouselData.subtitle = `${finishType.charAt(0).toUpperCase() + finishType.slice(1)} Finish`;
        carouselData.manufacturer = 'WePrintWraps';
      } else {
        // Use multiZoneLabel for GraphicsPro two-tone, otherwise colorData
        // NEVER save "Unknown", "Custom", or empty names to carousel
        let colorName = multiZoneLabel || colorData?.colorName || colorData?.name || '';
        
        // Clean up generic labels
        if (!colorName || colorName === 'Unknown' || colorName.trim() === '' || 
            colorName === '(1)' || colorName.toLowerCase().startsWith('custom ') ||
            colorName === 'Custom' || colorName === 'Custom Color') {
          // Use intelligent label parser for styling prompts
          if (colorData?.customStylingPrompt) {
            colorName = parseGraphicsProLabel(colorData.customStylingPrompt);
          } else if (colorData?.manufacturer && colorData.manufacturer !== 'Custom') {
            colorName = `${colorData.manufacturer} ${cap(colorData?.finish || 'Gloss')} ${colorData?.name || ''}`.trim();
          } else {
            colorName = pickFilm(colorData?.name || colorData?.colorName || colorData?.finish || 'black');
          }
        }
        
        // Clean up any remaining "Custom" in multi-zone labels
        if (colorName.includes('Custom ')) {
          colorName = colorName.split(' | ').map((part: string) => {
            if (part.trim().startsWith('Custom ')) {
              const colorPart = part.replace(/^Custom\s+/i, '');
              return pickFilm(colorPart);
            }
            return part;
          }).join(' | ');
        }
        
        const manufacturer = colorData?.manufacturer && colorData.manufacturer !== 'Custom' 
          ? colorData.manufacturer 
          : '';
        carouselData.color_name = colorName;
        carouselData.title = colorName;
        carouselData.subtitle = `${finishType.charAt(0).toUpperCase() + finishType.slice(1)} Finish`;
        carouselData.manufacturer = manufacturer;
      }

      const { error: carouselError } = await supabase
        .from(carouselTable)
        .insert(carouselData);

      if (carouselError) {
        console.error('Carousel save error:', carouselError);
        // Don't throw - carousel save is optional
      } else {
        console.log(`✅ Auto-saved to ${carouselTable}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        renderUrl: publicUrl,
        renderId: renderRecord?.id,
        cached: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-color-render:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
