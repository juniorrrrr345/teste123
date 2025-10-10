import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        farm: true,
        category: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    
    const product = await prisma.product.update({
      where: { id: params.id },
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

    return NextResponse.json(product)
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.product.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Produit supprimé' })
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}