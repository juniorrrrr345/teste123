#!/bin/bash

# Script pour créer une nouvelle base de données D1 pour la boutique dupliquée
# Configuration Cloudflare
ACCOUNT_ID="7979421604bd07b3bd34d3ed96222512"
API_TOKEN="ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW"
DATABASE_NAME="LANATIONDULAIT_DUPLICATE"

echo "🚀 Création d'une nouvelle base de données D1..."
echo "📊 Nom: $DATABASE_NAME"
echo "🔑 Account ID: $ACCOUNT_ID"

# Créer la base de données D1
echo "⏳ Création de la base de données..."

RESPONSE=$(curl -X POST \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/d1/database" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  --data "{\"name\":\"$DATABASE_NAME\"}")

echo "📋 Réponse de l'API:"
echo "$RESPONSE" | jq '.'

# Extraire l'UUID de la base de données créée
DATABASE_UUID=$(echo "$RESPONSE" | jq -r '.result.uuid // empty')

if [ -n "$DATABASE_UUID" ]; then
    echo "✅ Base de données créée avec succès!"
    echo "🆔 UUID: $DATABASE_UUID"
    
    # Mettre à jour le fichier de configuration
    echo "📝 Mise à jour de la configuration..."
    sed -i "s/NEW_DATABASE_ID_TO_BE_CREATED/$DATABASE_UUID/g" src/lib/cloudflare-d1-new.ts
    
    echo "✅ Configuration mise à jour!"
    echo "📁 Fichier: src/lib/cloudflare-d1-new.ts"
    echo "🆔 Nouveau Database ID: $DATABASE_UUID"
    
    # Créer un fichier de sauvegarde avec les informations
    cat > D1_DATABASE_INFO.txt << EOF
# Informations de la base de données D1 créée
Database Name: $DATABASE_NAME
Database UUID: $DATABASE_UUID
Account ID: $ACCOUNT_ID
Created: $(date)
EOF
    
    echo "💾 Informations sauvegardées dans D1_DATABASE_INFO.txt"
    
else
    echo "❌ Erreur lors de la création de la base de données"
    echo "📋 Réponse complète:"
    echo "$RESPONSE"
    exit 1
fi

echo "🎉 Processus terminé!"