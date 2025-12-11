import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Minus, Plus, AlertTriangle, CreditCard, CheckCircle, Clock, XCircle, RotateCcw } from 'lucide-react'
import { fetchOrders, updateOrderStatus, updateOrderItemQuantity } from '../../api/orders'
import { updatePaymentStatus, refundPayment } from '../../api/payments'
import type { Order, OrderItem, Payment } from '../../types'
import { formatCurrency, formatDate } from '../../utils/format'
import { Modal } from '../../components/ui/Modal'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'

const statusOptions = ['PENDING_CONFIRMATION', 'PREPARING', 'SHIPPING', 'DELIVERED', 'CANCELLED']

const statusLabels: Record<string, string> = {
  PENDING_CONFIRMATION: 'Chờ xác nhận',
  PREPARING: 'Đang chuẩn bị',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
}

const paymentStatusOptions = ['PENDING', 'PAID', 'FAILED']
const paymentStatusLabels: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  PAID: 'Đã thanh toán',
  FAILED: 'Thất bại',
  REFUNDED: 'Đã hoàn tiền',
}

const paymentMethodLabels: Record<string, string> = {
  CASH: 'Tiền mặt',
  STRIPE: 'Thẻ Visa/MasterCard',
}

const getPaymentStatusIcon = (status: string) => {
  switch (status) {
    case 'PAID':
      return <CheckCircle size={16} color="#16a34a" />
    case 'PENDING':
      return <Clock size={16} color="#d97706" />
    case 'FAILED':
    case 'REFUNDED':
      return <XCircle size={16} color="#dc2626" />
    default:
      return null
  }
}

