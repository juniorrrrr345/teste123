'use client';
import { useState, useEffect } from 'react';
import { d1Admin, Farm } from '@/lib/d1-admin';

export default function FarmsManager() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [formData, setFormData] = useState<Partial<Farm>>({
    name: '',
    description: '',
    location: '',
    contact: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    try {
      setLoading(true);
      console.log('🚜 Chargement des fermes...');
      
      const farmsData = await d1Admin.getFarms();
      console.log('🚜 Fermes chargées:', farmsData.length);
      
      setFarms(farmsData);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des fermes:', error);
      setFarms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (farm: Farm) => {
    console.log('✏️ Édition de la ferme:', farm.name);
    setEditingFarm(farm);
    setFormData(farm);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingFarm(null);
    setFormData({
      name: '',
      description: '',
      location: '',
      contact: ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert('Veuillez entrer un nom pour la ferme');
      return;
    }

    setIsSaving(true);
    
    try {
      const farmData = {
        name: formData.name!,
        description: formData.description || '',
        location: formData.location || '',
        contact: formData.contact || ''
      };

      let result;
      if (editingFarm) {
        result = await d1Admin.updateFarm(editingFarm.id!, farmData);
        console.log('✅ Ferme modifiée:', result);
      } else {
        result = await d1Admin.createFarm(farmData);
        console.log('✅ Ferme créée:', result);
      }

      // Afficher un message de succès
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-8 py-4 rounded-lg shadow-2xl z-[9999] transition-all duration-500 border-2 border-green-400';
      successMsg.innerHTML = `
        <div class="flex items-center space-x-3">
          <div class="text-2xl">✅</div>
          <div>
            <div class="font-bold text-lg">${editingFarm ? 'Ferme modifiée avec succès!' : 'Ferme ajoutée avec succès!'}</div>
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
      await loadFarms();
      
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

  const handleDelete = async (farmId: number) => {
    const farm = farms.find(f => f.id === farmId);
    const farmName = farm?.name || 'cette ferme';
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${farmName}" ?\n\n⚠️ ATTENTION: Cette action est irréversible !`)) {
      try {
        console.log('🗑️ Suppression de la ferme:', farmId);
        
        const result = await d1Admin.deleteFarm(farmId);
        console.log('✅ Ferme supprimée:', result);
        
        // Mettre à jour l'interface
        setFarms(prev => prev.filter(f => f.id !== farmId));
        
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] transition-all duration-300';
        successMsg.textContent = `✅ "${farmName}" supprimée avec succès!`;
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

  const updateFormField = (field: keyof Farm, value: any) => {
    console.log(`🔄 updateField: ${field} = "${value}"`);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-white">Chargement des fermes...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">🚜 Gestion des Fermes</h1>
          <p className="text-gray-400 text-sm mt-1">Gérez vos fournisseurs et fermes partenaires</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-white/10 border border-white/20 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 backdrop-blur-sm shadow-lg hover:scale-[1.02] w-full sm:w-auto"
        >
          ➕ Ajouter une ferme
        </button>
      </div>

      {/* Liste des fermes */}
      {farms.length === 0 ? (
        <div className="bg-gray-900/50 border border-white/20 rounded-xl p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Aucune ferme trouvée</h3>
          <p className="text-gray-400 mb-4">
            Commencez par ajouter votre première ferme ou fournisseur.
          </p>
        </div>
      ) : (
        <div className="max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {farms.map((farm) => (
              <div key={farm.id} className="bg-gray-900/50 border border-white/20 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🚜</span>
                    <h3 className="font-bold text-white text-xl">{farm.name}</h3>
                  </div>
                </div>
              
                {farm.description && (
                  <p className="text-gray-400 text-sm mb-3">{farm.description}</p>
                )}

                {farm.location && (
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-gray-500 text-sm">📍</span>
                    <span className="text-gray-300 text-sm">{farm.location}</span>
                  </div>
                )}

                {farm.contact && (
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-gray-500 text-sm">📞</span>
                    <span className="text-gray-300 text-sm">{farm.contact}</span>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(farm)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 px-3 rounded-lg text-sm transition-all duration-200 border border-white/10"
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    onClick={() => farm.id && handleDelete(farm.id)}
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
              {editingFarm ? '✏️ Modifier la ferme' : '➕ Ajouter une ferme'}
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nom *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => updateFormField('name', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Ex: Ferme Bio du Val de Loire"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => updateFormField('description', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50 h-20"
                  placeholder="Description de la ferme ou du fournisseur..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Localisation</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => updateFormField('location', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Ex: Val de Loire, France"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Contact</label>
                <input
                  type="text"
                  value={formData.contact || ''}
                  onChange={(e) => updateFormField('contact', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Ex: contact@fermebio.fr ou +33 1 23 45 67 89"
                />
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