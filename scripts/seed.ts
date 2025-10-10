import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Créer l'utilisateur admin
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cbdshop.com' },
    update: {},
    create: {
      email: 'admin@cbdshop.com',
      password: hashedPassword,
      name: 'Administrateur',
      role: 'ADMIN',
    },
  })

  console.log('Utilisateur admin créé:', admin.email)

  // Créer des fermes
  const farm1 = await prisma.farm.upsert({
    where: { id: 'farm-1' },
    update: {},
    create: {
      id: 'farm-1',
      name: 'Ferme Bio du Val de Loire',
      description: 'Ferme familiale spécialisée dans la culture biologique de chanvre CBD depuis 3 générations.',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      location: 'Val de Loire, France',
      isActive: true,
    },
  })

  const farm2 = await prisma.farm.upsert({
    where: { id: 'farm-2' },
    update: {},
    create: {
      id: 'farm-2',
      name: 'Cannabis Valley Farm',
      description: 'Ferme moderne utilisant les dernières technologies pour cultiver du CBD de qualité premium.',
      image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      location: 'Provence, France',
      isActive: true,
    },
  })

  console.log('Fermes créées:', farm1.name, farm2.name)

  // Créer des catégories
  const category1 = await prisma.category.upsert({
    where: { id: 'cat-1' },
    update: {},
    create: {
      id: 'cat-1',
      name: 'Huiles CBD',
      description: 'Huiles de CBD pures et naturelles pour un usage quotidien',
      image: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      isActive: true,
    },
  })

  const category2 = await prisma.category.upsert({
    where: { id: 'cat-2' },
    update: {},
    create: {
      id: 'cat-2',
      name: 'Fleurs CBD',
      description: 'Fleurs de chanvre CBD séchées et conditionnées avec soin',
      image: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      isActive: true,
    },
  })

  const category3 = await prisma.category.upsert({
    where: { id: 'cat-3' },
    update: {},
    create: {
      id: 'cat-3',
      name: 'Résines CBD',
      description: 'Résines et extraits de CBD concentrés',
      image: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      isActive: true,
    },
  })

  console.log('Catégories créées:', category1.name, category2.name, category3.name)

  // Créer des produits
  const product1 = await prisma.product.upsert({
    where: { id: 'prod-1' },
    update: {},
    create: {
      id: 'prod-1',
      name: 'Huile CBD 10% - 10ml',
      description: 'Huile de CBD pure à 10% de concentration. Idéale pour débuter avec le CBD. Extraite selon un procédé respectueux de l\'environnement.',
      price: 29.90,
      image: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      video: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isActive: true,
      stock: 50,
      farmId: farm1.id,
      categoryId: category1.id,
    },
  })

  const product2 = await prisma.product.upsert({
    where: { id: 'prod-2' },
    update: {},
    create: {
      id: 'prod-2',
      name: 'Fleurs CBD Amnesia Haze',
      description: 'Fleurs de chanvre Amnesia Haze riches en CBD. Aromatiques et relaxantes, parfaites pour la détente du soir.',
      price: 24.90,
      image: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      isActive: true,
      stock: 30,
      farmId: farm2.id,
      categoryId: category2.id,
    },
  })

  const product3 = await prisma.product.upsert({
    where: { id: 'prod-3' },
    update: {},
    create: {
      id: 'prod-3',
      name: 'Résine CBD 20% - 1g',
      description: 'Résine de CBD concentrée à 20%. Parfaite pour les utilisateurs expérimentés recherchant une forte concentration.',
      price: 39.90,
      image: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      isActive: true,
      stock: 25,
      farmId: farm1.id,
      categoryId: category3.id,
    },
  })

  const product4 = await prisma.product.upsert({
    where: { id: 'prod-4' },
    update: {},
    create: {
      id: 'prod-4',
      name: 'Huile CBD 20% - 30ml',
      description: 'Huile de CBD à forte concentration (20%). Format économique pour une utilisation quotidienne prolongée.',
      price: 79.90,
      image: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      isActive: true,
      stock: 20,
      farmId: farm2.id,
      categoryId: category1.id,
    },
  })

  console.log('Produits créés:', product1.name, product2.name, product3.name, product4.name)

  // Créer des informations
  const info1 = await prisma.information.upsert({
    where: { id: 'info-1' },
    update: {},
    create: {
      id: 'info-1',
      title: 'Mentions légales',
      content: `
        <h3>Éditeur du site</h3>
        <p><strong>CBD Shop</strong><br />
        Adresse : 123 Rue du CBD, 75001 Paris<br />
        Téléphone : 01 23 45 67 89<br />
        Email : contact@cbdshop.com</p>
        
        <h3>Hébergement</h3>
        <p>Vercel Inc.<br />
        Directeur de publication : CBD Shop</p>
        
        <h3>Conformité</h3>
        <p>Tous nos produits CBD respectent la législation française en vigueur. 
        Le taux de THC est inférieur à 0,2% conformément à la réglementation européenne.</p>
      `,
      type: 'mentions',
      isActive: true,
    },
  })

  const info2 = await prisma.information.upsert({
    where: { id: 'info-2' },
    update: {},
    create: {
      id: 'info-2',
      title: 'Conditions Générales de Vente',
      content: `
        <h3>1. Objet</h3>
        <p>Les présentes conditions générales de vente s'appliquent à toutes les commandes 
        passées sur le site CBD Shop.</p>
        
        <h3>2. Produits</h3>
        <p>Tous nos produits CBD respectent la législation française en vigueur. 
        Le taux de THC est inférieur à 0,2%.</p>
        
        <h3>3. Commandes</h3>
        <p>Les commandes sont traitées dans les 24-48h. Nous nous réservons le droit 
        d'annuler toute commande en cas de problème de stock.</p>
        
        <h3>4. Livraison</h3>
        <p>La livraison est effectuée par Colissimo. Les frais de port sont offerts 
        à partir de 50€ d'achat.</p>
        
        <h3>5. Retours</h3>
        <p>Vous disposez de 14 jours pour retourner un produit non conforme. 
        Les frais de retour sont à votre charge.</p>
      `,
      type: 'cgv',
      isActive: true,
    },
  })

  console.log('Informations créées:', info1.title, info2.title)

  console.log('✅ Base de données initialisée avec succès !')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })