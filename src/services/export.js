import { getClaimById } from './claims';
import { getClaimPhotos } from './photos';

/**
 * Export claim data to JSON format
 * @param {string} claimId - The claim ID
 * @returns {Promise<Object>} The exported data
 */
export const exportClaimToJson = async (claimId) => {
  try {
    // Get the claim data
    const { success: claimSuccess, claim, error: claimError } = await getClaimById(claimId);
    
    if (!claimSuccess) {
      throw new Error(claimError);
    }
    
    // Get the photos for the claim
    const { success: photosSuccess, photos, error: photosError } = await getClaimPhotos(claimId);
    
    if (!photosSuccess) {
      throw new Error(photosError);
    }
    
    // Format the data for export
    const exportData = {
      claim: {
        claimId: claim.claimId,
        claimNumber: claim.claimNumber,
        status: claim.status,
        createdAt: claim.createdAt,
        updatedAt: claim.updatedAt
      },
      photos: photos.map(photo => ({
        photoId: photo.photoId,
        imageUrl: photo.imageUrl,
        detectedDamageTypes: photo.detectedDamageTypes,
        objectCategory: photo.objectCategory,
        sceneContext: photo.sceneContext,
        analysisResults: {
          confidence: photo.analysisResults?.confidence || 0
        },
        uploadedAt: photo.uploadedAt
      }))
    };
    
    // Create a Blob with the JSON data
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    // Create a download URL for the Blob
    const url = URL.createObjectURL(blob);
    
    return {
      success: true,
      url,
      filename: `claim_${claim.claimNumber}_export.json`,
      cleanup: () => URL.revokeObjectURL(url)
    };
  } catch (error) {
    console.error('Error exporting claim to JSON:', error);
    return {
      success: false,
      error: error.message || 'Failed to export claim data'
    };
  }
};

/**
 * Export claim data to CSV format
 * @param {string} claimId - The claim ID
 * @returns {Promise<Object>} The exported data
 */
export const exportClaimToCsv = async (claimId) => {
  try {
    // Get the claim data
    const { success: claimSuccess, claim, error: claimError } = await getClaimById(claimId);
    
    if (!claimSuccess) {
      throw new Error(claimError);
    }
    
    // Get the photos for the claim
    const { success: photosSuccess, photos, error: photosError } = await getClaimPhotos(claimId);
    
    if (!photosSuccess) {
      throw new Error(photosError);
    }
    
    // Create CSV header
    const headers = [
      'Photo ID',
      'Image URL',
      'Damage Types',
      'Object Category',
      'Scene Context',
      'Confidence',
      'Uploaded At'
    ];
    
    // Create CSV rows
    const rows = photos.map(photo => [
      photo.photoId,
      photo.imageUrl,
      photo.detectedDamageTypes ? photo.detectedDamageTypes.join(', ') : '',
      photo.objectCategory || '',
      photo.sceneContext || '',
      photo.analysisResults?.confidence ? (photo.analysisResults.confidence * 100).toFixed(2) + '%' : '0%',
      new Date(photo.uploadedAt).toLocaleString()
    ]);
    
    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\\n');
    
    // Create a Blob with the CSV data
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8'
    });
    
    // Create a download URL for the Blob
    const url = URL.createObjectURL(blob);
    
    return {
      success: true,
      url,
      filename: `claim_${claim.claimNumber}_export.csv`,
      cleanup: () => URL.revokeObjectURL(url)
    };
  } catch (error) {
    console.error('Error exporting claim to CSV:', error);
    return {
      success: false,
      error: error.message || 'Failed to export claim data'
    };
  }
};

/**
 * Export claim data to PDF format
 * Note: In a real implementation, this would likely use a PDF generation library
 * or call a backend service to generate the PDF.
 * @param {string} claimId - The claim ID
 * @returns {Promise<Object>} The exported data
 */
export const exportClaimToPdf = async (claimId) => {
  try {
    // This is a placeholder for PDF export functionality
    // In a real implementation, you would use a PDF generation library
    // or call a backend service to generate the PDF
    
    return {
      success: false,
      error: 'PDF export is not implemented in this demo'
    };
  } catch (error) {
    console.error('Error exporting claim to PDF:', error);
    return {
      success: false,
      error: error.message || 'Failed to export claim data'
    };
  }
};

