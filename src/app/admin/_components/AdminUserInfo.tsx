import Link from 'next/link';
import { logoutAction } from '@/lib/actions/auth';
import styles from '../layout.module.scss';

interface Props {
  name: string;
  initial: string;
}

export default function AdminUserInfo({ name, initial }: Props) {
  return (
    <div className={styles.sideBottom}>
      <div className={styles.adminUser}>
        <div className={styles.adminAvatar}>{initial}</div>
        <div className={styles.adminInfo}>
          <span className={styles.adminName}>{name}</span>
          <span className={styles.adminBadge}>Administrator</span>
        </div>
      </div>

      <div className={styles.bottomLinks}>
        <Link href="/" className={styles.backLink}>← Trang chủ</Link>
        <form action={logoutAction}>
          <button type="submit" className={styles.logoutBtn}>Đăng xuất</button>
        </form>
      </div>
    </div>
  );
}
