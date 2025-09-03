import { supabase } from '../lib/supabase';

/**
 * Get all claims for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} The claims
 */
export const getUserClaims = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('claims')
      .select(`
        *,
        photos:photos(*)
      `)
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, claims: data };
  } catch (error) {
    console.error('Error getting user claims:', error);
    return {
      success: false,
      error: error.message || 'Failed to get user claims',
    };
  }
};

/**
 * Get a claim by ID
 * @param {string} claimId - The claim ID
 * @returns {Promise<Object>} The claim
 */
export const getClaimById = async (claimId) => {
  try {
    const { data, error } = await supabase
      .from('claims')
      .select(`
        *,
        photos:photos(*)
      `)
      .eq('claimId', claimId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, claim: data };
  } catch (error) {
    console.error('Error getting claim by ID:', error);
    return {
      success: false,
      error: error.message || 'Failed to get claim',
    };
  }
};

/**
 * Create a new claim
 * @param {Object} claimData - The claim data
 * @returns {Promise<Object>} The created claim
 */
export const createClaim = async (claimData) => {
  try {
    const { data, error } = await supabase
      .from('claims')
      .insert([{
        ...claimData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }])
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, claim: data[0] };
  } catch (error) {
    console.error('Error creating claim:', error);
    return {
      success: false,
      error: error.message || 'Failed to create claim',
    };
  }
};

/**
 * Update a claim
 * @param {string} claimId - The claim ID
 * @param {Object} updates - The updates to apply
 * @returns {Promise<Object>} The updated claim
 */
export const updateClaim = async (claimId, updates) => {
  try {
    const { data, error } = await supabase
      .from('claims')
      .update({
        ...updates,
        updatedAt: new Date(),
      })
      .eq('claimId', claimId)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, claim: data[0] };
  } catch (error) {
    console.error('Error updating claim:', error);
    return {
      success: false,
      error: error.message || 'Failed to update claim',
    };
  }
};

/**
 * Delete a claim
 * @param {string} claimId - The claim ID
 * @returns {Promise<Object>} Success status
 */
export const deleteClaim = async (claimId) => {
  try {
    // First, delete all photos associated with the claim
    const { error: photosError } = await supabase
      .from('photos')
      .delete()
      .eq('claimId', claimId);

    if (photosError) {
      throw new Error(photosError.message);
    }

    // Then, delete the claim
    const { error } = await supabase
      .from('claims')
      .delete()
      .eq('claimId', claimId);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting claim:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete claim',
    };
  }
};

/**
 * Get claim statistics for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} The claim statistics
 */
export const getClaimStatistics = async (userId) => {
  try {
    // Get all claims for the user
    const { data: claims, error: claimsError } = await supabase
      .from('claims')
      .select('*')
      .eq('userId', userId);

    if (claimsError) {
      throw new Error(claimsError.message);
    }

    // Get all photos for the user's claims
    const claimIds = claims.map(claim => claim.claimId);
    
    const { data: photos, error: photosError } = await supabase
      .from('photos')
      .select('*')
      .in('claimId', claimIds);

    if (photosError) {
      throw new Error(photosError.message);
    }

    // Calculate statistics
    const totalClaims = claims.length;
    const completedClaims = claims.filter(claim => claim.status === 'Completed').length;
    const processingClaims = claims.filter(claim => claim.status === 'Processing').length;
    const totalPhotos = photos.length;
    
    // Calculate average confidence score
    let avgConfidence = 0;
    if (photos.length > 0) {
      const totalConfidence = photos.reduce((sum, photo) => {
        return sum + (photo.analysisResults?.confidence || 0);
      }, 0);
      avgConfidence = totalConfidence / photos.length;
    }

    return { 
      success: true, 
      statistics: {
        totalClaims,
        completedClaims,
        processingClaims,
        totalPhotos,
        avgConfidence
      }
    };
  } catch (error) {
    console.error('Error getting claim statistics:', error);
    return {
      success: false,
      error: error.message || 'Failed to get claim statistics',
    };
  }
};

