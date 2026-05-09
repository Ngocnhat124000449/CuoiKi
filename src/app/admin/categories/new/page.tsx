import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import CategoryForm from '../CategoryForm';
import { createCategoryAction } from '@/lib/actions/admin';
import styles from '../../_form.module.scss';

export const metadata: Metadata = { title: 'Admin — Thêm danh mục' };

export default async function NewCategoryPage() {
  const session = await auth();
  if (!(session?.user as { isAdmin?: boolean })?.isAdmin) redirect('/');

  const parents = await db.category.findMany({
    where: { parentId: null },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });

  return (
    <div>
      <Link href="/admin/categories" className={styles.backLink}>← Quay lại danh sách</Link>
      <div className={styles.pageHead}>
        <h1 className={styles.title}>Thêm danh mục</h1>
      </div>
      <CategoryForm action={createCategoryAction} parents={parents} />
    </div>
  );
}
