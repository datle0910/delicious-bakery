import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'
import {
    TrendingUp,
    Package,
    Users,
    FileSpreadsheet,
    FileText,
    BarChart3,
    PieChart as PieChartIcon,
    Calendar,
    RefreshCw,
    AlertCircle,
} from 'lucide-react'
import {
    fetchProductStatistics,
    fetchRevenueStatistics,
    fetchCustomerStatistics,
    type ProductStatistics,
    type RevenueStatistics,
    type CustomerStatistics,
} from '../../api/statistics'
import { formatCurrency } from '../../utils/format'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import {
    exportProductsToExcel,
    exportProductsToPDF,
    exportRevenueToExcel,
    exportRevenueToPDF,
    exportCustomersToExcel,
    exportCustomersToPDF,
    exportAllStatisticsToExcel,
    exportAllStatisticsToPDF,
    type ExportSection,
} from '../../api/statistics'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

// Data item dùng riêng cho Pie Chart topProducts
type TopProductsPieDataItem = {
    productName: string
    purchaseCount: number
    // index signature để phù hợp kiểu ChartDataInput của Recharts
    [key: string]: string | number
}

export const AdminStatisticsPage = () => {
    const [activeTab, setActiveTab] = useState<'products' | 'revenue' | 'customers'>('products')
    const [revenuePeriod, setRevenuePeriod] = useState<'day' | 'week' | 'month' | 'year'>('month')
    const [exportSection, setExportSection] = useState<ExportSection>('all')

    // =========================
    // PRODUCT STATISTICS QUERY
    // =========================
    const {
        data: rawProductStats,
        isLoading: loadingProducts,
        error: errorProducts,
        refetch: refetchProducts,
    } = useQuery({
        queryKey: ['statistics', 'products'],
        queryFn: fetchProductStatistics,
        refetchInterval: 60000, // Refresh every minute
    })

    useEffect(() => {
        if (!errorProducts) return
        const err = errorProducts as Error
        toast.error(err.message || 'Không thể tải thống kê sản phẩm')
    }, [errorProducts])

    const productStats = rawProductStats as ProductStatistics | undefined

    // =========================
    // REVENUE STATISTICS QUERY
    // =========================
    const {
        data: rawRevenueStats,
        isLoading: loadingRevenue,
        error: errorRevenue,
        refetch: refetchRevenue,
    } = useQuery({
        queryKey: ['statistics', 'revenue'],
        queryFn: fetchRevenueStatistics,
        refetchInterval: 60000,
    })

    useEffect(() => {
        if (!errorRevenue) return
        const err = errorRevenue as Error
        toast.error(err.message || 'Không thể tải thống kê doanh thu')
    }, [errorRevenue])

    const revenueStats = rawRevenueStats as RevenueStatistics | undefined

    // ==========================
    // CUSTOMER STATISTICS QUERY
    // ==========================
    const {
        data: rawCustomerStats,
        isLoading: loadingCustomers,
        error: errorCustomers,
        refetch: refetchCustomers,
    } = useQuery({
        queryKey: ['statistics', 'customers'],
        queryFn: fetchCustomerStatistics,
        refetchInterval: 60000,
    })

    useEffect(() => {
        if (!errorCustomers) return
        const err = errorCustomers as Error
        toast.error(err.message || 'Không thể tải thống kê khách hàng')
    }, [errorCustomers])

    const customerStats = rawCustomerStats as CustomerStatistics | undefined

    const handleRefresh = () => {
        refetchProducts()
        refetchRevenue()
        refetchCustomers()
        toast.success('Đã làm mới dữ liệu')
    }

    const handleExportExcel = async () => {
        try {
            switch (exportSection) {
                case 'products':
                    await exportProductsToExcel()
                    toast.success('Đã xuất file Excel sản phẩm thành công')
                    break
                case 'revenue':
                    await exportRevenueToExcel()
                    toast.success('Đã xuất file Excel doanh thu thành công')
                    break
                case 'customers':
                    await exportCustomersToExcel()
                    toast.success('Đã xuất file Excel khách hàng thành công')
                    break
                case 'all':
                default:
                    await exportAllStatisticsToExcel()
                    toast.success('Đã xuất file Excel tổng hợp thành công')
                    break
            }
        } catch (error) {
            console.error('Error exporting to Excel:', error)
            toast.error('Có lỗi xảy ra khi xuất file Excel')
        }
    }

    const handleExportPDF = async () => {
        try {
            switch (exportSection) {
                case 'products':
                    await exportProductsToPDF()
                    toast.success('Đã xuất file PDF sản phẩm thành công')
                    break
                case 'revenue':
                    await exportRevenueToPDF()
                    toast.success('Đã xuất file PDF doanh thu thành công')
                    break
                case 'customers':
                    await exportCustomersToPDF()
                    toast.success('Đã xuất file PDF khách hàng thành công')
                    break
                case 'all':
                default:
                    await exportAllStatisticsToPDF()
                    toast.success('Đã xuất file PDF tổng hợp thành công')
                    break
            }
        } catch (error) {
            console.error('Error exporting to PDF:', error)
            toast.error('Có lỗi xảy ra khi xuất file PDF')
        }
    }

    const getRevenueData = () => {
        if (!revenueStats) return []
        switch (revenuePeriod) {
            case 'day':
                return (revenueStats.revenueByDay || []).slice(-30)
            case 'week':
                return (revenueStats.revenueByWeek || []).slice(-12)
            case 'month':
                return (revenueStats.revenueByMonth || []).slice(-12)
            case 'year':
                return revenueStats.revenueByYear || []
            default:
                return (revenueStats.revenueByMonth || []).slice(-12)
        }
    }

    // Data đã chuyển sang type riêng cho Pie, tránh TS2322
    const topProductsPieData: TopProductsPieDataItem[] =
        (productStats?.topProductsByPurchaseCount ?? []).map((p) => ({
            productName: p.productName,
            purchaseCount: p.purchaseCount,
        }))

    return (
        <>
            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
            <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ marginBottom: '2rem' }}>
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
                        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>Thống kê & Báo cáo</h1>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <Button
                                variant="outline"
                                iconLeft={<RefreshCw size={16} />}
                                onClick={handleRefresh}
                                disabled={loadingProducts || loadingRevenue || loadingCustomers}
                            >
                                Làm mới
                            </Button>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <Select
                                    value={exportSection}
                                    onChange={(e) => setExportSection(e.target.value as ExportSection)}
                                    style={{ minWidth: '150px' }}
                                >
                                    <option value="all">Tất cả</option>
                                    <option value="products">Sản phẩm</option>
                                    <option value="revenue">Doanh thu</option>
                                    <option value="customers">Khách hàng</option>
                                </Select>
                                <Button
                                    variant="outline"
                                    iconLeft={<FileSpreadsheet size={16} />}
                                    onClick={handleExportExcel}
                                    disabled={loadingProducts || loadingRevenue || loadingCustomers}
                                >
                                    Xuất Excel
                                </Button>
                                <Button
                                    variant="outline"
                                    iconLeft={<FileText size={16} />}
                                    onClick={handleExportPDF}
                                    disabled={loadingProducts || loadingRevenue || loadingCustomers}
                                >
                                    Xuất PDF
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--border)' }}>
                        {[
                            { key: 'products', label: 'Sản phẩm', icon: Package },
                            { key: 'revenue', label: 'Doanh thu', icon: TrendingUp },
                            { key: 'customers', label: 'Khách hàng', icon: Users },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    border: 'none',
                                    background: 'transparent',
                                    borderBottom:
                                        activeTab === tab.key ? '3px solid var(--primary)' : '3px solid transparent',
                                    color: activeTab === tab.key ? 'var(--primary)' : 'var(--muted)',
                                    fontWeight: activeTab === tab.key ? 600 : 400,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Statistics */}
                {activeTab === 'products' && (
                    <div>
                        {loadingProducts ? (
                            <div style={{ textAlign: 'center', padding: '3rem' }}>
                                <RefreshCw
                                    size={24}
                                    style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}
                                />
                                <div>Đang tải dữ liệu...</div>
                            </div>
                        ) : errorProducts ? (
                            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                                <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
                                <h3 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Lỗi tải dữ liệu</h3>
                                <p style={{ color: 'var(--muted)' }}>Không thể tải thống kê sản phẩm. Vui lòng thử lại.</p>
                                <Button
                                    variant="outline"
                                    onClick={() => refetchProducts()}
                                    style={{ marginTop: '1rem' }}
                                >
                                    Thử lại
                                </Button>
                            </div>
                        ) : !productStats || productStats.totalProducts === 0 ? (
                            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                                <Package size={48} color="var(--muted)" style={{ margin: '0 auto 1rem' }} />
                                <h3 style={{ marginBottom: '0.5rem' }}>Chưa có dữ liệu</h3>
                                <p style={{ color: 'var(--muted)' }}>Chưa có sản phẩm nào trong hệ thống.</p>
                            </div>
                        ) : (
                            <>
                                {/* Summary Cards */}
                                <div
                                    className="grid"
                                    style={{
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                        gap: '1rem',
                                        marginBottom: '2rem',
                                    }}
                                >
                                    <div className="card">
                                        <div
                                            style={{
                                                fontSize: '0.875rem',
                                                color: 'var(--muted)',
                                                marginBottom: '0.5rem',
                                            }}
                                        >
                                            Tổng sản phẩm
                                        </div>
                                        <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                                            {productStats?.totalProducts ?? 0}
                                        </div>
                                    </div>
                                    <div className="card">
                                        <div
                                            style={{
                                                fontSize: '0.875rem',
                                                color: 'var(--muted)',
                                                marginBottom: '0.5rem',
                                            }}
                                        >
                                            Tồn kho thấp
                                        </div>
                                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>
                                            {productStats?.lowStockProducts ?? 0}
                                        </div>
                                    </div>
                                    <div className="card">
                                        <div
                                            style={{
                                                fontSize: '0.875rem',
                                                color: 'var(--muted)',
                                                marginBottom: '0.5rem',
                                            }}
                                        >
                                            Hết hàng
                                        </div>
                                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ef4444' }}>
                                            {productStats?.outOfStockProducts ?? 0}
                                        </div>
                                    </div>
                                </div>

                                {/* Best Selling Products Chart */}
                                {productStats?.bestSellingProducts &&
                                productStats.bestSellingProducts.length > 0 ? (
                                    <div className="card" style={{ marginBottom: '2rem' }}>
                                        <h2
                                            style={{
                                                marginBottom: '1.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                            }}
                                        >
                                            <BarChart3 size={20} />
                                            Top 10 sản phẩm bán chạy nhất (theo số lượng)
                                        </h2>
                                        <ResponsiveContainer width="100%" height={400}>
                                            <BarChart data={productStats.bestSellingProducts}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="productName"
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={100}
                                                    interval={0}
                                                    tick={{ fontSize: 12 }}
                                                />
                                                <YAxis />
                                                <Tooltip
                                                    formatter={(value: number) => [
                                                        value.toLocaleString('vi-VN'),
                                                        'Số lượng đã bán',
                                                    ]}
                                                    contentStyle={{
                                                        borderRadius: '8px',
                                                        border: '1px solid var(--border)',
                                                    }}
                                                />
                                                <Legend />
                                                <Bar
                                                    dataKey="totalQuantitySold"
                                                    fill="#3b82f6"
                                                    name="Số lượng đã bán"
                                                    radius={[8, 8, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div
                                        className="card"
                                        style={{ marginBottom: '2rem', textAlign: 'center', padding: '2rem' }}
                                    >
                                        <Package size={32} color="var(--muted)" style={{ margin: '0 auto 1rem' }} />
                                        <p style={{ color: 'var(--muted)' }}>Chưa có sản phẩm nào được bán.</p>
                                    </div>
                                )}

                                {/* Top Products by Purchase Count */}
                                {productStats?.topProductsByPurchaseCount &&
                                productStats.topProductsByPurchaseCount.length > 0 ? (
                                    <div className="card" style={{ marginBottom: '2rem' }}>
                                        <h2
                                            style={{
                                                marginBottom: '1.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                            }}
                                        >
                                            <PieChartIcon size={20} />
                                            Top 10 sản phẩm có số lần mua nhiều nhất
                                        </h2>
                                        <ResponsiveContainer width="100%" height={400}>
                                            <PieChart>
                                                <Pie
                                                    data={topProductsPieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={(props) => {
                                                        const entry = (props.payload as TopProductsPieDataItem) || {};
                                                        const percent = props.percent || 0;
                                                        const name = entry.productName || '';
                                                        const purchaseCount = entry.purchaseCount || 0;
                                                        const shortName = name.substring(0, 15) + (name.length > 15 ? '...' : '');
                                                        return `${shortName}: ${purchaseCount} (${(percent * 100).toFixed(1)}%)`;
                                                    }}
                                                    outerRadius={120}
                                                    fill="#8884d8"
                                                    dataKey="purchaseCount"
                                                >
                                                    {topProductsPieData.map((_, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={COLORS[index % COLORS.length]}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value: number) => [value, 'Số lần mua']}
                                                    contentStyle={{
                                                        borderRadius: '8px',
                                                        border: '1px solid var(--border)',
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : null}

                                {/* Best Selling Products Table */}
                                <div className="card" style={{ marginBottom: '2rem' }}>
                                    <h2 style={{ marginBottom: '1.5rem' }}>Chi tiết sản phẩm bán chạy</h2>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                            <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Sản phẩm</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'right' }}>
                                                    Số lượng đã bán
                                                </th>
                                                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Doanh thu</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'right' }}>
                                                    Số lần mua
                                                </th>
                                                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Tồn kho</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {(productStats?.bestSellingProducts ?? []).map((product) => (
                                                <tr
                                                    key={product.productId}
                                                    style={{ borderBottom: '1px solid var(--border)' }}
                                                >
                                                    <td style={{ padding: '0.75rem' }}>
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.5rem',
                                                            }}
                                                        >
                                                            {product.productImage && (
                                                                <img
                                                                    src={product.productImage}
                                                                    alt={product.productName}
                                                                    style={{
                                                                        width: 40,
                                                                        height: 40,
                                                                        objectFit: 'cover',
                                                                        borderRadius: '4px',
                                                                    }}
                                                                />
                                                            )}
                                                            <span style={{ fontWeight: 500 }}>
                                  {product.productName}
                                </span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                                        {product.totalQuantitySold}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: '0.75rem',
                                                            textAlign: 'right',
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {formatCurrency(product.totalRevenue)}
                                                    </td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                                        {product.purchaseCount}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: '0.75rem',
                                                            textAlign: 'right',
                                                            color:
                                                                product.currentStock < 10 ? '#ef4444' : 'inherit',
                                                            fontWeight:
                                                                product.currentStock < 10 ? 600 : 400,
                                                        }}
                                                    >
                                                        {product.currentStock}
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Slow Selling Products */}
                                <div className="card">
                                    <h2 style={{ marginBottom: '1.5rem' }}>Sản phẩm bán chậm</h2>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                            <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Sản phẩm</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'right' }}>
                                                    Số lượng đã bán
                                                </th>
                                                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Doanh thu</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Tồn kho</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {(productStats?.slowSellingProducts ?? []).map((product) => (
                                                <tr
                                                    key={product.productId}
                                                    style={{ borderBottom: '1px solid var(--border)' }}
                                                >
                                                    <td style={{ padding: '0.75rem' }}>
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.5rem',
                                                            }}
                                                        >
                                                            {product.productImage && (
                                                                <img
                                                                    src={product.productImage}
                                                                    alt={product.productName}
                                                                    style={{
                                                                        width: 40,
                                                                        height: 40,
                                                                        objectFit: 'cover',
                                                                        borderRadius: '4px',
                                                                    }}
                                                                />
                                                            )}
                                                            <span>{product.productName}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                                        {product.totalQuantitySold}
                                                    </td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                                        {formatCurrency(product.totalRevenue)}
                                                    </td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                                        {product.currentStock}
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Revenue Statistics */}
                {activeTab === 'revenue' && (
                    <div>
                        {loadingRevenue ? (
                            <div style={{ textAlign: 'center', padding: '3rem' }}>
                                <RefreshCw
                                    size={24}
                                    style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}
                                />
                                <div>Đang tải dữ liệu...</div>
                            </div>
                        ) : errorRevenue ? (
                            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                                <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
                                <h3 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Lỗi tải dữ liệu</h3>
                                <p style={{ color: 'var(--muted)' }}>
                                    Không thể tải thống kê doanh thu. Vui lòng thử lại.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => refetchRevenue()}
                                    style={{ marginTop: '1rem' }}
                                >
                                    Thử lại
                                </Button>
                            </div>
                        ) : !revenueStats || revenueStats.totalOrders === 0 ? (
                            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                                <TrendingUp size={48} color="var(--muted)" style={{ margin: '0 auto 1rem' }} />
                                <h3 style={{ marginBottom: '0.5rem' }}>Chưa có dữ liệu</h3>
                                <p style={{ color: 'var(--muted)' }}>Chưa có đơn hàng nào trong hệ thống.</p>
                            </div>
                        ) : (
                            <>
                                {/* Summary Cards */}
                                <div
                                    className="grid"
                                    style={{
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                        gap: '1rem',
                                        marginBottom: '2rem',
                                    }}
                                >
                                    <div className="card">
                                        <div
                                            style={{
                                                fontSize: '0.875rem',
                                                color: 'var(--muted)',
                                                marginBottom: '0.5rem',
                                            }}
                                        >
                                            Tổng doanh thu
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '2rem',
                                                fontWeight: 700,
                                                color: '#10b981',
                                            }}
                                        >
                                            {formatCurrency(revenueStats?.totalRevenue ?? 0)}
                                        </div>
                                    </div>
                                    <div className="card">
                                        <div
                                            style={{
                                                fontSize: '0.875rem',
                                                color: 'var(--muted)',
                                                marginBottom: '0.5rem',
                                            }}
                                        >
                                            Tổng đơn hàng
                                        </div>
                                        <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                                            {revenueStats?.totalOrders ?? 0}
                                        </div>
                                    </div>
                                    <div className="card">
                                        <div
                                            style={{
                                                fontSize: '0.875rem',
                                                color: 'var(--muted)',
                                                marginBottom: '0.5rem',
                                            }}
                                        >
                                            Giá trị đơn hàng trung bình
                                        </div>
                                        <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                                            {formatCurrency(revenueStats?.averageOrderValue ?? 0)}
                                        </div>
                                    </div>
                                </div>

                                {/* Period Selector */}
                                <div className="card" style={{ marginBottom: '2rem' }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '1rem',
                                        }}
                                    >
                                        <h2
                                            style={{
                                                margin: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                            }}
                                        >
                                            <Calendar size={20} />
                                            Doanh thu theo thời gian
                                        </h2>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {[
                                                { key: 'day', label: 'Ngày' },
                                                { key: 'week', label: 'Tuần' },
                                                { key: 'month', label: 'Tháng' },
                                                { key: 'year', label: 'Năm' },
                                            ].map((period) => (
                                                <button
                                                    key={period.key}
                                                    type="button"
                                                    onClick={() =>
                                                        setRevenuePeriod(period.key as typeof revenuePeriod)
                                                    }
                                                    className={`btn ${
                                                        revenuePeriod === period.key ? 'btn-primary' : 'btn-outline'
                                                    }`}
                                                    style={{ minWidth: 80 }}
                                                >
                                                    {period.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <LineChart data={getRevenueData()}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="period"
                                                tick={{ fontSize: 12 }}
                                                angle={revenuePeriod === 'day' ? -45 : 0}
                                                height={revenuePeriod === 'day' ? 80 : undefined}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 12 }}
                                                tickFormatter={(value) => {
                                                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                                                    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
                                                    return value.toString()
                                                }}
                                            />
                                            <Tooltip
                                                formatter={(value: number, name: string) => {
                                                    if (name === 'revenue') return [formatCurrency(value), 'Doanh thu']
                                                    return [value, 'Số đơn hàng']
                                                }}
                                                contentStyle={{
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--border)',
                                                }}
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#3b82f6"
                                                strokeWidth={2}
                                                name="Doanh thu"
                                                dot={{ r: 4 }}
                                                activeDot={{ r: 6 }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="orderCount"
                                                stroke="#10b981"
                                                strokeWidth={2}
                                                name="Số đơn hàng"
                                                dot={{ r: 4 }}
                                                activeDot={{ r: 6 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Revenue Bar Chart */}
                                {getRevenueData().length > 0 ? (
                                    <div className="card">
                                        <h2 style={{ marginBottom: '1.5rem' }}>
                                            Doanh thu theo{' '}
                                            {revenuePeriod === 'day'
                                                ? 'ngày'
                                                : revenuePeriod === 'week'
                                                    ? 'tuần'
                                                    : revenuePeriod === 'month'
                                                        ? 'tháng'
                                                        : 'năm'}
                                        </h2>
                                        <ResponsiveContainer width="100%" height={400}>
                                            <BarChart data={getRevenueData()}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="period"
                                                    tick={{ fontSize: 12 }}
                                                    angle={revenuePeriod === 'day' ? -45 : 0}
                                                    height={revenuePeriod === 'day' ? 80 : undefined}
                                                />
                                                <YAxis
                                                    tick={{ fontSize: 12 }}
                                                    tickFormatter={(value) => {
                                                        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                                                        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
                                                        return value.toString()
                                                    }}
                                                />
                                                <Tooltip
                                                    formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                                                    contentStyle={{
                                                        borderRadius: '8px',
                                                        border: '1px solid var(--border)',
                                                    }}
                                                />
                                                <Legend />
                                                <Bar
                                                    dataKey="revenue"
                                                    fill="#3b82f6"
                                                    name="Doanh thu"
                                                    radius={[8, 8, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div
                                        className="card"
                                        style={{ textAlign: 'center', padding: '2rem' }}
                                    >
                                        <TrendingUp
                                            size={32}
                                            color="var(--muted)"
                                            style={{ margin: '0 auto 1rem' }}
                                        />
                                        <p style={{ color: 'var(--muted)' }}>
                                            Chưa có dữ liệu doanh thu cho khoảng thời gian này.
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Customer Statistics */}
                {activeTab === 'customers' && (
                    <div>
                        {loadingCustomers ? (
                            <div style={{ textAlign: 'center', padding: '3rem' }}>
                                <RefreshCw
                                    size={24}
                                    style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}
                                />
                                <div>Đang tải dữ liệu...</div>
                            </div>
                        ) : errorCustomers ? (
                            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                                <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
                                <h3 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Lỗi tải dữ liệu</h3>
                                <p style={{ color: 'var(--muted)' }}>
                                    Không thể tải thống kê khách hàng. Vui lòng thử lại.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => refetchCustomers()}
                                    style={{ marginTop: '1rem' }}
                                >
                                    Thử lại
                                </Button>
                            </div>
                        ) : !customerStats || customerStats.totalCustomers === 0 ? (
                            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                                <Users size={48} color="var(--muted)" style={{ margin: '0 auto 1rem' }} />
                                <h3 style={{ marginBottom: '0.5rem' }}>Chưa có dữ liệu</h3>
                                <p style={{ color: 'var(--muted)' }}>Chưa có khách hàng nào trong hệ thống.</p>
                            </div>
                        ) : (
                            <>
                                {/* Summary Cards */}
                                <div
                                    className="grid"
                                    style={{
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                        gap: '1rem',
                                        marginBottom: '2rem',
                                    }}
                                >
                                    <div className="card">
                                        <div
                                            style={{
                                                fontSize: '0.875rem',
                                                color: 'var(--muted)',
                                                marginBottom: '0.5rem',
                                            }}
                                        >
                                            Tổng khách hàng
                                        </div>
                                        <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                                            {customerStats?.totalCustomers ?? 0}
                                        </div>
                                    </div>
                                    <div className="card">
                                        <div
                                            style={{
                                                fontSize: '0.875rem',
                                                color: 'var(--muted)',
                                                marginBottom: '0.5rem',
                                            }}
                                        >
                                            Khách hàng hoạt động
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '2rem',
                                                fontWeight: 700,
                                                color: '#10b981',
                                            }}
                                        >
                                            {customerStats?.activeCustomers ?? 0}
                                        </div>
                                    </div>
                                    <div className="card">
                                        <div
                                            style={{
                                                fontSize: '0.875rem',
                                                color: 'var(--muted)',
                                                marginBottom: '0.5rem',
                                            }}
                                        >
                                            Khách hàng mới (30 ngày)
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '2rem',
                                                fontWeight: 700,
                                                color: '#3b82f6',
                                            }}
                                        >
                                            {customerStats?.newCustomers ?? 0}
                                        </div>
                                    </div>
                                </div>

                                {/* Top Customers by Purchase Count */}
                                {customerStats?.topCustomersByPurchaseCount &&
                                customerStats.topCustomersByPurchaseCount.length > 0 ? (
                                    <div className="card" style={{ marginBottom: '2rem' }}>
                                        <h2
                                            style={{
                                                marginBottom: '1.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                            }}
                                        >
                                            <BarChart3 size={20} />
                                            Top 10 khách hàng có số lần mua nhiều nhất
                                        </h2>
                                        <ResponsiveContainer width="100%" height={400}>
                                            <BarChart data={customerStats.topCustomersByPurchaseCount}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="customerName"
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={100}
                                                    tick={{ fontSize: 12 }}
                                                />
                                                <YAxis />
                                                <Tooltip
                                                    formatter={(value: number) => [value, 'Số lần mua']}
                                                    contentStyle={{
                                                        borderRadius: '8px',
                                                        border: '1px solid var(--border)',
                                                    }}
                                                />
                                                <Legend />
                                                <Bar
                                                    dataKey="purchaseCount"
                                                    fill="#3b82f6"
                                                    name="Số lần mua"
                                                    radius={[8, 8, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div
                                        className="card"
                                        style={{ marginBottom: '2rem', textAlign: 'center', padding: '2rem' }}
                                    >
                                        <Users size={32} color="var(--muted)" style={{ margin: '0 auto 1rem' }} />
                                        <p style={{ color: 'var(--muted)' }}>
                                            Chưa có khách hàng nào có đơn hàng.
                                        </p>
                                    </div>
                                )}

                                {/* Top Customers by Spending */}
                                {customerStats?.topCustomersByTotalSpending &&
                                customerStats.topCustomersByTotalSpending.length > 0 ? (
                                    <div className="card" style={{ marginBottom: '2rem' }}>
                                        <h2
                                            style={{
                                                marginBottom: '1.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                            }}
                                        >
                                            <TrendingUp size={20} />
                                            Top 10 khách hàng có tổng chi tiêu cao nhất
                                        </h2>
                                        <ResponsiveContainer width="100%" height={400}>
                                            <BarChart data={customerStats.topCustomersByTotalSpending}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="customerName"
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={100}
                                                    tick={{ fontSize: 12 }}
                                                />
                                                <YAxis
                                                    tickFormatter={(value) => {
                                                        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                                                        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
                                                        return value.toString()
                                                    }}
                                                />
                                                <Tooltip
                                                    formatter={(value: number) => [
                                                        formatCurrency(value),
                                                        'Tổng chi tiêu',
                                                    ]}
                                                    contentStyle={{
                                                        borderRadius: '8px',
                                                        border: '1px solid var(--border)',
                                                    }}
                                                />
                                                <Legend />
                                                <Bar
                                                    dataKey="totalSpending"
                                                    fill="#10b981"
                                                    name="Tổng chi tiêu"
                                                    radius={[8, 8, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div
                                        className="card"
                                        style={{ marginBottom: '2rem', textAlign: 'center', padding: '2rem' }}
                                    >
                                        <TrendingUp
                                            size={32}
                                            color="var(--muted)"
                                            style={{ margin: '0 auto 1rem' }}
                                        />
                                        <p style={{ color: 'var(--muted)' }}>
                                            Chưa có khách hàng nào có chi tiêu.
                                        </p>
                                    </div>
                                )}

                                {/* Top Customers Table */}
                                <div className="card">
                                    <h2 style={{ marginBottom: '1.5rem' }}>Chi tiết khách hàng hàng đầu</h2>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                            <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Khách hàng</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Email</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'right' }}>
                                                    Số lần mua
                                                </th>
                                                <th style={{ padding: '0.75rem', textAlign: 'right' }}>
                                                    Tổng chi tiêu
                                                </th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {(customerStats?.topCustomersByTotalSpending ?? []).map((customer) => (
                                                <tr
                                                    key={customer.customerId}
                                                    style={{ borderBottom: '1px solid var(--border)' }}
                                                >
                                                    <td
                                                        style={{
                                                            padding: '0.75rem',
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {customer.customerName}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: '0.75rem',
                                                            color: 'var(--muted)',
                                                        }}
                                                    >
                                                        {customer.customerEmail}
                                                    </td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                                        {customer.purchaseCount}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: '0.75rem',
                                                            textAlign: 'right',
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {formatCurrency(customer.totalSpending)}
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </>
    )
}
