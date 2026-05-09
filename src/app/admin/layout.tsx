import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import styles from './layout.module.scss';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin;
  if (!session?.user || !isAdmin) redirect('/');

  const name = session.user.name ?? 'Admin';
  const initial = (session.user.name ?? session.user.email ?? 'A')[0].toUpperCase();

  return (
    <div className={styles.shell}>
      <AdminSidebar name={name} initial={initial} />
      <div className={styles.main}>{children}</div>
    </div>
  );
}
