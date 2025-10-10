'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import MediaUploader from './MediaUploader';
import { parseMarkdown, renderMarkdownToJSX } from '@/lib/markdownParser';
import { d1Admin, Product, Category, Farm } from '@/lib/d1-admin';

export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    prices: '[]',
    category_id: undefined,
    farm_id: undefined,
    image_url: '',
    video_url: '',
    images: '[]',
    stock: 0,
    is_available: true,
    features: '[]',
    tags: '[]'
  });
  const [activeTab, setActiveTab] = useState<'infos' | 'media' | 'prix'>('infos');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des données...');
      
      // Charger toutes les données en parallèle
      const [productsData, categoriesData, farmsData] = await Promise.all([
        d1Admin.getProducts(),
        d1Admin.getCategories(),
        d1Admin.getFarms()
      ]);
      
      console.log('📦 Données chargées:', {
        products: productsData.length,
        categories: categoriesData.length,
        farms: farmsData.length
      });
      
      setProducts(productsData);
      setCategories(categoriesData);
      setFarms(farmsData);
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error);
      setProducts([]);
      setCategories([]);
      setFarms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    console.log('✏️ Édition du produit:', product.name);
    
    setEditingProduct(product);
    setFormData({
      ...product,
      // Convertir les JSON strings en objets pour l'édition
      prices: product.prices || '[]',
      images: product.images || '[]',
      features: product.features || '[]',
      tags: product.tags || '[]'
    });
    
    setActiveTab('infos');
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      prices: '[]',
      category_id: undefined,
      farm_id: undefined,
      image_url: '',
      video_url: '',
      images: '[]',
      stock: 0,
      is_available: true,
      features: '[]',
      tags: '[]'
    });
    setActiveTab('infos');
    setShowModal(true);
  };

  const handleSave = async () => {
    console.log('🔵 Sauvegarde du produit...');
    
    if (!formData.name || !formData.description) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    if (!formData.image_url) {
      alert('Veuillez ajouter une image au produit');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const productData = {
        name: formData.name!,
        description: formData.description!,
        price: formData.price || 0,
        prices: formData.prices || '[]',
        category_id: formData.category_id || null,
        farm_id: formData.farm_id || null,
        image_url: formData.image_url || '',
        video_url: formData.video_url || '',
        images: formData.images || '[]',
        stock: formData.stock || 0,
        is_available: formData.is_available || false,
        features: formData.features || '[]',
        tags: formData.tags || '[]'
      };

      let result;
      if (editingProduct) {
        result = await d1Admin.updateProduct(editingProduct.id!, productData);
        console.log('✅ Produit modifié:', result);
      } else {
        result = await d1Admin.createProduct(productData);
        console.log('✅ Produit créé:', result);
      }

      // Afficher un message de succès
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-8 py-4 rounded-lg shadow-2xl z-[9999] transition-all duration-500 border-2 border-green-400';
      successMsg.innerHTML = `
        <div class="flex items-center space-x-3">
          <div class="text-2xl">✅</div>
          <div>
            <div class="font-bold text-lg">${editingProduct ? 'Produit modifié avec succès!' : 'Produit ajouté avec succès!'}</div>
            <div class="text-green-100 text-sm">Les changements sont visibles immédiatement</div>
          </div>
        </div>
      `;
      document.body.appendChild(successMsg);
      
      setTimeout(() => {
        successMsg.style.opacity = '0';
        successMsg.style.transform = 'translateX(100%)';
        setTimeout(() => successMsg.remove(), 500);
      }, 4000);
      
      setShowModal(false);
      
      // Recharger les données
      await loadData();
      
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      
      const errorMsg = document.createElement('div');
      errorMsg.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999]';
      errorMsg.textContent = `❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
      document.body.appendChild(errorMsg);
      
      setTimeout(() => {
        errorMsg.remove();
      }, 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (productId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    console.log('🗑️ Suppression du produit:', productId);

    try {
      const loadingMsg = document.createElement('div');
      loadingMsg.className = 'fixed top-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] transition-all duration-300';
      loadingMsg.textContent = '⏳ Suppression en cours...';
      document.body.appendChild(loadingMsg);

      const result = await d1Admin.deleteProduct(productId);
      console.log('✅ Produit supprimé:', result);
      
      loadingMsg.remove();

      // Mettre à jour l'interface
      setProducts(prev => prev.filter(p => p.id !== productId));
      
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] transition-all duration-300';
      successMsg.textContent = '✅ Produit supprimé avec succès!';
      document.body.appendChild(successMsg);
      
      setTimeout(() => {
        successMsg.remove();
      }, 3000);

    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      
      const errorMsg = document.createElement('div');
      errorMsg.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999]';
      errorMsg.textContent = '❌ Erreur lors de la suppression';
      document.body.appendChild(errorMsg);
      
      setTimeout(() => {
        errorMsg.remove();
      }, 5000);
    }
  };

  const updateField = (field: keyof Product, value: any) => {
    console.log(`🔄 updateField: ${field} = "${value}"`);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Fonction pour parser les prix JSON
  const getPrices = (pricesJson: string) => {
    try {
      return JSON.parse(pricesJson || '[]');
    } catch {
      return [];
    }
  };

  // Fonction pour formater les prix en JSON
  const setPrices = (prices: any[]) => {
    updateField('prices', JSON.stringify(prices));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white">Chargement des produits...</div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">🛍️ Gestion des Produits</h1>
            <p className="text-gray-400 text-sm mt-1">Gestion complète des produits avec D1</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAdd}
              className="bg-white/10 border border-white/20 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 backdrop-blur-sm shadow-lg hover:scale-[1.02] w-full sm:w-auto"
            >
              ➕ Ajouter un produit
            </button>
          </div>
        </div>
      </div>

      {/* Grid de produits */}
      {products.length === 0 ? (
        <div className="bg-gray-900/50 border border-white/20 rounded-xl p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Aucun produit trouvé</h3>
          <p className="text-gray-400 mb-4">
            Commencez par ajouter votre premier produit.
          </p>
        </div>
      ) : (
        <>
          {/* Version mobile - Liste verticale */}
          <div className="block lg:hidden space-y-3">
            {products.map((product) => (
              <div key={product.id} className="bg-gray-900/50 border border-white/20 rounded-xl overflow-hidden shadow-lg backdrop-blur-sm">
                <div className="flex items-center p-3 space-x-3">
                  {/* Image compacte */}
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-400 text-lg">📷</span>
                      </div>
                    )}
                    <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center ${
                      product.is_available ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                      {product.is_available ? '✓' : '✗'}
                    </div>
                  </div>
                  
                  {/* Infos principales */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm truncate uppercase tracking-wide">
                      {product.name}
                    </h3>
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                      {categories.find(c => c.id === product.category_id)?.name || 'Sans catégorie'}
                    </p>
                    
                    {/* Prix compacts */}
                    <div className="flex flex-wrap gap-1">
                      {getPrices(product.prices || '[]').slice(0, 3).map((price: any, index: number) => (
                        <span key={index} className="bg-white/10 text-white text-xs px-2 py-1 rounded">
                          {price.quantity}: {price.price}€
                        </span>
                      ))}
                      {getPrices(product.prices || '[]').length > 3 && (
                        <span className="text-gray-500 text-xs">+{getPrices(product.prices || '[]').length - 3}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Boutons d'action compacts */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(product)}
                      className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all duration-200 border border-white/10"
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => product.id && handleDelete(product.id)}
                      className="bg-red-900/20 border border-red-400/20 hover:bg-red-900/40 text-red-400 p-2 rounded-lg transition-all duration-200"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Version desktop - Grille */}
          <div className="hidden lg:grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <div key={product.id} className="bg-gray-900/50 border border-white/20 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm">
                <div className="relative h-32">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-400 text-2xl">📷</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-white/90 text-black text-xs font-bold px-2 py-1 rounded-md">
                    {categories.find(c => c.id === product.category_id)?.name || 'Sans catégorie'}
                  </div>
                  {product.video_url && (
                    <div className="absolute top-2 right-2 bg-black/80 text-white p-1 rounded-full">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                    </div>
                  )}
                  <div className={`absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${
                    product.is_available ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  }`}>
                    {product.is_available ? '✅' : '❌'}
                  </div>
                </div>
                
                <div className="p-3">
                  <h3 className="font-bold text-white text-sm mb-1 uppercase tracking-wide">
                    {product.name}
                  </h3>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
                    Stock: {product.stock}
                  </p>
                  
                  {/* Prix principaux */}
                  <div className="mb-3">
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {getPrices(product.prices || '[]').slice(0, 4).map((price: any, index: number) => (
                        <div key={index} className="flex justify-between text-gray-300">
                          <span>{price.quantity}</span>
                          <span className="font-medium">{price.price}€</span>
                        </div>
                      ))}
                    </div>
                    {getPrices(product.prices || '[]').length > 4 && (
                      <p className="text-gray-500 text-xs mt-1">+{getPrices(product.prices || '[]').length - 4} prix...</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-3 rounded-lg text-xs transition-all duration-200 border border-white/10"
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      onClick={() => product.id && handleDelete(product.id)}
                      className="bg-red-900/20 border border-red-400/20 hover:bg-red-900/40 text-red-400 font-medium py-2 px-3 rounded-lg text-xs transition-all duration-200"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal d'édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 flex items-start justify-center p-0 sm:p-4 z-[99999] overflow-y-auto lg:items-center">
          <div className="bg-gray-900 border-0 sm:border border-white/20 rounded-none sm:rounded-xl w-full max-w-4xl my-0 lg:my-4 backdrop-blur-sm min-h-[100vh] sm:min-h-0 sm:max-h-[95vh] flex flex-col pb-20 sm:pb-0">
            {/* Header fixe */}
            <div className="p-3 sm:p-6 border-b border-white/20 flex-shrink-0 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {editingProduct ? '✏️ Modifier le produit' : '➕ Ajouter un produit'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="sm:hidden bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-all duration-300"
              >
                ✕
              </button>
            </div>

            {/* Contenu scrollable */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6">
              {/* Navigation par onglets sur mobile */}
              <div className="sm:hidden mb-4">
                <div className="flex border-b border-white/20">
                  <button
                    onClick={() => setActiveTab('infos')}
                    className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${
                      activeTab === 'infos' 
                        ? 'text-white border-b-2 border-white' 
                        : 'text-gray-400'
                    }`}
                  >
                    📝 Infos
                  </button>
                  <button
                    onClick={() => setActiveTab('media')}
                    className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${
                      activeTab === 'media' 
                        ? 'text-white border-b-2 border-white' 
                        : 'text-gray-400'
                    }`}
                  >
                    🖼️ Média
                  </button>
                  <button
                    onClick={() => setActiveTab('prix')}
                    className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${
                      activeTab === 'prix' 
                        ? 'text-white border-b-2 border-white' 
                        : 'text-gray-400'
                    }`}
                  >
                    💰 Prix
                  </button>
                </div>
              </div>

              {/* Vue desktop - colonnes */}
              <div className="hidden sm:grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Informations de base */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Informations de base</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nom du produit *</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => updateField('name', e.target.value)}
                      className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="COOKIES GELATO"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => updateField('description', e.target.value)}
                      className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50 h-20"
                      placeholder="Description du produit..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Catégorie</label>
                    <select
                      value={formData.category_id || ''}
                      onChange={(e) => updateField('category_id', e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Ferme/Fournisseur</label>
                    <select
                      value={formData.farm_id || ''}
                      onChange={(e) => updateField('farm_id', e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                      <option value="">Sélectionner une ferme</option>
                      {farms.map((farm) => (
                        <option key={farm.id} value={farm.id}>{farm.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Stock</label>
                    <input
                      type="number"
                      value={formData.stock || 0}
                      onChange={(e) => updateField('stock', parseInt(e.target.value) || 0)}
                      className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                      min="0"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_available"
                      checked={formData.is_available || false}
                      onChange={(e) => updateField('is_available', e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="is_available" className="text-sm text-gray-300">Produit disponible</label>
                  </div>
                </div>

                {/* Média et prix */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Média</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Image du produit *</label>
                    <MediaUploader
                      onMediaSelected={(url, type) => {
                        if (type === 'image') {
                          updateField('image_url', url);
                        }
                      }}
                      acceptedTypes="image/*"
                      className="mb-3"
                    />
                    <input
                      type="text"
                      value={formData.image_url || ''}
                      onChange={(e) => updateField('image_url', e.target.value)}
                      className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="URL complète de l'image (https://...)"
                    />
                    {formData.image_url && (
                      <div className="mt-3">
                        <div className="text-xs text-gray-400 mb-2">Aperçu :</div>
                        <div className="w-32 h-20 rounded border border-white/20 overflow-hidden">
                          <img 
                            src={formData.image_url} 
                            alt="Aperçu image" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Vidéo du produit (optionnel)</label>
                    <MediaUploader
                      onMediaSelected={(url, type) => {
                        if (type === 'video') {
                          updateField('video_url', url);
                        }
                      }}
                      acceptedTypes="video/*"
                      className="mb-3"
                    />
                    <input
                      type="text"
                      value={formData.video_url || ''}
                      onChange={(e) => updateField('video_url', e.target.value)}
                      className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="URL complète de la vidéo (https://...)"
                    />
                    {formData.video_url && (
                      <div className="mt-3">
                        <div className="text-xs text-gray-400 mb-2">Aperçu :</div>
                        <div className="w-32 h-20 rounded border border-white/20 overflow-hidden">
                          <video 
                            src={formData.video_url} 
                            className="w-full h-full object-cover"
                            controls
                            muted
                            preload="metadata"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Vue mobile - onglets */}
              <div className="sm:hidden space-y-4">
                {/* Onglet Infos */}
                {activeTab === 'infos' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Nom du produit *</label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => updateField('name', e.target.value)}
                        className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                        placeholder="COOKIES GELATO"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => updateField('description', e.target.value)}
                        className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50 h-20"
                        placeholder="Description du produit..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Catégorie</label>
                      <select
                        value={formData.category_id || ''}
                        onChange={(e) => updateField('category_id', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                      >
                        <option value="">Sélectionner une catégorie</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Ferme/Fournisseur</label>
                      <select
                        value={formData.farm_id || ''}
                        onChange={(e) => updateField('farm_id', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                      >
                        <option value="">Sélectionner une ferme</option>
                        {farms.map((farm) => (
                          <option key={farm.id} value={farm.id}>{farm.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Stock</label>
                      <input
                        type="number"
                        value={formData.stock || 0}
                        onChange={(e) => updateField('stock', parseInt(e.target.value) || 0)}
                        className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                        min="0"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_available_mobile"
                        checked={formData.is_available || false}
                        onChange={(e) => updateField('is_available', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="is_available_mobile" className="text-sm text-gray-300">Produit disponible</label>
                    </div>
                  </div>
                )}

                {/* Onglet Média */}
                {activeTab === 'media' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Image du produit *</label>
                      <MediaUploader
                        onMediaSelected={(url, type) => {
                          if (type === 'image') {
                            updateField('image_url', url);
                          }
                        }}
                        acceptedTypes="image/*"
                        className="mb-3"
                      />
                      <input
                        type="text"
                        value={formData.image_url || ''}
                        onChange={(e) => updateField('image_url', e.target.value)}
                        className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                        placeholder="URL complète de l'image (https://...)"
                      />
                      {formData.image_url && (
                        <img 
                          src={formData.image_url} 
                          alt="Aperçu" 
                          className="w-32 h-20 object-cover rounded border border-white/20 mt-2"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Vidéo (optionnel)</label>
                      <MediaUploader
                        onMediaSelected={(url, type) => {
                          if (type === 'video') {
                            updateField('video_url', url);
                          }
                        }}
                        acceptedTypes="video/*"
                        className="mb-3"
                      />
                      <input
                        type="text"
                        value={formData.video_url || ''}
                        onChange={(e) => updateField('video_url', e.target.value)}
                        className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                        placeholder="URL complète de la vidéo (https://...)"
                      />
                      {formData.video_url && (
                        <video 
                          src={formData.video_url} 
                          className="w-32 h-20 object-cover rounded border border-white/20 mt-2"
                          controls
                          muted
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Onglet Prix */}
                {activeTab === 'prix' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Prix de base (€)</label>
                      <input
                        type="number"
                        value={formData.price || 0}
                        onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                        className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                        step="0.01"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Prix multiples (JSON)</label>
                      <textarea
                        value={formData.prices || '[]'}
                        onChange={(e) => updateField('prices', e.target.value)}
                        className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50 h-32 font-mono text-sm"
                        placeholder='[{"quantity": "3g", "price": 15}, {"quantity": "5g", "price": 25}]'
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Format JSON pour les prix multiples. Exemple: [{"quantity": "3g", "price": 15}]
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Boutons fixes en bas */}
            <div className="p-3 sm:p-4 lg:p-6 border-t border-white/20 bg-gray-900 flex-shrink-0 rounded-b-xl sticky bottom-0">
              <div className="flex gap-2 sm:gap-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex-1 ${isSaving ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'} text-white font-bold py-2 sm:py-3 px-3 sm:px-4 lg:px-6 rounded-lg lg:rounded-xl transition-all duration-300 shadow-lg text-xs sm:text-sm lg:text-base disabled:cursor-not-allowed`}
                >
                  {isSaving ? '⏳ Sauvegarde...' : '💾 Sauvegarder'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 sm:py-3 px-3 sm:px-4 lg:px-6 rounded-lg lg:rounded-xl transition-all duration-300 text-xs sm:text-sm lg:text-base"
                >
                  ❌ Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}