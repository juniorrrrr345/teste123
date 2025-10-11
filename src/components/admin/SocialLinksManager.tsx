'use client';
import { useState, useEffect } from 'react';
import { d1Admin, SocialLink } from '@/lib/d1-admin';

export default function SocialLinksManager() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [formData, setFormData] = useState<Partial<SocialLink>>({
    name: '',
    url: '',
    icon: '🔗',
    is_active: true,
    sort_order: 0
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSocialLinks();
  }, []);

  const loadSocialLinks = async () => {
    try {
      setLoading(true);
      console.log('🌐 Chargement des liens sociaux...');
      
      const socialLinksData = await d1Admin.getSocialLinks();
      console.log('🌐 Liens sociaux chargés:', socialLinksData.length);
      
      setSocialLinks(socialLinksData);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des liens sociaux:', error);
      setSocialLinks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (link: SocialLink) => {
    console.log('✏️ Édition du lien social:', link.name);
    setEditingLink(link);
    setFormData(link);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingLink(null);
    setFormData({
      name: '',
      url: '',
      icon: '🔗',
      is_active: true,
      sort_order: socialLinks.length
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.url) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSaving(true);
    
    try {
      const linkData = {
        name: formData.name!,
        url: formData.url!,
        icon: formData.icon || '🔗',
        is_active: formData.is_active || false,
        sort_order: formData.sort_order || 0
      };

      let result;
      if (editingLink) {
        result = await d1Admin.updateSocialLink(editingLink.id!, linkData);
        console.log('✅ Lien social modifié:', result);
      } else {
        result = await d1Admin.createSocialLink(linkData);
        console.log('✅ Lien social créé:', result);
      }

      // Afficher un message de succès
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-8 py-4 rounded-lg shadow-2xl z-[9999] transition-all duration-500 border-2 border-green-400';
      successMsg.innerHTML = `
        <div class="flex items-center space-x-3">
          <div class="text-2xl">✅</div>
          <div>
            <div class="font-bold text-lg">${editingLink ? 'Lien social modifié avec succès!' : 'Lien social ajouté avec succès!'}</div>
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
      await loadSocialLinks();
      
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

  const handleDelete = async (linkId: number) => {
    const link = socialLinks.find(l => l.id === linkId);
    const linkName = link?.name || 'ce lien';
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${linkName}" ?\n\n⚠️ ATTENTION: Cette action est irréversible !`)) {
      try {
        console.log('🗑️ Suppression du lien social:', linkId);
        
        const result = await d1Admin.deleteSocialLink(linkId);
        console.log('✅ Lien social supprimé:', result);
        
        // Mettre à jour l'interface
        setSocialLinks(prev => prev.filter(l => l.id !== linkId));
        
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] transition-all duration-300';
        successMsg.textContent = `✅ "${linkName}" supprimé avec succès!`;
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

  const updateFormField = (field: keyof SocialLink, value: any) => {
    console.log(`🔄 updateField: ${field} = "${value}"`);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const iconOptions = [
    { value: '📱', label: '📱 Telegram' },
    { value: '📷', label: '📷 Instagram' },
    { value: '💬', label: '💬 WhatsApp' },
    { value: '🎮', label: '🎮 Discord' },
    { value: '📘', label: '📘 Facebook' },
    { value: '🐦', label: '🐦 Twitter/X' },
    { value: '📺', label: '📺 YouTube' },
    { value: '💼', label: '💼 LinkedIn' },
    { value: '🎵', label: '🎵 TikTok' },
    { value: '📧', label: '📧 Email' },
    { value: '📞', label: '📞 Téléphone' },
    { value: '🌐', label: '🌐 Site web' },
    { value: '🔗', label: '🔗 Lien personnalisé' },
    { value: '📍', label: '📍 Localisation' },
    { value: '🎯', label: '🎯 Autre' },
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-white">Chargement des liens sociaux...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">🌐 Gestion des Réseaux Sociaux</h1>
          <p className="text-gray-400 text-sm mt-1">Gérez vos liens sociaux avec D1</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-white/10 border border-white/20 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 backdrop-blur-sm shadow-lg hover:scale-[1.02] w-full sm:w-auto"
        >
          ➕ Ajouter un lien
        </button>
      </div>

      {/* Liste des liens */}
      {socialLinks.length === 0 ? (
        <div className="bg-gray-900/50 border border-white/20 rounded-xl p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Aucun lien social trouvé</h3>
          <p className="text-gray-400 mb-4">
            Commencez par ajouter votre premier lien social.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {socialLinks.map((link) => (
            <div key={link.id} className="bg-gray-900/50 border border-white/20 rounded-xl p-4 sm:p-6 hover:bg-gray-900/70 transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/10 border border-white/20">
                    <span className="text-2xl">{link.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-lg truncate">{link.name}</h3>
                    <p className="text-gray-400 text-sm truncate" title={link.url}>{link.url}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-3 h-3 rounded-full ${link.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-gray-500 text-xs">{link.is_active ? 'Actif' : 'Inactif'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Aperçu du lien */}
              <div className="mb-4 p-3 bg-black/40 rounded-lg border border-white/10">
                <div className="flex items-center space-x-3 text-white">
                  <span className="text-lg">{link.icon}</span>
                  <span className="font-medium text-sm">{link.name}</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(link)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 border border-white/10 hover:border-white/20"
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => link.id && handleDelete(link.id)}
                  className="bg-red-900/20 border border-red-400/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal d'édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 flex items-start justify-center p-2 sm:p-4 z-[9999] overflow-y-auto lg:items-center">
          <div className="bg-gray-900 border-0 sm:border border-white/20 rounded-none sm:rounded-xl w-full max-w-lg my-0 sm:my-4 backdrop-blur-sm min-h-screen sm:min-h-0">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-white/20 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {editingLink ? '✏️ Modifier le lien social' : '➕ Ajouter un lien social'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="sm:hidden p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom du réseau social *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => updateFormField('name', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Ex: Telegram PLUG"
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lien URL *
                </label>
                <input
                  type="url"
                  value={formData.url || ''}
                  onChange={(e) => updateFormField('url', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="https://t.me/plugchannel"
                />
              </div>

              {/* Icône */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Emoji du réseau *
                </label>
                <div className="space-y-2">
                  {/* Input pour emoji personnalisé */}
                  <input
                    type="text"
                    value={formData.icon || ''}
                    onChange={(e) => updateFormField('icon', e.target.value)}
                    className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50 text-center text-2xl"
                    placeholder="Entrez un emoji"
                    maxLength={5}
                  />
                  <p className="text-xs text-gray-400">Tapez directement un emoji ou choisissez ci-dessous</p>
                  
                  {/* Emojis suggérés */}
                  <div className="grid grid-cols-8 gap-1">
                    {iconOptions.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateFormField('icon', option.value)}
                        className={`p-2 rounded hover:bg-gray-700 transition-colors ${formData.icon === option.value ? 'bg-gray-700 ring-2 ring-white' : ''}`}
                        title={option.label}
                      >
                        <span className="text-xl">{option.value}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ordre de tri */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ordre d'affichage
                </label>
                <input
                  type="number"
                  value={formData.sort_order || 0}
                  onChange={(e) => updateFormField('sort_order', parseInt(e.target.value) || 0)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                  min="0"
                />
                <p className="text-xs text-gray-400 mt-1">Plus le nombre est petit, plus le lien apparaîtra en premier</p>
              </div>

              {/* Statut actif */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active || false}
                  onChange={(e) => updateFormField('is_active', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="is_active" className="text-sm text-gray-300">
                  Lien actif (visible sur le site)
                </label>
              </div>

              {/* Aperçu en temps réel */}
              {formData.name && formData.icon && (
                <div className="bg-black/40 rounded-lg p-4 border border-white/10">
                  <p className="text-gray-300 text-sm mb-3">Aperçu en temps réel :</p>
                  
                  {/* Aperçu style ContactPage */}
                  <div className="flex items-center justify-center p-3 rounded-lg border border-white/20 hover:bg-white/10 transition-all duration-300">
                    <span className="text-lg mr-2">{formData.icon}</span>
                    <span className="font-medium text-white">{formData.name}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-white/20 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex-1 ${isSaving ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'} text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed`}
              >
                {isSaving ? '⏳ Sauvegarde...' : '💾 Sauvegarder'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
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