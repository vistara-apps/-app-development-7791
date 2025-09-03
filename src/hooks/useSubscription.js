import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { 
  getSubscriptionPlans, 
  getUserSubscription, 
  createCheckoutSession, 
  createCustomerPortalSession 
} from '../services/stripe';

export const useSubscription = () => {
  const { user, userDetails } = useAuth();
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch subscription plans and user's current subscription
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch subscription plans
        const plansResult = await getSubscriptionPlans();
        if (!plansResult.success) {
          throw new Error(plansResult.error);
        }
        setPlans(plansResult.plans);

        // Fetch user's current subscription if user is logged in
        if (user) {
          const subscriptionResult = await getUserSubscription(user.id);
          if (!subscriptionResult.success) {
            throw new Error(subscriptionResult.error);
          }
          setCurrentSubscription(subscriptionResult.subscription);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch subscription data');
        console.error('Error fetching subscription data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [user]);

  // Subscribe to a plan
  const subscribeToPlan = async (priceId) => {
    if (!user) {
      setError('You must be logged in to subscribe');
      return { success: false, error: 'You must be logged in to subscribe' };
    }

    try {
      const result = await createCheckoutSession(priceId, user.id, user.email);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to subscribe to plan');
      console.error('Error subscribing to plan:', err);
      return { success: false, error: err.message || 'Failed to subscribe to plan' };
    }
  };

  // Manage subscription
  const manageSubscription = async () => {
    if (!user) {
      setError('You must be logged in to manage your subscription');
      return { success: false, error: 'You must be logged in to manage your subscription' };
    }

    try {
      const result = await createCustomerPortalSession(user.id);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to manage subscription');
      console.error('Error managing subscription:', err);
      return { success: false, error: err.message || 'Failed to manage subscription' };
    }
  };

  // Get the current photo limit based on subscription tier
  const getPhotoLimit = () => {
    if (!currentSubscription) {
      return 50; // Default to Free tier limit
    }

    const tierLimits = {
      'Free': 50,
      'Pro': 500,
      'Business': 2000
    };

    return tierLimits[currentSubscription.tier] || 50;
  };

  // Check if the user has used up their photo limit
  const hasReachedPhotoLimit = () => {
    if (!userDetails) return false;
    
    const limit = getPhotoLimit();
    return userDetails.photosThisMonth >= limit;
  };

  return {
    plans,
    currentSubscription,
    isLoading,
    error,
    subscribeToPlan,
    manageSubscription,
    getPhotoLimit,
    hasReachedPhotoLimit
  };
};

