import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import BrandForm from '../BrandForm';
import { createBrandAction } from '@/lib/actions/admin';
import styles from '../../_form.module.scss';

export const metadata: Metadata = { title: 'Admin — Thêm nhãn hàng' };

export default async function NewBrandPage() {
  const session = await auth();
  if (!(session?.user as { isAdmin?: boolean })?.isAdmin) redirect('/');

  return (
    <div>
      <Link href="/admin/brands" className={styles.backLink}>← Quay lại danh sách</Link>
      <div className={styles.pageHead}>
        <h1 className={styles.title}>Thêm nhãn hàng</h1>
      </div>
      <BrandForm action={createBrandAction} />
    </div>
  );
}
