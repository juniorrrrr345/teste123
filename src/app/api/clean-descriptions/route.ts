import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Début du nettoyage des descriptions de produits...');
    
    // Récupérer tous les produits
    const productsResponse = await fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/cloudflare/products`);
    
    if (!productsResponse.ok) {
      throw new Error('Erreur lors de la récupération des produits');
    }
    
    const products = await productsResponse.json();
    console.log(`📦 ${products.length} produits trouvés`);
    
    let cleanedCount = 0;
    const cleanedProducts = [];
    
    for (const product of products) {
      if (product.description && product.description.includes('🏷️')) {
        const originalDescription = product.description;
        const cleanedDescription = product.description.replace(/🏷️/g, '').trim();
        
        console.log(`🔧 Nettoyage: ${product.name}`);
        console.log(`   Avant: "${originalDescription}"`);
        console.log(`   Après: "${cleanedDescription}"`);
        
        // Mettre à jour le produit
        const updatedProduct = {
          ...product,
          description: cleanedDescription
        };
        
        // Envoyer la mise à jour
        const updateResponse = await fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/cloudflare/products/${product._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedProduct),
        });
        
        if (updateResponse.ok) {
          cleanedCount++;
          cleanedProducts.push({
            id: product._id,
            name: product.name,
            originalDescription,
            cleanedDescription
          });
        } else {
          console.error(`❌ Erreur mise à jour ${product.name}:`, await updateResponse.text());
        }
      }
    }
    
    console.log(`✅ Nettoyage terminé: ${cleanedCount} descriptions modifiées`);
    
    return NextResponse.json({
      success: true,
      message: `Nettoyage terminé: ${cleanedCount} descriptions modifiées`,
      cleanedCount,
      cleanedProducts
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}