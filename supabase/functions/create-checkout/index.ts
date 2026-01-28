import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PRICE_IDS = {
  starter: "price_1SWJgDH1V6OhfCAPSCR5VbT2",
  advanced: "price_1SWNNuH1V6OhfCAPDChwyuAX",
  complete: "price_1SWO9QH1V6OhfCAPjqYLT7Ko",
  extraRender: "price_1SWNl3H1V6OhfCAPas1HJF05"
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { priceId } = await req.json();
    
    if (!Object.values(PRICE_IDS).includes(priceId)) {
      throw new Error('Invalid price ID');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error('User not authenticated');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-06-20',
    });

    // Check for existing customer
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create checkout session with subscription + metered usage
    const lineItems: Array<{ price: string; quantity?: number }> = [
      {
        price: priceId,
        quantity: 1
      }
    ];

    // Add metered usage price to all subscriptions (no quantity for metered prices)
    if (priceId !== PRICE_IDS.extraRender) {
      lineItems.push({
        price: PRICE_IDS.extraRender
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/pricing?success=true`,
      cancel_url: `${req.headers.get('origin')}/pricing?canceled=true`,
      subscription_data: {
        trial_period_days: 7,
      },
      payment_method_collection: 'always',
      metadata: {
        user_id: user.id,
        user_email: user.email
      }
    });

    console.log('Checkout session created:', session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
