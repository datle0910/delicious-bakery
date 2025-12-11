import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CreditCard, ArrowLeft, CheckCircle, ShieldCheck, Phone, Sparkles } from 'lucide-react'
import { createStripePaymentIntent, updatePaymentStatus } from '../../api/payments'
import { fetchOrderById } from '../../api/orders'
import { useAuthStore } from '../../store/authStore'
import { useCartActions } from '../../hooks/useCartActions'
import { Button } from '../../components/ui/Button'
import { formatCurrency } from '../../utils/format'
import { toast } from 'react-hot-toast'
import type { Order } from '../../types'

// Disable Stripe advanced fraud signals beacons to avoid r.stripe.com fetch errors in some environments
const stripePromise = loadStripe(
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    'pk_test_51Scebn12BkJJKDiGIalfwPUTSaleftMhELqXuXm1TerhMMzSjCrlpEJLqFvCoxnGgD5RKg9cw9DfXJhARDlQUorQ00tU3AkxpA'
)


export const StripePaymentPage = () => {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const { clear } = useCartActions()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const { data: order, isLoading: orderLoading } = useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrderById(Number(orderId!)),
    enabled: !!orderId,
  })

  const { mutate: createPaymentIntent, isPending: creatingIntent } = useMutation({
    mutationFn: () =>
      createStripePaymentIntent({
        orderId: order!.id,
        amount: order!.totalAmount,
        currency: 'vnd',
      }),
    onSuccess: (data) => {
      setClientSecret(data.clientSecret)
    },
    onError: (error: unknown) => {
      const err = error as { message?: string }
      toast.error('Không thể khởi tạo thanh toán: ' + (err?.message || 'Lỗi không xác định'))
    },
  })

  useEffect(() => {
    if (order && !clientSecret && !creatingIntent) {
      createPaymentIntent()
    }
  }, [order, clientSecret, creatingIntent, createPaymentIntent])

  if (!orderId) {
    return (
      <div className="card" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)' }}>Không tìm thấy thông tin đơn hàng</p>
        <Button onClick={() => navigate('/checkout')} style={{ marginTop: '1rem' }}>
          Quay lại thanh toán
        </Button>
      </div>
    )
  }

  if (orderLoading) {
    return (
      <div className="card" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <p>Đang tải thông tin đơn hàng...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="card" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)' }}>Không tìm thấy đơn hàng</p>
        <Button onClick={() => navigate('/checkout')} style={{ marginTop: '1rem' }}>
          Quay lại thanh toán
        </Button>
      </div>
    )
  }

  if (paymentSuccess) {
    return (
      <div className="card" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
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
        <h2 style={{ color: '#16a34a', margin: '0 0 0.5rem' }}>Thanh toán thành công!</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
          Đơn hàng của bạn đã được thanh toán thành công.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Button onClick={() => navigate('/orders')}>Xem đơn hàng</Button>
          <Button variant="outline" onClick={() => navigate('/products')}>
            Tiếp tục mua sắm
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        maxWidth: 920,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '1.5rem',
        alignItems: 'start',
      }}
    >
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0f172a, #1d4ed8)',
          color: '#e2e8f0',
          border: 'none',
          boxShadow: '0 16px 60px rgba(0,0,0,0.18)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12), transparent 30%), radial-gradient(circle at 80% 10%, rgba(255,255,255,0.08), transparent 25%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <Button
            variant="text"
            onClick={() => navigate('/checkout')}
            iconLeft={<ArrowLeft size={18} />}
            style={{ color: '#cbd5e1' }}
          >
            Quay lại
          </Button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CreditCard size={26} color="#f8fafc" />
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
              Thanh toán thẻ Visa / MasterCard
            </div>
            <div style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>Bảo mật bởi Stripe · Mã hóa 256-bit</div>
          </div>
        </div>

        <div
          style={{
            marginTop: '1.5rem',
            padding: '1.2rem',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.08)',
            display: 'grid',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
            <span>Mã đơn hàng</span>
            <strong style={{ color: '#f8fafc' }}>{order.code}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
            <span>Khách hàng</span>
            <strong style={{ color: '#f8fafc' }}>{order.customerName}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
            <span>Tổng thanh toán</span>
            <strong style={{ fontSize: '1.4rem', color: '#38bdf8' }}>{formatCurrency(order.totalAmount)}</strong>
          </div>
        </div>

        <div
          style={{
            marginTop: '1.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              padding: '0.85rem',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.08)',
              display: 'flex',
              gap: '0.6rem',
              alignItems: 'center',
            }}
          >
            <ShieldCheck size={18} color="#a5b4fc" />
            <div>
              <strong style={{ display: 'block', color: '#e2e8f0', fontSize: '0.95rem' }}>Bảo mật</strong>
              <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>Mã hóa & PCI DSS</span>
            </div>
          </div>
          <div
            style={{
              padding: '0.85rem',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.08)',
              display: 'flex',
              gap: '0.6rem',
              alignItems: 'center',
            }}
          >
            <Sparkles size={18} color="#facc15" />
            <div>
              <strong style={{ display: 'block', color: '#e2e8f0', fontSize: '0.95rem' }}>Xử lý nhanh</strong>
              <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>Xác nhận tức thì</span>
            </div>
          </div>
          <div
            style={{
              padding: '0.85rem',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.08)',
              display: 'flex',
              gap: '0.6rem',
              alignItems: 'center',
            }}
          >
            <Phone size={18} color="#34d399" />
            <div>
              <strong style={{ display: 'block', color: '#e2e8f0', fontSize: '0.95rem' }}>Hỗ trợ 24/7</strong>
              <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>Hotline & chat</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ boxShadow: '0 12px 40px rgba(15,23,42,0.08)' }}>
        {!clientSecret ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--muted)' }}>Đang khởi tạo thanh toán...</p>
          </div>
        ) : (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripePaymentForm
              order={order}
              clientSecret={clientSecret}
              onSuccess={async () => {
                setPaymentSuccess(true)
                await clear()
                window.sessionStorage.removeItem('pendingStripeOrderId')
                queryClient.invalidateQueries({ queryKey: ['orders', user!.id] })
              }}
            />
          </Elements>
        )}
      </div>
    </div>
  )
}

