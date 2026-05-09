import styles from '../layout.module.scss';

interface Props {
  onClose?: () => void;
}

export default function AdminBrand({ onClose }: Props) {
  return (
    <div className={styles.brand}>
      <span className={styles.brandIcon}>📱</span>
      <div>
        <strong className={styles.brandName}>PhoneShop</strong>
        <span className={styles.brandSub}>Admin Panel</span>
      </div>
      {onClose && (
        <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">✕</button>
      )}
    </div>
  );
}
