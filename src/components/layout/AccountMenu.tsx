'use client'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import UserMenu from './UserMenu'
import styles from './Header.module.scss'

// Phần phụ thuộc đăng nhập của Header — render phía client qua useSession.
// Giữ Header (và root layout) thuần static để các trang public được prerender.
export default function AccountMenu() {
  const { data: session, status } = useSession()
  const user = session?.user
  const isAdmin = (user as { isAdmin?: boolean } | undefined)?.isAdmin ?? false

  // Chờ session: giữ chỗ để tránh layout shift, không nháy nút sai trạng thái.
  if (status === 'loading') {
    return <div className={styles.accountPlaceholder} aria-hidden />
  }

  if (user) {
    return (
      <UserMenu
        name={user.name ?? null}
        email={user.email ?? ''}
        isAdmin={isAdmin}
      />
    )
  }

  return (
    <Link href="/login" className={styles.actionBtn} aria-label="Đăng nhập">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
      <span>Đăng nhập</span>
    </Link>
  )
}
