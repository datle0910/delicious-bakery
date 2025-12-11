import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { AIChatbot } from '../chatbot/AIChatbot'

export const MainLayout = () => (
  <div className="app-shell">
    <Header />
    <main className="app-main">
      <div className="container" style={{ padding: '2rem 0' }}>
        <Outlet />
      </div>
    </main>
    <Footer />
    <AIChatbot />
  </div>
)

