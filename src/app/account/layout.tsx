import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { logoutAction } from '@/lib/actions/auth';
import styles from './layout.module.scss';

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const user = session.user;
  const isAdmin = (user as { isAdmin?: boolean }).isAdmin;
  const initial = (user.name ?? user.email ?? 'U')[0].toUpperCase();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{initial}</div>
            <div className={styles.userMeta}>
              <strong className={styles.userName}>{user.name ?? 'Người dùng'}</strong>
              <span className={styles.userEmail}>{user.email}</span>
            </div>
          </div>

          <nav className={styles.nav}>
            <Link href="/account" className={styles.navItem}>
              <span className={styles.navIcon}>👤</span>
              <span>Hồ sơ cá nhân</span>
            </Link>
            <Link href="/account/orders" className={styles.navItem}>
              <span className={styles.navIcon}>📦</span>
              <span>Đơn hàng của tôi</span>
            </Link>
            <Link href="/account/settings" className={styles.navItem}>
              <span className={styles.navIcon}>🔒</span>
              <span>Đổi mật khẩu</span>
            </Link>
            {isAdmin && (
              <Link href="/admin" className={styles.navItemAdmin}>
                <span className={styles.navIcon}>⚙️</span>
                <span>Quản trị hệ thống</span>
              </Link>
            )}
          </nav>

          <form action={logoutAction} className={styles.logoutWrap}>
            <button type="submit" className={styles.logoutBtn}>
              <span>🚪</span>
              <span>Đăng xuất</span>
            </button>
          </form>
        </aside>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
