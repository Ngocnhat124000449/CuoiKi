import styles from './Skeleton.module.scss'

export function ProductCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.cardImg} />
      <div className={styles.cardBody}>
        <div className={`${styles.line} ${styles.w33}`} />
        <div className={`${styles.line} ${styles.w75}`} />
        <div className={`${styles.line} ${styles.w50}`} />
        <div className={styles.btnBlock} />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
