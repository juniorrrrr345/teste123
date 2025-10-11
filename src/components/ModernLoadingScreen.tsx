'use client';
import { useState, useEffect } from 'react';

interface ModernLoadingScreenProps {
  title?: string;
  subtitle?: string;
  showProgress?: boolean;
  progress?: number;
}

export default function ModernLoadingScreen({ 
  title = "LANATION DU LAIT", 
  subtitle = "Chargement en cours...",
  showProgress = true,
  progress = 0
}: ModernLoadingScreenProps) {
  const [currentProgress, setCurrentProgress] = useState(0);

  useEffect(() => {
    if (showProgress) {
      const interval = setInterval(() => {
        setCurrentProgress(prev => {
          if (prev >= 100) return 100;
          return prev + Math.random() * 15;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [showProgress]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white flex items-center justify-center p-4">
      <div className="text-center bw-container p-8 sm:p-12 max-w-lg mx-auto animate-fade-in-up">
        {/* Logo/Titre principal */}
        <div className="mb-12">
          <div className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight">
            <div className="bw-title">{title}</div>
          </div>
        </div>
        
        {/* Barre de progression moderne */}
        {showProgress && (
          <div className="w-80 max-w-full mx-auto mb-8">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-soft">
              <div 
                className="h-full bg-gradient-to-r from-black via-gray-600 to-black rounded-full transition-all duration-500 ease-out relative"
                style={{ width: `${Math.min(currentProgress, 100)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
            <div className="mt-3 text-sm bw-text-accent font-bold animate-pulse">
              {subtitle}
            </div>
          </div>
        )}
        
        {/* Animation de particules */}
        <div className="flex justify-center gap-3 mb-8">
          <div className="w-3 h-3 bg-black rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '200ms' }}></div>
          <div className="w-3 h-3 bg-gray-600 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '400ms' }}></div>
        </div>
        
        {/* Footer */}
        <div className="bw-text-secondary text-sm font-bold">
          <p>LANATIONDULAIT</p>
        </div>
      </div>
    </div>
  );
}