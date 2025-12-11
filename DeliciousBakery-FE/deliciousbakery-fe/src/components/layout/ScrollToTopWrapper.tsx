import type { ReactNode } from 'react'
import { ScrollToTop } from './ScrollToTop'

interface ScrollToTopWrapperProps {
  children: ReactNode
}

export const ScrollToTopWrapper = ({ children }: ScrollToTopWrapperProps) => (
  <>
    <ScrollToTop />
    {children}
  </>
)

