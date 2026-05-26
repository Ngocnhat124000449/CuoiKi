'use client';
import { useActionState } from 'react';
import Link from 'next/link';
import { registerAction } from '@/lib/actions/auth';
import styles from './page.module.scss';

export default function RegisterForm() {
  const [error, formAction, isPending] = useActionState(registerAction, null);

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.panelContent}>
          <span className={styles.panelEmoji}>🛡️</span>
          <h2 className={styles.panelTitle}>
            Tham gia<br /><em>PhoneShop</em><br />ngay hôm nay
          </h2>
          <p className={styles.panelSub}>
            Tạo tài khoản miễn phí để theo dõi đơn hàng, tích điểm và nhận ưu đãi độc quyền.
          </p>
          <div className={styles.panelFeatures}>
            <div className={styles.panelFeature}>
              <span>🎁</span><span>Ưu đãi riêng cho thành viên mới</span>
            </div>
            <div className={styles.panelFeature}>
              <span>📦</span><span>Theo dõi đơn hàng theo thời gian thực</span>
            </div>
            <div className={styles.panelFeature}>
              <span>⭐</span><span>Tích điểm đổi quà hấp dẫn</span>
            </div>
            <div className={styles.panelFeature}>
              <span>🔒</span><span>Bảo mật thông tin tuyệt đối</span>
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

          <h1 className={styles.title}>Tạo tài khoản</h1>
          <p className={styles.subtitle}>Đăng ký để mua sắm dễ dàng hơn</p>

          <form action={formAction} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.field}>
              <label htmlFor="fullName" className={styles.label}>Họ và tên *</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                autoComplete="name"
                placeholder="Nguyễn Văn A"
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>Email *</label>
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
              <label htmlFor="phone" className={styles.label}>Số điện thoại</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="0901 234 567"
                className={styles.input}
              />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="password" className={styles.label}>Mật khẩu *</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="Tối thiểu 8 ký tự"
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="confirmPassword" className={styles.label}>Xác nhận mật khẩu *</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="Nhập lại mật khẩu"
                  className={styles.input}
                />
              </div>
            </div>

            <button type="submit" disabled={isPending} className={styles.btn}>
              {isPending ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>

          <p className={styles.footer}>
            Đã có tài khoản?{' '}
            <Link href="/login" className={styles.link}>Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
