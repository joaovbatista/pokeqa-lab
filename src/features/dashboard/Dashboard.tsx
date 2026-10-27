import { useCallback, useEffect, useState } from 'react'
import { env } from '../../config/env'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { useToast } from '../../components/Toast'
import { loadDashboard, resetDemoData, type DashboardData } from '../../services/dashboardService'
import { errorMessage } from '../../services/errors'

interface Props { onCreatePokemon: () => void }

const ENTITY: Record<string, string> = { pokemon_records: 'Pokémon', trainers: 'Treinador', teams: 'Equipe' }

export function Dashboard({ onCreatePokemon }: Props) {
  const toast = useToast()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [tick, setTick] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try { setData(await loadDashboard()); setError(null) }
    catch (e) { setError(errorMessage(e)) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load, tick])

  async function doReset() {
    setResetting(true)
    try {
      await resetDemoData()
      toast.success('Dados de demonstração restaurados.')
      setConfirmReset(false)
      setTick((t) => t + 1)
    } catch (e) { toast.error(errorMessage(e)) }
    finally { setResetting(false) }
  }

  const cards: [string, number | undefined, string][] = [
    ['Pokémon cadastrados', data?.pokemon, 'stat-pokemon'],
    ['Treinadores', data?.trainers, 'stat-trainers'],
    ['Equipes', data?.teams, 'stat-teams'],
    ['Alterações nos últimos 7 dias', data?.recent, 'stat-recent'],
  ]

  return (
    <section aria-labelledby="dash-title" data-testid="page-dashboard">
      <header className="page-head">
        <div>
          <h1 id="dash-title">Dashboard</h1>
          <p className="muted">Indicadores calculados a partir do banco, não valores fixos.</p>
        </div>
        <div className="actions">
          <button type="button" className="btn btn-primary" onClick={onCreatePokemon} data-testid="quick-new-pokemon">Novo Pokémon</button>
          <button type="button" className="btn" disabled title="Disponível quando o CRUD de treinadores for entregue" data-testid="quick-new-trainer">Novo treinador (indisponível)</button>
          <button type="button" className="btn" disabled title="Disponível quando o CRUD de equipes for entregue" data-testid="quick-new-team">Nova equipe (indisponível)</button>
        </div>
      </header>

      {error && (
        <div role="alert" className="callout callout-error" data-testid="dashboard-error">
          <span>{error}</span>
          <button type="button" className="btn btn-sm" onClick={() => setTick((t) => t + 1)} data-testid="dashboard-retry">Tentar novamente</button>
        </div>
      )}

      <div className="stat-grid" aria-busy={loading} data-testid="stat-grid">
        {cards.map(([label, value, id]) => (
          <div className="stat" key={id} data-testid={id}>
            <span className="stat-label">{label}</span>
            {loading && value === undefined ? <span className="skeleton skeleton-num" data-testid="stat-loading" /> : <b className="stat-value" data-testid={`${id}-value`}>{value ?? '—'}</b>}
          </div>
        ))}
      </div>

      <section className="panel" aria-labelledby="activity-title">
        <h2 id="activity-title">Atividades recentes</h2>
        {!loading && !error && data?.activity.length === 0 ? (
          <p className="empty" data-testid="activity-empty">Nenhuma atividade ainda. Crie um registro para vê-lo aqui.</p>
        ) : (
          <div className="table-wrap">
            <table data-testid="activity-table">
              <thead><tr><th scope="col">Quando</th><th scope="col">Tipo</th><th scope="col">Registro</th><th scope="col">Ação</th></tr></thead>
              <tbody>
                {(data?.activity ?? []).map((a) => (
                  <tr key={a.id} data-testid="activity-row">
                    <td>{new Date(a.created_at).toLocaleString('pt-BR')}</td>
                    <td>{ENTITY[a.entity] ?? a.entity}</td>
                    <td>{a.label ?? '—'}</td>
                    <td>{a.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {env.demoMode ? (
        <section className="panel" aria-labelledby="demo-title" data-testid="demo-panel">
          <h2 id="demo-title">Dados de demonstração</h2>
          <p className="muted">Restaura apenas os registros originais de demonstração. Registros criados por visitantes não são apagados. O banco também precisa estar com demo_mode ativo.</p>
          <button type="button" className="btn btn-danger-ghost" onClick={() => setConfirmReset(true)} data-testid="demo-reset">Restaurar dados de demonstração</button>
        </section>
      ) : null}

      <ConfirmDialog open={confirmReset} title="Restaurar dados de demonstração" confirmLabel="Restaurar" busy={resetting}
        message="Os registros originais de demonstração serão recriados e suas alterações neles serão perdidas. Deseja continuar?"
        onConfirm={() => void doReset()} onCancel={() => setConfirmReset(false)} />
    </section>
  )
}
