'use client';
import { useState, useEffect } from 'react';
import { d1Admin, Category } from '@/lib/d1-admin';

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    description: '',
    icon: '🏷️',
    color: '#3B82F6'
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      console.log('🏷️ Chargement des catégories...');
      
      const categoriesData = await d1Admin.getCategories();
      console.log('🏷️ Catégories chargées:', categoriesData.length);
      
      setCategories(categoriesData);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des catégories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    console.log('✏️ Édition de la catégorie:', category.name);
    setEditingCategory(category);
    setFormData(category);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: '🏷️',
      color: '#3B82F6'
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert('Veuillez entrer un nom pour la catégorie');
      return;
    }

    setIsSaving(true);
    
    try {
      const categoryData = {
        name: formData.name!,
        description: formData.description || '',
        icon: formData.icon || '🏷️',
        color: formData.color || '#3B82F6'
      };

      let result;
      if (editingCategory) {
        result = await d1Admin.updateCategory(editingCategory.id!, categoryData);
        console.log('✅ Catégorie modifiée:', result);
      } else {
        result = await d1Admin.createCategory(categoryData);
        console.log('✅ Catégorie créée:', result);
      }

      // Afficher un message de succès
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-8 py-4 rounded-lg shadow-2xl z-[9999] transition-all duration-500 border-2 border-green-400';
      successMsg.innerHTML = `
        <div class="flex items-center space-x-3">
          <div class="text-2xl">✅</div>
          <div>
            <div class="font-bold text-lg">${editingCategory ? 'Catégorie modifiée avec succès!' : 'Catégorie ajoutée avec succès!'}</div>
            <div class="text-green-100 text-sm">Disponible immédiatement dans la boutique</div>
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
      await loadCategories();
      
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

  const handleDelete = async (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    const categoryName = category?.name || 'cette catégorie';
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${categoryName}" ?\n\n⚠️ ATTENTION: Cette action est irréversible !`)) {
      try {
        console.log('🗑️ Suppression de la catégorie:', categoryId);
        
        const result = await d1Admin.deleteCategory(categoryId);
        console.log('✅ Catégorie supprimée:', result);
        
        // Mettre à jour l'interface
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
        
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] transition-all duration-300';
        successMsg.textContent = `✅ "${categoryName}" supprimée avec succès!`;
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
    }
  };

  const updateFormField = (field: keyof Category, value: any) => {
    console.log(`🔄 updateField: ${field} = "${value}"`);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-white">Chargement des catégories...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">🏷️ Gestion des Catégories</h1>
          <p className="text-gray-400 text-sm mt-1">Organisez vos produits par catégories</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-white/10 border border-white/20 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 backdrop-blur-sm shadow-lg hover:scale-[1.02] w-full sm:w-auto"
        >
          ➕ Ajouter une catégorie
        </button>
      </div>

      {/* Liste des catégories */}
      {categories.length === 0 ? (
        <div className="bg-gray-900/50 border border-white/20 rounded-xl p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Aucune catégorie trouvée</h3>
          <p className="text-gray-400 mb-4">
            Commencez par ajouter votre première catégorie.
          </p>
        </div>
      ) : (
        <div className="max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => (
              <div key={category.id} className="bg-gray-900/50 border border-white/20 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{category.icon}</span>
                    <h3 className="font-bold text-white text-xl">{category.name}</h3>
                  </div>
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-white/20"
                    style={{ backgroundColor: category.color }}
                    title={`Couleur: ${category.color}`}
                  ></div>
                </div>
              
                {category.description && (
                  <p className="text-gray-400 text-sm mb-4">{category.description}</p>
                )}
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 px-3 rounded-lg text-sm transition-all duration-200 border border-white/10"
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    onClick={() => category.id && handleDelete(category.id)}
                    className="bg-red-900/20 border border-red-400/20 hover:bg-red-900/40 text-red-400 py-2 px-3 rounded-lg text-sm transition-all duration-200"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-white/20 rounded-xl p-6 w-full max-w-md backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingCategory ? '✏️ Modifier la catégorie' : '➕ Ajouter une catégorie'}
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nom *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => updateFormField('name', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Ex: Électronique"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => updateFormField('description', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50 h-20"
                  placeholder="Description de la catégorie..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Icône</label>
                <input
                  type="text"
                  value={formData.icon || ''}
                  onChange={(e) => updateFormField('icon', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="🏷️"
                />
                <p className="text-xs text-gray-400 mt-1">Emoji ou icône pour représenter la catégorie</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Couleur</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.color || '#3B82F6'}
                    onChange={(e) => updateFormField('color', e.target.value)}
                    className="w-12 h-10 bg-gray-800 border border-white/20 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color || '#3B82F6'}
                    onChange={(e) => updateFormField('color', e.target.value)}
                    className="flex-1 bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50 font-mono text-sm"
                    placeholder="#3B82F6"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Couleur d'accent pour la catégorie</p>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex-1 ${isSaving ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'} text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 disabled:cursor-not-allowed`}
              >
                {isSaving ? '⏳ Sauvegarde...' : '💾 Sauvegarder'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
              >
                ❌ Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}