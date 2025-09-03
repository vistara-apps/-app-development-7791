import React, { useState } from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { useAuth } from '../../hooks/useAuth';
import { Check, AlertCircle, Loader } from 'lucide-react';

const SubscriptionPlans = () => {
  const { plans, currentSubscription, isLoading, error, subscribeToPlan } = useSubscription();
  const { isAuthenticated } = useAuth();
  const [subscribingPlanId, setSubscribingPlanId] = useState(null);

  const handleSubscribe = async (priceId, planId) => {
    if (!isAuthenticated) {
      alert('Please sign in to subscribe to a plan');
      return;
    }

    setSubscribingPlanId(planId);
    const result = await subscribeToPlan(priceId);
    setSubscribingPlanId(null);

    if (!result.success) {
      alert(`Failed to subscribe: ${result.error}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-white">Loading subscription plans...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-6 py-4 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Error loading subscription plans: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-white">Subscription Plans</h2>
        <p className="text-gray-400 mt-1">
          Choose the plan that best fits your needs
        </p>
      </div>

      {currentSubscription && (
        <div className="glass-effect rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-2">Current Subscription</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 font-medium">{currentSubscription.tier} Plan</p>
              <p className="text-sm text-gray-400">
                Status: <span className="capitalize">{currentSubscription.status}</span>
              </p>
              {currentSubscription.periodEnd && (
                <p className="text-sm text-gray-400">
                  Renews on: {new Date(currentSubscription.periodEnd).toLocaleDateString()}
                </p>
              )}
            </div>
            <button
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
              onClick={() => window.location.href = '/billing/manage'}
            >
              Manage Subscription
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`glass-effect rounded-lg p-6 border ${
              plan.recommended 
                ? 'border-blue-500' 
                : 'border-white/20'
            }`}
          >
            {plan.recommended && (
              <div className="bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full inline-block mb-4">
                Recommended
              </div>
            )}
            
            <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
            <p className="text-gray-400 mt-1">{plan.description}</p>
            
            <div className="mt-4 mb-6">
              <span className="text-3xl font-bold text-white">${plan.price}</span>
              {plan.price > 0 && (
                <span className="text-gray-400 ml-1">/month</span>
              )}
            </div>
            
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button
              onClick={() => handleSubscribe(plan.priceId, plan.id)}
              disabled={
                subscribingPlanId === plan.id || 
                (currentSubscription && currentSubscription.tier === plan.name)
              }
              className={`w-full py-2 px-4 rounded-lg transition-colors ${
                currentSubscription && currentSubscription.tier === plan.name
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30 cursor-default'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {subscribingPlanId === plan.id ? (
                <span className="flex items-center justify-center">
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </span>
              ) : currentSubscription && currentSubscription.tier === plan.name ? (
                'Current Plan'
              ) : (
                'Subscribe'
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;

