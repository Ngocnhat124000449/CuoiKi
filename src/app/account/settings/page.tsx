import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SettingsForm from './SettingsForm';
import styles from './page.module.scss';

export const metadata: Metadata = { title: 'Đổi mật khẩu' };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div>
      <div className={styles.pageHead}>
        <h2 className={styles.title}>Đổi mật khẩu</h2>
        <p className={styles.desc}>Giữ tài khoản an toàn với mật khẩu mạnh</p>
      </div>

      <div className={styles.section}>
        <SettingsForm />
      </div>
    </div>
  );
}
