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
      className="card-modern hover-lift cursor-pointer group touch-manipulation w-full overflow-hidden"
    >
      {/* Container image avec badge moderne */}
      <div className="relative aspect-square overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
            <div className="text-neutral-400 text-4xl">📷</div>
          </div>
        )}
        
        {/* Badge catégorie moderne */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-primary-700 text-xs font-semibold px-2 py-1 rounded-lg shadow-soft max-w-[80%] truncate border border-primary-200/50">
          {product.category.replace(/\s*📦\s*/g, '').trim()}
        </div>
        
        {/* Indicateur vidéo moderne */}
        {product.video_url && (
          <div className="absolute top-3 right-3 bg-primary-500 text-white p-2 rounded-full shadow-soft">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          </div>
        )}
        
        {/* Overlay gradient moderne au survol */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      {/* Informations produit modernes */}
      <div className="p-4">
        <h3 className="text-neutral-800 font-semibold text-sm mb-2 leading-tight break-words line-clamp-2">
          {product.name}
        </h3>
        
        {/* Description du produit avec support Markdown */}
        {product.description && (
          <div className="text-neutral-600 text-xs mt-2 line-clamp-2 leading-relaxed">
            {renderMarkdownToJSX(parseMarkdown(product.description))}
          </div>
        )}
        
        {/* Prix ou indicateur de prix */}
        <div className="mt-3 flex items-center justify-between">
          <div className="text-primary-600 font-semibold text-sm">
            Voir les prix
          </div>
          <div className="w-2 h-2 bg-accent-gold rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

export type { Product };