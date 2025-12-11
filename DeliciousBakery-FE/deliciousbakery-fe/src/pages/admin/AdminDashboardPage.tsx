import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Calendar, TrendingUp, CreditCard, ShoppingBag, Users, Package, AlertTriangle, Percent } from 'lucide-react'
import { fetchProducts } from '../../api/products'
import { fetchOrders } from '../../api/orders'
import { fetchUsers } from '../../api/users'
import { formatCurrency, formatDate } from '../../utils/format'
import type { Order, Product, User } from '../../types'

export const AdminDashboardPage = () => {
  // Auto-refresh interval for live dashboard (ms)
  const REFRESH_MS = 30000

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null) // null means all months
  const [range, setRange] = useState<'7d' | '30d' | 'ytd' | 'all'>('30d')

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => fetchProducts(),
    refetchInterval: REFRESH_MS,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: REFRESH_MS / 2,
  })
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['orders', 'all'],
    queryFn: fetchOrders,
    refetchInterval: REFRESH_MS,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: REFRESH_MS / 2,
  })
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
    refetchInterval: REFRESH_MS,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: REFRESH_MS / 2,
  })

  const filteredOrdersByRange = useMemo(() => {
    if (!orders.length) return []
    const now = new Date()
    const start = new Date()
    switch (range) {
      case '7d':
        start.setDate(now.getDate() - 6)
        break
      case '30d':
        start.setDate(now.getDate() - 29)
        break
      case 'ytd':
        start.setMonth(0, 1)
        start.setHours(0, 0, 0, 0)
        break
      case 'all':
      default:
        return orders
    }
    return orders.filter((order) => {
      if (!order.createdAt) return false
      const d = new Date(order.createdAt)
      return d >= start && d <= now
    })
  }, [orders, range])

  const stats = useMemo(() => {
    const totalRevenue = filteredOrdersByRange.reduce((acc, curr) => acc + curr.totalAmount, 0)
    const orderCount = filteredOrdersByRange.length
    const totalCustomers = users.filter((user) => user.role === 'CUSTOMER').length
    const newCustomers = users.filter((u) => {
      if (!u.createdAt) return false
      const created = new Date(u.createdAt)
      if (range === 'all') return true
      if (range === '7d') {
        const s = new Date()
        s.setDate(s.getDate() - 6)
        return created >= s
      }
      if (range === '30d') {
        const s = new Date()
        s.setDate(s.getDate() - 29)
        return created >= s
      }
      if (range === 'ytd') {
        const s = new Date()
        s.setMonth(0, 1)
        s.setHours(0, 0, 0, 0)
        return created >= s
      }
      return true
    }).length
    const aov = orderCount ? totalRevenue / orderCount : 0

    const payments = filteredOrdersByRange.map((o) => o.payment).filter(Boolean)
    const paidCount = payments.filter((p) => p?.status === 'PAID').length
    const paymentSuccessRate = payments.length ? Math.round((paidCount / payments.length) * 100) : 0

    const lowStockProducts = products.filter((p) => p.stock <= 5).length

    const topProducts = new Map<number, { name: string; total: number }>()
    filteredOrdersByRange.forEach((order) => {
      order.items.forEach((item) => {
        const current = topProducts.get(item.productId)
        if (current) {
          current.total += item.quantity
        } else {
          topProducts.set(item.productId, { name: item.productName, total: item.quantity })
        }
      })
    })

    const topList = Array.from(topProducts.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    const productMap = new Map<number, Product>()
    products.forEach((p) => productMap.set(p.id, p))

    const categoryTotals = new Map<string, number>()
    filteredOrdersByRange.forEach((order) => {
      order.items.forEach((item) => {
        const prod = productMap.get(item.productId)
        const catName = prod?.categoryName || 'Khác'
        categoryTotals.set(catName, (categoryTotals.get(catName) || 0) + item.totalPrice)
      })
    })
    const topCategories = Array.from(categoryTotals.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    const paymentMethodStats = payments.reduce<Record<string, { count: number; total: number }>>((acc, p) => {
      if (!p) return acc
      const key = p.method || 'Khác'
      if (!acc[key]) acc[key] = { count: 0, total: 0 }
      acc[key].count += 1
      acc[key].total += p.amount || 0
      return acc
    }, {})

    const latestOrders = [...orders]
      .filter((o) => o.createdAt)
      .sort((a, b) => (new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()))
      .slice(0, 6)

    const lowStockList = products
      .filter((p) => p.stock <= 5)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 6)

    return {
      totalRevenue,
      totalCustomers,
      orderCount,
      newCustomers,
      productCount: products.length,
      aov,
      paymentSuccessRate,
      lowStockProducts,
      topList,
      topCategories,
      paymentMethodStats,
      latestOrders,
      lowStockList,
    }
  }, [filteredOrdersByRange, products, users, range, orders])

  // Generate chart data based on selected period
  const chartData = useMemo(() => {
    if (!orders.length) return []

    // Filter orders by selected year
    const filteredOrders = orders.filter((order) => {
      if (!order.createdAt) return false
      const orderDate = new Date(order.createdAt)
      const orderYear = orderDate.getFullYear()
      if (orderYear !== selectedYear) return false

      if (selectedMonth !== null) {
        const orderMonth = orderDate.getMonth() + 1 // getMonth() returns 0-11
        return orderMonth === selectedMonth
      }
      return true
    })

    if (selectedMonth !== null) {
      // Show daily data for selected month
      const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate()
      const dailyData: Record<number, number> = {}

      // Initialize all days with 0
      for (let day = 1; day <= daysInMonth; day++) {
        dailyData[day] = 0
      }

      // Sum revenue by day
      filteredOrders.forEach((order) => {
        if (order.createdAt) {
          const orderDate = new Date(order.createdAt)
          const day = orderDate.getDate()
          dailyData[day] = (dailyData[day] || 0) + order.totalAmount
        }
      })

      return Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => ({
        name: `Ngày ${day}`,
        value: dailyData[day] || 0,
      }))
    } else {
      // Show monthly data for selected year
      const monthlyData: Record<number, number> = {}

      // Initialize all months with 0
      for (let month = 1; month <= 12; month++) {
        monthlyData[month] = 0
      }

      // Sum revenue by month
      filteredOrders.forEach((order) => {
        if (order.createdAt) {
          const orderDate = new Date(order.createdAt)
          const month = orderDate.getMonth() + 1 // getMonth() returns 0-11
          monthlyData[month] = (monthlyData[month] || 0) + order.totalAmount
        }
      })

      const monthNames = [
        'Tháng 1',
        'Tháng 2',
        'Tháng 3',
        'Tháng 4',
        'Tháng 5',
        'Tháng 6',
        'Tháng 7',
        'Tháng 8',
        'Tháng 9',
        'Tháng 10',
        'Tháng 11',
        'Tháng 12',
      ]

      return monthNames.map((name, index) => ({
        name,
        value: monthlyData[index + 1] || 0,
      }))
    }
  }, [orders, selectedYear, selectedMonth])

  // Get available years from orders
  const availableYears = useMemo(() => {
    const years = new Set<number>()
    orders.forEach((order) => {
      if (order.createdAt) {
        const year = new Date(order.createdAt).getFullYear()
        years.add(year)
      }
    })
    return Array.from(years).sort((a, b) => b - a)
  }, [orders])

  // Get total revenue for selected period
  const periodRevenue = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0)
  }, [chartData])

  return (
    <div className="grid" style={{ gap: '1.5rem' }}>
      {/* Filters */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Tổng quan quản trị</h2>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--muted)' }}>
            Theo dõi hiệu suất cửa hàng theo thời gian.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { key: '7d', label: '7 ngày' },
            { key: '30d', label: '30 ngày' },
            { key: 'ytd', label: 'YTD' },
            { key: 'all', label: 'Tất cả' },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setRange(item.key as typeof range)}
              className={`btn ${range === item.key ? 'btn-primary' : 'btn-outline'}`}
              style={{ minWidth: 80 }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '1rem' }}>
        <StatCard icon={<TrendingUp size={18} />} title="Doanh thu" value={formatCurrency(stats.totalRevenue)} />
        <StatCard icon={<ShoppingBag size={18} />} title="Đơn hàng" value={stats.orderCount.toString()} />
        <StatCard icon={<CreditCard size={18} />} title="Tỉ lệ thanh toán" value={`${stats.paymentSuccessRate}%`} />
        <StatCard icon={<Percent size={18} />} title="AOV" value={formatCurrency(stats.aov)} />
        <StatCard icon={<Users size={18} />} title="KH mới" value={stats.newCustomers.toString()} />
        <StatCard
          icon={<Package size={18} />}
          title="Sản phẩm"
          value={stats.productCount.toString()}
          subtitle={`Tồn kho thấp: ${stats.lowStockProducts}`}
          iconRight={<AlertTriangle size={16} color="#f59e0b" />}
        />
      </div>

      {/* Revenue Chart */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: 'var(--radius)',
                background: 'linear-gradient(135deg, #f97316, #fb923c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Biểu đồ doanh thu</h3>
              <p style={{ margin: '0.25rem 0 0 0', color: 'var(--muted)', fontSize: '0.9rem' }}>
                {selectedMonth !== null
                  ? `Tháng ${selectedMonth}/${selectedYear} - Tổng: ${formatCurrency(periodRevenue)}`
                  : `Năm ${selectedYear} - Tổng: ${formatCurrency(periodRevenue)}`}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Year Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="var(--muted)" />
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(Number(e.target.value))
                  setSelectedMonth(null) // Reset month when year changes
                }}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  background: '#fff',
                }}
              >
                {availableYears.length > 0 ? (
                  availableYears.map((year) => (
                    <option key={year} value={year}>
                      Năm {year}
                    </option>
                  ))
                ) : (
                  <option value={new Date().getFullYear()}>Năm {new Date().getFullYear()}</option>
                )}
              </select>
            </div>

            {/* Month Selector */}
            <select
              value={selectedMonth === null ? 'all' : selectedMonth}
              onChange={(e) => {
                const value = e.target.value
                setSelectedMonth(value === 'all' ? null : Number(value))
              }}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                fontSize: '0.95rem',
                cursor: 'pointer',
                background: '#fff',
              }}
            >
              <option value="all">Tất cả các tháng</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  Tháng {month}
                </option>
              ))}
            </select>
          </div>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                style={{ fontSize: '0.85rem' }}
                angle={selectedMonth !== null ? 0 : -45}
                textAnchor={selectedMonth !== null ? 'middle' : 'end'}
                height={selectedMonth !== null ? 30 : 60}
              />
              <YAxis
                stroke="#64748b"
                style={{ fontSize: '0.85rem' }}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
                  return value.toString()
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.9rem',
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend
                wrapperStyle={{ fontSize: '0.9rem', paddingTop: '1rem' }}
                formatter={() => 'Doanh thu'}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#f97316"
                strokeWidth={3}
                dot={{ fill: '#f97316', r: 4 }}
                activeDot={{ r: 6 }}
                name="Doanh thu"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div
            style={{
              height: '350px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--muted)',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <Calendar size={48} color="var(--muted)" style={{ opacity: 0.5 }} />
            <p style={{ margin: 0 }}>Không có dữ liệu doanh thu cho khoảng thời gian đã chọn</p>
          </div>
        )}
      </div>

      {/* Two-column layout: Revenue chart + Payment distribution */}
      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
        {/* Revenue Chart */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: 'var(--radius)',
                  background: 'linear-gradient(135deg, #f97316, #fb923c)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Biểu đồ doanh thu</h3>
                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--muted)', fontSize: '0.9rem' }}>
                  {selectedMonth !== null
                    ? `Tháng ${selectedMonth}/${selectedYear} - Tổng: ${formatCurrency(periodRevenue)}`
                    : `Năm ${selectedYear} - Tổng: ${formatCurrency(periodRevenue)}`}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Year Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} color="var(--muted)" />
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(Number(e.target.value))
                    setSelectedMonth(null) // Reset month when year changes
                  }}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    background: '#fff',
                  }}
                >
                  {availableYears.length > 0 ? (
                    availableYears.map((year) => (
                      <option key={year} value={year}>
                        Năm {year}
                      </option>
                    ))
                  ) : (
                    <option value={new Date().getFullYear()}>Năm {new Date().getFullYear()}</option>
                  )}
                </select>
              </div>

              {/* Month Selector */}
              <select
                value={selectedMonth === null ? 'all' : selectedMonth}
                onChange={(e) => {
                  const value = e.target.value
                  setSelectedMonth(value === 'all' ? null : Number(value))
                }}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  background: '#fff',
                }}
              >
                <option value="all">Tất cả các tháng</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    Tháng {month}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  style={{ fontSize: '0.85rem' }}
                  angle={selectedMonth !== null ? 0 : -45}
                  textAnchor={selectedMonth !== null ? 'middle' : 'end'}
                  height={selectedMonth !== null ? 30 : 60}
                />
                <YAxis
                  stroke="#64748b"
                  style={{ fontSize: '0.85rem' }}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
                    return value.toString()
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.9rem',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend wrapperStyle={{ fontSize: '0.9rem', paddingTop: '1rem' }} formatter={() => 'Doanh thu'} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#f97316"
                  strokeWidth={3}
                  dot={{ fill: '#f97316', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Doanh thu"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                height: '350px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--muted)',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <Calendar size={48} color="var(--muted)" style={{ opacity: 0.5 }} />
              <p style={{ margin: 0 }}>Không có dữ liệu doanh thu cho khoảng thời gian đã chọn</p>
            </div>
          )}
        </div>

        {/* Payment method distribution (chart) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={20} />
            <h3 style={{ margin: 0 }}>Phương thức thanh toán</h3>
          </div>
          {Object.keys(stats.paymentMethodStats).length ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={Object.entries(stats.paymentMethodStats).map(([method, info]) => ({
                  method,
                  total: info.total,
                  count: info.count,
                }))}
                margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="method" stroke="#64748b" style={{ fontSize: '0.9rem' }} />
                <YAxis
                  stroke="#64748b"
                  style={{ fontSize: '0.9rem' }}
                  tickFormatter={(v) => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${Math.round(v / 1000)}K`)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.9rem',
                  }}
                  formatter={(value: number, name: string) =>
                    name === 'total' ? formatCurrency(value) : `${value} giao dịch`
                  }
                  labelFormatter={(label) => `Phương thức: ${label}`}
                />
                <Legend wrapperStyle={{ fontSize: '0.9rem' }} />
                <Bar dataKey="total" name="Doanh thu" fill="#f97316" radius={[6, 6, 0, 0]} />
                <Bar dataKey="count" name="Số giao dịch" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: 'var(--muted)', margin: 0 }}>Chưa có dữ liệu thanh toán</p>
          )}
        </div>
      </div>

      {/* Latest orders & Low stock */}
      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
        <div className="card">
          <h3>Đơn hàng mới</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Khách</th>
                <th>Tổng</th>
                <th>TT Thanh toán</th>
                <th>Ngày</th>
              </tr>
            </thead>
            <tbody>
              {stats.latestOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.code}</td>
                  <td>{order.customerName}</td>
                  <td>{formatCurrency(order.totalAmount)}</td>
                  <td>
                    <span
                      className={`pill ${
                        order.payment?.status === 'PAID'
                          ? 'pill-success'
                          : order.payment?.status === 'PENDING'
                            ? 'pill-warning'
                            : 'pill-danger'
                      }`}
                    >
                      {order.payment?.status || 'N/A'}
                    </span>
                  </td>
                  <td>{order.createdAt ? formatDate(order.createdAt) : '--'}</td>
                </tr>
              ))}
              {!stats.latestOrders.length && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                    Chưa có đơn hàng
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>Sản phẩm sắp hết hàng</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.lowStockList.length ? (
              stats.lowStockList.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{p.categoryName}</div>
                  </div>
                  <span className="pill pill-danger">{p.stock}</span>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--muted)', margin: 0 }}>Không có sản phẩm sắp hết</p>
            )}
          </div>
        </div>
      </div>

      {/* Top lists */}
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="card">
          <h3>Sản phẩm bán chạy</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Số lượng</th>
              </tr>
            </thead>
            <tbody>
              {stats.topList.map((item) => (
                <tr key={item.name}>
                  <td>{item.name}</td>
                  <td>{item.total}</td>
                </tr>
              ))}
              {!stats.topList.length && (
                <tr>
                  <td colSpan={2} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                    Chưa có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h3>Top danh mục</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Danh mục</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {stats.topCategories.map((cat) => (
                <tr key={cat.name}>
                  <td>{cat.name}</td>
                  <td>{formatCurrency(cat.total)}</td>
                </tr>
              ))}
              {!stats.topCategories.length && (
                <tr>
                  <td colSpan={2} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                    Chưa có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const StatCard = ({
  icon,
  title,
  value,
  subtitle,
  iconRight,
}: {
  icon: React.ReactNode
  title: string
  value: string
  subtitle?: string
  iconRight?: React.ReactNode
}) => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: '#f97316' + '20',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f97316',
        }}
      >
        {icon}
      </div>
      <span style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>{title}</span>
      {iconRight}
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
      <strong style={{ fontSize: '1.6rem' }}>{value}</strong>
    </div>
    {subtitle && <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{subtitle}</div>}
  </div>
)
