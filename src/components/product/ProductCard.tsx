import Link from 'next/link'
import Image from 'next/image'
import type { ProductListItem } from '@/lib/queries/product'
import styles from './ProductCard.module.scss'

export default function ProductCard({ product }: { product: ProductListItem }) {
  return (
    <Link href={`/products/${product.slug}`} className={styles.card}>
      {/* Image */}
      <div className={styles.imgWrap}>
        {product.image ? (
          <Image
            src={product.image.url}
            alt={product.image.altText ?? product.name}
            fill
            sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,25vw"
            className={styles.img}
          />
        ) : (
          <div className={styles.imgPlaceholder}>📱</div>
        )}

        {/* Badges */}
        <div className={styles.badgeWrap}>
          {product.isFeatured && <span className={styles.badgeFeatured}>Nổi bật</span>}
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        {product.brand && <p className={styles.brand}>{product.brand}</p>}

        <h3 className={styles.name}>{product.name}</h3>

        {product.avgRating != null && (
          <div className={styles.rating}>
            <span className={styles.stars}>
              {'★'.repeat(Math.round(product.avgRating))}{'☆'.repeat(5 - Math.round(product.avgRating))}
            </span>
            <span className={styles.ratingCount}>({product.reviewCount})</span>
          </div>
        )}

        <div className={styles.priceRow}>
          <span className={styles.price}>{product.priceText}</span>
        </div>

        <p className={styles.installment}>Trả góp 0% — chỉ từ 500.000đ/tháng</p>

        <button type="button" className={styles.addBtn} tabIndex={-1}>
          🛒 Thêm vào giỏ
        </button>
      </div>
    </Link>
  )
}
