import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

export async function getSession() {
  return await getServerSession()
}

export async function requireAuth() {
  const session = await getSession()
  
  if (!session) {
    redirect('/admin/login')
  }
  
  return session
}

export async function requireAdmin() {
  const session = await requireAuth()
  
  if (session.user.role !== 'ADMIN') {
    redirect('/admin/login')
  }
  
  return session
}