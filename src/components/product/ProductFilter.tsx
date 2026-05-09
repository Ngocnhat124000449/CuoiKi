'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import styles from './ProductFilter.module.scss'

const SORT_OPTIONS = [
  { value: 'newest',     label: '🆕 Mới nhất'     },
  { value: 'price_asc',  label: '⬆ Giá tăng dần' },
  { value: 'price_desc', label: '⬇ Giá giảm dần' },
]

const PRICE_RANGES = [
  { label: 'Tất cả',          min: undefined,  max: undefined   },
  { label: 'Dưới 5 triệu',    min: undefined,  max: 5_000_000   },
  { label: '5 – 10 triệu',    min: 5_000_000,  max: 10_000_000  },
  { label: '10 – 20 triệu',   min: 10_000_000, max: 20_000_000  },
  { label: '20 – 35 triệu',   min: 20_000_000, max: 35_000_000  },
  { label: 'Trên 35 triệu',   min: 35_000_000, max: undefined   },
]

export default function ProductFilter() {
  const router   = useRouter()
  const pathname = usePathname()
  const sp       = useSearchParams()

  const update = useCallback((key: string, value: string | undefined) => {
    const params = new URLSearchParams(sp.toString())
    if (value) params.set(key, value); else params.delete(key)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, sp])

  const currentSort = sp.get('sortBy') ?? 'newest'
  const currentMin  = sp.get('minPrice')
  const currentMax  = sp.get('maxPrice')

  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.title}>🔎 Bộ lọc</h2>

      {/* Search */}
      <div className={styles.group}>
        <p className={styles.groupLabel}>Tìm kiếm</p>
        <input
          type="text"
          defaultValue={sp.get('search') ?? ''}
          placeholder="Tên sản phẩm..."
          className={styles.searchInput}
          onKeyDown={e => {
            if (e.key === 'Enter')
              update('search', (e.target as HTMLInputElement).value || undefined)
          }}
        />
      </div>

      <div className={styles.divider} />

      {/* Sort */}
      <div className={styles.group}>
        <p className={styles.groupLabel}>Sắp xếp</p>
        <div className={styles.optionList}>
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update('sortBy', opt.value)}
              className={`${styles.optionBtn} ${currentSort === opt.value ? styles.active : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.divider} />

      {/* Price */}
      <div className={styles.group}>
        <p className={styles.groupLabel}>Khoảng giá</p>
        <div className={styles.optionList}>
          {PRICE_RANGES.map(range => {
            const active =
              String(range.min ?? '') === (currentMin ?? '') &&
              String(range.max ?? '') === (currentMax ?? '')
            return (
              <button
                key={range.label}
                type="button"
                onClick={() => {
                  update('minPrice', range.min?.toString())
                  update('maxPrice', range.max?.toString())
                }}
                className={`${styles.optionBtn} ${active ? styles.active : ''}`}
              >
                {range.label}
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
