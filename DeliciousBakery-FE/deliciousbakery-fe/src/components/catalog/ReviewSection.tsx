import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Star, MessageSquare, User, Pencil, Trash2, X } from 'lucide-react'
import { fetchReviewsByProduct, createReview, updateReview, deleteReview, fetchMyReviewForProduct } from '../../api/reviews'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../ui/Button'
import { formatDate } from '../../utils/format'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import type { Review } from '../../types'

interface ReviewSectionProps {
  productId: number
}

const schema = z.object({
  rating: z.number().min(1, 'Vui lòng chọn đánh giá').max(5, 'Đánh giá tối đa 5 sao'),
  comment: z.string().min(5, 'Bình luận phải có ít nhất 5 ký tự').max(255, 'Bình luận không được vượt quá 255 ký tự'),
})

type FormValues = z.infer<typeof schema>

const StarRating = ({ 
  rating, 
  size = 20, 
  interactive = false, 
  onRatingChange 
}: { 
  rating: number
  size?: number
  interactive?: boolean
  onRatingChange?: (rating: number) => void
}) => (
  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
    {[1, 2, 3, 4, 5].map((star) => (
      interactive ? (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange?.(star)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Star
            size={size}
            fill={star <= rating ? '#f59e0b' : 'transparent'}
            color={star <= rating ? '#f59e0b' : '#d1d5db'}
          />
        </button>
      ) : (
        <Star
          key={star}
          size={size}
          fill={star <= rating ? '#f59e0b' : 'transparent'}
          color={star <= rating ? '#f59e0b' : '#d1d5db'}
        />
      )
    ))}
  </div>
)

