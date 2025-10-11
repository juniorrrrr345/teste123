import MediaDisplay from './MediaDisplay';
import { parseMarkdown, renderMarkdownToJSX } from '@/lib/markdownParser';

interface Product {
  id: number;
  name: string;
  category: string;
  category_icon?: string;
  image_url: string;
  video_url?: string;
  description?: string;
  prices: {
    "5g": number;
    "10g": number;
    "25g": number;
    "50g": number;
    "100g": number;
    "200g": number;
  };
}

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <div 
      onClick={() => onClick(product)}
      className="modern-card overflow-hidden hover:scale-[1.02] cursor-pointer group touch-manipulation w-full animate-fadeIn"
    >
      {/* Container image moderne */}
      <div className="relative aspect-square overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-gray-400 text-4xl">📷</div>
          </div>
        )}
        
        {/* Overlay moderne */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Badge catégorie moderne */}
        <div className="absolute top-3 left-3 modern-badge text-xs font-semibold px-3 py-1 shadow-lg max-w-[80%] truncate">
          {product.category_icon} {product.category.replace(/\s*📦\s*/g, '').trim()}
        </div>
        
        {/* Indicateur vidéo moderne */}
        {product.video_url && (
          <div className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full shadow-lg">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          </div>
        )}
        
        {/* Bouton d'action moderne */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="modern-button px-4 py-2 font-semibold text-sm">
            Voir détails →
          </div>
        </div>
      </div>
      
      {/* Informations produit moderne */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-2 leading-tight">
          {product.name}
        </h3>
        
        {/* Description du produit avec support Markdown */}
        {product.description && (
          <div className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
            {renderMarkdownToJSX(parseMarkdown(product.description))}
          </div>
        )}
        
        {/* Prix moderne */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold gradient-text">
            {product.prices && Object.values(product.prices)[0] ? 
              `${Object.values(product.prices)[0]}€` : 
              'Prix sur demande'
            }
          </div>
          <div className="text-sm text-gray-500">
            {Object.keys(product.prices)[0] || 'unité'}
          </div>
        </div>
      </div>
    </div>
  );
}

export type { Product };