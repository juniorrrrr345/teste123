#!/bin/bash

# Script de démarrage rapide de la boutique dupliquée
echo "🚀 DÉMARRAGE DE LA BOUTIQUE DUPLIQUÉE"
echo "====================================="

# Vérifier si on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis le répertoire LANATIONV2_DUPLICATE"
    exit 1
fi

# Vérifier si les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Vérifier la configuration D1
if [ ! -f "src/lib/cloudflare-d1.ts" ]; then
    echo "❌ Configuration D1 manquante. Exécutez d'abord ./duplicate-complete.sh"
    exit 1
fi

# Afficher les informations de la boutique
echo "🏪 BOUTIQUE: LANATIONDULAIT_DUPLICATE"
echo "🗄️ Base de données D1: $(grep 'databaseId:' src/lib/cloudflare-d1.ts | cut -d"'" -f2)"
echo "🔧 Panel admin: http://localhost:3000/admin"
echo "🔑 Mot de passe admin: admin123"
echo ""

# Démarrer le serveur de développement
echo "🚀 Démarrage du serveur de développement..."
echo "📱 Boutique disponible sur: http://localhost:3000"
echo "⚙️ Panel admin disponible sur: http://localhost:3000/admin"
echo ""
echo "💡 Appuyez sur Ctrl+C pour arrêter le serveur"
echo ""

npm run dev