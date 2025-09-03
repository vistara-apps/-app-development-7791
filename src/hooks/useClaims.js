import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { 
  getUserClaims, 
  getClaimById, 
  createClaim, 
  updateClaim, 
  deleteClaim,
  getClaimStatistics
} from '../services/claims';

export const useClaims = (claimId = null) => {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all claims for the user
  useEffect(() => {
    const fetchClaims = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { success, claims, error } = await getUserClaims(user.id);
        
        if (!success) {
          throw new Error(error);
        }
        
        setClaims(claims);
        
        // If a specific claim ID was provided, select that claim
        if (claimId) {
          const claim = claims.find(c => c.claimId === claimId);
          if (claim) {
            setSelectedClaim(claim);
          } else {
            // If the claim ID wasn't found, fetch it specifically
            const { success: claimSuccess, claim: fetchedClaim, error: claimError } = await getClaimById(claimId);
            
            if (!claimSuccess) {
              throw new Error(claimError);
            }
            
            setSelectedClaim(fetchedClaim);
          }
        } else if (claims.length > 0) {
          // Otherwise, select the first claim by default
          setSelectedClaim(claims[0]);
        }
        
        // Fetch claim statistics
        const { success: statsSuccess, statistics: statsData, error: statsError } = await getClaimStatistics(user.id);
        
        if (statsSuccess) {
          setStatistics(statsData);
        }
      } catch (err) {
        console.error('Error fetching claims:', err);
        setError(err.message || 'Failed to fetch claims');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClaims();
  }, [user, claimId]);

  // Create a new claim
  const handleCreateClaim = async (claimData) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      // Generate a unique claim number if not provided
      if (!claimData.claimNumber) {
        claimData.claimNumber = `CLM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
      
      const { success, claim, error } = await createClaim({
        userId: user.id,
        ...claimData,
      });
      
      if (!success) {
        throw new Error(error);
      }
      
      // Add the new claim to the list and select it
      setClaims([claim, ...claims]);
      setSelectedClaim(claim);
      
      return { success: true, claim };
    } catch (err) {
      console.error('Error creating claim:', err);
      return { success: false, error: err.message || 'Failed to create claim' };
    }
  };

  // Update an existing claim
  const handleUpdateClaim = async (claimId, updates) => {
    try {
      const { success, claim, error } = await updateClaim(claimId, updates);
      
      if (!success) {
        throw new Error(error);
      }
      
      // Update the claims list and selected claim
      setClaims(claims.map(c => c.claimId === claimId ? claim : c));
      
      if (selectedClaim?.claimId === claimId) {
        setSelectedClaim(claim);
      }
      
      return { success: true, claim };
    } catch (err) {
      console.error('Error updating claim:', err);
      return { success: false, error: err.message || 'Failed to update claim' };
    }
  };

  // Delete a claim
  const handleDeleteClaim = async (claimId) => {
    try {
      const { success, error } = await deleteClaim(claimId);
      
      if (!success) {
        throw new Error(error);
      }
      
      // Remove the claim from the list
      setClaims(claims.filter(c => c.claimId !== claimId));
      
      // If the deleted claim was selected, select another one
      if (selectedClaim?.claimId === claimId) {
        setSelectedClaim(claims.find(c => c.claimId !== claimId) || null);
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting claim:', err);
      return { success: false, error: err.message || 'Failed to delete claim' };
    }
  };

  // Select a claim
  const selectClaim = (claimId) => {
    const claim = claims.find(c => c.claimId === claimId);
    if (claim) {
      setSelectedClaim(claim);
      return true;
    }
    return false;
  };

  return {
    claims,
    selectedClaim,
    statistics,
    isLoading,
    error,
    createClaim: handleCreateClaim,
    updateClaim: handleUpdateClaim,
    deleteClaim: handleDeleteClaim,
    selectClaim,
  };
};

