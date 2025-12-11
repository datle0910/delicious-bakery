import type { ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'text'
  iconLeft?: ReactNode
  iconRight?: ReactNode
  fullWidth?: boolean
}

export const Button = ({
  variant = 'primary',
  className,
  children,
  iconLeft,
  iconRight,
  fullWidth,
  ...rest
}: ButtonProps) => (
  <button
    className={clsx(
      'btn',
      {
        'btn-primary': variant === 'primary',
        'btn-outline': variant === 'outline',
        'btn-text': variant === 'text',
        'w-100': fullWidth,
      },
      className,
    )}
    {...rest}
  >
    {iconLeft}
    {children}
    {iconRight}
  </button>
)

