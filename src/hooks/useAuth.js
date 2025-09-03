import { useAuth as useAuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const auth = useAuthContext();
  
  return {
    ...auth,
    // Additional helper functions can be added here
    isAuthenticated: !!auth.user,
    isAdmin: auth.userDetails?.role === 'admin',
    subscriptionTier: auth.userDetails?.subscriptionTier || 'Free',
    
    // Check if user has access to a feature based on their subscription tier
    hasAccess: (feature) => {
      const tier = auth.userDetails?.subscriptionTier || 'Free';
      
      // Define feature access by subscription tier
      const featureAccess = {
        // Free tier features
        basicUpload: ['Free', 'Pro', 'Business'],
        basicAnalysis: ['Free', 'Pro', 'Business'],
        
        // Pro tier features
        advancedAnalysis: ['Pro', 'Business'],
        batchUpload: ['Pro', 'Business'],
        exportData: ['Pro', 'Business'],
        
        // Business tier features
        apiAccess: ['Business'],
        customIntegration: ['Business'],
        prioritySupport: ['Business'],
      };
      
      return featureAccess[feature]?.includes(tier) || false;
    },
    
    // Get photo limit based on subscription tier
    getPhotoLimit: () => {
      const tier = auth.userDetails?.subscriptionTier || 'Free';
      
      const limits = {
        'Free': 50,
        'Pro': 500,
        'Business': 2000
      };
      
      return limits[tier] || 0;
    }
  };
};

