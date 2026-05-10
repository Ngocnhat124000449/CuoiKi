import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { deleteCouponAction, toggleCouponActiveAction } from '@/lib/actions/admin';
import DeleteConfirmBtn from '../_components/DeleteConfirmBtn';
import styles from './page.module.scss';

export const metadata: Metadata = { title: 'Admin — Khuyến mãi' };

function formatDiscount(type: string, value: { toString(): string }) {
  if (type === 'FREE_SHIPPING') return 'Miễn ship';
  if (type === 'PERCENT') return `${value.toString()}%`;
  return `${Number(value.toString()).toLocaleString('vi-VN')}đ`;
}

function formatDate(d: Date) {
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getCouponStatus(coupon: { isActive: boolean; startDate: Date; endDate: Date }) {
  const now = new Date();
  if (!coupon.isActive) return { label: 'Tắt', cls: 'inactive' };
  if (now < coupon.startDate) return { label: 'Sắp tới', cls: 'upcoming' };
  if (now > coupon.endDate) return { label: 'Hết hạn', cls: 'expired' };
  return { label: 'Đang chạy', cls: 'active' };
}

export default async function AdminCouponsPage() {
  const session = await auth();
  if (!(session?.user as { isAdmin?: boolean })?.isAdmin) redirect('/');

  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      code: true,
      name: true,
      discountType: true,
      discountValue: true,
      minOrderAmount: true,
      usageLimit: true,
      usedCount: true,
      applicableTo: true,
      startDate: true,
      endDate: true,
      isActive: true,
    },
  });

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.title}>Khuyến mãi</h1>
          <p className={styles.desc}>{coupons.length} mã giảm giá</p>
        </div>
        <Link href="/admin/coupons/new" className={styles.addBtn}>+ Tạo mã giảm giá</Link>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên chương trình</th>
                <th>Loại</th>
                <th>Giá trị</th>
                <th>Đ/h tối thiểu</th>
                <th className={styles.tdCenter}>Sử dụng</th>
                <th>Hiệu lực</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={9} className={styles.empty}>Chưa có mã giảm giá nào</td>
                </tr>
              )}
              {coupons.map((c) => {
                const status = getCouponStatus(c);
                return (
                  <tr key={c.id}>
                    <td className={styles.tdMono}>{c.code}</td>
                    <td className={styles.tdName}>{c.name}</td>
                    <td>
                      <span className={`${styles.typeBadge} ${styles[`type_${c.discountType}`]}`}>
                        {c.discountType === 'PERCENT' ? '%' : c.discountType === 'FIXED_AMOUNT' ? 'đ' : 'Ship'}
                      </span>
                    </td>
                    <td className={styles.tdValue}>{formatDiscount(c.discountType, c.discountValue)}</td>
                    <td className={styles.tdMuted}>
                      {Number(c.minOrderAmount.toString()) > 0
                        ? `${Number(c.minOrderAmount.toString()).toLocaleString('vi-VN')}đ`
                        : '—'}
                    </td>
                    <td className={styles.tdCenter}>
                      {c.usedCount}
                      {c.usageLimit ? `/${c.usageLimit}` : ''}
                    </td>
                    <td className={styles.tdDate}>
                      <span>{formatDate(c.startDate)}</span>
                      <span className={styles.dateSep}>→</span>
                      <span>{formatDate(c.endDate)}</span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${styles[status.cls]}`}>{status.label}</span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Link href={`/admin/coupons/${c.id}/edit`} className={styles.editBtn}>Sửa</Link>
                        <form action={toggleCouponActiveAction}>
                          <input type="hidden" name="couponId" value={c.id} />
                          <input type="hidden" name="isActive" value={String(c.isActive)} />
                          <button type="submit" className={styles.toggleBtn}>
                            {c.isActive ? 'Tắt' : 'Bật'}
                          </button>
                        </form>
                        <DeleteConfirmBtn
                          action={deleteCouponAction}
                          confirmMessage={`Xóa mã "${c.code}"? Hành động này không thể hoàn tác.`}
                          hiddenFields={{ couponId: String(c.id) }}
                          className={styles.deleteBtn}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
