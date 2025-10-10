import { prisma } from '@/lib/prisma'
import { 
  CubeIcon, 
  BuildingOfficeIcon, 
  TagIcon, 
  InformationCircleIcon 
} from '@heroicons/react/24/outline'

async function getStats() {
  try {
    const [products, farms, categories, informations] = await Promise.all([
      prisma.product.count(),
      prisma.farm.count(),
      prisma.category.count(),
      prisma.information.count(),
    ])

    return { products, farms, categories, informations }
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    return { products: 0, farms: 0, categories: 0, informations: 0 }
  }
}

async function getRecentProducts() {
  try {
    const products = await prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        farm: true,
        category: true,
      },
    })
    return products
  } catch (error) {
    console.error('Erreur lors de la récupération des produits récents:', error)
    return []
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()
  const recentProducts = await getRecentProducts()

  const statCards = [
    {
      name: 'Produits',
      value: stats.products,
      icon: CubeIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Fermes',
      value: stats.farms,
      icon: BuildingOfficeIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Catégories',
      value: stats.categories,
      icon: TagIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Informations',
      value: stats.informations,
      icon: InformationCircleIcon,
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="mt-1 text-sm text-gray-500">
          Vue d'ensemble de votre boutique CBD
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${card.color} p-3 rounded-md`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {card.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Products */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Produits récents
          </h3>
          {recentProducts.length > 0 ? (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ferme
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {product.farm.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {product.category.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.price.toFixed(2)}€
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">Aucun produit trouvé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}