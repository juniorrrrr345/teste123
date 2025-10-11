'use client';
import { parseMarkdown, renderMarkdownToJSX } from '@/lib/markdownParser';

interface ModernInfoPageProps {
  content: string;
  title?: string;
  icon?: string;
}

export default function ModernInfoPage({ content, title = "Informations", icon = "ℹ️" }: ModernInfoPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white">
      <div className="pt-32 pb-24 px-4 max-w-4xl mx-auto">
        {/* Header de la page */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-black to-gray-600 rounded-full mb-6 shadow-lg">
            <span className="text-3xl">{icon}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black bw-title mb-4">
            {title}
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-black via-yellow-500 to-black mx-auto rounded-full"></div>
        </div>

        {/* Contenu principal */}
        <div className="bw-container p-8 md:p-12">
          <div className="prose prose-lg max-w-none">
            <div className="bw-text-primary leading-relaxed">
              {renderMarkdownToJSX(parseMarkdown(content))}
            </div>
          </div>
        </div>

        {/* Section d'action */}
        <div className="mt-12 text-center">
          <div className="bw-container p-8">
            <h3 className="text-2xl font-bold bw-text-primary mb-4">
              Besoin d'aide ?
            </h3>
            <p className="bw-text-secondary mb-6">
              Notre équipe est là pour vous accompagner
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bw-button">
                Nous Contacter
              </button>
              <button className="bw-button-secondary">
                Voir le Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}