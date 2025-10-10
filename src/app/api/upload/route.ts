import { NextRequest, NextResponse } from 'next/server'
import { uploadToR2 } from '@/lib/cloudflare-r2'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Seules les images sont autorisées' }, { status: 400 })
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 5MB)' }, { status: 400 })
    }

    // Générer un nom de fichier unique
    const fileExtension = file.name.split('.').pop()
    const fileName = `${randomUUID()}.${fileExtension}`
    const key = `uploads/${fileName}`

    // Upload vers Cloudflare R2
    const url = await uploadToR2(file, key)

    return NextResponse.json({ url, key })
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}