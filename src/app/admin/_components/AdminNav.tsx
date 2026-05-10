'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '../layout.module.scss';

const NAV_ITEMS = [
  { href: '/admin',            label: 'Tổng quan',   icon: '📊', exact: true },
  { href: '/admin/products',   label: 'Sản phẩm',    icon: '📱' },
  { href: '/admin/categories', label: 'Danh mục',    icon: '🗂️' },
  { href: '/admin/brands',     label: 'Nhãn hàng',   icon: '🏷️' },
  { href: '/admin/orders',     label: 'Đơn hàng',    icon: '🛒' },
  { href: '/admin/coupons',    label: 'Khuyến mãi',  icon: '🎟️' },
  { href: '/admin/users',      label: 'Người dùng',  icon: '👥' },
];

interface Props {
  onNavigate?: () => void;
}

export default function AdminNav({ onNavigate }: Props) {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      {NAV_ITEMS.map(({ href, label, icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`${styles.navItem}${isActive ? ` ${styles.navItemActive}` : ''}`}
            onClick={onNavigate}
          >
            <span className={styles.navIcon}>{icon}</span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
