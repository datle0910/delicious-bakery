import { Minus, Plus, Trash2 } from 'lucide-react'
import type { CartLineItem } from '../../types'
import { formatCurrency } from '../../utils/format'
import { Button } from '../ui/Button'

interface Props {
  items: CartLineItem[]
  onIncrease: (item: CartLineItem) => void
  onDecrease: (item: CartLineItem) => void
  onRemove: (item: CartLineItem) => void
}

export const CartList = ({ items, onIncrease, onDecrease, onRemove }: Props) => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    {items.map((item) => (
      <div
        key={item.productId}
        style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '1rem',
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
            background: '#fff7ed',
          }}
        >
          <img
            src={item.image && item.image.startsWith('http') ? item.image : '/placeholder.png'}
            alt={item.name}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/placeholder.png'
            }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: 0 }}>{item.name}</h4>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
            {formatCurrency(item.price)} x {item.quantity}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={() => onDecrease(item)} type="button">
            <Minus size={16} />
          </button>
          <strong>{item.quantity}</strong>
          <button className="btn btn-outline" onClick={() => onIncrease(item)} type="button">
            <Plus size={16} />
          </button>
        </div>
        <Button variant="text" onClick={() => onRemove(item)} iconLeft={<Trash2 size={16} color="#dc2626" />}>
          Xóa
        </Button>
      </div>
    ))}
  </div>
)

