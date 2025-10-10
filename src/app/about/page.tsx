export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            À propos de CBD Shop
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Votre partenaire de confiance pour des produits CBD de qualité
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Notre Mission
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Chez CBD Shop, nous nous engageons à vous offrir les meilleurs produits CBD 
            disponibles sur le marché. Notre mission est de démocratiser l'accès à des 
            produits de qualité supérieure, cultivés avec respect pour l'environnement 
            et les traditions agricoles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              🌿 Qualité Premium
            </h3>
            <p className="text-gray-600">
              Tous nos produits sont rigoureusement sélectionnés et testés pour garantir 
              leur pureté et leur efficacité. Nous travaillons exclusivement avec des 
              fermes certifiées et respectueuses de l'environnement.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              🚚 Livraison Rapide
            </h3>
            <p className="text-gray-600">
              Recevez vos commandes en 24-48h partout en France. Nous nous engageons 
              à vous livrer rapidement et en toute sécurité vos produits CBD préférés.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Pourquoi nous choisir ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🔬</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tests Rigoureux
              </h3>
              <p className="text-gray-600 text-sm">
                Chaque produit est testé en laboratoire pour garantir sa qualité et sa conformité.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Agriculture Biologique
              </h3>
              <p className="text-gray-600 text-sm">
                Nos fermes partenaires pratiquent une agriculture biologique et durable.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💚</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Engagement Éthique
              </h3>
              <p className="text-gray-600 text-sm">
                Nous nous engageons pour une industrie CBD transparente et responsable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}