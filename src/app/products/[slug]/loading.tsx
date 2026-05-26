import styles from './loading.module.scss'

export default function ProductDetailLoading() {
  return (
    <div className={styles.page}>
      {/* Breadcrumb skeleton */}
      <div className={styles.breadcrumb}>
        <span className={styles.skBreadcrumb} />
        <span className={styles.sep}>/</span>
        <span className={styles.skBreadcrumb} />
        <span className={styles.sep}>/</span>
        <span className={styles.skBreadcrumbLong} />
      </div>

      {/* Main grid */}
      <div className={styles.grid}>
        {/* Gallery */}
        <div className={styles.gallery}>
          <div className={styles.skMainImg} />
          <div className={styles.thumbRow}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.skThumb} />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className={styles.info}>
          <div className={styles.skBrand} />
          <div className={styles.skTitle} />
          <div className={styles.skTitleSm} />
          <div className={styles.skRating} />
          <div className={styles.skDivider} />
          <div className={styles.skPrice} />
          <div className={styles.skVariantLabel} />
          <div className={styles.skVariants}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.skVariantBtn} />
            ))}
          </div>
          <div className={styles.skVariantLabel} />
          <div className={styles.skVariants}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.skVariantBtn} />
            ))}
          </div>
          <div className={styles.skAddBtn} />
        </div>
      </div>

      {/* Specs */}
      <div className={styles.specsSection}>
        <div className={styles.skSpecsTitle} />
        <div className={styles.specsTable}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skSpecRow} />
          ))}
        </div>
      </div>
    </div>
  )
}
