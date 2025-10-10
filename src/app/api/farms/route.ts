import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const farms = await prisma.farm.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(farms)
  } catch (error) {
    console.error('Erreur lors de la récupération des fermes:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const farm = await prisma.farm.create({
      data: {
        name: data.name,
        description: data.description || null,
        image: data.image || null,
        location: data.location || null,
        isActive: data.isActive ?? true,
      },
    })

    return NextResponse.json(farm, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création de la ferme:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}