'use client';
import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, MessageCircle } from 'lucide-react';

interface ModernContactPageProps {
  content?: string;
}

export default function ModernContactPage({ content }: ModernContactPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique d'envoi du formulaire
    console.log('Formulaire envoyé:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white">
      <div className="pt-32 pb-24 px-4 max-w-6xl mx-auto">
        {/* Header de la page */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-black to-gray-600 rounded-full mb-6 shadow-lg">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black bw-title mb-4">
            Contactez-Nous
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-black via-yellow-500 to-black mx-auto rounded-full mb-6"></div>
          <p className="text-xl bw-text-secondary max-w-2xl mx-auto">
            Une question ? Un besoin particulier ? Notre équipe est à votre écoute.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Informations de contact */}
          <div className="space-y-8">
            <div className="bw-container p-8">
              <h2 className="text-2xl font-bold bw-text-primary mb-6">
                Nos Coordonnées
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-black to-gray-600 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold bw-text-primary">Téléphone</h3>
                    <p className="bw-text-secondary">+33 1 23 45 67 89</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-black to-gray-600 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold bw-text-primary">Email</h3>
                    <p className="bw-text-secondary">contact@lanationdulait.fr</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-black to-gray-600 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold bw-text-primary">Adresse</h3>
                    <p className="bw-text-secondary">123 Rue du Commerce<br />75001 Paris, France</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-black to-gray-600 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold bw-text-primary">Horaires</h3>
                    <p className="bw-text-secondary">
                      Lun - Ven: 9h00 - 18h00<br />
                      Sam: 9h00 - 16h00<br />
                      Dim: Fermé
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenu personnalisé */}
            {content && (
              <div className="bw-container p-8">
                <h2 className="text-2xl font-bold bw-text-primary mb-4">
                  Informations Supplémentaires
                </h2>
                <div className="bw-text-secondary">
                  {content}
                </div>
              </div>
            )}
          </div>

          {/* Formulaire de contact */}
          <div className="bw-container p-8">
            <h2 className="text-2xl font-bold bw-text-primary mb-6">
              Envoyez-nous un Message
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold bw-text-primary mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold bw-text-primary mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold bw-text-primary mb-2">
                  Sujet *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors"
                  placeholder="Sujet de votre message"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold bw-text-primary mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors resize-none"
                  placeholder="Votre message..."
                />
              </div>

              <button
                type="submit"
                className="w-full bw-button text-lg py-4"
              >
                Envoyer le Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}