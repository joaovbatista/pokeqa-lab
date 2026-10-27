import { useCallback, useEffect, useRef, useState } from 'react'
import { GENERATIONS, PAGE_SIZES, POKEMON_TYPES, RARITY_LABELS, STATUSES, STATUS_LABELS, TYPE_LABELS } from '../../config/constants'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { Modal } from '../../components/Modal'
import { useToast } from '../../components/Toast'
import { TypeBadge } from '../../components/TypeBadge'
import { useDebounce } from '../../hooks/useDebounce'
import { useSessionState } from '../../hooks/useSessionState'
import { AppError, errorMessage } from '../../services/errors'
import { DEFAULT_QUERY, deletePokemon, getPokemon, listPokemon, type PokemonQuery, type SortKey } from '../../services/pokemonService'
import type { PokemonRecord } from '../../types'
import { PokemonDetails } from './PokemonDetails'
import { PokemonForm } from './PokemonForm'

interface Props { autoCreate: boolean; onAutoCreateHandled: () => void }

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'pokedex_number', label: 'Nº' }, { key: 'name', label: 'Pokémon' }, { key: 'primary_type', label: 'Tipos' },
  { key: 'generation', label: 'Geração' }, { key: 'level', label: 'Nível' }, { key: 'status', label: 'Status' },
  { key: 'rarity', label: 'Raridade' }, { key: 'captured_at', label: 'Captura' },
]

