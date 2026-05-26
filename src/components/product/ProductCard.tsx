'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { ProductListItem } from '@/lib/queries/product'
import { useCart } from '@/lib/cart-context'
import styles from './ProductCard.module.scss'

const SPEC_EMOJI: Record<string, string> = {
  screen:       '📱',
  chip:         '🍎',
  camera:       '📷',
  battery:      '🔋',
  cpu:          '🔧',
  gpu:          '🎮',
  os:           '💻',
  weight:       '⚖️',
  refresh_rate: '🖥️',
  resolution:   '🖥️',
  connectivity: '📡',
  driver:       '🔊',
  frequency:    '🎵',
  ram:          '💾',
  storage:      '💿',
}

export default function ProductCard({ product }: { product: ProductListItem }) {
  const groups = Object.entries(product.variantGroups)
  const { addItem } = useCart()
  const router = useRouter()

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const first = product.variants[0]
    if (!first) return Object.fromEntries(groups.map(([key, g]) => [key, g.values[0]?.value ?? '']))
    return Object.fromEntries(first.options.map(o => [o.attribute, o.value]))
  })

  const activeVariant = useMemo(() =>
    product.variants.find((v) =>
      v.options.every((o) => selected[o.attribute] === o.value)
    ),
    [selected, product.variants]
  )

  const priceText = activeVariant?.priceText ?? product.priceText

  function handleBuy(e: React.MouseEvent) {
    e.preventDefault()
    const variant = activeVariant ?? product.variants[0]
    if (!variant) { router.push(`/products/${product.slug}`); return }
    addItem({
      variantId: variant.id,
      name: product.name,
      slug: product.slug,
      price: variant.price,
      priceText: variant.priceText,
      image: product.image?.url ?? null,
      options: variant.options.map(o => ({ attribute: o.attribute, value: o.value, displayValue: o.displayValue ?? o.value })),
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
          {product.isFeatured && (
            <span className={styles.badge}>Nổi bật</span>
          )}
        </div>
      </Link>

      <div className={styles.body}>
        <Link href={`/products/${product.slug}`} className={styles.nameLink}>
          <h3 className={styles.name}>{product.name}</h3>
        </Link>

        <p className={styles.price}>{priceText}</p>

        {product.specs.length > 0 && (
          <div className={styles.specs}>
            {product.specs.map((spec) => (
              <div key={spec.name} className={styles.specRow}>
                <span className={styles.specEmoji}>
                  {SPEC_EMOJI[spec.name] ?? '•'}
                </span>
                <span className={styles.specText}>
                  <span className={styles.specLabel}>{spec.displayName}: </span>
                  <span className={styles.specValue}>{spec.textValue}</span>
                </span>
              </div>
            ))}
          </div>
        )}

        {groups.map(([key, group]) => (
          <div key={key} className={styles.variantGroup}>
            <p className={styles.variantLabel}>{group.displayName}:</p>
            <div className={styles.variantOptions}>
              {group.values.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  className={`${styles.variantBtn}${selected[key] === v.value ? ` ${styles.variantBtnActive}` : ''}`}
                  onClick={(e) => {
                    e.preventDefault()
                    setSelected((prev) => ({ ...prev, [key]: v.value }))
                  }}
                >
                  {v.colorHex && (
                    <span
                      className={styles.colorDot}
                      style={{ '--dot-color': v.colorHex } as React.CSSProperties}
                    />
                  )}
                  {v.displayValue}
                </button>
              ))}
            </div>
          </div>
        ))}

        <button type="button" className={styles.buyBtn} onClick={handleBuy}>
          Mua ngay
        </button>
      </div>
    </div>
  )
}
