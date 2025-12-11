export const Footer = () => (
  <footer style={{ background: '#0f172a', color: '#fff', padding: '2rem 0', marginTop: '3rem' }}>
    <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
      <div>
        <h3>DeliciousBakery</h3>
        <p style={{ maxWidth: 320, color: 'rgba(255,255,255,0.7)' }}>
          Bánh ngọt thủ công, nguyên liệu tươi ngon mỗi ngày.
        </p>
      </div>
      <div>
        <strong>Liên hệ</strong>
        <p style={{ margin: 0 }}>Hotline: 098 123 4567</p>
        <p style={{ margin: 0 }}>Email: hello@deliciousbakery.vn</p>
      </div>
    </div>
  </footer>
)

