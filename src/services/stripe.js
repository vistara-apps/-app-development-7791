import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../lib/supabase';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

/**
 * Create a checkout session for subscription
 * @param {string} priceId - The Stripe price ID for the subscription plan
 * @param {string} userId - The user ID
 * @param {string} userEmail - The user's email
 * @returns {Promise<Object>} The checkout session
 */
export const createCheckoutSession = async (priceId, userId, userEmail) => {
  try {
    // Call your backend function to create a checkout session
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        priceId,
        userId,
        userEmail,
        successUrl: `${window.location.origin}/billing/success`,
        cancelUrl: `${window.location.origin}/billing/cancel`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    // Redirect to Stripe Checkout
    const stripe = await stripePromise;
    const result = await stripe.redirectToCheckout({
      sessionId: data.sessionId,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return { success: true };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      success: false,
      error: error.message || 'Failed to create checkout session',
    };
  }
};

/**
 * Create a customer portal session for managing subscriptions
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} The customer portal session
 */
export const createCustomerPortalSession = async (userId) => {
  try {
    // Call your backend function to create a customer portal session
    const { data, error } = await supabase.functions.invoke('create-customer-portal-session', {
      body: {
        userId,
        returnUrl: `${window.location.origin}/billing`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    // Redirect to the customer portal
    window.location.href = data.url;

    return { success: true };
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    return {
      success: false,
      error: error.message || 'Failed to create customer portal session',
    };
  }
};

/**
 * Get subscription plans
 * @returns {Promise<Object>} The subscription plans
 */
export const getSubscriptionPlans = async () => {
  try {
    // In a real implementation, you would fetch this from your backend
    // For now, we'll return hardcoded plans based on the PRD
    return {
      success: true,
      plans: [
        {
          id: 'free',
          name: 'Free',
          description: 'Basic photo analysis for small claims',
          price: 0,
          priceId: 'price_free',
          features: [
            'Up to 50 photos per month',
            'Basic damage recognition',
            'Object & scene classification',
            'Limited export options'
          ],
          limit: 50,
          recommended: false
        },
        {
          id: 'pro',
          name: 'Pro',
          description: 'Advanced analysis for professional adjusters',
          price: 49,
          priceId: 'price_pro_monthly',
          features: [
            'Up to 500 photos per month',
            'Advanced damage recognition',
            'Detailed classification',
            'Full export capabilities',
            'Priority processing'
          ],
          limit: 500,
          recommended: true
        },
        {
          id: 'business',
          name: 'Business',
          description: 'Enterprise-grade solution for insurance companies',
          price: 199,
          priceId: 'price_business_monthly',
          features: [
            'Up to 2000 photos per month',
            'Highest accuracy analysis',
            'Custom integrations',
            'API access',
            'Dedicated support',
            'Team management'
          ],
          limit: 2000,
          recommended: false
        }
      ]
    };
  } catch (error) {
    console.error('Error getting subscription plans:', error);
    return {
      success: false,
      error: error.message || 'Failed to get subscription plans',
    };
  }
};

/**
 * Get user subscription
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} The user subscription
 */
export const getUserSubscription = async (userId) => {
  try {
    // In a real implementation, you would fetch this from your backend
    // For now, we'll query the users table in Supabase
    const { data, error } = await supabase
      .from('users')
      .select('subscriptionTier, subscriptionStatus, subscriptionPeriodEnd')
      .eq('userId', userId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      subscription: {
        tier: data.subscriptionTier || 'Free',
        status: data.subscriptionStatus || 'active',
        periodEnd: data.subscriptionPeriodEnd || null,
      }
    };
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return {
      success: false,
      error: error.message || 'Failed to get user subscription',
    };
  }
};

