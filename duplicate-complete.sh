#!/bin/bash

# Script de duplication complète de la boutique LANATIONV2
# Ce script duplique la boutique et configure une nouvelle base de données D1

echo "🚀 DÉMARRAGE DE LA DUPLICATION COMPLÈTE"
echo "========================================"

# Vérifier que jq est installé
if ! command -v jq &> /dev/null; then
    echo "❌ jq n'est pas installé. Installation en cours..."
    sudo apt-get update && sudo apt-get install -y jq
fi

# Vérifier que curl est installé
if ! command -v curl &> /dev/null; then
    echo "❌ curl n'est pas installé. Installation en cours..."
    sudo apt-get update && sudo apt-get install -y curl
fi

echo "📦 Installation des dépendances Node.js..."
npm install

echo "🔧 Configuration des variables d'environnement..."
if [ ! -f ".env.local" ]; then
    cat > .env.local << EOF
# Configuration Cloudflare D1
CLOUDFLARE_ACCOUNT_ID=7979421604bd07b3bd34d3ed96222512
CLOUDFLARE_API_TOKEN=ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW

# Configuration R2 (à configurer selon vos besoins)
R2_ACCOUNT_ID=7979421604bd07b3bd34d3ed96222512
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=boutique-images-duplicate
R2_PUBLIC_URL=https://pub-your-bucket-id.r2.dev

# Configuration de la boutique
NEXT_PUBLIC_SHOP_NAME=LANATIONDULAIT_DUPLICATE
NEXT_PUBLIC_ADMIN_PASSWORD=admin123
EOF
    echo "✅ Fichier .env.local créé"
fi

echo "🗄️ Création de la nouvelle base de données D1..."
./create-new-d1-database.sh

if [ $? -eq 0 ]; then
    echo "✅ Base de données D1 créée avec succès"
    
    echo "📊 Initialisation des tables..."
    ./init-new-d1-tables.sh
    
    if [ $? -eq 0 ]; then
        echo "✅ Tables initialisées avec succès"
        
        echo "🔧 Mise à jour des configurations..."
        
        # Mettre à jour le README
        cat > README_DUPLICATE.md << EOF
# LANATIONDULAIT_DUPLICATE - Boutique E-commerce

🌮 Boutique e-commerce moderne dupliquée avec Cloudflare D1 et R2

## 🚀 Fonctionnalités

- ✅ Base de données Cloudflare D1 configurée (NOUVELLE)
- ✅ Stockage médias Cloudflare R2 
- ✅ Panel d'administration complet
- ✅ Interface utilisateur moderne
- ✅ Gestion des produits, catégories, fermes
- ✅ Système de commandes WhatsApp
- ✅ Pages personnalisables

## 🛠️ Configuration

### Base de données D1
- **Nom**: LANATIONDULAIT_DUPLICATE
- **UUID**: $(grep "Database UUID:" D1_DATABASE_INFO.txt | cut -d' ' -f3)
- **Account ID**: 7979421604bd07b3bd34d3ed96222512

### Stockage R2
- **Bucket**: boutique-images-duplicate
- **URL publique**: À configurer

## 📦 Installation

\`\`\`bash
npm install
npm run build
npm run dev
\`\`\`

## 🔧 Panel Admin

Accédez au panel admin via \`/admin\` avec le mot de passe configuré.

## 🚀 Déploiement Vercel

Le projet est prêt pour le déploiement sur Vercel avec la configuration Cloudflare intégrée.

---

**LANATIONDULAIT_DUPLICATE** - Boutique e-commerce dupliquée 🌮
EOF
        
        echo "✅ README dupliqué créé"
        
        # Mettre à jour le package.json pour le déploiement
        echo "📝 Mise à jour du package.json..."
        sed -i 's/"name": "LANATIONDULAIT_DUPLICATE"/"name": "lanationdulait-duplicate"/' package.json
        
        echo "🎉 DUPLICATION TERMINÉE AVEC SUCCÈS!"
        echo "====================================="
        echo "📁 Projet dupliqué: $(pwd)"
        echo "🗄️ Base de données D1: $(grep "Database UUID:" D1_DATABASE_INFO.txt | cut -d' ' -f3)"
        echo "🚀 Pour démarrer: npm run dev"
        echo "🔧 Panel admin: http://localhost:3000/admin"
        echo "📊 Mot de passe admin: admin123"
        
    else
        echo "❌ Erreur lors de l'initialisation des tables"
        exit 1
    fi
else
    echo "❌ Erreur lors de la création de la base de données D1"
    exit 1
fi