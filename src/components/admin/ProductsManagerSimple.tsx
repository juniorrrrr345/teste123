'use client';
import { useState, useEffect } from 'react';

export default function ProductsManagerSimple() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white">Chargement des produits...</div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">🛍️ Gestion des Produits</h1>
            <p className="text-gray-400 text-sm mt-1">Gestion complète des produits avec D1</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <p className="text-white">Aucun produit trouvé</p>
      </div>
    </div>
  );
}