'use client';
import { useActionState } from 'react';
import { updateProfileAction } from '@/lib/actions/user';
import styles from './ProfileForm.module.scss';

interface Props {
  fullName: string;
  email: string;
  phone: string;
}

export default function ProfileForm({ fullName, email, phone }: Props) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, null);

  return (
    <form action={formAction} className={styles.form}>
      {state === 'success' && (
        <div className={styles.success}>✓ Cập nhật thông tin thành công!</div>
      )}
      {state && state !== 'success' && (
        <div className={styles.error}>{state}</div>
      )}

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="fullName" className={styles.label}>Họ và tên</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            defaultValue={fullName}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="phone" className={styles.label}>Số điện thoại</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={phone}
            placeholder="0901 234 567"
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Email</label>
        <input
          type="email"
          value={email}
          disabled
          className={`${styles.input} ${styles.inputDisabled}`}
        />
        <span className={styles.hint}>Email không thể thay đổi</span>
      </div>

      <div className={styles.actions}>
        <button type="submit" disabled={isPending} className={styles.btn}>
          {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </form>
  );
}
