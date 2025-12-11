import { EmptyState } from '../components/ui/EmptyState'

export const NotFoundPage = () => (
  <EmptyState
    title="404 - Không tìm thấy trang"
    description="Có vẻ bạn đã đi lạc. Quay lại trang chủ nhé."
    actionLabel="Về trang chủ"
    onAction={() => (window.location.href = '/')}
  />
)

