#!/usr/bin/env node

// Script pour recréer le schéma de la base de données Cloudflare D1
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

async function recreateDatabaseSchema() {
  try {
    console.log('🔄 Recréation du schéma de la base de données...');
    
    // Sauvegarder les données existantes
    console.log('💾 Sauvegarde des données existantes...');
    
    const settingsData = await executeSqlOnD1('SELECT * FROM settings');
    const categoriesData = await executeSqlOnD1('SELECT * FROM categories');
    const productsData = await executeSqlOnD1('SELECT * FROM products');
    const socialLinksData = await executeSqlOnD1('SELECT * FROM social_links');
    const pagesData = await executeSqlOnD1('SELECT * FROM pages');
    
    console.log('✅ Données sauvegardées');
    
    // Supprimer les anciennes tables
    console.log('🗑️  Suppression des anciennes tables...');
    await executeSqlOnD1('DROP TABLE IF EXISTS settings');
    await executeSqlOnD1('DROP TABLE IF EXISTS categories');
    await executeSqlOnD1('DROP TABLE IF EXISTS products');
    await executeSqlOnD1('DROP TABLE IF EXISTS social_links');
    await executeSqlOnD1('DROP TABLE IF EXISTS pages');
    
    console.log('✅ Anciennes tables supprimées');
    
    // Recréer les tables avec le nouveau schéma
    console.log('🏗️  Création des nouvelles tables...');
    
    // Table settings
    await executeSqlOnD1(`
      CREATE TABLE settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_name TEXT DEFAULT 'Ma Boutique',
        shop_title TEXT DEFAULT 'Ma Boutique',
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table settings créée');
    
    // Table categories
    await executeSqlOnD1(`
      CREATE TABLE categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT DEFAULT '',
        icon TEXT DEFAULT '🏷️',
        color TEXT DEFAULT '#3B82F6',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table categories créée');
    
    // Table products
    await executeSqlOnD1(`
      CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        price REAL NOT NULL DEFAULT 0,
        prices TEXT DEFAULT '{}',
        category_id INTEGER,
        farm_id INTEGER,
        image_url TEXT DEFAULT '',
        video_url TEXT DEFAULT '',
        images TEXT DEFAULT '[]',
        stock INTEGER DEFAULT 0,
        is_available BOOLEAN DEFAULT true,
        features TEXT DEFAULT '[]',
        tags TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Table products créée');
    
    // Table social_links
    await executeSqlOnD1(`
      CREATE TABLE social_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        platform TEXT NOT NULL,
        url TEXT NOT NULL,
        icon TEXT DEFAULT '🔗',
        is_active BOOLEAN DEFAULT true,
        is_available BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table social_links créée');
    
    // Table pages
    await executeSqlOnD1(`
      CREATE TABLE pages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        content TEXT DEFAULT '',
        is_active BOOLEAN DEFAULT true,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table pages créée');
    
    // Restaurer les données
    console.log('🔄 Restauration des données...');
    
    // Restaurer settings
    if (settingsData.result?.[0]?.results?.length) {
      const settings = settingsData.result[0].results[0];
      await executeSqlOnD1(`
        INSERT INTO settings (
          id, shop_name, shop_title, admin_password, background_image, 
          background_opacity, background_blur, theme_color, contact_info, 
          shop_description, info_content, contact_content, whatsapp_link, 
          whatsapp_number, scrolling_text, telegram_livraison, telegram_envoi, 
          telegram_meetup, livraison_schedules, meetup_schedules, envoi_schedules,
          loading_enabled, loading_duration, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        settings.id || 1,
        settings.shop_name || 'LANATIONDULAIT',
        settings.shop_title || settings.shop_name || 'LANATIONDULAIT',
        settings.admin_password || 'admin123',
        settings.background_image || '',
        settings.background_opacity || 20,
        settings.background_blur || 5,
        settings.theme_color || '#000000',
        settings.contact_info || '',
        settings.shop_description || '',
        settings.info_content || '',
        settings.contact_content || '',
        settings.whatsapp_link || '',
        settings.whatsapp_number || '',
        settings.scrolling_text || '',
        settings.telegram_livraison || '',
        settings.telegram_envoi || '',
        settings.telegram_meetup || '',
        settings.livraison_schedules || '[]',
        settings.meetup_schedules || '[]',
        settings.envoi_schedules || '[]',
        settings.loading_enabled !== false,
        settings.loading_duration || 3000,
        settings.created_at || new Date().toISOString(),
        settings.updated_at || new Date().toISOString()
      ]);
      console.log('✅ Settings restaurés');
    }
    
    // Restaurer categories
    if (categoriesData.result?.[0]?.results?.length) {
      for (const category of categoriesData.result[0].results) {
        await executeSqlOnD1(`
          INSERT INTO categories (id, name, description, icon, color, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          category.id,
          category.name,
          category.description || '',
          category.icon || '🏷️',
          category.color || '#3B82F6',
          category.created_at || new Date().toISOString(),
          category.updated_at || new Date().toISOString()
        ]);
      }
      console.log('✅ Categories restaurées');
    }
    
    // Restaurer products
    if (productsData.result?.[0]?.results?.length) {
      for (const product of productsData.result[0].results) {
        await executeSqlOnD1(`
          INSERT INTO products (
            id, name, description, price, prices, category_id, farm_id,
            image_url, video_url, images, stock, is_available, features, tags,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          product.id,
          product.name,
          product.description || '',
          product.price || 0,
          product.prices || '{}',
          product.category_id || null,
          product.farm_id || null,
          product.image_url || '',
          product.video_url || '',
          product.images || '[]',
          product.stock || 0,
          product.is_available !== false,
          product.features || '[]',
          product.tags || '[]',
          product.created_at || new Date().toISOString(),
          product.updated_at || new Date().toISOString()
        ]);
      }
      console.log('✅ Products restaurés');
    }
    
    // Restaurer social_links
    if (socialLinksData.result?.[0]?.results?.length) {
      for (const link of socialLinksData.result[0].results) {
        await executeSqlOnD1(`
          INSERT INTO social_links (
            id, name, platform, url, icon, is_active, is_available, sort_order,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          link.id,
          link.name || link.platform || 'Lien',
          link.platform || link.name || 'Lien',
          link.url,
          link.icon || '🔗',
          link.is_active !== false,
          link.is_available !== false,
          link.sort_order || 0,
          link.created_at || new Date().toISOString(),
          link.updated_at || new Date().toISOString()
        ]);
      }
      console.log('✅ Social links restaurés');
    }
    
    // Restaurer pages
    if (pagesData.result?.[0]?.results?.length) {
      for (const page of pagesData.result[0].results) {
        await executeSqlOnD1(`
          INSERT INTO pages (id, slug, title, content, is_active, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          page.id,
          page.slug,
          page.title,
          page.content || '',
          page.is_active !== false,
          page.created_at || new Date().toISOString(),
          page.updated_at || new Date().toISOString()
        ]);
      }
      console.log('✅ Pages restaurées');
    }
    
    console.log('🎉 Recréation du schéma terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la recréation du schéma:', error);
    throw error;
  }
}

// Exécuter la recréation
recreateDatabaseSchema()
  .then(() => {
    console.log('✅ Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });