import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import type { Product } from '../../types'
import { formatCurrency } from '../../utils/format'
import { Button } from '../ui/Button'

interface Props {
  product: Product
  onAddToCart: (product: Product) => void
}

export const ProductCard = ({ product, onAddToCart }: Props) => (
  <div
    className="card"
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      height: '100%',
      minHeight: 430,
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-8px)'
      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)'
    }}
  >
    <div
      style={{
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        aspectRatio: '4 / 3',
        background: '#fff5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.3s ease',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      <img
        src={product.image || '/placeholder.png'}
        alt={product.name}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: 'transform 0.3s ease',
        }}
      />
    </div>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="tag" style={{ marginBottom: '0.5rem', flexShrink: 0 }}>
        {product.categoryName ?? 'Danh mục'}
      </div>
      <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', lineHeight: 1.3 }}>
          {product.name}
        </h3>
      </Link>
      <p
        style={{
          color: 'var(--muted)',
          fontSize: '0.9rem',
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: 1.4,
          minHeight: '2.8em',
          flexShrink: 0,
        }}
        title={product.description || 'Ngon và hấp dẫn'}
      >
        {product.description || 'Ngon và hấp dẫn'}
      </p>
    </div>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        marginTop: 'auto',
        paddingTop: '0.5rem',
      }}
    >
      <strong style={{ fontSize: '1.1rem' }}>{formatCurrency(product.price)}</strong>
      <Button onClick={() => onAddToCart(product)} iconLeft={<ShoppingCart size={16} />}>
        Mua
      </Button>
    </div>
  </div>
)

