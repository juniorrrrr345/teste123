'use client';
import { useState, useEffect, useRef } from 'react';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

export default function CategoryFilter({ 
  selectedCategory, 
  onCategoryChange, 
  categories
}: CategoryFilterProps) {
  const [showCategories, setShowCategories] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  // Fermer les dropdowns en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setShowCategories(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="sticky top-0 z-30 cyber-bg border-b border-neon-green">
      <div className="flex flex-col sm:flex-row gap-3 p-4 max-w-7xl mx-auto">
        {/* Dropdown Catégories cyberpunk */}
        <div className="relative flex-1" ref={categoryRef}>
          <button
            onClick={() => {
              setShowCategories(!showCategories);
            }}
            className="w-full button-cyber py-3 px-4 text-sm font-semibold transition-all duration-300 flex items-center justify-between group hover:scale-105"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black border border-neon-green flex items-center justify-center animate-neonGlow">
                <svg className="w-5 h-5 neon-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
              <span className="truncate text-base font-bold neon-text">{selectedCategory.replace(/\s*📦\s*/g, '').trim()}</span>
            </div>
            <svg className={`w-5 h-5 transition-all duration-300 flex-shrink-0 ${showCategories ? 'rotate-180 neon-text-cyan' : 'neon-text'}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          
          {showCategories && (
            <div className="absolute top-full left-0 right-0 mt-3 card-cyber shadow-2xl z-[9999] overflow-hidden animate-scaleIn">
              {/* En-tête du dropdown cyberpunk */}
              <div className="px-6 py-4 bg-black border-b border-neon-green">
                <div className="flex items-center justify-between">
                  <span className="neon-text font-bold text-lg">[CATEGORIES]</span>
                  <span className="badge-cyber">{categories.length - 1}</span>
                </div>
              </div>
              
              {/* Liste cyberpunk */}
              <div className="max-h-60 sm:max-h-64 lg:max-h-72 overflow-y-auto scrollbar-hide">
                {categories.map((category, index) => (
                  <button
                    key={category}
                    onClick={() => {
                      onCategoryChange(category);
                      setShowCategories(false);
                    }}
                    className={`w-full text-left px-6 py-4 text-sm font-medium hover:bg-black/50 transition-all duration-200 border-b border-neon-green/30 last:border-b-0 group ${
                      selectedCategory === category ? 'bg-black/50 neon-text border-l-4 border-l-neon-green' : 'neon-text-cyan'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex-1 font-medium group-hover:translate-x-2 transition-transform">{category.replace(/\s*📦\s*/g, '').trim()}</span>
                      {selectedCategory === category && (
                        <div className="w-6 h-6 bg-black border border-neon-green flex items-center justify-center animate-neonGlow">
                          <svg className="w-4 h-4 neon-text" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}