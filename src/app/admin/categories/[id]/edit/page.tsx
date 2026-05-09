import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import CategoryForm from '../../CategoryForm';
import { updateCategoryAction } from '@/lib/actions/admin';
import styles from '../../../_form.module.scss';

export const metadata: Metadata = { title: 'Admin — Sửa danh mục' };

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!(session?.user as { isAdmin?: boolean })?.isAdmin) redirect('/');

  const { id } = await params;
  const categoryId = Number(id);

  const [category, parents] = await Promise.all([
    db.category.findUnique({ where: { id: categoryId } }),
    db.category.findMany({
      where: { parentId: null, id: { not: categoryId } },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  if (!category) notFound();

  return (
    <div>
      <Link href="/admin/categories" className={styles.backLink}>← Quay lại danh sách</Link>
      <div className={styles.pageHead}>
        <h1 className={styles.title}>Sửa danh mục: {category.name}</h1>
      </div>
      <CategoryForm
        action={updateCategoryAction}
        parents={parents}
        defaultValues={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          parentId: category.parentId,
          description: category.description,
          displayOrder: category.displayOrder,
          isActive: category.isActive,
        }}
      />
    </div>
  );
}
