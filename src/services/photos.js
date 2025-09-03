import { supabase } from '../lib/supabase';

/**
 * Get all photos for a claim
 * @param {string} claimId - The claim ID
 * @returns {Promise<Object>} The photos
 */
export const getClaimPhotos = async (claimId) => {
  try {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('claimId', claimId)
      .order('uploadedAt', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, photos: data };
  } catch (error) {
    console.error('Error getting claim photos:', error);
    return {
      success: false,
      error: error.message || 'Failed to get claim photos',
    };
  }
};

/**
 * Get a photo by ID
 * @param {string} photoId - The photo ID
 * @returns {Promise<Object>} The photo
 */
export const getPhotoById = async (photoId) => {
  try {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('photoId', photoId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, photo: data };
  } catch (error) {
    console.error('Error getting photo by ID:', error);
    return {
      success: false,
      error: error.message || 'Failed to get photo',
    };
  }
};

/**
 * Create a new photo
 * @param {Object} photoData - The photo data
 * @returns {Promise<Object>} The created photo
 */
export const createPhoto = async (photoData) => {
  try {
    const { data, error } = await supabase
      .from('photos')
      .insert([{
        ...photoData,
        uploadedAt: new Date(),
      }])
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, photo: data[0] };
  } catch (error) {
    console.error('Error creating photo:', error);
    return {
      success: false,
      error: error.message || 'Failed to create photo',
    };
  }
};

/**
 * Update a photo
 * @param {string} photoId - The photo ID
 * @param {Object} updates - The updates to apply
 * @returns {Promise<Object>} The updated photo
 */
export const updatePhoto = async (photoId, updates) => {
  try {
    const { data, error } = await supabase
      .from('photos')
      .update(updates)
      .eq('photoId', photoId)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, photo: data[0] };
  } catch (error) {
    console.error('Error updating photo:', error);
    return {
      success: false,
      error: error.message || 'Failed to update photo',
    };
  }
};

/**
 * Delete a photo
 * @param {string} photoId - The photo ID
 * @returns {Promise<Object>} Success status
 */
export const deletePhoto = async (photoId) => {
  try {
    // First, get the photo to get the storage path
    const { data: photo, error: getError } = await supabase
      .from('photos')
      .select('*')
      .eq('photoId', photoId)
      .single();

    if (getError) {
      throw new Error(getError.message);
    }

    // Extract the storage path from the imageUrl
    const url = new URL(photo.imageUrl);
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/claim-photos\/(.+)/);
    
    if (pathMatch && pathMatch[1]) {
      const storagePath = pathMatch[1];
      
      // Delete the file from storage
      const { error: storageError } = await supabase.storage
        .from('claim-photos')
        .remove([storagePath]);

      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        // Continue with deleting the database record even if storage deletion fails
      }
    }

    // Delete the photo record from the database
    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('photoId', photoId);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting photo:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete photo',
    };
  }
};

/**
 * Get photo statistics
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} The photo statistics
 */
export const getPhotoStatistics = async (userId) => {
  try {
    // Get all claims for the user
    const { data: claims, error: claimsError } = await supabase
      .from('claims')
      .select('claimId')
      .eq('userId', userId);

    if (claimsError) {
      throw new Error(claimsError.message);
    }

    const claimIds = claims.map(claim => claim.claimId);
    
    // Get all photos for the user's claims
    const { data: photos, error: photosError } = await supabase
      .from('photos')
      .select('*')
      .in('claimId', claimIds);

    if (photosError) {
      throw new Error(photosError.message);
    }

    // Calculate statistics
    const totalPhotos = photos.length;
    
    // Count photos by damage type
    const damageTypeCounts = {};
    photos.forEach(photo => {
      if (photo.detectedDamageTypes && Array.isArray(photo.detectedDamageTypes)) {
        photo.detectedDamageTypes.forEach(type => {
          damageTypeCounts[type] = (damageTypeCounts[type] || 0) + 1;
        });
      }
    });
    
    // Count photos by object category
    const objectCategoryCounts = {};
    photos.forEach(photo => {
      if (photo.objectCategory) {
        objectCategoryCounts[photo.objectCategory] = (objectCategoryCounts[photo.objectCategory] || 0) + 1;
      }
    });
    
    // Count photos by scene context
    const sceneContextCounts = {};
    photos.forEach(photo => {
      if (photo.sceneContext) {
        sceneContextCounts[photo.sceneContext] = (sceneContextCounts[photo.sceneContext] || 0) + 1;
      }
    });

    return { 
      success: true, 
      statistics: {
        totalPhotos,
        damageTypeCounts,
        objectCategoryCounts,
        sceneContextCounts
      }
    };
  } catch (error) {
    console.error('Error getting photo statistics:', error);
    return {
      success: false,
      error: error.message || 'Failed to get photo statistics',
    };
  }
};

