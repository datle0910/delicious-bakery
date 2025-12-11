import { AlertTriangle } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning'
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => (
  <Modal open={open} title={title} onClose={onCancel} width={420}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          padding: '1rem',
          background: variant === 'danger' ? '#fee2e2' : '#fef3c7',
          borderRadius: 'var(--radius)',
        }}
      >
        <AlertTriangle
          size={24}
          color={variant === 'danger' ? '#dc2626' : '#d97706'}
          style={{ flexShrink: 0, marginTop: 2 }}
        />
        <p style={{ margin: 0, color: variant === 'danger' ? '#991b1b' : '#92400e' }}>
          {message}
        </p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          style={
            variant === 'danger'
              ? { background: '#dc2626', boxShadow: '0 10px 20px rgba(220,38,38,0.35)' }
              : undefined
          }
        >
          {isLoading ? 'Đang xử lý...' : confirmLabel}
        </Button>
      </div>
    </div>
  </Modal>
)

