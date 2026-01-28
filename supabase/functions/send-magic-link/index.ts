import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Send magic link with custom redirect
    const { error } = await supabaseAdmin.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'https://restyleproai.com/tester-welcome',
        data: {
          is_tester: true
        }
      }
    })

    if (error) {
      console.error('Magic link error:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Magic link sent to: ${email}`)

    return new Response(
      JSON.stringify({ success: true, message: `Magic link sent to ${email}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to send magic link' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
