import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  /**
   * Upload a single file to Supabase Storage
   * @param {File} file - The file to upload
   * @param {string} bucket - The storage bucket name
   * @param {string} path - The path within the bucket
   * @returns {Promise<Object>} The upload result
   */
  const uploadFile = async (file, bucket, path) => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Create a unique file name to avoid collisions
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const filePath = path ? `${path}/${fileName}` : fileName;
      
      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            setProgress(percent);
          }
        });

      if (error) {
        throw new Error(`Error uploading file: ${error.message}`);
      }

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      if (!urlData || !urlData.publicUrl) {
        throw new Error('Failed to get public URL for uploaded file');
      }

      setIsUploading(false);
      return {
        success: true,
        url: urlData.publicUrl,
        path: filePath,
        fileName,
        originalFileName: file.name,
        size: file.size,
        type: file.type
      };
    } catch (err) {
      setError(err.message || 'An error occurred during file upload');
      setIsUploading(false);
      return {
        success: false,
        error: err.message || 'An error occurred during file upload'
      };
    }
  };

  /**
   * Upload multiple files to Supabase Storage
   * @param {File[]} files - Array of files to upload
   * @param {string} bucket - The storage bucket name
   * @param {string} path - The path within the bucket
   * @returns {Promise<Object[]>} Array of upload results
   */
  const uploadMultipleFiles = async (files, bucket, path) => {
    setIsUploading(true);
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
        
        // Upload the current file
        const result = await uploadFile(file, bucket, path);
        results.push(result);
        
        // Update progress after each file is processed
        setProgress(((i + 1) / totalFiles) * 100);
      }

      setIsUploading(false);
      return results;
    } catch (err) {
      setError(err.message || 'An error occurred during batch file upload');
      setIsUploading(false);
      return results;
    }
  };

  /**
   * Delete a file from Supabase Storage
   * @param {string} bucket - The storage bucket name
   * @param {string} path - The file path within the bucket
   * @returns {Promise<Object>} The deletion result
   */
  const deleteFile = async (bucket, path) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        throw new Error(`Error deleting file: ${error.message}`);
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.message || 'An error occurred during file deletion'
      };
    }
  };

  return {
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    isUploading,
    progress,
    error
  };
};

