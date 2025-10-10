import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Utiliser les valeurs hardcodées pour éviter les problèmes d'env
    const ACCOUNT_ID = '7979421604bd07b3bd34d3ed96222512';
    const DATABASE_ID = '5ee52135-17f2-43ee-80a8-c20fcaee99d5';
    const API_TOKEN = 'ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW';
    
    const baseUrl = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;
    
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sql: `
          SELECT 
            p.id, p.name, p.description, p.price, 
            p.image as image_url, p.video as video_url, p.stock, p.isActive as is_available,
            c.name as category_name,
            c.image as category_icon,
            p.categoryId as category_id
          FROM products p
          LEFT JOIN categories c ON p.categoryId = c.id
          WHERE p.isActive = 1
          ORDER BY p.createdAt DESC
        `
      })
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    
    if (data.success && data.result?.[0]?.results) {
      const products = data.result[0].results.map((product: any) => {
        return {
          id: product.id,
          name: product.name,
          description: product.description || '',
          category: product.category_name || 'Sans catégorie',
          category_icon: product.category_icon || '🏷️',
          category_id: product.category_id,
          image_url: product.image_url || '',
          video_url: product.video_url || '',
          prices: {}, // Pas de colonne prices dans le schéma actuel
          price: product.price || 0,
          stock: product.stock || 0,
          is_available: product.is_available === 1 || product.is_available === true,
          features: [], // Pas de colonne features dans le schéma actuel
          tags: [] // Pas de colonne tags dans le schéma actuel
        };
      });
      
      return NextResponse.json(products);
    } else {
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('❌ Erreur API produits:', error);
    return NextResponse.json([], { status: 500 });
  }
}