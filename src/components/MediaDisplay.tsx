'use client';
import { useState, useEffect } from 'react';

interface MediaDisplayProps {
  url: string;
  alt?: string;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

export default function MediaDisplay({ 
  url, 
  alt = '', 
  className = '', 
  controls = true,
  autoPlay = false,
  loop = false,
  muted = true
}: MediaDisplayProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Reset états quand l'URL change
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
  }, [url]);

  if (!url || url.trim() === '') {
    return (
      <div className={`bg-gray-800 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="text-gray-400 text-sm">📷</div>
          <div className="text-gray-500 text-xs mt-1">Aucun média</div>
        </div>
      </div>
    );
  }

  // Debug de l'URL
  console.log('🔍 MediaDisplay URL:', url);

  // Détection vidéo : MP4 classique + Cloudflare Video + iframe
  const isVideo = /\.(mp4|webm|ogg|avi|mov|wmv)(\?|$)/i.test(url) || 
                  url.includes('video/') ||
                  url.includes('/videos/') ||
                  url.includes('videodelivery.net') ||
                  url.includes('iframe.videodelivery') ||
                  url.includes('cloudflarestream.com');

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    console.error('❌ Erreur chargement média:', url, 'Tentative:', retryCount + 1);
    setIsLoading(false);
    
    // Essayer de recharger jusqu'à 2 fois
    if (retryCount < 2) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setIsLoading(true);
        setHasError(false);
      }, 1000);
    } else {
      setHasError(true);
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    setIsLoading(true);
    setHasError(false);
  };

  if (hasError) {
    return (
      <div className={`bg-gray-800 flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <div className="text-gray-400 text-2xl mb-2">📷</div>
          <div className="text-gray-500 text-xs mb-3">Média non disponible</div>
          <button
            onClick={handleRetry}
            className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1 rounded transition-colors"
          >
            🔄 Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {isVideo ? (
        // Support vidéos Cloudflare iframe
        url.includes('iframe.videodelivery') || url.includes('cloudflarestream.com') ? (
          <iframe
            src={url}
            className={`w-full h-full ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            frameBorder="0"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            allowFullScreen
            onLoad={handleLoad}
            onError={handleError}
            title="Vidéo produit"
          />
        ) : (
          // Support vidéos MP4 classiques
          <video
            key={`${url}-${retryCount}`}
            src={url}
            className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            controls={controls}
            autoPlay={autoPlay}
            loop={loop}
            muted={muted}
            onLoadedData={handleLoad}
            onError={handleError}
            preload="metadata"
            playsInline
            crossOrigin="anonymous"
          >
            <source src={url} type="video/mp4" />
            <source src={url} type="video/webm" />
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>
        )
      ) : (
        // Support images : Cloudflare R2 + imagedelivery.net + URLs classiques
        <img
          key={`${url}-${retryCount}`}
          src={url}
          alt={alt}
          className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
}