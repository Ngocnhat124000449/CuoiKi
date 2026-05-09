import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import ProfileForm from './ProfileForm';
import styles from './page.module.scss';

export const metadata: Metadata = { title: 'Hồ sơ cá nhân' };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const user = await db.user.findUnique({
    where: { id: BigInt(session.user.id) },
    select: {
      fullName: true,
      email: true,
      phone: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });

  if (!user) redirect('/login');

  const joinDate = new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
  }).format(user.createdAt);

  return (
    <div>
      <div className={styles.pageHead}>
        <h2 className={styles.title}>Hồ sơ cá nhân</h2>
        <p className={styles.desc}>Quản lý thông tin tài khoản của bạn</p>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{user._count.orders}</span>
          <span className={styles.statLabel}>Đơn hàng</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{joinDate}</span>
          <span className={styles.statLabel}>Ngày tham gia</span>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Thông tin cá nhân</h3>
        <ProfileForm
          fullName={user.fullName}
          email={user.email}
          phone={user.phone ?? ''}
        />
      </div>
    </div>
  );
}
