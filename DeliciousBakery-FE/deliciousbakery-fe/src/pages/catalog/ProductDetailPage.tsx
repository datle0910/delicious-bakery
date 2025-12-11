import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Package, ShoppingCart, Plus, Minus, CheckCircle, AlertCircle, Calendar, Tag, Star, Info, Scale, Thermometer, Award, ArrowLeft } from 'lucide-react'
import { fetchProductById, fetchProducts } from '../../api/products'
import { useCartActions } from '../../hooks/useCartActions'
import { Button } from '../../components/ui/Button'
import { formatCurrency, formatDate } from '../../utils/format'
import { EmptyState } from '../../components/ui/EmptyState'
import { ReviewSection } from '../../components/catalog/ReviewSection'
import { ProductCard } from '../../components/catalog/ProductCard'
import { toast } from 'react-hot-toast'

export const ProductDetailPage = () => {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCartActions()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', productId],
    enabled: Boolean(productId),
    queryFn: () => fetchProductById(Number(productId)),
  })

  // Fetch related products from the same category
  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['products', 'related', data?.categoryId],
    enabled: Boolean(data?.categoryId),
    queryFn: () => fetchProducts({ categoryId: data!.categoryId }),
  })

  // Filter out current product and limit to 4
  const related = useMemo(
    () => relatedProducts.filter((p) => p.id !== data?.id).slice(0, 4),
    [relatedProducts, data?.id],
  )

  const handleAddToCart = async () => {
    if (!data) return
    if (data.stock < quantity) {
      toast.error(`Chỉ còn ${data.stock} sản phẩm trong kho`)
      return
    }
    await addToCart(data, quantity)
  }

  const increaseQuantity = () => {
    if (data && quantity < data.stock) {
      setQuantity(quantity + 1)
    } else if (data) {
      toast.error(`Chỉ còn ${data.stock} sản phẩm trong kho`)
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>Đang tải thông tin sản phẩm...</p>
      </div>
    )
  }

  if (isError || !data) {
    return <EmptyState title="Không tìm thấy sản phẩm" description="Sản phẩm có thể đã bị xóa hoặc tạm dừng bán." />
  }

  const isInStock = data.stock > 0
  const isLowStock = data.stock > 0 && data.stock <= 10

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Back Button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => navigate('/products')}
        iconLeft={<ArrowLeft size={16} />}
        style={{ alignSelf: 'flex-start' }}
      >
        Quay lại danh sách sản phẩm
      </Button>

      {/* Breadcrumb */}
      <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--muted)' }}>
        <Link to="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>
          Trang chủ
        </Link>
        {' / '}
        <Link to="/products" style={{ color: 'var(--muted)', textDecoration: 'none' }}>
          Sản phẩm
        </Link>
        {data.categoryName && (
          <>
            {' / '}
            <Link
              to={`/products?category=${data.categoryId}`}
              style={{ color: 'var(--muted)', textDecoration: 'none' }}
            >
              {data.categoryName}
            </Link>
          </>
        )}
        {' / '}
        <span style={{ color: 'var(--foreground)' }}>{data.name}</span>
      </div>

      {/* Hero layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1fr) minmax(320px, 0.9fr)',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        <div
          className="card"
          style={{
            padding: 0,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
          }}
        >
          <img
            src={data.image || '/placeholder.png'}
            alt={data.name}
            style={{ width: '100%', height: '100%', minHeight: 460, objectFit: 'cover', display: 'block' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link
              to={`/products?category=${data.categoryId}`}
              className="tag"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Tag size={14} />
              {data.categoryName}
            </Link>
              <span
              className={`pill ${isInStock ? 'pill-success' : 'pill-danger'}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
              {isInStock ? (
                <>
                <CheckCircle size={14} />
                {isLowStock ? `Còn ${data.stock} sản phẩm` : 'Còn hàng'}
                </>
            ) : (
                <>
                <AlertCircle size={14} />
                Hết hàng
                </>
              )}
              </span>
            {data.createdAt && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--muted)' }}>
                <Calendar size={14} />
                {formatDate(data.createdAt)}
              </span>
            )}
            {data.isFeatured && (
              <span className="pill pill-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Award size={14} />
                Nổi bật
              </span>
            )}
          </div>

          <h1 style={{ margin: 0, fontSize: '2.4rem', lineHeight: 1.2 }}>{data.name}</h1>

          {data.description && (
            <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.7 }}>{data.description}</p>
          )}

          <div
            className="card"
            style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              position: 'sticky',
              top: 80,
              background: 'linear-gradient(135deg, #eef2ff, #f8fafc)',
              boxShadow: '0 12px 32px rgba(15,23,42,0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
              <strong style={{ fontSize: '2.2rem', color: 'var(--primary)', lineHeight: 1 }}>
                {formatCurrency(data.price)}
              </strong>
              <span style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
                {data.unit ? `(${data.unit})` : 'Giá đã bao gồm VAT'}
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                alignItems: 'stretch',
              }}
            >
              <div
                style={{
                  padding: '0.9rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  background: '#fff',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Kho</div>
                <div style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
                  {isInStock ? `${data.stock} sản phẩm` : 'Tạm hết'}
                </div>
          </div>
              <div
                style={{
                  padding: '0.9rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  background: '#fff',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Giao hàng</div>
                <div style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>Miễn phí từ 5 sản phẩm</div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Số lượng</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '2px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  overflow: 'hidden',
                }}
              >
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  style={{
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: quantity <= 1 ? '#f3f4f6' : '#fff',
                    cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    color: quantity <= 1 ? 'var(--muted)' : 'var(--foreground)',
                  }}
                >
                  <Minus size={18} />
                </button>
                <input
                  type="number"
                  min={1}
                  max={data.stock}
                  value={quantity}
                  onChange={(e) => {
                    const val = Math.max(1, Math.min(data.stock, Number(e.target.value) || 1))
                    setQuantity(val)
                  }}
                  style={{
                    width: 80,
                    border: 'none',
                    padding: '0.75rem',
                    textAlign: 'center',
                    fontSize: '1rem',
                    fontWeight: 600,
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={!isInStock || quantity >= data.stock}
                  style={{
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: !isInStock || quantity >= data.stock ? '#f3f4f6' : '#fff',
                    cursor: !isInStock || quantity >= data.stock ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    color: !isInStock || quantity >= data.stock ? 'var(--muted)' : 'var(--foreground)',
                  }}
                >
                  <Plus size={18} />
                </button>
              </div>
              <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                Tối đa {data.stock} sản phẩm
              </span>
            </div>
          </div>

          <Button
              style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.05rem', fontWeight: 650 }}
            onClick={handleAddToCart}
            disabled={!isInStock}
            iconLeft={<ShoppingCart size={20} />}
          >
            {isInStock ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
          </Button>
          </div>
        </div>
      </div>

      {/* Specs & info */}
      <div
        className="card"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          padding: '1.25rem',
        }}
      >
        <InfoTile label="Mã sản phẩm" value={`#${data.id.toString().padStart(6, '0')}`} />
        <InfoTile
          label="Danh mục"
          value={
            <Link to={`/products?category=${data.categoryId}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
              {data.categoryName}
            </Link>
          }
        />
        <InfoTile label="Tình trạng" value={isInStock ? 'Còn hàng' : 'Hết hàng'} />
        {data.weight && <InfoTile label="Trọng lượng" value={`${data.weight} ${data.unit || ''}`} />}
        {data.shelfLife && <InfoTile label="Hạn sử dụng" value={data.shelfLife} />}
        {data.storageInstructions && (
          <InfoTile label="Bảo quản" value={<span style={{ whiteSpace: 'pre-line' }}>{data.storageInstructions}</span>} />
          )}
      </div>

      {(data.ingredients || data.allergens) && (
        <div className="card" style={{ padding: '1.25rem', display: 'grid', gap: '1rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Info size={20} color="var(--primary)" />
            Thành phần & Dị ứng
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1rem' }}>
            {data.ingredients && (
              <div style={{ background: '#f8fafc', borderRadius: 'var(--radius)', padding: '1rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Scale size={16} />
                  Thành phần
                </div>
                <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{data.ingredients}</p>
              </div>
            )}
            {data.allergens && (
              <div style={{ background: '#fef2f2', borderRadius: 'var(--radius)', padding: '1rem', border: '1px solid #fecaca' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#dc2626' }}>
                  <AlertCircle size={16} />
                  Dị ứng
                </div>
                <p style={{ margin: 0, color: '#dc2626', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{data.allergens}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Related Products */}
      {related.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Star size={24} color="var(--primary)" />
            Sản phẩm liên quan
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {related.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={() => addToCart(product, 1)} />
            ))}
          </div>
        </div>
      )}

      {/* Review Section */}
      {productId && <ReviewSection productId={Number(productId)} />}
    </div>
  )
}

const InfoTile = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div
    style={{
      padding: '0.75rem 0.9rem',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      background: '#fff',
    }}
  >
    <div style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '0.2rem' }}>{label}</div>
    <div style={{ fontWeight: 600 }}>{value}</div>
  </div>
)

