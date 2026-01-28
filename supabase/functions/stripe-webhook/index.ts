import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-06-20',
});

const PRICE_TO_TIER = {
  "price_1SWJgDH1V6OhfCAPSCR5VbT2": "starter",
  "price_1SWNNuH1V6OhfCAPDChwyuAX": "advanced",
  "price_1SWO9QH1V6OhfCAPjqYLT7Ko": "complete"
};

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  try {
    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret!
    );

    console.log('Webhook event received:', event.type);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Get customer email
        const customer = await stripe.customers.retrieve(customerId);
        const email = (customer as Stripe.Customer).email;
        
        if (!email) {
          console.error('No email found for customer:', customerId);
          break;
        }

        // Find the main price (not the metered one)
        const mainItem = subscription.items.data.find((item: any) => 
          Object.keys(PRICE_TO_TIER).includes(item.price.id)
        );
        
        // Find the metered item
        const meteredItem = subscription.items.data.find((item: any) =>
          item.price.id === "price_1SWNl3H1V6OhfCAPas1HJF05"
        );

        if (!mainItem) {
          console.error('No valid price found in subscription');
          break;
        }

        const tier = PRICE_TO_TIER[mainItem.price.id as keyof typeof PRICE_TO_TIER];
        const billingCycleStart = new Date(subscription.current_period_start * 1000);
        const billingCycleEnd = new Date(subscription.current_period_end * 1000);

        // Upsert subscription record
        const { error } = await supabase
          .from('user_subscriptions')
          .upsert({
            email,
            user_id: subscription.metadata.user_id || '',
            tier,
            status: subscription.status === 'active' ? 'active' : 'inactive',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            stripe_subscription_item_extra: meteredItem?.id || null,
            stripe_price_id: mainItem.price.id,
            billing_cycle_start: billingCycleStart.toISOString(),
            billing_cycle_end: billingCycleEnd.toISOString(),
            render_count: 0,
            render_reset_date: billingCycleStart.toISOString()
          }, {
            onConflict: 'email'
          });

        if (error) {
          console.error('Error upserting subscription:', error);
        } else {
          console.log('Subscription saved for:', email, 'Tier:', tier);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        
        // Get customer email
        const customer = await stripe.customers.retrieve(customerId);
        const email = (customer as Stripe.Customer).email;
        
        if (!email) break;

        // Reset render count on successful payment
        const { error } = await supabase
          .from('user_subscriptions')
          .update({
            render_count: 0,
            render_reset_date: new Date().toISOString(),
            status: 'active'
          })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('Error resetting render count:', error);
        } else {
          console.log('Render count reset for:', email);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        
        // Mark subscription as past_due
        const { error } = await supabase
          .from('user_subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('Error updating subscription status:', error);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Mark subscription as canceled
        const { error } = await supabase
          .from('user_subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('Error canceling subscription:', error);
        }
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Check if this is a design pack purchase
        if (!session.metadata?.design_id || !session.metadata?.purchase_type) {
          console.log('Not a design pack purchase, skipping');
          break;
        }

        const { design_id, purchase_type, user_email } = session.metadata;
        
        console.log('Processing design pack purchase:', { design_id, purchase_type, user_email });

        // Get the design details
        const { data: design, error: designError } = await supabase
          .from('designpanelpro_patterns')
          .select('*')
          .eq('id', design_id)
          .single();

        if (designError || !design) {
          console.error('Error fetching design:', designError);
          break;
        }

        // Only generate download URL for production files purchases
        let downloadUrl = null;
        let expiresAt = null;

        if (purchase_type === 'production_files' && design.production_file_url) {
          // Extract the file path from the full URL
          const urlParts = design.production_file_url.split('/production-files/');
          const filePath = urlParts[1];

          if (filePath) {
            // Generate signed URL (24 hours expiry)
            const { data: signedUrlData, error: signedUrlError } = await supabase.storage
              .from('production-files')
              .createSignedUrl(filePath, 86400); // 24 hours in seconds

            if (signedUrlError) {
              console.error('Error creating signed URL:', signedUrlError);
            } else {
              downloadUrl = signedUrlData.signedUrl;
              expiresAt = new Date(Date.now() + 86400 * 1000).toISOString();
            }
          }
        }

        // Extract pricing metadata from session for printed panels
        let orderMetadata = null;
        if (purchase_type === 'printed_panels' && session.metadata) {
          const metadata = session.metadata;
          orderMetadata = {
            kit_size: metadata.kit_size || null,
            kit_price: metadata.kit_price ? parseInt(metadata.kit_price) : 0,
            add_hood: metadata.add_hood === 'true',
            hood_price: metadata.add_hood === 'true' ? 160 : 0,
            add_front_bumper: metadata.add_front_bumper === 'true',
            front_bumper_price: metadata.add_front_bumper === 'true' ? 200 : 0,
            add_rear_bumper: metadata.add_rear_bumper === 'true',
            rear_bumper_price: metadata.add_rear_bumper === 'true' ? 395 : 0,
            roof_size: metadata.roof_size || 'none',
            roof_price: metadata.roof_price ? parseInt(metadata.roof_price) : 0,
            total_amount: session.amount_total || 0,
            currency: session.currency || 'usd'
          };
        } else if (purchase_type === 'production_files') {
          orderMetadata = {
            total_amount: session.amount_total || 14900,
            currency: session.currency || 'usd'
          };
        }

        // Save purchase record
        const { error: purchaseError } = await supabase
          .from('design_pack_purchases')
          .insert({
            email: user_email || session.customer_email,
            design_id,
            purchase_type,
            stripe_checkout_id: session.id,
            download_url: downloadUrl,
            download_expires_at: expiresAt,
            order_metadata: orderMetadata
          });

        if (purchaseError) {
          console.error('Error saving purchase record:', purchaseError);
        }

        // Send email with download link (only for production files)
        if (purchase_type === 'production_files' && downloadUrl) {
          try {
            const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-design-pack-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
              },
              body: JSON.stringify({
                email: user_email || session.customer_email,
                designName: design.name,
                downloadUrl,
                expiresAt
              })
            });

            if (!emailResponse.ok) {
              console.error('Error sending email:', await emailResponse.text());
            } else {
              console.log('Email sent successfully to:', user_email || session.customer_email);
            }
          } catch (emailError) {
            console.error('Error calling email function:', emailError);
          }
        }

        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400 }
    );
  }
});