'use client';
import { useState, useEffect } from 'react';
import MediaUploader from './MediaUploader';
import { d1Admin, Product, Category } from '@/lib/d1-admin';

export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    prices: '[]',
    category_id: undefined,
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
      console.log('Chargement des données...');
      
      const [productsData, categoriesData] = await Promise.all([
        d1Admin.getProducts(),
        d1Admin.getCategories()
      ]);
      
      console.log('Données chargées:', {
        products: productsData.length,
        categories: categoriesData.length
      });
      
      setProducts(productsData);
      setCategories(categoriesData);
      
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    console.log('Edition du produit:', product.name);
    
    setEditingProduct(product);
    setFormData({
      ...product,
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
    console.log('Sauvegarde du produit...');
    
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
        console.log('Produit modifié:', result);
      } else {
        result = await d1Admin.createProduct(productData);
        console.log('Produit créé:', result);
      }

      setShowModal(false);
      await loadData();
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (productId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    try {
      await d1Admin.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const updateField = (field: keyof Product, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getPrices = (pricesJson: string) => {
    try {
      return JSON.parse(pricesJson || '[]');
    } catch {
      return [];
    }
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
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Gestion des Produits</h1>
            <p className="text-gray-400 text-sm mt-1">Gestion complète des produits avec D1</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAdd}
              className="bg-white/10 border border-white/20 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 backdrop-blur-sm shadow-lg hover:scale-[1.02] w-full sm:w-auto"
            >
              + Ajouter un produit
            </button>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-gray-900/50 border border-white/20 rounded-xl p-8 text-center">
          <h3 className="text-lg font-bold text-white mb-2">Aucun produit trouvé</h3>
          <p className="text-gray-400 mb-4">
            Commencez par ajouter votre premier produit.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-gray-900/50 border border-white/20 rounded-xl overflow-hidden shadow-lg">
              <div className="relative h-32">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-400 text-2xl">IMG</span>
                  </div>
                )}
                <div className={`absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${
                  product.is_available ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}>
                  {product.is_available ? 'OK' : 'NO'}
                </div>
              </div>
              
              <div className="p-3">
                <h3 className="font-bold text-white text-sm mb-1 uppercase tracking-wide">
                  {product.name}
                </h3>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
                  Stock: {product.stock}
                </p>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-3 rounded-lg text-xs transition-all duration-200 border border-white/10"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => product.id && handleDelete(product.id)}
                    className="bg-red-900/20 border border-red-400/20 hover:bg-red-900/40 text-red-400 font-medium py-2 px-3 rounded-lg text-xs transition-all duration-200"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[99999]">
          <div className="bg-gray-900 border border-white/20 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/20">
              <h2 className="text-xl font-bold text-white">
                {editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nom du produit *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Nom du produit"
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Image du produit *</label>
                <input
                  type="text"
                  value={formData.image_url || ''}
                  onChange={(e) => updateField('image_url', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="URL de l'image (https://...)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Prix (€)</label>
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

            <div className="p-6 border-t border-white/20 flex gap-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex-1 ${isSaving ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'} text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:cursor-not-allowed`}
              >
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}