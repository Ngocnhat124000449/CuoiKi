import type { Metadata } from 'next'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Về chúng tôi' }

const STATS = [
  { number: '100+', label: 'Mẫu điện thoại' },
  { number: '50k+', label: 'Khách hàng' },
  { number: '4.8★', label: 'Đánh giá trung bình' },
  { number: '5 năm', label: 'Kinh nghiệm' },
]

const VALUES = [
  {
    icon: '✅',
    title: 'Hàng chính hãng',
    desc: '100% sản phẩm có nguồn gốc rõ ràng, tem chính hãng, hóa đơn VAT.',
  },
  {
    icon: '🚚',
    title: 'Giao hàng nhanh',
    desc: 'Giao trong 2 giờ nội thành TP.HCM, toàn quốc trong 1-3 ngày.',
  },
  {
    icon: '🔄',
    title: 'Đổi trả dễ dàng',
    desc: 'Đổi trả miễn phí trong 30 ngày nếu sản phẩm có lỗi từ nhà sản xuất.',
  },
]

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroIcon}>📱</div>
        <h1>Về PhoneShop</h1>
        <p>
          Chuyên cung cấp điện thoại chính hãng, giá tốt nhất thị trường từ năm 2020.
        </p>
      </section>

      <section className={styles.stats} aria-label="Số liệu PhoneShop">
        {STATS.map(stat => (
          <div key={stat.label} className={styles.statCard}>
            <p className={styles.statNumber}>{stat.number}</p>
            <p className={styles.statLabel}>{stat.label}</p>
          </div>
        ))}
      </section>

      <section className={styles.story}>
        <h2>🏪 Câu chuyện của chúng tôi</h2>
        <div className={styles.storyText}>
          <p>
            PhoneShop được thành lập năm 2020 với sứ mệnh mang đến cho người tiêu dùng Việt Nam
            những chiếc điện thoại chính hãng với mức giá cạnh tranh nhất.
          </p>
          <p>
            Chúng tôi là đại lý ủy quyền của Apple, Samsung, Xiaomi, OPPO và nhiều thương hiệu lớn
            khác. Tất cả sản phẩm đều có hóa đơn VAT, bảo hành chính hãng và hỗ trợ đổi trả trong
            30 ngày.
          </p>
          <p>
            Với hơn 50.000 khách hàng tin tưởng, chúng tôi tự hào là một trong những cửa hàng điện
            thoại trực tuyến uy tín nhất tại TP.HCM.
          </p>
        </div>
      </section>

      <section className={styles.values} aria-label="Giá trị dịch vụ">
        {VALUES.map(value => (
          <article key={value.title} className={styles.valueCard}>
            <div className={styles.valueIcon}>{value.icon}</div>
            <h3>{value.title}</h3>
            <p>{value.desc}</p>
          </article>
        ))}
      </section>

      <section className={styles.contact}>
        <h2>📞 Liên hệ với chúng tôi</h2>
        <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn từ 8:00 - 22:00 mỗi ngày</p>
        <div className={styles.contactList}>
          <span>📍 123 Lê Lợi, Q.1, TP.HCM</span>
          <span>📞 0909 123 456</span>
          <span>✉️ hello@phoneshop.vn</span>
        </div>
      </section>
    </div>
  )
}
