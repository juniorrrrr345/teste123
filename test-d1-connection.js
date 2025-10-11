#!/usr/bin/env node

// Script pour tester la connexion à Cloudflare D1

const ACCOUNT_ID = '7979421604bd07b3bd34d3ed96222512';
const DATABASE_ID = '5ee52135-17f2-43ee-80a8-c20fcaee99d5';
const API_TOKEN = 'ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW';

async function testD1Connection() {
  try {
    console.log('🔍 Test de connexion à Cloudflare D1...');
    
    const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;
    
    console.log('URL:', url);
    console.log('Token (premiers caractères):', API_TOKEN.substring(0, 10) + '...');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sql: 'SELECT name FROM sqlite_master WHERE type="table"'
      })
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error Response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    console.log('✅ Connexion réussie !');
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    throw error;
  }
}

// Exécuter le test
testD1Connection()
  .then(() => {
    console.log('✅ Test terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test échoué:', error);
    process.exit(1);
  });