import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import BrandForm from '../../BrandForm';
import { updateBrandAction } from '@/lib/actions/admin';
import styles from '../../../_form.module.scss';

export const metadata: Metadata = { title: 'Admin — Sửa nhãn hàng' };

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!(session?.user as { isAdmin?: boolean })?.isAdmin) redirect('/');

  const { id } = await params;
  const brand = await db.brand.findUnique({ where: { id: Number(id) } });
  if (!brand) notFound();

  return (
    <div>
      <Link href="/admin/brands" className={styles.backLink}>← Quay lại danh sách</Link>
      <div className={styles.pageHead}>
        <h1 className={styles.title}>Sửa nhãn hàng: {brand.name}</h1>
      </div>
      <BrandForm
        action={updateBrandAction}
        defaultValues={{
          id: brand.id,
          name: brand.name,
          slug: brand.slug,
          description: brand.description,
          websiteUrl: brand.websiteUrl,
          countryOfOrigin: brand.countryOfOrigin,
          isActive: brand.isActive,
        }}
      />
    </div>
  );
}
