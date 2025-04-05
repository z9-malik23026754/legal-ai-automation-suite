
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// This function will run daily to check for expired trials
serve(async (req) => {
  console.log("Trial watcher function called");
  
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
    
    // Find trials that have expired
    const now = new Date().toISOString();
    const { data: expiredTrials, error: trialsError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("status", "trial")
      .lt("trial_end", now);
    
    if (trialsError) {
      throw trialsError;
    }
    
    console.log(`Found ${expiredTrials?.length || 0} expired trials`);
    
    // Update each expired trial to deactivate it
    if (expiredTrials && expiredTrials.length > 0) {
      for (const trial of expiredTrials) {
        // Update subscription record to expired status
        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({
            status: "expired",
            markus: false,
            kara: false,
            connor: false,
            chloe: false,
            luther: false,
            all_in_one: false,
            updated_at: now
          })
          .eq("id", trial.id);
        
        if (updateError) {
          console.error(`Error updating trial ${trial.id}:`, updateError);
        } else {
          console.log(`Deactivated expired trial for user ${trial.user_id}`);
          
          // Here you could add code to send an email notification about trial expiration
          // For example, using SendGrid, Mailjet, or other email services
        }
      }
    }
    
    // Also find trials that are about to expire (1 day before expiration)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString();
    
    const { data: expiringTrials, error: expiringError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("status", "trial")
      .lt("trial_end", tomorrowStr)
      .gt("trial_end", now);
    
    if (expiringError) {
      console.error("Error checking for expiring trials:", expiringError);
    } else {
      console.log(`Found ${expiringTrials?.length || 0} trials expiring soon`);
      
      // Here you could add code to send an email notification about trial nearing expiration
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      processed: {
        expired: expiredTrials?.length || 0,
        expiring: expiringTrials?.length || 0
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in trial watcher:", error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
