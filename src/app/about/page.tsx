import type { Metadata } from 'next'
import Link from 'next/link'
import styles from './page.module.scss'

export const metadata: Metadata = {
  title: 'Về chúng tôi — PhoneShop',
  description: 'Chuyên cung cấp điện thoại & thiết bị điện tử chính hãng từ năm 2020.',
}

const STATS = [
  { number: '100+',  label: 'Mẫu điện thoại',   sub: 'Từ 10+ thương hiệu hàng đầu' },
  { number: '50k+',  label: 'Khách hàng',        sub: 'Trên toàn quốc' },
  { number: '4.8★',  label: 'Điểm đánh giá',     sub: 'Trên nền tảng Google' },
  { number: '5 năm', label: 'Kinh nghiệm',        sub: 'Phục vụ từ năm 2020' },
]

const TIMELINE = [
  { year: '2020', text: 'Khai trương cửa hàng đầu tiên tại Q.1, TP.HCM với hơn 500 sản phẩm.' },
  { year: '2021', text: 'Ra mắt website thương mại điện tử, phục vụ 10.000 khách hàng đầu tiên.' },
  { year: '2022', text: 'Trở thành đại lý ủy quyền chính thức của Apple & Samsung tại TP.HCM.' },
  { year: '2024', text: 'Mở rộng lên 5 chi nhánh, nâng tổng số khách hàng lên hơn 50.000.' },
]

const VALUES = [
  {
    no: '01',
    title: 'Hàng chính hãng 100%',
    desc: 'Mỗi sản phẩm đều có tem chính hãng, hóa đơn VAT đầy đủ và xuất xứ rõ ràng — không bao giờ hàng xách tay, hàng nhái.',
  },
  {
    no: '02',
    title: 'Giao hàng siêu tốc',
    desc: 'Giao trong 2 giờ nội thành TP.HCM, 1–3 ngày toàn quốc. Miễn phí vận chuyển cho đơn hàng từ 500k.',
  },
  {
    no: '03',
    title: 'Đổi trả miễn phí 30 ngày',
    desc: 'Sản phẩm lỗi do nhà sản xuất? Chúng tôi đổi hoặc hoàn tiền toàn bộ trong 30 ngày, không cần hỏi thêm.',
  },
  {
    no: '04',
    title: 'Bảo hành chính hãng',
    desc: 'Hỗ trợ bảo hành tại trung tâm bảo hành chính thức của tất cả thương hiệu được phân phối.',
  },
  {
    no: '05',
    title: 'Tư vấn chuyên sâu',
    desc: 'Đội ngũ chuyên gia công nghệ sẵn sàng giải đáp mọi câu hỏi từ 8:00–22:00 mỗi ngày trong tuần.',
  },
  {
    no: '06',
    title: 'Trả góp 0% lãi suất',
    desc: 'Duyệt nhanh trong 5 phút, trả góp 0% qua thẻ tín dụng và ví điện tử cho đơn từ 3 triệu đồng.',
  },
]

const TEAM = [
  { name: 'Nguyễn Minh Tuấn', role: 'CEO & Co-founder',     initial: 'T', color: 'var(--color-brand)' },
  { name: 'Trần Thị Lan',     role: 'Head of Operations',   initial: 'L', color: 'hsl(210, 80%, 50%)' },
  { name: 'Lê Văn Dũng',      role: 'Lead Developer',       initial: 'D', color: 'hsl(152, 60%, 40%)' },
  { name: 'Phạm Thu Hà',      role: 'Customer Success',     initial: 'H', color: 'hsl(280, 60%, 50%)' },
]

