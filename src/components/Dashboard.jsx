import React, { useState } from 'react'
import FileUpload from './FileUpload'
import PhotoGallery from './PhotoGallery'
import StatsCards from './StatsCards'

const Dashboard = ({ user }) => {
  const [claims, setClaims] = useState([
    {
      id: 1,
      claimNumber: 'CLM-2024-001',
      status: 'Analyzing',
      photos: [
        {
          id: 1,
          imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400',
          detectedDamageTypes: ['Dent', 'Scratch'],
          objectCategory: 'Vehicle',
          sceneContext: 'Outdoor',
          analysisResults: { confidence: 0.92 }
        },
        {
          id: 2,
          imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400',
          detectedDamageTypes: ['Water Damage'],
          objectCategory: 'Property',
          sceneContext: 'Indoor',
          analysisResults: { confidence: 0.88 }
        }
      ]
    },
    {
      id: 2,
      claimNumber: 'CLM-2024-002',
      status: 'Completed',
      photos: [
        {
          id: 3,
          imageUrl: 'https://images.unsplash.com/photo-1494976688153-c895c43015fd?w=400',
          detectedDamageTypes: ['Fire Damage', 'Structural'],
          objectCategory: 'Property',
          sceneContext: 'Outdoor',
          analysisResults: { confidence: 0.95 }
        },
        {
          id: 4,
          imageUrl: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400',
          detectedDamageTypes: ['Hail Damage'],
          objectCategory: 'Vehicle',
          sceneContext: 'Outdoor',
          analysisResults: { confidence: 0.91 }
        }
      ]
    }
  ])

  const [selectedClaim, setSelectedClaim] = useState(claims[0])

  const handleFileUpload = (files) => {
    // Simulate AI analysis
    const newPhotos = Array.from(files).map((file, index) => ({
      id: Date.now() + index,
      imageUrl: URL.createObjectURL(file),
      detectedDamageTypes: ['Analyzing...'],
      objectCategory: 'Analyzing...',
      sceneContext: 'Analyzing...',
      analysisResults: { confidence: 0 }
    }))

    const updatedClaim = {
      ...selectedClaim,
      photos: [...selectedClaim.photos, ...newPhotos]
    }

    setClaims(claims.map(claim => 
      claim.id === selectedClaim.id ? updatedClaim : claim
    ))
    setSelectedClaim(updatedClaim)

    // Simulate AI processing delay
    setTimeout(() => {
      const processedPhotos = newPhotos.map(photo => ({
        ...photo,
        detectedDamageTypes: ['Impact Damage', 'Surface Scratches'],
        objectCategory: 'Vehicle',
        sceneContext: 'Outdoor',
        analysisResults: { confidence: 0.89 }
      }))

      const finalClaim = {
        ...updatedClaim,
        photos: updatedClaim.photos.map(photo => 
          processedPhotos.find(p => p.id === photo.id) || photo
        )
      }

      setClaims(claims.map(claim => 
        claim.id === selectedClaim.id ? finalClaim : claim
      ))
      setSelectedClaim(finalClaim)
    }, 3000)
  }

  return (
    <div className="p-6 space-y-6">
      <StatsCards claims={claims} />
      
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Claims List */}
        <div className="xl:col-span-1">
          <div className="glass-effect rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Claims</h3>
            <div className="space-y-3">
              {claims.map((claim) => (
                <button
                  key={claim.id}
                  onClick={() => setSelectedClaim(claim)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedClaim.id === claim.id
                      ? 'bg-blue-500/20 border border-blue-500/30'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="text-sm font-medium text-white">{claim.claimNumber}</div>
                  <div className="text-xs text-gray-400">{claim.photos.length} photos</div>
                  <div className={`text-xs mt-1 ${
                    claim.status === 'Completed' ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {claim.status}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="xl:col-span-3 space-y-6">
          <FileUpload onFileUpload={handleFileUpload} />
          <PhotoGallery 
            photos={selectedClaim.photos} 
            claimNumber={selectedClaim.claimNumber}
          />
        </div>
      </div>
    </div>
  )
}

export default Dashboard