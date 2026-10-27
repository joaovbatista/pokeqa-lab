import { Modal } from './Modal'

interface Props {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, message, confirmLabel, busy, onConfirm, onCancel }: Props) {
  return (
    <Modal open={open} title={title} onClose={onCancel} testId="confirm-dialog">
      <p data-testid="confirm-message">{message}</p>
      <div className="actions">
        <button type="button" className="btn" onClick={onCancel} data-testid="confirm-cancel">Cancelar</button>
        <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={busy} data-testid="confirm-accept">
          {busy ? 'Excluindo…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
