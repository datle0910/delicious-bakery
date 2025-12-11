import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingBag, UserRound, User, LogOut, Package, History, ChevronDown, Search } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { useAuthActions } from '../../hooks/useAuthActions'

const navItems = [
  { to: '/', label: 'Trang chủ' },
  { to: '/products', label: 'Sản phẩm' },
  { to: '/about', label: 'Giới thiệu' },
  { to: '/contact', label: 'Liên hệ' },
]

export const Header = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const items = useCartStore((state) => state.items)
  const { logout } = useAuthActions()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    logout()
    navigate('/')
    setDropdownOpen(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  return (
    <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0' }}>
        <Link to="/" style={{ textDecoration: 'none', fontWeight: 800, fontSize: '1.25rem' }}>
          Delicious<span style={{ color: 'var(--primary)' }}>Bakery</span>
        </Link>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                textDecoration: 'none',
                fontWeight: 600,
                color: isActive ? 'var(--primary)' : '#6b7280',
              })}
            >
              {item.label}
            </NavLink>
          ))}
          {user?.role === 'ADMIN' ? (
            <NavLink
              to="/admin"
              style={({ isActive }) => ({
                textDecoration: 'none',
                fontWeight: 600,
                color: isActive ? 'var(--primary)' : '#6b7280',
              })}
            >
              Quản trị
            </NavLink>
          ) : null}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={18} style={{ position: 'absolute', left: '0.75rem', color: 'var(--muted)' }} />
              <input
                type="search"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                  borderRadius: '999px',
                  border: '1px solid var(--border)',
                  fontSize: '0.9rem',
                  minWidth: 200,
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                }}
              />
            </div>
          </form>
          <Link to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: 'inherit' }}>
            <ShoppingBag size={20} />
            {items.length ? (
              <span
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  background: 'var(--primary)',
                  color: '#fff',
                  borderRadius: '999px',
                  fontSize: '0.7rem',
                  padding: '0 6px',
                  minWidth: 18,
                  height: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {items.length}
              </span>
            ) : null}
          </Link>
          {user ? (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius)',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f3f4f6'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none'
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.fullName}</div>
                  <small style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>
                    {user.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
                  </small>
                </div>
                <ChevronDown size={16} style={{ color: 'var(--muted)' }} />
              </button>

              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.5rem)',
                    right: 0,
                    background: '#fff',
                    borderRadius: 'var(--radius)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    border: '1px solid var(--border)',
                    minWidth: 200,
                    overflow: 'hidden',
                    zIndex: 1000,
                  }}
                >
                  <Link
                    to="/orders"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f8fafc'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <Package size={18} color="var(--muted)" />
                    <span style={{ fontWeight: 500 }}>Đơn hàng</span>
                  </Link>
                  <Link
                    to="/orders/history"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f8fafc'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <History size={18} color="var(--muted)" />
                    <span style={{ fontWeight: 500 }}>Lịch sử mua hàng</span>
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f8fafc'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <User size={18} color="var(--muted)" />
                    <span style={{ fontWeight: 500 }}>Thông tin cá nhân</span>
                  </Link>
                  <div
                    style={{
                      height: '1px',
                      background: 'var(--border)',
                      margin: '0.25rem 0',
                    }}
                  />
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: '#dc2626',
                      fontWeight: 500,
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fee2e2'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <LogOut size={18} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              <UserRound size={16} />
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
