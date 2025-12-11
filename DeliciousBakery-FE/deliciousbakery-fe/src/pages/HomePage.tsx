import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchProducts } from '../api/products'
import { fetchCategories } from '../api/categories'
import { fetchReviews } from '../api/reviews'
import type { Product, Review } from '../types'
import { useCartActions } from '../hooks/useCartActions'
import { ProductCard } from '../components/catalog/ProductCard'
// Removed unused imports: formatCurrency, Modal, Button, Plus, Minus

// Animation styles
const animationStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out forwards;
  }
  
  .animate-fade-in {
    animation: fadeIn 0.8s ease-out forwards;
  }
  
  .animate-slide-in-right {
    animation: slideInRight 0.6s ease-out forwards;
  }
  
  .animate-scale-in {
    animation: scaleIn 0.5s ease-out forwards;
  }
  
  .animate-stagger-1 {
    animation: fadeInUp 0.6s ease-out 0.1s forwards;
    opacity: 0;
  }
  
  .animate-stagger-2 {
    animation: fadeInUp 0.6s ease-out 0.2s forwards;
    opacity: 0;
  }
  
  .animate-stagger-3 {
    animation: fadeInUp 0.6s ease-out 0.3s forwards;
    opacity: 0;
  }
  
  .animate-stagger-4 {
    animation: fadeInUp 0.6s ease-out 0.4s forwards;
    opacity: 0;
  }
  
  .hero-slide-content {
    transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
  }
  
  .hero-slide-enter {
    opacity: 0;
    transform: translateX(20px);
  }
  
  .hero-slide-active {
    opacity: 1;
    transform: translateX(0);
  }
  
  .card-hover {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .card-hover:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }
