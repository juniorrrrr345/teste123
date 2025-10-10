import { d1Simple } from '@/lib/d1-simple'
import Image from 'next/image'

async function getFarms() {
  try {
    const farms = await d1Simple.getFarms()
    return farms
  } catch (error) {
    console.error('Erreur lors de la récupération des fermes:', error)
    return []
  }
}

export default async function FarmsPage() {
  const farms = await getFarms()

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Nos Fermes Partenaires
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Découvrez les fermes qui cultivent nos produits CBD avec passion
          </p>
        </div>

        {farms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {farms.map((farm: any) => (
              <div key={farm.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-64">
                  {farm.image ? (
                    <Image
                      src={farm.image}
                      alt={farm.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-500 text-4xl">🌿</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {farm.name}
                  </h3>
                  {farm.description && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {farm.description}
                    </p>
                  )}
                  {farm.location && (
                    <div className="flex items-center text-gray-500 text-sm">
                      <span className="mr-2">📍</span>
                      {farm.location}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Aucune ferme disponible pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}