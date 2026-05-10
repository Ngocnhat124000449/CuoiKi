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

  const [categoriesRaw, brands] = await Promise.all([
    db.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        categoryAttributes: {
          orderBy: [{ groupName: 'asc' }, { displayOrder: 'asc' }],
          select: {
            attributeId: true,
            groupName: true,
            isRequired: true,
            attribute: {
              select: {
                id: true,
                name: true,
                displayName: true,
                inputType: true,
                unit: true,
                isFilterable: true,
                values: {
                  orderBy: { displayOrder: 'asc' },
                  select: { id: true, value: true, displayValue: true, colorHex: true },
                },
              },
            },
          },
        },
      },
    }),
    db.brand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  // Convert BigInt AttributeValue.id → string for client serialization
  const categories = categoriesRaw.map((cat) => ({
    ...cat,
    categoryAttributes: cat.categoryAttributes.map((ca) => ({
      ...ca,
      attribute: {
        ...ca.attribute,
        inputType: ca.attribute.inputType as string,
        values: ca.attribute.values.map((v) => ({ ...v, id: v.id.toString() })),
      },
    })),
  }));

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
