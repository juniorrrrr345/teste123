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
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
        {/* Background avec dégradé */}
        <div className="absolute inset-0 gradient-bg opacity-5"></div>
        
        {/* Contenu de chargement moderne */}
        <div className="relative z-10 text-center modern-card p-12 max-w-lg mx-auto animate-fadeIn">
          {/* Logo moderne */}
          <div className="w-20 h-20 mx-auto mb-8 gradient-bg rounded-2xl flex items-center justify-center animate-gentleFloat">
            <span className="text-white font-bold text-3xl">L</span>
          </div>
          
          {/* Titre moderne */}
          <h1 className="text-4xl font-black gradient-text mb-8 animate-fadeIn">
            LANATION DU LAIT
          </h1>
          
          {/* Barre de chargement moderne */}
          <div className="w-80 max-w-full mx-auto mb-8">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full gradient-bg rounded-full animate-pulse relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600 font-medium animate-pulse">
              Chargement du menu...
            </div>
          </div>
          
          {/* Animation de points moderne */}
          <div className="flex justify-center gap-2 mb-8">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
            <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
          </div>
          
          {/* Footer moderne */}
          <div className="text-gray-500 text-sm font-medium">
                <p>LANATIONDULAIT</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }





  // Nouvelle structure moderne
  return (
    <div className="min-h-screen relative" style={{ background: 'var(--bg-secondary)' }}>
      {/* Header moderne */}
      <Header />
      
      {/* Layout principal avec sidebar */}
      <div className="flex">
        {/* Sidebar pour les catégories */}
        <div className="hidden lg:block w-64 sidebar min-h-screen pt-20">
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Catégories</h2>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`sidebar-item w-full text-left ${
                    selectedCategory === category ? 'active' : ''
                  }`}
                >
                  <span className="text-sm font-medium">
                    {category.replace(/\s*📦\s*/g, '').trim()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Contenu principal */}
        <div className="flex-1 pt-20">
          {selectedProduct ? (
            <ProductDetail 
              product={selectedProduct} 
              onClose={() => setSelectedProduct(null)} 
            />
          ) : (
            <div className="animate-fadeIn">
              {/* Mobile category filter */}
              <div className="lg:hidden p-4">
                <CategoryFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                />
              </div>
              
              <main className="py-6 px-4 sm:px-6 lg:px-8">
                {/* Hero section */}
                <div className="text-center mb-12">
                  <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-4">
                    Découvrez nos produits
                  </h1>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Une sélection soigneusement choisie pour vous offrir le meilleur
                  </p>
                </div>
                
                {/* Affichage des produits moderne */}
                {filteredProducts.length === 0 && products.length > 0 ? (
                  <div className="text-center py-16">
                    <div className="modern-card p-8 max-w-md mx-auto">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Aucun produit trouvé</h3>
                      <p className="text-gray-600">
                        Aucun produit ne correspond à vos critères de recherche
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