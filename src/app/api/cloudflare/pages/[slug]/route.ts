import { NextRequest, NextResponse } from 'next/server';
import d1Client from '../../../../../lib/cloudflare-d1';

// GET - Récupérer une page par slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
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
      body: JSON.stringify({
        sql: 'SELECT * FROM pages WHERE slug = ? LIMIT 1',
        params: [params.slug]
      })
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    
    if (data.success && data.result?.[0]?.results?.[0]) {
      const page = data.result[0].results[0];
      console.log(`📄 Page ${params.slug} récupérée:`, page.title);
      return NextResponse.json(page);
    } else {
      return NextResponse.json(
        { error: 'Page non trouvée' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Erreur récupération page:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une page
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    const { slug, title, content, is_active = true } = body;
    
    console.log('📝 PUT Page:', { slug: params.slug, title, content });

    // Trouver la page par slug d'abord
    let existingPage = await d1Client.findOne('pages', { slug: params.slug });
    
    if (!existingPage) {
      console.log('📄 Page non trouvée, création...');
      // Créer la page si elle n'existe pas
      const newPage = await d1Client.create('pages', {
        slug: params.slug,
        title,
        content,
        is_active: Boolean(is_active)
      });
      
      console.log('✅ Page créée:', newPage);
      return NextResponse.json({ success: true, data: newPage });
    }

    const updatedPage = await d1Client.update('pages', existingPage.id, {
      title,
      content,
      is_active: Boolean(is_active),
    });

    console.log('✅ Page mise à jour:', updatedPage);
    return NextResponse.json({ success: true, data: updatedPage });
  } catch (error) {
    console.error('❌ Erreur mise à jour page:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une page
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Trouver la page par slug d'abord
    const existingPage = await d1Client.findOne('pages', { slug: params.slug });
    
    if (!existingPage) {
      return NextResponse.json(
        { error: 'Page non trouvée' },
        { status: 404 }
      );
    }
    
    const success = await d1Client.delete('pages', existingPage.id);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Impossible de supprimer la page' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erreur suppression page:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}