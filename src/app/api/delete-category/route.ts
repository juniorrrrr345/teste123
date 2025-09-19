import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { categoryName, moveToCategory } = await request.json();
    
    if (!categoryName) {
      return NextResponse.json(
        { success: false, error: 'Nom de catégorie requis' },
        { status: 400 }
      );
    }

    console.log(`🗑️ Suppression de la catégorie: ${categoryName}`);
    
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    
    // 1. Récupérer tous les produits
    const productsResponse = await fetch(`${baseUrl}/api/cloudflare/products`);
    if (!productsResponse.ok) {
      throw new Error('Erreur lors de la récupération des produits');
    }
    const products = await productsResponse.json();
    
    // 2. Trouver les produits de cette catégorie
    const productsInCategory = products.filter((product: any) => 
      product.category === categoryName
    );
    
    console.log(`📦 ${productsInCategory.length} produits trouvés dans la catégorie "${categoryName}"`);
    
    // 3. Si on doit déplacer les produits vers une autre catégorie
    if (moveToCategory && productsInCategory.length > 0) {
      console.log(`🔄 Déplacement des produits vers: ${moveToCategory}`);
      
      for (const product of productsInCategory) {
        const updatedProduct = {
          ...product,
          category: moveToCategory,
          category_icon: '📦' // Icône par défaut
        };
        
        const updateResponse = await fetch(`${baseUrl}/api/cloudflare/products/${product._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedProduct),
        });
        
        if (updateResponse.ok) {
          console.log(`✅ Produit déplacé: ${product.name}`);
        } else {
          console.error(`❌ Erreur déplacement ${product.name}:`, await updateResponse.text());
        }
      }
    }
    
    // 4. Récupérer toutes les catégories
    const categoriesResponse = await fetch(`${baseUrl}/api/cloudflare/categories`);
    if (!categoriesResponse.ok) {
      throw new Error('Erreur lors de la récupération des catégories');
    }
    const categories = await categoriesResponse.json();
    
    // 5. Trouver la catégorie à supprimer
    const categoryToDelete = categories.find((cat: any) => cat.name === categoryName);
    
    if (!categoryToDelete) {
      return NextResponse.json({
        success: false,
        error: `Catégorie "${categoryName}" non trouvée`
      });
    }
    
    // 6. Supprimer la catégorie
    const deleteResponse = await fetch(`${baseUrl}/api/cloudflare/categories/${categoryToDelete.id}`, {
      method: 'DELETE',
    });
    
    if (!deleteResponse.ok) {
      throw new Error(`Erreur lors de la suppression de la catégorie: ${await deleteResponse.text()}`);
    }
    
    // 7. Invalider le cache
    try {
      await fetch(`${baseUrl}/api/cache/invalidate`, { method: 'POST' });
      console.log('✅ Cache invalidé');
    } catch (error) {
      console.error('⚠️ Erreur invalidation cache:', error);
    }
    
    console.log(`✅ Catégorie "${categoryName}" supprimée avec succès`);
    
    return NextResponse.json({
      success: true,
      message: `Catégorie "${categoryName}" supprimée avec succès`,
      productsMoved: productsInCategory.length,
      moveToCategory: moveToCategory || null
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression de catégorie:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}