'use client';
import { useActionState } from 'react';
import { changePasswordAction } from '@/lib/actions/user';
import styles from './SettingsForm.module.scss';

export default function SettingsForm() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, null);

  return (
    <form action={formAction} className={styles.form}>
      {state === 'success' && (
        <div className={styles.success}>✓ Đổi mật khẩu thành công!</div>
      )}
      {state && state !== 'success' && (
        <div className={styles.error}>{state}</div>
      )}

      <div className={styles.field}>
        <label htmlFor="currentPassword" className={styles.label}>
          Mật khẩu hiện tại
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Nhập mật khẩu hiện tại"
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="newPassword" className={styles.label}>
          Mật khẩu mới
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Tối thiểu 8 ký tự"
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="confirmPassword" className={styles.label}>
          Xác nhận mật khẩu mới
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu mới"
          className={styles.input}
        />
      </div>

      <button type="submit" disabled={isPending} className={styles.btn}>
        {isPending ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
      </button>
    </form>
  );
}
