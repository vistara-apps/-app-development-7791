import React, { useState } from 'react'
import { Eye, Download, Tag, MapPin, Zap } from 'lucide-react'
import TagDisplay from './TagDisplay'

const PhotoGallery = ({ photos, claimNumber }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  const handleExport = () => {
    const exportData = {
      claimNumber,
      totalPhotos: photos.length,
      analysisResults: photos.map(photo => ({
        imageUrl: photo.imageUrl,
        detectedDamage: photo.detectedDamageTypes,
        objectCategory: photo.objectCategory,
        sceneContext: photo.sceneContext,
        confidence: photo.analysisResults?.confidence
      }))
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${claimNumber}-analysis.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="glass-effect rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Photo Analysis</h3>
          <p className="text-sm text-gray-400">{claimNumber} • {photos.length} photos</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Data
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-800">
              <img
                src={photo.imageUrl}
                alt="Claim photo"
                className="w-full h-full object-cover"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => setSelectedPhoto(photo)}
                  className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>

              {/* Analysis Status */}
              <div className="absolute top-2 right-2">
                {photo.detectedDamageTypes[0] === 'Analyzing...' ? (
                  <div className="bg-yellow-500/20 backdrop-blur-sm text-yellow-300 px-2 py-1 rounded text-xs">
                    <Zap className="w-3 h-3 inline mr-1" />
                    Analyzing
                  </div>
                ) : (
                  <div className="bg-green-500/20 backdrop-blur-sm text-green-300 px-2 py-1 rounded text-xs">
                    {Math.round((photo.analysisResults?.confidence || 0) * 100)}% confident
                  </div>
                )}
              </div>
            </div>

            {/* Photo Info */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-3 h-3" />
                <span>{photo.objectCategory} • {photo.sceneContext}</span>
              </div>
              
              <TagDisplay 
                tags={photo.detectedDamageTypes} 
                variant="badge"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-full overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Photo Analysis</h4>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedPhoto.imageUrl}
                    alt="Claim photo"
                    className="w-full rounded-lg"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-400 mb-2">Detected Damage</h5>
                    <TagDisplay tags={selectedPhoto.detectedDamageTypes} variant="list" />
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-gray-400 mb-2">Classification</h5>
                    <div className="text-white">
                      <p>Object: {selectedPhoto.objectCategory}</p>
                      <p>Scene: {selectedPhoto.sceneContext}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-gray-400 mb-2">Analysis Results</h5>
                    <div className="text-white">
                      <p>Confidence: {Math.round((selectedPhoto.analysisResults?.confidence || 0) * 100)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PhotoGallery