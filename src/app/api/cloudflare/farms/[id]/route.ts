import { NextRequest, NextResponse } from 'next/server';

// Configuration Cloudflare D1 hardcodée
const CLOUDFLARE_CONFIG = {
  accountId: '7979421604bd07b3bd34d3ed96222512',
  databaseId: '6df2df23-06af-4494-ba0f-30b2061c1def',
  apiToken: 'ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW'
};

async function executeSqlOnD1(sql: string, params: any[] = []) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_CONFIG.accountId}/d1/database/${CLOUDFLARE_CONFIG.databaseId}/query`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_CONFIG.apiToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql, params })
  });
  
  if (!response.ok) {
    throw new Error(`D1 Error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

// GET - Récupérer une farm par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const result = await executeSqlOnD1('SELECT * FROM farms WHERE id = ?', [id]);
    
    if (!result.result?.[0]?.results?.length) {
      return NextResponse.json(
        { error: 'Farm non trouvée' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.result[0].results[0]);
  } catch (error) {
    console.error('Erreur récupération farm:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une farm
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { name, description, location, contact } = body;

    await executeSqlOnD1(
      'UPDATE farms SET name = ?, description = ?, location = ?, contact = ? WHERE id = ?',
      [name, description || '', location || '', contact || '', id]
    );

    // Récupérer la farm mise à jour
    const result = await executeSqlOnD1('SELECT * FROM farms WHERE id = ?', [id]);
    
    return NextResponse.json(result.result[0].results[0]);
  } catch (error) {
    console.error('Erreur mise à jour farm:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une farm
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    // Supprimer la farm
    await executeSqlOnD1('DELETE FROM farms WHERE id = ?', [id]);
    
    return NextResponse.json({ success: true, message: 'Farm supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression farm:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la suppression' },
      { status: 500 }
    );
  }
}