import { Link } from 'react-router-dom'
import {
  Heart,
  Award,
  Target,
  Eye,
  Sparkles,
  Shield,
  Leaf,
  Coffee,
  ChefHat,
  Package,
  Truck,
  Star,
} from 'lucide-react'

const values = [
  {
    icon: Heart,
    title: 'Tận tâm',
    description: 'Mỗi chiếc bánh được làm bằng tình yêu và sự chăm chút tỉ mỉ từ những người thợ lành nghề. Chúng tôi tin rằng sự tận tâm trong từng chi tiết nhỏ nhất sẽ tạo nên sự khác biệt.',
    color: '#ef4444',
  },
  {
    icon: Award,
    title: 'Chất lượng',
    description: 'Chỉ sử dụng nguyên liệu cao cấp, được nhập khẩu và kiểm định nghiêm ngặt. Mỗi sản phẩm đều được chế biến theo công thức độc quyền và quy trình chuẩn mực.',
    color: '#f59e0b',
  },
  {
    icon: Shield,
    title: 'Uy tín',
    description: 'Cam kết minh bạch về giá cả, đảm bảo chất lượng sản phẩm và dịch vụ giao hàng đúng hẹn. Sự tin cậy của khách hàng là nền tảng cho mọi hoạt động của chúng tôi.',
    color: '#3b82f6',
  },
  {
    icon: Leaf,
    title: 'Bền vững',
    description: 'Ưu tiên sử dụng bao bì thân thiện môi trường và hỗ trợ các nhà cung cấp địa phương. Chúng tôi hướng tới một tương lai bền vững cho ngành bánh ngọt.',
    color: '#10b981',
  },
]

const whyChooseUs = [
  {
    title: 'Nguyên liệu chuẩn Pháp',
    description: 'Bơ, kem tươi và cacao nhập khẩu trực tiếp từ Pháp, được bảo quản theo đúng tiêu chuẩn châu Âu. Mỗi nguyên liệu đều được lựa chọn kỹ lưỡng để đảm bảo hương vị đích thực.',
    icon: Award,
  },
  {
    title: 'Thợ bánh chuyên nghiệp',
    description: 'Đội ngũ thợ bánh được đào tạo bài bản, có chứng chỉ quốc tế và kinh nghiệm lâu năm. Họ không chỉ là những người làm bánh, mà còn là những nghệ nhân thực thụ.',
    icon: ChefHat,
  },
  {
    title: 'Giao hàng siêu tốc',
    description: 'Hệ thống giao hàng chuyên dụng với xe giữ lạnh, đảm bảo bánh luôn tươi ngon khi đến tay bạn. Chúng tôi cam kết giao hàng đúng giờ và trong tình trạng hoàn hảo.',
    icon: Truck,
  },
  {
    title: 'Đặt hàng 24/7',
    description: 'Hệ thống đặt hàng online hoạt động 24/7, cho phép bạn đặt bánh mọi lúc, mọi nơi. Chỉ cần vài cú click, chiếc bánh yêu thích sẽ được chuẩn bị và giao đến bạn.',
    icon: Sparkles,
  },
  {
    title: 'Đa dạng sản phẩm',
    description: 'Từ bánh sinh nhật sang trọng đến bánh trà chiều tinh tế, chúng tôi có đầy đủ các loại bánh để phục vụ mọi nhu cầu và sở thích của bạn.',
    icon: Package,
  },
  {
    title: 'Dịch vụ tận tâm',
    description: 'Đội ngũ tư vấn chuyên nghiệp luôn sẵn sàng hỗ trợ bạn chọn lựa sản phẩm phù hợp. Chúng tôi lắng nghe và đáp ứng mọi yêu cầu đặc biệt của khách hàng.',
    icon: Star,
  },
]

const specialties = [
  {
    title: 'Bánh sinh nhật',
    description: 'Những chiếc bánh sinh nhật được thiết kế độc đáo, phù hợp với mọi lứa tuổi và sở thích. Từ phong cách cổ điển đến hiện đại, chúng tôi có thể tạo ra chiếc bánh hoàn hảo cho ngày đặc biệt của bạn.',
  },
  {
    title: 'Bánh trà chiều',
    description: 'Bộ sưu tập bánh trà chiều tinh tế với hương vị thanh nhã, phù hợp cho những buổi hẹn hò, tiệc trà hay những khoảnh khắc thư giãn bên gia đình và bạn bè.',
  },
  {
    title: 'Bánh theo yêu cầu',
    description: 'Chúng tôi nhận làm bánh theo thiết kế riêng của bạn. Dù là bánh cưới, bánh kỷ niệm hay bất kỳ dịp đặc biệt nào, chúng tôi sẽ biến ý tưởng của bạn thành hiện thực.',
  },
]

