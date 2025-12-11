import { api } from './client'

export interface TopProduct {
  productId: number
  productName: string
  productImage?: string
  totalQuantitySold: number
  totalRevenue: number
  purchaseCount: number
  currentStock: number
}

export interface ProductStatistics {
  bestSellingProducts: TopProduct[]
  slowSellingProducts: TopProduct[]
  topProductsByPurchaseCount: TopProduct[]
  totalProducts: number
  lowStockProducts: number
  outOfStockProducts: number
}

export interface RevenueByPeriod {
  period: string
  revenue: number
  orderCount: number
}

export interface RevenueStatistics {
  totalRevenue: number
  averageOrderValue: number
  totalOrders: number
  revenueByMonth: RevenueByPeriod[]
  revenueByWeek: RevenueByPeriod[]
  revenueByYear: RevenueByPeriod[]
  revenueByDay: RevenueByPeriod[]
}

export interface TopCustomer {
  customerId: number
  customerName: string
  customerEmail: string
  purchaseCount: number
  totalSpending: number
}

export interface CustomerStatistics {
  totalCustomers: number
  activeCustomers: number
  newCustomers: number
  topCustomersByPurchaseCount: TopCustomer[]
  topCustomersByTotalSpending: TopCustomer[]
}

export const fetchProductStatistics = async (): Promise<ProductStatistics> => {
  const { data } = await api.get<ProductStatistics>('/statistics/products')
  return data
}

export const fetchRevenueStatistics = async (): Promise<RevenueStatistics> => {
  const { data } = await api.get<RevenueStatistics>('/statistics/revenue')
  return data
}

export const fetchCustomerStatistics = async (): Promise<CustomerStatistics> => {
  const { data } = await api.get<CustomerStatistics>('/statistics/customers')
  return data
}

export type ExportSection = 'products' | 'revenue' | 'customers' | 'all'

// Helper function to download file from blob
const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// Excel Export Functions
export const exportProductsToExcel = async (): Promise<void> => {
  const response = await api.get('/statistics/export/products/excel', {
    responseType: 'blob',
  })
  const contentDisposition = response.headers['content-disposition']
  const filename = contentDisposition
    ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'ThongKe_SanPham.xlsx'
    : 'ThongKe_SanPham.xlsx'
  downloadFile(response.data, filename)
}

export const exportRevenueToExcel = async (): Promise<void> => {
  const response = await api.get('/statistics/export/revenue/excel', {
    responseType: 'blob',
  })
  const contentDisposition = response.headers['content-disposition']
  const filename = contentDisposition
    ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'ThongKe_DoanhThu.xlsx'
    : 'ThongKe_DoanhThu.xlsx'
  downloadFile(response.data, filename)
}

export const exportCustomersToExcel = async (): Promise<void> => {
  const response = await api.get('/statistics/export/customers/excel', {
    responseType: 'blob',
  })
  const contentDisposition = response.headers['content-disposition']
  const filename = contentDisposition
    ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'ThongKe_KhachHang.xlsx'
    : 'ThongKe_KhachHang.xlsx'
  downloadFile(response.data, filename)
}

export const exportAllStatisticsToExcel = async (): Promise<void> => {
  const response = await api.get('/statistics/export/all/excel', {
    responseType: 'blob',
  })
  const contentDisposition = response.headers['content-disposition']
  const filename = contentDisposition
    ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'ThongKe_TatCa.xlsx'
    : 'ThongKe_TatCa.xlsx'
  downloadFile(response.data, filename)
}

// PDF Export Functions
export const exportProductsToPDF = async (): Promise<void> => {
  const response = await api.get('/statistics/export/products/pdf', {
    responseType: 'blob',
  })
  const contentDisposition = response.headers['content-disposition']
  const filename = contentDisposition
    ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'ThongKe_SanPham.pdf'
    : 'ThongKe_SanPham.pdf'
  downloadFile(response.data, filename)
}

export const exportRevenueToPDF = async (): Promise<void> => {
  const response = await api.get('/statistics/export/revenue/pdf', {
    responseType: 'blob',
  })
  const contentDisposition = response.headers['content-disposition']
  const filename = contentDisposition
    ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'ThongKe_DoanhThu.pdf'
    : 'ThongKe_DoanhThu.pdf'
  downloadFile(response.data, filename)
}

export const exportCustomersToPDF = async (): Promise<void> => {
  const response = await api.get('/statistics/export/customers/pdf', {
    responseType: 'blob',
  })
  const contentDisposition = response.headers['content-disposition']
  const filename = contentDisposition
    ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'ThongKe_KhachHang.pdf'
    : 'ThongKe_KhachHang.pdf'
  downloadFile(response.data, filename)
}

export const exportAllStatisticsToPDF = async (): Promise<void> => {
  const response = await api.get('/statistics/export/all/pdf', {
    responseType: 'blob',
  })
  const contentDisposition = response.headers['content-disposition']
  const filename = contentDisposition
    ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'ThongKe_TatCa.pdf'
    : 'ThongKe_TatCa.pdf'
  downloadFile(response.data, filename)
}

