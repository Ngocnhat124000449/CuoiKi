'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import styles from './page.module.scss'

function fmt(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ'
}

export default function CartPage() {
  const { items, removeItem, updateQty, totalItems, totalPrice } = useCart()
  const router = useRouter()

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>🛒</span>
        <h2 className={styles.emptyTitle}>Giỏ hàng trống</h2>
        <p className={styles.emptyHint}>Thêm sản phẩm để bắt đầu mua sắm</p>
        <Link href="/products" className={styles.shopBtn}>Khám phá sản phẩm</Link>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Giỏ hàng ({totalItems})</h1>

      <div className={styles.layout}>
        {/* Item list */}
        <div className={styles.itemList}>
          {items.map(item => (
            <div key={item.variantId} className={styles.item}>
              <Link href={`/products/${item.slug}`} className={styles.imgWrap}>
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill sizes="80px" className={styles.img} />
                ) : (
                  <span className={styles.imgPlaceholder}>📱</span>
                )}
              </Link>

              <div className={styles.itemInfo}>
                <Link href={`/products/${item.slug}`} className={styles.itemName}>{item.name}</Link>
                {item.options.length > 0 && (
                  <p className={styles.itemOpts}>
                    {item.options.map(o => o.displayValue).join(' · ')}
                  </p>
                )}
                <p className={styles.itemPrice}>{fmt(item.price)}</p>
              </div>

              <div className={styles.qtyWrap}>
                <button
                  type="button"
                  className={styles.qtyBtn}
                  onClick={() => updateQty(item.variantId, item.quantity - 1)}
                  aria-label="Giảm"
                >−</button>
                <span className={styles.qtyNum}>{item.quantity}</span>
                <button
                  type="button"
                  className={styles.qtyBtn}
                  onClick={() => updateQty(item.variantId, item.quantity + 1)}
                  aria-label="Tăng"
                >+</button>
              </div>

              <p className={styles.itemTotal}>{fmt(item.price * item.quantity)}</p>

              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => removeItem(item.variantId)}
                aria-label="Xóa"
              >✕</button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className={styles.summary}>
          <h2 className={styles.summaryTitle}>Tóm tắt đơn hàng</h2>
          <div className={styles.summaryRow}>
            <span>Tạm tính ({totalItems} sản phẩm)</span>
            <span>{fmt(totalPrice)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Phí vận chuyển</span>
            <span className={styles.free}>Miễn phí</span>
          </div>
          <div className={`${styles.summaryRow} ${styles.total}`}>
            <span>Tổng cộng</span>
            <span>{fmt(totalPrice)}</span>
          </div>
          <button
            type="button"
            className={styles.checkoutBtn}
            onClick={() => router.push('/checkout')}
          >
            Đặt hàng ngay
          </button>
          <Link href="/products" className={styles.continueLink}>
            ← Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  )
}
