'use client';
import { useState, useEffect, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
// Redéploiement forcé - Nouveau chargement LANATIONDULAIT
import CategoryFilter from '../components/CategoryFilter';
import ProductCard, { Product } from '../components/ProductCard';
import ProductDetail from '../components/ProductDetail';
import BottomNav from '../components/BottomNav';
import contentCache from '../lib/contentCache';
import { useAdminSync } from '../hooks/useAdminSync';
export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('Toutes les catégories');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('menu');
  const router = useRouter();
  
  // Précharger les autres pages pour navigation instantanée
  useEffect(() => {
    router.prefetch('/info');
    router.prefetch('/contact');
    router.prefetch('/social');
  }, [router]);
  
  // États pour les données - Initialiser avec des valeurs par défaut
  const [loading, setLoading] = useState(true); // Toujours true au départ
  const [settings, setSettings] = useState<any>(null);


  // Charger les settings immédiatement pour l'image de chargement
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Essayer d'abord le localStorage
        const cached = localStorage.getItem('shopSettings');
        if (cached) {
          setSettings(JSON.parse(cached));
        }
        
        // Puis charger depuis l'API
        const settingsRes = await fetch('/api/cloudflare/settings', { cache: 'no-store' });
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData);
          localStorage.setItem('shopSettings', JSON.stringify(settingsData));
        }
      } catch (error) {
        console.error('Erreur chargement settings:', error);
      }
    };
    
    loadSettings();
  }, []);
  
  // Gérer la logique de première visite côté client uniquement
  useEffect(() => {
    // Vérifier si c'est la première visite
    const hasVisited = sessionStorage.getItem('hasVisited');
    if (hasVisited) {
      // Si déjà visité, cacher le chargement immédiatement
      setLoading(false);
    } else {
      // Si première visite, marquer comme visité
      sessionStorage.setItem('hasVisited', 'true');
    }
  }, []); // Ne s'exécute qu'une fois au montage
  
  // Charger le thème depuis l'API au démarrage
  useEffect(() => {
    const loadThemeForNewVisitors = async () => {
      try {
        // Charger les paramètres depuis l'API pour les nouveaux visiteurs
        const settingsRes = await fetch('/api/cloudflare/settings', { cache: 'no-store' });
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData); // Sauvegarder dans l'état
          
          // Sauvegarder dans localStorage pour les prochaines visites
          localStorage.setItem('shopSettings', JSON.stringify(settingsData));
          
          // Appliquer le thème immédiatement
          if (settingsData.backgroundImage) {
            const style = document.createElement('style');
            style.id = 'dynamic-theme-new-visitor';
            style.textContent = `
              html, body, .main-container {
                background-image: url(${settingsData.backgroundImage}) !important;
                background-size: cover !important;
                background-position: center !important;
                background-repeat: no-repeat !important;
                background-attachment: fixed !important;
              }
              .global-overlay {
                background-color: rgba(0, 0, 0, ${(settingsData.backgroundOpacity || 20) / 100}) !important;
                backdrop-filter: blur(${settingsData.backgroundBlur || 5}px) !important;
              }
            `;
            document.head.appendChild(style);
          }
        }
      } catch (error) {
        console.error('Erreur chargement thème:', error);
      }
    };
    
    // Charger le thème immédiatement pour les nouveaux visiteurs
    if (!localStorage.getItem('shopSettings')) {
      loadThemeForNewVisitors();
    }
  }, []);

  // Charger immédiatement depuis l'API - PAS depuis localStorage
  const getInitialProducts = () => {
    // Toujours retourner un tableau vide pour forcer le chargement depuis l'API
    return [];
  };
  
  const getInitialCategories = () => {
    // Toujours retourner les catégories par défaut pour forcer le chargement depuis l'API
    return ['Toutes les catégories'];
  };
  
  const [products, setProducts] = useState<Product[]>(getInitialProducts());
  const [categories, setCategories] = useState<string[]>(getInitialCategories());

  // Fonction de rechargement des données
  const loadAllData = async () => {
    try {
      console.log('🔄 Rechargement données...');
      
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/cloudflare/products', { cache: 'no-store' }),
        fetch('/api/cloudflare/categories', { cache: 'no-store' })
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        console.log('📦 Produits:', productsData.length);
        setProducts(productsData);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        console.log('🏷️ Catégories:', categoriesData.length);
        setCategories(['Toutes les catégories', ...categoriesData.map((c: any) => c.name)]);
      }

    } catch (error) {
      console.error('❌ Erreur chargement LANATIONDULAIT:', error);
      setProducts([]);
      setCategories(['Toutes les catégories']);
    }
  };

  // Synchronisation avec l'admin
  useAdminSync(loadAllData);



  // CHARGEMENT INSTANTANÉ DEPUIS L'API (DONNÉES FRAÎCHES)
  useEffect(() => {
    // Charger IMMÉDIATEMENT depuis l'API pour données fraîches
    loadAllData();
    
    // Cacher le chargement après délai
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 3000);
    
    // Rafraîchir les données moins souvent pour éviter de perturber l'admin
    const interval = setInterval(() => {
      loadAllData();
    }, 60000); // 1 minute au lieu de 2 secondes
    
    return () => {
      clearTimeout(loadingTimeout);
      clearInterval(interval);
    };
  }, []);

  // Écouter les mises à jour du cache (produits et catégories uniquement)
  useEffect(() => {
    const handleCacheUpdate = (event: CustomEvent) => {
      const { products: newProducts, categories: newCategories } = event.detail;
      if (newProducts) setProducts(newProducts);
      if (newCategories) setCategories(['Toutes les catégories', ...newCategories.map((c: any) => c.name)]);
    };
    window.addEventListener('cacheUpdated', handleCacheUpdate as EventListener);
    return () => {
      window.removeEventListener('cacheUpdated', handleCacheUpdate as EventListener);
    };
  }, []);

  // Filtrage des produits
  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === 'Toutes les catégories' || product.category === selectedCategory;
    return categoryMatch;
  });

  const handleTabChange = (tabId: string) => {
    if (tabId === 'social') {
      router.push('/social');
    } else if (tabId === 'infos') {
      router.push('/info');
    } else if (tabId === 'contact') {
      router.push('/contact');
    } else {
      setActiveTab(tabId);
      if (tabId === 'menu') {
        setSelectedProduct(null);
      }
    }
  };

  // Écran de chargement cyberpunk
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden cyber-bg">
        {/* Background cyberpunk */}
        <div className="absolute inset-0 bg-black"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-neon-green/10 via-transparent to-neon-cyan/10 animate-neonGlow"></div>
        
        {/* Lignes de scan */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-neon-green to-transparent animate-scanLine"></div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-neon-cyan to-transparent animate-scanLine" style={{ animationDelay: '1s' }}></div>
        
        {/* Contenu de chargement cyberpunk */}
        <div className="relative z-10 text-center card-cyber p-12 max-w-lg mx-auto animate-fadeIn">
          {/* Logo cyberpunk */}
          <div className="w-20 h-20 mx-auto mb-8 bg-black border-2 border-neon-green rounded flex items-center justify-center animate-neonGlow">
            <span className="neon-text font-bold text-3xl">L</span>
          </div>
          
          {/* Titre cyberpunk */}
          <h1 className="text-4xl font-black neon-text mb-8 animate-cyberFloat">
            LANATION DU LAIT
          </h1>
          
          {/* Barre de chargement cyberpunk */}
          <div className="w-80 max-w-full mx-auto mb-8">
            <div className="h-3 bg-black border border-neon-green rounded overflow-hidden">
              <div className="h-full bg-gradient-to-r from-neon-green to-neon-cyan rounded animate-pulse relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-scanLine"></div>
              </div>
            </div>
            <div className="mt-3 text-sm neon-text-cyan font-medium animate-pulse">
              [LOADING] SYSTEM INITIALIZING...
            </div>
          </div>
          
          {/* Animation de points cyberpunk */}
          <div className="flex justify-center gap-2 mb-8">
            <div className="w-2 h-2 bg-neon-green rounded-full animate-bounce animate-neonGlow" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce animate-neonGlow" style={{ animationDelay: '200ms' }}></div>
            <div className="w-2 h-2 bg-neon-magenta rounded-full animate-bounce animate-neonGlow" style={{ animationDelay: '400ms' }}></div>
          </div>
          
          {/* Footer cyberpunk */}
          <div className="neon-text-cyan text-sm font-medium">
                <p>LANATIONDULAIT</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }





  // Structure cyberpunk
  return (
    <div className="min-h-screen relative cyber-bg">
      {/* Background cyberpunk */}
      <div className="fixed inset-0 bg-black"></div>
      <div className="fixed inset-0 bg-gradient-to-br from-neon-green/5 via-transparent to-neon-cyan/5 animate-neonGlow"></div>
      
      {/* Lignes de scan */}
      <div className="fixed top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-neon-green to-transparent animate-scanLine"></div>
      <div className="fixed bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-neon-cyan to-transparent animate-scanLine" style={{ animationDelay: '2s' }}></div>
      
      {/* Contenu principal */}
      <div className="relative z-10">
        <Header />
        
        {/* Contenu principal avec espacement pour le header */}
        <div className="pt-24 sm:pt-28 md:pt-32">
          {selectedProduct ? (
            <ProductDetail 
              product={selectedProduct} 
              onClose={() => setSelectedProduct(null)} 
            />
          ) : (
            <div className="animate-fadeIn">
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
              
              <main className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Affichage des produits cyberpunk */}
                {filteredProducts.length === 0 && products.length > 0 ? (
                  <div className="text-center py-16">
                    <div className="card-cyber p-8 max-w-md mx-auto">
                      <div className="text-6xl mb-4 neon-text-cyan animate-cyberFloat">[ERROR]</div>
                      <h3 className="text-xl font-bold neon-text mb-2">NO DATA FOUND</h3>
                      <p className="neon-text-cyan">
                        NO PRODUCTS MATCH YOUR SEARCH CRITERIA
                      </p>
                    </div>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product, index) => (
                      <div 
                        key={product._id}
                        className="animate-fadeIn"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <ProductCard
                          product={product}
                          onClick={() => setSelectedProduct(product)}
                      />
                    ))}
                  </div>
                ) : null}
                </main>
              </div>
            )}
        </div>
      </div>
      
      {/* BottomNav toujours visible - en dehors du content-layer */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

    </div>
  );
}