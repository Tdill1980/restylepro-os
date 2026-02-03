import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { vehicle, panelUrl, panelName, finish, viewType = "front" } = body;

    // Validate required inputs
    if (!vehicle || !panelUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required design inputs (vehicle, panelUrl)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!GOOGLE_AI_API_KEY) {
      return new Response(
        JSON.stringify({ code: "SYSTEM_ERROR", message: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Helper to convert image URL to base64
    async function imageUrlToBase64(url: string): Promise<{ mimeType: string; data: string } | null> {
      try {
        if (url.startsWith('data:')) {
          const matches = url.match(/^data:([^;]+);base64,(.+)$/);
          if (matches) return { mimeType: matches[1], data: matches[2] };
          return null;
        }
        const response = await fetch(url);
        if (!response.ok) return null;
        const contentType = response.headers.get('content-type') || 'image/png';
        const arrayBuffer = await response.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        return { mimeType: contentType, data: base64 };
      } catch { return null; }
    }

    // Build the prompt
    const prompt = buildDesignPanelPrompt({ vehicle, panelName, panelUrl, finish, viewType });

    console.log("DesignPanelPro generation starting:", { vehicle, panelName, viewType });

    // Convert panel image to base64
    const panelImageData = await imageUrlToBase64(panelUrl);
    if (!panelImageData) {
      return new Response(
        JSON.stringify({ code: "SYSTEM_ERROR", message: "Failed to fetch panel image" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GOOGLE_AI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType: panelImageData.mimeType, data: panelImageData.data } }
          ]
        }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
          responseMimeType: "text/plain"
        }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 403) {
        return new Response(
          JSON.stringify({ error: "API key invalid or quota exceeded." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ code: "SYSTEM_ERROR", message: "Image generation failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();

    // Extract image from Gemini response
    const parts = result.candidates?.[0]?.content?.parts;
    let imageUrl = null;

    if (parts && Array.isArray(parts)) {
      for (const part of parts) {
        if (part.inlineData) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      console.error("No image in Gemini response:", JSON.stringify(result).slice(0, 500));
      return new Response(
        JSON.stringify({ code: "SYSTEM_ERROR", message: "No image returned from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Upload to storage
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const timestamp = Date.now();
    const fileName = `renders/DesignPanelPro/${timestamp}_${vehicle.replace(/\s+/g, '_')}_${viewType}.png`;

    // Convert base64 to blob if needed (using Deno-compatible decode)
    let imageData: Uint8Array;
    if (imageUrl.startsWith("data:")) {
      const base64Data = imageUrl.split(",")[1];
      // Deno-compatible base64 decode
      const binaryString = atob(base64Data);
      imageData = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        imageData[i] = binaryString.charCodeAt(i);
      }
    } else {
      const imgResponse = await fetch(imageUrl);
      imageData = new Uint8Array(await imgResponse.arrayBuffer());
    }

    const { error: uploadError } = await supabase.storage
      .from("wrap-files")
      .upload(fileName, imageData, { contentType: "image/png", upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(
        JSON.stringify({ code: "SYSTEM_ERROR", message: "Failed to save render" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: { publicUrl } } = supabase.storage.from("wrap-files").getPublicUrl(fileName);

    console.log("DesignPanelPro render saved:", publicUrl);

    return new Response(
      JSON.stringify({ renderUrl: publicUrl, success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("design-panel-generate error:", err);
    return new Response(
      JSON.stringify({ code: "SYSTEM_ERROR", message: "Unexpected failure" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildDesignPanelPrompt({
  vehicle,
  panelName,
  panelUrl,
  finish,
  viewType,
}: {
  vehicle: string;
  panelName?: string;
  panelUrl: string;
  finish?: string;
  viewType: string;
}): string {
  return `Generate a hyper-photorealistic image of a ${vehicle} with a full-body vinyl wrap using the provided 2D design panel.

DESIGN PANEL: ${panelName || "Custom Panel Design"}
FINISH: ${finish || "Gloss"} lamination
VIEW: ${viewType} angle

REQUIREMENTS:
- Apply the 2D panel design as a seamless full-body wrap covering the entire vehicle
- Ultra-high resolution 4K output with tack-sharp detail
- Professional automotive photography lighting - soft studio environment
- The wrap must look like a real installed vinyl wrap, not CGI
- Preserve the exact colors and patterns from the panel design
- No text overlays, watermarks, or branding on the vehicle
- Show realistic wrap conformity around body lines and curves
- Clean studio background (light gray gradient)

OUTPUT: One photorealistic vehicle render showing the design panel applied as a wrap.`;
}
