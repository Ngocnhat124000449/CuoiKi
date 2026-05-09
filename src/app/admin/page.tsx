import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import styles from './page.module.scss';

export const metadata: Metadata = { title: 'Admin — Tổng quan' };

function fmt(val: unknown) {
  return new Intl.NumberFormat('vi-VN').format(Number(val)) + 'đ';
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang xử lý', SHIPPED: 'Đang giao',
  DELIVERED: 'Đã giao', CANCELLED: 'Đã hủy', REFUNDED: 'Hoàn tiền',
};

export default async function AdminDashboard() {
  const session = await auth();
  if (!(session?.user as { isAdmin?: boolean })?.isAdmin) redirect('/');

  const [productCount, orderCount, userCount, revenue, recentOrders] = await Promise.all([
    db.product.count({ where: { isActive: true } }),
    db.order.count(),
    db.user.count({ where: { isActive: true } }),
    db.order.aggregate({
      _sum: { totalAmount: true },
      where: { orderStatus: 'DELIVERED' },
    }),
    db.order.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        orderStatus: true,
        totalAmount: true,
        createdAt: true,
        user: { select: { fullName: true, email: true } },
      },
    }),
  ]);

  const revenueNum = Number(revenue._sum.totalAmount ?? 0);

  return (
    <div>
      <div className={styles.pageHead}>
        <h1 className={styles.title}>Tổng quan hệ thống</h1>
        <p className={styles.desc}>Chào mừng trở lại, Admin!</p>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statIcon}>📱</div>
          <div className={styles.statBody}>
            <span className={styles.statValue}>{productCount.toLocaleString('vi-VN')}</span>
            <span className={styles.statLabel}>Sản phẩm đang bán</span>
          </div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statIcon}>🛒</div>
          <div className={styles.statBody}>
            <span className={styles.statValue}>{orderCount.toLocaleString('vi-VN')}</span>
            <span className={styles.statLabel}>Tổng đơn hàng</span>
          </div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statBody}>
            <span className={styles.statValue}>{userCount.toLocaleString('vi-VN')}</span>
            <span className={styles.statLabel}>Người dùng hoạt động</span>
          </div>
        </div>
        <div className={`${styles.stat} ${styles.statPrimary}`}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statBody}>
            <span className={styles.statValue}>{fmt(revenueNum)}</span>
            <span className={styles.statLabel}>Doanh thu (đã giao)</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Đơn hàng gần đây</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id.toString()}>
                  <td className={styles.tdMono}>#{order.orderNumber}</td>
                  <td>
                    <div className={styles.customer}>
                      <span>{order.user.fullName}</span>
                      <small>{order.user.email}</small>
                    </div>
                  </td>
                  <td>
                    {new Intl.DateTimeFormat('vi-VN', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                    }).format(order.createdAt)}
                  </td>
                  <td className={styles.tdBold}>{fmt(order.totalAmount)}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[`s_${order.orderStatus.toLowerCase()}`]}`}>
                      {STATUS_LABEL[order.orderStatus] ?? order.orderStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
