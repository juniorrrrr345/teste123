import { NextResponse } from 'next/server';

async function executeSqlOnD1(sql: string, params: any[] = []) {
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
    body: JSON.stringify({ sql, params })
  });
  
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  
  const data = await response.json();
  return data;
}

export async function GET() {
  try {
    const data = await executeSqlOnD1('SELECT id, name, description, image as icon, isActive FROM categories WHERE isActive = 1 ORDER BY name ASC');
    
    if (data.success && data.result?.[0]?.results) {
      const categories = data.result[0].results.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description || '',
        icon: cat.icon || '🏷️',
        color: '#3B82F6', // Couleur par défaut
        created_at: cat.createdAt
      }));
      return NextResponse.json(categories);
    } else {
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('❌ Erreur API catégories:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, icon, color } = await request.json();
    
    const id = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const data = await executeSqlOnD1(
      'INSERT INTO categories (id, name, description, image, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, '', icon || '📦', 1, new Date().toISOString(), new Date().toISOString()]
    );
    
    if (data.success) {
      return NextResponse.json({
        id: id,
        name: name,
        description: '',
        icon: icon || '📦',
        color: color || '#22C55E',
        created_at: new Date().toISOString()
      });
    } else {
      throw new Error('Échec création catégorie');
    }
  } catch (error) {
    console.error('❌ Erreur création catégorie:', error);
    return NextResponse.json({ error: 'Erreur création catégorie' }, { status: 500 });
  }
}