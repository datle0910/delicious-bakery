import type { CartLineItem } from '../types'

const formatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
})

export const formatCurrency = (value: number) => formatter.format(value)

export const formatDate = (value?: string | Date) => {
  if (!value) return '-'
  const date = value instanceof Date ? value : new Date(value)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const calculateCartTotal = (items: CartLineItem[]) =>
  items.reduce((acc, item) => acc + item.price * item.quantity, 0)

