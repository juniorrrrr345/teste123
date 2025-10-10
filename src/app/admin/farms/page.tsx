import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import FarmForm from '@/components/FarmForm'

async function getFarms() {
  try {
    const farms = await prisma.farm.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return farms
  } catch (error) {
    console.error('Erreur lors de la récupération des fermes:', error)
    return []
  }
}

export default async function FarmsPage() {
  const farms = await getFarms()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Fermes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les fermes qui fournissent vos produits CBD
          </p>
        </div>
        <Link
          href="/admin/farms/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Nouvelle ferme
        </Link>
      </div>

      {farms.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {farms.map((farm) => (
              <li key={farm.id}>
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {farm.image ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={farm.image}
                          alt={farm.name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {farm.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {farm.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {farm.description}
                      </div>
                      {farm.location && (
                        <div className="text-sm text-gray-500">
                          📍 {farm.location}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      farm.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {farm.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex space-x-1">
                      <Link
                        href={`/admin/farms/${farm.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <button className="text-red-600 hover:text-red-900">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <BuildingOfficeIcon className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune ferme
          </h3>
          <p className="text-gray-500 mb-4">
            Commencez par ajouter votre première ferme.
          </p>
          <Link
            href="/admin/farms/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Ajouter une ferme
          </Link>
        </div>
      )}
    </div>
  )
}