import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '../components/layout/MainLayout'
import { ProtectedRoute } from '../components/layout/ProtectedRoute'
import { AdminLayout } from '../components/layout/AdminLayout'
import { ScrollToTopWrapper } from '../components/layout/ScrollToTopWrapper'
import { HomePage } from '../pages/HomePage'
import { ProductsPage } from '../pages/catalog/ProductsPage'
import { ProductDetailPage } from '../pages/catalog/ProductDetailPage'
import { CartPage } from '../pages/cart/CartPage'
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'
import { CheckoutPage } from '../pages/checkout/CheckoutPage'
import { StripePaymentPage } from '../pages/checkout/StripePaymentPage'
import { OrdersPage } from '../pages/orders/OrdersPage'
import { OrderHistoryPage } from '../pages/orders/OrderHistoryPage'
import { AboutPage } from '../pages/about/AboutPage'
import { ContactPage } from '../pages/contact/ContactPage'
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'
import { AdminStatisticsPage } from '../pages/admin/AdminStatisticsPage'
import { AdminProductsPage } from '../pages/admin/AdminProductsPage'
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage'
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage'
import { AdminUsersPage } from '../pages/admin/AdminUsersPage'
import { AdminRolesPage } from '../pages/admin/AdminRolesPage'
import { ProfilePage } from '../pages/profile/ProfilePage'
import { NotFoundPage } from '../pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ScrollToTopWrapper>
        <MainLayout />
      </ScrollToTopWrapper>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/:productId', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      {
        element: <ProtectedRoute roles={['CUSTOMER', 'ADMIN']} />,
        children: [
          { path: 'checkout', element: <CheckoutPage /> },
          { path: 'checkout/stripe', element: <StripePaymentPage /> },
          { path: 'orders', element: <OrdersPage /> },
          { path: 'orders/history', element: <OrderHistoryPage /> },
          { path: 'profile', element: <ProfilePage /> },
        ],
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <ScrollToTopWrapper>
        <ProtectedRoute roles={['ADMIN']} />
      </ScrollToTopWrapper>
    ),
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminDashboardPage /> },
              { path: 'statistics', element: <AdminStatisticsPage /> },
              { path: 'products', element: <AdminProductsPage /> },
              { path: 'categories', element: <AdminCategoriesPage /> },
              { path: 'orders', element: <AdminOrdersPage /> },
              { path: 'users', element: <AdminUsersPage /> },
              { path: 'roles', element: <AdminRolesPage /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: (
      <ScrollToTopWrapper>
        <NotFoundPage />
      </ScrollToTopWrapper>
    ),
  },
])

