#!/bin/bash

# Script basique pour initialiser les tables D1
ACCOUNT_ID="7979421604bd07b3bd34d3ed96222512"
API_TOKEN="ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW"

# Lire l'UUID de la base de données
if [ -f "D1_DATABASE_INFO.txt" ]; then
    DATABASE_UUID=$(grep "Database UUID:" D1_DATABASE_INFO.txt | cut -d' ' -f3)
    DATABASE_NAME=$(grep "Database Name:" D1_DATABASE_INFO.txt | cut -d' ' -f3)
else
    echo "❌ Fichier D1_DATABASE_INFO.txt non trouvé"
    exit 1
fi

echo "🚀 Initialisation des tables dans $DATABASE_NAME"
echo "🆔 UUID: $DATABASE_UUID"

# Fonction pour exécuter une requête SQL simple
execute_sql() {
    local sql="$1"
    local description="$2"
    
    echo "⏳ $description..."
    
    # Créer un fichier JSON temporaire
    local json_file=$(mktemp)
    echo "{\"sql\":\"$sql\"}" > "$json_file"
    
    local response=$(curl -s -X POST \
        "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/d1/database/$DATABASE_UUID/query" \
        -H "Authorization: Bearer $API_TOKEN" \
        -H "Content-Type: application/json" \
        --data @"$json_file")
    
    rm -f "$json_file"
    
    local success=$(echo "$response" | jq -r '.success // false')
    
    if [ "$success" = "true" ]; then
        echo "✅ $description - Succès"
    else
        echo "❌ $description - Erreur"
        echo "$response" | jq '.'
        return 1
    fi
}

# Créer les tables une par une avec des requêtes simples
echo "📊 Création des tables..."

# Table settings
execute_sql "CREATE TABLE settings (id INTEGER PRIMARY KEY, shop_name TEXT, admin_password TEXT, background_image TEXT, background_opacity INTEGER, background_blur INTEGER, theme_color TEXT, contact_info TEXT, shop_description TEXT, loading_enabled BOOLEAN, loading_duration INTEGER, created_at DATETIME, updated_at DATETIME)" "Table settings"

# Table categories
execute_sql "CREATE TABLE categories (id INTEGER PRIMARY KEY, name TEXT UNIQUE, description TEXT, icon TEXT, color TEXT, created_at DATETIME, updated_at DATETIME)" "Table categories"

# Table farms
execute_sql "CREATE TABLE farms (id INTEGER PRIMARY KEY, name TEXT UNIQUE, description TEXT, location TEXT, contact TEXT, created_at DATETIME, updated_at DATETIME)" "Table farms"

# Table products
execute_sql "CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, description TEXT, price REAL, category_id INTEGER, farm_id INTEGER, image_url TEXT, images TEXT, stock INTEGER, is_available BOOLEAN, features TEXT, tags TEXT, created_at DATETIME, updated_at DATETIME)" "Table products"

# Table pages
execute_sql "CREATE TABLE pages (id INTEGER PRIMARY KEY, slug TEXT UNIQUE, title TEXT, content TEXT, is_active BOOLEAN, created_at DATETIME, updated_at DATETIME)" "Table pages"

# Table social_links
execute_sql "CREATE TABLE social_links (id INTEGER PRIMARY KEY, name TEXT, url TEXT, icon TEXT, is_active BOOLEAN, sort_order INTEGER, created_at DATETIME, updated_at DATETIME)" "Table social_links"

# Table orders
execute_sql "CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_name TEXT, customer_email TEXT, customer_phone TEXT, items TEXT, total_amount REAL, status TEXT, notes TEXT, created_at DATETIME, updated_at DATETIME)" "Table orders"

# Insérer les données par défaut
echo "📊 Insertion des données par défaut..."

execute_sql "INSERT INTO settings (id, shop_name, admin_password) VALUES (1, 'LANATIONDULAIT_DUPLICATE', 'admin123')" "Settings par défaut"

execute_sql "INSERT INTO categories (name, description, icon, color) VALUES ('Electronique', 'Appareils electroniques', '📱', '#3B82F6')" "Catégorie Electronique"

execute_sql "INSERT INTO categories (name, description, icon, color) VALUES ('Vetements', 'Mode et accessoires', '👕', '#EF4444')" "Catégorie Vetements"

execute_sql "INSERT INTO farms (name, description, location) VALUES ('Ferme Bio', 'Production biologique locale', 'France')" "Ferme Bio"

execute_sql "INSERT INTO pages (slug, title, content) VALUES ('info', 'Informations', 'Bienvenue dans notre boutique!')" "Page info"

# Vérifier les tables créées
echo "🔍 Vérification des tables créées..."

TABLES_RESPONSE=$(curl -s -X POST \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/d1/database/$DATABASE_UUID/query" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"sql":"SELECT name FROM sqlite_master WHERE type=\"table\";"}')

echo "📋 Tables disponibles:"
echo "$TABLES_RESPONSE" | jq -r '.result[0].results[]?.name // empty'

# Mettre à jour la configuration principale
echo "📝 Mise à jour de la configuration principale..."
cp src/lib/cloudflare-d1-new.ts src/lib/cloudflare-d1.ts

echo "✅ Configuration principale mise à jour!"
echo "🎉 Initialisation terminée avec succès!"