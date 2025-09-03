import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, Loader, AlertCircle } from 'lucide-react'
import FileUpload from './FileUpload'
import PhotoGallery from './PhotoGallery'
import StatsCards from './StatsCards'
import ExportOptions from './ExportOptions'
import { useAuth } from '../hooks/useAuth'
import { useImageAnalysis } from '../hooks/useImageAnalysis'
import { getUserClaims, createClaim } from '../services/claims'

const Dashboard = () => {
  const { user, userDetails } = useAuth()
  const { analyzeMultipleImages } = useImageAnalysis()
  const navigate = useNavigate()
  
  const [claims, setClaims] = useState([])
  const [selectedClaim, setSelectedClaim] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isCreatingClaim, setIsCreatingClaim] = useState(false)

  // Fetch user claims
  useEffect(() => {
    const fetchClaims = async () => {
      if (!user) return
      
      setIsLoading(true)
      setError(null)
      
      try {
        const { success, claims, error } = await getUserClaims(user.id)
        
        if (!success) {
          throw new Error(error)
        }
        
        setClaims(claims)
        
        // Select the first claim by default if available
        if (claims.length > 0) {
          setSelectedClaim(claims[0])
        }
      } catch (err) {
        console.error('Error fetching claims:', err)
        setError(err.message || 'Failed to fetch claims')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchClaims()
  }, [user])

  // Handle creating a new claim
  const handleCreateClaim = async () => {
    if (!user) return
    
    setIsCreatingClaim(true)
    
    try {
      // Generate a unique claim number
      const claimNumber = `CLM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      
      const { success, claim, error } = await createClaim({
        userId: user.id,
        claimNumber,
        status: 'New',
      })
      
      if (!success) {
        throw new Error(error)
      }
      
      // Add the new claim to the list and select it
      setClaims([claim, ...claims])
      setSelectedClaim(claim)
    } catch (err) {
      console.error('Error creating claim:', err)
      alert(`Failed to create claim: ${err.message}`)
    } finally {
      setIsCreatingClaim(false)
    }
  }

  // Handle file upload and analysis
  const handleFileUpload = async (files) => {
    if (!selectedClaim) {
      alert('Please select or create a claim first')
      return
    }
    
    // Convert FileList to Array
    const fileArray = Array.from(files)
    
    // Create temporary photo objects with local URLs for immediate display
    const tempPhotos = fileArray.map((file, index) => ({
      photoId: `temp-${Date.now()}-${index}`,
      imageUrl: URL.createObjectURL(file),
      detectedDamageTypes: ['Analyzing...'],
      objectCategory: 'Analyzing...',
      sceneContext: 'Analyzing...',
      analysisResults: { confidence: 0 },
      uploadedAt: new Date()
    }))
    
    // Update the selected claim with temporary photos
    const updatedClaim = {
      ...selectedClaim,
      photos: [...(selectedClaim.photos || []), ...tempPhotos]
    }
    
    // Update the UI
    setClaims(claims.map(claim => 
      claim.claimId === selectedClaim.claimId ? updatedClaim : claim
    ))
    setSelectedClaim(updatedClaim)
    
    // Analyze the images
    try {
      const results = await analyzeMultipleImages(fileArray, selectedClaim.claimId)
      
      // Update the claim with the analyzed photos
      const finalClaim = {
        ...updatedClaim,
        photos: updatedClaim.photos.map(photo => {
          // If it's a temporary photo, replace it with the analyzed version
          if (photo.photoId.startsWith('temp-')) {
            const index = tempPhotos.findIndex(p => p.photoId === photo.photoId)
            return index >= 0 && results[index] ? results[index] : photo
          }
          return photo
        })
      }
      
      // Update the UI
      setClaims(claims.map(claim => 
        claim.claimId === selectedClaim.claimId ? finalClaim : claim
      ))
      setSelectedClaim(finalClaim)
      
      // Revoke temporary URLs to avoid memory leaks
      tempPhotos.forEach(photo => URL.revokeObjectURL(photo.imageUrl))
    } catch (err) {
      console.error('Error analyzing images:', err)
      alert(`Failed to analyze images: ${err.message}`)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-white">Loading dashboard...</span>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-6 py-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>Error: {error}</span>
          </div>
        </div>
      </div>
    )
  }

  // Show empty state if no claims
  if (claims.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-64">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">No Claims Yet</h2>
          <p className="text-gray-400">
            Create your first claim to start analyzing photos
          </p>
        </div>
        <button
          onClick={handleCreateClaim}
          disabled={isCreatingClaim}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
        >
          {isCreatingClaim ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4 mr-2" />
              Create New Claim
            </>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <StatsCards claims={claims} />
      
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Claims List */}
        <div className="xl:col-span-1">
          <div className="glass-effect rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Claims</h3>
              <button
                onClick={handleCreateClaim}
                disabled={isCreatingClaim}
                className="text-blue-400 hover:text-blue-300"
                title="Create New Claim"
              >
                {isCreatingClaim ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <PlusCircle className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="space-y-3">
              {claims.map((claim) => (
                <button
                  key={claim.claimId}
                  onClick={() => setSelectedClaim(claim)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedClaim?.claimId === claim.claimId
                      ? 'bg-blue-500/20 border border-blue-500/30'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="text-sm font-medium text-white">{claim.claimNumber}</div>
                  <div className="text-xs text-gray-400">{claim.photos?.length || 0} photos</div>
                  <div className={`text-xs mt-1 ${
                    claim.status === 'Completed' ? 'text-green-400' : 
                    claim.status === 'New' ? 'text-blue-400' : 'text-yellow-400'
                  }`}>
                    {claim.status}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        {selectedClaim && (
          <div className="xl:col-span-3 space-y-6">
            <FileUpload onFileUpload={handleFileUpload} />
            
            <PhotoGallery 
              photos={selectedClaim.photos || []} 
              claimNumber={selectedClaim.claimNumber}
            />
            
            <ExportOptions 
              claimId={selectedClaim.claimId}
              claimNumber={selectedClaim.claimNumber}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
