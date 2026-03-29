import { supabase } from './supabase'

export async function getUser() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return profile
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    window.location.href = '/login'
    return null
  }
  return user
}

export async function requireAdmin() {
  const user = await getUser()
  if (!user || user.role !== 'admin') {
    window.location.href = '/login'
    return null
  }
  return user
}

export async function requireApprovedUser() {
  const user = await getUser()
  if (!user) {
    window.location.href = '/login'
    return null
  }
  if (user.status !== 'approved') {
    return { ...user, needsApproval: true }
  }
  return user
}
