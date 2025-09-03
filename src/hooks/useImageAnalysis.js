import { useState } from 'react';
import { analyzeImage } from '../services/openai';
import { supabase } from '../lib/supabase';

export const useImageAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  /**
   * Analyze a single image file
   * @param {File} file - The image file to analyze
   * @param {string} claimId - The ID of the claim this photo belongs to
   * @returns {Promise<Object>} The analysis results
   */
  const analyzeImageFile = async (file, claimId) => {
    setIsAnalyzing(true);
    setProgress(0);
    setError(null);

    try {
      // Step 1: Upload the file to Supabase Storage
      setProgress(10);
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const filePath = `${claimId}/${fileName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('claim-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Error uploading file: ${uploadError.message}`);
      }

      setProgress(40);

      // Step 2: Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('claim-photos')
        .getPublicUrl(filePath);

      if (!urlData || !urlData.publicUrl) {
        throw new Error('Failed to get public URL for uploaded file');
      }

      const imageUrl = urlData.publicUrl;
      setProgress(50);

      // Step 3: Analyze the image using OpenAI
      const analysisResult = await analyzeImage(imageUrl);
      
      if (!analysisResult.success) {
        throw new Error(`Error analyzing image: ${analysisResult.error}`);
      }

      setProgress(90);

      // Step 4: Create a record in the photos table
      const photoData = {
        claimId,
        imageUrl,
        originalFileName: file.name,
        detectedDamageTypes: analysisResult.detectedDamageTypes,
        objectCategory: analysisResult.objectCategory,
        sceneContext: analysisResult.sceneContext,
        analysisResults: analysisResult.analysisResults,
        uploadedAt: new Date(),
      };

      const { data: photoRecord, error: photoError } = await supabase
        .from('photos')
        .insert([photoData])
        .select();

      if (photoError) {
        throw new Error(`Error saving photo record: ${photoError.message}`);
      }

      setProgress(100);
      setIsAnalyzing(false);

      return {
        ...photoRecord[0],
        success: true,
      };
    } catch (err) {
      setError(err.message || 'An error occurred during image analysis');
      setIsAnalyzing(false);
      return {
        success: false,
        error: err.message || 'An error occurred during image analysis',
      };
    }
  };

  /**
   * Analyze multiple image files
   * @param {File[]} files - Array of image files to analyze
   * @param {string} claimId - The ID of the claim these photos belong to
   * @returns {Promise<Object[]>} Array of analysis results
   */
  const analyzeMultipleImages = async (files, claimId) => {
    setIsAnalyzing(true);
    setProgress(0);
    setError(null);

    const results = [];
    const totalFiles = files.length;

    try {
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        
        // Update progress based on current file and total files
        const baseProgress = (i / totalFiles) * 100;
        setProgress(baseProgress);
        
        // Analyze the current file
        const result = await analyzeImageFile(file, claimId);
        results.push(result);
        
        // Update progress after each file is processed
        setProgress(((i + 1) / totalFiles) * 100);
      }

      setIsAnalyzing(false);
      return results;
    } catch (err) {
      setError(err.message || 'An error occurred during batch image analysis');
      setIsAnalyzing(false);
      return results;
    }
  };

  return {
    analyzeImageFile,
    analyzeMultipleImages,
    isAnalyzing,
    progress,
    error,
  };
};

