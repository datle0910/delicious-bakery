import { NavLink, Outlet } from 'react-router-dom'

const adminLinks = [
  { to: '/admin', label: 'Tổng quan', end: true },
  { to: '/admin/statistics', label: 'Thống kê' },
  { to: '/admin/products', label: 'Sản phẩm' },
  { to: '/admin/categories', label: 'Danh mục' },
  { to: '/admin/orders', label: 'Đơn hàng' },
  { to: '/admin/users', label: 'Người dùng' },
  { to: '/admin/roles', label: 'Vai trò' },
]

export const AdminLayout = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2rem' }}>
    <aside className="card" style={{ height: 'fit-content', padding: '1rem' }}>
      <h3>Quản trị</h3>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {adminLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            style={({ isActive }) => ({
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius)',
              textDecoration: 'none',
              fontWeight: 600,
              color: isActive ? '#fff' : '#475569',
              background: isActive ? 'var(--primary)' : 'transparent',
            })}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
    <section>
      <Outlet />
    </section>
  </div>
)

