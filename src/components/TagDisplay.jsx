import React from 'react'
import { Tag } from 'lucide-react'

const TagDisplay = ({ tags, variant = 'badge' }) => {
  const getDamageColor = (tag) => {
    const colorMap = {
      'Dent': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'Scratch': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'Water Damage': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'Fire Damage': 'bg-red-500/20 text-red-300 border-red-500/30',
      'Hail Damage': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'Impact Damage': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      'Structural': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      'Surface Scratches': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      'Analyzing...': 'bg-gray-600/20 text-gray-400 border-gray-600/30'
    }
    return colorMap[tag] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }

  if (variant === 'list') {
    return (
      <div className="space-y-2">
        {tags.map((tag, index) => (
          <div key={index} className="flex items-center gap-2 text-white">
            <Tag className="w-4 h-4 text-gray-400" />
            <span>{tag}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag, index) => (
        <span
          key={index}
          className={`px-2 py-1 rounded text-xs border ${getDamageColor(tag)}`}
        >
          {tag}
        </span>
      ))}
    </div>
  )
}

export default TagDisplay