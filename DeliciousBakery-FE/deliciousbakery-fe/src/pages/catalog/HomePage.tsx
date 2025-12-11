import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchCategories } from '../../api/categories'
import { fetchProducts } from '../../api/products'
import { ProductCard } from '../../components/catalog/ProductCard'
import { EmptyState } from '../../components/ui/EmptyState'
import { useCartActions } from '../../hooks/useCartActions'
import { useDebounce } from '../../hooks/useDebounce'

export const HomePage = () => {
  const [keyword, setKeyword] = useState('')
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined)
  const debouncedKeyword = useDebounce(keyword)
  const { addToCart } = useCartActions()

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', { keyword: debouncedKeyword, categoryId }],
    queryFn: () =>
      fetchProducts({
        search: debouncedKeyword || undefined,
        categoryId,
      }),
  })

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', background: 'linear-gradient(135deg,#fff7ed,#ffe4e6)' }}>
        <p className="tag" style={{ justifyContent: 'center' }}>
          Ngọt ngào mỗi ngày
        </p>
        <h1 style={{ fontSize: '2.7rem', marginBottom: '0.5rem' }}>Trải nghiệm tiệm bánh hiện đại</h1>
        <p style={{ color: '#475569', maxWidth: 520, margin: '0 auto' }}>
          Duyệt sản phẩm, quản lý giỏ hàng và thanh toán chỉ với vài cú click. Admin có thể điều hành tất cả trong một bảng điều khiển.
        </p>
      </div>

      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <input
          type="search"
          placeholder="Tìm kiếm bánh, hương vị..."
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          style={{ flex: 1, minWidth: 220, borderRadius: '999px', border: '1px solid var(--border)', padding: '0.75rem 1.25rem' }}
        />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className={`btn ${!categoryId ? 'btn-primary' : 'btn-outline'}`}
            type="button"
            onClick={() => setCategoryId(undefined)}
          >
            Tất cả
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`btn ${categoryId === category.id ? 'btn-primary' : 'btn-outline'}`}
              type="button"
              onClick={() => setCategoryId(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p>Đang tải danh sách sản phẩm...</p>
      ) : products.length ? (
        <div
          className="grid"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gridAutoRows: '1fr',
            gap: '1.5rem',
          }}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={() => addToCart(product, 1)} />
          ))}
        </div>
      ) : (
        <EmptyState title="Chưa có sản phẩm phù hợp" description="Hãy thử bộ lọc khác hoặc quay lại sau nhé!" />
      )}
    </section>
  )
}

