import { createClient } from "@/utils/supabase/client";
import { API_CALL_LIMITS } from "@/lib/config";
import { getStartDateForApiUsage } from "@/usage";

/**
 * Standalone utility to check if a user can make API calls
 * 
 * This function checks:
 * 1. The user's current usage
 * 2. Their subscription tier limit
 * 3. Any override they might have in team_memberships
 * 
 * It does NOT modify any existing code and can be imported
 * into API routes when you're ready to integrate it.
 */
export async function canMakeApiCall(userId: string): Promise<{
  canProceed: boolean;
  hasOverride: boolean;
  currentUsage: number;
  limit: number;
  reason?: string;
}> {
  const supabase = createClient();
  
  try {
    // 1. Get the user's profile info
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_subscribed_product_id, stripe_is_subscribed, last_usage_reset_at")
      .eq("id", userId)
      .single();
    
    if (!profile) {
      return { 
        canProceed: false, 
        hasOverride: false, 
        currentUsage: 0, 
        limit: 0,
        reason: "Profile not found" 
      };
    }
    
    // 2. Check for an API call override
    const { data: teamMembership } = await supabase
      .from("team_memberships")
      .select("api_calls_override")
      .eq("profile_id", userId)
      .maybeSingle();
    
    const hasOverride = !!teamMembership?.api_calls_override;
    
    // 3. Get current usage
    const startDate = getStartDateForApiUsage(profile.last_usage_reset_at);
    const { count } = await supabase
      .from("api_usage_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startDate.toISOString());
    
    const currentUsage = count || 0;
    
    // 4. Determine limit based on subscription
    let limit = API_CALL_LIMITS.FREE; // Default to free tier (50 calls)
    
    if (profile.stripe_is_subscribed) {
      if (profile.stripe_subscribed_product_id === "prod_RyWVPzIyQjIJH4") { // Basic 
        limit = API_CALL_LIMITS.BASIC; // 4750
      } else if (profile.stripe_subscribed_product_id === "prod_RyWVvvIqMycmtX") { // Enterprise
        limit = API_CALL_LIMITS.ENTERPRISE; // 50000
      }
    }
    
    // 5. Override limit if applicable
    if (hasOverride && teamMembership?.api_calls_override) {
      limit = teamMembership.api_calls_override;
    }
    
    // 6. Check if user can proceed
    const hasReachedLimit = currentUsage >= limit;
    
    // User can proceed if they haven't reached limit OR if they have an override
    // This is the key logic: even if currentUsage >= regular limit,
    // we still let them through if they have an override
    const canProceed = !hasReachedLimit || hasOverride;
    
    return {
      canProceed,
      hasOverride,
      currentUsage,
      limit,
      reason: canProceed ? undefined : "API call limit reached"
    };
  } catch (error) {
    console.error("Error checking API limits:", error);
    return {
      canProceed: false,
      hasOverride: false,
      currentUsage: 0,
      limit: 0,
      reason: "Error checking API limits"
    };
  }
}

/**
 * Helper function to log an API call
 * This doesn't affect the limit check, just records usage
 */
export async function logApiCall(userId: string, endpoint: string): Promise<void> {
  try {
    const supabase = createClient();
    await supabase
      .from("api_usage_logs")
      .insert({ 
        user_id: userId, 
        endpoint,
        success: true  
      });
  } catch (error) {
    console.error("Error logging API call:", error);
  }
}
