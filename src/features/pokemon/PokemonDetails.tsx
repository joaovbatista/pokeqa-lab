import { RARITY_LABELS, STATUS_LABELS } from '../../config/constants'
import { TypeBadge } from '../../components/TypeBadge'
import type { PokemonRecord } from '../../types'

const fmt = (v: string | null) => (v ? new Date(v).toLocaleString('pt-BR') : '—')

export function PokemonDetails({ record: r }: { record: PokemonRecord }) {
  const stats: [string, number][] = [
    ['HP', r.hp], ['Ataque', r.attack], ['Defesa', r.defense], ['Ataque especial', r.sp_attack], ['Defesa especial', r.sp_defense], ['Velocidade', r.speed],
  ]
  return (
    <div data-testid="pokemon-details">
      <div className="details-head">
        {r.image_url && <img src={r.image_url} alt={`Imagem de ${r.name}`} width={120} height={120} />}
        <div>
          <h3>#{r.pokedex_number} {r.name}{r.nickname ? ` “${r.nickname}”` : ''}</h3>
          <p className="badges">
            <TypeBadge type={r.primary_type} />
            {r.secondary_type && <TypeBadge type={r.secondary_type} />}
          </p>
          <p className="muted" data-testid="details-source">
            {r.source === 'pokeapi' ? 'Cadastrado a partir de dados da PokéAPI' : 'Registro personalizado'}
          </p>
        </div>
      </div>
      <dl className="dl">
        <dt>Espécie</dt><dd>{r.species ?? '—'}</dd>
        <dt>Altura / peso</dt><dd>{r.height_m ?? '—'} m / {r.weight_kg ?? '—'} kg</dd>
        <dt>Nível</dt><dd>{r.level}</dd>
        <dt>Geração</dt><dd>{r.generation}</dd>
        <dt>Status</dt><dd>{STATUS_LABELS[r.status]}</dd>
        <dt>Raridade</dt><dd>{RARITY_LABELS[r.rarity]}</dd>
        <dt>Favorito</dt><dd>{r.is_favorite ? 'Sim' : 'Não'}</dd>
        <dt>Captura</dt><dd>{r.captured_at ? new Date(r.captured_at + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</dd>
        <dt>Registrado em</dt><dd>{fmt(r.registered_at)}</dd>
        <dt>Observações</dt><dd>{r.notes ?? '—'}</dd>
      </dl>
      <h4>Atributos base</h4>
      <ul className="stats">
        {stats.map(([label, v]) => (
          <li key={label}>
            <span>{label}</span>
            <meter min={0} max={255} value={v} aria-label={`${label}: ${v} de 255`} />
            <b>{v}</b>
          </li>
        ))}
      </ul>
    </div>
  )
}
