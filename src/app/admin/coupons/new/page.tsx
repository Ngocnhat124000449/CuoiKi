import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createCouponAction } from '@/lib/actions/admin';
import CouponForm from '../CouponForm';
import styles from '../../_form.module.scss';

export const metadata: Metadata = { title: 'Admin — Tạo mã giảm giá' };

export default async function NewCouponPage() {
  const session = await auth();
  if (!(session?.user as { isAdmin?: boolean })?.isAdmin) redirect('/');

  return (
    <div>
      <Link href="/admin/coupons" className={styles.backLink}>← Quay lại danh sách</Link>
      <div className={styles.pageHead}>
        <div className={styles.headLeft}>
          <h1 className={styles.title}>Tạo mã giảm giá</h1>
        </div>
      </div>
      <CouponForm action={createCouponAction} />
    </div>
  );
}
