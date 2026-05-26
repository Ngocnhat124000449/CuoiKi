import styles from './loading.module.scss'

export default function AccountLoading() {
  return (
    <div className={styles.wrap}>
      {/* Header skeleton */}
      <div className={styles.header}>
        <div className={`${styles.line} ${styles.w40}`} />
        <div className={`${styles.line} ${styles.w20} ${styles.thin}`} />
      </div>

      {/* Content blocks */}
      <div className={styles.block}>
        <div className={`${styles.line} ${styles.w60}`} />
        <div className={`${styles.line} ${styles.w100}`} />
        <div className={`${styles.line} ${styles.w100}`} />
        <div className={`${styles.line} ${styles.w80}`} />
      </div>

      <div className={styles.block}>
        <div className={`${styles.line} ${styles.w40}`} />
        <div className={styles.cards}>
          {[0, 1, 2].map(i => (
            <div key={i} className={styles.card} />
          ))}
        </div>
      </div>
    </div>
  )
}
