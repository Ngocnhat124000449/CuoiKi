'use client'
import { useState } from 'react'
import type { ProductDetail } from '@/lib/queries/product'
import styles from './VariantSelector.module.scss'

type Variant = ProductDetail['variants'][number]

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ'
}

export default function VariantSelector({
  variantGroups, variants,
}: {
  variantGroups: ProductDetail['variantGroups']
  variants:      ProductDetail['variants']
}) {
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const d: Record<string, string> = {}
    for (const [k, g] of Object.entries(variantGroups)) {
      if (g.values[0]) d[k] = g.values[0].value
    }
    return d
  })

  const activeVariant: Variant | undefined = variants.find(v =>
    v.options.every(o => selected[o.attribute] === o.value)
  )

  return (
    <div>
      {/* Price */}
      <div className={styles.priceBox}>
        <p className={styles.priceLabel}>Giá bán</p>
        <p className={styles.price}>{activeVariant ? formatVND(activeVariant.price) : '—'}</p>
        {activeVariant?.compareAtPrice && (
          <p className={styles.priceOriginalText}>
            {formatVND(activeVariant.compareAtPrice)}
          </p>
        )}
        {activeVariant && (
          <p className={activeVariant.inStock ? styles.stock : styles.stockOut}>
            {activeVariant.inStock ? '✅ Còn hàng' : '❌ Hết hàng'}
          </p>
        )}
      </div>

      {/* Variant groups */}
      {Object.entries(variantGroups).map(([key, group]) => (
        <div key={key} className={styles.group}>
          <p className={styles.groupLabel}>
            {group.displayName}:{' '}
            <span className={styles.groupCurrentValue}>
              {group.values.find(v => v.value === selected[key])?.displayValue}
            </span>
          </p>
          <div className={styles.options}>
            {group.values.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelected(p => ({ ...p, [key]: opt.value }))}
                className={`${styles.optionBtn} ${selected[key] === opt.value ? styles.selected : ''}`}
              >
                {opt.colorHex && (
                  <span
                    className={styles.colorDot}
                    style={{ background: opt.colorHex }}
                  />
                )}
                {opt.displayValue}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Actions */}
      <div className={styles.actions}>
        <button
          type="button"
          disabled={!activeVariant?.inStock}
          className={styles.buyBtn}
        >
          {activeVariant?.inStock ? '🛒 Mua ngay' : 'Hết hàng'}
        </button>
        <button type="button" className={styles.cartBtn}>
          ♡ Thêm vào yêu thích
        </button>
      </div>

      {/* Promotions */}
      <div className={styles.promos}>
        {[
          { icon: '🛡️', text: 'Bảo hành chính hãng 12 tháng' },
          { icon: '🔄', text: 'Đổi trả miễn phí trong 30 ngày' },
          { icon: '🚚', text: 'Giao hàng nhanh — Miễn phí từ 500k' },
          { icon: '💳', text: 'Trả góp 0% lãi suất qua thẻ tín dụng' },
        ].map(p => (
          <div key={p.text} className={styles.promoItem}>
            <span className={styles.icon}>{p.icon}</span>
            <span>{p.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
