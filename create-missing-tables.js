#!/usr/bin/env node

// Script pour créer les tables manquantes

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

async function createMissingTables() {
  try {
    console.log('🔄 Création des tables manquantes...');
    
    // Créer la table settings
    console.log('📝 Création de la table settings...');
    await executeSqlOnD1(`
      CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY,
        shop_name TEXT DEFAULT 'LANATIONDULAIT',
        shop_title TEXT DEFAULT 'LANATIONDULAIT',
        admin_password TEXT DEFAULT 'admin123',
        background_image TEXT DEFAULT '',
        background_opacity INTEGER DEFAULT 20,
        background_blur INTEGER DEFAULT 5,
        theme_color TEXT DEFAULT '#000000',
        contact_info TEXT DEFAULT '',
        shop_description TEXT DEFAULT '',
        info_content TEXT DEFAULT '',
        contact_content TEXT DEFAULT '',
        whatsapp_link TEXT DEFAULT '',
        whatsapp_number TEXT DEFAULT '',
        scrolling_text TEXT DEFAULT '',
        telegram_livraison TEXT DEFAULT '',
        telegram_envoi TEXT DEFAULT '',
        telegram_meetup TEXT DEFAULT '',
        livraison_schedules TEXT DEFAULT '[]',
        meetup_schedules TEXT DEFAULT '[]',
        envoi_schedules TEXT DEFAULT '[]',
        loading_enabled BOOLEAN DEFAULT true,
        loading_duration INTEGER DEFAULT 3000,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table settings créée');
    
    // Insérer des paramètres par défaut
    await executeSqlOnD1(`
      INSERT OR IGNORE INTO settings (
        id, shop_name, shop_title, background_image, background_opacity, 
        background_blur, theme_color, info_content, contact_content,
        whatsapp_link, whatsapp_number, scrolling_text, telegram_livraison,
        telegram_envoi, telegram_meetup, livraison_schedules, meetup_schedules,
        envoi_schedules, loading_enabled, loading_duration
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      '1',
      'LANATIONDULAIT',
      'LANATIONDULAIT',
      'https://pub-b38679a01a274648827751df94818418.r2.dev/images/background-oglegacy.jpeg',
      20,
      5,
      '#000000',
      'Bienvenue chez LANATIONDULAIT - Votre boutique premium',
      'Contactez LANATIONDULAIT pour toute question',
      '',
      '',
      '',
      '',
      '',
      '',
      '["Matin (9h-12h)", "Après-midi (14h-17h)", "Soirée (17h-20h)", "Flexible (à convenir)"]',
      '["Lundi au Vendredi (9h-18h)", "Weekend (10h-17h)", "Soirée en semaine (18h-21h)", "Flexible (à convenir)"]',
      '["Envoi sous 24h", "Envoi sous 48h", "Envoi express", "Délai à convenir"]',
      true,
      3000
    ]);
    console.log('✅ Paramètres par défaut insérés');
    
    // Créer la table social_links
    console.log('📝 Création de la table social_links...');
    await executeSqlOnD1(`
      CREATE TABLE IF NOT EXISTS social_links (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        platform TEXT NOT NULL,
        url TEXT NOT NULL,
        icon TEXT DEFAULT '🔗',
        is_active BOOLEAN DEFAULT true,
        is_available BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table social_links créée');
    
    // Créer la table pages
    console.log('📝 Création de la table pages...');
    await executeSqlOnD1(`
      CREATE TABLE IF NOT EXISTS pages (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        content TEXT DEFAULT '',
        is_active BOOLEAN DEFAULT true,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table pages créée');
    
    // Insérer des pages par défaut
    await executeSqlOnD1(`
      INSERT OR IGNORE INTO pages (id, slug, title, content) VALUES (?, ?, ?, ?)
    `, ['page_1', 'info', 'Informations', 'Bienvenue dans notre boutique en ligne !']);
    
    await executeSqlOnD1(`
      INSERT OR IGNORE INTO pages (id, slug, title, content) VALUES (?, ?, ?, ?)
    `, ['page_2', 'contact', 'Contact', 'Contactez-nous pour toute question.']);
    
    console.log('✅ Pages par défaut insérées');
    
    console.log('🎉 Création des tables terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error);
    throw error;
  }
}

// Exécuter la création
createMissingTables()
  .then(() => {
    console.log('✅ Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });