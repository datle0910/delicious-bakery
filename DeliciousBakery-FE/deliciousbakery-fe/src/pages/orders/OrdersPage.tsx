import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Eye, X, Package, Truck, Clock, History } from 'lucide-react'
import { fetchOrdersByUser, cancelOrder } from '../../api/orders'
import { useAuthStore } from '../../store/authStore'
import { formatCurrency, formatDate } from '../../utils/format'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { toast } from 'react-hot-toast'
import type { Order } from '../../types'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'

const statusLabels: Record<string, string> = {
  PENDING_CONFIRMATION: 'Chờ xác nhận',
  PREPARING: 'Đang chuẩn bị',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
}

export const OrdersPage = () => {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null)

  const { data: allOrders = [], isLoading, isRefetching } = useQuery({
    queryKey: ['orders', user?.id],
    enabled: Boolean(user),
    queryFn: () => fetchOrdersByUser(user!.id),
    refetchInterval: 3000, // Refetch every 3 seconds for real-time updates
    refetchIntervalInBackground: true, // Continue refetching even when tab is in background
  })

  // Filter to show all active, non-final orders
  const activeOrders = useMemo(
    () =>
      allOrders.filter(
        (order) =>
          order.status === 'PENDING_CONFIRMATION' ||
          order.status === 'PREPARING' ||
          order.status === 'SHIPPING',
      ),
    [allOrders],
  )

  const cancelOrderMutation = useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      toast.success('Đã hủy đơn hàng thành công')
      queryClient.invalidateQueries({ queryKey: ['orders', user?.id] })
      setSelectedOrder(null)
      setCancelTarget(null)
    },
    onError: (err: unknown) => {
      const error = err as { message?: string }
      toast.error(error?.message ?? 'Không thể hủy đơn hàng')
    },
  })

  const handleCancelOrder = (order: Order) => {
    setCancelTarget(order)
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>Đang tải đơn hàng...</p>
      </div>
    )
  }

  if (!activeOrders.length) {
    return (
      <EmptyState
        title="Bạn chưa có đơn hàng đang xử lý"
        description="Các đơn hàng đang chờ xử lý hoặc đang giao sẽ hiển thị tại đây."
      />
    )
  }

  return (
    <>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Package size={28} color="var(--primary)" />
            Đơn hàng đang xử lý
            {isRefetching && (
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--muted)',
                  fontWeight: 'normal',
                }}
                title="Đang cập nhật..."
              >
                ⟳
              </span>
            )}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
            Theo dõi các đơn hàng đang chờ xử lý hoặc đang được giao đến bạn
            {isRefetching && <span style={{ marginLeft: '0.5rem', fontStyle: 'italic' }}>(Đang cập nhật...)</span>}
          </p>
        </div>
        <Link
          to="/orders/history"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            textDecoration: 'none',
            color: 'var(--muted)',
            fontSize: '0.9rem',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f8fafc'
            e.currentTarget.style.color = 'var(--foreground)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--muted)'
          }}
        >
          <History size={16} />
          Xem lịch sử
        </Link>
      </div>

      <div style={{ display: 'grid', gap: '1.25rem' }}>
        {activeOrders
          .slice()
          .sort(
            (a, b) =>
              new Date(b.createdAt ?? '').getTime() - new Date(a.createdAt ?? '').getTime(),
          )
          .map((order) => (
            <div
              key={order.id}
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '2px solid',
                borderColor:
                  order.status === 'SHIPPING'
                    ? 'var(--primary)'
                    : 'var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>
                      {order.code}
                    </strong>
                    <span
                      className={`pill ${
                        order.status === 'DELIVERED'
                          ? 'pill-success'
                          : order.status === 'CANCELLED'
                            ? 'pill-danger'
                            : order.status === 'SHIPPING'
                              ? 'pill-warning'
                              : 'pill-info'
                      }`}
                      style={{ fontSize: '0.85rem', padding: '0.25rem 0.75rem' }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {order.status === 'SHIPPING' ? <Truck size={14} /> : <Clock size={14} />}
                        {statusLabels[order.status] || order.status}
                      </span>
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={14} />
                      {formatDate(order.createdAt)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Package size={14} />
                      {order.items.length} sản phẩm
                    </span>
                  </div>
                  
                  {/* Display 1-2 items in detail */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {order.items.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.5rem',
                          background: '#fff',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)',
                        }}
                      >
                        {item.productImage && (
                          <img
                            src={item.productImage && item.productImage.startsWith('http') ? item.productImage : '/placeholder.png'}
                            alt={item.productName}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = '/placeholder.png'
                            }}
                            style={{
                              width: 48,
                              height: 48,
                              objectFit: 'cover',
                              borderRadius: 'var(--radius)',
                            }}
                          />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.productName}</div>
                          <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                            {formatCurrency(item.unitPrice)} × {item.quantity}
                          </div>
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                          {formatCurrency(item.totalPrice)}
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <div
                        style={{
                          padding: '0.5rem',
                          textAlign: 'center',
                          color: 'var(--muted)',
                          fontSize: '0.9rem',
                          fontStyle: 'italic',
                        }}
                      >
                        ... và {order.items.length - 2} sản phẩm khác
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right', marginLeft: '1rem' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {formatCurrency(order.totalAmount)}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border)',
                }}
              >
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setSelectedOrder(order)}
                  iconLeft={<Eye size={16} />}
                  style={{ flex: 1 }}
                >
                  Xem chi tiết
                </Button>
                {(order.status === 'PENDING_CONFIRMATION' || order.status === 'PREPARING') && (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => handleCancelOrder(order)}
                    disabled={cancelOrderMutation.isPending}
                    iconLeft={<X size={16} />}
                    style={{
                      color: 'var(--danger)',
                      borderColor: 'var(--danger)',
                      flex: 1,
                    }}
                  >
                    Hủy đơn
                  </Button>
                )}
              </div>
            </div>
          ))}
      </div>

      <Modal
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={`Chi tiết đơn hàng ${selectedOrder?.code ?? ''}`}
        width={640}
      >
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                padding: '1rem',
                borderRadius: 'var(--radius)',
                border: '1px solid #bae6fd',
              }}
            >
              <div>
                <strong>Ngày đặt:</strong>
                <p style={{ margin: '0.25rem 0 0' }}>{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <div>
                <strong>Trạng thái:</strong>
                <p style={{ margin: '0.25rem 0 0' }}>
                  <span
                    className={`pill ${
                      selectedOrder.status === 'DELIVERED'
                        ? 'pill-success'
                        : selectedOrder.status === 'CANCELLED'
                          ? 'pill-danger'
                          : selectedOrder.status === 'SHIPPING'
                            ? 'pill-warning'
                            : 'pill-info'
                    }`}
                  >
                    {statusLabels[selectedOrder.status] || selectedOrder.status}
                  </span>
                </p>
              </div>
              <div>
                <strong>Địa chỉ giao hàng:</strong>
                <p style={{ margin: '0.25rem 0 0' }}>
                  {selectedOrder.shippingAddress || 'Chưa cập nhật'}
                </p>
              </div>
              <div>
                <strong>Ghi chú:</strong>
                <p style={{ margin: '0.25rem 0 0' }}>{selectedOrder.note || '—'}</p>
              </div>
            </div>

            <div>
              <h4 style={{ marginBottom: '0.75rem' }}>Sản phẩm đã đặt</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.75rem',
                      background: '#fff',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                    }}
                  >
                    {item.productImage && (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        style={{
                          width: 56,
                          height: 56,
                          objectFit: 'cover',
                          borderRadius: 'var(--radius)',
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{item.productName}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                        {formatCurrency(item.unitPrice)} × {item.quantity}
                      </div>
                    </div>
                    <div style={{ fontWeight: 600 }}>{formatCurrency(item.totalPrice)}</div>
                  </div>
                ))}
              </div>
            </div>

            {(() => {
              const shippingFee = selectedOrder.shippingFee ?? 0
              const subtotal = selectedOrder.totalAmount - shippingFee
              return (
                <div
                  style={{
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #fff0f6, #ffe4e6)',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.4rem',
                      fontSize: '0.95rem',
                    }}
                  >
                    <span>Tạm tính</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.4rem',
                      fontSize: '0.95rem',
                    }}
                  >
                    <span>Phí vận chuyển</span>
                    <span>{formatCurrency(shippingFee)}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '0.5rem',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid rgba(0,0,0,0.06)',
                      fontWeight: 700,
                    }}
                  >
                    <span>Tổng cộng</span>
                    <span style={{ fontSize: '1.3rem', color: 'var(--primary)' }}>
                      {formatCurrency(selectedOrder.totalAmount)}
                    </span>
                  </div>
                </div>
              )
            })()}

            {selectedOrder.payment && (
              <div
                style={{
                  padding: '0.75rem',
                  background: '#dcfce7',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.9rem',
                }}
              >
                <strong>Thanh toán:</strong> {selectedOrder.payment.method} -{' '}
                {selectedOrder.payment.status}
              </div>
            )}

            {(selectedOrder.status === 'PENDING_CONFIRMATION' || selectedOrder.status === 'PREPARING') && (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => handleCancelOrder(selectedOrder)}
                  disabled={cancelOrderMutation.isPending}
                  iconLeft={<X size={16} />}
                  style={{
                    color: 'var(--danger)',
                    borderColor: 'var(--danger)',
                    flex: 1,
                  }}
                >
                  {cancelOrderMutation.isPending ? 'Đang xử lý...' : 'Hủy đơn hàng'}
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Xác nhận hủy đơn hàng"
        message={
          cancelTarget
            ? `Bạn có chắc chắn muốn hủy đơn ${cancelTarget.code}? Hành động này sẽ khôi phục tồn kho và không thể hoàn tác.`
            : ''
        }
        confirmLabel="Hủy đơn hàng"
        isLoading={cancelOrderMutation.isPending}
        onConfirm={() => cancelTarget && cancelOrderMutation.mutate(cancelTarget.id)}
        onCancel={() => setCancelTarget(null)}
        tone="danger"
      />
    </>
  )
}

