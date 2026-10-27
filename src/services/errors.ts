export type AppErrorKind = 'config' | 'network' | 'timeout' | 'not_found' | 'conflict' | 'unique' | 'validation' | 'forbidden' | 'unknown'

export class AppError extends Error {
  kind: AppErrorKind
  constructor(kind: AppErrorKind, message: string) {
    super(message)
    this.name = 'AppError'
    this.kind = kind
  }
}

interface PgLikeError { code?: string; message?: string; details?: string }

/** Converte erros do PostgREST/Postgres em mensagens claras para o usuário. */
export function mapSupabaseError(err: PgLikeError | null | undefined): AppError {
  const code = err?.code ?? ''
  const msg = err?.message ?? 'Erro desconhecido'
  if (code === '23505') return new AppError('unique', 'Já existe um registro com esse valor único.')
  if (code === '23514') return new AppError('validation', `Valor rejeitado pelas regras do banco: ${msg}`)
  if (code === '23502') return new AppError('validation', 'Há campos obrigatórios ausentes.')
  if (code === '23503') return new AppError('validation', 'Relacionamento inválido: o registro referenciado não existe.')
  if (code === '42501' || /row-level security/i.test(msg)) return new AppError('forbidden', 'Acesso negado pelas políticas de segurança (RLS).')
  if (/failed to fetch|networkerror|load failed/i.test(msg)) return new AppError('network', 'Falha de rede ao acessar o Supabase.')
  return new AppError('unknown', msg)
}

export function errorMessage(e: unknown): string {
  if (e instanceof AppError) return e.message
  if (e instanceof Error) return e.message
  return 'Erro inesperado.'
}
