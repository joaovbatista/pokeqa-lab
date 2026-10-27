export type RecordStatus = 'ativo' | 'inativo' | 'arquivado'
export type Rarity = 'comum' | 'incomum' | 'raro' | 'epico' | 'lendario'
export type RecordSource = 'custom' | 'pokeapi'

export interface PokemonRecord {
  id: string
  pokedex_number: number
  name: string
  nickname: string | null
  primary_type: string
  secondary_type: string | null
  species: string | null
  height_m: number | null
  weight_kg: number | null
  level: number
  hp: number
  attack: number
  defense: number
  sp_attack: number
  sp_defense: number
  speed: number
  generation: number
  status: RecordStatus
  rarity: Rarity
  captured_at: string | null
  registered_at: string
  is_favorite: boolean
  notes: string | null
  image_url: string | null
  source: RecordSource
  is_demo: boolean
  is_seed: boolean
  created_at: string
  updated_at: string
}

export type PokemonInput = Omit<PokemonRecord, 'id' | 'registered_at' | 'is_demo' | 'is_seed' | 'created_at' | 'updated_at'>

export interface ActivityLog {
  id: number
  entity: string
  entity_id: string | null
  action: 'criado' | 'atualizado' | 'excluido'
  label: string | null
  created_at: string
}
