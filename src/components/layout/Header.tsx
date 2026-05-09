import Link from 'next/link'
import { auth } from '@/lib/auth'
import SearchBar from './SearchBar'
import MobileMenu from './MobileMenu'
import UserMenu from './UserMenu'
import ThemeToggle from '@/components/ui/ThemeToggle'
import styles from './Header.module.scss'

export default async function Header() {
  const session = await auth()
  const user = session?.user
  const isAdmin = (user as { isAdmin?: boolean } | undefined)?.isAdmin ?? false

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

          {/* Account — logged in vs guest */}
          {user ? (
            <UserMenu
              name={user.name ?? null}
              email={user.email ?? ''}
              isAdmin={isAdmin}
            />
          ) : (
            <Link href="/login" className={styles.actionBtn} aria-label="Đăng nhập">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Đăng nhập</span>
            </Link>
          )}

          {/* Cart */}
          <Link href="/cart" className={styles.cartBtn} aria-label="Giỏ hàng">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span>Giỏ hàng</span>
          </Link>

          {/* Dark / Light mode toggle */}
          <ThemeToggle />

          {/* Mobile hamburger */}
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}
