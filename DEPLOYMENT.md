# 🚀 Guide de Déploiement - CBD Shop avec Cloudflare

Ce guide vous explique comment déployer votre boutique CBD sur Vercel avec Cloudflare D1 (base de données) et R2 (stockage d'images).

## 📋 Prérequis

- Compte Vercel
- Compte Cloudflare
- Node.js installé localement
- Git configuré

## 🔧 Configuration Cloudflare

### 1. Configuration D1 (Base de données)

1. **Connectez-vous à Cloudflare Dashboard**
2. **Allez dans Workers & Pages > D1 SQL Database**
3. **Créez une nouvelle base de données** :
   - Nom : `cbd-shop`
   - Notez l'ID de la base de données

### 2. Configuration R2 (Stockage d'images)

1. **Allez dans R2 Object Storage**
2. **Créez un bucket** :
   - Nom : `boutique-images`
3. **Configurez l'accès public** :
   - Allez dans Settings > Public access
   - Activez "Allow access"
   - Notez l'URL publique
4. **Créez une API Token** :
   - Allez dans My Profile > API Tokens
   - Créez un token avec permissions R2
   - Notez l'Access Key ID et Secret Access Key

## 🚀 Déploiement

### 1. Préparation locale

```bash
# Cloner le projet
git clone <votre-repo>
cd cbd-shop

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditez .env avec vos vraies valeurs
```

### 2. Configuration de la base de données

```bash
# Installer Wrangler (CLI Cloudflare)
npm install -g wrangler

# Se connecter à Cloudflare
wrangler login

# Appliquer les migrations
wrangler d1 execute <VOTRE_DATABASE_ID> --file=./scripts/cloudflare-migration.sql

# Peupler avec des données de test
npm run db:seed
```

### 3. Déploiement sur Vercel

1. **Connectez votre repo GitHub à Vercel**
2. **Configurez les variables d'environnement** dans Vercel :

```env
# Base de données
DATABASE_URL=file:./dev.db

# NextAuth
NEXTAUTH_URL=https://votre-domaine.vercel.app
NEXTAUTH_SECRET=votre-secret-super-securise

# Admin
ADMIN_EMAIL=admin@cbdshop.com
ADMIN_PASSWORD=votre_nouveau_mot_de_passe

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=7979421604bd07b3bd34d3ed96222512
CLOUDFLARE_DATABASE_ID=5ee52135-17f2-43ee-80a8-c20fcaee99d5
CLOUDFLARE_API_TOKEN=ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW

# R2 Storage
CLOUDFLARE_R2_ACCESS_KEY_ID=82WsPNjX-j0UqZIGAny8b0uEehcHd0X3zMKNIKIN
CLOUDFLARE_R2_SECRET_ACCESS_KEY=28230e200a3b71e5374e569f8a297eba9aa3fe2e1097fdf26e5d9e340ded709d
CLOUDFLARE_R2_BUCKET_NAME=boutique-images
CLOUDFLARE_R2_PUBLIC_URL=https://pub-b38679a01a274648827751df94818418.r2.dev
```

3. **Déployez** : Vercel déploiera automatiquement

### 4. Configuration Cloudflare (Optionnel)

Pour utiliser votre propre domaine avec Cloudflare :

1. **Ajoutez votre domaine dans Cloudflare**
2. **Configurez les DNS** :
   - Type : CNAME
   - Nom : @
   - Contenu : cname.vercel-dns.com
3. **Activez le proxy Cloudflare** (orange cloud)

## 🔐 Accès après déploiement

- **Boutique** : `https://votre-domaine.vercel.app`
- **Admin** : `https://votre-domaine.vercel.app/admin`
- **Email** : admin@cbdshop.com
- **Mot de passe** : votre_nouveau_mot_de_passe

## 📱 Fonctionnalités disponibles

### Boutique
- ✅ Page d'accueil avec produits en 2x2
- ✅ Catalogue complet des produits
- ✅ Pages fermes, à propos, contact
- ✅ Page informations avec mentions légales
- ✅ Design responsive et moderne

### Panel Admin
- ✅ Gestion des fermes (CRUD)
- ✅ Gestion des catégories (CRUD)
- ✅ Gestion des produits (CRUD + images/vidéos)
- ✅ Upload d'images vers Cloudflare R2
- ✅ Gestion des informations légales
- ✅ Tableau de bord avec statistiques

## 🛠 Maintenance

### Mise à jour de la base de données

```bash
# Appliquer de nouvelles migrations
wrangler d1 execute <DATABASE_ID> --file=./scripts/cloudflare-migration.sql
```

### Sauvegarde

```bash
# Exporter les données
wrangler d1 export <DATABASE_ID> --output=backup.sql
```

### Monitoring

- **Vercel** : Analytics et logs dans le dashboard
- **Cloudflare** : Analytics dans le dashboard
- **R2** : Monitoring du stockage dans Cloudflare

## 🚨 Dépannage

### Problèmes courants

1. **Erreur de connexion à la base** :
   - Vérifiez les variables d'environnement
   - Vérifiez que la base D1 est active

2. **Images ne s'affichent pas** :
   - Vérifiez la configuration R2
   - Vérifiez les permissions du bucket

3. **Erreur d'authentification** :
   - Vérifiez NEXTAUTH_SECRET
   - Vérifiez NEXTAUTH_URL

### Logs

```bash
# Logs Vercel
vercel logs

# Logs Cloudflare
wrangler tail
```

## 📞 Support

- **Documentation Vercel** : https://vercel.com/docs
- **Documentation Cloudflare** : https://developers.cloudflare.com/
- **Issues GitHub** : Créez une issue sur votre repo

## 🔄 Mises à jour

Pour mettre à jour l'application :

1. **Poussez les changements** sur GitHub
2. **Vercel déploiera automatiquement**
3. **Testez** sur l'URL de déploiement

---

🎉 **Félicitations !** Votre boutique CBD est maintenant déployée et prête à vendre !