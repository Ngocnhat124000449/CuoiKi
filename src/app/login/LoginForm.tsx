'use client';
import { useActionState } from 'react';
import Link from 'next/link';
import { loginAction } from '@/lib/actions/auth';
import styles from './page.module.scss';

export default function LoginForm() {
  const [error, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.panelContent}>
          <span className={styles.panelEmoji}>📱</span>
          <h2 className={styles.panelTitle}>
            Điện thoại<br /><em>chính hãng</em><br />giá tốt nhất
          </h2>
          <p className={styles.panelSub}>
            Hơn 500+ sản phẩm từ các thương hiệu hàng đầu. Bảo hành chính hãng, giao hàng trong 2 giờ.
          </p>
          <div className={styles.panelFeatures}>
            <div className={styles.panelFeature}>
              <span>✅</span><span>100% hàng chính hãng, tem nhập khẩu</span>
            </div>
            <div className={styles.panelFeature}>
              <span>🚚</span><span>Giao hàng nhanh — Miễn phí từ 500k</span>
            </div>
            <div className={styles.panelFeature}>
              <span>💳</span><span>Trả góp 0% lãi suất</span>
            </div>
            <div className={styles.panelFeature}>
              <span>🔄</span><span>Đổi trả miễn phí trong 30 ngày</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.formSide}>
        <div className={styles.card}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>📱</span>
            <strong className={styles.logoText}>PhoneShop</strong>
          </div>

          <h1 className={styles.title}>Đăng nhập</h1>
          <p className={styles.subtitle}>Chào mừng bạn trở lại!</p>

          <form action={formAction} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="ten@email.com"
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>Mật khẩu</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Nhập mật khẩu"
                className={styles.input}
              />
            </div>

            <button type="submit" disabled={isPending} className={styles.btn}>
              {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <p className={styles.footer}>
            Chưa có tài khoản?{' '}
            <Link href="/register" className={styles.link}>Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
