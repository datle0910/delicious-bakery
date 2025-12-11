import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Eye, Pencil, Trash2, Star, MessageSquare } from 'lucide-react'
import { fetchReviews, createReview, updateReview, deleteReview } from '../../api/reviews'
import { fetchProducts } from '../../api/products'
import { fetchUsers } from '../../api/users'
import type { Review, Product, User } from '../../types'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { formatDate } from '../../utils/format'

const schema = z.object({
  id: z.number().optional(),
  productId: z.number().min(1, 'Vui lòng chọn sản phẩm'),
  userId: z.number().min(1, 'Vui lòng chọn người dùng'),
  rating: z.number().min(1, 'Đánh giá tối thiểu 1 sao').max(5, 'Đánh giá tối đa 5 sao'),
  comment: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const StarRating = ({ rating, size = 16 }: { rating: number; size?: number }) => (
  <div style={{ display: 'flex', gap: '2px' }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={size}
        fill={star <= rating ? '#f59e0b' : 'transparent'}
        color={star <= rating ? '#f59e0b' : '#d1d5db'}
      />
    ))}
  </div>
)

export const AdminReviewsPage = () => {
  const queryClient = useQueryClient()
  const [viewReview, setViewReview] = useState<Review | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null)

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: fetchReviews,
  })

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => fetchProducts(),
  })

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      productId: 0,
      userId: 0,
      rating: 5,
      comment: '',
    },
  })

  const editingId = watch('id')
  const currentRating = watch('rating')

  const upsertMutation = useMutation({
    mutationFn: (values: FormValues) =>
      values.id ? updateReview(values.id, values) : createReview(values),
    onSuccess: () => {
      toast.success(editingId ? 'Đã cập nhật đánh giá' : 'Đã thêm đánh giá')
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      reset()
    },
    onError: (err: unknown) => {
      const error = err as { message?: string }
      toast.error(error?.message ?? 'Không thể lưu đánh giá')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteReview(id),
    onSuccess: () => {
      toast.success('Đã xóa đánh giá')
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      setDeleteTarget(null)
    },
    onError: (err: unknown) => {
      const error = err as { message?: string }
      toast.error(error?.message ?? 'Không thể xóa đánh giá')
      setDeleteTarget(null)
    },
  })

  const onSubmit = (values: FormValues) => upsertMutation.mutate(values)

  const handleEdit = (review: Review) => {
    reset({
      id: review.id,
      productId: review.productId,
      userId: review.userId,
      rating: review.rating,
      comment: review.comment ?? '',
    })
  }

  const getProductName = (productId: number) => {
    const product = products.find((p) => p.id === productId)
    return product?.name ?? `Sản phẩm #${productId}`
  }

  const getUserName = (userId: number) => {
    const user = users.find((u) => u.id === userId)
    return user?.fullName ?? `Người dùng #${userId}`
  }

  if (isLoading) return <p>Đang tải danh sách đánh giá...</p>

  return (
    <div className="grid" style={{ gap: '1.5rem' }}>
      <div className="card">
        <h3>{editingId ? 'Cập nhật đánh giá' : 'Thêm đánh giá mới'}</h3>
        <form className="grid" style={{ gap: '1rem' }} onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <Select
              label="Sản phẩm *"
              {...register('productId', { valueAsNumber: true })}
              error={errors.productId?.message}
            >
              <option value="">-- Chọn sản phẩm --</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </Select>
            <Select
              label="Người đánh giá *"
              {...register('userId', { valueAsNumber: true })}
              error={errors.userId?.message}
            >
              <option value="">-- Chọn người dùng --</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName} ({user.email})
                </option>
              ))}
            </Select>
          </div>
          <div className="form-field">
            <label>Đánh giá *</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setValue('rating', star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                  }}
                >
                  <Star
                    size={28}
                    fill={star <= currentRating ? '#f59e0b' : 'transparent'}
                    color={star <= currentRating ? '#f59e0b' : '#d1d5db'}
                  />
                </button>
              ))}
              <span style={{ marginLeft: '0.5rem', fontWeight: 600 }}>{currentRating}/5</span>
            </div>
            {errors.rating && <span className="form-error">{errors.rating.message}</span>}
          </div>
          <div className="form-field">
            <label>Nội dung đánh giá</label>
            <textarea
              rows={3}
              placeholder="Nhập nội dung đánh giá..."
              {...register('comment')}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button type="submit" disabled={upsertMutation.isPending}>
              {upsertMutation.isPending ? 'Đang lưu...' : editingId ? 'Lưu thay đổi' : 'Thêm mới'}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={() => reset()}>
                Hủy
              </Button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h3>Danh sách đánh giá ({reviews.length})</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Người đánh giá</th>
              <th>Đánh giá</th>
              <th>Nội dung</th>
              <th>Ngày tạo</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MessageSquare size={18} color="var(--primary)" />
                    <strong>{review.productName || getProductName(review.productId)}</strong>
                  </div>
                </td>
                <td>{review.userName || getUserName(review.userId)}</td>
                <td>
                  <StarRating rating={review.rating} />
                </td>
                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {review.comment || '—'}
                </td>
                <td>{formatDate(review.createdAt)}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <Button
                      type="button"
                      variant="text"
                      onClick={() => setViewReview(review)}
                      iconLeft={<Eye size={16} />}
                    >
                      Xem
                    </Button>
                    <Button
                      type="button"
                      variant="text"
                      onClick={() => handleEdit(review)}
                      iconLeft={<Pencil size={16} />}
                    >
                      Sửa
                    </Button>
                    <Button
                      type="button"
                      variant="text"
                      onClick={() => setDeleteTarget(review)}
                      style={{ color: '#dc2626' }}
                      iconLeft={<Trash2 size={16} />}
                    >
                      Xóa
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Review Detail Modal */}
      <Modal
        open={Boolean(viewReview)}
        onClose={() => setViewReview(null)}
        title="Chi tiết đánh giá"
        width={480}
      >
        {viewReview && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                padding: '1.25rem',
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                borderRadius: 'var(--radius)',
                textAlign: 'center',
              }}
            >
              <StarRating rating={viewReview.rating} size={32} />
              <h2 style={{ margin: '0.5rem 0 0' }}>{viewReview.rating}/5 sao</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Sản phẩm</div>
                <div style={{ fontWeight: 600 }}>
                  {viewReview.productName || getProductName(viewReview.productId)}
                </div>
              </div>
              <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Người đánh giá</div>
                <div style={{ fontWeight: 600 }}>
                  {viewReview.userName || getUserName(viewReview.userId)}
                </div>
              </div>
              {viewReview.comment && (
                <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Nội dung</div>
                  <div style={{ marginTop: '0.25rem' }}>{viewReview.comment}</div>
                </div>
              )}
              <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Ngày đánh giá</div>
                <div>{formatDate(viewReview.createdAt)}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button
                type="button"
                onClick={() => {
                  handleEdit(viewReview)
                  setViewReview(null)
                }}
                iconLeft={<Pencil size={16} />}
              >
                Chỉnh sửa
              </Button>
              <Button type="button" variant="outline" onClick={() => setViewReview(null)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xác nhận xóa đánh giá"
        message="Bạn có chắc muốn xóa đánh giá này? Hành động này không thể hoàn tác."
        confirmLabel="Xóa đánh giá"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

