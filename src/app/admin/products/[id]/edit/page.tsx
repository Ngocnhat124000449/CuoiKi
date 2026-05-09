import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import ProductForm from '../../ProductForm';
import { updateProductAction } from '@/lib/actions/admin';
import styles from '../../../_form.module.scss';

export const metadata: Metadata = { title: 'Admin — Sửa sản phẩm' };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!(session?.user as { isAdmin?: boolean })?.isAdmin) redirect('/');

  const { id } = await params;
  const productId = BigInt(id);

  const [product, categories, brands] = await Promise.all([
    db.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        slug: true,
        shortDescription: true,
        description: true,
        categoryId: true,
        brandId: true,
        basePrice: true,
        isActive: true,
        isFeatured: true,
        metaTitle: true,
        metaDescription: true,
      },
    }),
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

  if (!product) notFound();

  return (
    <div>
      <Link href="/admin/products" className={styles.backLink}>← Quay lại danh sách</Link>
      <div className={styles.pageHead}>
        <h1 className={styles.title}>Sửa: {product.name}</h1>
      </div>
      <ProductForm
        action={updateProductAction}
        categories={categories}
        brands={brands}
        defaultValues={{
          id: product.id.toString(),
          name: product.name,
          slug: product.slug,
          shortDescription: product.shortDescription,
          description: product.description,
          categoryId: product.categoryId,
          brandId: product.brandId,
          basePrice: Number(product.basePrice),
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          metaTitle: product.metaTitle,
          metaDescription: product.metaDescription,
        }}
      />
    </div>
  );
}
