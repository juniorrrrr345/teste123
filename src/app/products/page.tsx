import { d1Simple } from '@/lib/d1-simple'
import ProductCard from '@/components/ProductCard'
import { Suspense } from 'react'

async function getProducts() {
  try {
    const products = await d1Simple.getProducts()
    return products
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error)
    return []
  }
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Notre Catalogue CBD
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Découvrez tous nos produits CBD de qualité supérieure
          </p>
        </div>

        <Suspense fallback={<div className="text-center">Chargement des produits...</div>}>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Aucun produit disponible pour le moment.</p>
            </div>
          )}
        </Suspense>
      </div>
    </div>
  )
}