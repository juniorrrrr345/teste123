# 🌿 CBD Shop - Boutique en ligne Next.js

Une boutique en ligne moderne et responsive pour vendre des produits CBD, avec un panel d'administration complet.

## ✨ Fonctionnalités

### Boutique
- **Page d'accueil** avec carousel et affichage des produits en 2x2
- **Catalogue produits** avec images et vidéos
- **Pages fermes** pour présenter les producteurs
- **Page à propos** et contact
- **Page informations** avec mentions légales
- **Design responsive** et moderne

### Panel d'administration (/admin)
- **Authentification** sécurisée
- **Gestion des fermes** (CRUD complet)
- **Gestion des catégories** (CRUD complet)
- **Gestion des produits** (CRUD complet avec images/vidéos)
- **Gestion des informations** (mentions légales, CGV, etc.)
- **Tableau de bord** avec statistiques

## 🚀 Installation

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd cbd-shop
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer la base de données**
```bash
# Créer le fichier .env avec vos paramètres de base de données
cp .env.example .env

# Générer le client Prisma
npm run db:generate

# Créer les tables en base
npm run db:push

# Peupler la base avec des données de test
npm run db:seed
```

4. **Lancer le serveur de développement**
```bash
npm run dev
```

## 🔧 Configuration

### Variables d'environnement (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/cbd_shop?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Admin credentials
ADMIN_EMAIL="admin@cbdshop.com"
ADMIN_PASSWORD="admin123"
```

### Accès administrateur
- **URL** : http://localhost:3000/admin
- **Email** : admin@cbdshop.com
- **Mot de passe** : admin123

## 📁 Structure du projet

```
src/
├── app/                    # Pages Next.js 13+ (App Router)
│   ├── admin/             # Panel d'administration
│   ├── api/               # API Routes
│   ├── informations/      # Page informations
│   └── ...
├── components/            # Composants réutilisables
├── lib/                   # Utilitaires (Prisma, Auth)
└── types/                 # Types TypeScript
```

## 🛠 Technologies utilisées

- **Next.js 14** - Framework React
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling
- **Prisma** - ORM pour la base de données
- **NextAuth.js** - Authentification
- **PostgreSQL** - Base de données
- **Vercel** - Déploiement (recommandé)

## 🚀 Déploiement sur Vercel

1. **Connecter votre repo GitHub à Vercel**
2. **Configurer les variables d'environnement** dans Vercel
3. **Configurer la base de données** (recommandé : Neon, Supabase, ou PlanetScale)
4. **Déployer** automatiquement

### Configuration Cloudflare (optionnel)
Pour utiliser Cloudflare comme CDN :
1. Ajouter votre domaine dans Cloudflare
2. Configurer les DNS pour pointer vers Vercel
3. Activer le proxy Cloudflare

## 📝 Utilisation

### Ajouter des produits
1. Aller sur `/admin`
2. Se connecter avec les identifiants admin
3. Cliquer sur "Produits" → "Nouveau produit"
4. Remplir le formulaire avec les informations du produit
5. Ajouter une image et/ou une vidéo (URLs)
6. Sauvegarder

### Gérer les fermes
1. Aller sur `/admin/farms`
2. Ajouter/modifier/supprimer des fermes
3. Chaque ferme peut avoir une image et une localisation

### Gérer les catégories
1. Aller sur `/admin/categories`
2. Créer des catégories pour organiser vos produits
3. Chaque catégorie peut avoir une image

### Modifier les informations légales
1. Aller sur `/admin/informations`
2. Modifier les mentions légales, CGV, etc.
3. Les modifications apparaissent sur la page `/informations`

## 🎨 Personnalisation

### Couleurs
Les couleurs principales sont définies dans `tailwind.config.js` :
- **Vert principal** : `green-600` (boutons, liens)
- **Gris** : `gray-50` (arrière-plans), `gray-900` (textes)

### Images
- **Format recommandé** : 500x500px minimum
- **Formats supportés** : JPG, PNG, WebP
- **Hébergement** : URLs externes (Unsplash, Cloudinary, etc.)

## 🔒 Sécurité

- Authentification sécurisée avec NextAuth.js
- Mots de passe hashés avec bcrypt
- Protection des routes admin
- Validation des données côté serveur

## 📞 Support

Pour toute question ou problème :
- **Email** : contact@cbdshop.com
- **Documentation** : Voir les commentaires dans le code

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.