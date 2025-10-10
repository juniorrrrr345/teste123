const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Déploiement sur Cloudflare D1...')

// 1. Générer le client Prisma
console.log('📦 Génération du client Prisma...')
execSync('npx prisma generate', { stdio: 'inherit' })

// 2. Appliquer les migrations à Cloudflare D1
console.log('🗄️ Application des migrations à Cloudflare D1...')
try {
  execSync(`npx wrangler d1 execute ${process.env.CLOUDFLARE_DATABASE_ID} --file=./scripts/cloudflare-migration.sql`, { 
    stdio: 'inherit',
    env: { ...process.env }
  })
  console.log('✅ Migrations appliquées avec succès')
} catch (error) {
  console.error('❌ Erreur lors de l\'application des migrations:', error.message)
  process.exit(1)
}

// 3. Insérer les données de test
console.log('🌱 Insertion des données de test...')
try {
  execSync('npm run db:seed', { stdio: 'inherit' })
  console.log('✅ Données de test insérées')
} catch (error) {
  console.error('❌ Erreur lors de l\'insertion des données:', error.message)
  process.exit(1)
}

console.log('🎉 Déploiement Cloudflare D1 terminé avec succès!')
console.log('📝 N\'oubliez pas de configurer les variables d\'environnement dans Vercel:')
console.log('   - CLOUDFLARE_ACCOUNT_ID')
console.log('   - CLOUDFLARE_DATABASE_ID') 
console.log('   - CLOUDFLARE_API_TOKEN')
console.log('   - CLOUDFLARE_R2_ACCESS_KEY_ID')
console.log('   - CLOUDFLARE_R2_SECRET_ACCESS_KEY')
console.log('   - CLOUDFLARE_R2_BUCKET_NAME')
console.log('   - CLOUDFLARE_R2_PUBLIC_URL')