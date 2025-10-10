import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const farm = await prisma.farm.findUnique({
      where: { id: params.id },
    })

    if (!farm) {
      return NextResponse.json({ error: 'Ferme non trouvée' }, { status: 404 })
    }

    return NextResponse.json(farm)
  } catch (error) {
    console.error('Erreur lors de la récupération de la ferme:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    
    const farm = await prisma.farm.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description || null,
        image: data.image || null,
        location: data.location || null,
        isActive: data.isActive ?? true,
      },
    })

    return NextResponse.json(farm)
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la ferme:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.farm.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Ferme supprimée' })
  } catch (error) {
    console.error('Erreur lors de la suppression de la ferme:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}