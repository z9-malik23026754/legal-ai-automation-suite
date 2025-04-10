
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
    console.log("Delete account function called");
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return new Response(JSON.stringify({ success: false, error: "Server configuration error" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Using 200 to ensure the error response is properly received
      });
    }
    
    // Create Supabase client with admin privileges using service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Extract the JWT from the Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(JSON.stringify({ success: false, error: "No authorization header provided" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    const token = authHeader.replace("Bearer ", "");
    
    // Get the user ID from the JWT
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("User error:", userError);
      return new Response(JSON.stringify({ success: false, error: "Invalid user token" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    console.log("User ID to delete:", user.id);
    
    // Delete user data from any related tables first (if applicable)
    try {
      const { error: agentsError } = await supabase.from('user_agents').delete().eq('user_id', user.id);
      if (agentsError) {
        console.error("Error deleting user_agents data:", agentsError);
      } else {
        console.log("User data deleted from user_agents table");
      }
    } catch (dataError) {
      console.error("Error deleting user_agents data:", dataError);
      // Continue with account deletion even if data deletion fails
    }
    
    try {
      const { error: subscriptionError } = await supabase.from('subscriptions').delete().eq('user_id', user.id);
      if (subscriptionError) {
        console.error("Error deleting subscriptions data:", subscriptionError);
      } else {
        console.log("User data deleted from subscriptions table");
      }
    } catch (dataError) {
      console.error("Error deleting subscriptions data:", dataError);
      // Continue with account deletion even if data deletion fails
    }
    
    // Delete the user account using the admin deleteUser function
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      return new Response(JSON.stringify({ success: false, error: deleteError.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Changed to 200 to prevent the non-2xx error
      });
    }
    
    console.log("User successfully deleted");
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // Changed to 200 to prevent the non-2xx error
    });
  }
});
