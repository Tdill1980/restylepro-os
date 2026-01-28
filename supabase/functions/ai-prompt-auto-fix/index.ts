import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AutoFixRequest {
  renderType: string;
  minFlags?: number; // Minimum flags to trigger auto-fix (default: 3)
  autoRegenerate?: boolean; // Whether to automatically regenerate with improved prompts
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { renderType, minFlags = 3, autoRegenerate = false }: AutoFixRequest = await req.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`🔍 Analyzing ${renderType} renders for quality issues...`);

    // Get all flagged renders for this type with reasons
    const { data: flaggedRatings, error: flagError } = await supabase
      .from("render_quality_ratings")
      .select("*")
      .eq("render_type", renderType)
      .eq("is_flagged", true)
      .order("created_at", { ascending: false })
      .limit(50);

    if (flagError) {
      console.error("Error fetching flags:", flagError);
      throw flagError;
    }

    if (!flaggedRatings || flaggedRatings.length < minFlags) {
      return new Response(
        JSON.stringify({ 
          message: `Not enough flags to analyze (${flaggedRatings?.length || 0}/${minFlags})`,
          improvements: null
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Group flags by render_id to find consistently problematic renders
    const flagsByRender = new Map<string, typeof flaggedRatings>();
    flaggedRatings.forEach(rating => {
      const existing = flagsByRender.get(rating.render_id) || [];
      flagsByRender.set(rating.render_id, [...existing, rating]);
    });

    // Find renders with multiple flags
    const problematicRenders = Array.from(flagsByRender.entries())
      .filter(([_, flags]) => flags.length >= 2)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 10);

    console.log(`📊 Found ${problematicRenders.length} renders with multiple flags`);

    // Aggregate all feedback
    const allFeedback = flaggedRatings.map(r => ({
      reason: r.flag_reason,
      notes: r.notes,
      rating: r.rating
    }));

    // Use AI to analyze patterns and suggest improvements
    const analysisPrompt = `You are an AI prompt engineer analyzing quality issues with ${renderType.toUpperCase()} vehicle wrap renders.

COMMON ISSUES REPORTED:
${allFeedback.map((f, i) => `${i + 1}. ${f.reason}${f.notes ? ` - Additional notes: ${f.notes}` : ''}`).join('\n')}

TOTAL FLAGS: ${flaggedRatings.length}
RENDERS WITH MULTIPLE FLAGS: ${problematicRenders.length}

Analyze these issues and provide:
1. **Root Causes**: What are the 3-5 most common problems?
2. **Prompt Improvements**: Specific, actionable changes to the AI generation prompts
3. **Technical Fixes**: Any technical parameters that should be adjusted (aspect ratio, quality settings, etc.)

Format your response as structured JSON:
{
  "rootCauses": ["cause 1", "cause 2", ...],
  "promptImprovements": {
    "issueType": "specific improvement instruction",
    ...
  },
  "technicalFixes": {
    "parameter": "recommended value",
    ...
  },
  "priority": "high|medium|low"
}`;

    console.log("🤖 Calling AI for prompt analysis...");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an expert AI prompt engineer specializing in photorealistic vehicle wrap visualization."
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices[0].message.content;
    
    // Extract JSON from response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!analysis) {
      throw new Error("Failed to parse AI analysis");
    }

    console.log("✅ AI Analysis complete:", analysis);

    // Store analysis results
    const { error: insertError } = await supabase
      .from("color_visualizations")
      .insert({
        customer_email: "system@wpwrestylepro.com",
        vehicle_year: 2024,
        vehicle_make: "System",
        vehicle_model: "Analysis",
        color_name: `${renderType}-auto-fix-analysis`,
        color_hex: "#000000",
        finish_type: "analysis",
        mode_type: renderType,
        admin_notes: JSON.stringify({
          timestamp: new Date().toISOString(),
          analysis: analysis,
          totalFlags: flaggedRatings.length,
          problematicRenders: problematicRenders.length,
          autoRegenerate: autoRegenerate
        }),
        generation_status: "completed"
      });

    if (insertError) {
      console.error("Error storing analysis:", insertError);
    }

    // Send email report to admins
    const emailHtml = `
      <h1>🤖 AI Auto-Fix Analysis: ${renderType.toUpperCase()}</h1>
      
      <h2>📊 Summary</h2>
      <ul>
        <li><strong>Total Flags:</strong> ${flaggedRatings.length}</li>
        <li><strong>Renders with Multiple Flags:</strong> ${problematicRenders.length}</li>
        <li><strong>Priority:</strong> ${analysis.priority.toUpperCase()}</li>
      </ul>

      <h2>🔍 Root Causes</h2>
      <ol>
        ${analysis.rootCauses.map((cause: string) => `<li>${cause}</li>`).join('')}
      </ol>

      <h2>✨ Recommended Prompt Improvements</h2>
      <ul>
        ${Object.entries(analysis.promptImprovements).map(([issue, fix]) => 
          `<li><strong>${issue}:</strong> ${fix}</li>`
        ).join('')}
      </ul>

      <h2>⚙️ Technical Fixes</h2>
      <ul>
        ${Object.entries(analysis.technicalFixes).map(([param, value]) => 
          `<li><strong>${param}:</strong> ${value}</li>`
        ).join('')}
      </ul>

      <p style="margin-top: 20px;">
        <a href="${supabaseUrl.replace('abgevylqeazbydrtovzp.supabase.co', 'app.lovable.dev')}/admin/quality-review" 
           style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">
          Review & Implement Fixes
        </a>
      </p>

      <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
        Auto-Regenerate: ${autoRegenerate ? 'Enabled' : 'Disabled'}
      </p>
    `;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "WPW AI Auto-Fix <onboarding@resend.dev>",
        to: ["admin@wpwrestylepro.com"],
        subject: `🤖 AI Auto-Fix Analysis: ${renderType.toUpperCase()} - ${analysis.priority.toUpperCase()} Priority`,
        html: emailHtml,
      }),
    });

    console.log("📧 Analysis email sent to admins");

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysis,
        flagsAnalyzed: flaggedRatings.length,
        problematicRenders: problematicRenders.length,
        emailSent: true
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error("Error in ai-prompt-auto-fix:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
