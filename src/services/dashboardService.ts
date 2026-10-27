import { requireClient } from './supabase'
import { mapSupabaseError } from './errors'
import type { ActivityLog } from '../types'

export interface DashboardData {
  pokemon: number
  trainers: number
  teams: number
  recent: number
  activity: ActivityLog[]
}

async function count(table: string, since?: string): Promise<number> {
  let q = requireClient().from(table).select('*', { count: 'exact', head: true })
  if (since) q = q.gte('created_at', since)
  const { count: c, error } = await q
  if (error) throw mapSupabaseError(error)
  return c ?? 0
}

export async function loadDashboard(): Promise<DashboardData> {
  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
  const [pokemon, trainers, teams, recent, act] = await Promise.all([
    count('pokemon_records'),
    count('trainers'),
    count('teams'),
    count('activity_logs', since),
    requireClient().from('activity_logs').select('*').order('created_at', { ascending: false }).order('id', { ascending: false }).limit(8),
  ])
  if (act.error) throw mapSupabaseError(act.error)
  return { pokemon, trainers, teams, recent, activity: (act.data ?? []) as ActivityLog[] }
}

/** Restaura os dados de seed via função RPC (só funciona com demo_mode ativo no banco). */
export async function resetDemoData(): Promise<void> {
  const { error } = await requireClient().rpc('reset_demo_data', { confirmation: 'RESTAURAR' })
  if (error) throw mapSupabaseError(error)
}
