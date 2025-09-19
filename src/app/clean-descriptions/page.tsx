'use client';
import { useState } from 'react';

export default function CleanDescriptionsPage() {
  const [isCleaning, setIsCleaning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleClean = async () => {
    setIsCleaning(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/clean-descriptions', {
        method: 'POST',
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧹 Nettoyage des Descriptions</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Supprimer l'emoji 🏷️ des descriptions</h2>
          <p className="text-gray-300 mb-4">
            Ce script va parcourir tous les produits et supprimer l'emoji 🏷️ de leurs descriptions.
          </p>
          
          <button
            onClick={handleClean}
            disabled={isCleaning}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              isCleaning
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isCleaning ? '⏳ Nettoyage en cours...' : '🧹 Lancer le nettoyage'}
          </button>
        </div>

        {result && (
          <div className={`rounded-lg p-6 ${
            result.success ? 'bg-green-800' : 'bg-red-800'
          }`}>
            <h3 className="text-xl font-semibold mb-4">
              {result.success ? '✅ Résultat' : '❌ Erreur'}
            </h3>
            
            {result.success ? (
              <div>
                <p className="text-green-200 mb-4">{result.message}</p>
                
                {result.cleanedProducts && result.cleanedProducts.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Produits modifiés :</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {result.cleanedProducts.map((product: any, index: number) => (
                        <div key={index} className="bg-gray-700 p-3 rounded">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-300">
                            <div>Avant: "{product.originalDescription}"</div>
                            <div>Après: "{product.cleanedDescription}"</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-red-200">{result.error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}