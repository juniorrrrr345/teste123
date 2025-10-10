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
    const data = await executeSqlOnD1('SELECT id, name, description, location, isActive FROM farms WHERE isActive = 1 ORDER BY name ASC');
    
    if (data.success && data.result?.[0]?.results) {
      return NextResponse.json(data.result[0].results);
    } else {
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('❌ Erreur API farms:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, location } = await request.json();
    
    const id = `farm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const data = await executeSqlOnD1(
      'INSERT INTO farms (id, name, description, location, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, description || 'Farm LANATIONDULAIT', location || 'Non spécifié', 1, new Date().toISOString(), new Date().toISOString()]
    );
    
    if (data.success && data.result?.[0]?.results?.[0]) {
      return NextResponse.json(data.result[0].results[0]);
    } else {
      throw new Error('Échec création farm');
    }
  } catch (error) {
    console.error('❌ Erreur création farm:', error);
    return NextResponse.json({ error: 'Erreur création farm' }, { status: 500 });
  }
}