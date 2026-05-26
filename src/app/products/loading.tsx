import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import styles from './page.module.scss'

export default function ProductsLoading() {
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>📱 Tất cả sản phẩm</h1>
      </div>
      <div className={styles.layout}>
        <div className={styles.sidebar} />
        <div className={styles.content}>
          <ProductGridSkeleton count={12} />
        </div>
      </div>
    </div>
  )
}
