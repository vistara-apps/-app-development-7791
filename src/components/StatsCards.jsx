import React from 'react'
import { Camera, CheckCircle, Clock, TrendingUp } from 'lucide-react'

const StatsCards = ({ claims }) => {
  const totalPhotos = claims.reduce((sum, claim) => sum + claim.photos.length, 0)
  const completedClaims = claims.filter(claim => claim.status === 'Completed').length
  const analyzingClaims = claims.filter(claim => claim.status === 'Analyzing').length
  const avgConfidence = claims.reduce((sum, claim) => {
    const claimAvg = claim.photos.reduce((photoSum, photo) => 
      photoSum + (photo.analysisResults?.confidence || 0), 0) / claim.photos.length
    return sum + claimAvg
  }, 0) / claims.length

  const stats = [
    {
      icon: Camera,
      label: 'Total Photos',
      value: totalPhotos,
      color: 'blue'
    },
    {
      icon: CheckCircle,
      label: 'Completed Claims',
      value: completedClaims,
      color: 'green'
    },
    {
      icon: Clock,
      label: 'Processing',
      value: analyzingClaims,
      color: 'yellow'
    },
    {
      icon: TrendingUp,
      label: 'Avg Confidence',
      value: `${Math.round(avgConfidence * 100)}%`,
      color: 'purple'
    }
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500/20 text-blue-300',
      green: 'bg-green-500/20 text-green-300',
      yellow: 'bg-yellow-500/20 text-yellow-300',
      purple: 'bg-purple-500/20 text-purple-300'
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="glass-effect rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsCards