export type Role = 'ADMIN' | 'CUSTOMER'

export interface Category {
  id: number
  name: string
  slug: string
  createdAt?: string
}

export interface Product {
  id: number
  name: string
  slug: string
  price: number
  stock: number
  image: string
  description?: string
  ingredients?: string
  allergens?: string
  weight?: string
  shelfLife?: string
  storageInstructions?: string
  isFeatured?: boolean
  isActive?: boolean
  unit?: string
  categoryId: number
  categoryName?: string
  createdAt?: string
}

export interface CartLineItem {
  id?: number
  productId: number
  name: string
  image?: string
  price: number
  quantity: number
}

export interface CartItemDTO {
  id: number
  productId: number
  productName: string
  productImage?: string
  price: number
  unitPrice: number
  quantity: number
}

export interface CartSummary {
  id?: number
  userId?: number
  updatedAt?: string
  totalAmount: number
  items: CartItemDTO[]
}

export interface AuthUser {
  id: number
  email: string
  fullName: string
  role: Role
  enabled?: boolean
  phone?: string
  address?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  userId: number
  email: string
  fullName: string
  role: Role
  enabled: boolean
  phone?: string
  address?: string
}

export interface RegisterPayload {
  email: string
  password: string
  fullName: string
  phone?: string
  address?: string
  roleId?: number
  otp?: string
}

export interface User extends AuthUser {
  createdAt?: string
}

export interface OrderItem {
  id: number
  orderId?: number
  productId: number
  productName: string
  productImage?: string
  unitPrice: number
  quantity: number
  totalPrice: number
}

export interface Payment {
  id: number
  orderId: number
  amount: number
  method: string
  status: string
  transactionId?: string
  createdAt?: string
  paidAt?: string
}

export interface Order {
  id: number
  code: string
  status: 'PENDING_CONFIRMATION' | 'PREPARING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED'
  createdAt?: string
  updatedAt?: string
  customerId: number
  customerName: string
  customerEmail: string
  totalAmount: number
  shippingFee?: number
  shippingAddress?: string
  note?: string
  items: OrderItem[]
  payment?: Payment
}

export interface ApiError {
  message: string
  status?: number
  details?: unknown
}

export interface PaginatedQuery {
  search?: string
  categoryId?: number
  page?: number
  size?: number
}

export interface RoleEntity {
  id: number
  name: string
  description?: string
}

export interface Review {
  id: number
  productId: number
  productName?: string
  userId: number
  userName?: string
  rating: number
  comment?: string
  createdAt?: string
}

