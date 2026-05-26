'use client'
import { useCartStore, selectTotalItems } from '@/lib/useCartStore'
import styles from './Header.module.scss'

export default function CartBtn() {
  const totalItems  = useCartStore(selectTotalItems)
  const openDrawer  = useCartStore(s => s.openDrawer)

  return (
    <button type="button" onClick={openDrawer} className={styles.cartBtn} aria-label="Mở giỏ hàng">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      <span>Giỏ hàng</span>
      {totalItems > 0 && (
        <span className={styles.cartBadge}>{totalItems > 99 ? '99+' : totalItems}</span>
      )}
    </button>
  )
}
