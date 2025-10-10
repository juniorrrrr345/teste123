import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
    })

    if (!category) {
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    
    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description || null,
        image: data.image || null,
        isActive: data.isActive ?? true,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.category.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Catégorie supprimée' })
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}