import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-hot-toast'
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Coffee,
  CheckCircle,
  Sparkles,
} from 'lucide-react'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

const schema = z.object({
  name: z.string().min(3, 'Vui lòng nhập họ tên (ít nhất 3 ký tự)'),
  email: z.string().email('Email không hợp lệ'),
  phone: z
    .string()
    .regex(/^(0|\+84)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ (VD: 0901234567)')
    .optional()
    .or(z.literal('')),
  subject: z.string().min(3, 'Vui lòng nhập chủ đề'),
  message: z.string().min(10, 'Hãy mô tả chi tiết nhu cầu của bạn (ít nhất 10 ký tự)'),
})

type FormValues = z.infer<typeof schema>

const contactInfo = [
  {
    icon: Mail,
    title: 'Email',
    content: 'hello@deliciousbakery.vn',
    subContent: 'support@deliciousbakery.vn',
    color: '#3b82f6',
  },
  {
    icon: Phone,
    title: 'Điện thoại',
    content: '098 123 4567',
    subContent: 'Hotline: 1900 1234',
    color: '#10b981',
  },
  {
    icon: MapPin,
    title: 'Địa chỉ',
    content: '12 Nguyễn Văn Lượng',
    subContent: 'Gò Vấp, TP. Hồ Chí Minh',
    color: '#f59e0b',
  },
  {
    icon: Clock,
    title: 'Giờ làm việc',
    content: 'Thứ 2 - Thứ 6: 8:00 - 21:00',
    subContent: 'Thứ 7 - CN: 9:00 - 21:30',
    color: '#ef4444',
  },
]

const businessHours = [
  { day: 'Thứ 2 - Thứ 6', hours: '8:00 - 21:00' },
  { day: 'Thứ 7', hours: '9:00 - 21:30' },
  { day: 'Chủ nhật', hours: '9:00 - 21:30' },
  { day: 'Ngày lễ', hours: 'Theo thông báo' },
]

export const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.success('Cảm ơn bạn! Chúng tôi đã nhận được tin nhắn và sẽ phản hồi trong vòng 1-2 ngày làm việc.')
    reset()
    setIsSubmitting(false)
    console.info('Contact request', values)
  }

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Hero Section */}
      <div
        className="card"
        style={{
          padding: '4rem 2.5rem',
          background:
            'linear-gradient(135deg, rgba(254, 242, 242, 0.9) 0%, rgba(254, 249, 195, 0.9) 50%, rgba(219, 234, 254, 0.9) 100%)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'rgba(249, 115, 22, 0.1)',
            filter: 'blur(60px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-30%',
            left: '-10%',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'rgba(59, 130, 246, 0.1)',
            filter: 'blur(60px)',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p className="tag" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
            Kết nối với chúng tôi
          </p>
          <h1
            style={{
              fontSize: '3.5rem',
              lineHeight: 1.2,
              marginBottom: '1.5rem',
              maxWidth: '900px',
              margin: '0 auto 1.5rem',
              fontWeight: 700,
            }}
          >
            Chúng tôi luôn sẵn sàng lắng nghe bạn
          </h1>
          <p
            style={{
              color: 'var(--muted)',
              fontSize: '1.2rem',
              maxWidth: '750px',
              margin: '0 auto 2rem',
              lineHeight: 1.8,
            }}
          >
            Có câu hỏi, góp ý hay yêu cầu đặc biệt? Hãy liên hệ với chúng tôi. Đội ngũ DeliciousBakery luôn sẵn sàng hỗ
            trợ và phục vụ bạn một cách tận tâm nhất.
          </p>
        </div>
      </div>

      {/* Contact Information Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {contactInfo.map((info) => {
          const Icon = info.icon
          return (
            <div
              key={info.title}
              className="card"
              style={{
                padding: '2rem',
                textAlign: 'center',
                border: '1px solid rgba(226,232,240,0.9)',
                transition: 'all 0.3s ease',
                cursor: 'default',
                background: '#fff',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)'
                e.currentTarget.style.borderColor = info.color
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
                e.currentTarget.style.borderColor = 'rgba(226,232,240,0.9)'
              }}
            >
              <div
                style={{
                  width: '4.5rem',
                  height: '4.5rem',
                  borderRadius: '50%',
                  background: `${info.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  color: info.color,
                  transition: 'transform 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) rotate(0deg)'
                }}
              >
                <Icon size={28} />
              </div>
              <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.25rem', fontWeight: 600 }}>{info.title}</h3>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', fontWeight: 500, color: '#1e293b' }}>
                {info.content}
              </p>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.95rem' }}>{info.subContent}</p>
            </div>
          )
        })}
      </div>

      {/* Main Content: Form and Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        {/* Contact Form */}
        <div className="card" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div
              style={{
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: 'var(--radius)',
                background: 'linear-gradient(135deg, #f97316, #fb923c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <MessageCircle size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 600 }}>Gửi tin nhắn</h2>
              <p style={{ margin: '0.25rem 0 0 0', color: 'var(--muted)' }}>
                Điền form bên dưới, chúng tôi sẽ phản hồi sớm nhất
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Input label="Họ và tên *" placeholder="Nhập họ và tên của bạn" {...register('name')} error={errors.name?.message} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Email *"
                type="email"
                placeholder="your.email@example.com"
                {...register('email')}
                error={errors.email?.message}
              />
              <Input
                label="Số điện thoại"
                type="tel"
                placeholder="0901234567"
                {...register('phone')}
                error={errors.phone?.message}
              />
            </div>

            <Input
              label="Chủ đề *"
              placeholder="VD: Đặt bánh sinh nhật, Yêu cầu đặc biệt..."
              {...register('subject')}
              error={errors.subject?.message}
            />

            <div className="form-field">
              <label>
                Nội dung tin nhắn * <span style={{ color: 'var(--muted)', fontWeight: 'normal' }}>(tối thiểu 10 ký tự)</span>
              </label>
              <textarea
                rows={6}
                placeholder="Hãy mô tả chi tiết nhu cầu, câu hỏi hoặc yêu cầu của bạn..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  resize: 'vertical',
                  transition: 'border-color 0.2s',
                }}
                {...register('message')}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)'
                  e.currentTarget.style.outline = 'none'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                }}
              />
              {errors.message ? (
                <span className="form-error" style={{ marginTop: '0.5rem', display: 'block' }}>
                  {errors.message.message}
                </span>
              ) : null}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              style={{
                justifyContent: 'center',
                padding: '1rem',
                fontSize: '1.05rem',
                fontWeight: 600,
                marginTop: '0.5rem',
              }}
            >
              {isSubmitting ? (
                <>
                  <Sparkles size={18} style={{ marginRight: '0.5rem' }} />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send size={18} style={{ marginRight: '0.5rem' }} />
                  Gửi tin nhắn
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Additional Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Business Hours */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: 'var(--radius)',
                  background: 'linear-gradient(135deg, #10b981, #34d399)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <Clock size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Giờ làm việc</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {businessHours.map((schedule) => (
                <div
                  key={schedule.day}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: '#f8fafc',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  <span style={{ fontWeight: 500, color: '#1e293b' }}>{schedule.day}</span>
                  <span style={{ color: 'var(--muted)' }}>{schedule.hours}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Why Contact Us */}
          <div
            className="card"
            style={{
              padding: '2rem',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              border: '1px solid rgba(249, 115, 22, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: 'var(--radius)',
                  background: 'rgba(249, 115, 22, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f97316',
                }}
              >
                <Coffee size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Khi nào nên liên hệ?</h3>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                'Đặt bánh theo yêu cầu đặc biệt',
                'Tư vấn về sản phẩm và dịch vụ',
                'Góp ý và phản hồi về chất lượng',
                'Hợp tác kinh doanh hoặc đại lý',
                'Khiếu nại hoặc yêu cầu hỗ trợ',
              ].map((item, index) => (
                <li
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'start',
                    gap: '0.75rem',
                    color: '#1e293b',
                  }}
                >
                  <CheckCircle size={18} color="#f97316" style={{ marginTop: '0.25rem', flexShrink: 0 }} />
                  <span style={{ lineHeight: 1.6 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Response Time */}
          <div className="card" style={{ padding: '2rem', background: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
              <div
                style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: 'var(--radius)',
                  background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  flexShrink: 0,
                }}
              >
                <CheckCircle size={20} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 600 }}>Thời gian phản hồi</h4>
                <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.6 }}>
                  Chúng tôi cam kết phản hồi mọi tin nhắn trong vòng <strong>1-2 ngày làm việc</strong>. Đối với các
                  yêu cầu khẩn cấp, vui lòng gọi trực tiếp hotline.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map/Location Section */}
      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p className="tag" style={{ justifyContent: 'center' }}>Tìm chúng tôi</p>
          <h2 style={{ margin: '0.5rem 0', fontSize: '2.5rem' }}>Đến thăm cửa hàng</h2>
          <p style={{ color: 'var(--muted)', maxWidth: '700px', margin: '1rem auto 0', fontSize: '1.05rem' }}>
            Ghé thăm cửa hàng của chúng tôi để trải nghiệm không gian ấm cúng và thưởng thức những chiếc bánh tươi
            ngon nhất
          </p>
        </div>
        <div
          style={{
            height: '450px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <iframe
            src="https://maps.google.com/maps?q=12+Nguy%E1%BB%85n+V%C4%83n+L%C6%B0%E1%BB%A3ng,+G%C3%B2+V%E1%BA%A5p,+Ho+Chi+Minh+City&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="DeliciousBakery Location - 12 Nguyễn Văn Lượng, Gò Vấp, TP. Hồ Chí Minh"
          />
        </div>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <p style={{ color: 'var(--muted)', fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <MapPin size={18} />
            12 Nguyễn Văn Lượng, Gò Vấp, TP. Hồ Chí Minh
          </p>
        </div>
      </div>
    </section>
  )
}

export default ContactPage
