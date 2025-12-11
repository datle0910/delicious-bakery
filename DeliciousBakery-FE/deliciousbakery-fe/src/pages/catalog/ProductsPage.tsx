import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react'
import { fetchCategories } from '../../api/categories'
import { fetchProducts } from '../../api/products'
import { ProductCard } from '../../components/catalog/ProductCard'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useCartActions } from '../../hooks/useCartActions'
import { useDebounce } from '../../hooks/useDebounce'

// Animation styles
const productPageAnimations = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .product-stagger { opacity: 0; }
  .product-stagger-1 { animation: fadeInUp 0.4s ease-out 0.03s forwards; }
  .product-stagger-2 { animation: fadeInUp 0.4s ease-out 0.06s forwards; }
  .product-stagger-3 { animation: fadeInUp 0.4s ease-out 0.09s forwards; }
  .product-stagger-4 { animation: fadeInUp 0.4s ease-out 0.12s forwards; }
  .product-stagger-5 { animation: fadeInUp 0.4s ease-out 0.15s forwards; }
  .product-stagger-6 { animation: fadeInUp 0.4s ease-out 0.18s forwards; }
  .search-input-focus { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
  .search-input-focus:focus { box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1); }
`

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [keyword, setKeyword] = useState(searchParams.get('search') || '')
  const [categoryId, setCategoryId] = useState<number | undefined>(
    searchParams.get('category') ? Number(searchParams.get('category')) : undefined,
  )
  const [minPrice, setMinPrice] = useState<string>(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get('maxPrice') || '')
  const [inStockOnly, setInStockOnly] = useState(false)
  const debouncedKeyword = useDebounce(keyword)
  const { addToCart } = useCartActions()

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetchProducts(),
  })

  // Advanced filtering (client-side)
  const filteredProducts = useMemo(() => {
    const kw = debouncedKeyword.trim().toLowerCase()
    let filtered = [...allProducts]

    if (kw) {
      filtered = filtered.filter((p) => {
        const haystack = [
          p.name,
          p.description,
          p.slug,
          p.categoryName,
          p.ingredients,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return haystack.includes(kw)
      })
    }

    if (categoryId) {
      filtered = filtered.filter((p) => p.categoryId === categoryId)
    }

    if (minPrice) {
      const min = Number(minPrice)
      if (!isNaN(min)) filtered = filtered.filter((p) => p.price >= min)
    }
    if (maxPrice) {
      const max = Number(maxPrice)
      if (!isNaN(max)) filtered = filtered.filter((p) => p.price <= max)
    }

    if (inStockOnly) {
      filtered = filtered.filter((p) => p.stock > 0)
    }

    return filtered
  }, [allProducts, debouncedKeyword, categoryId, minPrice, maxPrice, inStockOnly])

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedKeyword) params.set('search', debouncedKeyword)
    if (categoryId) params.set('category', categoryId.toString())
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (inStockOnly) params.set('inStock', 'true')
    setSearchParams(params, { replace: true })
  }, [debouncedKeyword, categoryId, minPrice, maxPrice, inStockOnly, setSearchParams])

  // Sync state when navigation updates query params (e.g., search from navbar)
  useEffect(() => {
    setKeyword(searchParams.get('search') || '')
    setCategoryId(searchParams.get('category') ? Number(searchParams.get('category')) : undefined)
    setMinPrice(searchParams.get('minPrice') || '')
    setMaxPrice(searchParams.get('maxPrice') || '')
    setInStockOnly(searchParams.get('inStock') === 'true')
  }, [searchParams])

  const handleResetFilters = () => {
    setKeyword('')
    setCategoryId(undefined)
    setMinPrice('')
    setMaxPrice('')
    setInStockOnly(false)
    setSearchParams({}, { replace: true })
  }

  const hasActiveFilters =
    debouncedKeyword || categoryId || minPrice || maxPrice || inStockOnly

  return (
    <>
      <style>{productPageAnimations}</style>
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Search + quick toggles */}
        <div className="card product-fade-in" style={{ display: 'grid', gap: '0.9rem' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}
            />
            <input
              type="search"
              placeholder="Tìm kiếm bánh, hương vị, nguyên liệu..."
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              className="search-input-focus"
              style={{
                width: '100%',
                padding: '0.85rem 2.8rem 0.85rem 2.7rem',
                borderRadius: '999px',
                border: '1px solid var(--border)',
                outline: 'none',
              }}
            />
            {keyword && (
              <button
                type="button"
                onClick={() => setKeyword('')}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--muted)',
                  padding: 4,
                }}
                aria-label="Xóa từ khóa"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <SlidersHorizontal size={16} />
                <span style={{ fontWeight: 600 }}>Bộ lọc nhanh</span>
              </div>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontWeight: 500 }}>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  style={{ width: 16, height: 16 }}
                />
                Còn hàng
              </label>
            </div>
            {hasActiveFilters && (
              <Button type="button" variant="outline" onClick={handleResetFilters} iconLeft={<X size={16} />}>
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </div>

        {/* Category pills */}
        <div
          className="card product-fade-in"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            padding: '1rem',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <Filter size={16} />
              Danh mục
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCategoryId(undefined)}
              disabled={!categoryId}
            >
              Bỏ chọn
            </Button>
          </div>
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.25rem',
              scrollbarWidth: 'thin',
            }}
          >
            <CategoryPill
              active={!categoryId}
              label="Tất cả"
              onClick={() => setCategoryId(undefined)}
            />
            {categories.map((category) => (
              <CategoryPill
                key={category.id}
                active={categoryId === category.id}
                label={category.name}
                onClick={() => setCategoryId(category.id)}
              />
            ))}
          </div>
        </div>

        {/* Price range */}
        <div className="card product-fade-in" style={{ display: 'grid', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <SlidersHorizontal size={16} />
            Khoảng giá (VNĐ)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '0.75rem' }}>
            <Input
              label="Từ"
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <Input
              label="Đến"
              type="number"
              placeholder="1,000,000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div
            className="card product-fade-in"
            style={{
              padding: '0.75rem 1rem',
              background: '#fef3c7',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Bộ lọc đang áp dụng:</span>
              {debouncedKeyword && (
                <span className="pill pill-warning" style={{ fontSize: '0.85rem' }}>
                  Tên: {debouncedKeyword}
                </span>
              )}
              {categoryId && (
                <span className="pill pill-warning" style={{ fontSize: '0.85rem' }}>
                  Danh mục: {categories.find((c) => c.id === categoryId)?.name}
                </span>
              )}
              {minPrice && (
                <span className="pill pill-warning" style={{ fontSize: '0.85rem' }}>
                  Giá từ: {Number(minPrice).toLocaleString('vi-VN')}đ
                </span>
              )}
              {maxPrice && (
                <span className="pill pill-warning" style={{ fontSize: '0.85rem' }}>
                  Giá đến: {Number(maxPrice).toLocaleString('vi-VN')}đ
                </span>
              )}
              {inStockOnly && (
                <span className="pill pill-warning" style={{ fontSize: '0.85rem' }}>
                  Còn hàng
                </span>
              )}
            </div>
          </div>
        )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div
          className="card product-fade-in"
          style={{
            padding: '0.75rem 1rem',
            background: '#fef3c7',
            animationDelay: '0.2s',
            opacity: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Bộ lọc đang áp dụng:</span>
            {debouncedKeyword && (
              <span className="pill pill-warning" style={{ fontSize: '0.85rem' }}>
                Tên: {debouncedKeyword}
              </span>
            )}
            {categoryId && (
              <span className="pill pill-warning" style={{ fontSize: '0.85rem' }}>
                Danh mục: {categories.find((c) => c.id === categoryId)?.name}
              </span>
            )}
            {minPrice && (
              <span className="pill pill-warning" style={{ fontSize: '0.85rem' }}>
                Giá từ: {Number(minPrice).toLocaleString('vi-VN')}đ
              </span>
            )}
            {maxPrice && (
              <span className="pill pill-warning" style={{ fontSize: '0.85rem' }}>
                Giá đến: {Number(maxPrice).toLocaleString('vi-VN')}đ
              </span>
            )}
            {inStockOnly && (
              <span className="pill pill-warning" style={{ fontSize: '0.85rem' }}>
                Còn hàng
              </span>
            )}
          </div>
        </div>
      )}

      {/* Results Count */}
      {!isLoading && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: 'var(--muted)', margin: 0 }}>
            Tìm thấy <strong>{filteredProducts.length}</strong> sản phẩm
          </p>
        </div>
      )}

      {/* Products Grid */}
      {isLoading ? (
        <p className="product-fade-in">Đang tải danh sách sản phẩm...</p>
      ) : filteredProducts.length ? (
        <div
          className="grid"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredProducts.map((product, index) => {
            const staggerClass = `product-stagger-${Math.min((index % 6) + 1, 6)}`
            return (
              <div key={product.id} className={`product-stagger ${staggerClass}`}>
                <ProductCard product={product} onAddToCart={() => addToCart(product, 1)} />
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          title="Chưa có sản phẩm phù hợp"
          description="Hãy thử bộ lọc khác hoặc quay lại sau nhé!"
          actionLabel="Xóa bộ lọc"
          onAction={handleResetFilters}
        />
      )}
    </section>
    </>
  )
}

export default ProductsPage

const CategoryPill = ({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      borderRadius: '999px',
      border: active ? '1px solid transparent' : '1px solid var(--border)',
      background: active ? 'linear-gradient(135deg, #fb923c, #f97316)' : '#fff',
      color: active ? '#fff' : 'var(--foreground)',
      padding: '0.45rem 0.9rem',
      fontWeight: 600,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      boxShadow: active ? '0 6px 18px rgba(249,115,22,0.35)' : 'none',
      transition: 'all 0.2s ease',
    }}
  >
    {label}
  </button>
)
