'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bars3Icon, XMarkIcon, ShoppingCartIcon, MagnifyingGlassIcon, UserIcon } from '@heroicons/react/24/outline'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { href: '/', label: 'Accueil' },
    { href: '/products', label: 'Produits' },
    { href: '/farms', label: 'Nos Fermes' },
    { href: '/about', label: 'À propos' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'glass-effect shadow-lg backdrop-blur-md' 
        : 'bg-white/95 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="relative">
              <div className="text-3xl font-bold gradient-text group-hover:scale-110 transition-transform duration-300">
                🌿 CBD Shop
              </div>
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-green-500 to-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-4 py-2 text-gray-700 hover:text-green-600 font-medium transition-all duration-300 group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-green-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Search */}
            <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
            
            {/* Cart */}
            <button className="relative p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300">
              <ShoppingCartIcon className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                  {cartCount}
                </span>
              )}
            </button>
            
            {/* User */}
            <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300">
              <UserIcon className="h-5 w-5" />
            </button>
            
            {/* Admin Link */}
            <Link 
              href="/admin" 
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-300"
            >
              Admin
            </Link>
            
            {/* CTA Button */}
            <button className="btn-primary">
              Commander
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-300"
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-2 pt-2 pb-4 space-y-1 bg-white/95 backdrop-blur-md rounded-2xl mt-2 shadow-lg border border-white/20">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-3 text-gray-700 hover:text-green-600 hover:bg-green-50 font-medium rounded-xl transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <div className="flex space-x-2">
                <button className="flex-1 flex items-center justify-center p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300">
                  <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                  Rechercher
                </button>
                <button className="flex-1 flex items-center justify-center p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300">
                  <ShoppingCartIcon className="h-5 w-5 mr-2" />
                  Panier
                </button>
              </div>
              
              <Link
                href="/admin"
                className="block px-4 py-3 text-gray-500 hover:text-gray-700 font-medium rounded-xl transition-colors duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>
              
              <button className="w-full btn-primary">
                Commander maintenant
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header