export default function AboutPage() {
  return (
    <div className={styles.page}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true">
          <span className={styles.blob1} />
          <span className={styles.blob2} />
          <span className={styles.blob3} />
        </div>
        <div className={styles.heroInner}>
          <span className={styles.heroPill}>Về PhoneShop</span>
          <h1 className={styles.heroTitle}>
            Mang công nghệ<br />
            <em className={styles.heroEm}>đỉnh cao</em> đến tay bạn
          </h1>
          <p className={styles.heroDesc}>
            Chuyên cung cấp điện thoại &amp; thiết bị điện tử chính hãng từ năm 2020.
            Chúng tôi tin rằng công nghệ tốt nhất nên được tiếp cận dễ dàng và công bằng.
          </p>
          <div className={styles.heroCta}>
            <Link href="/products" className={styles.heroBtnPrimary}>Khám phá sản phẩm</Link>
            <Link href="/contact"  className={styles.heroBtnOutline}>Liên hệ ngay</Link>
          </div>
        </div>
      </section>

      {/* ── STATS ── scroll-triggered via RevealObserver ──────── */}
      <section className={styles.statsSection} aria-label="Số liệu PhoneShop">
        <div className={styles.statsGrid} data-stagger>
          {STATS.map(s => (
            <div key={s.label} className={styles.statItem}>
              <span className={styles.statNum}>{s.number}</span>
              <span className={styles.statLabel}>{s.label}</span>
              <span className={styles.statSub}>{s.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── STORY ────────────────────────────────────────────── */}
      <section className={styles.storySection}>
        {/* data-stagger on storyInner: left col + right col animate in sequence */}
        <div className={styles.storyInner} data-stagger>

          <div className={styles.storyLeft}>
            <span className={styles.eyebrow}>Câu chuyện của chúng tôi</span>
            <h2 className={styles.storyTitle}>
              Từ một cửa hàng nhỏ đến nền tảng công nghệ số
            </h2>
            <p className={styles.storyPara}>
              PhoneShop được thành lập năm 2020 với sứ mệnh đơn giản: mang công nghệ tốt nhất
              đến tay người tiêu dùng Việt Nam với mức giá hợp lý và dịch vụ xuất sắc.
            </p>
            <p className={styles.storyPara}>
              Chúng tôi là đại lý ủy quyền chính thức của Apple, Samsung, Xiaomi, OPPO và nhiều
              thương hiệu lớn khác. Với hơn 50.000 khách hàng tin tưởng, PhoneShop tự hào là một
              trong những cửa hàng điện thoại trực tuyến uy tín nhất tại TP.HCM.
            </p>
          </div>

          <div className={styles.storyRight}>
            {/* data-stagger on timeline: each milestone staggered */}
            <div className={styles.timeline} data-stagger>
              {TIMELINE.map(item => (
                <div key={item.year} className={styles.tlItem}>
                  <span className={styles.tlYear}>{item.year}</span>
                  <span className={styles.tlDot} />
                  <p className={styles.tlText}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── VALUES ── scroll-triggered ────────────────────────── */}
      <section className={styles.valuesSection}>
        <div className={styles.valuesInner}>
          <header className={styles.sectionHead}>
            <span className={styles.eyebrow}>Cam kết dịch vụ</span>
            <h2 className={styles.sectionTitle}>Tại sao chọn PhoneShop?</h2>
            <p className={styles.sectionDesc}>
              6 lý do khiến hơn 50.000 khách hàng tin tưởng chọn chúng tôi mỗi ngày
            </p>
          </header>
          <div className={styles.valuesGrid} data-stagger>
            {VALUES.map(v => (
              <article key={v.no} className={styles.valueCard}>
                <span className={styles.valueNo}>{v.no}</span>
                <h3 className={styles.valueTitle}>{v.title}</h3>
                <p className={styles.valueDesc}>{v.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── scroll-triggered ──────────────────────────── */}
      <section className={styles.teamSection}>
        <div className={styles.teamInner}>
          <header className={styles.sectionHead}>
            <span className={styles.eyebrow}>Con người</span>
            <h2 className={styles.sectionTitle}>Đội ngũ PhoneShop</h2>
          </header>
          <div className={styles.teamGrid} data-stagger>
            {TEAM.map(member => (
              <div
                key={member.name}
                className={styles.teamCard}
                style={{ '--avatar-color': member.color } as React.CSSProperties}
              >
                <div className={styles.teamAvatar}>
                  <span className={styles.teamInitial}>{member.initial}</span>
                </div>
                <p className={styles.teamName}>{member.name}</p>
                <p className={styles.teamRole}>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Sẵn sàng trải nghiệm?</h2>
          <p className={styles.ctaDesc}>
            Hàng nghìn sản phẩm chính hãng với giá tốt nhất đang chờ bạn.
          </p>
          <ul className={styles.ctaContact}>
            <li>📍 123 Lê Lợi, Q.1, TP.HCM</li>
            <li>📞 0909 123 456</li>
            <li>✉️ hello@phoneshop.vn</li>
          </ul>
          <Link href="/products" className={styles.ctaBtn}>
            Xem tất cả sản phẩm →
          </Link>
        </div>
      </section>

    </div>
  )
}
