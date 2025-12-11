import type { ReactNode } from 'react'
import { PackageSearch } from 'lucide-react'
import { Button } from './Button'

interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: ReactNode
}

export const EmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) => (
  <div
    className="card"
    style={{
      textAlign: 'center',
      padding: '3rem 2rem',
    }}
  >
    <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: '#fef3c7', marginBottom: '1rem' }}>
      {icon ?? <PackageSearch color="#f97316" size={32} />}
    </div>
    <h3>{title}</h3>
    {description ? <p style={{ color: 'var(--muted)' }}>{description}</p> : null}
    {actionLabel ? (
      <Button onClick={onAction} style={{ marginTop: '1rem' }}>
        {actionLabel}
      </Button>
    ) : null}
  </div>
)

