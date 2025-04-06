
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get the user from the auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Invalid user token");
    }
    
    console.log("Checking subscription for user:", user.id);
    
    // Get user's subscription details from database
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();
      
    if (subError && subError.code !== 'PGRST116') { // Ignore "no rows returned" error
      console.error("Error fetching subscription:", subError);
      return new Response(JSON.stringify({ subscription: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    console.log("Found subscription from database:", subscription);
    
    // If there's a Stripe subscription ID, verify its status with Stripe
    if (subscription?.stripe_subscription_id) {
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (!stripeKey) {
        throw new Error("STRIPE_SECRET_KEY is not set");
      }
      
      const stripe = new Stripe(stripeKey, {
        apiVersion: "2023-10-16",
      });
      
      try {
        console.log("Checking Stripe subscription:", subscription.stripe_subscription_id);
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
        console.log("Stripe subscription status:", stripeSubscription.status);
        
        // For trial subscriptions, ensure all agents are accessible
        if (stripeSubscription.status === 'trialing') {
          console.log("User has an active trial - unlocking all agents");
          
          // Check if we have the agent-specific columns
          const { data: tableInfo, error: tableError } = await supabase
            .from("subscriptions")
            .select();
          
          if (tableError) {
            console.error("Error checking table structure:", tableError);
          }
          
          // Update database with trial status
          const updateData: Record<string, any> = {
            status: 'trial',
            updated_at: new Date().toISOString()
          };
          
          // Only add these fields if they exist in the table
          if ('markus' in subscription) updateData.markus = true;
          if ('kara' in subscription) updateData.kara = true;
          if ('connor' in subscription) updateData.connor = true;
          if ('chloe' in subscription) updateData.chloe = true;
          if ('luther' in subscription) updateData.luther = true;
          if ('all_in_one' in subscription) updateData.all_in_one = true;
          
          // Add trial dates if the fields exist
          if ('trial_start' in subscription) {
            updateData.trial_start = new Date(stripeSubscription.trial_start * 1000).toISOString();
          }
          
          if ('trial_end' in subscription) {
            updateData.trial_end = new Date(stripeSubscription.trial_end * 1000).toISOString();
          }
          
          const { error: updateError } = await supabase
            .from("subscriptions")
            .update(updateData)
            .eq("user_id", user.id);
            
          if (updateError) {
            console.error("Error updating trial subscription:", updateError);
          }
            
          // Return the subscription
          const frontendSubscription = {
            markus: true,
            kara: true,
            connor: true,
            chloe: true,
            luther: true,
            allInOne: true,
            status: 'trial'
          };
          
          if ('trial_start' in subscription) {
            frontendSubscription.trialStart = new Date(stripeSubscription.trial_start * 1000).toISOString();
          }
          
          if ('trial_end' in subscription) {
            frontendSubscription.trialEnd = new Date(stripeSubscription.trial_end * 1000).toISOString();
          }
          
          return new Response(JSON.stringify({ 
            subscription: frontendSubscription
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
        
        // If subscription is active, ensure all agents are accessible
        if (stripeSubscription.status === 'active') {
          console.log("User has an active subscription - checking plan-specific access");
          
          // For simplicity, we're granting access to all agents with an active subscription
          // In a real app, you would check which specific plan they purchased
          const updateData: Record<string, any> = {
            status: 'active',
            updated_at: new Date().toISOString()
          };
          
          // Only add these fields if they exist in the table
          if ('markus' in subscription) updateData.markus = true;
          if ('kara' in subscription) updateData.kara = true;
          if ('connor' in subscription) updateData.connor = true;
          if ('chloe' in subscription) updateData.chloe = true;
          if ('luther' in subscription) updateData.luther = true;
          if ('all_in_one' in subscription) updateData.all_in_one = true;
          
          const { error: updateActiveError } = await supabase
            .from("subscriptions")
            .update(updateData)
            .eq("user_id", user.id);
            
          if (updateActiveError) {
            console.error("Error updating active subscription:", updateActiveError);
          }
        }
        
        // If subscription is no longer active, update the database
        if (stripeSubscription.status !== "active" && stripeSubscription.status !== "trialing" && 
            (subscription.status === 'active' || subscription.status === 'trial')) {
          console.log("Updating expired subscription status");
          
          const updateData: Record<string, any> = {
            status: stripeSubscription.status,
            updated_at: new Date().toISOString()
          };
          
          // Only add these fields if they exist in the table
          if ('markus' in subscription) updateData.markus = false;
          if ('kara' in subscription) updateData.kara = false;
          if ('connor' in subscription) updateData.connor = false;
          if ('chloe' in subscription) updateData.chloe = false;
          if ('luther' in subscription) updateData.luther = false;
          if ('all_in_one' in subscription) updateData.all_in_one = false;
          
          await supabase
            .from("subscriptions")
            .update(updateData)
            .eq("user_id", user.id);
            
          return new Response(JSON.stringify({ 
            subscription: {
              markus: false,
              kara: false,
              connor: false,
              chloe: false,
              luther: false,
              allInOne: false,
              status: stripeSubscription.status
            }
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      } catch (stripeError) {
        console.error("Error checking Stripe subscription:", stripeError);
      }
    }
    
    // If the subscription already has trial status in our database, ensure all agents are enabled
    if (subscription?.status === 'trial') {
      console.log("User has trial status in database - ensuring all agents are unlocked");
      
      // Prepare update data
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString()
      };
      
      let needsUpdate = false;
      
      // Only update fields that exist and need to be updated
      if ('markus' in subscription && !subscription.markus) {
        updateData.markus = true;
        needsUpdate = true;
      }
      if ('kara' in subscription && !subscription.kara) {
        updateData.kara = true;
        needsUpdate = true;
      }
      if ('connor' in subscription && !subscription.connor) {
        updateData.connor = true;
        needsUpdate = true;
      }
      if ('chloe' in subscription && !subscription.chloe) {
        updateData.chloe = true;
        needsUpdate = true;
      }
      if ('luther' in subscription && !subscription.luther) {
        updateData.luther = true;
        needsUpdate = true;
      }
      if ('all_in_one' in subscription && !subscription.all_in_one) {
        updateData.all_in_one = true;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await supabase
          .from("subscriptions")
          .update(updateData)
          .eq("user_id", user.id);
      }
    }
    
    // Prepare the response with correct property names for frontend
    const frontendSubscription = subscription ? {
      ...subscription,
      allInOne: subscription.all_in_one,
      trialStart: subscription.trial_start,
      trialEnd: subscription.trial_end
    } : null;
    
    return new Response(JSON.stringify({ subscription: frontendSubscription }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error checking subscription:", error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
