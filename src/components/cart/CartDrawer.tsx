'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCartStore, selectTotalItems, selectTotalPrice } from '@/lib/useCartStore'
import styles from './CartDrawer.module.scss'

function fmt(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ'
}

export default function CartDrawer() {
  const items      = useCartStore(s => s.items)
  const isOpen     = useCartStore(s => s.isOpen)
  const removeItem = useCartStore(s => s.removeItem)
  const updateQty  = useCartStore(s => s.updateQty)
  const closeDrawer = useCartStore(s => s.closeDrawer)
  const totalItems = useCartStore(selectTotalItems)
  const totalPrice = useCartStore(selectTotalPrice)
  const router     = useRouter()

  function handleCheckout() {
    closeDrawer()
    router.push('/checkout')
  }

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <div
        className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Giỏ hàng"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Giỏ hàng ({totalItems})</h2>
          <button type="button" onClick={closeDrawer} className={styles.closeBtn} aria-label="Đóng giỏ hàng">
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🛒</span>
            <p className={styles.emptyText}>Giỏ hàng trống</p>
            <Link href="/products" onClick={closeDrawer} className={styles.shopLink}>
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.itemList}>
              {items.map(item => (
                <div key={item.variantId} className={styles.item}>
                  <Link href={`/products/${item.slug}`} onClick={closeDrawer} className={styles.imgWrap}>
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill sizes="64px" className={styles.img} />
                    ) : (
                      <span className={styles.imgPlaceholder}>📱</span>
                    )}
                  </Link>

                  <div className={styles.info}>
                    <Link href={`/products/${item.slug}`} onClick={closeDrawer} className={styles.name}>
                      {item.name}
                    </Link>
                    {item.options.length > 0 && (
                      <p className={styles.opts}>{item.options.map(o => o.displayValue).join(' · ')}</p>
                    )}
                    <p className={styles.price}>{fmt(item.price)}</p>
                  </div>

                  <div className={styles.right}>
                    <div className={styles.qtyWrap}>
                      <button
                        type="button"
                        className={styles.qtyBtn}
                        onClick={() => updateQty(item.variantId, item.quantity - 1)}
                        aria-label="Giảm số lượng"
                      >−</button>
                      <span className={styles.qtyNum}>{item.quantity}</span>
                      <button
                        type="button"
                        className={styles.qtyBtn}
                        onClick={() => updateQty(item.variantId, item.quantity + 1)}
                        aria-label="Tăng số lượng"
                      >+</button>
                    </div>
                    <p className={styles.itemTotal}>{fmt(item.price * item.quantity)}</p>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => removeItem(item.variantId)}
                      aria-label={`Xóa ${item.name}`}
                    >✕</button>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.footer}>
              <div className={styles.totalRow}>
                <span>Tổng cộng</span>
                <strong>{fmt(totalPrice)}</strong>
              </div>
              <button type="button" className={styles.checkoutBtn} onClick={handleCheckout}>
                Đặt hàng ngay
              </button>
              <Link href="/cart" onClick={closeDrawer} className={styles.cartLink}>
                Xem chi tiết giỏ hàng →
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  )
}
