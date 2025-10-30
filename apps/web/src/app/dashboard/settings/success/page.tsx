"use client";

import { APP_NAME } from "@/app/consts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { TablesUpdate } from "@/types/supabase";
import { STRIPE_PRODUCT_IDS, API_CALL_LIMITS, SUBSCRIPTION_TIER } from "@/lib/config";

export default function SubscriptionSuccessPage() {
  const [isUpdating, setIsUpdating] = useState(true);
  const [error, setError] = useState("");
  const [apiCalls, setApiCalls] = useState(0);
  const [planName, setPlanName] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const updateSubscriptionStatus = async () => {
      try {
        setIsUpdating(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError("User not found. Please try logging in again.");
          return;
        }

        // Check URL parameters to get plan type
        const urlParams = new URLSearchParams(window.location.search);
        const planType = urlParams.get('plan') || 'basic'; // Default to basic if not specified
        
        // Determine which product to use based on the plan parameter
        let productId: string;
        let tier;
        
        if (planType.toLowerCase() === 'enterprise') {
          // Handle Enterprise plan - use the environment variable
          productId = STRIPE_PRODUCT_IDS.ENTERPRISE || 'prod_RyWVvvIqMycmtX';
          tier = SUBSCRIPTION_TIER.ENTERPRISE;
          setApiCalls(API_CALL_LIMITS.ENTERPRISE);
          setPlanName("Enterprise");
          
          console.log(`Using Enterprise product ID: ${productId}`);
        } else {
          // Handle Basic plan - use environment variable first, fallback to known ID
          productId = STRIPE_PRODUCT_IDS.BASIC || 'prod_RyWVPzIyQjIJH4';
          
          // If for some reason the product ID doesn't match what we know works,
          // log a warning but proceed with the environment variable
          if (productId !== "prod_RyWVPzIyQjIJH4") {
            console.log(`Warning: Basic product ID from env (${productId}) doesn't match expected ID (prod_RyWVPzIyQjIJH4)`);
          }
          
          tier = SUBSCRIPTION_TIER.BASIC;
          setApiCalls(API_CALL_LIMITS.BASIC);
          setPlanName("Basic");
          
          console.log(`Using Basic product ID: ${productId}`);
        }
        
        // Get the interval from URL parameters or default to 'month'
        const interval = urlParams.get('interval') || 'month';
        
        // Format the update data exactly as it's done in stripe-hooks.ts
        const updateData: TablesUpdate<"profiles"> = {
          stripe_is_subscribed: true,
          stripe_interval: interval,
          stripe_subscribed_product_id: productId,
        };
        
        // Optionally set last_usage_reset_at if this is a new subscription
        const now = new Date();
        updateData.last_usage_reset_at = now.toISOString();

        // Update the user's profile directly without waiting for webhook
        const { error: updateError } = await supabase
          .from('profiles' as const)
          .update(updateData as any)
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating subscription:', updateError);
          setError("There was an issue updating your subscription. Your subscription is active, but you may need to refresh your dashboard to see changes.");
        }

        // Wait a moment to ensure the UI reflects the changes
        setTimeout(() => {
          setIsUpdating(false);
        }, 2000);
      } catch (err) {
        console.error('Subscription update error:', err);
        setError("There was an issue updating your subscription. Your subscription is active, but you may need to refresh your dashboard to see changes.");
        setIsUpdating(false);
      }
    };

    updateSubscriptionStatus();
  }, [supabase]);

  const handleContinueToDashboard = () => {
    // Force a hard refresh of the dashboard to ensure latest data is loaded
    window.location.href = '/dashboard';
  };

  return (
    <div className="container max-w-6xl py-10">
      <div className="flex flex-col items-center justify-center space-y-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>

        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Subscription Successful!
            </CardTitle>
            <CardDescription>
              Thank you for subscribing to {APP_NAME}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Your <strong>{planName} Plan</strong> subscription has been successfully activated. 
              You now have access to <strong>{apiCalls.toLocaleString()} API calls per month</strong>.
              We've sent a confirmation email with your subscription details.
            </p>
            
            {isUpdating && (
              <div className="flex items-center justify-center my-4">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Updating your account...</span>
              </div>
            )}
            
            {error && (
              <div className="text-red-500 mt-2">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              onClick={handleContinueToDashboard}
              disabled={isUpdating}
            >
              {isUpdating ? 'Setting up your account...' : 'Go to Dashboard'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
