'use client';
import { useState, useEffect } from 'react';
import { d1Admin, Page } from '@/lib/d1-admin';

export default function PagesManager() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [formData, setFormData] = useState<Partial<Page>>({
    slug: '',
    title: '',
    content: '',
    is_active: true
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      console.log('📄 Chargement des pages...');
      
      const pagesData = await d1Admin.getPages();
      console.log('📄 Pages chargées:', pagesData.length);
      
      setPages(pagesData);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des pages:', error);
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (page: Page) => {
    console.log('✏️ Édition de la page:', page.title);
    setEditingPage(page);
    setFormData(page);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingPage(null);
    setFormData({
      slug: '',
      title: '',
      content: '',
      is_active: true
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.slug || !formData.title) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSaving(true);
    
    try {
      const pageData = {
        slug: formData.slug!,
        title: formData.title!,
        content: formData.content || '',
        is_active: formData.is_active || false
      };

      let result;
      if (editingPage) {
        result = await d1Admin.updatePage(editingPage.id!, pageData);
        console.log('✅ Page modifiée:', result);
      } else {
        result = await d1Admin.createPage(pageData);
        console.log('✅ Page créée:', result);
      }

      // Afficher un message de succès
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-8 py-4 rounded-lg shadow-2xl z-[9999] transition-all duration-500 border-2 border-green-400';
      successMsg.innerHTML = `
        <div class="flex items-center space-x-3">
          <div class="text-2xl">✅</div>
          <div>
            <div class="font-bold text-lg">${editingPage ? 'Page modifiée avec succès!' : 'Page ajoutée avec succès!'}</div>
            <div class="text-green-100 text-sm">Disponible immédiatement sur le site</div>
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
      await loadPages();
      
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

  const handleDelete = async (pageId: number) => {
    const page = pages.find(p => p.id === pageId);
    const pageTitle = page?.title || 'cette page';
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${pageTitle}" ?\n\n⚠️ ATTENTION: Cette action est irréversible !`)) {
      try {
        console.log('🗑️ Suppression de la page:', pageId);
        
        const result = await d1Admin.deletePage(pageId);
        console.log('✅ Page supprimée:', result);
        
        // Mettre à jour l'interface
        setPages(prev => prev.filter(p => p.id !== pageId));
        
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] transition-all duration-300';
        successMsg.textContent = `✅ "${pageTitle}" supprimée avec succès!`;
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

  const updateFormField = (field: keyof Page, value: any) => {
    console.log(`🔄 updateField: ${field} = "${value}"`);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-white">Chargement des pages...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">📄 Gestion des Pages</h1>
          <p className="text-gray-400 text-sm mt-1">Créez et gérez les pages de votre site</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-white/10 border border-white/20 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 backdrop-blur-sm shadow-lg hover:scale-[1.02] w-full sm:w-auto"
        >
          ➕ Ajouter une page
        </button>
      </div>

      {/* Liste des pages */}
      {pages.length === 0 ? (
        <div className="bg-gray-900/50 border border-white/20 rounded-xl p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Aucune page trouvée</h3>
          <p className="text-gray-400 mb-4">
            Commencez par ajouter votre première page.
          </p>
        </div>
      ) : (
        <div className="max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {pages.map((page) => (
              <div key={page.id} className="bg-gray-900/50 border border-white/20 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <h3 className="font-bold text-white text-lg">{page.title}</h3>
                      <p className="text-gray-400 text-sm">/{page.slug}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                    page.is_active ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  }`}>
                    {page.is_active ? 'Actif' : 'Inactif'}
                  </div>
                </div>
              
                {page.content && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {page.content.substring(0, 100)}...
                  </p>
                )}
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(page)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 px-3 rounded-lg text-sm transition-all duration-200 border border-white/10"
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    onClick={() => page.id && handleDelete(page.id)}
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
          <div className="bg-gray-900 border border-white/20 rounded-xl p-6 w-full max-w-2xl backdrop-blur-sm max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingPage ? '✏️ Modifier la page' : '➕ Ajouter une page'}
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Slug *</label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => updateFormField('slug', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="info, contact, about..."
                />
                <p className="text-xs text-gray-400 mt-1">URL de la page (ex: /info, /contact)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Titre *</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => updateFormField('title', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="À propos de nous"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Contenu</label>
                <textarea
                  value={formData.content || ''}
                  onChange={(e) => updateFormField('content', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50 h-40 font-mono text-sm"
                  placeholder="Contenu de la page (Markdown supporté)..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  Support Markdown: # pour les titres, **gras**, *italique*, - listes
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active || false}
                  onChange={(e) => updateFormField('is_active', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="is_active" className="text-sm text-gray-300">
                  Page active (visible sur le site)
                </label>
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