import React, { useState, useRef } from 'react'
import { Upload, Camera, X, AlertCircle, Info } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const FileUpload = ({ onFileUpload }) => {
  const { hasAccess, getPhotoLimit, userDetails } = useAuth()
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFiles = (files) => {
    setError(null)
    
    // Check file types
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
    const invalidFiles = Array.from(files).filter(file => !validTypes.includes(file.type))
    
    if (invalidFiles.length > 0) {
      setError(`Invalid file type(s). Only JPG, PNG, WebP, and HEIC images are supported.`)
      return
    }
    
    // Check file sizes
    const maxSize = 10 * 1024 * 1024 // 10MB
    const oversizedFiles = Array.from(files).filter(file => file.size > maxSize)
    
    if (oversizedFiles.length > 0) {
      setError(`Some files exceed the 10MB size limit.`)
      return
    }
    
    // Check subscription limits
    const photoLimit = getPhotoLimit()
    const photosUsed = userDetails?.photosThisMonth || 0
    const photosRemaining = photoLimit - photosUsed
    
    if (files.length > photosRemaining) {
      setError(`You can only upload ${photosRemaining} more photos this month with your current plan.`)
      return
    }
    
    setIsUploading(true)
    setUploadProgress(0)

    // Start upload process
    const uploadFiles = async () => {
      try {
        // Simulate initial upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + 5
          })
        }, 100)
        
        // Call the parent component's upload handler
        await onFileUpload(files)
        
        // Complete the progress
        clearInterval(progressInterval)
        setUploadProgress(100)
        
        // Reset after a short delay
        setTimeout(() => {
          setIsUploading(false)
          setUploadProgress(0)
        }, 1000)
      } catch (err) {
        clearInterval(progressInterval)
        setError(err.message || 'Failed to upload files')
        setIsUploading(false)
      }
    }
    
    uploadFiles()
  }

  // Calculate subscription usage
  const photoLimit = getPhotoLimit()
  const photosUsed = userDetails?.photosThisMonth || 0
  const usagePercentage = (photosUsed / photoLimit) * 100
  
  return (
    <div className="glass-effect rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Upload Photos</h3>
        <Camera className="w-5 h-5 text-blue-400" />
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}
      
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
          <span>Monthly usage: {photosUsed} / {photoLimit} photos</span>
          <span className={usagePercentage > 80 ? 'text-yellow-400' : ''}>
            {Math.round(usagePercentage)}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              usagePercentage > 90 ? 'bg-red-500' : 
              usagePercentage > 80 ? 'bg-yellow-500' : 
              'bg-blue-500'
            }`}
            style={{ width: `${usagePercentage}%` }}
          ></div>
        </div>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-gray-600 hover:border-gray-500'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6 text-blue-400 animate-pulse" />
            </div>
            <div>
              <p className="text-white font-medium">Uploading photos...</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-400 mt-1">{uploadProgress}% complete</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <p className="text-white font-medium">Drop photos here or click to browse</p>
              <p className="text-sm text-gray-400 mt-1">
                Supports JPG, PNG, WebP, HEIC up to 10MB each
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={photosUsed >= photoLimit}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Browse Files
            </button>
            
            {photosUsed >= photoLimit && (
              <div className="flex items-center justify-center text-yellow-400 text-sm mt-2">
                <Info className="w-4 h-4 mr-1" />
                <span>You've reached your monthly photo limit</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-4 flex items-center text-xs text-gray-400">
        <Info className="w-4 h-4 mr-1" />
        <span>
          Photos are analyzed using AI to detect damage types, object categories, and scene context.
          {!hasAccess('advancedAnalysis') && (
            <span className="text-yellow-400 ml-1">
              Upgrade to Pro for advanced analysis features.
            </span>
          )}
        </span>
      </div>
    </div>
  )
}

export default FileUpload
