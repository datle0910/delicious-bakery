import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Lock, LogIn } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useAuthActions } from '../../hooks/useAuthActions'
import { useCartActions } from '../../hooks/useCartActions'
import { useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'

const schema = z.object({
  email: z.string().email('Email không hợp lệ').min(1, 'Vui lòng nhập email'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
})

type FormValues = z.infer<typeof schema>

export const LoginPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/'
  const { login, loginStatus } = useAuthActions()
  const { syncRemoteCart } = useCartActions()
  const { user } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(redirectTo)
    }
  }, [user, navigate, redirectTo])

  const onSubmit = async (values: FormValues) => {
    try {
      await login(values)
      // Sync cart after login
      await syncRemoteCart()
      navigate(redirectTo)
    } catch {
      // Error handled in useAuthActions
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #fff0f6, #ffe4e6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}
        >
          <LogIn size={28} color="var(--primary)" />
        </div>
        <h2 style={{ margin: 0 }}>Đăng nhập</h2>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
          Chào mừng quay lại DeliciousBakery
        </p>
      </div>

      <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
        <div className="form-field">
          <label>
            <Mail size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Email
          </label>
          <input
            type="email"
            placeholder="email@example.com"
            {...register('email')}
            style={{
              borderRadius: 'var(--radius)',
              border: errors.email ? '1px solid #dc2626' : '1px solid var(--border)',
              padding: '0.7rem 0.9rem',
            }}
          />
          {errors.email && <span className="form-error">{errors.email.message}</span>}
        </div>

        <div className="form-field">
          <label>
            <Lock size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Mật khẩu
          </label>
          <input
            type="password"
            placeholder="••••••••"
            {...register('password')}
            style={{
              borderRadius: 'var(--radius)',
              border: errors.password ? '1px solid #dc2626' : '1px solid var(--border)',
              padding: '0.7rem 0.9rem',
            }}
          />
          {errors.password && <span className="form-error">{errors.password.message}</span>}
        </div>

        <Button
          type="submit"
          disabled={loginStatus === 'pending'}
          style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
        >
          {loginStatus === 'pending' ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>

      <div
        style={{
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border)',
          textAlign: 'center',
        }}
      >
        <p style={{ margin: 0 }}>
          Chưa có tài khoản?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Đăng ký ngay
          </Link>
        </p>
      </div>

      {redirectTo !== '/' && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: '#fef3c7',
            borderRadius: 'var(--radius)',
            fontSize: '0.9rem',
            color: '#92400e',
            textAlign: 'center',
          }}
        >
          Vui lòng đăng nhập để tiếp tục
        </div>
      )}
    </div>
  )
}
