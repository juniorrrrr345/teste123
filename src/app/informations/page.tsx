import { d1Simple } from '@/lib/d1-simple'
import { notFound } from 'next/navigation'

async function getInformations() {
  try {
    // Pour l'instant, retourner un tableau vide car les informations ne sont pas encore implémentées dans d1Simple
    return []
  } catch (error) {
    console.error('Erreur lors de la récupération des informations:', error)
    return []
  }
}

export default async function InformationsPage() {
  const informations = await getInformations()

  if (informations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Informations
            </h1>
            <p className="text-gray-600">
              Les informations seront bientôt disponibles.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Informations
          </h1>
          <p className="text-lg text-gray-600">
            Retrouvez toutes les informations importantes concernant notre boutique
          </p>
        </div>

        <div className="space-y-8">
          {informations.map((info: any) => (
            <div key={info.id} className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {info.title}
              </h2>
              <div 
                className="prose prose-lg max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: info.content }}
              />
            </div>
          ))}
        </div>

        {/* Informations par défaut si aucune en base */}
        {informations.length === 0 && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Mentions légales
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p>
                  <strong>Éditeur du site :</strong> CBD Shop<br />
                  <strong>Adresse :</strong> 123 Rue du CBD, 75001 Paris<br />
                  <strong>Téléphone :</strong> 01 23 45 67 89<br />
                  <strong>Email :</strong> contact@cbdshop.com
                </p>
                <p>
                  <strong>Hébergement :</strong> Vercel Inc.<br />
                  <strong>Directeur de publication :</strong> CBD Shop
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Conditions Générales de Vente
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <h3>1. Objet</h3>
                <p>
                  Les présentes conditions générales de vente s'appliquent à toutes les commandes 
                  passées sur le site CBD Shop.
                </p>
                
                <h3>2. Produits</h3>
                <p>
                  Tous nos produits CBD respectent la législation française en vigueur. 
                  Le taux de THC est inférieur à 0,2%.
                </p>
                
                <h3>3. Commandes</h3>
                <p>
                  Les commandes sont traitées dans les 24-48h. Nous nous réservons le droit 
                  d'annuler toute commande en cas de problème de stock.
                </p>
                
                <h3>4. Livraison</h3>
                <p>
                  La livraison est effectuée par Colissimo. Les frais de port sont offerts 
                  à partir de 50€ d'achat.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Politique de confidentialité
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p>
                  CBD Shop s'engage à protéger vos données personnelles. Nous collectons 
                  uniquement les informations nécessaires au traitement de votre commande.
                </p>
                <p>
                  Vos données ne sont jamais transmises à des tiers sans votre consentement 
                  explicite.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}