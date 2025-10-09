import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  productName: string;
  image: string;
  weight: string;
  price: number;
  quantity: number;
  originalPrice: number;
  discount: number;
}

export interface CartMetadata {
  clientType?: 'nouveau' | 'confirme';
}

export interface DeliveryService {
  id: 'livraison' | 'envoi' | 'meetup';
  name: string;
  icon: string;
  description: string;
  needsSchedule: boolean;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  // Informations globales pour tout le panier
  service?: 'livraison' | 'envoi' | 'meetup';
  schedule?: string;
  deliveryAddress?: string;
  deliveryPostalCode?: string;
  deliveryCity?: string;
  clientType?: 'nouveau' | 'confirme';
  
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string, weight: string) => void;
  updateQuantity: (productId: string, weight: string, quantity: number) => void;
  setService: (service: 'livraison' | 'envoi' | 'meetup') => void;
  setSchedule: (schedule: string) => void;
  setDeliveryInfo: (address: string, postalCode: string, city: string) => void;
  setClientType: (type: 'nouveau' | 'confirme') => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  setIsOpen: (isOpen: boolean) => void;
  isCartReadyForOrder: () => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      service: undefined,
      schedule: undefined,
      deliveryAddress: undefined,
      deliveryPostalCode: undefined,
      deliveryCity: undefined,
      clientType: undefined,
      
      addItem: (item) => set((state) => {
        const existingItemIndex = state.items.findIndex(
          (i) => i.productId === item.productId && i.weight === item.weight
        );
        
        if (existingItemIndex > -1) {
          const newItems = [...state.items];
          newItems[existingItemIndex].quantity += 1;
          return { items: newItems };
        }
        
        return { items: [...state.items, { ...item, quantity: 1 }] };
      }),
      
      removeItem: (productId, weight) => set((state) => ({
        items: state.items.filter(
          (item) => !(item.productId === productId && item.weight === weight)
        )
      })),
      
      updateQuantity: (productId, weight, quantity) => set((state) => {
        if (quantity <= 0) {
          return {
            items: state.items.filter(
              (item) => !(item.productId === productId && item.weight === weight)
            )
          };
        }
        
        const newItems = state.items.map((item) =>
          item.productId === productId && item.weight === weight
            ? { ...item, quantity }
            : item
        );
        
        return { items: newItems };
      }),
      
      clearCart: () => set({ 
        items: [], 
        service: undefined, 
        schedule: undefined, 
        deliveryAddress: undefined,
        deliveryPostalCode: undefined,
        deliveryCity: undefined,
        clientType: undefined
      }),
      
      getTotalPrice: () => {
        const items = get().items;
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      getTotalItems: () => {
        const items = get().items;
        return items.reduce((total, item) => total + item.quantity, 0);
      },
      
      setService: (service) => set({ service }),
      
      setSchedule: (schedule) => set({ schedule }),
      
      setDeliveryInfo: (address, postalCode, city) => set({ 
        deliveryAddress: address, 
        deliveryPostalCode: postalCode, 
        deliveryCity: city 
      }),
      
      setClientType: (type) => set({ clientType: type }),
      
      isCartReadyForOrder: () => {
        const state = get();
        
        // Vérifier qu'il y a des articles
        if (state.items.length === 0) return false;
        
        // Vérifier qu'un service est sélectionné
        if (!state.service) return false;
        
        // Vérifier qu'un horaire est sélectionné
        if (!state.schedule) return false;
        
        // Si c'est une livraison, vérifier l'adresse
        if (state.service === 'livraison') {
          if (!state.deliveryAddress || !state.deliveryPostalCode || !state.deliveryCity) {
            return false;
          }
        }
        
        return true;
      },
      
      setIsOpen: (isOpen) => set({ isOpen })
    }),
    {
      name: 'cart-storage'
    }
  )
);