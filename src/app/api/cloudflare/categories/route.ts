import { NextRequest, NextResponse } from 'next/server';

async function executeSqlOnD1(sql: string, params: any[] = []) {
  const ACCOUNT_ID = '7979421604bd07b3bd34d3ed96222512';
  const DATABASE_ID = '732dfabe-3e2c-4d65-8fdc-bc39eb989434';
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

// GET - Récupérer toutes les catégories pour le panel admin
export async function GET() {
  try {
    const data = await executeSqlOnD1('SELECT * FROM categories ORDER BY name ASC');
    
    if (data.success && data.result?.[0]?.results) {
      console.log(`🏷️ Catégories récupérées pour admin: ${data.result[0].results.length}`);
      return NextResponse.json(data.result[0].results);
    } else {
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('❌ Erreur API catégories admin:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST - Créer une nouvelle catégorie
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const sql = `INSERT INTO categories (name, icon, color) VALUES (?, ?, ?)`;
    const values = [
      body.name,
      body.icon || '🏷️',
      body.color || '#3B82F6'
    ];
    
    const data = await executeSqlOnD1(sql, values);
    
    if (data.success) {
      console.log('✅ Catégorie créée avec succès');
      return NextResponse.json({ success: true, id: data.result[0].meta.last_row_id }, { status: 201 });
    } else {
      throw new Error('Erreur création catégorie');
    }
  } catch (error) {
    console.error('❌ Erreur création catégorie:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}