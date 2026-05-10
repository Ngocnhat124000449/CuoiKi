'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import type { SaleProduct } from '@/lib/queries/sale'
import styles from './SaleCard.module.scss'

export default function SaleCard({ product }: { product: SaleProduct }) {
  const { addItem } = useCart()
  const router = useRouter()

  function handleBuy(e: React.MouseEvent) {
    e.preventDefault()
    addItem({
      variantId: product.variantId,
      name: product.name,
      slug: product.slug,
      price: product.salePrice,
      priceText: product.salePriceText,
      image: product.image?.url ?? null,
      options: product.options.map((o) => ({
        attribute: o.attribute,
        value: o.value,
        displayValue: o.displayValue,
      })),
    })
    router.push('/cart')
  }

  return (
    <div className={styles.card}>
      <Link href={`/products/${product.slug}`} className={styles.imgLink}>
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
          <span className={styles.discountBadge}>-{product.discountPct}%</span>
        </div>
      </Link>

      <div className={styles.body}>
        {product.brand && <p className={styles.brand}>{product.brand}</p>}

        <Link href={`/products/${product.slug}`} className={styles.nameLink}>
          <h3 className={styles.name}>{product.name}</h3>
        </Link>

        {product.options.length > 0 && (
          <p className={styles.variant}>
            {product.options.map((o) => o.displayValue).join(' · ')}
          </p>
        )}

        <div className={styles.priceRow}>
          <span className={styles.salePrice}>{product.salePriceText}</span>
          <span className={styles.origPrice}>{product.origPriceText}</span>
        </div>

        <div className={styles.savedRow}>
          <span className={styles.savedBadge}>Tiết kiệm {product.savedAmountText}</span>
        </div>

        {product.avgRating !== null && (
          <div className={styles.rating}>
            <span className={styles.star}>★</span>
            <span className={styles.ratingVal}>{product.avgRating}</span>
            <span className={styles.ratingCount}>({product.reviewCount})</span>
          </div>
        )}

        <button type="button" className={styles.buyBtn} onClick={handleBuy}>
          Mua ngay
        </button>
      </div>
    </div>
  )
}
