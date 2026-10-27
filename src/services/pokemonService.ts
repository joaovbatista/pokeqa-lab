import { requireClient } from './supabase'
import { AppError, mapSupabaseError } from './errors'
import type { PokemonInput, PokemonRecord } from '../types'

export type SortKey = 'pokedex_number' | 'name' | 'primary_type' | 'generation' | 'level' | 'status' | 'rarity' | 'captured_at' | 'created_at'

export interface PokemonQuery {
  search: string
  status: string
  type: string
  generation: string
  dateFrom: string
  dateTo: string
  sortBy: SortKey
  sortDir: 'asc' | 'desc'
  page: number
  pageSize: number
}

export const DEFAULT_QUERY: PokemonQuery = {
  search: '', status: '', type: '', generation: '', dateFrom: '', dateTo: '',
  sortBy: 'pokedex_number', sortDir: 'asc', page: 1, pageSize: 10,
}

/** Remove caracteres com significado na sintaxe de filtros do PostgREST. */
function sanitize(term: string): string {
  return term.replace(/[,()%*\\"]/g, ' ').trim()
}

export async function listPokemon(q: PokemonQuery): Promise<{ rows: PokemonRecord[]; total: number }> {
  const sb = requireClient()
  let query = sb.from('pokemon_records').select('*', { count: 'exact' })

  const s = sanitize(q.search)
  if (s) {
    const parts = [`name.ilike.%${s}%`, `nickname.ilike.%${s}%`]
    if (/^\d+$/.test(s)) parts.push(`pokedex_number.eq.${s}`)
    query = query.or(parts.join(','))
  }
  if (q.status) query = query.eq('status', q.status)
  if (q.type) query = query.or(`primary_type.eq.${q.type},secondary_type.eq.${q.type}`)
  if (q.generation) query = query.eq('generation', Number(q.generation))
  if (q.dateFrom) query = query.gte('captured_at', q.dateFrom)
  if (q.dateTo) query = query.lte('captured_at', q.dateTo)

  const from = (q.page - 1) * q.pageSize
  const { data, error, count } = await query
    .order(q.sortBy, { ascending: q.sortDir === 'asc', nullsFirst: false })
    .order('id', { ascending: true })
    .range(from, from + q.pageSize - 1)

  if (error) throw mapSupabaseError(error)
  return { rows: (data ?? []) as PokemonRecord[], total: count ?? 0 }
}

export async function getPokemon(id: string): Promise<PokemonRecord> {
  const { data, error } = await requireClient().from('pokemon_records').select('*').eq('id', id).maybeSingle()
  if (error) throw mapSupabaseError(error)
  if (!data) throw new AppError('not_found', 'Registro não encontrado. Ele pode ter sido excluído.')
  return data as PokemonRecord
}

export async function createPokemon(input: PokemonInput): Promise<PokemonRecord> {
  const { data, error } = await requireClient().from('pokemon_records').insert({ ...input, is_demo: true }).select().single()
  if (error) throw mapSupabaseError(error)
  return data as PokemonRecord
}

/**
 * Atualiza com controle otimista: só altera se updated_at ainda for o que o usuário viu.
 * Se nenhuma linha for afetada, diferencia "não existe mais" de "alterado por outra operação".
 */
export async function updatePokemon(id: string, input: PokemonInput, expectedUpdatedAt: string): Promise<PokemonRecord> {
  const sb = requireClient()
  const { data, error } = await sb.from('pokemon_records').update(input).eq('id', id).eq('updated_at', expectedUpdatedAt).select()
  if (error) throw mapSupabaseError(error)
  if (data && data.length > 0) return data[0] as PokemonRecord
  const { data: current, error: e2 } = await sb.from('pokemon_records').select('id').eq('id', id).maybeSingle()
  if (e2) throw mapSupabaseError(e2)
  if (!current) throw new AppError('not_found', 'Registro não encontrado. Ele pode ter sido excluído.')
  throw new AppError('conflict', 'Este registro foi alterado por outra operação. Carregue a versão atual para continuar.')
}

export async function deletePokemon(ids: string[]): Promise<number> {
  const { data, error } = await requireClient().from('pokemon_records').delete().in('id', ids).select('id')
  if (error) throw mapSupabaseError(error)
  const n = data?.length ?? 0
  if (n === 0) throw new AppError('not_found', 'Nenhum registro foi excluído: eles já não existem ou não podem ser removidos.')
  return n
}
