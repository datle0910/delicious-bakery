import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, ShoppingBag, CreditCard, Truck } from 'lucide-react'
import { checkout } from '../../api/orders'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatCurrency } from '../../utils/format'
import { useCartActions } from '../../hooks/useCartActions'
import { fetchCurrentProfile } from '../../api/profile'
import { toast } from 'react-hot-toast'
import type { Order } from '../../types'

export const CheckoutPage = () => {
  const items = useCartStore((state) => state.items)
  const total = useCartStore((state) => state.total)
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { clear } = useCartActions()
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null)
  const [shippingAddress, setShippingAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'STRIPE'>('CASH')
  const [note, setNote] = useState('')

  // Clear pending Stripe order reference when switching away from card payment
  useEffect(() => {
    if (paymentMethod !== 'STRIPE') {
      window.sessionStorage.removeItem('pendingStripeOrderId')
    }
  }, [paymentMethod])

  // Always use the latest profile data (includes phone & address)
  const { data: currentProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchCurrentProfile,
    enabled: !!user,
  })

  const profile = currentProfile || user

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  )

  const shippingFee = useMemo(
    () => (totalQuantity > 5 ? 0 : total * 0.1),
    [total, totalQuantity],
  )

  const finalTotal = useMemo(() => total + shippingFee, [total, shippingFee])

  const checkoutMutation = useMutation({
    mutationFn: () =>
      checkout({
        userId: user!.id,
        paymentMethod: paymentMethod === 'STRIPE' ? 'STRIPE' : paymentMethod,
        shippingAddress,
        note,
      }),
    onSuccess: async (order) => {
      if (paymentMethod === 'STRIPE') {
        // remember pending Stripe order so user can resume if they go back
        window.sessionStorage.setItem('pendingStripeOrderId', String(order.id))
        navigate(`/checkout/stripe?orderId=${order.id}`)
      } else {
        // For CASH, complete immediately
        toast.success('Đặt hàng thành công!')
        await clear()
        queryClient.invalidateQueries({ queryKey: ['orders', user!.id] })
        setCompletedOrder(order)
      }
    },
    onError: (err: unknown) => {
      const error = err as { message?: string }
      toast.error(error?.message ?? 'Thanh toán thất bại')
    },
  })

  // Show empty state if no items
  if (!items.length && !completedOrder) {
    return (
      <EmptyState
        title="Giỏ hàng trống"
        description="Bạn cần thêm sản phẩm vào giỏ hàng trước khi thanh toán."
        actionLabel="Mua sắm ngay"
        onAction={() => navigate('/products')}
      />
    )
  }

  // Show success state after order
  if (completedOrder) {
    return (
      <div className="card" style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: '#dcfce7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          <CheckCircle size={40} color="#16a34a" />
        </div>
        <h2 style={{ color: '#16a34a', margin: '0 0 0.5rem' }}>Đặt hàng thành công!</h2>
        <p style={{ color: 'var(--muted)' }}>
          Cảm ơn bạn đã đặt hàng tại DeliciousBakery.
          <br />
          Chúng tôi đã gửi email xác nhận đến <strong>{user?.email}</strong>
        </p>

        <div
          style={{
            margin: '1.5rem 0',
            padding: '1.25rem',
            background: '#f8fafc',
            borderRadius: 'var(--radius)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--muted)' }}>Mã đơn hàng</span>
            <strong style={{ fontSize: '1.1rem' }}>{completedOrder.code}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--muted)' }}>Tổng thanh toán</span>
            <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>
              {formatCurrency(completedOrder.totalAmount)}
            </strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Button onClick={() => navigate('/orders')} iconLeft={<ShoppingBag size={16} />}>
            Xem đơn hàng
          </Button>
          <Button variant="outline" onClick={() => navigate('/products')}>
            Tiếp tục mua sắm
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: '2rem', alignItems: 'start' }}>
      <div className="card">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShoppingBag size={24} />
          Xác nhận đơn hàng
        </h2>
        <p style={{ color: 'var(--muted)' }}>
          Kiểm tra lại thông tin trước khi thanh toán.
        </p>

        <div style={{ margin: '1.5rem 0' }}>
          <h4 style={{ marginBottom: '1rem' }}>Sản phẩm ({items.length})</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {items.map((item) => (
              <div
                key={item.productId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem',
                  background: '#f8fafc',
                  borderRadius: 'var(--radius)',
                }}
              >
                <img
                  src={item.image && item.image.startsWith('http') ? item.image : '/placeholder.png'}
                  alt={item.name}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder.png'
                  }}
                  style={{
                    width: 56,
                    height: 56,
                    objectFit: 'cover',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                    {formatCurrency(item.price)} × {item.quantity}
                  </div>
                </div>
                <strong>{formatCurrency(item.price * item.quantity)}</strong>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem',
            background: '#fef3c7',
            borderRadius: 'var(--radius)',
            marginBottom: '1rem',
          }}
        >
          <Truck size={20} color="#d97706" />
          <div>
            <div style={{ fontWeight: 600, color: '#92400e' }}>
              {totalQuantity > 5 ? 'Miễn phí vận chuyển' : 'Phí vận chuyển 10% cho đơn nhỏ'}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#b45309' }}>
              Dự kiến giao trong 2-4 giờ
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ position: 'sticky', top: 20 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CreditCard size={20} />
          Thanh toán
        </h3>

        <div
          style={{
            padding: '1rem',
            background: '#f8fafc',
            borderRadius: 'var(--radius)',
            marginBottom: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ fontWeight: 600 }}>Thông tin giao hàng</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            <div>{profile?.fullName}</div>
            <div>{profile?.email}</div>
            <div>{profile?.phone || 'Chưa có số điện thoại'}</div>
          </div>
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.25rem',
              }}
            >
              <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Địa chỉ giao hàng</label>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                onClick={() => {
                  if (profile?.address && profile.address.trim().length > 0) {
                    setShippingAddress(profile.address)
                  } else {
                    toast.error('Bạn chưa cập nhật địa chỉ mặc định trong hồ sơ')
                  }
                }}
              >
                Dùng địa chỉ mặc định
              </button>
            </div>
            <textarea
              rows={3}
              value={shippingAddress}
              onChange={(event) => setShippingAddress(event.target.value)}
              placeholder={profile?.address || 'Nhập địa chỉ giao hàng...'}
              style={{
                width: '100%',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                padding: '0.6rem 0.7rem',
                fontSize: '0.9rem',
                resize: 'vertical',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.9rem', fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>
              Ghi chú giao hàng
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Ví dụ: Giao trong giờ hành chính, gọi trước khi giao..."
              style={{
                width: '100%',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                padding: '0.6rem 0.7rem',
                fontSize: '0.9rem',
                resize: 'vertical',
              }}
            />
          </div>
        </div>

        <div
          style={{
            padding: '1rem',
            background: '#f8fafc',
            borderRadius: 'var(--radius)',
            marginBottom: '1rem',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Phương thức thanh toán</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="radio"
                name="paymentMethod"
                value="CASH"
                checked={paymentMethod === 'CASH'}
                onChange={() => setPaymentMethod('CASH')}
              />
              <span>Tiền mặt (Thanh toán khi nhận hàng)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="radio"
                name="paymentMethod"
                value="STRIPE"
                checked={paymentMethod === 'STRIPE'}
                onChange={() => setPaymentMethod('STRIPE')}
              />
              <span>Thẻ Visa/MasterCard</span>
            </label>
          </div>
        </div>


        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Tạm tính</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Phí vận chuyển</span>
            <span style={{ color: shippingFee === 0 ? '#16a34a' : 'inherit' }}>
              {shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border)',
              marginTop: '0.5rem',
            }}
          >
            <strong>Tổng cộng</strong>
            <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>
              {formatCurrency(finalTotal)}
            </strong>
          </div>
        </div>

        <Button
          disabled={!items.length || checkoutMutation.isPending}
          onClick={() => {
            if (paymentMethod === 'STRIPE') {
              const pendingId = window.sessionStorage.getItem('pendingStripeOrderId')
              if (pendingId) {
                toast.success('Tiếp tục thanh toán đơn đã tạo')
                navigate(`/checkout/stripe?orderId=${pendingId}`)
                return
              }
            }
            checkoutMutation.mutate()
          }}
          style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}
        >
          {checkoutMutation.isPending ? 'Đang xử lý...' : 'Xác nhận & Thanh toán'}
        </Button>

        <p style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center', marginTop: '1rem' }}>
          Bằng việc đặt hàng, bạn đồng ý với điều khoản sử dụng của chúng tôi.
        </p>
      </div>
    </div>
  )
}
