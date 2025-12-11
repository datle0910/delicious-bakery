import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Eye, CheckCircle, XCircle, History, Package } from 'lucide-react'
import { fetchOrdersByUser } from '../../api/orders'
import { useAuthStore } from '../../store/authStore'
import { formatCurrency, formatDate } from '../../utils/format'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import type { Order } from '../../types'

const statusLabels: Record<string, string> = {
  PENDING_CONFIRMATION: 'Chờ xác nhận',
  PREPARING: 'Đang chuẩn bị',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
}

export const OrderHistoryPage = () => {
  const { user } = useAuthStore()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const { data: allOrders = [], isLoading, isRefetching } = useQuery({
    queryKey: ['orders', user?.id],
    enabled: Boolean(user),
    queryFn: () => fetchOrdersByUser(user!.id),
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates (less frequent for history)
    refetchIntervalInBackground: true, // Continue refetching even when tab is in background
  })

  // Filter to only show DELIVERED and CANCELLED orders
  const historyOrders = useMemo(
    () => allOrders.filter((order) => order.status === 'DELIVERED' || order.status === 'CANCELLED'),
    [allOrders],
  )

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>Đang tải lịch sử đơn hàng...</p>
      </div>
    )
  }

  if (!historyOrders.length) {
    return (
      <EmptyState
        title="Bạn chưa có lịch sử đơn hàng"
        description="Các đơn hàng đã hoàn thành hoặc đã hủy sẽ hiển thị tại đây."
      />
    )
  }

  return (
    <>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <History size={28} color="var(--muted)" />
            Lịch sử đơn hàng
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
            Xem lại các đơn hàng đã hoàn thành hoặc đã hủy
            {isRefetching && <span style={{ marginLeft: '0.5rem', fontStyle: 'italic' }}>(Đang cập nhật...)</span>}
          </p>
        </div>
        <Link
          to="/orders"
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
          <Package size={16} />
          Đơn đang xử lý
        </Link>
      </div>

      <div className="card" style={{ background: '#fafafa' }}>
        <table className="table" style={{ margin: 0 }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th>Mã đơn</th>
              <th>Ngày đặt</th>
              <th>Trạng thái</th>
              <th>Sản phẩm</th>
              <th>Tổng tiền</th>
              <th style={{ textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {historyOrders
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.createdAt ?? '').getTime() -
                  new Date(a.createdAt ?? '').getTime(),
              )
              .map((order) => (
                <tr
                  key={order.id}
                  style={{
                    background: order.status === 'DELIVERED' ? '#f0fdf4' : '#fef2f2',
                    borderLeft: `4px solid ${
                      order.status === 'DELIVERED' ? '#16a34a' : '#dc2626'
                    }`,
                  }}
                >
                  <td style={{ fontWeight: 600, color: 'var(--foreground)' }}>{order.code}</td>
                  <td style={{ color: 'var(--muted)' }}>{formatDate(order.createdAt)}</td>
                  <td>
                    <span
                      className={`pill ${
                        order.status === 'DELIVERED' ? 'pill-success' : 'pill-danger'
                      }`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      {order.status === 'DELIVERED' ? (
                        <CheckCircle size={14} />
                      ) : (
                        <XCircle size={14} />
                      )}
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {order.items.slice(0, 2).map((item) => (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.4rem',
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
                                width: 36,
                                height: 36,
                                objectFit: 'cover',
                                borderRadius: 'var(--radius)',
                              }}
                            />
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.productName}</div>
                            <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>
                              {formatCurrency(item.unitPrice)} × {item.quantity}
                            </div>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div
                          style={{
                            padding: '0.4rem',
                            textAlign: 'center',
                            color: 'var(--muted)',
                            fontSize: '0.8rem',
                            fontStyle: 'italic',
                          }}
                        >
                          ... và {order.items.length - 2} sản phẩm khác
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(order.totalAmount)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <Button
                      variant="text"
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      iconLeft={<Eye size={16} />}
                      style={{ fontSize: '0.9rem' }}
                    >
                      Chi tiết
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
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
                background: '#f8fafc',
                padding: '1rem',
                borderRadius: 'var(--radius)',
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
                          : 'pill-warning'
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
                  background: selectedOrder.status === 'DELIVERED' ? '#dcfce7' : '#fee2e2',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.9rem',
                  border: `1px solid ${selectedOrder.status === 'DELIVERED' ? '#86efac' : '#fecaca'}`,
                }}
              >
                <strong>Thanh toán:</strong> {selectedOrder.payment.method} -{' '}
                {selectedOrder.payment.status}
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
