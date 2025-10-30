import { createClient as createClientClient } from "@/utils/supabase/client";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { API_CALL_LIMITS } from "@/lib/config";
import { getStartDateForApiUsage } from "@/usage";

/**
 * Checks if a user can make API calls, accounting for subscription tiers and overrides
 */
export async function canMakeApiCall(userId: string): Promise<{
  canProceed: boolean;
  hasOverride: boolean;
  currentUsage: number;
  limit: number;
  reason?: string;
}> {
  // Safety first - if anything goes wrong, we'll default to allowing access
  if (!userId) {
    return {
      canProceed: true,
      hasOverride: false,
      currentUsage: 0,
      limit: API_CALL_LIMITS.FREE,
      reason: "No user ID provided, allowing access"
    };
  }
  
  // Try server client first, fall back to client client
  let supabase;
  
  try {
    // For API routes and server components
    supabase = await createServerClient();
  } catch (error) {
    // For client components - silent fallback
    supabase = createClientClient();
  }
  
  try {
    // 1. Get the user's profile info
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_subscribed_product_id, stripe_is_subscribed, last_usage_reset_at")
      .eq("id", userId)
      .single();
    const typedProfile = (profile as {
      stripe_subscribed_product_id: string | null;
      stripe_is_subscribed: boolean;
      last_usage_reset_at: string | null;
    } | null);
    
    // Default to free tier limits if profile can't be found
    let limit = API_CALL_LIMITS.FREE;
    
    if (!typedProfile || profileError) {
      console.log(`Using free tier limit for user ${userId}`);
    } else {
      // Set limits based on subscription tier
      if (typedProfile.stripe_is_subscribed) {
        if (typedProfile.stripe_subscribed_product_id === "prod_RyWVPzIyQjIJH4") {
          limit = API_CALL_LIMITS.BASIC;
        } else if (typedProfile.stripe_subscribed_product_id === "prod_RyWVvvIqMycmtX") {
          limit = API_CALL_LIMITS.ENTERPRISE;
        }
      }
    }
    
    // 2. Check for API call override
    let hasOverride = false;
    
    try {
      const { data: teamMembership } = await supabase
        .from("team_memberships")
        .select("api_calls_override")
        .eq("profile_id", userId)
        .maybeSingle();
      const typedTeam = (teamMembership as { api_calls_override: number | null } | null);

      if (typedTeam?.api_calls_override) {
        hasOverride = true;
        limit = typedTeam.api_calls_override;
      }
    } catch (overrideError) {
      // Continue without override if error occurs
    }
    
    // 3. Get current usage
    let currentUsage = 0;
    const startDate = getStartDateForApiUsage(typedProfile?.last_usage_reset_at || null);
    
    try {
      const { count } = await supabase
        .from("api_usage_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", startDate.toISOString());
      
      currentUsage = count || 0;
    } catch (usageError) {
      // Continue with 0 usage if error occurs
    }
    
    // 4. Determine if user can proceed - KEY LOGIC: 
    // Users with overrides can exceed their normal limits
    const hasReachedLimit = currentUsage >= limit;
    const canProceed = !hasReachedLimit || hasOverride;
    
    return {
      canProceed,
      hasOverride,
      currentUsage,
      limit,
      reason: canProceed ? undefined : "API call limit reached"
    };
  } catch (error) {
    // For unexpected errors, always allow the request to proceed
    // with free tier limits rather than blocking users from the API
    return {
      canProceed: true, 
      hasOverride: false,
      currentUsage: 0,
      limit: API_CALL_LIMITS.FREE,
      reason: "Error occurred, defaulting to free tier access"
    };
  }
}

/**
 * Helper function to log an API call
 */
export async function logApiCall(userId: string, endpoint: string): Promise<void> {
  if (!userId) return; // Safety check
  
  try {
    let supabase;
    try {
      supabase = await createServerClient();
    } catch {
      supabase = createClientClient();
    }
    
    await supabase
      .from("api_usage_logs" as const)
      .insert([{ 
        user_id: userId, 
        endpoint,
        success: true  
      }] as unknown as never);
  } catch (error) {
    // Just log the error but don't break anything
    console.error("Error logging API call:", error);
  }
}
