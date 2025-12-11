import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Eye, Pencil, Trash2, FolderOpen, PlusCircle } from 'lucide-react'
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from '../../api/categories'
import { fetchProducts } from '../../api/products'
import type { Category, Product } from '../../types'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { formatCurrency } from '../../utils/format'

const schema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, 'Tên danh mục phải có ít nhất 2 ký tự'),
  slug: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const AdminCategoriesPage = () => {
  const queryClient = useQueryClient()
  const [viewCategory, setViewCategory] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => fetchProducts(),
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', slug: '' },
  })

  const editingId = watch('id')

  const resetFormState = () => {
    reset({ id: undefined, name: '', slug: '' })
  }

  const handleCloseForm = () => {
    resetFormState()
    setFormMode('create')
    setIsFormOpen(false)
  }

  const upsertMutation = useMutation({
    mutationFn: (values: FormValues) =>
      values.id
        ? updateCategory(values.id, values)
        : createCategory(values),
    onSuccess: () => {
      toast.success(editingId ? 'Đã cập nhật danh mục' : 'Đã thêm danh mục')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      resetFormState()
      setFormMode('create')
      setIsFormOpen(false)
    },
    onError: (err: unknown) => {
      const error = err as { message?: string }
      toast.error(error?.message ?? 'Không thể lưu danh mục')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      toast.success('Đã xóa danh mục')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setDeleteTarget(null)
    },
    onError: (err: unknown) => {
      const error = err as { message?: string }
      toast.error(
        error?.message ?? 'Không thể xóa danh mục. Danh mục có thể đang chứa sản phẩm.',
      )
      setDeleteTarget(null)
    },
  })

  const onSubmit = (values: FormValues) =>
    upsertMutation.mutate({
      ...values,
      slug: values.slug || toSlug(values.name),
    })

  const handleEdit = (category: Category) => {
    setFormMode('edit')
    reset(category)
    setIsFormOpen(true)
  }

  const handleAddCategoryClick = () => {
    setFormMode('create')
    resetFormState()
    setIsFormOpen(true)
  }

  const getCategoryProducts = (categoryId: number) =>
    products.filter((p) => p.categoryId === categoryId)

  const filteredCategories = categories.filter((category) => {
    const keyword = searchTerm.trim().toLowerCase()
    if (!keyword) return true
    return (
      category.name.toLowerCase().includes(keyword) ||
      (category.slug ?? '').toLowerCase().includes(keyword)
    )
  })

  return (
    <div className="grid" style={{ gap: '1.5rem' }}>
      <div
        className="card"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}
      >
        <div>
          <p className="tag" style={{ marginBottom: '0.25rem' }}>Danh mục</p>
          <h3 style={{ margin: 0 }}>Quản lý danh mục sản phẩm</h3>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.95rem' }}>
            Nhấn “Thêm danh mục” để mở biểu mẫu ở giữa màn hình hoặc chọn “Sửa” để chỉnh sửa thông tin.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {isFormOpen && (
            <Button type="button" variant="outline" onClick={handleCloseForm}>
              Đóng form
            </Button>
          )}
          <Button type="button" iconLeft={<PlusCircle size={16} />} onClick={handleAddCategoryClick}>
            Thêm danh mục
          </Button>
        </div>
      </div>

      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <h3 style={{ margin: 0 }}>Danh sách danh mục ({filteredCategories.length})</h3>
          <Input
            label="Tìm kiếm"
            placeholder="Tìm theo tên hoặc slug..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Slug</th>
              <th>Số sản phẩm</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((category) => {
              const productCount = getCategoryProducts(category.id).length
              const deletable = productCount === 0
              return (
                <tr key={category.id}>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FolderOpen size={18} color="var(--primary)" />
                      {category.name}
                    </div>
                  </td>
                  <td>
                    <code style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                      {category.slug}
                    </code>
                  </td>
                  <td>
                    <span className={`pill ${productCount > 0 ? 'pill-success' : 'pill-warning'}`}>
                      {productCount} sản phẩm
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <Button
                        type="button"
                        variant="text"
                        onClick={() => setViewCategory(category)}
                        iconLeft={<Eye size={16} />}
                      >
                        Xem
                      </Button>
                      <Button
                        type="button"
                        variant="text"
                        onClick={() => handleEdit(category)}
                        iconLeft={<Pencil size={16} />}
                      >
                        Sửa
                      </Button>
                      <Button
                        type="button"
                        variant="text"
                        onClick={() => setDeleteTarget(category)}
                        disabled={!deletable}
                        style={{ color: deletable ? '#dc2626' : '#9ca3af' }}
                        iconLeft={<Trash2 size={16} />}
                        title={deletable ? 'Xóa danh mục' : 'Không thể xóa: danh mục có sản phẩm'}
                      >
                        Xóa
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Modal
        open={isFormOpen}
        onClose={handleCloseForm}
        title={formMode === 'edit' ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
        width={480}
      >
        <form className="grid" style={{ gap: '1rem' }} onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Tên danh mục *"
            placeholder="VD: Bánh sinh nhật"
            {...register('name')}
            error={errors.name?.message}
          />
          <Input
            label="Slug (tự động tạo nếu để trống)"
            placeholder="banh-sinh-nhat"
            {...register('slug')}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button type="button" variant="outline" onClick={handleCloseForm}>
              Hủy
            </Button>
            <Button type="submit" disabled={upsertMutation.isPending}>
              {upsertMutation.isPending
                ? 'Đang lưu...'
                : formMode === 'edit'
                  ? 'Lưu thay đổi'
                  : 'Thêm mới'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Category Detail Modal */}
      <Modal
        open={Boolean(viewCategory)}
        onClose={() => setViewCategory(null)}
        title="Chi tiết danh mục"
        width={600}
      >
        {viewCategory && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1.25rem',
                background: 'linear-gradient(135deg, #fff0f6, #ffe4e6)',
                borderRadius: 'var(--radius)',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FolderOpen size={28} color="#fff" />
              </div>
              <div>
                <h2 style={{ margin: 0 }}>{viewCategory.name}</h2>
                <code style={{ color: 'var(--muted)' }}>{viewCategory.slug}</code>
              </div>
            </div>

            <div>
              <h4 style={{ marginBottom: '0.75rem' }}>
                Sản phẩm trong danh mục ({getCategoryProducts(viewCategory.id).length})
              </h4>
              {getCategoryProducts(viewCategory.id).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {getCategoryProducts(viewCategory.id).map((product) => (
                    <div
                      key={product.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        background: '#f8fafc',
                        borderRadius: 'var(--radius)',
                      }}
                    >
                      <img
                        src={product.image || '/placeholder.png'}
                        alt={product.name}
                        style={{
                          width: 40,
                          height: 40,
                          objectFit: 'cover',
                          borderRadius: 'var(--radius)',
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{product.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                          Tồn kho: {product.stock}
                        </div>
                      </div>
                      <strong style={{ color: 'var(--primary)' }}>
                        {formatCurrency(product.price)}
                      </strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>
                  Danh mục chưa có sản phẩm nào.
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button
                type="button"
                onClick={() => {
                  handleEdit(viewCategory)
                  setViewCategory(null)
                }}
                iconLeft={<Pencil size={16} />}
              >
                Chỉnh sửa
              </Button>
              <Button type="button" variant="outline" onClick={() => setViewCategory(null)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xác nhận xóa danh mục"
        message={`Bạn có chắc muốn xóa danh mục "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa danh mục"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
