import { useId, type ReactNode } from 'react'

interface Props {
  label: string
  error?: string
  hint?: string
  required?: boolean
  testId: string
  children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode
}

/** Associa label, dica e erro ao controle via ids estáveis por instância. */
export function Field({ label, error, hint, required, testId, children }: Props) {
  const id = useId()
  const errId = `${id}-err`
  const hintId = `${id}-hint`
  const describedBy = [error ? errId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined
  return (
    <div className={`field${error ? ' has-error' : ''}`} data-testid={`field-${testId}`}>
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true" className="req"> *</span>}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && !error && <small id={hintId} className="hint">{hint}</small>}
      {error && <small id={errId} className="error-text" data-testid={`error-${testId}`}>{error}</small>}
    </div>
  )
}
