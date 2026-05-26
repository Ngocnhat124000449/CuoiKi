'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { logoutAction } from '@/lib/actions/auth';
import styles from './UserMenu.module.scss';

interface Props {
  name: string | null;
  email: string;
  isAdmin: boolean;
}

export default function UserMenu({ name, email, isAdmin }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initial = ((name ?? email) || '?')[0].toUpperCase();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={styles.wrap}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="Menu tài khoản"
      >
        <div className={styles.avatar}>{initial}</div>
        <span className={styles.name}>{name ?? 'Tài khoản'}</span>
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropHead}>
            <div className={styles.dropAvatar}>{initial}</div>
            <div className={styles.dropInfo}>
              <span className={styles.dropName}>{name ?? 'Người dùng'}</span>
              <span className={styles.dropEmail}>{email}</span>
            </div>
          </div>

          <div className={styles.dropBody}>
            <Link href="/account" className={styles.dropItem} onClick={() => setOpen(false)}>
              <span>👤</span>
              <span>Hồ sơ cá nhân</span>
            </Link>
            <Link href="/account/orders" className={styles.dropItem} onClick={() => setOpen(false)}>
              <span>📦</span>
              <span>Đơn hàng của tôi</span>
            </Link>
            {isAdmin && (
              <Link href="/admin" className={`${styles.dropItem} ${styles.adminItem}`} onClick={() => setOpen(false)}>
                <span>⚙️</span>
                <span>Quản trị hệ thống</span>
              </Link>
            )}
          </div>

          <div className={styles.dropFoot}>
            <form action={logoutAction}>
              <button type="submit" className={styles.logoutBtn}>
                <span>🚪</span>
                <span>Đăng xuất</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
