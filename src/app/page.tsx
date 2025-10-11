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

  // Écran de chargement moderne
  if (loading) {
    return (
      <div className="main-container">
        <div className="global-overlay"></div>
        <div className="content-layer">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center card-modern p-8 sm:p-12 max-w-lg mx-auto animate-fade-in-up">

              {/* Titre principal noir et blanc */}
              <div className="text-4xl sm:text-5xl md:text-6xl font-black mb-12 leading-tight text-center">
                <div className="bw-title">LA NATION</div>
                <div className="bw-title">DU LAIT</div>
              </div>
              
              {/* Barre de chargement noir et blanc */}
              <div className="w-80 max-w-full mx-auto mb-8">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-soft">
                  <div className="h-full bg-gradient-to-r from-black via-gray-600 to-black rounded-full animate-loading-bar relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                  </div>
                </div>
                <div className="mt-3 text-sm bw-text-accent font-bold animate-pulse">Chargement du menu...</div>
              </div>
              
              {/* Animation de particules noir et blanc */}
              <div className="flex justify-center gap-3 mb-8">
                <div className="w-3 h-3 bg-black rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '200ms' }}></div>
                <div className="w-3 h-3 bg-gray-600 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '400ms' }}></div>
              </div>
              
              {/* Footer noir et blanc */}
              <div className="bw-text-secondary text-sm font-bold">
                <p>LANATIONDULAIT</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }





  // Structure avec fond toujours visible
  return (
    <div className="main-container">
      {/* Overlay global toujours présent */}
      <div className="global-overlay"></div>
      
      {/* Contenu principal avec navigation */}
      <div className="content-layer">
        <Header />
        
        {/* Ajouter un padding-top pour compenser le header fixe */}
        <div className="pt-24 sm:pt-28 md:pt-32">
            {selectedProduct ? (
              <ProductDetail 
                product={selectedProduct} 
                onClose={() => setSelectedProduct(null)} 
              />
            ) : (
              <div className="pt-2">
                <CategoryFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                />
                
                <main className="pt-3 pb-24 sm:pb-28 px-3 sm:px-4 lg:px-6 xl:px-8 max-w-7xl mx-auto">

                {/* Section promotions en vedette */}
                {(() => {
                  const promoProducts = filteredProducts.filter(product => 
                    product.promotions && Object.values(product.promotions).some(promo => promo > 0)
                  );
                  
                  if (promoProducts.length > 0 && selectedCategory === 'Toutes les catégories') {
                    return (
                      <div className="mb-8">
                        {/* Titre des promotions noir et blanc */}
                        <div className="text-center mb-6">
                          <h2 className="text-2xl sm:text-3xl font-black bw-title promo-bounce mb-2">
                            🔥 PROMOTIONS EXCLUSIVES 🔥
                          </h2>
                          <p className="bw-text-secondary text-sm promo-float">
                            Offres limitées - Ne ratez pas ces bonnes affaires !
                          </p>
                        </div>
                        
                        {/* Grille des promotions */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                          {promoProducts.slice(0, 3).map((product, index) => (
                            <div 
                              key={product._id}
                              className="animate-fade-in-up"
                              style={{ animationDelay: `${index * 0.2}s` }}
                            >
                              <ProductCard
                                product={product}
                                onClick={() => setSelectedProduct(product)}
                              />
                            </div>
                          ))}
                        </div>
                        
                        {/* Séparateur élégant noir et blanc */}
                        <div className="flex items-center justify-center mb-8">
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
                          <div className="mx-4 bw-text-muted text-sm font-bold">Tous les produits</div>
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Affichage des produits noir et blanc */}
                {filteredProducts.length === 0 && products.length > 0 ? (
                  <div className="text-center py-12">
                    <div className="bw-container p-8 max-w-md mx-auto">
                      <div className="text-6xl mb-4">🔍</div>
                      <p className="bw-text-secondary text-lg font-bold">
                        Aucun produit ne correspond à vos critères de recherche
                      </p>
                    </div>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                    {filteredProducts.map((product, index) => (
                      <div 
                        key={product._id}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <ProductCard
                          product={product}
                          onClick={() => setSelectedProduct(product)}
                        />
                      </div>
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