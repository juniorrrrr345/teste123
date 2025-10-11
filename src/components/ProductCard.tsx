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
      className="card-cyber overflow-hidden hover:scale-[1.03] cursor-pointer group touch-manipulation w-full animate-fadeIn"
    >
      {/* Container image avec badge cyberpunk */}
      <div className="relative aspect-square overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            style={{ filter: 'hue-rotate(90deg) contrast(1.2) brightness(0.8)' }}
          />
        ) : (
          <div className="w-full h-full bg-black flex items-center justify-center">
            <div className="neon-text-cyan text-6xl animate-cyberFloat">[IMG]</div>
          </div>
        )}
        
        {/* Overlay cyberpunk */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Badge catégorie cyberpunk */}
        <div className="absolute top-3 left-3 badge-cyber text-xs font-bold px-3 py-1 shadow-lg max-w-[80%] truncate">
          {product.category_icon} {product.category.replace(/\s*📦\s*/g, '').trim()}
        </div>
        
        {/* Indicateur vidéo cyberpunk */}
        {product.video_url && (
          <div className="absolute top-3 right-3 bg-black border border-neon-magenta text-neon-magenta p-2 animate-neonGlow">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          </div>
        )}
        
        {/* Bouton d'action cyberpunk */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="button-cyber px-4 py-2 font-semibold text-sm">
            [ACCESS] →
          </div>
        </div>
      </div>
      
      {/* Informations produit cyberpunk */}
      <div className="p-4">
        <h3 className="neon-text font-bold text-lg mb-2 leading-tight">
          {product.name}
        </h3>
        
        {/* Description du produit avec support Markdown */}
        {product.description && (
          <div className="neon-text-cyan text-sm mb-3 line-clamp-2 leading-relaxed">
            {renderMarkdownToJSX(parseMarkdown(product.description))}
          </div>
        )}
        
        {/* Prix cyberpunk */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold neon-text-magenta animate-neonGlow">
            {product.prices && Object.values(product.prices)[0] ? 
              `${Object.values(product.prices)[0]}€` : 
              '[PRICE]'
            }
          </div>
          <div className="text-sm neon-text-cyan">
            {Object.keys(product.prices)[0] || 'UNIT'}
          </div>
        </div>
      </div>
    </div>
  );
}

export type { Product };