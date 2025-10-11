'use client';
import { useState, useEffect } from 'react';

export default function OrdersManagerSimple() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

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
          <p className="text-gray-400 text-sm mt-1">Gestion des commandes avec D1</p>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <p className="text-white">Aucune commande trouvée</p>
      </div>
    </div>
  );
}