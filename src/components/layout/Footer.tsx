import Link from 'next/link'
import styles from './Footer.module.scss'

const PRODUCT_LINKS = [
  { label: 'iPhone',   href: '/products?search=iPhone'  },
  { label: 'Samsung',  href: '/products?search=Samsung' },
  { label: 'Xiaomi',   href: '/products?search=Xiaomi'  },
  { label: 'OPPO',     href: '/products?search=OPPO'    },
  { label: 'Vivo',     href: '/products?search=Vivo'    },
  { label: 'Realme',   href: '/products?search=Realme'  },
]

const SERVICE_LINKS = [
  { label: 'Tra cứu đơn hàng',    href: '/account/orders' },
  { label: 'Chính sách bảo hành', href: '/about' },
  { label: 'Đổi trả trong 30 ngày', href: '/about' },
  { label: 'Trả góp 0% lãi suất', href: '/contact' },
  { label: 'Thu cũ đổi mới',      href: '/about' },
  { label: 'Hệ thống cửa hàng',   href: '/contact' },
]

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        {/* Brand */}
        <div className={styles.brand}>
          <Link href="/" className={styles.brandLogo}>
            <div className={styles.icon}>📱</div>
            <span className={styles.name}>PhoneShop</span>
          </Link>
          <p className={styles.brandDesc}>
            Chuyên cung cấp điện thoại & thiết bị công nghệ chính hãng với giá tốt nhất thị trường.
            Cam kết 100% hàng thật, bảo hành đầy đủ.
          </p>
          <div className={styles.certBadges}>
            <span>✅ Hàng chính hãng</span>
            <span>🔒 Thanh toán an toàn</span>
            <span>🚚 Giao nhanh 2h</span>
          </div>
        </div>

        {/* Products */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Thương hiệu</h4>
          <div className={styles.colLinks}>
            {PRODUCT_LINKS.map(l => (
              <Link key={l.href} href={l.href} className={styles.link}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Dịch vụ</h4>
          <div className={styles.colLinks}>
            {SERVICE_LINKS.map(l => (
              <Link key={l.label} href={l.href} className={styles.link}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Liên hệ</h4>
          <div className={styles.colLinks}>
            <div className={styles.contactItem}>
              <span className={styles.icon}>📍</span>
              <span>123 Lê Lợi, Quận 1, TP. Hồ Chí Minh</span>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.icon}>📞</span>
              <a href="tel:19001234">1900 1234 (8h–22h)</a>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.icon}>✉️</span>
              <a href="mailto:hello@phoneshop.vn">hello@phoneshop.vn</a>
            </div>
          </div>
          <div className={styles.socialRow}>
            {[
              { icon: '📘', label: 'Facebook',  href: 'https://facebook.com/phoneshop' },
              { icon: '📸', label: 'Instagram', href: 'https://instagram.com/phoneshop' },
              { icon: '▶️', label: 'YouTube',   href: 'https://youtube.com/@phoneshop' },
              { icon: '🎵', label: 'TikTok',    href: 'https://tiktok.com/@phoneshop' },
            ].map(s => (
              <a key={s.label} href={s.href} className={styles.socialBtn} aria-label={s.label} title={s.label} target="_blank" rel="noopener noreferrer">
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <p className={styles.copyright}>
            © 2025 PhoneShop. All rights reserved. Thiết kế bởi PhoneShop Team.
          </p>
          <div className={styles.policies}>
            <Link href="/about">Điều khoản sử dụng</Link>
            <Link href="/about">Chính sách bảo mật</Link>
            <Link href="/contact">Liên hệ hỗ trợ</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
