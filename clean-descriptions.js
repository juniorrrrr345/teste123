/**
 * Script pour nettoyer les descriptions de produits
 * Supprime l'emoji 🏷️ des descriptions
 */

const { createClient } = require('@libsql/client');

async function cleanProductDescriptions() {
  console.log('🧹 Début du nettoyage des descriptions de produits...');
  
  // Configuration de la base de données
  const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  try {
    // Récupérer tous les produits avec des descriptions
    const result = await client.execute(`
      SELECT id, name, description 
      FROM products 
      WHERE description IS NOT NULL AND description != ''
    `);

    console.log(`📦 ${result.rows.length} produits trouvés avec des descriptions`);

    let cleanedCount = 0;

    for (const row of result.rows) {
      const id = row.id;
      const name = row.name;
      const originalDescription = row.description;
      
      // Supprimer l'emoji 🏷️ de la description
      const cleanedDescription = originalDescription.replace(/🏷️/g, '').trim();
      
      // Vérifier si la description a changé
      if (cleanedDescription !== originalDescription) {
        console.log(`🔧 Nettoyage: ${name}`);
        console.log(`   Avant: "${originalDescription}"`);
        console.log(`   Après: "${cleanedDescription}"`);
        
        // Mettre à jour la description
        await client.execute({
          sql: 'UPDATE products SET description = ? WHERE id = ?',
          args: [cleanedDescription, id]
        });
        
        cleanedCount++;
      }
    }

    console.log(`✅ Nettoyage terminé: ${cleanedCount} descriptions modifiées`);
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  } finally {
    await client.close();
  }
}

// Exécuter le script
cleanProductDescriptions().catch(console.error);