export const ReviewSection = ({ productId }: ReviewSectionProps) => {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null)

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ['reviews', 'product', productId],
    queryFn: () => fetchReviewsByProduct(productId),
    retry: (failureCount, error: unknown) => {
      const err = error as { response?: { status?: number } }
      // Don't retry on 404 (product might be deleted)
      if (err?.response?.status === 404) {
        return false
      }
      return failureCount < 2
    },
  })

  // Fetch current user's review for this product
  const { data: myReview, refetch: refetchMyReview } = useQuery<Review | null>({
    queryKey: ['reviews', 'my-review', productId],
    queryFn: () => fetchMyReviewForProduct(productId),
    enabled: !!user, // Only fetch if user is logged in
    retry: false, // Don't retry on 404 (user hasn't reviewed yet or product deleted)
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
      rating: 5,
      comment: '',
    },
  })

  const currentRating = watch('rating')

  // Reset form when editing
  useEffect(() => {
    if (editingReview) {
      reset({
        rating: editingReview.rating,
        comment: editingReview.comment || '',
      })
      setShowForm(true)
    }
  }, [editingReview, reset])

  const createMutation = useMutation({
    mutationFn: (values: FormValues) =>
      createReview({
        productId,
        rating: values.rating,
        comment: values.comment,
      }),
    onSuccess: () => {
      toast.success('Đã gửi đánh giá thành công!')
      queryClient.invalidateQueries({ queryKey: ['reviews', 'product', productId] })
      queryClient.invalidateQueries({ queryKey: ['reviews', 'my-review', productId] })
      reset()
      setShowForm(false)
    },
    onError: (err: unknown) => {
      const errorMessage =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string }).message ||
        'Không thể gửi đánh giá'
      if (errorMessage.includes('already reviewed')) {
        toast.error('Bạn đã đánh giá sản phẩm này rồi. Vui lòng chỉnh sửa đánh giá hiện tại.')
        refetchMyReview()
      } else {
        toast.error(errorMessage)
      }
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: FormValues }) =>
      updateReview(id, {
        rating: values.rating,
        comment: values.comment,
      }),
    onSuccess: () => {
      toast.success('Đã cập nhật đánh giá thành công!')
      queryClient.invalidateQueries({ queryKey: ['reviews', 'product', productId] })
      queryClient.invalidateQueries({ queryKey: ['reviews', 'my-review', productId] })
      reset()
      setShowForm(false)
      setEditingReview(null)
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string }).message ||
        'Không thể cập nhật đánh giá'
      toast.error(msg)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!id || typeof id !== 'number' || isNaN(id)) {
        throw new Error(`Invalid review ID: ${id}`)
      }
      return deleteReview(id)
    },
    onSuccess: () => {
      toast.success('Đã xóa đánh giá thành công!')
      // Remove the my-review query since it no longer exists
      queryClient.removeQueries({ queryKey: ['reviews', 'my-review', productId] })
      // Invalidate and refetch product reviews
      queryClient.invalidateQueries({ queryKey: ['reviews', 'product', productId] })
      setDeleteTarget(null)
    },
    onError: (err: unknown) => {
      const errorMessage =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string }).message ||
        'Không thể xóa đánh giá'
      toast.error(errorMessage)
      setDeleteTarget(null)
    },
  })

  const onSubmit = (values: FormValues) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đánh giá sản phẩm')
      return
    }
    
    if (editingReview) {
      updateMutation.mutate({ id: editingReview.id, values })
    } else {
      createMutation.mutate(values)
    }
  }

  const handleEdit = (review: Review) => {
    setEditingReview(review)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingReview(null)
    reset({
      rating: 5,
      comment: '',
    })
  }

  // Filter out user's own review from the list (we'll show it separately)
  const otherReviews = reviews.filter((review) => review.userId !== user?.id)

  // Calculate average rating from all reviews
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0

  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
  }))

  return (
    <div className="card" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <MessageSquare size={24} color="var(--primary)" />
        <h2 style={{ margin: 0 }}>Đánh giá sản phẩm</h2>
      </div>

      {/* Rating Summary */}
      {reviews.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            padding: '1.5rem',
            background: '#f8fafc',
            borderRadius: 'var(--radius)',
            marginBottom: '2rem',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)' }}>
              {averageRating.toFixed(1)}
            </div>
            <StarRating rating={Math.round(averageRating)} size={24} />
            <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              {reviews.length} đánh giá
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
            {ratingCounts.map(({ rating, count }) => (
              <div key={rating} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ minWidth: '60px', fontSize: '0.9rem' }}>{rating} sao</span>
                <div
                  style={{
                    flex: 1,
                    height: '8px',
                    background: '#e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${reviews.length > 0 ? (count / reviews.length) * 100 : 0}%`,
                      height: '100%',
                      background: '#f59e0b',
                    }}
                  />
                </div>
                <span style={{ minWidth: '30px', fontSize: '0.85rem', color: 'var(--muted)' }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User's Own Review or Create Form */}
      {user && (
        <div style={{ marginBottom: '2rem' }}>
          {myReview && !editingReview && !showForm ? (
            // Show user's existing review with edit/delete options
            <div
              style={{
                padding: '1.5rem',
                background: '#eff6ff',
                border: '2px solid var(--primary)',
                borderRadius: 'var(--radius)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold',
                  }}
                >
                  {myReview.userName?.charAt(0).toUpperCase() || <User size={20} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <strong>Đánh giá của bạn</strong>
                    <StarRating rating={myReview.rating} size={16} />
                  </div>
                  {myReview.createdAt && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                      {formatDate(myReview.createdAt)}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button
                    type="button"
                    variant="text"
                    onClick={() => handleEdit(myReview)}
                    iconLeft={<Pencil size={16} />}
                    style={{ fontSize: '0.9rem' }}
                  >
                    Sửa
                  </Button>
                  <Button
                    type="button"
                    variant="text"
                    onClick={() => {
                      if (myReview?.id && typeof myReview.id === 'number') {
                        setDeleteTarget(myReview)
                      } else {
                        toast.error('Không thể xóa đánh giá: ID không hợp lệ')
                      }
                    }}
                    iconLeft={<Trash2 size={16} />}
                    style={{ fontSize: '0.9rem', color: '#dc2626' }}
                  >
                    Xóa
                  </Button>
                </div>
              </div>
              {myReview.comment && (
                <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--text)' }}>{myReview.comment}</p>
              )}
            </div>
          ) : (
            // Show create/edit form
            (showForm || editingReview) && (
              <form
                onSubmit={handleSubmit(onSubmit)}
                style={{
                  padding: '1.5rem',
                  background: '#f8fafc',
                  borderRadius: 'var(--radius)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0 }}>{editingReview ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}</h3>
                  <button
                    type="button"
                    onClick={handleCancel}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <X size={20} color="var(--muted)" />
                  </button>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Đánh giá của bạn *
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <StarRating
                      rating={currentRating}
                      size={32}
                      interactive
                      onRatingChange={(rating) => setValue('rating', rating)}
                    />
                    <span style={{ marginLeft: '0.5rem', fontWeight: 600, fontSize: '1.1rem' }}>
                      {currentRating}/5
                    </span>
                  </div>
                  {errors.rating && (
                    <span className="form-error" style={{ display: 'block', marginTop: '0.25rem' }}>
                      {errors.rating.message}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Bình luận *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                    {...register('comment')}
                    style={{
                      width: '100%',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                      padding: '0.75rem',
                      fontFamily: 'inherit',
                      fontSize: '0.95rem',
                    }}
                  />
                  {errors.comment && (
                    <span className="form-error" style={{ display: 'block', marginTop: '0.25rem' }}>
                      {errors.comment.message}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? 'Đang lưu...'
                      : editingReview
                        ? 'Cập nhật đánh giá'
                        : 'Gửi đánh giá'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Hủy
                  </Button>
                </div>
              </form>
            )
          )}

          {!myReview && !showForm && !editingReview && (
            <Button onClick={() => setShowForm(true)} iconLeft={<MessageSquare size={16} />}>
              Viết đánh giá
            </Button>
          )}
        </div>
      )}

      {!user && (
        <div
          style={{
            padding: '1rem',
            background: '#fef3c7',
            borderRadius: 'var(--radius)',
            marginBottom: '2rem',
            textAlign: 'center',
            color: '#92400e',
          }}
        >
          <p style={{ margin: 0 }}>
            Vui lòng{' '}
            <a href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              đăng nhập
            </a>{' '}
            để viết đánh giá
          </p>
        </div>
      )}

      {/* Other Users' Reviews List */}
      {isLoading ? (
        <p>Đang tải đánh giá...</p>
      ) : otherReviews.length === 0 && !myReview ? (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--muted)',
            background: '#f8fafc',
            borderRadius: 'var(--radius)',
          }}
        >
          <MessageSquare size={48} color="var(--muted)" style={{ marginBottom: '0.5rem' }} />
          <p style={{ margin: 0 }}>Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!</p>
        </div>
      ) : otherReviews.length === 0 && myReview ? (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--muted)',
            background: '#f8fafc',
            borderRadius: 'var(--radius)',
          }}
        >
          <MessageSquare size={48} color="var(--muted)" style={{ marginBottom: '0.5rem' }} />
          <p style={{ margin: 0 }}>Chưa có đánh giá nào khác.</p>
        </div>
      ) : (
        <>
          <h3 style={{ marginBottom: '1rem' }}>Đánh giá từ khách hàng khác</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {otherReviews.map((review) => (
              <div
                key={review.id}
                style={{
                  padding: '1.5rem',
                  background: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 'bold',
                    }}
                  >
                    {review.userName?.charAt(0).toUpperCase() || <User size={20} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                      <strong>{review.userName || 'Người dùng'}</strong>
                      <StarRating rating={review.rating} size={16} />
                    </div>
                    {review.createdAt && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                        {formatDate(review.createdAt)}
                      </div>
                    )}
                  </div>
                </div>
                {review.comment && (
                  <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--text)' }}>{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xác nhận xóa đánh giá"
        message="Bạn có chắc muốn xóa đánh giá này? Hành động này không thể hoàn tác."
        confirmLabel="Xóa đánh giá"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget?.id && typeof deleteTarget.id === 'number') {
            deleteMutation.mutate(deleteTarget.id)
          } else {
            toast.error('Không thể xóa đánh giá: ID không hợp lệ')
            setDeleteTarget(null)
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
