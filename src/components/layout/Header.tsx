import Link from 'next/link'
import SearchBar from './SearchBar'
import MobileMenu from './MobileMenu'
import AccountMenu from './AccountMenu'
import CartBtn from './CartBtn'
import ThemeToggle from '@/components/ui/ThemeToggle'
import styles from './Header.module.scss'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link href="/" className={styles.logo} aria-label="PhoneShop — Trang chủ">
          <div className={styles.logoIcon}>📱</div>
          <div className={styles.logoText}>
            <strong>PhoneShop</strong>
            <span>Điện thoại chính hãng</span>
          </div>
        </Link>

        {/* Search */}
        <div className={styles.searchWrap}>
          <SearchBar />
        </div>

        {/* Desktop actions */}
        <div className={styles.actions}>
          {/* Hotline */}
          <div className={styles.hotline}>
            <a href="tel:19001234">📞 1900 1234</a>
            <small>Miễn phí · 8–22h</small>
          </div>

          {/* Account — logged in vs guest (resolved client-side via useSession) */}
          <AccountMenu />

          {/* Cart */}
          <CartBtn />

          {/* Dark / Light mode toggle */}
          <ThemeToggle />

          {/* Mobile hamburger */}
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}
