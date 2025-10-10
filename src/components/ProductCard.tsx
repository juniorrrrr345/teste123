'use client'

import { useState } from 'react'
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image?: string | null
  video?: string | null
  farm: {
    name: string
  }
  category: {
    name: string
  }
}

interface ProductCardProps {
  product: Product
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [showVideo, setShowVideo] = useState(false)

  const toggleVideo = () => {
    if (product.video) {
      setShowVideo(!showVideo)
      setIsVideoPlaying(!isVideoPlaying)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 max-w-md">
      {/* Image/Video Section */}
      <div className="relative h-64 bg-gray-200">
        {showVideo && product.video ? (
          <div className="relative w-full h-full">
            <video
              className="w-full h-full object-cover"
              controls
              autoPlay={isVideoPlaying}
              onPlay={() => setIsVideoPlaying(true)}
              onPause={() => setIsVideoPlaying(false)}
            >
              <source src={product.video} type="video/mp4" />
              Votre navigateur ne supporte pas la lecture vidéo.
            </video>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-500">Aucune image</span>
              </div>
            )}
            
            {/* Video play button overlay */}
            {product.video && (
              <button
                onClick={toggleVideo}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-all"
              >
                <div className="bg-white bg-opacity-90 rounded-full p-4 hover:bg-opacity-100 transition-all">
                  <PlayIcon className="w-8 h-8 text-gray-800" />
                </div>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
            {product.name}
          </h3>
          <span className="text-2xl font-bold text-green-600">
            {product.price.toFixed(2)}€
          </span>
        </div>

        <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
            {product.category.name}
          </span>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {product.farm.name}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex space-x-3">
          <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
            Ajouter au panier
          </button>
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors">
            Voir détails
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard