'use client';
import { useState, useEffect } from 'react';
import contentCache from '@/lib/contentCache';
import { useCartStore } from '@/lib/cartStore';
import { ShoppingCart } from 'lucide-react';

interface Settings {
  shopTitle: string;
  shopSubtitle: string;
  bannerText: string;
  titleEffect: string;
  scrollingText: string;
}

export default function Header() {
  const { getTotalItems, setIsOpen } = useCartStore();
  const totalItems = getTotalItems();
  
  const [settings, setSettings] = useState(null); // null = pas encore chargé
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger les settings depuis l'API Cloudflare
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/cloudflare/settings');
        if (response.ok) {
          const data = await response.json();
          console.log('📝 Header - Settings chargés:', data);
          
          setSettings({
            shopTitle: data.shop_name || 'LANATION DU LAIT',
            shopSubtitle: '', // Pas de sous-titre
            scrollingText: data.scrolling_text || '',
            bannerText: '', // Pas de bandeau contact dans header
            titleStyle: data.theme_color || 'glow',
            backgroundImage: data.background_image || ''
          });
          setIsLoaded(true);
        }
      } catch (error) {
        console.error('Erreur chargement settings Header:', error);
      }
    };

    loadSettings();
    
    // Vider seulement le cache problématique
    localStorage.removeItem('adminSettings');
    
    // Recharger périodiquement pour synchronisation
    const interval = setInterval(loadSettings, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Mise à jour en arrière-plan (pas prioritaire)
    setTimeout(() => {
      fetch('/api/settings')
        .then(res => res.json())
        .then(data => {
          setSettings({
            shopTitle: data.shopTitle || '',
            shopSubtitle: data.shopSubtitle || '',
            scrollingText: data.scrollingText || '',
            bannerText: data.bannerText || '',
            titleStyle: data.titleStyle || 'glow'
          });
          // Sauvegarder pour la prochaine fois
          localStorage.setItem('adminSettings', JSON.stringify(data));
        })
        .catch(() => {});
    }, 50);
  }, []);

  const getTitleClass = () => {
    const baseClass = "text-responsive-lg sm:text-responsive-xl md:text-responsive-2xl font-black tracking-wider transition-all duration-300 text-center line-height-tight";
    
    switch (settings.titleStyle) {
      case 'gradient':
        return `${baseClass} bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent`;
      case 'neon':
        return `${baseClass} text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]`;
      case 'rainbow':
        return `${baseClass} bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-pulse`;
      case 'glow':
        return `${baseClass} text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]`;
      case 'shadow':
        return `${baseClass} text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)]`;
      case 'bounce':
        return `${baseClass} text-white animate-bounce`;
      case 'graffiti':
        return `graffiti-text text-responsive-lg sm:text-responsive-xl md:text-responsive-2xl font-normal`;
      default:
        return `${baseClass} text-white`;
    }
  };

  return (
    <header className="fixed top-0 w-full z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 safe-area-padding">
      {/* N'afficher que si les données sont chargées */}
      {isLoaded && settings && (
        <>
          {/* Texte défilant moderne */}
          {settings.scrollingText && settings.scrollingText.trim() && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 overflow-hidden relative">
              <div className="animate-marquee whitespace-nowrap inline-block">
                <span className="text-sm font-semibold px-4">
                  ✨ {settings.scrollingText} ✨
                </span>
              </div>
            </div>
          )}
          
          {/* Header principal moderne */}
          <div className="py-4 px-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              {/* Logo/Titre */}
              <div className="flex items-center">
                {settings.backgroundImage ? (
                  <div className="relative">
                    <img 
                      src={settings.backgroundImage} 
                      alt="LANATION DU LAIT" 
                      className="h-12 w-auto rounded-xl shadow-md"
                    />
                  </div>
                ) : (
                  <h1 className="text-2xl font-bold gradient-text">
                    {settings.shopTitle || 'LANATION DU LAIT'}
                  </h1>
                )}
              </div>
              
              {/* Bouton panier moderne */}
              <button
                onClick={() => setIsOpen(true)}
                className="modern-button flex items-center gap-2 relative"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Panier</span>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 modern-badge min-w-[20px] h-5 flex items-center justify-center text-xs">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
}