import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env, isSupabaseConfigured } from '../config/env'
import { AppError } from './errors'

// Apenas a chave pública (anon/publishable) é usada aqui. Nunca use service_role no frontend.
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(env.supabaseUrl, env.supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null

export function requireClient(): SupabaseClient {
  if (!supabase) {
    throw new AppError('config', 'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.')
  }
  return supabase
}
