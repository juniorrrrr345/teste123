#!/bin/bash

# Script pour initialiser les tables dans la nouvelle base de données D1
# Configuration Cloudflare
ACCOUNT_ID="7979421604bd07b3bd34d3ed96222512"
API_TOKEN="ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW"

# Lire l'UUID de la base de données depuis le fichier de configuration
if [ -f "D1_DATABASE_INFO.txt" ]; then
    DATABASE_UUID=$(grep "Database UUID:" D1_DATABASE_INFO.txt | cut -d' ' -f3)
    DATABASE_NAME=$(grep "Database Name:" D1_DATABASE_INFO.txt | cut -d' ' -f3)
else
    echo "❌ Fichier D1_DATABASE_INFO.txt non trouvé. Exécutez d'abord create-new-d1-database.sh"
    exit 1
fi

echo "🚀 Initialisation des tables dans la base de données D1..."
echo "📊 Base: $DATABASE_NAME"
echo "🆔 UUID: $DATABASE_UUID"

# Lire le schéma SQL
if [ ! -f "database/schema.sql" ]; then
    echo "❌ Fichier database/schema.sql non trouvé"
    exit 1
fi

echo "📋 Lecture du schéma SQL..."

# Exécuter le schéma SQL par parties
echo "⏳ Exécution du schéma SQL..."

# Créer un fichier temporaire avec le SQL formaté
TEMP_SQL=$(mktemp)
cat database/schema.sql > "$TEMP_SQL"

# Exécuter le schéma SQL
RESPONSE=$(curl -X POST \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/d1/database/$DATABASE_UUID/query" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @- << EOF
{
  "sql": "$(cat "$TEMP_SQL" | sed ':a;N;$!ba;s/\n/\\n/g' | sed 's/"/\\"/g')"
}
EOF
)

# Nettoyer le fichier temporaire
rm -f "$TEMP_SQL"

echo "📋 Réponse de l'API:"
echo "$RESPONSE" | jq '.'

# Vérifier le succès
SUCCESS=$(echo "$RESPONSE" | jq -r '.success // false')

if [ "$SUCCESS" = "true" ]; then
    echo "✅ Tables créées avec succès!"
    
    # Vérifier les tables créées
    echo "🔍 Vérification des tables créées..."
    
    TABLES_RESPONSE=$(curl -X POST \
      "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/d1/database/$DATABASE_UUID/query" \
      -H "Authorization: Bearer $API_TOKEN" \
      -H "Content-Type: application/json" \
      --data '{"sql":"SELECT name FROM sqlite_master WHERE type=\"table\";"}')
    
    echo "📋 Tables disponibles:"
    echo "$TABLES_RESPONSE" | jq '.result[0].results[]'
    
    # Mettre à jour le fichier de configuration principal
    echo "📝 Mise à jour de la configuration principale..."
    cp src/lib/cloudflare-d1-new.ts src/lib/cloudflare-d1.ts
    
    echo "✅ Configuration principale mise à jour!"
    echo "📁 Fichier: src/lib/cloudflare-d1.ts"
    
else
    echo "❌ Erreur lors de la création des tables"
    echo "📋 Réponse complète:"
    echo "$RESPONSE"
    exit 1
fi

echo "🎉 Initialisation terminée!"
echo "🚀 Votre boutique est maintenant prête avec une nouvelle base de données D1!"