export const AboutPage = () => {
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
            Chào mừng đến với DeliciousBakery
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
            Nghệ thuật bánh ngọt trong từng chiếc bánh
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
            Tại DeliciousBakery, chúng tôi không chỉ làm bánh – chúng tôi tạo ra những tác phẩm nghệ thuật có thể ăn được.
            Mỗi chiếc bánh là kết quả của sự kết hợp hoàn hảo giữa nguyên liệu cao cấp, kỹ thuật tinh xảo và tình yêu
            dành cho nghề bánh.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/products" className="btn btn-primary" style={{ textDecoration: 'none', fontSize: '1.05rem', padding: '0.875rem 2.25rem' }}>
              Khám phá bộ sưu tập
            </Link>
            <Link to="/contact" className="btn btn-outline" style={{ textDecoration: 'none', fontSize: '1.05rem', padding: '0.875rem 2.25rem' }}>
              Liên hệ với chúng tôi
            </Link>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <p className="tag" style={{ justifyContent: 'flex-start' }}>Câu chuyện của chúng tôi</p>
            <h2 style={{ margin: '0.5rem 0 1rem 0', fontSize: '2.5rem', lineHeight: 1.2 }}>
              Nơi hương vị gặp gỡ nghệ thuật
            </h2>
            <p style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '1.5rem' }}>
              DeliciousBakery được sinh ra từ niềm đam mê bất tận với nghệ thuật làm bánh. Chúng tôi tin rằng mỗi chiếc
              bánh không chỉ là món ăn, mà còn là phương tiện để gửi gắm tình cảm, kỷ niệm và những thông điệp ý nghĩa.
            </p>
            <p style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '1.5rem' }}>
              Từ những nguyên liệu được chọn lọc kỹ lưỡng đến quy trình chế biến tỉ mỉ, mỗi bước đều được thực hiện với
              sự chăm chút và tôn trọng nghề nghiệp. Chúng tôi không ngừng học hỏi, sáng tạo và cải tiến để mang đến
              những trải nghiệm ẩm thực tuyệt vời nhất cho khách hàng.
            </p>
            <p style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: '1.05rem' }}>
              Với đội ngũ thợ bánh tài năng và hệ thống quản lý hiện đại, DeliciousBakery tự hào là điểm đến tin cậy
              cho mọi dịp đặc biệt trong cuộc sống của bạn.
            </p>
          </div>
          <div
            style={{
              padding: '2rem',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'rgba(249, 115, 22, 0.2)',
                filter: 'blur(40px)',
              }}
            />
            <Coffee size={120} color="#f97316" style={{ position: 'relative', zIndex: 1, opacity: 0.8 }} />
          </div>
        </div>
      </div>

      {/* Mission, Vision, Values */}
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p className="tag" style={{ justifyContent: 'center' }}>Giá trị cốt lõi</p>
          <h2 style={{ margin: '0.5rem 0', fontSize: '2.5rem' }}>Những điều chúng tôi tin tưởng</h2>
          <p style={{ color: 'var(--muted)', maxWidth: '700px', margin: '1rem auto 0', fontSize: '1.05rem' }}>
            Mỗi giá trị này định hướng cho mọi quyết định và hành động của chúng tôi trong việc phục vụ khách hàng
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {values.map((value) => {
            const Icon = value.icon
            return (
              <div
                key={value.title}
                className="card"
                style={{
                  padding: '2.5rem',
                  textAlign: 'center',
                  border: '1px solid rgba(226,232,240,0.9)',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                  background: '#fff',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)'
                  e.currentTarget.style.borderColor = value.color
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
                  e.currentTarget.style.borderColor = 'rgba(226,232,240,0.9)'
                }}
              >
                <div
                  style={{
                    width: '5rem',
                    height: '5rem',
                    borderRadius: '50%',
                    background: `${value.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    color: value.color,
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
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: 600 }}>{value.title}</h3>
                <p style={{ color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{value.description}</p>
              </div>
            )
          })}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '3rem',
            marginTop: '4rem',
            paddingTop: '4rem',
            borderTop: '2px solid var(--border)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
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
                <Target size={24} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 600 }}>Sứ mệnh</h3>
            </div>
            <p style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: '1.1rem' }}>
              Cung cấp trải nghiệm mua bánh hiện đại, minh bạch và cá nhân hóa tối đa cho khách hàng. Chúng tôi cam
              kết mang đến những sản phẩm chất lượng cao, được làm thủ công với tình yêu và sự tận tâm, góp phần tạo
              nên những khoảnh khắc đáng nhớ trong cuộc sống của bạn.
            </p>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '3.5rem',
                  height: '3.5rem',
                  borderRadius: 'var(--radius)',
                  background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <Eye size={24} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 600 }}>Tầm nhìn</h3>
            </div>
            <p style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: '1.1rem' }}>
              Trở thành thương hiệu bánh ngọt được yêu thích và tin cậy nhất, được biết đến với chất lượng vượt trội,
              dịch vụ khách hàng xuất sắc và cam kết bền vững với môi trường. Chúng tôi hướng tới việc lan tỏa niềm vui
              và hạnh phúc thông qua những chiếc bánh ngọt ngào.
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p className="tag" style={{ justifyContent: 'center' }}>Tại sao chọn chúng tôi</p>
          <h2 style={{ margin: '0.5rem 0', fontSize: '2.5rem' }}>Điểm khác biệt của DeliciousBakery</h2>
          <p style={{ color: 'var(--muted)', maxWidth: '700px', margin: '1rem auto 0', fontSize: '1.05rem' }}>
            Những lý do khiến DeliciousBakery trở thành lựa chọn hàng đầu cho những chiếc bánh ngọt ngào
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {whyChooseUs.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  padding: '2rem',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid rgba(226,232,240,0.9)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
                  e.currentTarget.style.background = 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
                }}
              >
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
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                  }}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1.25rem', fontWeight: 600 }}>{item.title}</h4>
                  <p style={{ color: 'var(--muted)', lineHeight: 1.7, margin: 0, fontSize: '0.95rem' }}>
                    {item.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Specialties */}
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p className="tag" style={{ justifyContent: 'center' }}>Chuyên môn</p>
          <h2 style={{ margin: '0.5rem 0', fontSize: '2.5rem' }}>Những gì chúng tôi làm tốt nhất</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {specialties.map((specialty, index) => (
            <div
              key={specialty.title}
              className="card"
              style={{
                padding: '2.5rem',
                border: '1px solid rgba(226,232,240,0.9)',
                background: index === 1 ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' : '#fff',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: 600 }}>{specialty.title}</h3>
              <p style={{ color: 'var(--muted)', lineHeight: 1.7, margin: 0, fontSize: '1.05rem' }}>
                {specialty.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div
        className="card"
        style={{
          padding: '4rem 2.5rem',
          background: 'linear-gradient(135deg, rgba(254, 242, 242, 0.9) 0%, rgba(219, 234, 254, 0.9) 100%)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'rgba(249, 115, 22, 0.08)',
            filter: 'blur(80px)',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '2.75rem', fontWeight: 700 }}>
            Sẵn sàng khám phá thế giới bánh ngọt?
          </h2>
          <p
            style={{
              color: 'var(--muted)',
              fontSize: '1.15rem',
              marginBottom: '2.5rem',
              maxWidth: '650px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.7,
            }}
          >
            Hãy để chúng tôi mang đến những chiếc bánh ngọt ngào, được làm bằng tình yêu và sự chăm chút, cho những
            khoảnh khắc đặc biệt trong cuộc sống của bạn.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/products"
              className="btn btn-primary"
              style={{ textDecoration: 'none', fontSize: '1.1rem', padding: '1rem 2.5rem', fontWeight: 600 }}
            >
              Xem bộ sưu tập
            </Link>
            <Link
              to="/contact"
              className="btn btn-outline"
              style={{ textDecoration: 'none', fontSize: '1.1rem', padding: '1rem 2.5rem', fontWeight: 600 }}
            >
              Liên hệ đặt bánh
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutPage
