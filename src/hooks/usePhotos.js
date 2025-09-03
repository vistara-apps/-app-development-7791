import { useState, useEffect } from 'react';
import { 
  getClaimPhotos, 
  getPhotoById, 
  createPhoto, 
  updatePhoto, 
  deletePhoto,
  getPhotoStatistics
} from '../services/photos';

export const usePhotos = (claimId = null) => {
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch photos for a claim
  useEffect(() => {
    const fetchPhotos = async () => {
      if (!claimId) {
        setPhotos([]);
        setSelectedPhoto(null);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { success, photos, error } = await getClaimPhotos(claimId);
        
        if (!success) {
          throw new Error(error);
        }
        
        setPhotos(photos);
        
        // Select the first photo by default if available
        if (photos.length > 0 && !selectedPhoto) {
          setSelectedPhoto(photos[0]);
        }
      } catch (err) {
        console.error('Error fetching photos:', err);
        setError(err.message || 'Failed to fetch photos');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPhotos();
  }, [claimId]);

  // Create a new photo
  const handleCreatePhoto = async (photoData) => {
    if (!claimId) return { success: false, error: 'No claim ID provided' };
    
    try {
      const { success, photo, error } = await createPhoto({
        claimId,
        ...photoData,
      });
      
      if (!success) {
        throw new Error(error);
      }
      
      // Add the new photo to the list and select it
      setPhotos([photo, ...photos]);
      setSelectedPhoto(photo);
      
      return { success: true, photo };
    } catch (err) {
      console.error('Error creating photo:', err);
      return { success: false, error: err.message || 'Failed to create photo' };
    }
  };

  // Update an existing photo
  const handleUpdatePhoto = async (photoId, updates) => {
    try {
      const { success, photo, error } = await updatePhoto(photoId, updates);
      
      if (!success) {
        throw new Error(error);
      }
      
      // Update the photos list and selected photo
      setPhotos(photos.map(p => p.photoId === photoId ? photo : p));
      
      if (selectedPhoto?.photoId === photoId) {
        setSelectedPhoto(photo);
      }
      
      return { success: true, photo };
    } catch (err) {
      console.error('Error updating photo:', err);
      return { success: false, error: err.message || 'Failed to update photo' };
    }
  };

  // Delete a photo
  const handleDeletePhoto = async (photoId) => {
    try {
      const { success, error } = await deletePhoto(photoId);
      
      if (!success) {
        throw new Error(error);
      }
      
      // Remove the photo from the list
      setPhotos(photos.filter(p => p.photoId !== photoId));
      
      // If the deleted photo was selected, select another one
      if (selectedPhoto?.photoId === photoId) {
        setSelectedPhoto(photos.find(p => p.photoId !== photoId) || null);
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting photo:', err);
      return { success: false, error: err.message || 'Failed to delete photo' };
    }
  };

  // Select a photo
  const selectPhoto = (photoId) => {
    const photo = photos.find(p => p.photoId === photoId);
    if (photo) {
      setSelectedPhoto(photo);
      return true;
    }
    return false;
  };

  // Get photo statistics
  const fetchPhotoStatistics = async (userId) => {
    if (!userId) return { success: false, error: 'No user ID provided' };
    
    try {
      const { success, statistics, error } = await getPhotoStatistics(userId);
      
      if (!success) {
        throw new Error(error);
      }
      
      setStatistics(statistics);
      return { success: true, statistics };
    } catch (err) {
      console.error('Error fetching photo statistics:', err);
      return { success: false, error: err.message || 'Failed to fetch photo statistics' };
    }
  };

  return {
    photos,
    selectedPhoto,
    statistics,
    isLoading,
    error,
    createPhoto: handleCreatePhoto,
    updatePhoto: handleUpdatePhoto,
    deletePhoto: handleDeletePhoto,
    selectPhoto,
    fetchPhotoStatistics,
  };
};

