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
    updateService,
    updateSchedule,
    getItemsNeedingService,
    getItemsNeedingSchedule,
    isCartReadyForOrder
  } = useCartStore();
  const [orderLink, setOrderLink] = useState('#'); // Lien de commande par défaut
  const [serviceLinks, setServiceLinks] = useState({
    livraison: '',
    envoi: '',
    meetup: ''
  });
  const [customSchedules, setCustomSchedules] = useState({
    livraison: [] as string[],
    meetup: [] as string[]
  });
  const [currentStep, setCurrentStep] = useState<'cart' | 'service' | 'schedule' | 'review'>('cart');
  
  // Auto-navigation entre les étapes
  useEffect(() => {
    if (items.length === 0) {
      setCurrentStep('cart');
      return;
    }
    
    const itemsNeedingService = getItemsNeedingService();
    const itemsNeedingSchedule = getItemsNeedingSchedule();
    
    if (itemsNeedingService.length > 0) {
      if (currentStep === 'schedule' || currentStep === 'review') {
        setCurrentStep('service');
      }
    } else if (itemsNeedingSchedule.length > 0) {
      if (currentStep === 'review') {
        setCurrentStep('schedule');
      }
    }
  }, [items, getItemsNeedingService, getItemsNeedingSchedule, currentStep]);
  
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
          meetup: data.telegram_meetup || data.meetup || ''
        });
        
        // Charger les horaires personnalisés
        setCustomSchedules({
          livraison: data.livraison_schedules || [],
          meetup: data.meetup_schedules || []
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
          meetup: data.meetup_schedules
        });
      })
      .catch((error) => {
        console.error('❌ Erreur chargement settings commande:', error);
      });
  }, []);
  
  const handleSendOrder = async () => {
    if (items.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }
    
    if (!isCartReadyForOrder()) {
      toast.error('Veuillez compléter toutes les informations de livraison');
      return;
    }
    
    // Calculer le total
    const total = getTotalPrice();
    
    // Construire le message pour Telegram/WhatsApp (format plus simple)
    let message = `🛒 *DÉTAIL DE LA COMMANDE COMPLÈTE:*\n\n`;
    
    items.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      const serviceIcon = item.service === 'livraison' ? '🚚' : item.service === 'envoi' ? '📦' : '📍';
      const serviceName = item.service === 'livraison' ? 'Livraison' : item.service === 'envoi' ? 'Envoi postal' : 'Point de rencontre';
      
      message += `${index + 1}. ${item.productName}\n`;
      message += `• Quantité: ${item.quantity}x ${item.weight}\n`;
      message += `• Prix unitaire: ${item.originalPrice}€\n`;
      message += `• Total: ${itemTotal.toFixed(2)}€\n`;
      
      if (item.discount > 0) {
        message += `• Remise: -${item.discount}%\n`;
      }
      
      message += `• Service: ${serviceIcon} ${serviceName}\n`;
      
      if (item.schedule) {
        message += `• Horaire: ${item.schedule}\n`;
      }
      
      message += '\n';
    });
    
    message += `💰 *TOTAL: ${total.toFixed(2)}€*\n\n`;
    
    // Résumé des services
    const serviceGroups = items.reduce((acc: Record<string, any[]>, item) => {
      const key = item.service!;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
    
    message += `📋 *RÉSUMÉ DES SERVICES:*\n`;
    Object.entries(serviceGroups).forEach(([service, serviceItems]: [string, any[]]) => {
      const serviceIcon = service === 'livraison' ? '🚚' : service === 'envoi' ? '📦' : '📍';
      const serviceName = service === 'livraison' ? 'Livraison à domicile' : service === 'envoi' ? 'Envoi postal' : 'Point de rencontre';
      message += `${serviceIcon} ${serviceName}: ${serviceItems.length} article(s)\n`;
      
      // Afficher les créneaux uniques pour cette catégorie de service
      const schedules = [...new Set(serviceItems.map((item: any) => item.schedule).filter(Boolean))];
      schedules.forEach((schedule: string) => {
        message += `  ⏰ ${schedule}\n`;
      });
    });
    
    // Déterminer le service principal de la commande
    const primaryService = items.reduce((acc: Record<string, number>, item) => {
      const service = item.service!;
      acc[service] = (acc[service] || 0) + 1;
      return acc;
    }, {});
    
    // Trouver le service le plus utilisé
    const dominantService = Object.entries(primaryService).sort(([,a], [,b]) => b - a)[0]?.[0] as 'livraison' | 'envoi' | 'meetup';
    
    // Choisir le bon lien selon le service dominant
    let chosenLink = orderLink; // Fallback par défaut
    
    if (dominantService && serviceLinks[dominantService]) {
      chosenLink = serviceLinks[dominantService];
      console.log(`📱 Utilisation du lien spécifique pour ${dominantService}:`, chosenLink);
    } else {
      console.log('📱 Utilisation du lien principal (fallback):', chosenLink);
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
      // Gérer différents formats de liens Telegram
      if (chosenLink.includes('?')) {
        // Le lien a déjà des paramètres
        finalUrl = `${chosenLink}&text=${encodedMessage}`;
      } else {
        // Lien simple, ajouter le paramètre text
        finalUrl = `${chosenLink}?text=${encodedMessage}`;
      }
    } else {
      // Autre lien : essayer d'ajouter le message quand même
      const separator = chosenLink.includes('?') ? '&' : '?';
      finalUrl = `${chosenLink}${separator}text=${encodedMessage}`;
    }
    
    console.log('📱 Ouverture lien commande:', finalUrl);
    console.log('📋 Message:', message);
    
    // Ouvrir le lien de commande avec le message pré-rempli
    window.open(finalUrl, '_blank');
    
    // Afficher un message de succès
    toast.success('📱 Redirection vers Telegram avec votre commande...');
    
    // Optionnel : vider le panier après un délai
    setTimeout(() => {
      clearCart();
      setIsOpen(false);
    }, 2000);
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
                  {currentStep === 'schedule' && 'Horaires'}
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
              <div className="flex items-center gap-2 text-xs">
                <div className={`flex items-center gap-1 ${currentStep === 'cart' ? 'text-green-400' : 'text-gray-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${currentStep === 'cart' ? 'bg-green-400' : 'bg-gray-600'}`}></span>
                  Panier
                </div>
                <ArrowRight className="w-3 h-3 text-gray-600" />
                <div className={`flex items-center gap-1 ${currentStep === 'service' ? 'text-green-400' : 'text-gray-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${currentStep === 'service' || (currentStep === 'schedule' || currentStep === 'review') && getItemsNeedingService().length === 0 ? 'bg-green-400' : 'bg-gray-600'}`}></span>
                  Service
                </div>
                <ArrowRight className="w-3 h-3 text-gray-600" />
                <div className={`flex items-center gap-1 ${currentStep === 'schedule' ? 'text-green-400' : 'text-gray-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${currentStep === 'schedule' || (currentStep === 'review' && getItemsNeedingSchedule().length === 0) ? 'bg-green-400' : 'bg-gray-600'}`}></span>
                  Horaire
                </div>
                <ArrowRight className="w-3 h-3 text-gray-600" />
                <div className={`flex items-center gap-1 ${currentStep === 'review' ? 'text-green-400' : 'text-gray-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${currentStep === 'review' ? 'bg-green-400' : 'bg-gray-600'}`}></span>
                  Commande
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
                      Choisissez le mode de réception pour vos articles
                    </div>
                    
                    {getItemsNeedingService().map((item) => (
                      <div key={`service-${item.productId}-${item.weight}`} className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                          <img src={item.image} alt={item.productName} className="w-12 h-12 object-cover rounded" />
                          <div className="flex-1">
                            <p className="font-medium text-white">{item.productName}</p>
                            <p className="text-sm text-gray-400">{item.weight}</p>
                          </div>
                        </div>
                        
                        <ServiceSelector
                          selectedService={item.service}
                          onServiceSelect={(service) => updateService(item.productId, item.weight, service)}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Étape 3: Sélection des horaires */}
                {currentStep === 'schedule' && (
                  <div className="space-y-6">
                    <div className="text-sm text-gray-400 bg-gray-800/30 p-3 rounded-lg">
                      Choisissez vos créneaux horaires
                    </div>
                    
                    {getItemsNeedingSchedule().map((item) => (
                      <div key={`schedule-${item.productId}-${item.weight}`} className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                          <img src={item.image} alt={item.productName} className="w-12 h-12 object-cover rounded" />
                          <div className="flex-1">
                            <p className="font-medium text-white">{item.productName}</p>
                            <p className="text-sm text-gray-400">{item.weight}</p>
                            <p className="text-sm text-green-400">
                              {item.service === 'livraison' ? '🚚 Livraison' : '📍 Point de rencontre'}
                            </p>
                          </div>
                        </div>
                        
                        <ScheduleSelector
                          selectedSchedule={item.schedule}
                          onScheduleSelect={(schedule) => updateSchedule(item.productId, item.weight, schedule)}
                          serviceType={item.service as 'livraison' | 'meetup'}
                          customSchedules={item.service === 'livraison' ? customSchedules.livraison : customSchedules.meetup}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Étape 4: Récapitulatif */}
                {currentStep === 'review' && (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-400 bg-gray-800/30 p-3 rounded-lg">
                      Vérifiez votre commande avant envoi
                    </div>
                    
                    <div className="text-sm text-blue-400 bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg flex items-start gap-2">
                      <span className="text-lg">📱</span>
                      <div>
                        <div className="font-medium">Comment ça marche :</div>
                        <div className="text-xs opacity-90 mt-1">
                          • Telegram s'ouvrira avec votre commande pré-remplie<br/>
                          • Il vous suffira de cliquer "Envoyer" dans Telegram<br/>
                          • Aucune copie/collage nécessaire !
                        </div>
                        {(() => {
                          const primaryService = items.reduce((acc: Record<string, number>, item) => {
                            const service = item.service!;
                            acc[service] = (acc[service] || 0) + 1;
                            return acc;
                          }, {});
                          const dominantService = Object.entries(primaryService).sort(([,a], [,b]) => b - a)[0]?.[0] as 'livraison' | 'envoi' | 'meetup';
                          
                          if (dominantService && serviceLinks[dominantService]) {
                            const serviceNames = {
                              livraison: 'Livraison à domicile',
                              envoi: 'Envoi postal', 
                              meetup: 'Point de rencontre'
                            };
                            return (
                              <div className="text-xs text-green-400 mt-2 p-2 bg-green-500/10 rounded border border-green-500/20">
                                🎯 Direction: Canal {serviceNames[dominantService]}
                              </div>
                            );
                          }
                          return null;
                        })()}
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
                                  {item.service === 'livraison' ? '🚚 Livraison' : 
                                   item.service === 'envoi' ? '📦 Envoi postal' : 
                                   '📍 Point de rencontre'}
                                </span>
                              </div>
                              {item.schedule && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-gray-400">Horaire:</span>
                                  <span className="text-white">{item.schedule}</span>
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
                    className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 py-3 font-medium text-white hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="w-5 h-5" />
                    Choisir le mode de livraison
                  </button>
                )}

                {currentStep === 'service' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCurrentStep('cart')}
                      className="flex-1 rounded-lg bg-gray-700 py-3 font-medium text-white hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Retour
                    </button>
                    <button
                      onClick={() => {
                        if (getItemsNeedingService().length === 0) {
                          if (getItemsNeedingSchedule().length > 0) {
                            setCurrentStep('schedule');
                          } else {
                            setCurrentStep('review');
                          }
                        } else {
                          toast.error('Veuillez choisir un service pour tous les articles');
                        }
                      }}
                      disabled={getItemsNeedingService().length > 0}
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
                      onClick={() => setCurrentStep('service')}
                      className="flex-1 rounded-lg bg-gray-700 py-3 font-medium text-white hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Retour
                    </button>
                    <button
                      onClick={() => {
                        if (getItemsNeedingSchedule().length === 0) {
                          setCurrentStep('review');
                        } else {
                          toast.error('Veuillez choisir un horaire pour tous les articles nécessaires');
                        }
                      }}
                      disabled={getItemsNeedingSchedule().length > 0}
                      className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 py-3 font-medium text-white hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continuer
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {currentStep === 'review' && (
                  <div className="space-y-3">
                    <button
                      onClick={handleSendOrder}
                      disabled={!isCartReadyForOrder()}
                      className="w-full rounded-lg bg-gradient-to-r from-green-500 to-green-600 py-3 font-medium text-white hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.66-.52-.38L8.74 13.5l-4.4-1.39c-.96-.3-.96-1.22.07-1.57L22.61 3.6c.84-.35 1.63.34 1.28 1.28l-6.94 18.2c-.35.82-1.27.52-1.57-.07l-1.89-4.48c-.18-.42-.61-.68-1.07-.68-.46 0-.89.26-1.07.68l-1.89 4.48c-.3.59-1.22.89-1.57.07z"/>
                      </svg>
                      📱 Envoyer vers Telegram
                    </button>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          if (getItemsNeedingSchedule().length > 0) {
                            setCurrentStep('schedule');
                          } else {
                            setCurrentStep('service');
                          }
                        }}
                        className="flex-1 rounded-lg bg-gray-700 py-3 font-medium text-white hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Modifier
                      </button>
                      <button
                        onClick={() => setCurrentStep('cart')}
                        className="flex-1 rounded-lg bg-gray-800 py-3 font-medium text-white hover:bg-gray-700 transition-colors"
                      >
                        Voir le panier
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