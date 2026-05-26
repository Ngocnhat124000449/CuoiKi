'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState, useEffect } from 'react'
import styles from './ProductFilter.module.scss'

type Item = { id: number; name: string }

const SORT_OPTIONS = [
  { value: 'newest',     label: '🆕 Mới nhất'     },
  { value: 'price_asc',  label: '⬆ Giá tăng dần' },
  { value: 'price_desc', label: '⬇ Giá giảm dần' },
]

const PRICE_RANGES = [
  { label: 'Tất cả',        min: undefined,  max: undefined   },
  { label: 'Dưới 5 triệu',  min: undefined,  max: 5_000_000   },
  { label: '5 – 10 triệu',  min: 5_000_000,  max: 10_000_000  },
  { label: '10 – 20 triệu', min: 10_000_000, max: 20_000_000  },
  { label: '20 – 35 triệu', min: 20_000_000, max: 35_000_000  },
  { label: 'Trên 35 triệu', min: 35_000_000, max: undefined   },
]

export default function ProductFilter({
  categories = [],
  brands = [],
}: {
  categories?: Item[]
  brands?: Item[]
}) {
  const router   = useRouter()
  const pathname = usePathname()
  const sp       = useSearchParams()

  // Build URL từ snapshot hiện tại + các thay đổi, reset về trang 1
  const push = useCallback((overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams(sp.toString())
    params.delete('page')
    for (const [key, val] of Object.entries(overrides)) {
      if (val !== undefined) params.set(key, val)
      else params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, sp])

  const currentSort     = sp.get('sortBy')     ?? 'newest'
  const currentMin      = sp.get('minPrice')   ?? ''
  const currentMax      = sp.get('maxPrice')   ?? ''
  const currentCat      = sp.get('categoryId') ?? ''
  const currentBrand    = sp.get('brandId')    ?? ''

  const [search, setSearch] = useState(sp.get('search') ?? '')
  useEffect(() => { setSearch(sp.get('search') ?? '') }, [sp])

  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.title}>🔎 Bộ lọc</h2>

      {/* Search */}
      <div className={styles.group}>
        <p className={styles.groupLabel}>Tìm kiếm</p>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tên sản phẩm..."
          className={styles.searchInput}
          onKeyDown={e => {
            if (e.key === 'Enter')
              push({ search: search || undefined })
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
              onClick={() => push({ sortBy: opt.value })}
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
              String(range.min ?? '') === currentMin &&
              String(range.max ?? '') === currentMax
            return (
              <button
                key={range.label}
                type="button"
                onClick={() => push({
                  minPrice: range.min?.toString(),
                  maxPrice: range.max?.toString(),
                })}
                className={`${styles.optionBtn} ${active ? styles.active : ''}`}
              >
                {range.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <>
          <div className={styles.divider} />
          <div className={styles.group}>
            <p className={styles.groupLabel}>Danh mục</p>
            <div className={styles.optionList}>
              <button
                type="button"
                onClick={() => push({ categoryId: undefined })}
                className={`${styles.optionBtn} ${!currentCat ? styles.active : ''}`}
              >
                Tất cả danh mục
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => push({ categoryId: String(cat.id) })}
                  className={`${styles.optionBtn} ${currentCat === String(cat.id) ? styles.active : ''}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <>
          <div className={styles.divider} />
          <div className={styles.group}>
            <p className={styles.groupLabel}>Thương hiệu</p>
            <div className={styles.optionList}>
              <button
                type="button"
                onClick={() => push({ brandId: undefined })}
                className={`${styles.optionBtn} ${!currentBrand ? styles.active : ''}`}
              >
                Tất cả thương hiệu
              </button>
              {brands.map(brand => (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => push({ brandId: String(brand.id) })}
                  className={`${styles.optionBtn} ${currentBrand === String(brand.id) ? styles.active : ''}`}
                >
                  {brand.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </aside>
  )
}
