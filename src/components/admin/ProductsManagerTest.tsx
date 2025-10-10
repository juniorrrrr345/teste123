'use client';
import { useState } from 'react';

export default function ProductsManagerTest() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white">Chargement des produits...</div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <h1 className="text-2xl font-bold text-white">Test Products Manager</h1>
    </div>
  );
}