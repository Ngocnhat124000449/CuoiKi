import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import ProductForm, { type VariantRow } from '../../ProductForm';
import { updateProductAction } from '@/lib/actions/admin';
import styles from '../../../_form.module.scss';

export const metadata: Metadata = { title: 'Admin — Sửa sản phẩm' };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!(session?.user as { isAdmin?: boolean })?.isAdmin) redirect('/');

  const { id } = await params;
  const productId = BigInt(id);

  const [productRaw, categoriesRaw, brands] = await Promise.all([
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
        attributeValues: {
          select: {
            attributeId: true,
            textValue: true,
            value: { select: { displayValue: true } },
          },
        },
        variants: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            sku: true,
            price: true,
            compareAtPrice: true,
            variantOptions: {
              select: { attributeId: true, valueId: true },
            },
          },
        },
      },
    }),
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

  if (!productRaw) notFound();

  // Convert BigInt → string for client serialization
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

  // Build specs map: attributeId → textValue (or displayValue for SELECT specs)
  const specs: Record<number, string> = {};
  for (const av of productRaw.attributeValues) {
    specs[av.attributeId] = av.textValue ?? av.value?.displayValue ?? '';
  }

  // Build variant rows for client form
  const variants: VariantRow[] = productRaw.variants.map((v) => ({
    tempId: v.id.toString(),
    variantId: v.id.toString(),
    sku: v.sku,
    price: Number(v.price).toString(),
    compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice).toString() : '',
    options: Object.fromEntries(
      v.variantOptions.map((vo) => [vo.attributeId, vo.valueId.toString()])
    ) as Record<number, string>,
  }));

  return (
    <div>
      <Link href="/admin/products" className={styles.backLink}>← Quay lại danh sách</Link>
      <div className={styles.pageHead}>
        <h1 className={styles.title}>Sửa: {productRaw.name}</h1>
      </div>
      <ProductForm
        action={updateProductAction}
        categories={categories}
        brands={brands}
        defaultValues={{
          id: productRaw.id.toString(),
          name: productRaw.name,
          slug: productRaw.slug,
          shortDescription: productRaw.shortDescription,
          description: productRaw.description,
          categoryId: productRaw.categoryId,
          brandId: productRaw.brandId,
          basePrice: Number(productRaw.basePrice),
          isActive: productRaw.isActive,
          isFeatured: productRaw.isFeatured,
          metaTitle: productRaw.metaTitle,
          metaDescription: productRaw.metaDescription,
          specs,
          variants,
        }}
      />
    </div>
  );
}
