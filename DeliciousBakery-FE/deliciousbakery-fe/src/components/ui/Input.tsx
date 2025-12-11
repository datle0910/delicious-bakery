import type { InputHTMLAttributes } from 'react'
import clsx from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = ({ label, error, className, ...rest }: InputProps) => (
  <div className="form-field">
    {label ? <label>{label}</label> : null}
    <input className={clsx(className)} {...rest} />
    {error ? <span className="form-error">{error}</span> : null}
  </div>
)

