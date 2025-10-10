import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
})

export async function uploadToR2(file: File, key: string): Promise<string> {
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })

    await r2Client.send(command)
    
    return `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`
  } catch (error) {
    console.error('Erreur lors de l\'upload vers R2:', error)
    throw new Error('Échec de l\'upload de l\'image')
  }
}

export async function deleteFromR2(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: key,
    })

    await r2Client.send(command)
  } catch (error) {
    console.error('Erreur lors de la suppression de R2:', error)
    throw new Error('Échec de la suppression de l\'image')
  }
}

export function getR2PublicUrl(key: string): string {
  return `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`
}