export const AdminOrdersPage = () => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterOrderStatus, setFilterOrderStatus] = useState<string>('')
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('')
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['orders', 'all'],
    queryFn: fetchOrders,
  })
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [status, setStatus] = useState('PENDING_CONFIRMATION')
  const [paymentStatus, setPaymentStatus] = useState('PENDING')
  const [editingItems, setEditingItems] = useState<Map<number, number>>(new Map())
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null)

  const statusMutation = useMutation({
    mutationFn: (payload: { id: number; status: string }) =>
      updateOrderStatus(payload),
    onSuccess: (updatedOrder) => {
      toast.success('Đã cập nhật trạng thái đơn hàng')
      // Invalidate admin orders
      queryClient.invalidateQueries({ queryKey: ['orders', 'all'] })
      // Invalidate the specific customer's orders to trigger real-time update
      queryClient.invalidateQueries({ queryKey: ['orders', updatedOrder.customerId] })
      // Also invalidate all order queries to ensure all customers see updates
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      setSelectedOrder(null)
    },
    onError: (err: unknown) => {
      const error = err as { message?: string }
      toast.error(error?.message ?? 'Không thể cập nhật trạng thái')
    },
  })

  const itemQuantityMutation = useMutation({
    mutationFn: (payload: { orderId: number; itemId: number; quantity: number }) =>
      updateOrderItemQuantity(payload),
    onSuccess: (updatedOrder) => {
      toast.success('Đã cập nhật số lượng sản phẩm')
      // Invalidate admin orders
      queryClient.invalidateQueries({ queryKey: ['orders', 'all'] })
      // Invalidate the specific customer's orders to trigger real-time update
      queryClient.invalidateQueries({ queryKey: ['orders', updatedOrder.customerId] })
      // Also invalidate all order queries
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      setSelectedOrder(updatedOrder)
      setEditingItems(new Map())
    },
    onError: (err: unknown) => {
      const error = err as { message?: string }
      toast.error(error?.message ?? 'Không thể cập nhật số lượng')
    },
  })

  const paymentStatusMutation = useMutation({
    mutationFn: (payload: { id: number; status: string }) =>
      updatePaymentStatus(payload.id, payload.status),
    onSuccess: () => {
      toast.success('Đã cập nhật trạng thái thanh toán')
      queryClient.invalidateQueries({ queryKey: ['orders', 'all'] })
      queryClient.invalidateQueries({ queryKey: ['orders', selectedOrder?.customerId] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      // Refresh the selected order to get updated payment
      if (selectedOrder) {
        queryClient.invalidateQueries({ queryKey: ['orders', selectedOrder.id] })
        // Update local state after a short delay to allow query to refetch
        setTimeout(() => {
          queryClient.refetchQueries({ queryKey: ['orders', 'all'] }).then(() => {
            const updatedOrder = queryClient.getQueryData<Order[]>(['orders', 'all'])?.find(
              (o) => o.id === selectedOrder.id,
            )
            if (updatedOrder) {
              setSelectedOrder(updatedOrder)
              setPaymentStatus(updatedOrder.payment?.status || 'PENDING')
            }
          })
        }, 500)
      }
    },
    onError: (err: unknown) => {
      const error = err as { message?: string }
      toast.error(error?.message ?? 'Không thể cập nhật trạng thái thanh toán')
    },
  })

  const refundMutation = useMutation({
    mutationFn: (id: number) => refundPayment(id),
    onSuccess: () => {
      toast.success('Đã hoàn tiền thành công')
      queryClient.invalidateQueries({ queryKey: ['orders', 'all'] })
      queryClient.invalidateQueries({ queryKey: ['orders', selectedOrder?.customerId] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      setRefundTarget(null)
      // Refresh the selected order after a short delay
      if (selectedOrder) {
        setTimeout(() => {
          queryClient.refetchQueries({ queryKey: ['orders', 'all'] }).then(() => {
            const updatedOrder = queryClient.getQueryData<Order[]>(['orders', 'all'])?.find(
              (o) => o.id === selectedOrder.id,
            )
            if (updatedOrder) {
              setSelectedOrder(updatedOrder)
              setPaymentStatus(updatedOrder.payment?.status || 'PENDING')
              setStatus(updatedOrder.status)
            }
          })
        }, 500)
      }
    },
    onError: (err: unknown) => {
      const error = err as { message?: string }
      toast.error(error?.message ?? 'Không thể hoàn tiền')
      setRefundTarget(null)
    },
  })

  const openOrder = (order: Order) => {
    setSelectedOrder(order)
    setStatus(order.status)
    setPaymentStatus(order.payment?.status || 'PENDING')
    setEditingItems(new Map())
  }

  const submitStatus = () => {
    if (!selectedOrder) return
    statusMutation.mutate({ id: selectedOrder.id, status })
  }

  const submitPaymentStatus = () => {
    if (!selectedOrder?.payment) return
    paymentStatusMutation.mutate({ id: selectedOrder.payment.id, status: paymentStatus })
  }

  const handleQuantityChange = (item: OrderItem, delta: number) => {
    const currentQty = editingItems.get(item.id) ?? item.quantity
    const newQty = Math.max(1, currentQty + delta)
    setEditingItems(new Map(editingItems.set(item.id, newQty)))
  }

  const saveItemQuantity = (item: OrderItem) => {
    const newQty = editingItems.get(item.id)
    if (!selectedOrder || newQty === undefined || newQty === item.quantity) return
    itemQuantityMutation.mutate({
      orderId: selectedOrder.id,
      itemId: item.id,
      quantity: newQty,
    })
  }

  const getItemQuantity = (item: OrderItem) => editingItems.get(item.id) ?? item.quantity

  const isItemModified = (item: OrderItem) => {
    const editedQty = editingItems.get(item.id)
    return editedQty !== undefined && editedQty !== item.quantity
  }

  const filteredOrders = orders
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? '').getTime() -
        new Date(a.createdAt ?? '').getTime(),
    )
    .filter((order) => {
      // Search filter
      const keyword = searchTerm.trim().toLowerCase()
      if (keyword) {
        const matchesSearch =
          order.code.toLowerCase().includes(keyword) ||
          order.customerName.toLowerCase().includes(keyword)
        if (!matchesSearch) return false
      }

      // Order status filter
      if (filterOrderStatus && order.status !== filterOrderStatus) {
        return false
      }

      // Payment status filter
      if (filterPaymentStatus) {
        if (filterPaymentStatus === 'NO_PAYMENT') {
          // Filter for orders without payment
          if (order.payment) return false
        } else {
          // Filter for orders with specific payment status
          if (!order.payment || order.payment.status !== filterPaymentStatus) {
            return false
          }
        }
      }

      return true
    })

  return (
    <>
      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <h3 style={{ margin: 0 }}>Đơn hàng ({filteredOrders.length})</h3>
          <input
            type="text"
            placeholder="Tìm theo mã đơn hoặc tên khách hàng..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            style={{
              padding: '0.4rem 0.6rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              minWidth: 260,
            }}
          />
        </div>

        {/* Filter Section */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1rem',
            padding: '1rem',
            background: '#f8fafc',
            borderRadius: 'var(--radius)',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: 'var(--text)',
              }}
            >
              Lọc theo trạng thái đơn hàng
            </label>
            <Select
              value={filterOrderStatus}
              onChange={(event) => setFilterOrderStatus(event.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {statusLabels[option] || option}
                </option>
              ))}
            </Select>
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: 'var(--text)',
              }}
            >
              Lọc theo trạng thái thanh toán
            </label>
            <Select
              value={filterPaymentStatus}
              onChange={(event) => setFilterPaymentStatus(event.target.value)}
            >
              <option value="">Tất cả thanh toán</option>
              <option value="NO_PAYMENT">Chưa thanh toán</option>
              {paymentStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {paymentStatusLabels[option] || option}
                </option>
              ))}
              <option value="REFUNDED">{paymentStatusLabels['REFUNDED']}</option>
            </Select>
          </div>

          {(filterOrderStatus || filterPaymentStatus) && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFilterOrderStatus('')
                setFilterPaymentStatus('')
              }}
              style={{ height: 'fit-content' }}
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ minWidth: 1000, tableLayout: 'auto' }}>
            <thead>
              <tr>
                <th style={{ minWidth: 140, whiteSpace: 'nowrap' }}>Mã đơn</th>
                <th style={{ minWidth: 150, whiteSpace: 'nowrap' }}>Khách hàng</th>
                <th style={{ minWidth: 140, whiteSpace: 'nowrap' }}>Ngày tạo</th>
                <th style={{ minWidth: 120, whiteSpace: 'nowrap' }}>Trạng thái</th>
                <th style={{ minWidth: 100, whiteSpace: 'nowrap', textAlign: 'center' }}>SL SP</th>
                <th style={{ minWidth: 120, whiteSpace: 'nowrap', textAlign: 'right' }}>Tổng tiền</th>
                <th style={{ minWidth: 130, whiteSpace: 'nowrap' }}>Thanh toán</th>
                <th style={{ minWidth: 120, whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      {order.code}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{order.customerName}</td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.9rem' }}>{formatDate(order.createdAt)}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span
                        className={`pill ${
                          order.status === 'DELIVERED'
                            ? 'pill-success'
                            : order.status === 'CANCELLED'
                              ? 'pill-danger'
                              : 'pill-warning'
                        }`}
                        style={{ fontSize: '0.85rem', padding: '0.25rem 0.6rem' }}
                      >
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 600 }}>
                      {order.items.length}
                    </td>
                    <td style={{ fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {order.payment ? (
                        <span
                          className={`pill ${
                            order.payment.status === 'PAID'
                              ? 'pill-success'
                              : order.payment.status === 'PENDING'
                                ? 'pill-warning'
                                : 'pill-danger'
                          }`}
                          style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '0.25rem',
                            fontSize: '0.85rem',
                            padding: '0.25rem 0.6rem'
                          }}
                        >
                          {getPaymentStatusIcon(order.payment.status)}
                          {paymentStatusLabels[order.payment.status] || order.payment.status}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <Button 
                        variant="text" 
                        type="button" 
                        onClick={() => openOrder(order)}
                        style={{ fontSize: '0.9rem', padding: '0.25rem 0.5rem' }}
                      >
                        Chi tiết
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={
          selectedOrder
            ? `Đơn hàng ${selectedOrder.code} - ${statusLabels[selectedOrder.status] || selectedOrder.status}`
            : ''
        }
        width={720}
      >
        {selectedOrder ? (
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
                <strong>Khách hàng:</strong>
                <p style={{ margin: '0.25rem 0 0' }}>{selectedOrder.customerName}</p>
              </div>
              <div>
                <strong>Email:</strong>
                <p style={{ margin: '0.25rem 0 0' }}>{selectedOrder.customerEmail}</p>
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
              <h4 style={{ marginBottom: '0.75rem' }}>Chi tiết sản phẩm</h4>
              <table className="table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th style={{ textAlign: 'center' }}>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item) => {
                    const qty = getItemQuantity(item)
                    const modified = isItemModified(item)
                    return (
                      <tr key={item.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {item.productImage && (
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                style={{
                                  width: 40,
                                  height: 40,
                                  objectFit: 'cover',
                                  borderRadius: 'var(--radius)',
                                }}
                              />
                            )}
                            {item.productName}
                          </div>
                        </td>
                        <td>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem',
                            }}
                          >
                            <button
                              className="btn btn-outline"
                              style={{ padding: '0.25rem 0.5rem' }}
                              onClick={() => handleQuantityChange(item, -1)}
                              disabled={qty <= 1}
                              type="button"
                            >
                              <Minus size={14} />
                            </button>
                            <span
                              style={{
                                minWidth: 32,
                                textAlign: 'center',
                                fontWeight: modified ? 700 : 400,
                                color: modified ? 'var(--primary)' : 'inherit',
                              }}
                            >
                              {qty}
                            </span>
                            <button
                              className="btn btn-outline"
                              style={{ padding: '0.25rem 0.5rem' }}
                              onClick={() => handleQuantityChange(item, 1)}
                              type="button"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </td>
                        <td>{formatCurrency(item.unitPrice)}</td>
                        <td>{formatCurrency(item.unitPrice * qty)}</td>
                        <td>
                          {modified && (
                            <Button
                              type="button"
                              variant="text"
                              onClick={() => saveItemQuantity(item)}
                              disabled={itemQuantityMutation.isPending}
                              style={{ fontSize: '0.85rem' }}
                            >
                              Lưu
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {(() => {
              const shippingFee = selectedOrder.shippingFee ?? 0
              const subtotal = selectedOrder.totalAmount - shippingFee
              return (
                <div
                  style={{
                    padding: '1rem',
                    background: '#fef3c7',
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
                    <span style={{ fontSize: '1.25rem' }}>
                      {formatCurrency(selectedOrder.totalAmount)}
                    </span>
                  </div>
                </div>
              )
            })()}

            {/* Payment Information Section */}
            {selectedOrder.payment && (
              <div
                style={{
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid #bae6fd',
                }}
              >
                <h4 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CreditCard size={20} color="var(--primary)" />
                  Thông tin thanh toán
                </h4>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                      Số tiền:
                    </strong>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {formatCurrency(selectedOrder.payment.amount)}
                    </span>
                  </div>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                      Phương thức:
                    </strong>
                    <span>
                      {paymentMethodLabels[selectedOrder.payment.method] || selectedOrder.payment.method}
                    </span>
                  </div>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                      Trạng thái:
                    </strong>
                    <span
                      className={`pill ${
                        selectedOrder.payment.status === 'PAID'
                          ? 'pill-success'
                          : selectedOrder.payment.status === 'PENDING'
                            ? 'pill-warning'
                            : 'pill-danger'
                      }`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      {getPaymentStatusIcon(selectedOrder.payment.status)}
                      {paymentStatusLabels[selectedOrder.payment.status] || selectedOrder.payment.status}
                    </span>
                  </div>
                  {selectedOrder.payment.transactionId && (
                    <div>
                      <strong style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                        Mã giao dịch:
                      </strong>
                      <code style={{ fontSize: '0.85rem' }}>{selectedOrder.payment.transactionId}</code>
                    </div>
                  )}
                  {selectedOrder.payment.paidAt && (
                    <div>
                      <strong style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                        Ngày thanh toán:
                      </strong>
                      <span>{formatDate(selectedOrder.payment.paidAt)}</span>
                    </div>
                  )}
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                      Ngày tạo:
                    </strong>
                    <span>{formatDate(selectedOrder.payment.createdAt)}</span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-end',
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #bae6fd',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <Select
                      label="Trạng thái thanh toán"
                      value={paymentStatus}
                      onChange={(event) => setPaymentStatus(event.target.value)}
                    >
                      {paymentStatusOptions.map((option) => (
                        <option key={option} value={option}>
                          {paymentStatusLabels[option] || option}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <Button
                    type="button"
                    onClick={submitPaymentStatus}
                    disabled={
                      paymentStatusMutation.isPending ||
                      paymentStatus === selectedOrder.payment.status ||
                      selectedOrder.payment.status === 'REFUNDED'
                    }
                  >
                    {paymentStatusMutation.isPending ? 'Đang lưu...' : 'Cập nhật'}
                  </Button>
                  {selectedOrder.payment.status === 'PAID' && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setRefundTarget(selectedOrder.payment!)}
                      iconLeft={<RotateCcw size={16} />}
                      style={{ color: '#dc2626', borderColor: '#dc2626' }}
                    >
                      Hoàn tiền
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-end',
              }}
            >
              <div style={{ flex: 1 }}>
                <Select
                  label="Trạng thái đơn hàng"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {statusLabels[option] || option}
                    </option>
                  ))}
                </Select>
              </div>
              <Button
                type="button"
                onClick={submitStatus}
                disabled={statusMutation.isPending || status === selectedOrder.status}
              >
                {statusMutation.isPending ? 'Đang lưu...' : 'Cập nhật trạng thái'}
              </Button>
            </div>

            {selectedOrder.status === 'DELIVERED' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  background: '#fee2e2',
                  borderRadius: 'var(--radius)',
                  color: '#b91c1c',
                  fontSize: '0.9rem',
                }}
              >
                <AlertTriangle size={16} />
                Đơn hàng đã giao không thể chỉnh sửa số lượng sản phẩm.
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* Refund Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(refundTarget)}
        title="Xác nhận hoàn tiền"
        message={`Bạn có chắc muốn hoàn tiền cho thanh toán này? Đơn hàng sẽ được tự động hủy sau khi hoàn tiền.`}
        confirmLabel="Xác nhận hoàn tiền"
        isLoading={refundMutation.isPending}
        onConfirm={() => refundTarget && refundMutation.mutate(refundTarget.id)}
        onCancel={() => setRefundTarget(null)}
      />
    </>
  )
}
