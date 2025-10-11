'use client';
import { useState, useEffect } from 'react';
import { d1Admin, Order } from '@/lib/d1-admin';

export default function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState<Partial<Order>>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    items: '[]',
    total_amount: 0,
    status: 'pending',
    notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      console.log('📦 Chargement des commandes...');
      
      const ordersData = await d1Admin.getOrders();
      console.log('📦 Commandes chargées:', ordersData.length);
      
      setOrders(ordersData);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des commandes:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (order: Order) => {
    console.log('✏️ Édition de la commande:', order.id);
    setEditingOrder(order);
    setFormData(order);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingOrder(null);
    setFormData({
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      items: '[]',
      total_amount: 0,
      status: 'pending',
      notes: ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.customer_name) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSaving(true);
    
    try {
      const orderData = {
        customer_name: formData.customer_name!,
        customer_email: formData.customer_email || '',
        customer_phone: formData.customer_phone || '',
        items: formData.items || '[]',
        total_amount: formData.total_amount || 0,
        status: formData.status || 'pending',
        notes: formData.notes || ''
      };

      let result;
      if (editingOrder) {
        result = await d1Admin.updateOrder(editingOrder.id!, orderData);
        console.log('✅ Commande modifiée:', result);
      } else {
        result = await d1Admin.createOrder(orderData);
        console.log('✅ Commande créée:', result);
      }

      // Afficher un message de succès
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-8 py-4 rounded-lg shadow-2xl z-[9999] transition-all duration-500 border-2 border-green-400';
      successMsg.innerHTML = `
        <div class="flex items-center space-x-3">
          <div class="text-2xl">✅</div>
          <div>
            <div class="font-bold text-lg">${editingOrder ? 'Commande modifiée avec succès!' : 'Commande ajoutée avec succès!'}</div>
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
      await loadOrders();
      
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

  const handleDelete = async (orderId: number) => {
    const order = orders.find(o => o.id === orderId);
    const orderName = order?.customer_name || 'cette commande';
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer la commande de "${orderName}" ?\n\n⚠️ ATTENTION: Cette action est irréversible !`)) {
      try {
        console.log('🗑️ Suppression de la commande:', orderId);
        
        const result = await d1Admin.deleteOrder(orderId);
        console.log('✅ Commande supprimée:', result);
        
        // Mettre à jour l'interface
        setOrders(prev => prev.filter(o => o.id !== orderId));
        
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] transition-all duration-300';
        successMsg.textContent = `✅ Commande de "${orderName}" supprimée avec succès!`;
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

  const updateFormField = (field: keyof Order, value: any) => {
    console.log(`🔄 updateField: ${field} = "${value}"`);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Fonction pour parser les items JSON
  const getItems = (itemsJson: string) => {
    try {
      return JSON.parse(itemsJson || '[]');
    } catch {
      return [];
    }
  };

  // Fonction pour formater les items en JSON
  const setItems = (items: any[]) => {
    updateFormField('items', JSON.stringify(items));
  };

  // Filtrer les commandes par statut
  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const statusOptions = [
    { value: 'all', label: 'Toutes', color: 'gray' },
    { value: 'pending', label: 'En attente', color: 'yellow' },
    { value: 'confirmed', label: 'Confirmée', color: 'blue' },
    { value: 'delivered', label: 'Livrée', color: 'green' },
    { value: 'cancelled', label: 'Annulée', color: 'red' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600';
      case 'confirmed': return 'bg-blue-600';
      case 'delivered': return 'bg-green-600';
      case 'cancelled': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-white">Chargement des commandes...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">📦 Gestion des Commandes</h1>
          <p className="text-gray-400 text-sm mt-1">Suivez et gérez toutes les commandes</p>
        </div>
        <div className="flex gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            className="bg-white/10 border border-white/20 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 backdrop-blur-sm shadow-lg hover:scale-[1.02]"
          >
            ➕ Nouvelle commande
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statusOptions.slice(1).map(option => {
          const count = orders.filter(o => o.status === option.value).length;
          return (
            <div key={option.value} className="bg-gray-900/50 border border-white/20 rounded-xl p-4 text-center">
              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold mb-2 ${getStatusColor(option.value)}`}>
                {count}
              </div>
              <div className="text-white font-medium text-sm">{option.label}</div>
            </div>
          );
        })}
      </div>

      {/* Liste des commandes */}
      {filteredOrders.length === 0 ? (
        <div className="bg-gray-900/50 border border-white/20 rounded-xl p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            {filterStatus === 'all' ? 'Aucune commande trouvée' : `Aucune commande ${statusOptions.find(o => o.value === filterStatus)?.label.toLowerCase()}`}
          </h3>
          <p className="text-gray-400 mb-4">
            {filterStatus === 'all' 
              ? 'Commencez par ajouter votre première commande.' 
              : 'Aucune commande avec ce statut pour le moment.'
            }
          </p>
        </div>
      ) : (
        <div className="max-h-[70vh] overflow-y-auto pr-2">
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-gray-900/50 border border-white/20 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.01] backdrop-blur-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📦</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{order.customer_name}</h3>
                      <p className="text-gray-400 text-sm">
                        {order.customer_email && `📧 ${order.customer_email}`}
                        {order.customer_phone && ` | 📞 ${order.customer_phone}`}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {order.created_at && new Date(order.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold text-lg">{order.total_amount}€</div>
                      <div className="text-gray-400 text-xs">Total</div>
                    </div>
                  </div>
                </div>

                {/* Items de la commande */}
                {getItems(order.items).length > 0 && (
                  <div className="mb-4 p-3 bg-black/40 rounded-lg border border-white/10">
                    <div className="text-gray-300 text-sm mb-2 font-medium">Articles commandés :</div>
                    <div className="space-y-1">
                      {getItems(order.items).map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm text-gray-300">
                          <span>{item.name || `Article ${index + 1}`}</span>
                          <span>{item.price || 0}€</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {order.notes && (
                  <div className="mb-4 p-3 bg-blue-900/20 rounded-lg border border-blue-400/20">
                    <div className="text-blue-300 text-sm font-medium mb-1">Notes :</div>
                    <div className="text-blue-200 text-sm">{order.notes}</div>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(order)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 px-3 rounded-lg text-sm transition-all duration-200 border border-white/10"
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    onClick={() => order.id && handleDelete(order.id)}
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
              {editingOrder ? '✏️ Modifier la commande' : '➕ Nouvelle commande'}
            </h2>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nom du client *</label>
                  <input
                    type="text"
                    value={formData.customer_name || ''}
                    onChange={(e) => updateFormField('customer_name', e.target.value)}
                    className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="Jean Dupont"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.customer_email || ''}
                    onChange={(e) => updateFormField('customer_email', e.target.value)}
                    className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="jean@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.customer_phone || ''}
                    onChange={(e) => updateFormField('customer_phone', e.target.value)}
                    className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="06 12 34 56 78"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Montant total (€)</label>
                  <input
                    type="number"
                    value={formData.total_amount || 0}
                    onChange={(e) => updateFormField('total_amount', parseFloat(e.target.value) || 0)}
                    className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Statut</label>
                  <select
                    value={formData.status || 'pending'}
                    onChange={(e) => updateFormField('status', e.target.value)}
                    className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmée</option>
                    <option value="delivered">Livrée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Articles (JSON)</label>
                <textarea
                  value={formData.items || '[]'}
                  onChange={(e) => updateFormField('items', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50 h-32 font-mono text-sm"
                  placeholder='[{"name": "Produit 1", "price": 25.50}, {"name": "Produit 2", "price": 15.00}]'
                />
                <p className="text-xs text-gray-400 mt-1">
                  Format JSON pour les articles. Exemple: [{"name": "Produit", "price": 25.50}]
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => updateFormField('notes', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50 h-20"
                  placeholder="Notes sur la commande..."
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