import { Link } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { CartList } from '../../components/cart/CartList'
import { EmptyState } from '../../components/ui/EmptyState'
import { useCartActions } from '../../hooks/useCartActions'
import { formatCurrency } from '../../utils/format'
import { useAuthStore } from '../../store/authStore'

export const CartPage = () => {
  const items = useCartStore((state) => state.items)
  const total = useCartStore((state) => state.total)
  const { user } = useAuthStore()
  const { changeQuantity, removeFromCart } = useCartActions()

  if (!items.length) {
    return (
      <EmptyState
        title="Giỏ hàng trống"
        description="Hãy chọn vài chiếc bánh ngon nhé!"
        actionLabel="Quay lại mua sắm"
        onAction={() => window.history.back()}
      />
    )
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
      <div>
        <h2>Giỏ hàng</h2>
        <CartList
          items={items}
          onIncrease={(item) => changeQuantity(item, item.quantity + 1)}
          onDecrease={(item) => changeQuantity(item, item.quantity - 1)}
          onRemove={(item) => removeFromCart(item)}
        />
      </div>
      <div className="card" style={{ position: 'sticky', top: 20, height: 'fit-content' }}>
        <h3>Tổng kết</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1rem 0' }}>
          <span>Tạm tính</span>
          <strong>{formatCurrency(total)}</strong>
        </div>
        {user ? (
          <Link to="/checkout" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>
            Tiến hành thanh toán
          </Link>
        ) : (
          <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>
            Đăng nhập để thanh toán
          </Link>
        )}
      </div>
    </div>
  )
}

