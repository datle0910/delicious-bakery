import { useMemo, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Eye, Pencil, Trash2, Upload, X, Image as ImageIcon, PlusCircle } from 'lucide-react'
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../../api/products'
import { fetchCategories } from '../../api/categories'
import { uploadImage } from '../../api/upload'
import type { Product } from '../../types'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { formatCurrency, formatDate } from '../../utils/format'

const schema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, 'Tên sản phẩm phải có ít nhất 2 ký tự'),
  slug: z.string().optional(),
  price: z.number().min(1000, 'Giá phải lớn hơn 1.000đ'),
  stock: z.number().min(0, 'Tồn kho không được âm'),
  image: z.string().url('URL ảnh không hợp lệ').or(z.literal('')).optional(),
  description: z.string().optional(),
  ingredients: z.string().optional(),
  allergens: z.string().optional(),
  weight: z.string().optional(),
  shelfLife: z.string().optional(),
  storageInstructions: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  unit: z.string().optional(),
  categoryId: z.number().min(1, 'Vui lòng chọn danh mục'),
})

type FormValues = z.infer<typeof schema>

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const AdminProductsPage = () => {
  const queryClient = useQueryClient()
  const [viewProduct, setViewProduct] = useState<Product | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined)
  const [stockFilter, setStockFilter] = useState<'all' | 'inStock' | 'lowStock' | 'outOfStock'>('all')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => fetchProducts(),
  })
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
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
      name: '',
      slug: '',
      price: 0,
      stock: 0,
      image: '',
      description: '',
      ingredients: '',
      allergens: '',
      weight: '',
      shelfLife: '',
      storageInstructions: '',
      isFeatured: false,
      isActive: true,
      unit: '',
      categoryId: categories[0]?.id ?? 1,
    },
  })

  const editingId = watch('id')
  const currentImage = watch('image')

  const resetFormState = () => {
    reset({
      name: '',
      slug: '',
      price: 0,
      stock: 0,
      image: '',
      description: '',
      ingredients: '',
      allergens: '',
      weight: '',
      shelfLife: '',
      storageInstructions: '',
      isFeatured: false,
      isActive: true,
      unit: '',
      categoryId: categories[0]?.id ?? 1,
      id: undefined,
    })
    setSelectedFile(null)
    setImagePreview(null)
    setImageError(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCloseForm = () => {
    resetFormState()
    setIsFormOpen(false)
    setFormMode('create')
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB')
      return
    }

    setSelectedFile(file)
    setUploading(true)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    try {
      // Upload to Cloudinary via backend
      const imageUrl = await uploadImage(file)
      setValue('image', imageUrl)
      toast.success('Tải ảnh lên thành công!')
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Tải ảnh lên thất bại')
      setSelectedFile(null)
      setImagePreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    setImagePreview(null)
    setImageError(false)
    setValue('image', '')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const upsertMutation = useMutation({
    mutationFn: (values: FormValues) =>
      values.id
        ? updateProduct(values.id, { ...values })
        : createProduct({ ...values }),
    onSuccess: () => {
      toast.success(editingId ? 'Đã cập nhật sản phẩm' : 'Đã thêm sản phẩm')
      queryClient.invalidateQueries({ queryKey: ['products'] })
      resetFormState()
      if (formMode === 'edit') {
        setFormMode('create')
      }
      setIsFormOpen(false)
    },
    onError: (err: unknown) => {
      const error = err as { message?: string }
      toast.error(error?.message ?? 'Không thể lưu sản phẩm')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: (_, deletedProductId) => {
      toast.success('Đã xóa sản phẩm')
      queryClient.invalidateQueries({ queryKey: ['products'] })
      // Remove product detail query to prevent stale data
      queryClient.removeQueries({ queryKey: ['product', deletedProductId] })
      // Remove all review queries related to the deleted product to prevent 404 errors
      queryClient.removeQueries({ queryKey: ['reviews', 'product', deletedProductId] })
      queryClient.removeQueries({ queryKey: ['reviews', 'my-review', deletedProductId] })
      setDeleteTarget(null)
    },
    onError: (err: unknown) => {
      const error = err as { message?: string }
      toast.error(error?.message ?? 'Không thể xóa sản phẩm. Sản phẩm có thể đã nằm trong đơn hàng.')
      setDeleteTarget(null)
    },
  })

  const onSubmit = (values: FormValues) => {
    if (!values.image && !selectedFile) {
      toast.error('Vui lòng chọn ảnh sản phẩm')
      return
    }
    upsertMutation.mutate({ ...values, slug: values.slug || toSlug(values.name) })
  }

  const handleEdit = (product: Product) => {
    try {
      setFormMode('edit')
      setIsFormOpen(true)
      reset({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        stock: product.stock,
        image: product.image,
        description: product.description ?? '',
        ingredients: product.ingredients ?? '',
        allergens: product.allergens ?? '',
        weight: product.weight ?? '',
        shelfLife: product.shelfLife ?? '',
        storageInstructions: product.storageInstructions ?? '',
        isFeatured: product.isFeatured ?? false,
        isActive: product.isActive ?? true,
        unit: product.unit ?? '',
        categoryId: product.categoryId,
      })
      setSelectedFile(null)
      setImageError(false)
      // Set image preview with error handling
      if (product.image) {
        setImagePreview(product.image)
      } else {
        setImagePreview(null)
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error editing product:', error)
      toast.error('Có lỗi xảy ra khi chỉnh sửa sản phẩm')
    }
  }

  const handleAddProductClick = () => {
    setFormMode('create')
    resetFormState()
    setIsFormOpen(true)
  }

  const handleCancelEdit = () => {
    resetFormState()
    setFormMode('create')
  }

  const handleImageError = (e?: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Prevent any storage-related errors from breaking the form
    try {
      setImageError(true)
      // Keep the URL in the form even if preview fails
      // Don't clear imagePreview to avoid losing the URL
      if (e?.currentTarget) {
        e.currentTarget.style.display = 'none'
      }
    } catch (error) {
      // Silently handle any errors
      console.warn('Image preview error:', error)
    }
  }

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        // Search filter
        const keyword = searchTerm.trim().toLowerCase()
        if (keyword) {
          const matchesSearch =
            product.name.toLowerCase().includes(keyword) ||
            product.slug.toLowerCase().includes(keyword) ||
            product.categoryName?.toLowerCase().includes(keyword)
          if (!matchesSearch) return false
        }

        // Category filter
        if (selectedCategoryId !== undefined && product.categoryId !== selectedCategoryId) {
          return false
        }

        // Stock filter
        if (stockFilter === 'inStock' && product.stock <= 0) {
          return false
        }
        if (stockFilter === 'lowStock' && (product.stock <= 0 || product.stock > 10)) {
          return false
        }
        if (stockFilter === 'outOfStock' && product.stock > 0) {
          return false
        }

        return true
      }),
    [products, searchTerm, selectedCategoryId, stockFilter],
  )

  return (
    <div className="grid" style={{ gap: '2rem' }}>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <p className="tag" style={{ marginBottom: '0.25rem' }}>
              {formMode === 'edit' ? 'Chỉnh sửa' : 'Thêm mới'}
            </p>
            <h3 style={{ margin: 0 }}>
              {formMode === 'edit' ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isFormOpen && (
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                Đóng form
              </Button>
            )}
            <Button type="button" iconLeft={<PlusCircle size={16} />} onClick={handleAddProductClick}>
              Thêm sản phẩm
            </Button>
          </div>
        </div>
          <div
            style={{
              padding: '1.25rem',
              background: 'rgba(248,250,252,0.8)',
              borderRadius: 'var(--radius)',
              border: '1px dashed var(--border)',
              color: 'var(--muted)',
            }}
          >
            Biểu mẫu thêm/chỉnh sửa sẽ mở ở giữa màn hình. Nhấn nút <strong>Thêm sản phẩm</strong> hoặc nút <strong>Sửa</strong> trong bảng để hiển thị biểu mẫu.
          </div>
      </div>

      <Modal
        open={isFormOpen}
        onClose={handleCloseForm}
        title={formMode === 'edit' ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
        width={720}
      >
        <form className="grid" style={{ gap: '1rem' }} onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Tên sản phẩm *"
            placeholder="VD: Bánh Tiramisu"
            {...register('name')}
            error={errors.name?.message}
          />
          <Input
            label="Slug (tự động tạo nếu để trống)"
            placeholder="banh-tiramisu"
            {...register('slug')}
            onBlur={(event) => setValue('slug', toSlug(event.target.value))}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1rem' }}>
            <Input
              label="Giá (VNĐ) *"
              type="number"
              step="1000"
              placeholder="50000"
              {...register('price', { valueAsNumber: true })}
              error={errors.price?.message}
            />
            <Input
              label="Tồn kho *"
              type="number"
              placeholder="100"
              {...register('stock', { valueAsNumber: true })}
              error={errors.stock?.message}
            />
          </div>

          {/* Image Upload Section */}
          <div className="form-field">
            <label>Ảnh sản phẩm *</label>
            <div
              style={{
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius)',
                padding: '1.5rem',
                textAlign: 'center',
                background: '#f8fafc',
                position: 'relative',
              }}
            >
              {imagePreview || currentImage ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  {!imageError ? (
                    <img
                      src={imagePreview || currentImage || '/placeholder.png'}
                      alt="Preview"
                      crossOrigin="anonymous"
                      onError={handleImageError}
                      loading="lazy"
                      style={{
                        maxWidth: '100%',
                        maxHeight: 200,
                        borderRadius: 'var(--radius)',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        minHeight: 200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f3f4f6',
                        borderRadius: 'var(--radius)',
                        color: 'var(--muted)',
                        flexDirection: 'column',
                        gap: '0.5rem',
                      }}
                    >
                      <ImageIcon size={48} color="var(--muted)" />
                      <p style={{ margin: 0, fontSize: '0.9rem' }}>
                        Không thể tải ảnh (URL: {currentImage?.substring(0, 30)}...)
                      </p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      background: '#dc2626',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div>
                  <ImageIcon size={48} color="var(--muted)" style={{ marginBottom: '0.5rem' }} />
                  <p style={{ color: 'var(--muted)', margin: '0.5rem 0' }}>
                    Chọn ảnh để tải lên (JPG, PNG, max 5MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={uploading}
                    style={{ display: 'none' }}
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button
                      type="button"
                      variant="outline"
                      iconLeft={<Upload size={16} />}
                      disabled={uploading}
                      style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploading ? 'Đang tải lên...' : 'Chọn ảnh'}
                    </Button>
                  </label>
                </div>
              )}
            </div>
            {errors.image && <span className="form-error">{errors.image.message}</span>}
            {currentImage && !imagePreview && (
              <small style={{ color: 'var(--muted)', fontSize: '0.8rem', display: 'block', marginTop: '0.25rem' }}>
                URL hiện tại: {currentImage.substring(0, 50)}...
              </small>
            )}
          </div>

          <Select
            label="Danh mục *"
            {...register('categoryId', { valueAsNumber: true })}
            error={errors.categoryId?.message}
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <div className="form-field">
            <label>Mô tả</label>
            <textarea
              rows={3}
              placeholder="Mô tả chi tiết về sản phẩm..."
              {...register('description')}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1rem' }}>
            <Input
              label="Trọng lượng"
              placeholder="VD: 500g, 1kg, 1 cái"
              {...register('weight')}
            />
            <Input
              label="Đơn vị"
              placeholder="VD: cái, hộp, kg"
              {...register('unit')}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1rem' }}>
            <Input
              label="Hạn sử dụng"
              placeholder="VD: 3 ngày, 1 tuần"
              {...register('shelfLife')}
            />
            <div />
          </div>

          <div className="form-field">
            <label>Thành phần</label>
            <textarea
              rows={3}
              placeholder="VD: Bột mì, đường, trứng, sữa, bơ..."
              {...register('ingredients')}
            />
          </div>

          <div className="form-field">
            <label>Dị ứng</label>
            <Input
              placeholder="VD: Gluten, Trứng, Sữa"
              {...register('allergens')}
            />
          </div>

          <div className="form-field">
            <label>Hướng dẫn bảo quản</label>
            <textarea
              rows={2}
              placeholder="VD: Bảo quản trong tủ lạnh, sử dụng trong 3 ngày..."
              {...register('storageInstructions')}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="isFeatured"
                {...register('isFeatured')}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              <label htmlFor="isFeatured" style={{ cursor: 'pointer', fontWeight: 500 }}>
                Sản phẩm nổi bật
              </label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="isActive"
                {...register('isActive')}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              <label htmlFor="isActive" style={{ cursor: 'pointer', fontWeight: 500 }}>
                Đang bán
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button type="button" variant="outline" onClick={formMode === 'edit' ? handleCancelEdit : handleCloseForm}>
              {formMode === 'edit' ? 'Hủy' : 'Đóng'}
            </Button>
            <Button type="submit" disabled={upsertMutation.isPending || uploading}>
              {upsertMutation.isPending
                ? 'Đang lưu...'
                : editingId
                  ? 'Cập nhật'
                  : 'Thêm mới'}
            </Button>
          </div>
        </form>
      </Modal>

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
          <h3 style={{ margin: 0 }}>Danh sách sản phẩm ({filteredProducts.length})</h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <Input
              label="Tìm kiếm"
              placeholder="Tìm theo tên, slug hoặc danh mục..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              style={{ minWidth: '200px' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--muted)', fontWeight: 500 }}>Danh mục</label>
              <Select
                value={selectedCategoryId ?? ''}
                onChange={(e) => setSelectedCategoryId(e.target.value ? Number(e.target.value) : undefined)}
                style={{ minWidth: '150px' }}
              >
                <option value="">Tất cả</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--muted)', fontWeight: 500 }}>Tồn kho</label>
              <Select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as typeof stockFilter)}
                style={{ minWidth: '150px' }}
              >
                <option value="all">Tất cả</option>
                <option value="inStock">Còn hàng</option>
                <option value="lowStock">Tồn kho thấp (≤10)</option>
                <option value="outOfStock">Hết hàng</option>
              </Select>
            </div>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tên</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Tồn kho</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  <img
                    src={product.image || '/placeholder.png'}
                    alt={product.name}
                    crossOrigin="anonymous"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder.png'
                    }}
                    style={{
                      width: 48,
                      height: 48,
                      objectFit: 'cover',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                </td>
                <td style={{ fontWeight: 600 }}>{product.name}</td>
                <td>
                  <span className="tag">{product.categoryName}</span>
                </td>
                <td>{formatCurrency(product.price)}</td>
                <td>
                  <span
                    className={`pill ${product.stock > 10 ? 'pill-success' : product.stock > 0 ? 'pill-warning' : 'pill-danger'}`}
                  >
                    {product.stock}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <Button
                      type="button"
                      variant="text"
                      onClick={() => setViewProduct(product)}
                      iconLeft={<Eye size={16} />}
                    >
                      Xem
                    </Button>
                    <Button
                      type="button"
                      variant="text"
                      onClick={() => handleEdit(product)}
                      iconLeft={<Pencil size={16} />}
                    >
                      Sửa
                    </Button>
                    <Button
                      type="button"
                      variant="text"
                      onClick={() => setDeleteTarget(product)}
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

      {/* Product Detail Modal */}
      <Modal
        open={Boolean(viewProduct)}
        onClose={() => setViewProduct(null)}
        title="Chi tiết sản phẩm"
        width={560}
      >
        {viewProduct && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                height: 240,
                background: '#fff5f5',
              }}
            >
              <img
                src={viewProduct.image || '/placeholder.png'}
                alt={viewProduct.name}
                crossOrigin="anonymous"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/placeholder.png'
                }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <span className="tag">{viewProduct.categoryName}</span>
              <h2 style={{ margin: '0.5rem 0' }}>{viewProduct.name}</h2>
              <p style={{ color: 'var(--muted)', margin: 0 }}>
                {viewProduct.description || 'Không có mô tả'}
              </p>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '1rem',
                padding: '1rem',
                background: '#f8fafc',
                borderRadius: 'var(--radius)',
              }}
            >
              <div>
                <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Giá bán</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>
                    {formatCurrency(viewProduct.price)}
                  </strong>
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Tồn kho</div>
                <strong style={{ fontSize: '1.25rem' }}>{viewProduct.stock}</strong>
              </div>
              <div>
                <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Slug</div>
                <code style={{ fontSize: '0.9rem' }}>{viewProduct.slug}</code>
              </div>
              {viewProduct.weight && (
                <div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Trọng lượng</div>
                  <strong>{viewProduct.weight} {viewProduct.unit || ''}</strong>
                </div>
              )}
              {viewProduct.shelfLife && (
                <div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Hạn sử dụng</div>
                  <strong>{viewProduct.shelfLife}</strong>
                </div>
              )}
              {viewProduct.createdAt && (
                <div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Ngày tạo</div>
                  <strong>{formatDate(viewProduct.createdAt)}</strong>
                </div>
              )}
              <div>
                <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Trạng thái</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className={`pill ${viewProduct.isActive ? 'pill-success' : 'pill-danger'}`}>
                    {viewProduct.isActive ? 'Đang bán' : 'Ngừng bán'}
                  </span>
                  {viewProduct.isFeatured && (
                    <span className="pill pill-warning">Nổi bật</span>
                  )}
                </div>
              </div>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1rem',
                padding: '1rem',
                background: '#fff',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
              }}
            >
              {viewProduct.ingredients && (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '0.35rem' }}>Thành phần</div>
                  <p style={{ margin: 0, color: 'var(--text)', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                    {viewProduct.ingredients}
                  </p>
                </div>
              )}
              {viewProduct.allergens && (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '0.35rem', color: '#dc2626' }}>Dị ứng</div>
                  <p style={{ margin: 0, color: '#dc2626', lineHeight: 1.5 }}>{viewProduct.allergens}</p>
                </div>
              )}
              {viewProduct.storageInstructions && (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '0.35rem' }}>Bảo quản</div>
                  <p style={{ margin: 0, color: 'var(--text)', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                    {viewProduct.storageInstructions}
                  </p>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button
                type="button"
                onClick={() => {
                  handleEdit(viewProduct)
                  setViewProduct(null)
                }}
                iconLeft={<Pencil size={16} />}
              >
                Chỉnh sửa
              </Button>
              <Button type="button" variant="outline" onClick={() => setViewProduct(null)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xác nhận xóa sản phẩm"
        message={`Bạn có chắc muốn xóa sản phẩm "${deleteTarget?.name}"? Hành động này không thể hoàn tác. Lưu ý: Sản phẩm đã có trong đơn hàng sẽ không thể xóa.`}
        confirmLabel="Xóa sản phẩm"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
