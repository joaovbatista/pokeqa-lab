import { TYPE_COLORS, TYPE_LABELS } from '../config/constants'

export function TypeBadge({ type }: { type: string }) {
  const [bg, fg] = TYPE_COLORS[type] ?? ['#d9dfe7', '#16202e']
  return (
    <span className="type-badge" style={{ background: bg, color: fg }} data-testid={`type-badge-${type}`}>
      {TYPE_LABELS[type] ?? type}
    </span>
  )
}
