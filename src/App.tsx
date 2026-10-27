import { useCallback, useEffect, useState } from 'react'
import { isSupabaseConfigured } from './config/env'
import { ToastProvider } from './components/Toast'
import { Dashboard } from './features/dashboard/Dashboard'
import { PokemonPage } from './features/pokemon/PokemonPage'

type Route = 'dashboard' | 'pokemon'
const NAV: { id: string; label: string; route?: Route }[] = [
  { id: 'dashboard', label: 'Dashboard', route: 'dashboard' },
  { id: 'pokemon', label: 'Pokémon', route: 'pokemon' },
  { id: 'trainers', label: 'Treinadores' },
  { id: 'teams', label: 'Equipes' },
  { id: 'playground', label: 'Component Playground' },
  { id: 'api', label: 'API Explorer' },
]

function routeFromHash(): Route {
  return window.location.hash === '#/pokemon' ? 'pokemon' : 'dashboard'
}

function SetupNotice() {
  return (
    <section className="panel" data-testid="setup-notice" aria-labelledby="setup-title">
      <h1 id="setup-title">Supabase não configurado</h1>
      <p>Os dados são armazenados no seu projeto Supabase. Defina as variáveis abaixo e reinicie:</p>
      <pre>{`VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co\nVITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...`}</pre>
      <p className="muted">Passo a passo no README. Nunca use a chave service_role no frontend.</p>
    </section>
  )
}

export default function App() {
  const [route, setRoute] = useState<Route>(routeFromHash)
  const [autoCreate, setAutoCreate] = useState(false)

  useEffect(() => {
    const onHash = () => setRoute(routeFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = (r: Route) => { window.location.hash = r === 'dashboard' ? '#/' : `#/${r}` }
  const handled = useCallback(() => setAutoCreate(false), [])

  return (
    <ToastProvider>
      <div className="shell">
        <a className="skip-link" href="#main">Ir para o conteúdo</a>
        <aside className="sidebar">
          <div className="brand">
            <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="#fff"/><path d="M2 16a14 14 0 0 1 28 0z" fill="#d62839"/><path d="M2 16h28" stroke="#101826" strokeWidth="2"/><circle cx="16" cy="16" r="4" fill="#fff" stroke="#101826" strokeWidth="2"/></svg>
            <span>PokéQA Lab</span>
          </div>
          <nav aria-label="Navegação principal">
            <ul>
              {NAV.map((n) => (
                <li key={n.id}>
                  {n.route ? (
                    <button type="button" className="nav-btn" aria-current={route === n.route ? 'page' : undefined}
                      onClick={() => go(n.route!)} data-testid={`nav-${n.id}`}>{n.label}</button>
                  ) : (
                    <button type="button" className="nav-btn nav-off" disabled data-testid={`nav-${n.id}`}>
                      {n.label}<small>Em breve</small>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <p className="sidebar-note">Ambiente público de treino. Use apenas dados fictícios.</p>
        </aside>
        <main id="main" tabIndex={-1}>
          {!isSupabaseConfigured ? <SetupNotice /> : route === 'pokemon'
            ? <PokemonPage autoCreate={autoCreate} onAutoCreateHandled={handled} />
            : <Dashboard onCreatePokemon={() => { setAutoCreate(true); go('pokemon') }} />}
        </main>
      </div>
    </ToastProvider>
  )
}
