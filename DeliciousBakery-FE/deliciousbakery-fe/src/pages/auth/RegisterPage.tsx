import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle, Mail, Lock, User, Phone, MapPin, ShieldCheck } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useAuthActions } from '../../hooks/useAuthActions'
import * as authApi from '../../api/auth'
import { toast } from 'react-hot-toast'
import { useMutation } from '@tanstack/react-query'

const schema = z.object({
  fullName: z
    .string()
    .min(3, 'Họ tên phải có ít nhất 3 ký tự')
    .max(100, 'Họ tên không được quá 100 ký tự'),
  email: z
    .string()
    .email('Email không hợp lệ')
    .min(1, 'Vui lòng nhập email'),
  password: z
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
    .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 số'),
  confirmPassword: z.string(),
  phone: z
    .string()
    .regex(/^(0|\+84)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ (VD: 0901234567)')
    .optional()
    .or(z.literal('')),
  address: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
})

type FormValues = z.infer<typeof schema>

export const RegisterPage = () => {
  const navigate = useNavigate()
  const { register: registerUser, registerStatus } = useAuthActions()
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [formData, setFormData] = useState<FormValues | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      address: '',
    },
  })

  // Mutation for sending OTP
  const sendOtpMutation = useMutation({
    mutationFn: (email: string) => authApi.sendOtp(email),
    onSuccess: (message) => {
      toast.success(message || 'Mã OTP đã được gửi đến email của bạn')
      setOtpSent(true)
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: string }; message?: string }
      toast.error(error?.response?.data || error?.message || 'Không thể gửi mã OTP. Vui lòng thử lại.')
    },
  })

  // Handle form submission - send OTP first
  const onSubmit = async (values: FormValues) => {
    try {
      // Check if email already exists
      const emailAvailable = await authApi.checkEmail(values.email)
      if (!emailAvailable) {
        setError('email', {
          type: 'manual',
          message: 'Email này đã được sử dụng. Vui lòng chọn email khác.',
        })
        return
      }

      // Store form data and send OTP
      setFormData(values)
      await sendOtpMutation.mutateAsync(values.email)
    } catch (error: unknown) {
      const err = error as { response?: { data?: string }; message?: string }
      toast.error(err?.response?.data || err?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.')
    }
  }

  // Handle final registration with OTP
  const handleRegisterWithOtp = async () => {
    if (!formData) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }

    if (!otpCode || otpCode.length !== 6) {
      toast.error('Vui lòng nhập mã OTP 6 chữ số')
      return
    }

    try {
      await registerUser({
        ...formData,
        roleId: 2, // CUSTOMER
        otp: otpCode,
      })
      setRegistrationSuccess(true)
    } catch (error: unknown) {
      const err = error as { response?: { data?: string }; message?: string }
      toast.error(err?.response?.data || err?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại mã OTP.')
    }
  }

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (!formData?.email) {
      toast.error('Vui lòng điền email trước')
      return
    }
    await sendOtpMutation.mutateAsync(formData.email)
  }

  if (registrationSuccess) {
    return (
      <div className="card" style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: '#dcfce7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          <CheckCircle size={40} color="#16a34a" />
        </div>
        <h2 style={{ color: '#16a34a' }}>Đăng ký thành công!</h2>
        <p style={{ color: 'var(--muted)' }}>
          Tài khoản của bạn đã được tạo thành công.
          <br />
          Vui lòng đăng nhập để tiếp tục.
        </p>
        <Button
          onClick={() => navigate('/login')}
          style={{ marginTop: '1.5rem', justifyContent: 'center' }}
          fullWidth
        >
          Đăng nhập ngay
        </Button>
      </div>
    )
  }

  // Show OTP verification step
  if (otpSent && formData) {
    return (
      <div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: '#dbeafe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          <ShieldCheck size={30} color="#2563eb" />
        </div>
        <h2 style={{ textAlign: 'center' }}>Xác thực Email</h2>
        <p style={{ color: 'var(--muted)', textAlign: 'center', marginBottom: '1.5rem' }}>
          Chúng tôi đã gửi mã OTP đến email <strong>{formData.email}</strong>
          <br />
          Vui lòng nhập mã OTP để hoàn tất đăng ký.
        </p>

        <div className="form-field">
          <label>
            <ShieldCheck size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Mã OTP (6 chữ số) *
          </label>
          <input
            type="text"
            placeholder="123456"
            value={otpCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6)
              setOtpCode(value)
            }}
            maxLength={6}
            style={{
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              padding: '0.7rem 0.9rem',
              fontSize: '1.2rem',
              letterSpacing: '0.5rem',
              textAlign: 'center',
              fontWeight: 600,
            }}
          />
          <small style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
            Mã OTP có hiệu lực trong 5 phút
          </small>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <Button
            onClick={handleRegisterWithOtp}
            disabled={registerStatus === 'pending' || otpCode.length !== 6}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            {registerStatus === 'pending' ? 'Đang xử lý...' : 'Xác nhận và Đăng ký'}
          </Button>
        </div>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={sendOtpMutation.isPending}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '0.9rem',
            }}
          >
            {sendOtpMutation.isPending ? 'Đang gửi...' : 'Gửi lại mã OTP'}
          </button>
        </div>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => {
              setOtpSent(false)
              setOtpCode('')
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--muted)',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            ← Quay lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
      <h2>Đăng ký tài khoản</h2>
      <p style={{ color: 'var(--muted)' }}>
        Tạo tài khoản để trải nghiệm mua bánh trực tuyến tại DeliciousBakery.
      </p>
      <form className="form-grid" onSubmit={handleSubmit(onSubmit)} style={{ marginTop: '1.5rem' }}>
        <div className="form-field">
          <label>
            <User size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Họ và tên *
          </label>
          <input
            placeholder="Nguyễn Văn A"
            {...register('fullName')}
            style={{
              borderRadius: 'var(--radius)',
              border: errors.fullName ? '1px solid #dc2626' : '1px solid var(--border)',
              padding: '0.7rem 0.9rem',
            }}
          />
          {errors.fullName && <span className="form-error">{errors.fullName.message}</span>}
        </div>

        <div className="form-field">
          <label>
            <Mail size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Email *
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
            Mật khẩu *
          </label>
          <input
            type="password"
            placeholder="Ít nhất 8 ký tự, 1 chữ hoa, 1 số"
            {...register('password')}
            style={{
              borderRadius: 'var(--radius)',
              border: errors.password ? '1px solid #dc2626' : '1px solid var(--border)',
              padding: '0.7rem 0.9rem',
            }}
          />
          {errors.password && <span className="form-error">{errors.password.message}</span>}
          <small style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
            Mật khẩu cần có ít nhất 8 ký tự, bao gồm chữ hoa và số
          </small>
        </div>

        <div className="form-field">
          <label>
            <Lock size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Nhập lại mật khẩu *
          </label>
          <input
            type="password"
            placeholder="Nhập lại mật khẩu"
            {...register('confirmPassword')}
            style={{
              borderRadius: 'var(--radius)',
              border: errors.confirmPassword ? '1px solid #dc2626' : '1px solid var(--border)',
              padding: '0.7rem 0.9rem',
            }}
          />
          {errors.confirmPassword && <span className="form-error">{errors.confirmPassword.message}</span>}
        </div>

        <div className="form-field">
          <label>
            <Phone size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Số điện thoại
          </label>
          <input
            placeholder="0901234567"
            {...register('phone')}
            style={{
              borderRadius: 'var(--radius)',
              border: errors.phone ? '1px solid #dc2626' : '1px solid var(--border)',
              padding: '0.7rem 0.9rem',
            }}
          />
          {errors.phone && <span className="form-error">{errors.phone.message}</span>}
        </div>

        <div className="form-field">
          <label>
            <MapPin size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Địa chỉ giao hàng
          </label>
          <input
            placeholder="12 Nguyễn Văn Lượng, Gò Vấp, TP. Hồ Chí Minh"
            {...register('address')}
            style={{
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              padding: '0.7rem 0.9rem',
            }}
          />
        </div>

        <Button
          type="submit"
          disabled={sendOtpMutation.isPending}
          style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
        >
          {sendOtpMutation.isPending ? 'Đang gửi mã OTP...' : 'Gửi mã OTP'}
        </Button>
      </form>

      <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        Đã có tài khoản?{' '}
        <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
          Đăng nhập
        </Link>
      </p>
    </div>
  )
}
