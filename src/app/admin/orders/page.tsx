import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { updateOrderStatusAction } from '@/lib/actions/admin';
import styles from './page.module.scss';

export const metadata: Metadata = { title: 'Admin — Quản lý đơn hàng' };

function fmt(val: unknown) {
  return new Intl.NumberFormat('vi-VN').format(Number(val)) + 'đ';
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PENDING:    { label: 'Chờ xác nhận', cls: 'pending' },
  CONFIRMED:  { label: 'Đã xác nhận',  cls: 'confirmed' },
  PROCESSING: { label: 'Đang xử lý',   cls: 'processing' },
  SHIPPED:    { label: 'Đang giao',     cls: 'shipped' },
  DELIVERED:  { label: 'Đã giao',       cls: 'delivered' },
  CANCELLED:  { label: 'Đã hủy',        cls: 'cancelled' },
  REFUNDED:   { label: 'Hoàn tiền',     cls: 'refunded' },
};

export default async function AdminOrdersPage() {
  const session = await auth();
  if (!(session?.user as { isAdmin?: boolean })?.isAdmin) redirect('/');

  const orders = await db.order.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orderNumber: true,
      orderStatus: true,
      paymentStatus: true,
      totalAmount: true,
      createdAt: true,
      user: { select: { fullName: true, email: true } },
      _count: { select: { orderItems: true } },
    },
  });

  return (
    <div>
      <div className={styles.pageHead}>
        <h1 className={styles.title}>Quản lý đơn hàng</h1>
        <p className={styles.desc}>{orders.length} đơn hàng</p>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th>Cập nhật</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const s = STATUS_MAP[order.orderStatus] ?? { label: order.orderStatus, cls: 'pending' };
                return (
                  <tr key={order.id.toString()}>
                    <td className={styles.tdMono}>#{order.orderNumber}</td>
                    <td>
                      <div className={styles.customer}>
                        <span>{order.user.fullName}</span>
                        <small>{order.user.email}</small>
                      </div>
                    </td>
                    <td className={styles.tdMuted}>
                      {new Intl.DateTimeFormat('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                      }).format(order.createdAt)}
                    </td>
                    <td className={styles.tdPrice}>{fmt(order.totalAmount)}</td>
                    <td>
                      <span className={`${styles.payBadge} ${order.paymentStatus === 'PAID' ? styles.paid : styles.unpaid}`}>
                        {order.paymentStatus === 'PAID' ? 'Đã TT' : 'Chưa TT'}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${styles[`s_${s.cls}`]}`}>{s.label}</span>
                    </td>
                    <td>
                      <form action={updateOrderStatusAction} className={styles.statusForm}>
                        <input type="hidden" name="orderId" value={order.id.toString()} />
                        <select
                          name="status"
                          defaultValue={order.orderStatus}
                          className={styles.select}
                        >
                          {Object.entries(STATUS_MAP).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </select>
                        <button type="submit" className={styles.updateBtn} title="Lưu trạng thái">✓</button>
                      </form>
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
