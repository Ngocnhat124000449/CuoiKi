'use client';
import { useState } from 'react';
import AdminBrand from './_components/AdminBrand';
import AdminNav from './_components/AdminNav';
import AdminUserInfo from './_components/AdminUserInfo';
import styles from './layout.module.scss';

interface Props {
  name: string;
  initial: string;
}

export default function AdminSidebar({ name, initial }: Props) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button className={styles.menuBtn} onClick={() => setOpen(true)} aria-label="Mở menu admin">
        <span /><span /><span />
      </button>

      {open && <div className={styles.overlay} onClick={close} />}

      <aside className={`${styles.sidebar}${open ? ` ${styles.sidebarOpen}` : ''}`}>
        <AdminBrand onClose={close} />
        <AdminNav onNavigate={close} />
        <AdminUserInfo name={name} initial={initial} />
      </aside>
    </>
  );
}