const StripePaymentForm = ({
  order,
  clientSecret,
  onSuccess,
}: {
  order: Order
  clientSecret: string
  onSuccess: () => void
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const queryClient = useQueryClient()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      return
    }

    setIsProcessing(true)

    const cardNumberElement = elements.getElement(CardNumberElement)

    if (!cardNumberElement) {
      setIsProcessing(false)
      return
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumberElement,
        },
      })

      if (error) {
        toast.error(error.message || 'Thanh toán thất bại')
        setIsProcessing(false)
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Update payment status directly (no webhook needed)
        try {
          if (order.payment?.id) {
            await updatePaymentStatus(order.payment.id, 'PAID')
            queryClient.invalidateQueries({ queryKey: ['order', order.id] })
          }
        } catch (err) {
          console.error('Failed to update payment status:', err)
        }
        toast.success('Thanh toán thành công!')
        onSuccess()
      } else {
        setIsProcessing(false)
      }
    } catch (err: unknown) {
      const error = err as { message?: string }
      toast.error('Lỗi thanh toán: ' + (error?.message || 'Lỗi không xác định'))
      setIsProcessing(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
        iconColor: '#9e2146',
      },
    },
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, fontSize: '1rem' }}>
          Thông tin thẻ
        </label>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Card Number */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
              Số thẻ
            </label>
            <div
              style={{
                padding: '0.875rem 1rem',
                background: '#fff',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                transition: 'border-color 0.2s ease',
              }}
            >
              <CardNumberElement options={cardElementOptions} />
            </div>
          </div>

          {/* Expiry and CVC */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                Ngày hết hạn
              </label>
              <div
                style={{
                  padding: '0.875rem 1rem',
                  background: '#fff',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  transition: 'border-color 0.2s ease',
                }}
              >
                <CardExpiryElement options={cardElementOptions} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                CVC
              </label>
              <div
                style={{
                  padding: '0.875rem 1rem',
                  background: '#fff',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  transition: 'border-color 0.2s ease',
                }}
              >
                <CardCvcElement options={cardElementOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        {isProcessing ? 'Đang xử lý...' : `Thanh toán ${formatCurrency(order.totalAmount)}`}
      </Button>

      <div
        style={{
          marginTop: '1rem',
          padding: '1rem',
          background: '#f8fafc',
          border: '1px dashed var(--border)',
          borderRadius: 'var(--radius)',
          fontSize: '0.9rem',
          color: 'var(--muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <ShieldCheck size={18} color="#10b981" />
        <div>
          <div style={{ fontWeight: 600, color: 'var(--foreground)' }}>Thanh toán an toàn</div>
          <div>Mọi giao dịch được mã hóa và xác minh bởi Stripe.</div>
        </div>
      </div>
    </form>
  )
}

