import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { toggleUserActiveAction } from '@/lib/actions/admin';
import styles from './page.module.scss';

export const metadata: Metadata = { title: 'Admin — Quản lý người dùng' };

export default async function AdminUsersPage() {
  const session = await auth();
  if (!(session?.user as { isAdmin?: boolean })?.isAdmin) redirect('/');

  const users = await db.user.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      isActive: true,
      createdAt: true,
      userRoles: { include: { role: true } },
      _count: { select: { orders: true } },
    },
  });

  return (
    <div>
      <div className={styles.pageHead}>
        <h1 className={styles.title}>Quản lý người dùng</h1>
        <p className={styles.desc}>{users.length} tài khoản</p>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Điện thoại</th>
                <th>Vai trò</th>
                <th>Đơn hàng</th>
                <th>Ngày đăng ký</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const roles = u.userRoles.map((ur) => ur.role.roleName);
                const isAdmin = roles.includes('ADMIN');
                return (
                  <tr key={u.id.toString()}>
                    <td className={styles.tdName}>{u.fullName}</td>
                    <td className={styles.tdMuted}>{u.email}</td>
                    <td className={styles.tdMuted}>{u.phone ?? '—'}</td>
                    <td>
                      {roles.length === 0 ? (
                        <span className={styles.roleBadge}>User</span>
                      ) : (
                        roles.map((r) => (
                          <span key={r} className={`${styles.roleBadge} ${isAdmin ? styles.roleAdmin : ''}`}>
                            {r === 'ADMIN' ? 'Admin' : r === 'USER' ? 'User' : r}
                          </span>
                        ))
                      )}
                    </td>
                    <td className={styles.tdCenter}>{u._count.orders}</td>
                    <td className={styles.tdMuted}>
                      {new Intl.DateTimeFormat('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                      }).format(u.createdAt)}
                    </td>
                    <td>
                      <span className={`${styles.badge} ${u.isActive ? styles.active : styles.inactive}`}>
                        {u.isActive ? 'Hoạt động' : 'Vô hiệu'}
                      </span>
                    </td>
                    <td>
                      <form action={toggleUserActiveAction}>
                        <input type="hidden" name="userId" value={u.id.toString()} />
                        <input type="hidden" name="isActive" value={u.isActive.toString()} />
                        <button type="submit" className={styles.toggleBtn}>
                          {u.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        </button>
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
