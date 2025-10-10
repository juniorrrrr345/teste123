'use client'

import { useState, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline'
import { PlayIcon as PlaySolid, PauseIcon as PauseSolid } from '@heroicons/react/24/solid'

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  
  const slides = [
    {
      id: 1,
      title: "CBD Premium de Qualité",
      subtitle: "Découvrez notre gamme de produits CBD naturels et biologiques",
      description: "Des produits testés en laboratoire, certifiés biologiques et cultivés avec amour",
      image: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      cta: "Découvrir nos produits",
      stats: "100% Naturel"
    },
    {
      id: 2,
      title: "Fermes Certifiées",
      subtitle: "Nos produits proviennent de fermes certifiées et respectueuses de l'environnement",
      description: "Cultivé en France avec des méthodes durables et respectueuses de la nature",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      cta: "Visiter nos fermes",
      stats: "Certifié Bio"
    },
    {
      id: 3,
      title: "Livraison Rapide",
      subtitle: "Recevez vos produits CBD en 24-48h partout en France",
      description: "Expédition gratuite dès 50€ et livraison sécurisée à domicile",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      cta: "Commander maintenant",
      stats: "Livraison 24h"
    }
  ]

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    if (!isPlaying) return
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [isPlaying, slides.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-1000 ${
            index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-110"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 via-transparent to-transparent" />
        </div>
      ))}

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-green-500/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-green-400/10 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-green-600/10 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-green-300/10 rounded-full animate-pulse delay-500"></div>
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center">
        <div className={`text-center text-white px-4 max-w-6xl transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          {/* Stats Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium mb-6 animate-fade-in">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            {slides[currentSlide].stats}
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight animate-slide-up">
            <span className="block bg-gradient-to-r from-white via-green-100 to-green-200 bg-clip-text text-transparent">
              {slides[currentSlide].title}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-3xl lg:text-4xl font-light mb-4 text-green-100 animate-slide-up delay-200">
            {slides[currentSlide].subtitle}
          </p>

          {/* Description */}
          <p className="text-lg md:text-xl text-green-200/80 max-w-3xl mx-auto mb-8 animate-slide-up delay-300">
            {slides[currentSlide].description}
          </p>

          {/* CTA Button */}
          <div className="animate-scale-in delay-500">
            <button className="btn-primary text-lg px-8 py-4 shadow-2xl hover:shadow-green-500/25">
              {slides[currentSlide].cta}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full transition-all duration-300 hover:scale-110"
        >
          {isPlaying ? (
            <PauseSolid className="w-5 h-5 text-white" />
          ) : (
            <PlaySolid className="w-5 h-5 text-white" />
          )}
        </button>

        {/* Dots indicator */}
        <div className="flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

        {/* Navigation arrows */}
        <div className="flex space-x-2">
          <button
            onClick={prevSlide}
            className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full transition-all duration-300 hover:scale-110"
          >
            <ChevronLeftIcon className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full transition-all duration-300 hover:scale-110"
          >
            <ChevronRightIcon className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-8 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

export default Hero