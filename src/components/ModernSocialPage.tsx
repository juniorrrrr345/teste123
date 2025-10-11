'use client';
import { useState, useEffect } from 'react';
import { Instagram, Facebook, Twitter, Youtube, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

interface SocialLink {
  id: string;
  platform: string;
  name: string;
  url: string;
  icon: string;
  description?: string;
}

interface ModernSocialPageProps {
  socialLinks?: SocialLink[];
  settings?: any;
}

export default function ModernSocialPage({ socialLinks = [], settings = {} }: ModernSocialPageProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  // Icônes par défaut pour les plateformes
  const getPlatformIcon = (platform: string) => {
    const iconMap: { [key: string]: any } = {
      'instagram': Instagram,
      'facebook': Facebook,
      'twitter': Twitter,
      'youtube': Youtube,
      'linkedin': Linkedin,
      'email': Mail,
      'phone': Phone,
      'location': MapPin
    };
    return iconMap[platform.toLowerCase()] || MessageCircle;
  };

  // Couleurs par plateforme
  const getPlatformColor = (platform: string) => {
    const colorMap: { [key: string]: string } = {
      'instagram': 'from-pink-500 to-purple-600',
      'facebook': 'from-blue-600 to-blue-800',
      'twitter': 'from-blue-400 to-blue-600',
      'youtube': 'from-red-500 to-red-700',
      'linkedin': 'from-blue-700 to-blue-900',
      'email': 'from-gray-600 to-gray-800',
      'phone': 'from-green-600 to-green-800',
      'location': 'from-orange-500 to-red-600'
    };
    return colorMap[platform.toLowerCase()] || 'from-gray-600 to-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="bw-text-secondary">Chargement des réseaux sociaux...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white">
      <div className="pt-32 pb-24 px-4 max-w-6xl mx-auto">
        {/* Header de la page */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-black to-gray-600 rounded-full mb-6 shadow-lg">
            <span className="text-3xl">🌐</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black bw-title mb-4">
            Nos Réseaux Sociaux
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-black via-yellow-500 to-black mx-auto rounded-full mb-6"></div>
          <p className="text-xl bw-text-secondary max-w-2xl mx-auto">
            Rejoignez <span className="bw-text-accent font-bold">{settings?.shop_name || 'LANATIONDULAIT'}</span> sur nos plateformes sociales
          </p>
        </div>

        {/* Grille des réseaux sociaux */}
        {socialLinks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {socialLinks.map((link, index) => {
              const IconComponent = getPlatformIcon(link.platform);
              const gradientClass = getPlatformColor(link.platform);
              
              return (
                <a
                  key={link.id || index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bw-product-card bw-hover-lift p-8 text-center transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Icône de la plateforme */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${gradientClass} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  {/* Nom de la plateforme */}
                  <h3 className="text-xl font-bold bw-text-primary mb-3 group-hover:bw-text-accent transition-colors">
                    {link.platform || link.name}
                  </h3>

                  {/* Description */}
                  {link.description && (
                    <p className="bw-text-secondary text-sm mb-4">
                      {link.description}
                    </p>
                  )}

                  {/* Indicateur de lien */}
                  <div className="flex items-center justify-center space-x-2 text-sm bw-text-muted group-hover:bw-text-accent transition-colors">
                    <span>Visiter</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bw-container p-12">
              <div className="text-6xl mb-6">📱</div>
              <h3 className="text-2xl font-bold bw-text-primary mb-4">
                Aucun réseau social configuré
              </h3>
              <p className="bw-text-secondary">
                Les réseaux sociaux seront bientôt disponibles
              </p>
            </div>
          </div>
        )}

        {/* Section d'engagement */}
        <div className="bw-container p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold bw-text-primary mb-6">
            Restez Connecté
          </h2>
          <p className="text-lg bw-text-secondary mb-8 max-w-2xl mx-auto">
            Suivez-nous pour découvrir nos dernières nouveautés, promotions exclusives et actualités de la boutique.
          </p>
          
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-bold bw-text-primary mb-2">Promotions</h3>
              <p className="text-sm bw-text-secondary">Offres exclusives</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📢</span>
              </div>
              <h3 className="font-bold bw-text-primary mb-2">Actualités</h3>
              <p className="text-sm bw-text-secondary">Dernières nouvelles</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="font-bold bw-text-primary mb-2">Communauté</h3>
              <p className="text-sm bw-text-secondary">Échanges et partages</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}