'use client';
import { useState, useEffect } from 'react';
import { d1Admin, Setting } from '@/lib/d1-admin';

export default function SettingsManager() {
  const [settings, setSettings] = useState<Setting>({
    id: 1,
    shop_name: 'LA NATION DU LAIT',
    admin_password: 'admin123',
    background_image: '',
    background_opacity: 20,
    background_blur: 5,
    theme_color: '#000000',
    contact_info: '',
    shop_description: '',
    loading_enabled: true,
    loading_duration: 3000,
    created_at: '',
    updated_at: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      console.log('⚙️ Chargement des paramètres...');
      
      const settingsData = await d1Admin.getSettings();
      if (settingsData) {
        console.log('⚙️ Paramètres chargés:', settingsData);
        setSettings(settingsData);
      } else {
        console.log('⚙️ Aucun paramètre trouvé, utilisation des valeurs par défaut');
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des paramètres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (saving) {
      console.log('Sauvegarde déjà en cours, abandon');
      return;
    }

    try {
      setSaving(true);
      setMessage('');
      console.log('🔄 Sauvegarde des paramètres...', settings);
      
      const result = await d1Admin.updateSettings(settings);
      console.log('✅ Paramètres sauvegardés:', result);
      
      // Message de succès
      setMessage('✅ Paramètres sauvegardés avec succès ! Les changements sont visibles immédiatement');
      setTimeout(() => setMessage(''), 5000);
      
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      setMessage(`❌ Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof Setting, value: string | number | boolean) => {
    console.log(`🔄 updateField: ${field} = "${value}"`);
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-white">Chargement des paramètres...</div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 lg:p-8 max-w-full lg:max-w-7xl mx-auto">
      {/* Header avec bouton de sauvegarde */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4 sticky top-0 bg-black/95 backdrop-blur-md p-3 sm:p-4 -mx-2 sm:-mx-4 rounded-lg sm:rounded-xl border border-white/10 z-10">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">⚙️ Configuration de la Boutique</h1>
          <p className="text-gray-400 text-sm mt-1">Gestion complète des paramètres avec D1</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-white hover:bg-gray-100 disabled:bg-gray-600 text-black font-medium sm:font-bold py-1.5 sm:py-2 px-3 sm:px-4 rounded-md sm:rounded-lg flex items-center gap-1 sm:gap-2 w-full sm:w-auto text-xs sm:text-sm md:text-base transition-all"
          >
            <span>💾</span>
            <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
          </button>
          
          {saving && (
            <button
              onClick={() => {
                setSaving(false);
                setMessage('');
                console.log('🔄 Reset forcé de l\'état saving');
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-md sm:rounded-lg text-xs sm:text-sm transition-all"
            >
              ❌ Annuler
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg border-2 ${
          message.includes('✅') 
            ? 'bg-green-900/50 border-green-400 text-green-100' 
            : 'bg-red-900/50 border-red-400 text-red-100'
        }`}>
          <p className="font-semibold text-center">{message}</p>
        </div>
      )}

      {/* Contenu scrollable */}
      <div className="max-h-[70vh] overflow-y-auto pr-2 pb-8 border border-white/10 rounded-lg">
        <div className="space-y-6 lg:space-y-8 p-2">
          
          {/* Informations générales */}
          <div className="bg-gray-900 border border-white/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="mr-2">🏪</span>
              Informations générales
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom de la boutique
                </label>
                <input
                  type="text"
                  value={settings.shop_name}
                  onChange={(e) => updateField('shop_name', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white"
                  placeholder="LA NATION DU LAIT"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mot de passe admin
                </label>
                <input
                  type="password"
                  value={settings.admin_password}
                  onChange={(e) => updateField('admin_password', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white"
                  placeholder="admin123"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description de la boutique
                </label>
                <textarea
                  value={settings.shop_description}
                  onChange={(e) => updateField('shop_description', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white h-20"
                  placeholder="Votre boutique premium pour des produits de qualité..."
                />
              </div>
            </div>
          </div>

          {/* Contact et commandes */}
          <div className="bg-gray-900 border border-white/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="mr-2">📱</span>
              Contact et commandes
            </h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Informations de contact
                </label>
                <input
                  type="text"
                  value={settings.contact_info}
                  onChange={(e) => updateField('contact_info', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white"
                  placeholder="https://wa.me/33612345678 ou https://t.me/username"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Lien vers votre méthode de contact préférée (WhatsApp, Telegram, etc.)
                </p>
              </div>
            </div>
          </div>

          {/* Apparence */}
          <div className="bg-gray-900 border border-white/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="mr-2">🎨</span>
              Apparence
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Couleur du thème
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={settings.theme_color}
                    onChange={(e) => updateField('theme_color', e.target.value)}
                    className="w-12 h-10 bg-gray-800 border border-white/20 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.theme_color}
                    onChange={(e) => updateField('theme_color', e.target.value)}
                    className="flex-1 bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white font-mono text-sm"
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="loading_enabled"
                  checked={settings.loading_enabled}
                  onChange={(e) => updateField('loading_enabled', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="loading_enabled" className="text-sm text-gray-300">
                  Activer l'écran de chargement
                </label>
              </div>

              {settings.loading_enabled && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Durée du chargement (ms)
                  </label>
                  <input
                    type="number"
                    value={settings.loading_duration}
                    onChange={(e) => updateField('loading_duration', parseInt(e.target.value) || 3000)}
                    className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white"
                    min="1000"
                    max="10000"
                    step="500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Arrière-plan personnalisé */}
          <div className="bg-gray-900 border border-white/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="mr-2">🖼️</span>
              Arrière-plan personnalisé
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Image d'arrière-plan
                </label>
                <input
                  type="text"
                  value={settings.background_image}
                  onChange={(e) => updateField('background_image', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white"
                  placeholder="URL complète de l'image (https://...)"
                />
                {settings.background_image && (
                  <div className="mt-2">
                    <div className="w-32 h-20 rounded-lg border border-white/20 overflow-hidden">
                      <img
                        src={settings.background_image}
                        alt="Aperçu image de fond"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => updateField('background_image', '')}
                      className="ml-2 text-red-400 hover:text-red-300 text-sm"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Opacité (0-100%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.background_opacity}
                    onChange={(e) => updateField('background_opacity', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-gray-400 text-sm">{settings.background_opacity}%</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Flou (0-20px)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={settings.background_blur}
                    onChange={(e) => updateField('background_blur', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-gray-400 text-sm">{settings.background_blur}px</span>
                </div>
              </div>
            </div>
          </div>

          {/* Aperçu en temps réel */}
          <div className="bg-gray-900 border border-white/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="mr-2">👁️</span>
              Aperçu du header
            </h2>
            
            <div className="relative bg-black rounded-lg overflow-hidden border border-white/20">
              {/* Image de fond avec opacité et flou */}
              {settings.background_image && (
                <div 
                  className="absolute inset-0 w-full h-full"
                  style={{
                    opacity: settings.background_opacity / 100,
                    filter: `blur(${settings.background_blur}px)`
                  }}
                >
                  <img
                    src={settings.background_image}
                    alt="Arrière-plan"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* Contenu par-dessus l'image */}
              <div className="relative z-10">
                {/* Logo */}
                <div className="bg-black/50 backdrop-blur-sm py-6 px-4 text-center border-b border-white/20">
                  <h1 
                    className="text-2xl font-black text-white tracking-wider"
                    style={{ color: settings.theme_color }}
                  >
                    {settings.shop_name}
                  </h1>
                  <p className="text-gray-400 text-xs mt-1 uppercase tracking-[0.2em] font-medium">
                    {settings.shop_description || 'Boutique Premium'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}