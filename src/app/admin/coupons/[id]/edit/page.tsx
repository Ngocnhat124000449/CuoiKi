import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { updateCouponAction } from '@/lib/actions/admin';
import CouponForm from '../../CouponForm';
import styles from '../../../_form.module.scss';

export const metadata: Metadata = { title: 'Admin — Sửa mã giảm giá' };

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!(session?.user as { isAdmin?: boolean })?.isAdmin) redirect('/');

  const { id } = await params;
  const coupon = await db.coupon.findUnique({ where: { id: Number(id) } });
  if (!coupon) notFound();

  const defaultValues = {
    id: coupon.id,
    code: coupon.code,
    name: coupon.name,
    description: coupon.description,
    discountType: coupon.discountType as 'PERCENT' | 'FIXED_AMOUNT' | 'FREE_SHIPPING',
    discountValue: coupon.discountValue.toString(),
    minOrderAmount: coupon.minOrderAmount.toString(),
    maxDiscountAmount: coupon.maxDiscountAmount?.toString() ?? null,
    usageLimit: coupon.usageLimit,
    perUserLimit: coupon.perUserLimit,
    applicableTo: coupon.applicableTo as 'ALL' | 'CATEGORY' | 'PRODUCT',
    startDate: coupon.startDate.toISOString().slice(0, 16),
    endDate: coupon.endDate.toISOString().slice(0, 16),
    isActive: coupon.isActive,
  };

  return (
    <div>
      <Link href="/admin/coupons" className={styles.backLink}>← Quay lại danh sách</Link>
      <div className={styles.pageHead}>
        <div className={styles.headLeft}>
          <h1 className={styles.title}>Sửa mã: {coupon.code}</h1>
        </div>
      </div>
      <CouponForm action={updateCouponAction} defaultValues={defaultValues} />
    </div>
  );
}
