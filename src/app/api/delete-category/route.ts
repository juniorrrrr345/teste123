import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

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
    
    // Connexion directe à la base de données
    const client = createClient({
      url: process.env.DATABASE_URL!,
      authToken: process.env.DATABASE_AUTH_TOKEN!,
    });
    
    // 1. Récupérer tous les produits directement de la DB
    const productsResult = await client.execute('SELECT * FROM products WHERE category = ?', [categoryName]);
    const products = productsResult.rows.map(row => ({
      _id: row.id,
      name: row.name,
      category: row.category,
      category_icon: row.category_icon
    }));
    
    console.log(`📦 ${products.length} produits trouvés dans la catégorie "${categoryName}"`);
    
    // 2. Gérer les produits de cette catégorie
    let deletedProducts = 0;
    if (products.length > 0) {
      if (moveToCategory) {
        // Déplacer les produits vers une autre catégorie
        console.log(`🔄 Déplacement des produits vers: ${moveToCategory}`);
        
        for (const product of products) {
          await client.execute(
            'UPDATE products SET category = ?, category_icon = ? WHERE id = ?',
            [moveToCategory, '📦', product._id]
          );
          console.log(`✅ Produit déplacé: ${product.name}`);
        }
      } else {
        // Supprimer tous les produits de cette catégorie
        console.log(`🗑️ Suppression de ${products.length} produits de la catégorie "${categoryName}"`);
        
        for (const product of products) {
          await client.execute('DELETE FROM products WHERE id = ?', [product._id]);
          deletedProducts++;
          console.log(`✅ Produit supprimé: ${product.name}`);
        }
      }
    }
    
    // 3. Récupérer la catégorie à supprimer
    const categoryResult = await client.execute('SELECT * FROM categories WHERE name = ?', [categoryName]);
    
    if (categoryResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: `Catégorie "${categoryName}" non trouvée`
      });
    }
    
    const categoryToDelete = categoryResult.rows[0];
    
    // 4. Supprimer la catégorie
    await client.execute('DELETE FROM categories WHERE id = ?', [categoryToDelete.id]);
    console.log(`✅ Catégorie supprimée: ${categoryName}`);
    
    // 5. Fermer la connexion
    await client.close();
    
    console.log(`✅ Catégorie "${categoryName}" supprimée avec succès`);
    
    return NextResponse.json({
      success: true,
      message: `Catégorie "${categoryName}" supprimée avec succès`,
      deletedProducts: deletedProducts,
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