import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/ProductCard'
import Hero from '@/components/Hero'
import { Suspense } from 'react'

async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        farm: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 4, // Limite à 4 produits pour l'affichage 2x2
    })
    return products
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error)
    return []
  }
}

export default async function Home() {
  const products = await getProducts()

  return (
    <main className="min-h-screen bg-gray-50">
      <Hero />
      
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Nos Produits CBD Premium
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Découvrez notre sélection de produits CBD de qualité supérieure
            </p>
          </div>

          <Suspense fallback={<div className="text-center">Chargement des produits...</div>}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {products.map((product, index) => (
                <div key={product.id} className={`${index % 2 === 0 ? 'md:justify-self-end' : 'md:justify-self-start'}`}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </Suspense>

          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Aucun produit disponible pour le moment.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}