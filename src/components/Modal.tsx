import { useEffect, useId, useRef, type ReactNode } from 'react'

interface Props {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  testId: string
  wide?: boolean
}

/** Modal baseado em <dialog> nativo: foco preso, Esc fecha, role="dialog" implícito. */
export function Modal({ open, title, onClose, children, testId, wide }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  if (!open) return null
  return (
    <dialog
      ref={ref}
      className={`modal${wide ? ' modal-wide' : ''}`}
      aria-labelledby={titleId}
      data-testid={testId}
      onClose={onClose}
      onCancel={onClose}
    >
      <div className="modal-head">
        <h2 id={titleId}>{title}</h2>
        <button type="button" className="icon-btn" aria-label={`Fechar ${title}`} onClick={onClose}>×</button>
      </div>
      <div className="modal-body">{children}</div>
    </dialog>
  )
}
