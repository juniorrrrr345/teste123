#!/usr/bin/env node

// Script pour mettre à jour le schéma de la base de données Cloudflare D1
// avec les nouvelles colonnes nécessaires

const ACCOUNT_ID = '7979421604bd07b3bd34d3ed96222512';
const DATABASE_ID = '5ee52135-17f2-43ee-80a8-c20fcaee99d5';
const API_TOKEN = 'ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW';

async function executeSqlOnD1(sql, params = []) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql, params })
  });
  
  if (!response.ok) {
    throw new Error(`D1 Error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

async function updateDatabaseSchema() {
  try {
    console.log('🔄 Mise à jour du schéma de la base de données...');
    
    // Mise à jour de la table settings
    console.log('📝 Mise à jour de la table settings...');
    await executeSqlOnD1(`
      ALTER TABLE settings ADD COLUMN shop_title TEXT DEFAULT 'Ma Boutique';
    `);
    console.log('✅ Colonne shop_title ajoutée');
    
    await executeSqlOnD1(`
      ALTER TABLE settings ADD COLUMN info_content TEXT DEFAULT '';
    `);
    console.log('✅ Colonne info_content ajoutée');
    
    await executeSqlOnD1(`
      ALTER TABLE settings ADD COLUMN contact_content TEXT DEFAULT '';
    `);
    console.log('✅ Colonne contact_content ajoutée');
    
    await executeSqlOnD1(`
      ALTER TABLE settings ADD COLUMN whatsapp_link TEXT DEFAULT '';
    `);
    console.log('✅ Colonne whatsapp_link ajoutée');
    
    await executeSqlOnD1(`
      ALTER TABLE settings ADD COLUMN whatsapp_number TEXT DEFAULT '';
    `);
    console.log('✅ Colonne whatsapp_number ajoutée');
    
    await executeSqlOnD1(`
      ALTER TABLE settings ADD COLUMN scrolling_text TEXT DEFAULT '';
    `);
    console.log('✅ Colonne scrolling_text ajoutée');
    
    await executeSqlOnD1(`
      ALTER TABLE settings ADD COLUMN telegram_livraison TEXT DEFAULT '';
    `);
    console.log('✅ Colonne telegram_livraison ajoutée');
    
    await executeSqlOnD1(`
      ALTER TABLE settings ADD COLUMN telegram_envoi TEXT DEFAULT '';
    `);
    console.log('✅ Colonne telegram_envoi ajoutée');
    
    await executeSqlOnD1(`
      ALTER TABLE settings ADD COLUMN telegram_meetup TEXT DEFAULT '';
    `);
    console.log('✅ Colonne telegram_meetup ajoutée');
    
    await executeSqlOnD1(`
      ALTER TABLE settings ADD COLUMN livraison_schedules TEXT DEFAULT '[]';
    `);
    console.log('✅ Colonne livraison_schedules ajoutée');
    
    await executeSqlOnD1(`
      ALTER TABLE settings ADD COLUMN meetup_schedules TEXT DEFAULT '[]';
    `);
    console.log('✅ Colonne meetup_schedules ajoutée');
    
    await executeSqlOnD1(`
      ALTER TABLE settings ADD COLUMN envoi_schedules TEXT DEFAULT '[]';
    `);
    console.log('✅ Colonne envoi_schedules ajoutée');
    
    // Mise à jour de la table products
    console.log('📝 Mise à jour de la table products...');
    await executeSqlOnD1(`
      ALTER TABLE products ADD COLUMN prices TEXT DEFAULT '{}';
    `);
    console.log('✅ Colonne prices ajoutée');
    
    await executeSqlOnD1(`
      ALTER TABLE products ADD COLUMN video_url TEXT DEFAULT '';
    `);
    console.log('✅ Colonne video_url ajoutée');
    
    // Mise à jour de la table social_links
    console.log('📝 Mise à jour de la table social_links...');
    await executeSqlOnD1(`
      ALTER TABLE social_links ADD COLUMN platform TEXT DEFAULT '';
    `);
    console.log('✅ Colonne platform ajoutée');
    
    await executeSqlOnD1(`
      ALTER TABLE social_links ADD COLUMN is_available BOOLEAN DEFAULT true;
    `);
    console.log('✅ Colonne is_available ajoutée');
    
    console.log('🎉 Mise à jour du schéma terminée avec succès !');
    
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('⚠️  Certaines colonnes existent déjà, continuation...');
    } else {
      console.error('❌ Erreur lors de la mise à jour du schéma:', error);
      throw error;
    }
  }
}

// Exécuter la mise à jour
updateDatabaseSchema()
  .then(() => {
    console.log('✅ Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });