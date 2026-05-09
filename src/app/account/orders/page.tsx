import type { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import styles from './page.module.scss';

export const metadata: Metadata = { title: 'Đơn hàng của tôi' };

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PENDING:    { label: 'Chờ xác nhận', cls: 'pending' },
  CONFIRMED:  { label: 'Đã xác nhận',  cls: 'confirmed' },
  PROCESSING: { label: 'Đang xử lý',   cls: 'processing' },
  SHIPPED:    { label: 'Đang giao',     cls: 'shipped' },
  DELIVERED:  { label: 'Đã giao',       cls: 'delivered' },
  CANCELLED:  { label: 'Đã hủy',        cls: 'cancelled' },
  REFUNDED:   { label: 'Hoàn tiền',     cls: 'refunded' },
};

function fmt(val: unknown) {
  return new Intl.NumberFormat('vi-VN').format(Number(val)) + 'đ';
}

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const orders = await db.order.findMany({
    where: { userId: BigInt(session.user.id) },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orderNumber: true,
      orderStatus: true,
      paymentStatus: true,
      totalAmount: true,
      createdAt: true,
      _count: { select: { orderItems: true } },
    },
  });

  return (
    <div>
      <div className={styles.pageHead}>
        <h2 className={styles.title}>Đơn hàng của tôi</h2>
        <p className={styles.desc}>Theo dõi và quản lý đơn hàng</p>
      </div>

      {orders.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>📭</span>
          <p>Bạn chưa có đơn hàng nào</p>
          <Link href="/products" className={styles.shopBtn}>Mua sắm ngay</Link>
        </div>
      ) : (
        <div className={styles.list}>
          {orders.map((order) => {
            const s = STATUS_MAP[order.orderStatus] ?? { label: order.orderStatus, cls: 'pending' };
            const date = new Intl.DateTimeFormat('vi-VN', {
              day: '2-digit', month: '2-digit', year: 'numeric',
            }).format(order.createdAt);

            return (
              <div key={order.id.toString()} className={styles.card}>
                <div className={styles.cardTop}>
                  <div>
                    <span className={styles.orderNum}>#{order.orderNumber}</span>
                    <span className={styles.orderDate}>{date}</span>
                  </div>
                  <span className={`${styles.badge} ${styles[s.cls]}`}>{s.label}</span>
                </div>

                <div className={styles.cardMid}>
                  <span className={styles.itemCount}>{order._count.orderItems} sản phẩm</span>
                  <span className={styles.total}>{fmt(order.totalAmount)}</span>
                </div>

                <div className={styles.cardFoot}>
                  <span className={`${styles.payBadge} ${order.paymentStatus === 'PAID' ? styles.paid : styles.unpaid}`}>
                    {order.paymentStatus === 'PAID' ? '✓ Đã thanh toán' : '⏳ Chưa thanh toán'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
