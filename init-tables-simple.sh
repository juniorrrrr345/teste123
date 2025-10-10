#!/bin/bash

# Script simplifié pour initialiser les tables D1
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

# Fonction pour exécuter une requête SQL
execute_sql() {
    local sql="$1"
    local description="$2"
    
    echo "⏳ $description..."
    
    local response=$(curl -s -X POST \
        "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/d1/database/$DATABASE_UUID/query" \
        -H "Authorization: Bearer $API_TOKEN" \
        -H "Content-Type: application/json" \
        --data "{\"sql\":\"$sql\"}")
    
    local success=$(echo "$response" | jq -r '.success // false')
    
    if [ "$success" = "true" ]; then
        echo "✅ $description - Succès"
    else
        echo "❌ $description - Erreur"
        echo "$response" | jq '.'
        return 1
    fi
}

# Créer les tables une par une
echo "📊 Création des tables..."

# Table settings
execute_sql "CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_name TEXT DEFAULT 'Ma Boutique',
    admin_password TEXT DEFAULT 'admin123',
    background_image TEXT DEFAULT '',
    background_opacity INTEGER DEFAULT 20,
    background_blur INTEGER DEFAULT 5,
    theme_color TEXT DEFAULT '#000000',
    contact_info TEXT DEFAULT '',
    shop_description TEXT DEFAULT '',
    loading_enabled BOOLEAN DEFAULT true,
    loading_duration INTEGER DEFAULT 3000,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);" "Table settings"

# Table categories
execute_sql "CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    icon TEXT DEFAULT '🏷️',
    color TEXT DEFAULT '#3B82F6',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);" "Table categories"

# Table farms
execute_sql "CREATE TABLE IF NOT EXISTS farms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    location TEXT DEFAULT '',
    contact TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);" "Table farms"

# Table products
execute_sql "CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    price REAL NOT NULL DEFAULT 0,
    category_id INTEGER,
    farm_id INTEGER,
    image_url TEXT DEFAULT '',
    images TEXT DEFAULT '[]',
    stock INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    features TEXT DEFAULT '[]',
    tags TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE SET NULL
);" "Table products"

# Table pages
execute_sql "CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);" "Table pages"

# Table social_links
execute_sql "CREATE TABLE IF NOT EXISTS social_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT DEFAULT '🔗',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);" "Table social_links"

# Table orders
execute_sql "CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    items TEXT NOT NULL,
    total_amount REAL NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'pending',
    notes TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);" "Table orders"

# Créer les index
echo "📊 Création des index..."

execute_sql "CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);" "Index products_category"
execute_sql "CREATE INDEX IF NOT EXISTS idx_products_farm ON products(farm_id);" "Index products_farm"
execute_sql "CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);" "Index products_available"
execute_sql "CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);" "Index pages_slug"
execute_sql "CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);" "Index orders_status"

# Insérer les données par défaut
echo "📊 Insertion des données par défaut..."

execute_sql "INSERT OR IGNORE INTO settings (id) VALUES (1);" "Settings par défaut"

execute_sql "INSERT OR IGNORE INTO categories (name, description, icon, color) VALUES 
('Électronique', 'Appareils électroniques et gadgets', '📱', '#3B82F6'),
('Vêtements', 'Mode et accessoires', '👕', '#EF4444'),
('Maison', 'Articles pour la maison', '🏠', '#10B981'),
('Sport', 'Équipements sportifs', '⚽', '#F59E0B');" "Catégories par défaut"

execute_sql "INSERT OR IGNORE INTO farms (name, description, location) VALUES 
('Ferme Bio', 'Production biologique locale', 'France'),
('Artisan Local', 'Fabrication artisanale', 'Région Parisienne');" "Fermes par défaut"

execute_sql "INSERT OR IGNORE INTO pages (slug, title, content) VALUES 
('info', 'Informations', 'Bienvenue dans notre boutique en ligne !'),
('contact', 'Contact', 'Contactez-nous pour toute question.');" "Pages par défaut"

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