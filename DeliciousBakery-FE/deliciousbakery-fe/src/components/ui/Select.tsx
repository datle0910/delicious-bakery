import type { SelectHTMLAttributes, ReactNode } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  children: ReactNode
}

export const Select = ({ label, error, children, ...rest }: SelectProps) => (
  <div className="form-field">
    {label ? <label>{label}</label> : null}
    <select {...rest}>{children}</select>
    {error ? <span className="form-error">{error}</span> : null}
  </div>
)

