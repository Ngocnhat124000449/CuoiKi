import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ProductForm from '../ProductForm';
import { createProductAction } from '@/lib/actions/admin';
import styles from '../../_form.module.scss';

export const metadata: Metadata = { title: 'Admin — Thêm sản phẩm' };

export default async function NewProductPage() {
  const session = await auth();
  if (!(session?.user as { isAdmin?: boolean })?.isAdmin) redirect('/');

  const [categories, brands] = await Promise.all([
    db.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    db.brand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div>
      <Link href="/admin/products" className={styles.backLink}>← Quay lại danh sách</Link>
      <div className={styles.pageHead}>
        <h1 className={styles.title}>Thêm sản phẩm</h1>
      </div>
      <ProductForm action={createProductAction} categories={categories} brands={brands} />
    </div>
  );
}
