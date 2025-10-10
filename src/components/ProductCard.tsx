'use client'

import { useState } from 'react'
import { PlayIcon, PauseIcon, HeartIcon, ShoppingCartIcon, EyeIcon, StarIcon } from '@heroicons/react/24/solid'
import { HeartIcon as HeartOutline, ShoppingCartIcon as CartOutline } from '@heroicons/react/24/outline'
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
  const [isLiked, setIsLiked] = useState(false)
  const [isInCart, setIsInCart] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const toggleVideo = () => {
    if (product.video) {
      setShowVideo(!showVideo)
      setIsVideoPlaying(!isVideoPlaying)
    }
  }

  const toggleLike = () => {
    setIsLiked(!isLiked)
  }

  const toggleCart = () => {
    setIsInCart(!isInCart)
  }

  return (
    <div 
      className="group card-modern max-w-sm overflow-hidden relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image/Video Section */}
      <div className="relative h-80 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
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
            <button
              onClick={toggleVideo}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-300"
            >
              <PauseIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-gray-500 text-sm">Aucune image</span>
              </div>
            )}
            
            {/* Overlay Actions */}
            <div className={`absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center`}>
              <div className="flex space-x-2">
                {product.video && (
                  <button
                    onClick={toggleVideo}
                    className="p-3 bg-white/90 hover:bg-white text-gray-800 rounded-full transition-all duration-300 hover:scale-110"
                  >
                    <PlayIcon className="w-5 h-5" />
                  </button>
                )}
                <button className="p-3 bg-white/90 hover:bg-white text-gray-800 rounded-full transition-all duration-300 hover:scale-110">
                  <EyeIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Top Actions */}
            <div className="absolute top-4 right-4 flex flex-col space-y-2">
              <button
                onClick={toggleLike}
                className={`p-2 rounded-full transition-all duration-300 ${
                  isLiked 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/80 hover:bg-white text-gray-600 hover:text-red-500'
                }`}
              >
                {isLiked ? (
                  <HeartIcon className="w-4 h-4" />
                ) : (
                  <HeartOutline className="w-4 h-4" />
                )}
              </button>
              
              <button
                onClick={toggleCart}
                className={`p-2 rounded-full transition-all duration-300 ${
                  isInCart 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white/80 hover:bg-white text-gray-600 hover:text-green-500'
                }`}
              >
                {isInCart ? (
                  <ShoppingCartIcon className="w-4 h-4" />
                ) : (
                  <CartOutline className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
                {product.category.name}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Farm Name */}
        <div className="flex items-center mb-2">
          <span className="text-xs text-gray-500 font-medium">
            🌱 {product.farm.name}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-green-600 transition-colors duration-300">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className="w-4 h-4 text-yellow-400" />
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-2">(4.8)</span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-bold gradient-text">
              {product.price.toFixed(2)}€
            </span>
            <span className="text-sm text-gray-500">/unité</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 space-y-2">
          <button 
            onClick={toggleCart}
            className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
              isInCart
                ? 'bg-green-100 text-green-700 border-2 border-green-200'
                : 'btn-primary'
            }`}
          >
            {isInCart ? 'Ajouté au panier ✓' : 'Ajouter au panier'}
          </button>
          
          <button className="w-full btn-secondary text-sm">
            Voir les détails
          </button>
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-green-200 transition-all duration-300 pointer-events-none"></div>
    </div>
  )
}

export default ProductCard