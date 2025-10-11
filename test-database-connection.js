#!/usr/bin/env node

// Script de test de connexion à la base de données D1
const CLOUDFLARE_CONFIG = {
  accountId: '7979421604bd07b3bd34d3ed96222512',
  databaseId: '5ee52135-17f2-43ee-80a8-c20fcaee99d5',
  apiToken: 'ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW'
};

async function testDatabaseConnection() {
  console.log('🔍 Test de connexion à la base de données D1...');
  console.log(`📊 Database ID: ${CLOUDFLARE_CONFIG.databaseId}`);
  
  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_CONFIG.accountId}/d1/database/${CLOUDFLARE_CONFIG.databaseId}/query`;
  
  try {
    // Test simple de connexion
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_CONFIG.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql: 'SELECT 1 as test'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Connexion à la base de données réussie !');
      console.log('📋 Résultat du test:', data.result);
      
      // Test des tables existantes
      const tablesResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_CONFIG.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sql: "SELECT name FROM sqlite_master WHERE type='table'"
        })
      });
      
      if (tablesResponse.ok) {
        const tablesData = await tablesResponse.json();
        if (tablesData.success) {
          console.log('📊 Tables disponibles:', tablesData.result[0]?.results?.map(t => t.name) || []);
        }
      }
      
    } else {
      console.error('❌ Erreur de connexion:', data.errors);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test de connexion:', error.message);
  }
}

testDatabaseConnection();