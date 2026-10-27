import { AppError } from './errors'
import { generationFromDex } from '../config/constants'

const BASE = 'https://pokeapi.co/api/v2'
const TIMEOUT_MS = 10_000
const CACHE_PREFIX = 'pokeqa.pokeapi.'
const memory = new Map<string, PokeApiPokemon | null>()

export interface PokeApiPokemon {
  id: number
  name: string
  species: string | null
  height_m: number
  weight_kg: number
  types: string[]
  abilities: string[]
  stats: { hp: number; attack: number; defense: number; sp_attack: number; sp_defense: number; speed: number }
  image: string | null
  generation: number
}

interface RawPokemon {
  id: number; name: string; height: number; weight: number
  types: { slot: number; type: { name: string } }[]
  abilities: { ability: { name: string } }[]
  stats: { base_stat: number; stat: { name: string } }[]
  sprites?: { other?: { 'official-artwork'?: { front_default?: string | null } }; front_default?: string | null }
}
interface RawSpecies { genera?: { genus: string; language: { name: string } }[]; generation?: { name: string } }

async function fetchJson<T>(url: string, signal?: AbortSignal, retries = 1): Promise<T | null> {
  const ctrl = new AbortController()
  const onAbort = () => ctrl.abort()
  signal?.addEventListener('abort', onAbort)
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS) // timeout real de requisição, não atraso artificial
  try {
    const res = await fetch(url, { signal: ctrl.signal })
    if (res.status === 404) return null
    if (res.status >= 500 && retries > 0) return fetchJson<T>(url, signal, retries - 1)
    if (!res.ok) throw new AppError('unknown', `PokéAPI respondeu com status ${res.status}.`)
    return (await res.json()) as T
  } catch (e) {
    if (e instanceof AppError) throw e
    if (signal?.aborted) throw e
    if (ctrl.signal.aborted) throw new AppError('timeout', 'A PokéAPI demorou demais para responder.')
    if (retries > 0) return fetchJson<T>(url, signal, retries - 1)
    throw new AppError('network', 'Falha de rede ao consultar a PokéAPI.')
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onAbort)
  }
}

function isRawPokemon(x: unknown): x is RawPokemon {
  const r = x as RawPokemon
  return !!r && typeof r.id === 'number' && typeof r.name === 'string' && Array.isArray(r.types) && Array.isArray(r.stats)
}

function stat(raw: RawPokemon, name: string): number {
  return raw.stats.find((s) => s.stat.name === name)?.base_stat ?? 1
}

export function normalizeTerm(term: string): string {
  return term.trim().toLowerCase().replace(/\s+/g, '-')
}

/** Busca por nome ou número. Retorna null quando não existe (404). Usa cache em memória e sessionStorage. */
export async function searchPokemon(term: string, signal?: AbortSignal): Promise<PokeApiPokemon | null> {
  const key = normalizeTerm(term)
  if (!key) return null
  if (memory.has(key)) return memory.get(key) ?? null
  try {
    const cached = sessionStorage.getItem(CACHE_PREFIX + key)
    if (cached) {
      const parsed = JSON.parse(cached) as PokeApiPokemon | null
      memory.set(key, parsed)
      return parsed
    }
  } catch { /* cache indisponível: segue para a rede */ }

  const raw = await fetchJson<unknown>(`${BASE}/pokemon/${encodeURIComponent(key)}`, signal)
  if (raw === null) { remember(key, null); return null }
  if (!isRawPokemon(raw)) throw new AppError('unknown', 'Resposta inesperada da PokéAPI (formato inválido).')

  let species: string | null = null
  let generation = generationFromDex(raw.id)
  try {
    const sp = await fetchJson<RawSpecies>(`${BASE}/pokemon-species/${raw.id}`, signal, 0)
    species = sp?.genera?.find((g) => g.language.name === 'en')?.genus ?? null
    const roman = sp?.generation?.name.replace('generation-', '')
    const map: Record<string, number> = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9 }
    if (roman && map[roman]) generation = map[roman]
  } catch { /* espécie é opcional */ }

  const result: PokeApiPokemon = {
    id: raw.id,
    name: raw.name,
    species,
    height_m: raw.height / 10,
    weight_kg: raw.weight / 10,
    types: [...raw.types].sort((a, b) => a.slot - b.slot).map((t) => t.type.name),
    abilities: raw.abilities.map((a) => a.ability.name),
    stats: {
      hp: stat(raw, 'hp'), attack: stat(raw, 'attack'), defense: stat(raw, 'defense'),
      sp_attack: stat(raw, 'special-attack'), sp_defense: stat(raw, 'special-defense'), speed: stat(raw, 'speed'),
    },
    image: raw.sprites?.other?.['official-artwork']?.front_default ?? raw.sprites?.front_default ?? null,
    generation,
  }
  remember(key, result)
  remember(String(result.id), result)
  remember(result.name, result)
  return result
}

function remember(key: string, value: PokeApiPokemon | null) {
  memory.set(key, value)
  try { sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value)) } catch { /* quota/privacidade */ }
}
