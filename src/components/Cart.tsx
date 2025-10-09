'use client';

import { useCartStore } from '@/lib/cartStore';
// Removed Next Image import - using regular img for better compatibility
import { X, Minus, Plus, Trash2, ShoppingCart, ArrowLeft, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import ServiceSelector from './ServiceSelector';
import ScheduleSelector from './ScheduleSelector';

export default function Cart() {
  const { 
    items, 
    isOpen, 
    setIsOpen, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    getTotalPrice,
    service,
    schedule,
    deliveryAddress,
    deliveryPostalCode,
    deliveryCity,
    setService,
    setSchedule,
    setDeliveryInfo,
    isCartReadyForOrder,
    clientType,
    setClientType
  } = useCartStore();
  const [orderLink, setOrderLink] = useState('#'); // Lien de commande par défaut
  const [serviceLinks, setServiceLinks] = useState({
    livraison: '',
    envoi: '',
    meetup: '',
    telegram_passer_commande: ''
  });
  const [customSchedules, setCustomSchedules] = useState({
    livraison: [] as string[],
    meetup: [] as string[],
    envoi: [] as string[]
  });
  const [currentStep, setCurrentStep] = useState<'cart' | 'service' | 'schedule' | 'delivery' | 'review'>('cart');
  
  // Auto-navigation entre les étapes (désactivée pour permettre la modification)
  useEffect(() => {
    if (items.length === 0) {
      setCurrentStep('cart');
      return;
    }
    
    // On supprime la navigation automatique pour permettre la modification des services
    // L'utilisateur peut maintenant naviguer librement entre les étapes pour modifier ses choix
    
  }, [items]);
  
  useEffect(() => {
    // Charger les liens de commande depuis les settings Cloudflare
    fetch('/api/cloudflare/settings')
      .then(res => res.json())
      .then(data => {
        console.log('📱 Settings reçus pour commandes:', data);
        
        // Charger les liens de service spécifiques
        setServiceLinks({
          livraison: data.telegram_livraison || data.livraison || '',
          envoi: data.telegram_envoi || data.envoi || '',
          meetup: data.telegram_meetup || data.meetup || '',
          telegram_passer_commande: data.telegram_passer_commande || ''
        });
        
        // Charger les horaires personnalisés
        setCustomSchedules({
          livraison: data.livraison_schedules || [],
          meetup: data.meetup_schedules || [],
          envoi: data.envoi_schedules || []
        });
        
        // Lien de commande principal (fallback)
        // Priorité 1: whatsapp_link (colonne dédiée)
        if (data.whatsapp_link) {
          setOrderLink(data.whatsapp_link);
          console.log('📱 Lien de commande principal configuré:', data.whatsapp_link);
        }
        // Priorité 2: contact_info (fallback)
        else if (data.contact_info) {
          setOrderLink(data.contact_info);
          console.log('📱 Lien depuis contact_info:', data.contact_info);
        }
        // Priorité 3: ancien champ whatsappLink (compatibilité)
        else if (data.whatsappLink) {
          setOrderLink(data.whatsappLink);
          console.log('📱 Lien WhatsApp (legacy):', data.whatsappLink);
        }
        
        console.log('📱 Liens de service chargés:', {
          livraison: data.telegram_livraison || data.livraison,
          envoi: data.telegram_envoi || data.envoi,
          meetup: data.telegram_meetup || data.meetup
        });
        
        console.log('⏰ Horaires personnalisés chargés:', {
          livraison: data.livraison_schedules,
          meetup: data.meetup_schedules,
          envoi: data.envoi_schedules
        });
      })
      .catch((error) => {
        console.error('❌ Erreur chargement settings commande:', error);
      });
  }, []);
  
  // Fonction pour envoyer la commande
  const handleSendOrderByService = async () => {
    if (!service) {
      toast.error('Veuillez sélectionner un service');
      return;
    }
    
    // Calculer le total
    const totalPrice = getTotalPrice();
    
    // Construire le message
    const serviceIcon = service === 'livraison' ? '🚚' : service === 'envoi' ? '📦' : '📍';
    const serviceName = service === 'livraison' ? 'LIVRAISON À DOMICILE' : service === 'envoi' ? 'ENVOI POSTAL' : 'POINT DE RENCONTRE';
    
    let message = `${serviceIcon} COMMANDE ${serviceName}:\n\n`;
    
    // Si c'est une livraison, afficher l'adresse en premier
    if (service === 'livraison' && deliveryAddress) {
      message += `${deliveryAddress}\n`;
      message += `${deliveryPostalCode}\n`;
      message += `${deliveryCity}\n`;
      if (schedule) {
        message += `Horaire demandé: ${schedule}\n`;
      }
      message += `\n`;
    }
    
    items.forEach((item, index) => {
      // Déterminer l'emoji selon le type de produit
      let productEmoji = '🌿';
      const productLower = item.productName.toLowerCase();
      if (productLower.includes('mint') || productLower.includes('triangle')) {
        productEmoji = '🌵';
      } else if (productLower.includes('tropic') || productLower.includes('smooth')) {
        productEmoji = '🌴';
      } else if (productLower.includes('chocolate') || productLower.includes('dubai')) {
        productEmoji = '🌍';
      }
      
      message += `${index + 1}. ${item.productName.toUpperCase()} ${productEmoji}\n`;
      message += `• Quantité: ${item.quantity}x ${item.weight}\n`;
      
      if (schedule && service !== 'livraison') {
        message += `• ${schedule}\n`;
      }
      
      message += '\n';
    });
    
    message += `💰 TOTAL ${totalPrice.toFixed(2)}€\n\n`;
    
    if (service === 'livraison') {
      message += `Les frais de routes seront indiqué par le standard\n\n`;
    }
    
    message += `Commande générée automatiquement depuis le site web`;
    
    // Choisir le bon lien selon le service
    let chosenLink = orderLink;
    
    if (serviceLinks[service]) {
      chosenLink = serviceLinks[service];
      console.log(`📱 Utilisation du lien spécifique pour ${service}:`, chosenLink);
    } else {
      console.log(`📱 Pas de lien configuré, utilisation du lien principal`);
    }
    
    // Encoder le message pour l'URL
    const encodedMessage = encodeURIComponent(message);
    
    // Construire l'URL selon le type de lien
    let finalUrl = chosenLink;
    
    if (chosenLink.includes('wa.me')) {
      // WhatsApp : ajouter le message
      finalUrl = `${chosenLink}?text=${encodedMessage}`;
    } else if (chosenLink.includes('t.me')) {
      // Telegram : ajouter le message pré-rempli
      // Note: Les liens d'invitation Telegram (avec +) ne supportent pas le paramètre text
      if (chosenLink.includes('/+')) {
        // Lien d'invitation : on ouvre sans message pré-rempli mais on copie dans le presse-papiers
        finalUrl = chosenLink;
        console.log('⚠️ Lien d\'invitation Telegram détecté, copie dans le presse-papiers');
        try {
          navigator.clipboard.writeText(message);
          toast.success('📋 Message copié ! Collez-le dans Telegram après avoir rejoint');
        } catch (err) {
          console.log('Clipboard non disponible');
        }
      } else {
        // Lien direct : on peut utiliser le paramètre text
        if (chosenLink.includes('?')) {
          finalUrl = `${chosenLink}&text=${encodedMessage}`;
        } else {
          finalUrl = `${chosenLink}?text=${encodedMessage}`;
        }
      }
    } else {
      // Autre lien : essayer d'ajouter le message quand même
      const separator = chosenLink.includes('?') ? '&' : '?';
      finalUrl = `${chosenLink}${separator}text=${encodedMessage}`;
    }
    
    console.log(`📱 Service: ${targetService}`);
    console.log(`📱 Lien choisi: ${chosenLink}`);
    console.log(`📱 Message brut:`, message);
    console.log(`📱 Message encodé:`, encodedMessage);
    console.log(`📱 URL finale:`, finalUrl);
    
    // Ouvrir le lien de commande avec le message pré-rempli
    window.open(finalUrl, '_blank');
    
    // Afficher un message de succès
    toast.success(`📱 Commande ${serviceName} envoyée !`);
  };

  // Fonction pour copier le message dans le presse-papiers
  const copyOrderMessage = async () => {
    if (!service) {
      toast.error('Veuillez sélectionner un service');
      return false;
    }
    
    const totalPrice = getTotalPrice();
    const serviceIcon = service === 'livraison' ? '🚚' : service === 'envoi' ? '📦' : '📍';
    const serviceName = service === 'livraison' ? 'LIVRAISON À DOMICILE' : service === 'envoi' ? 'ENVOI POSTAL' : 'POINT DE RENCONTRE';
    
    let message = `${serviceIcon} COMMANDE ${serviceName}:\n\n`;
    
    if (service === 'livraison' && deliveryAddress) {
      message += `${deliveryAddress}\n`;
      message += `${deliveryPostalCode}\n`;
      message += `${deliveryCity}\n`;
      if (schedule) {
        message += `Horaire demandé: ${schedule}\n`;
      }
      message += `\n`;
    }
    
    items.forEach((item, index) => {
      let productEmoji = '🌿';
      const productLower = item.productName.toLowerCase();
      if (productLower.includes('mint') || productLower.includes('triangle')) {
        productEmoji = '🌵';
      } else if (productLower.includes('tropic') || productLower.includes('smooth')) {
        productEmoji = '🌴';
      } else if (productLower.includes('chocolate') || productLower.includes('dubai')) {
        productEmoji = '🌍';
      }
      
      message += `${index + 1}. ${item.productName.toUpperCase()} ${productEmoji}\n`;
      message += `• Quantité: ${item.quantity}x ${item.weight}\n`;
      
      if (schedule && service !== 'livraison') {
        message += `• ${schedule}\n`;
      }
      
      message += '\n';
    });
    
    message += `💰 TOTAL ${totalPrice.toFixed(2)}€\n\n`;
    
    if (service === 'livraison') {
      message += `Les frais de routes seront indiqué par le standard\n\n`;
    }
    
    message += `Commande générée automatiquement depuis le site web`;
    
    try {
      await navigator.clipboard.writeText(message);
      toast.success('📋 Message copié ! Collez-le dans Telegram');
      return true;
    } catch (err) {
      console.error('Erreur copie:', err);
      toast.error('Impossible de copier le message');
      return false;
    }
  };

  
  if (!isOpen) return null;
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = getTotalPrice();
  
  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Cart Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-gray-900 shadow-xl pointer-events-auto overflow-hidden">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-gray-800 px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">
                  {currentStep === 'cart' && 'Mon Panier'}
                  {currentStep === 'service' && 'Mode de livraison'}
                  {currentStep === 'schedule' && 'Options & Horaires'}
                  {currentStep === 'delivery' && 'Adresse de livraison'}
                  {currentStep === 'review' && 'Récapitulatif'}
                </h2>
                <span className="rounded-full bg-green-500 px-2 py-1 text-sm font-medium text-black">
                  {totalItems} article{totalItems > 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Indicateur d'étapes */}
            {items.length > 0 && (
              <div className="flex items-center gap-1 text-xs overflow-x-auto">
                <div className={`flex items-center gap-1 ${currentStep === 'cart' ? 'text-green-400' : 'text-gray-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${currentStep === 'cart' ? 'bg-green-400' : 'bg-gray-600'}`}></span>
                  Panier
                </div>
                <ArrowRight className="w-3 h-3 text-gray-600" />
                <div className={`flex items-center gap-1 ${currentStep === 'service' ? 'text-green-400' : 'text-gray-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${service ? 'bg-green-400' : 'bg-gray-600'}`}></span>
                  Service
                </div>
                <ArrowRight className="w-3 h-3 text-gray-600" />
                <div className={`flex items-center gap-1 ${currentStep === 'schedule' ? 'text-green-400' : 'text-gray-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${schedule ? 'bg-green-400' : 'bg-gray-600'}`}></span>
                  Horaire
                </div>
                <ArrowRight className="w-3 h-3 text-gray-600" />
                <div className={`flex items-center gap-1 ${currentStep === 'delivery' ? 'text-green-400' : 'text-gray-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${(service !== 'livraison' || (deliveryAddress && deliveryPostalCode && deliveryCity)) ? 'bg-green-400' : 'bg-gray-600'}`}></span>
                  Adresse
                </div>
                <ArrowRight className="w-3 h-3 text-gray-600" />
                <div className={`flex items-center gap-1 ${currentStep === 'review' ? 'text-green-400' : 'text-gray-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${currentStep === 'review' ? 'bg-green-400' : 'bg-gray-600'}`}></span>
                  Envoi
                </div>
              </div>
            )}
          </div>
          
          {/* Content dynamique selon l'étape */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ShoppingCart className="h-16 w-16 mb-4" />
                <p>Votre panier est vide</p>
              </div>
            ) : (
              <div>
                {/* Étape 1: Affichage du panier */}
                {currentStep === 'cart' && (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={`${item.productId}-${item.weight}`} className="rounded-lg bg-gray-800/50 p-4">
                        <div className="flex gap-4">
                          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-medium text-white">{item.productName}</h3>
                            <p className="text-sm text-gray-400">
                              {item.weight} - {item.originalPrice}€
                              {item.discount > 0 && (
                                <span className="ml-2 rounded bg-green-500/20 px-1.5 py-0.5 text-xs font-medium text-green-400">
                                  -{item.discount}%
                                </span>
                              )}
                            </p>
                            <p className="mt-1 text-lg font-bold text-green-400">
                              {(item.price * item.quantity).toFixed(2)}€
                            </p>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.productId, item.weight, item.quantity - 1)}
                                className="rounded bg-gray-700 p-1 hover:bg-gray-600 transition-colors"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-8 text-center font-medium text-white">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.weight, item.quantity + 1)}
                                className="rounded bg-gray-700 p-1 hover:bg-gray-600 transition-colors"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.productId, item.weight)}
                              className="rounded p-1 text-red-400 hover:bg-red-500/20 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Étape 2: Sélection du service */}
                {currentStep === 'service' && (
                  <div className="space-y-6">
                    <div className="text-sm text-gray-400 bg-gray-800/30 p-3 rounded-lg">
                      Choisissez votre mode de réception pour <strong>tous les articles</strong> :
                    </div>
                    
                    <ServiceSelector
                      selectedService={service}
                      onServiceSelect={(selectedService) => setService(selectedService)}
                    />
                    
                    {service && (
                      <div className="text-sm text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                        ✓ Service sélectionné : {service === 'livraison' ? '🚚 Livraison à domicile' : 
                                                 service === 'envoi' ? '📦 Envoi postal' : 
                                                 '📍 Point de rencontre'}
                      </div>
                    )}
                  </div>
                )}

                {/* Étape 3: Sélection des horaires */}
                {currentStep === 'schedule' && (
                  <div className="space-y-6">
                    <div className="text-sm text-gray-400 bg-gray-800/30 p-3 rounded-lg">
                      Choisissez votre créneau horaire/option pour <strong>toute la commande</strong>
                    </div>
                    
                    {service && (
                      <div className="space-y-3">
                        <div className="text-sm text-green-400 bg-green-500/10 p-2 rounded border border-green-500/20">
                          Service sélectionné : {service === 'livraison' ? '🚚 Livraison' : 
                                                  service === 'envoi' ? '📦 Envoi postal' : 
                                                  '📍 Point de rencontre'}
                        </div>
                        
                        <ScheduleSelector
                          selectedSchedule={schedule}
                          onScheduleSelect={(selectedSchedule) => setSchedule(selectedSchedule)}
                          serviceType={service as 'livraison' | 'meetup' | 'envoi'}
                          customSchedules={
                            service === 'livraison' ? customSchedules.livraison : 
                            service === 'meetup' ? customSchedules.meetup : 
                            customSchedules.envoi
                          }
                        />
                        
                        {schedule && (
                          <div className="text-sm text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                            ✓ Horaire sélectionné : {schedule}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {!service && (
                      <div className="text-center text-gray-400 py-8">
                        <p>Retournez à l'étape précédente pour choisir votre service.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Étape 4: Adresse de livraison */}
                {currentStep === 'delivery' && (
                  <div className="space-y-6">
                    <div className="text-sm text-gray-400 bg-gray-800/30 p-3 rounded-lg">
                      🏠 Renseignez votre adresse de livraison
                    </div>
                    
                    {service === 'livraison' ? (
                      <div className="bg-gray-800/30 p-4 rounded-lg space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Adresse
                          </label>
                          <input
                            type="text"
                            value={deliveryAddress || ''}
                            onChange={(e) => setDeliveryInfo(e.target.value, deliveryPostalCode || '', deliveryCity || '')}
                            placeholder="12 rue des tulipes"
                            className="w-full bg-gray-700 border border-white/20 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Code postal
                            </label>
                            <input
                              type="text"
                              value={deliveryPostalCode || ''}
                              onChange={(e) => setDeliveryInfo(deliveryAddress || '', e.target.value, deliveryCity || '')}
                              placeholder="92000"
                              className="w-full bg-gray-700 border border-white/20 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Ville
                            </label>
                            <input
                              type="text"
                              value={deliveryCity || ''}
                              onChange={(e) => setDeliveryInfo(deliveryAddress || '', deliveryPostalCode || '', e.target.value)}
                              placeholder="Nanterre"
                              className="w-full bg-gray-700 border border-white/20 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                        </div>
                        
                        {deliveryAddress && deliveryPostalCode && deliveryCity && (
                          <div className="text-xs text-green-400 bg-green-500/10 p-2 rounded">
                            ✓ Adresse complète
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 py-8">
                        <p>Service sélectionné : {service === 'envoi' ? '📦 Envoi postal' : '📍 Point de rencontre'}</p>
                        <p className="text-sm mt-2">Aucune adresse nécessaire</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Étape 5: Récapitulatif */}
                {currentStep === 'review' && (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-400 bg-gray-800/30 p-3 rounded-lg">
                      Vérifiez votre commande avant envoi
                    </div>
                    
                    <div className="text-sm bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg space-y-3">
                      <div className="space-y-2">
                        <div className="font-medium text-green-400">SI TU ES NOUVEAU LAITIER 🆕</div>
                        <div className="text-gray-300 text-xs pl-2">
                          - Clique sur « Passer ma première commande » et laisse toi guider par Lala Standardiste 👩‍💻
                        </div>
                      </div>
                      
                      <div className="border-t border-blue-500/20 pt-3 space-y-2">
                        <div className="font-medium text-green-400">SI TU ES LAITIER CONFIRMÉ ☑️</div>
                        <div className="text-gray-300 text-xs pl-2">
                          - Clique sur « Copier mon Recap' commande » et Envois ce message directement à ton standard de commande habituel
                        </div>
                      </div>
                    </div>
                    
                    {items.map((item) => (
                      <div key={`review-${item.productId}-${item.weight}`} className="rounded-lg bg-gray-800/50 p-4">
                        <div className="flex gap-4">
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-medium text-white">{item.productName}</h3>
                            <p className="text-sm text-gray-400">{item.weight} × {item.quantity}</p>
                            <p className="text-lg font-bold text-green-400">
                              {(item.price * item.quantity).toFixed(2)}€
                            </p>
                            
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-400">Service:</span>
                                <span className="text-white">
                                  {service === 'livraison' ? '🚚 Livraison' : 
                                   service === 'envoi' ? '📦 Envoi postal' : 
                                   '📍 Point de rencontre'}
                                </span>
                              </div>
                              {schedule && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-gray-400">Horaire:</span>
                                  <span className="text-white">{schedule}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-800 p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-lg text-gray-400">Total:</span>
                <span className="text-2xl font-bold text-green-400">{total.toFixed(2)}€</span>
              </div>
              
              {/* Boutons de navigation entre étapes */}
              <div className="space-y-3">
                {currentStep === 'cart' && (
                  <button
                    onClick={() => setCurrentStep('service')}
                    className="w-full rounded-lg bg-gradient-to-r from-green-500 to-green-600 py-3 font-medium text-white hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="w-5 h-5" />
                    COMMANDER
                  </button>
                )}

                {currentStep === 'service' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        // Retourner au panier (étape précédente)
                        setCurrentStep('cart');
                      }}
                      className="flex-1 rounded-lg bg-gray-700 py-3 font-medium text-white hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Retour
                    </button>
                    <button
                      onClick={() => {
                        if (!service) {
                          toast.error('Veuillez choisir un service');
                        } else {
                          setCurrentStep('schedule');
                        }
                      }}
                      disabled={!service}
                      className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 py-3 font-medium text-white hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continuer
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {currentStep === 'schedule' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        // Retourner à l'étape précédente (service)
                        setCurrentStep('service');
                      }}
                      className="flex-1 rounded-lg bg-gray-700 py-3 font-medium text-white hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Retour
                    </button>
                    <button
                      onClick={() => {
                        if (!schedule) {
                          toast.error('Veuillez choisir un horaire');
                        } else if (service === 'livraison') {
                          setCurrentStep('delivery');
                        } else {
                          setCurrentStep('review');
                        }
                      }}
                      disabled={!schedule}
                      className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 py-3 font-medium text-white hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continuer
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {currentStep === 'delivery' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCurrentStep('schedule')}
                      className="flex-1 rounded-lg bg-gray-700 py-3 font-medium text-white hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Retour
                    </button>
                    <button
                      onClick={() => {
                        if (service === 'livraison' && (!deliveryAddress || !deliveryPostalCode || !deliveryCity)) {
                          toast.error('Veuillez renseigner toutes les informations d\'adresse');
                        } else {
                          setCurrentStep('review');
                        }
                      }}
                      disabled={service === 'livraison' && (!deliveryAddress || !deliveryPostalCode || !deliveryCity)}
                      className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 py-3 font-medium text-white hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      FINALISER
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {currentStep === 'review' && (
                  <div className="space-y-3">
                    {service && (
                      <>
                        <div className="text-xs text-green-400 bg-green-500/10 p-2 rounded border border-green-500/20">
                          🎯 Service : {service === 'livraison' ? '🚚 Livraison' : service === 'envoi' ? '📦 Envoi' : '📍 Meetup'}
                          {serviceLinks[service] && ' - Canal configuré'}
                        </div>
                        
                        return (
                          <div className="space-y-2">
                            {hasConfiguredLink && (
                              <div className="text-xs text-green-400 bg-green-500/10 p-2 rounded border border-green-500/20">
                                🎯 Direction: Canal {serviceName}
                              </div>
                            )}
                            
                            {/* Bouton copier message */}
                            <button
                              onClick={() => copyOrderMessage(service)}
                              className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 py-3 font-medium text-white hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Copier mon Recap' commande 📝
                            </button>
                            
                            {/* Bouton première commande */}
                            <button
                              onClick={async () => {
                                const passerCommandeLink = serviceLinks.telegram_passer_commande || orderLink;
                                if (!passerCommandeLink || passerCommandeLink === '#') {
                                  toast.error('Aucun lien configuré pour passer commande');
                                  return;
                                }
                                
                                // Construire le message de commande complet
                                const serviceItems = items.filter(item => item.service === service);
                                const serviceTotal = serviceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                                const serviceIcon = service === 'livraison' ? '🚚' : service === 'envoi' ? '📦' : '📍';
                                const serviceName = service === 'livraison' ? 'LIVRAISON À DOMICILE' : service === 'envoi' ? 'ENVOI POSTAL' : 'POINT DE RENCONTRE';
                                
                                let message = `${serviceIcon} COMMANDE ${serviceName}:\n\n`;
                                
                                if (service === 'livraison' && serviceItems.length > 0 && serviceItems[0].deliveryAddress) {
                                  message += `${serviceItems[0].deliveryAddress}\n`;
                                  message += `${serviceItems[0].deliveryPostalCode}\n`;
                                  message += `${serviceItems[0].deliveryCity}\n`;
                                  if (serviceItems[0].schedule) {
                                    message += `Horaire demandé: ${serviceItems[0].schedule}\n`;
                                  }
                                  message += `\n`;
                                }
                                
                                serviceItems.forEach((item, index) => {
                                  let productEmoji = '🌿';
                                  const productLower = item.productName.toLowerCase();
                                  if (productLower.includes('mint') || productLower.includes('triangle')) {
                                    productEmoji = '🌵';
                                  } else if (productLower.includes('tropic') || productLower.includes('smooth')) {
                                    productEmoji = '🌴';
                                  } else if (productLower.includes('chocolate') || productLower.includes('dubai')) {
                                    productEmoji = '🌍';
                                  }
                                  
                                  message += `${index + 1}. ${item.productName.toUpperCase()} ${productEmoji}\n`;
                                  message += `• Quantité: ${item.quantity}x ${item.weight}\n`;
                                  
                                  if (item.schedule && service !== 'livraison') {
                                    message += `• ${item.schedule}\n`;
                                  }
                                  
                                  message += '\n';
                                });
                                
                                message += `💰 TOTAL ${serviceTotal.toFixed(2)}€\n\n`;
                                
                                if (service === 'livraison') {
                                  message += `Les frais de routes seront indiqué par le standard\n\n`;
                                }
                                
                                message += `Commande générée automatiquement depuis le site web`;
                                
                                // Encoder le message
                                const encodedMessage = encodeURIComponent(message);
                                
                                // Construire l'URL avec le message pré-rempli
                                let finalUrl = passerCommandeLink;
                                if (passerCommandeLink.includes('t.me')) {
                                  if (passerCommandeLink.includes('/+')) {
                                    // Lien d'invitation : copier dans le presse-papiers
                                    try {
                                      await navigator.clipboard.writeText(message);
                                      toast.success('📋 Message copié ! Collez-le dans Telegram après avoir rejoint');
                                    } catch (err) {
                                      console.log('Clipboard non disponible');
                                    }
                                  } else {
                                    // Lien direct : ajouter le message
                                    const separator = passerCommandeLink.includes('?') ? '&' : '?';
                                    finalUrl = `${passerCommandeLink}${separator}text=${encodedMessage}`;
                                  }
                                } else {
                                  // Autre lien : essayer d'ajouter le message
                                  const separator = passerCommandeLink.includes('?') ? '&' : '?';
                                  finalUrl = `${passerCommandeLink}${separator}text=${encodedMessage}`;
                                }
                                
                                window.open(finalUrl, '_blank');
                                toast.success('👩‍💻 Redirection vers le canal de commande !');
                              }}
                              className="w-full rounded-lg bg-gradient-to-r from-green-500 to-green-600 py-3 font-medium text-white hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.66-.52-.38L8.74 13.5l-4.4-1.39c-.96-.3-.96-1.22.07-1.57L22.61 3.6c.84-.35 1.63.34 1.28 1.28l-6.94 18.2c-.35.82-1.27.52-1.57-.07l-1.89-4.48c-.18-.42-.61-.68-1.07-.68-.46 0-.89.26-1.07.68l-1.89 4.48c-.3.59-1.22.89-1.57.07z"/>
                              </svg>
                              Passer ma première commande 👩‍💻
                            </button>
                          </div>
                        );
                      } else {
                        // Plusieurs services : boutons séparés + option globale
                        return (
                          <div className="space-y-3">
                            <div className="text-sm text-blue-400 bg-blue-500/10 p-3 rounded border border-blue-500/20">
                              <p className="font-medium mb-2">📋 Plusieurs services détectés :</p>
                              <p className="text-xs">Vous pouvez envoyer par service séparé ou tout ensemble</p>
                            </div>
                            
                            {/* Boutons par service */}
                            {services.map(service => {
                              const serviceItems = serviceGroups[service];
                              const serviceIcon = service === 'livraison' ? '🚚' : service === 'envoi' ? '📦' : '📍';
                              const serviceName = service === 'livraison' ? 'Livraison' : service === 'envoi' ? 'Envoi' : 'Meetup';
                              const serviceTotal = serviceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                              const hasConfiguredLink = serviceLinks[service];
                              
                              return (
                                <div key={service} className="space-y-2">
                                  <div className="text-xs text-gray-400">{serviceIcon} {serviceName} • {serviceTotal.toFixed(2)}€ • {serviceItems.length} article{serviceItems.length > 1 ? 's' : ''}</div>
                                  
                                  {/* Bouton copier */}
                                  <button
                                    onClick={() => copyOrderMessage(service)}
                                    className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 py-2 font-medium text-white hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Copier mon Recap' commande 📝
                                  </button>
                                  
                                  {/* Bouton première commande */}
                                  <button
                                    onClick={async () => {
                                      const passerCommandeLink = serviceLinks.telegram_passer_commande || orderLink;
                                      if (!passerCommandeLink || passerCommandeLink === '#') {
                                        toast.error('Aucun lien configuré pour passer commande');
                                        return;
                                      }
                                      
                                      // Construire le message de commande complet pour ce service
                                      const serviceTotal = serviceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                                      
                                      let message = `${serviceIcon} COMMANDE ${serviceName}:\n\n`;
                                      
                                      if (service === 'livraison' && serviceItems.length > 0 && serviceItems[0].deliveryAddress) {
                                        message += `${serviceItems[0].deliveryAddress}\n`;
                                        message += `${serviceItems[0].deliveryPostalCode}\n`;
                                        message += `${serviceItems[0].deliveryCity}\n`;
                                        if (serviceItems[0].schedule) {
                                          message += `Horaire demandé: ${serviceItems[0].schedule}\n`;
                                        }
                                        message += `\n`;
                                      }
                                      
                                      serviceItems.forEach((item, index) => {
                                        let productEmoji = '🌿';
                                        const productLower = item.productName.toLowerCase();
                                        if (productLower.includes('mint') || productLower.includes('triangle')) {
                                          productEmoji = '🌵';
                                        } else if (productLower.includes('tropic') || productLower.includes('smooth')) {
                                          productEmoji = '🌴';
                                        } else if (productLower.includes('chocolate') || productLower.includes('dubai')) {
                                          productEmoji = '🌍';
                                        }
                                        
                                        message += `${index + 1}. ${item.productName.toUpperCase()} ${productEmoji}\n`;
                                        message += `• Quantité: ${item.quantity}x ${item.weight}\n`;
                                        
                                        if (item.schedule && service !== 'livraison') {
                                          message += `• ${item.schedule}\n`;
                                        }
                                        
                                        message += '\n';
                                      });
                                      
                                      message += `💰 TOTAL ${serviceTotal.toFixed(2)}€\n\n`;
                                      
                                      if (service === 'livraison') {
                                        message += `Les frais de routes seront indiqué par le standard\n\n`;
                                      }
                                      
                                      message += `Commande générée automatiquement depuis le site web`;
                                      
                                      // Encoder le message
                                      const encodedMessage = encodeURIComponent(message);
                                      
                                      // Construire l'URL avec le message pré-rempli
                                      let finalUrl = passerCommandeLink;
                                      if (passerCommandeLink.includes('t.me')) {
                                        if (passerCommandeLink.includes('/+')) {
                                          // Lien d'invitation : copier dans le presse-papiers
                                          try {
                                            await navigator.clipboard.writeText(message);
                                            toast.success('📋 Message copié ! Collez-le dans Telegram après avoir rejoint');
                                          } catch (err) {
                                            console.log('Clipboard non disponible');
                                          }
                                        } else {
                                          // Lien direct : ajouter le message
                                          const separator = passerCommandeLink.includes('?') ? '&' : '?';
                                          finalUrl = `${passerCommandeLink}${separator}text=${encodedMessage}`;
                                        }
                                      } else {
                                        // Autre lien : essayer d'ajouter le message
                                        const separator = passerCommandeLink.includes('?') ? '&' : '?';
                                        finalUrl = `${passerCommandeLink}${separator}text=${encodedMessage}`;
                                      }
                                      
                                      window.open(finalUrl, '_blank');
                                      toast.success('👩‍💻 Redirection vers le canal de commande !');
                                    }}
                                    className="w-full rounded-lg bg-gradient-to-r from-green-500 to-green-600 py-2 font-medium text-white hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2"
                                  >
                                    Passer ma première commande 👩‍💻
                                  </button>
                                </div>
                              );
                            })}
                            
                            {/* Bouton pour tout envoyer */}
                            <div className="pt-2 border-t border-gray-600">
                              <button
                                onClick={handleSendCompleteOrder}
                                disabled={!isCartReadyForOrder()}
                                className="w-full rounded-lg bg-gradient-to-r from-green-500 to-green-600 py-3 font-medium text-white hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.66-.52-.38L8.74 13.5l-4.4-1.39c-.96-.3-.96-1.22.07-1.57L22.61 3.6c.84-.35 1.63.34 1.28 1.28l-6.94 18.2c-.35.82-1.27.52-1.57-.07l-1.89-4.48c-.18-.42-.61-.68-1.07-.68-.46 0-.89.26-1.07.68l-1.89 4.48c-.3.59-1.22.89-1.57.07z"/>
                                </svg>
                                📱 Envoyer TOUS les services
                              </button>
                            </div>
                          </div>
                        );
                      }
                    })()}
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          // Retour logique : review → schedule → service → cart
                          setCurrentStep('schedule');
                        }}
                        className="flex-1 rounded-lg bg-gray-700 py-3 font-medium text-white hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Modifier options
                      </button>
                      <button
                        onClick={() => setCurrentStep('service')}
                        className="flex-1 rounded-lg bg-gray-600 py-3 font-medium text-white hover:bg-gray-500 transition-colors"
                      >
                        Modifier services
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setIsOpen(false)}
                className="mt-3 w-full rounded-lg bg-gray-600 py-2 font-medium text-white hover:bg-gray-500 transition-colors text-sm"
              >
                Continuer les achats
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}