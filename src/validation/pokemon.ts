import type { PokemonInput, PokemonRecord } from '../types'
import type { PokeApiPokemon } from '../services/pokeapi'

export interface PokemonFormValues {
  pokedex_number: string; name: string; nickname: string; primary_type: string; secondary_type: string
  species: string; height_m: string; weight_kg: string; level: string
  hp: string; attack: string; defense: string; sp_attack: string; sp_defense: string; speed: string
  generation: string; status: string; rarity: string; captured_at: string
  is_favorite: boolean; notes: string; image_url: string; source: 'custom' | 'pokeapi'
}

export type FormErrors = Partial<Record<keyof PokemonFormValues, string>>

export const EMPTY_FORM: PokemonFormValues = {
  pokedex_number: '', name: '', nickname: '', primary_type: '', secondary_type: '', species: '',
  height_m: '', weight_kg: '', level: '1', hp: '1', attack: '1', defense: '1', sp_attack: '1', sp_defense: '1', speed: '1',
  generation: '1', status: 'ativo', rarity: 'comum', captured_at: '', is_favorite: false, notes: '', image_url: '', source: 'custom',
}

const s = (v: number | string | null | undefined) => (v === null || v === undefined ? '' : String(v))

export function recordToForm(r: PokemonRecord): PokemonFormValues {
  return {
    pokedex_number: s(r.pokedex_number), name: r.name, nickname: s(r.nickname), primary_type: r.primary_type,
    secondary_type: s(r.secondary_type), species: s(r.species), height_m: s(r.height_m), weight_kg: s(r.weight_kg),
    level: s(r.level), hp: s(r.hp), attack: s(r.attack), defense: s(r.defense), sp_attack: s(r.sp_attack),
    sp_defense: s(r.sp_defense), speed: s(r.speed), generation: s(r.generation), status: r.status, rarity: r.rarity,
    captured_at: s(r.captured_at), is_favorite: r.is_favorite, notes: s(r.notes), image_url: s(r.image_url), source: r.source,
  }
}

/** Preenche o formulário com dados da PokéAPI, preservando o que o usuário já definiu (status, nível, etc.). */
export function applyPokeApi(base: PokemonFormValues, p: PokeApiPokemon): PokemonFormValues {
  return {
    ...base,
    pokedex_number: String(p.id),
    name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
    primary_type: p.types[0] ?? '',
    secondary_type: p.types[1] ?? '',
    species: p.species ?? '',
    height_m: String(p.height_m),
    weight_kg: String(p.weight_kg),
    hp: String(p.stats.hp), attack: String(p.stats.attack), defense: String(p.stats.defense),
    sp_attack: String(p.stats.sp_attack), sp_defense: String(p.stats.sp_defense), speed: String(p.stats.speed),
    generation: String(p.generation),
    image_url: p.image ?? '',
    source: 'pokeapi',
  }
}

function int(v: string, min: number, max: number, label: string, required = true): string | undefined {
  if (v.trim() === '') return required ? `${label} é obrigatório.` : undefined
  const n = Number(v)
  if (!Number.isInteger(n)) return `${label} deve ser um número inteiro.`
  if (n < min || n > max) return `${label} deve estar entre ${min} e ${max}.`
}

function dec(v: string, min: number, max: number, label: string): string | undefined {
  if (v.trim() === '') return undefined
  const n = Number(v)
  if (Number.isNaN(n)) return `${label} deve ser um número.`
  if (n < min || n > max) return `${label} deve estar entre ${min} e ${max}.`
}

export function validatePokemon(v: PokemonFormValues): FormErrors {
  const e: FormErrors = {}
  const set = <K extends keyof PokemonFormValues>(k: K, msg: string | undefined) => { if (msg) e[k] = msg }
  set('pokedex_number', int(v.pokedex_number, 1, 2000, 'Número da Pokédex'))
  if (!v.name.trim()) e.name = 'Nome é obrigatório.'
  else if (v.name.trim().length < 2 || v.name.trim().length > 40) e.name = 'Nome deve ter entre 2 e 40 caracteres.'
  if (v.nickname.length > 30) e.nickname = 'Apelido deve ter no máximo 30 caracteres.'
  if (!v.primary_type) e.primary_type = 'Tipo primário é obrigatório.'
  if (v.secondary_type && v.secondary_type === v.primary_type) e.secondary_type = 'O tipo secundário deve ser diferente do primário.'
  if (v.species.length > 60) e.species = 'Espécie deve ter no máximo 60 caracteres.'
  set('height_m', dec(v.height_m, 0, 100, 'Altura'))
  set('weight_kg', dec(v.weight_kg, 0, 10000, 'Peso'))
  set('level', int(v.level, 1, 100, 'Nível'))
  set('hp', int(v.hp, 1, 255, 'HP'))
  set('attack', int(v.attack, 1, 255, 'Ataque'))
  set('defense', int(v.defense, 1, 255, 'Defesa'))
  set('sp_attack', int(v.sp_attack, 1, 255, 'Ataque especial'))
  set('sp_defense', int(v.sp_defense, 1, 255, 'Defesa especial'))
  set('speed', int(v.speed, 1, 255, 'Velocidade'))
  set('generation', int(v.generation, 1, 9, 'Geração'))
  if (v.captured_at && v.captured_at > new Date().toISOString().slice(0, 10)) e.captured_at = 'A data de captura não pode ser futura.'
  if (v.notes.length > 500) e.notes = 'Observações devem ter no máximo 500 caracteres.'
  if (v.image_url) {
    try {
      const u = new URL(v.image_url)
      if (u.protocol !== 'http:' && u.protocol !== 'https:') e.image_url = 'A URL da imagem deve começar com http:// ou https://.'
    } catch { e.image_url = 'URL da imagem inválida.' }
    if (!e.image_url && v.image_url.length > 500) e.image_url = 'A URL da imagem deve ter no máximo 500 caracteres.'
  }
  return e
}

const num = (v: string) => (v.trim() === '' ? null : Number(v))
const txt = (v: string) => (v.trim() === '' ? null : v.trim())

export function formToInput(v: PokemonFormValues): PokemonInput {
  return {
    pokedex_number: Number(v.pokedex_number), name: v.name.trim(), nickname: txt(v.nickname),
    primary_type: v.primary_type, secondary_type: txt(v.secondary_type), species: txt(v.species),
    height_m: num(v.height_m), weight_kg: num(v.weight_kg), level: Number(v.level),
    hp: Number(v.hp), attack: Number(v.attack), defense: Number(v.defense),
    sp_attack: Number(v.sp_attack), sp_defense: Number(v.sp_defense), speed: Number(v.speed),
    generation: Number(v.generation), status: v.status as PokemonInput['status'], rarity: v.rarity as PokemonInput['rarity'],
    captured_at: txt(v.captured_at), is_favorite: v.is_favorite, notes: txt(v.notes), image_url: txt(v.image_url),
    source: v.source,
  }
}
