import Link from 'next/link'
import styles from './not-found.module.scss'

export default function NotFound() {
  return (
    <div className={styles.wrap}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Không tìm thấy trang</h1>
      <p className={styles.desc}>
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
      </p>
      <div className={styles.actions}>
        <Link href="/" className={styles.btnPrimary}>Về trang chủ</Link>
        <Link href="/products" className={styles.btnSecondary}>Xem sản phẩm</Link>
      </div>
    </div>
  )
}
