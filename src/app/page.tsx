import { d1Simple } from '@/lib/d1-simple'
import ProductCard from '@/components/ProductCard'
import Hero from '@/components/Hero'
import { Suspense } from 'react'

async function getProducts() {
  try {
    const products = await d1Simple.getProducts()
    return products.slice(0, 6) // Limiter à 6 produits
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error)
    return []
  }
}

export default async function Home() {
  const products = await getProducts()

  return (
    <main className="min-h-screen">
      <Hero />
      
      {/* Featured Products Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
              🌿 Produits Premium
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Nos Produits CBD 
              <span className="gradient-text"> Premium</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez notre sélection de produits CBD de qualité supérieure, 
              cultivés avec amour et testés en laboratoire pour votre bien-être.
            </p>
          </div>

          <Suspense fallback={
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          }>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product: any) => (
                <div key={product.id} className="animate-fade-in">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </Suspense>

          {products.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🌱</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Aucun produit disponible</h3>
              <p className="text-gray-500 text-lg">Nous travaillons sur de nouveaux produits pour vous.</p>
            </div>
          )}

          {/* CTA Section */}
          {products.length > 0 && (
            <div className="text-center mt-16">
              <button className="btn-primary text-lg px-8 py-4">
                Voir tous les produits
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Pourquoi nous choisir ?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🌿</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">100% Naturel</h3>
              <p className="text-gray-600">
                Tous nos produits sont cultivés sans pesticides et testés en laboratoire pour garantir leur pureté.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Livraison Rapide</h3>
              <p className="text-gray-600">
                Recevez vos commandes en 24-48h partout en France avec une expédition gratuite dès 50€.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Qualité Certifiée</h3>
              <p className="text-gray-600">
                Nos fermes sont certifiées biologiques et nos produits respectent les normes européennes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}