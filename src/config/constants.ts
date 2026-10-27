export const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground',
  'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
] as const

export const TYPE_LABELS: Record<string, string> = {
  normal: 'Normal', fire: 'Fogo', water: 'Água', electric: 'Elétrico', grass: 'Planta', ice: 'Gelo',
  fighting: 'Lutador', poison: 'Veneno', ground: 'Terra', flying: 'Voador', psychic: 'Psíquico',
  bug: 'Inseto', rock: 'Pedra', ghost: 'Fantasma', dragon: 'Dragão', dark: 'Sombrio', steel: 'Aço', fairy: 'Fada',
}

// [fundo, texto] com contraste adequado
export const TYPE_COLORS: Record<string, [string, string]> = {
  normal: ['#c9c8b4', '#2b2a1e'], fire: ['#f5a46b', '#3a1706'], water: ['#9db7f5', '#0f1f4d'],
  electric: ['#f9d949', '#3a3000'], grass: ['#9fd66e', '#173a07'], ice: ['#b8e8e6', '#0d3b3a'],
  fighting: ['#d9695f', '#2e0805'], poison: ['#c07fc4', '#2d0a30'], ground: ['#e2c97b', '#3a2a05'],
  flying: ['#c3b6f7', '#1e1450'], psychic: ['#f78fb0', '#4a0622'], bug: ['#c4d34b', '#2e3300'],
  rock: ['#c9b66f', '#322a05'], ghost: ['#a58cc4', '#1e0f35'], dragon: ['#8f7cf7', '#14093d'],
  dark: ['#7a6a5e', '#ffffff'], steel: ['#c0c7d6', '#1b2233'], fairy: ['#f4bdc9', '#4a0e20'],
}

export const STATUSES = ['ativo', 'inativo', 'arquivado'] as const
export const RARITIES = ['comum', 'incomum', 'raro', 'epico', 'lendario'] as const
export const RARITY_LABELS: Record<string, string> = {
  comum: 'Comum', incomum: 'Incomum', raro: 'Raro', epico: 'Épico', lendario: 'Lendário',
}
export const STATUS_LABELS: Record<string, string> = { ativo: 'Ativo', inativo: 'Inativo', arquivado: 'Arquivado' }
export const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const
export const PAGE_SIZES = [5, 10, 20, 50] as const

export function generationFromDex(n: number): number {
  const limits = [151, 251, 386, 493, 649, 721, 809, 905, 1025]
  const idx = limits.findIndex((l) => n <= l)
  return idx === -1 ? 9 : idx + 1
}