`

const heroSlides = [
  {
    title: 'Bánh tươi mỗi ngày',
    subtitle: 'Ngọt ngào cho mọi khoảnh khắc',
    description: 'Từ bánh sinh nhật đến bánh trà chiều, tất cả đều được làm mới trong ngày với nguyên liệu cao cấp.',
    cta: 'Khám phá menu',
    to: '/products',
    accent: '#f97316',
  },
  {
    title: 'Ưu đãi cho đơn đầu tiên',
    subtitle: 'Giảm 10% cho khách mới',
    description: 'Đăng ký tài khoản và đặt bánh đầu tiên để nhận ngay ưu đãi hấp dẫn từ DeliciousBakery.',
    cta: 'Đăng ký ngay',
    to: '/register',
    accent: '#ec4899',
  },
  {
    title: 'Giao hàng siêu tốc',
    subtitle: 'Trong 2–4 giờ tại nội thành',
    description: 'Hệ thống giao hàng chuyên dụng, đảm bảo bánh luôn giữ nguyên độ lạnh và hình dáng khi đến tay bạn.',
    cta: 'Đặt bánh ngay',
    to: '/products',
    accent: '#22c55e',
  },
]

export const HomePage = () => {
  const { addToCart } = useCartActions()
  const [activeSlide, setActiveSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  // Removed unused quick add states

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products', 'home'],
    queryFn: () => fetchProducts(),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', 'home'],
    queryFn: fetchCategories,
  })

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ['reviews', 'home'],
    queryFn: fetchReviews,
  })

  // Auto-rotate hero slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length)
        setIsTransitioning(false)
      }, 300)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const handleSlideChange = (index: number) => {
    if (index !== activeSlide) {
      setIsTransitioning(true)
      setTimeout(() => {
        setActiveSlide(index)
        setIsTransitioning(false)
      }, 300)
    }
  }

  const newArrivals = useMemo(
    () =>
      [...products]
        .filter((p) => p.createdAt)
        .sort(
          (a, b) =>
            new Date(b.createdAt ?? '').getTime() - new Date(a.createdAt ?? '').getTime(),
        )
        .slice(0, 4),
    [products],
  )

  // Approximate bestsellers: products with lowest stock (đã bán nhiều)
  const bestsellers = useMemo(
    () =>
      [...products]
        .slice()
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 4),
    [products],
  )

  // Highest rated from reviews
  const topRated = useMemo(() => {
    if (!reviews.length || !products.length) return []

    const ratingMap = new Map<
      number,
      {
        total: number
        count: number
      }
    >()

    reviews.forEach((review) => {
      const entry = ratingMap.get(review.productId) ?? { total: 0, count: 0 }
      entry.total += review.rating
      entry.count += 1
      ratingMap.set(review.productId, entry)
    })

    const scored = Array.from(ratingMap.entries())
      .map(([productId, value]) => ({
        productId,
        avg: value.total / value.count,
        count: value.count,
      }))
      .filter((x) => x.count >= 1)
      .sort((a, b) => {
        if (b.avg === a.avg) return b.count - a.count
        return b.avg - a.avg
      })
      .slice(0, 4)

    return scored
      .map((s) => products.find((p) => p.id === s.productId))
      .filter((p): p is Product => Boolean(p))
  }, [products, reviews])

  const featuredCategories = useMemo(() => categories.slice(0, 4), [categories])

  return (
    <>
      <style>{animationStyles}</style>
    <section style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Hero Slideshow / Banner */}
      <div
          className="card animate-fade-in"
        style={{
          padding: '2.5rem',
          background:
            'radial-gradient(circle at top left, #ffe4e6, transparent 55%), radial-gradient(circle at bottom right, #fef9c3, transparent 55%)',
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)',
          gap: '2rem',
          alignItems: 'center',
        }}
      >
          <div
            className="hero-slide-content"
            style={{
              opacity: isTransitioning ? 0 : 1,
              transform: isTransitioning ? 'translateX(20px)' : 'translateX(0)',
            }}
          >
          <p className="tag" style={{ justifyContent: 'flex-start' }}>
            DeliciousBakery
          </p>
          <p style={{ color: '#f97316', fontWeight: 600, marginBottom: '0.25rem' }}>
            {heroSlides[activeSlide].subtitle}
          </p>
          <h1 style={{ fontSize: '2.8rem', lineHeight: 1.1, marginBottom: '0.75rem' }}>
            {heroSlides[activeSlide].title}
          </h1>
          <p style={{ color: 'var(--muted)', maxWidth: 520, marginBottom: '1.5rem' }}>
            {heroSlides[activeSlide].description}
          </p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link
              to={heroSlides[activeSlide].to}
              className="btn btn-primary"
              style={{
                textDecoration: 'none',
                backgroundColor: heroSlides[activeSlide].accent,
                borderColor: heroSlides[activeSlide].accent,
                transition: 'background-color 0.3s ease, border-color 0.3s ease, transform 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {heroSlides[activeSlide].cta}
            </Link>
            <Link
              to="/about"
              className="btn btn-outline"
              style={{ textDecoration: 'none' }}
            >
              Về DeliciousBakery
            </Link>
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
            {heroSlides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => handleSlideChange(index)}
                aria-label={slide.title}
                style={{
                  width: index === activeSlide ? 28 : 10,
                  height: 10,
                  borderRadius: 999,
                  border: 'none',
                  cursor: 'pointer',
                  background:
                    index === activeSlide ? 'var(--primary)' : 'rgba(148,163,184,0.5)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  if (index !== activeSlide) {
                    e.currentTarget.style.background = 'rgba(148,163,184,0.7)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (index !== activeSlide) {
                    e.currentTarget.style.background = 'rgba(148,163,184,0.5)'
                  }
                }}
              />
            ))}
          </div>
        </div>

        <div
          className="animate-slide-in-right"
          style={{
            borderRadius: 'var(--radius-lg)',
            background:
              'linear-gradient(145deg, rgba(248,250,252,0.9), rgba(254,242,242,0.9))',
            padding: '1.75rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 18px 45px rgba(15,23,42,0.12)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 24px 50px rgba(15,23,42,0.18)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 18px 45px rgba(15,23,42,0.12)'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Tại sao chọn DeliciousBakery?</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>
              <span style={{ fontWeight: 600 }}>Nguyên liệu chuẩn Pháp</span>
              <br />
              <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                Bơ, kem tươi và cacao nhập khẩu, được bảo quản theo đúng tiêu chuẩn.
              </span>
            </li>
            <li>
              <span style={{ fontWeight: 600 }}>Đặt trước 24/7</span>
              <br />
              <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                Đặt bánh mọi lúc, theo dõi đơn hàng ngay trên website.
              </span>
            </li>
            <li>
              <span style={{ fontWeight: 600 }}>Giao nhanh trong 2–4 giờ</span>
              <br />
              <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                Giao nội thành với xe giữ lạnh, đảm bảo bánh nguyên vẹn.
              </span>
            </li>
          </ul>
          <div
            style={{
              marginTop: '0.5rem',
              paddingTop: '0.75rem',
              borderTop: '1px dashed rgba(148,163,184,0.5)',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.9rem',
              color: 'var(--muted)',
            }}
          >
            <span>Hơn 100+ đơn hàng mỗi tháng</span>
            <span>Đánh giá cao bởi khách hàng thân thiết</span>
          </div>
        </div>
      </div>

      {/* Featured Categories */}
      <div className="card animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <div>
            <p className="tag">Danh mục nổi bật</p>
            <h2 style={{ margin: 0 }}>Khám phá theo nhu cầu</h2>
          </div>
          <Link to="/products" className="btn btn-outline" style={{ textDecoration: 'none' }}>
            Xem tất cả sản phẩm
          </Link>
        </div>
        <div
          className="grid"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '1rem' }}
        >
          {featuredCategories.map((category, index) => (
            <div
              key={category.id}
              className={`card card-hover animate-stagger-${Math.min(index + 1, 4)}`}
              style={{
                border: '1px solid rgba(226,232,240,0.9)',
                boxShadow: '0 6px 16px rgba(148,163,184,0.18)',
              }}
            >
              <p className="tag">{category.slug}</p>
              <h3 style={{ marginTop: 0 }}>{category.name}</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                Những chiếc bánh được yêu thích nhất trong danh mục {category.name.toLowerCase()}.
              </p>
            </div>
          ))}
          {featuredCategories.length === 0 && (
            <p style={{ color: 'var(--muted)' }}>Danh mục sẽ được cập nhật sớm.</p>
          )}
        </div>
      </div>

      {/* Top 5 Bestsellers */}
      <div className="card animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <div>
            <p className="tag">Bán chạy</p>
            <h2 style={{ margin: 0 }}>Top 4 được đặt nhiều</h2>
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            alignItems: 'stretch',
          }}
        >
          {bestsellers.map((product, index) => (
            <div
              key={product.id}
              className={`animate-stagger-${Math.min(index + 1, 4)}`}
              style={{ opacity: 0, display: 'flex' }}
            >
              <ProductCard
              product={product}
              onAddToCart={() => addToCart(product, 1)}
            />
            </div>
          ))}
          {!bestsellers.length && (
            <p style={{ color: 'var(--muted)' }}>Chưa có dữ liệu đơn hàng để hiển thị.</p>
          )}
        </div>
      </div>

      {/* Top 5 Highest Rated */}
      <div className="card animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <div>
            <p className="tag">Được yêu thích</p>
            <h2 style={{ margin: 0 }}>Top 4 đánh giá cao</h2>
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            alignItems: 'stretch',
          }}
        >
          {topRated.map((product, index) => (
            <div
              key={product.id}
              className={`animate-stagger-${Math.min(index + 1, 4)}`}
              style={{ opacity: 0, display: 'flex' }}
            >
              <ProductCard
              product={product}
              onAddToCart={() => addToCart(product, 1)}
            />
            </div>
          ))}
          {!topRated.length && (
            <p style={{ color: 'var(--muted)' }}>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
          )}
        </div>
      </div>

      {/* New Arrivals */}
      <div className="card animate-fade-in-up" style={{ animationDelay: '0.5s', opacity: 0 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <div>
            <p className="tag">Mới ra lò</p>
            <h2 style={{ margin: 0 }}>Bánh mới lên kệ</h2>
          </div>
        </div>
        {newArrivals.length ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              alignItems: 'stretch',
            }}
          >
            {newArrivals.map((product, index) => (
              <div
                key={product.id}
                className={`animate-stagger-${Math.min(index + 1, 4)}`}
                style={{ opacity: 0, display: 'flex' }}
              >
                <ProductCard
                product={product}
                onAddToCart={() => addToCart(product, 1)}
              />
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--muted)' }}>Các sản phẩm mới sẽ sớm được cập nhật.</p>
        )}
      </div>

      {/* Professional Footer (homepage section) */}
      <footer
        className="card"
        style={{
          marginTop: '0.5rem',
          background: '#0f172a',
          color: '#e5e7eb',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
            gap: '2rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid rgba(148,163,184,0.4)',
          }}
        >
          <div>
            <h3 style={{ marginTop: 0, color: '#f9fafb' }}>DeliciousBakery</h3>
            <p style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
              Nền tảng đặt bánh trực tuyến với hệ thống quản trị hiện đại dành cho cả khách hàng
              và admin.
            </p>
          </div>
          <div>
            <h4 style={{ marginTop: 0, color: '#e5e7eb', fontSize: '1rem' }}>Liên hệ</h4>
            <p style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
              12 Nguyễn Văn Lượng, Gò Vấp, TP. Hồ Chí Minh
              <br />
              Email: support@deliciousbakery.vn
              <br />
              Điện thoại: 0123 456 789
            </p>
          </div>
          <div>
            <h4 style={{ marginTop: 0, color: '#e5e7eb', fontSize: '1rem' }}>Khám phá</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem' }}>
              <li>
                <Link to="/products" style={{ color: '#9ca3af', textDecoration: 'none' }}>
                  Menu sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/about" style={{ color: '#9ca3af', textDecoration: 'none' }}>
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link to="/contact" style={{ color: '#9ca3af', textDecoration: 'none' }}>
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link to="/orders" style={{ color: '#9ca3af', textDecoration: 'none' }}>
                  Theo dõi đơn hàng
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginTop: 0, color: '#e5e7eb', fontSize: '1rem' }}>Giờ hoạt động</h4>
            <p style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
              Thứ 2 – Thứ 6: 8:00 – 21:00
              <br />
              Thứ 7 – CN: 9:00 – 21:30
            </p>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1rem',
            fontSize: '0.8rem',
            color: '#6b7280',
          }}
        >
          <span>© {new Date().getFullYear()} DeliciousBakery. All rights reserved.</span>
          <span>Made with Spring Boot & React.</span>
        </div>
      </footer>
    </section>
    </>
  )
}

export default HomePage

