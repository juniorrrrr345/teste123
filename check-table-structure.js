#!/usr/bin/env node

// Script pour vérifier la structure des tables existantes

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

async function checkTableStructure() {
  try {
    console.log('🔍 Vérification de la structure des tables...');
    
    // Vérifier la structure de chaque table
    const tables = ['categories', 'products', 'farms', 'informations'];
    
    for (const table of tables) {
      console.log(`\n📋 Structure de la table ${table}:`);
      
      try {
        const result = await executeSqlOnD1(`PRAGMA table_info(${table})`);
        
        if (result.result?.[0]?.results) {
          const columns = result.result[0].results;
          console.log('Colonnes:');
          columns.forEach(col => {
            console.log(`  - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
          });
        } else {
          console.log('❌ Aucune information sur la structure');
        }
      } catch (error) {
        console.log(`❌ Erreur lors de la vérification de ${table}:`, error.message);
      }
    }
    
    // Vérifier si les tables settings et social_links existent
    console.log('\n🔍 Vérification des tables manquantes...');
    
    try {
      const settingsResult = await executeSqlOnD1('SELECT * FROM settings LIMIT 1');
      console.log('✅ Table settings existe');
    } catch (error) {
      console.log('❌ Table settings n\'existe pas');
    }
    
    try {
      const socialResult = await executeSqlOnD1('SELECT * FROM social_links LIMIT 1');
      console.log('✅ Table social_links existe');
    } catch (error) {
      console.log('❌ Table social_links n\'existe pas');
    }
    
    try {
      const pagesResult = await executeSqlOnD1('SELECT * FROM pages LIMIT 1');
      console.log('✅ Table pages existe');
    } catch (error) {
      console.log('❌ Table pages n\'existe pas');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    throw error;
  }
}

// Exécuter la vérification
checkTableStructure()
  .then(() => {
    console.log('\n✅ Vérification terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Vérification échouée:', error);
    process.exit(1);
  });