import Link from 'next/link'

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <div className="text-3xl font-bold gradient-text">
                🌿 CBD Shop
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md text-lg leading-relaxed">
              Votre destination premium pour des produits CBD de qualité supérieure, 
              cultivés avec amour et respect de l'environnement en France.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4 mb-6">
              <a href="#" className="w-10 h-10 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                <span className="text-white font-bold">f</span>
              </a>
              <a href="#" className="w-10 h-10 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                <span className="text-white font-bold">ig</span>
              </a>
              <a href="#" className="w-10 h-10 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                <span className="text-white font-bold">tw</span>
              </a>
              <a href="#" className="w-10 h-10 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                <span className="text-white font-bold">yt</span>
              </a>
            </div>

            {/* Newsletter */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
              <h4 className="text-lg font-semibold mb-3">Newsletter</h4>
              <p className="text-gray-300 text-sm mb-4">
                Recevez nos dernières actualités et offres exclusives
              </p>
              <div className="flex space-x-2">
                <input 
                  type="email" 
                  placeholder="Votre email" 
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-300">
                  S'abonner
                </button>
              </div>
            </div>
          </div>

          {/* Menu */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-green-400">Liens Rapides</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-gray-300 hover:text-green-400 transition-colors duration-300 hover:translate-x-1 inline-block">Accueil</Link></li>
              <li><Link href="/products" className="text-gray-300 hover:text-green-400 transition-colors duration-300 hover:translate-x-1 inline-block">Produits</Link></li>
              <li><Link href="/farms" className="text-gray-300 hover:text-green-400 transition-colors duration-300 hover:translate-x-1 inline-block">Nos Fermes</Link></li>
              <li><Link href="/about" className="text-gray-300 hover:text-green-400 transition-colors duration-300 hover:translate-x-1 inline-block">À propos</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-green-400 transition-colors duration-300 hover:translate-x-1 inline-block">Contact</Link></li>
              <li><Link href="/admin" className="text-gray-400 hover:text-gray-300 transition-colors duration-300 hover:translate-x-1 inline-block text-sm">Admin</Link></li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-green-400">Contact</h3>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-start space-x-3">
                <span className="text-green-400 mt-1">📧</span>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm">contact@cbdshop.fr</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-green-400 mt-1">📞</span>
                <div>
                  <p className="font-medium">Téléphone</p>
                  <p className="text-sm">01 23 45 67 89</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-green-400 mt-1">📍</span>
                <div>
                  <p className="font-medium">Adresse</p>
                  <p className="text-sm">123 Rue de la Paix<br />75001 Paris, France</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-green-400 mt-1">🕒</span>
                <div>
                  <p className="font-medium">Horaires</p>
                  <p className="text-sm">Lun-Ven: 9h-18h</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              <p>&copy; 2024 CBD Shop. Tous droits réservés.</p>
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href="/informations" className="text-gray-400 hover:text-green-400 transition-colors duration-300">Mentions légales</Link>
              <Link href="/informations" className="text-gray-400 hover:text-green-400 transition-colors duration-300">CGV</Link>
              <Link href="/informations" className="text-gray-400 hover:text-green-400 transition-colors duration-300">Politique de confidentialité</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer