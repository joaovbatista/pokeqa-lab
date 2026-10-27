import { useEffect, useRef, useState } from 'react'
import { env } from '../../config/env'
import { useDebounce } from '../../hooks/useDebounce'
import { searchPokemon, type PokeApiPokemon } from '../../services/pokeapi'
import { errorMessage } from '../../services/errors'
import { TypeBadge } from '../../components/TypeBadge'

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'empty'; term: string }
  | { status: 'error'; message: string; term: string }
  | { status: 'ok'; data: PokeApiPokemon }

const isSearchable = (t: string) => /^\d+$/.test(t) || t.length >= 3

export function PokeApiSearch({ onUse }: { onUse: (p: PokeApiPokemon) => void }) {
  const [term, setTerm] = useState('')
  const [state, setState] = useState<State>({ status: 'idle' })
  const debounced = useDebounce(term.trim(), 600)
  const ctrl = useRef<AbortController | null>(null)

  async function run(t: string) {
    ctrl.current?.abort()
    const c = new AbortController()
    ctrl.current = c
    setState({ status: 'loading' })
    try {
      const data = await searchPokemon(t, c.signal)
      if (c.signal.aborted) return
      setState(data ? { status: 'ok', data } : { status: 'empty', term: t })
    } catch (e) {
      if (c.signal.aborted) return
      setState({ status: 'error', message: errorMessage(e), term: t })
    }
  }

  useEffect(() => {
    if (!env.pokeapiEnabled || !isSearchable(debounced)) return
    void run(debounced)
    return () => ctrl.current?.abort()
  }, [debounced])

  if (!env.pokeapiEnabled) {
    return (
      <section className="panel panel-flat" data-testid="pokeapi-disabled">
        <h3>Busca na PokéAPI</h3>
        <p className="muted">Integração externa desativada (VITE_ENABLE_POKEAPI=false). Preencha o formulário manualmente.</p>
      </section>
    )
  }

  return (
    <section className="panel panel-flat" aria-labelledby="pokeapi-title" data-testid="pokeapi-search">
      <h3 id="pokeapi-title">Buscar na PokéAPI</h3>
      <p className="muted">Consulta externa somente leitura. Nada é salvo até você confirmar o cadastro.</p>
      <div className="inline-form">
        <div className="field grow">
          <label htmlFor="pokeapi-term">Nome ou número</label>
          <input
            id="pokeapi-term" type="search" value={term} placeholder="ex.: pikachu ou 25"
            onChange={(e) => setTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (term.trim()) void run(term.trim()) } }}
            data-testid="pokeapi-input"
          />
        </div>
        <button type="button" className="btn" disabled={!term.trim() || state.status === 'loading'}
          onClick={() => void run(term.trim())} data-testid="pokeapi-search-button">Buscar</button>
      </div>

      <div aria-live="polite" data-testid="pokeapi-result-region">
        {state.status === 'loading' && <p role="status" data-testid="pokeapi-loading">Consultando PokéAPI…</p>}
        {state.status === 'empty' && <p data-testid="pokeapi-empty">Nenhum Pokémon encontrado para “{state.term}”.</p>}
        {state.status === 'error' && (
          <div role="alert" className="callout callout-error" data-testid="pokeapi-error">
            <span>{state.message}</span>
            <button type="button" className="btn btn-sm" onClick={() => void run(state.term)} data-testid="pokeapi-retry">Tentar novamente</button>
          </div>
        )}
        {state.status === 'ok' && (
          <article className="external-card" data-testid="pokeapi-result">
            {state.data.image && <img src={state.data.image} alt={`Arte oficial de ${state.data.name}`} width={96} height={96} />}
            <div>
              <p className="tag-external">Dado externo (PokéAPI), não salvo</p>
              <h4 data-testid="pokeapi-result-name">#{state.data.id} {state.data.name}</h4>
              <p className="badges">{state.data.types.map((t) => <TypeBadge key={t} type={t} />)}</p>
              <p className="muted">Habilidades: {state.data.abilities.join(', ')}</p>
              <p className="muted">
                HP {state.data.stats.hp} · Atq {state.data.stats.attack} · Def {state.data.stats.defense} · Atq.Esp {state.data.stats.sp_attack} · Def.Esp {state.data.stats.sp_defense} · Vel {state.data.stats.speed}
              </p>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => onUse(state.data)} data-testid="pokeapi-use">
                Usar estes dados no formulário
              </button>
            </div>
          </article>
        )}
      </div>
    </section>
  )
}
