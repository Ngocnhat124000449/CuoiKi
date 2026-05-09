import Link from 'next/link'
import styles from './CategoryNav.module.scss'

const CATEGORIES = [
  { icon: '📱', label: 'Điện thoại',    href: '/products',                     hot: false },
  { icon: '💻', label: 'Laptop',        href: '/products?search=laptop',        hot: false },
  { icon: '🎧', label: 'Âm thanh',      href: '/products?search=tai+nghe',      hot: false },
  { icon: '⌚', label: 'Đồng hồ',      href: '/products?search=dong+ho',       hot: false },
  { icon: '📷', label: 'Máy ảnh',       href: '/products?search=may+anh',       hot: false },
  { icon: '🖥️', label: 'PC & Màn hình', href: '/products?search=pc',            hot: false },
  { icon: '📺', label: 'Tivi',          href: '/products?search=tivi',          hot: false },
  { icon: '🏠', label: 'Gia dụng',      href: '/products?search=gia+dung',      hot: false },
  { icon: '🔌', label: 'Phụ kiện',      href: '/products?search=phu+kien',      hot: false },
  { icon: '🏷️', label: 'Khuyến mãi',   href: '/products?sortBy=price_asc',     hot: true  },
  { icon: '🔄', label: 'Thu cũ',        href: '/about',                         hot: false },
]

export default function CategoryNav() {
  return (
    <nav className={styles.nav} aria-label="Danh mục sản phẩm">
      <div className={styles.inner}>
        {CATEGORIES.map(cat => (
          <Link
            key={cat.href + cat.label}
            href={cat.href}
            className={styles.item}
            title={cat.label}
          >
            <span className={styles.itemIcon}>{cat.icon}</span>
            <span className={styles.itemLabel}>{cat.label}</span>
            {cat.hot && <span className={styles.hotBadge}>HOT</span>}
          </Link>
        ))}
      </div>
    </nav>
  )
}
