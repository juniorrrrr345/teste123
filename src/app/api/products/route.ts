import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        farm: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        image: data.image || null,
        video: data.video || null,
        isActive: data.isActive ?? true,
        stock: parseInt(data.stock) || 0,
        farmId: data.farmId,
        categoryId: data.categoryId,
      },
      include: {
        farm: true,
        category: true,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}