export function PokemonPage({ autoCreate, onAutoCreateHandled }: Props) {
  const toast = useToast()
  const [query, setQuery] = useSessionState<PokemonQuery>('pokeqa.pokemon.query', DEFAULT_QUERY)
  const [searchText, setSearchText] = useState(query.search)
  const debouncedSearch = useDebounce(searchText, 350)
  const [rows, setRows] = useState<PokemonRecord[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [formTarget, setFormTarget] = useState<PokemonRecord | 'new' | null>(null)
  const [viewTarget, setViewTarget] = useState<PokemonRecord | null>(null)
  const [deleteTargets, setDeleteTargets] = useState<PokemonRecord[] | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [reloadTick, setReloadTick] = useState(0)
  const reqId = useRef(0)
  const selectAll = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setQuery((q) => (q.search === debouncedSearch ? q : { ...q, search: debouncedSearch, page: 1 }))
  }, [debouncedSearch, setQuery])

  useEffect(() => {
    if (autoCreate) { setFormTarget('new'); onAutoCreateHandled() }
  }, [autoCreate, onAutoCreateHandled])

  const load = useCallback(async () => {
    const id = ++reqId.current
    setLoading(true)
    try {
      const res = await listPokemon(query)
      if (id !== reqId.current) return
      const pages = Math.max(1, Math.ceil(res.total / query.pageSize))
      if (res.rows.length === 0 && res.total > 0 && query.page > pages) {
        setQuery((q) => ({ ...q, page: pages }))
        return
      }
      setRows(res.rows); setTotal(res.total); setError(null)
    } catch (e) {
      if (id !== reqId.current) return
      setError(errorMessage(e))
    } finally {
      if (id === reqId.current) setLoading(false)
    }
  }, [query, setQuery])

  useEffect(() => { void load() }, [load, reloadTick])

  const selectedRows = rows.filter((r) => selected.has(r.id))
  const allVisible = rows.length > 0 && selectedRows.length === rows.length
  useEffect(() => {
    if (selectAll.current) selectAll.current.indeterminate = selectedRows.length > 0 && !allVisible
  }, [selectedRows.length, allVisible])

  const patch = (p: Partial<PokemonQuery>) => setQuery((q) => ({ ...q, ...p, page: 1 }))
  const toggleSort = (key: SortKey) =>
    setQuery((q) => ({ ...q, sortBy: key, sortDir: q.sortBy === key && q.sortDir === 'asc' ? 'desc' : 'asc', page: 1 }))
  const clearFilters = () => { setSearchText(''); setQuery({ ...DEFAULT_QUERY, pageSize: query.pageSize }) }
  const hasFilters = Boolean(query.search || query.status || query.type || query.generation || query.dateFrom || query.dateTo)
  const pages = Math.max(1, Math.ceil(total / query.pageSize))
  const from = total === 0 ? 0 : (query.page - 1) * query.pageSize + 1
  const to = Math.min(total, query.page * query.pageSize)

  async function confirmDelete() {
    if (!deleteTargets) return
    setDeleting(true)
    try {
      const n = await deletePokemon(deleteTargets.map((r) => r.id))
      toast.success(n === 1 ? 'Pokémon excluído.' : `${n} Pokémon excluídos.`)
      setSelected(new Set())
      setDeleteTargets(null)
      setReloadTick((t) => t + 1)
    } catch (e) {
      toast.error(errorMessage(e))
      if (e instanceof AppError && e.kind === 'not_found') { setDeleteTargets(null); setReloadTick((t) => t + 1) }
    } finally { setDeleting(false) }
  }

  async function openEdit(r: PokemonRecord) {
    try {
      setFormTarget(await getPokemon(r.id))
    } catch (e) {
      toast.error(errorMessage(e))
      setReloadTick((t) => t + 1)
    }
  }

  return (
    <section aria-labelledby="pokemon-title" data-testid="page-pokemon">
      <header className="page-head">
        <div>
          <h1 id="pokemon-title">Pokémon</h1>
          <p className="muted">Registros próprios persistidos no Supabase. Dados da PokéAPI só entram após você confirmar o cadastro.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setFormTarget('new')} data-testid="pokemon-new">Novo Pokémon</button>
      </header>

      <form className="filters panel" role="search" aria-label="Filtros de Pokémon" onSubmit={(e) => e.preventDefault()} data-testid="pokemon-filters">
        <div className="field grow">
          <label htmlFor="f-search">Buscar por nome, apelido ou número</label>
          <input id="f-search" type="search" value={searchText} onChange={(e) => setSearchText(e.target.value)} data-testid="filter-search" />
        </div>
        <div className="field">
          <label htmlFor="f-status">Status</label>
          <select id="f-status" value={query.status} onChange={(e) => patch({ status: e.target.value })} data-testid="filter-status">
            <option value="">Todos</option>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-type">Tipo</label>
          <select id="f-type" value={query.type} onChange={(e) => patch({ type: e.target.value })} data-testid="filter-type">
            <option value="">Todos</option>
            {POKEMON_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-gen">Geração</label>
          <select id="f-gen" value={query.generation} onChange={(e) => patch({ generation: e.target.value })} data-testid="filter-generation">
            <option value="">Todas</option>
            {GENERATIONS.map((g) => <option key={g} value={g}>Geração {g}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-from">Captura a partir de</label>
          <input id="f-from" type="date" value={query.dateFrom} onChange={(e) => patch({ dateFrom: e.target.value })} data-testid="filter-date-from" />
        </div>
        <div className="field">
          <label htmlFor="f-to">Captura até</label>
          <input id="f-to" type="date" value={query.dateTo} onChange={(e) => patch({ dateTo: e.target.value })} data-testid="filter-date-to" />
        </div>
        <button type="button" className="btn" onClick={clearFilters} disabled={!hasFilters} data-testid="filter-clear">Limpar filtros</button>
      </form>

      {selectedRows.length > 0 && (
        <div className="bulkbar" role="region" aria-label="Ações em lote" data-testid="bulk-bar">
          <span data-testid="bulk-count">{selectedRows.length} selecionado(s)</span>
          <button type="button" className="btn btn-danger btn-sm" onClick={() => setDeleteTargets(selectedRows)} data-testid="bulk-delete">Excluir selecionados</button>
          <button type="button" className="btn btn-sm" onClick={() => setSelected(new Set())} data-testid="bulk-clear">Limpar seleção</button>
        </div>
      )}

      {error && (
        <div role="alert" className="callout callout-error" data-testid="pokemon-error">
          <span>{error}</span>
          <button type="button" className="btn btn-sm" onClick={() => setReloadTick((t) => t + 1)} data-testid="pokemon-retry">Tentar novamente</button>
        </div>
      )}

      <div className="table-wrap panel" aria-busy={loading} data-testid="pokemon-table-region" data-loading={loading}>
        <table data-testid="pokemon-table">
          <caption className="sr-only">Lista de Pokémon cadastrados</caption>
          <thead>
            <tr>
              <th scope="col" className="col-check">
                <input ref={selectAll} type="checkbox" aria-label="Selecionar todos os registros visíveis" checked={allVisible}
                  disabled={rows.length === 0}
                  onChange={(e) => setSelected(e.target.checked ? new Set(rows.map((r) => r.id)) : new Set())} data-testid="select-all" />
              </th>
              {COLUMNS.map((c) => (
                <th key={c.key} scope="col"
                  aria-sort={query.sortBy === c.key ? (query.sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button type="button" className="th-btn" onClick={() => toggleSort(c.key)} data-testid={`sort-${c.key}`}>
                    {c.label}
                    <span aria-hidden="true" className="sort-ind">{query.sortBy === c.key ? (query.sortDir === 'asc' ? '▲' : '▼') : ''}</span>
                  </button>
                </th>
              ))}
              <th scope="col">Origem</th>
              <th scope="col"><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 && Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="skeleton-row" data-testid="skeleton-row"><td colSpan={11}><span className="skeleton" /></td></tr>
            ))}
            {rows.map((r) => (
              <tr key={r.id} data-testid="pokemon-row" data-pokemon-id={r.id} aria-selected={selected.has(r.id)}>
                <td className="col-check">
                  <input type="checkbox" aria-label={`Selecionar ${r.name}`} checked={selected.has(r.id)}
                    onChange={(e) => setSelected((s) => { const n = new Set(s); if (e.target.checked) n.add(r.id); else n.delete(r.id); return n })}
                    data-testid="row-select" />
                </td>
                <td className="num">{r.pokedex_number}</td>
                <th scope="row" className="name-cell">
                  {r.image_url ? <img src={r.image_url} alt="" width={36} height={36} loading="lazy" /> : <span className="img-ph" aria-hidden="true" />}
                  <span><b data-testid="row-name">{r.name}</b>{r.is_favorite && <span className="fav" title="Favorito"> ★<span className="sr-only"> Favorito</span></span>}
                    {r.nickname && <small className="muted block">{r.nickname}</small>}</span>
                </th>
                <td><span className="badges"><TypeBadge type={r.primary_type} />{r.secondary_type && <TypeBadge type={r.secondary_type} />}</span></td>
                <td className="num">{r.generation}</td>
                <td className="num">{r.level}</td>
                <td><span className={`status status-${r.status}`} data-testid="row-status">{STATUS_LABELS[r.status]}</span></td>
                <td>{RARITY_LABELS[r.rarity]}</td>
                <td>{r.captured_at ? new Date(r.captured_at + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</td>
                <td><span className={`source source-${r.source}`}>{r.source === 'pokeapi' ? 'PokéAPI' : 'Próprio'}</span></td>
                <td className="row-actions">
                  <button type="button" className="btn btn-sm" onClick={() => setViewTarget(r)} aria-label={`Ver detalhes de ${r.name}`} data-testid="row-view">Ver</button>
                  <button type="button" className="btn btn-sm" onClick={() => void openEdit(r)} aria-label={`Editar ${r.name}`} data-testid="row-edit">Editar</button>
                  <button type="button" className="btn btn-sm btn-danger-ghost" onClick={() => setDeleteTargets([r])} aria-label={`Excluir ${r.name}`} data-testid="row-delete">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !error && rows.length === 0 && (
          <div className="empty" data-testid="pokemon-empty">
            {hasFilters ? (
              <><p><b>Nenhum resultado para esses filtros.</b></p><button type="button" className="btn" onClick={clearFilters}>Limpar filtros</button></>
            ) : (
              <><p><b>Nenhum Pokémon cadastrado.</b></p><button type="button" className="btn btn-primary" onClick={() => setFormTarget('new')}>Cadastrar o primeiro</button></>
            )}
          </div>
        )}
      </div>

      <nav className="pager" aria-label="Paginação de Pokémon" data-testid="pagination">
        <p data-testid="page-summary" aria-live="polite">{from}–{to} de {total}</p>
        <div className="field inline">
          <label htmlFor="page-size">Por página</label>
          <select id="page-size" value={query.pageSize} onChange={(e) => patch({ pageSize: Number(e.target.value) })} data-testid="page-size">
            {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <button type="button" className="btn btn-sm" disabled={query.page <= 1} onClick={() => setQuery((q) => ({ ...q, page: 1 }))} data-testid="page-first">Primeira</button>
        <button type="button" className="btn btn-sm" disabled={query.page <= 1} onClick={() => setQuery((q) => ({ ...q, page: q.page - 1 }))} data-testid="page-prev">Anterior</button>
        <span data-testid="page-indicator">Página {query.page} de {pages}</span>
        <button type="button" className="btn btn-sm" disabled={query.page >= pages} onClick={() => setQuery((q) => ({ ...q, page: q.page + 1 }))} data-testid="page-next">Próxima</button>
        <button type="button" className="btn btn-sm" disabled={query.page >= pages} onClick={() => setQuery((q) => ({ ...q, page: pages }))} data-testid="page-last">Última</button>
      </nav>

      <Modal open={formTarget !== null} title={formTarget === 'new' ? 'Novo Pokémon' : 'Editar Pokémon'} onClose={() => setFormTarget(null)} testId="pokemon-modal" wide>
        {formTarget !== null && (
          <PokemonForm
            record={formTarget === 'new' ? null : formTarget}
            onCancel={() => setFormTarget(null)}
            onSaved={(saved, created) => {
              toast.success(created ? `${saved.name} cadastrado.` : `${saved.name} atualizado.`)
              setFormTarget(null)
              setReloadTick((t) => t + 1)
            }}
          />
        )}
      </Modal>

      <Modal open={viewTarget !== null} title="Detalhes do Pokémon" onClose={() => setViewTarget(null)} testId="details-modal">
        {viewTarget && <PokemonDetails record={viewTarget} />}
      </Modal>

      <ConfirmDialog
        open={deleteTargets !== null}
        title="Confirmar exclusão"
        message={deleteTargets && deleteTargets.length === 1
          ? `Excluir ${deleteTargets[0].name}? Esta ação não pode ser desfeita.`
          : `Excluir ${deleteTargets?.length ?? 0} Pokémon selecionados? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteTargets(null)}
      />
    </section>
  )
}
