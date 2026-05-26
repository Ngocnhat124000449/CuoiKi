import Link from 'next/link'
import { getProducts, type ProductListParams } from '@/lib/queries/product'
import ProductCard from './ProductCard'
import styles from './ProductGrid.module.scss'

function buildPageUrl(params: ProductListParams, targetPage: number): string {
  const sp = new URLSearchParams()
  if (params.search)     sp.set('search',     params.search)
  if (params.sortBy && params.sortBy !== 'newest') sp.set('sortBy', params.sortBy)
  if (params.categoryId) sp.set('categoryId', String(params.categoryId))
  if (params.brandId)    sp.set('brandId',    String(params.brandId))
  if (params.minPrice)   sp.set('minPrice',   String(params.minPrice))
  if (params.maxPrice)   sp.set('maxPrice',   String(params.maxPrice))
  sp.set('page', String(targetPage))
  return `/products?${sp.toString()}`
}

export default async function ProductGrid({ params }: { params: ProductListParams }) {
  const { data, meta } = await getProducts(params)

  if (data.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyIcon}>📭</p>
        <p className={styles.emptyTitle}>Không tìm thấy sản phẩm</p>
        <p className={styles.emptyHint}>Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm</p>
      </div>
    )
  }

  return (
    <div>
      <p className={styles.meta}>Hiển thị {data.length} / {meta.total} sản phẩm</p>
      <div className={styles.grid}>
        {data.map(product => <ProductCard key={product.id} product={product} />)}
      </div>

      {meta.totalPages > 1 && (
        <div className={styles.paginationWrap}>
          {meta.hasPrevPage ? (
            <Link href={buildPageUrl(params, meta.page - 1)} className={styles.pageBtn}>
              ← Trang trước
            </Link>
          ) : (
            <span className={`${styles.pageBtn} ${styles.pageBtnDisabled}`}>← Trang trước</span>
          )}

          <div className={styles.pageNumbers}>
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
              .filter(p => Math.abs(p - meta.page) <= 2 || p === 1 || p === meta.totalPages)
              .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...')
                acc.push(p)
                return acc
              }, [])
              .map((item, idx) =>
                item === '...' ? (
                  <span key={`ellipsis-${idx}`} className={styles.pageEllipsis}>…</span>
                ) : (
                  <Link
                    key={item}
                    href={buildPageUrl(params, item)}
                    className={`${styles.pageNum} ${meta.page === item ? styles.pageNumActive : ''}`}
                  >
                    {item}
                  </Link>
                )
              )}
          </div>

          {meta.hasNextPage ? (
            <Link href={buildPageUrl(params, meta.page + 1)} className={styles.pageBtn}>
              Trang tiếp →
            </Link>
          ) : (
            <span className={`${styles.pageBtn} ${styles.pageBtnDisabled}`}>Trang tiếp →</span>
          )}
        </div>
      )}
    </div>
  )
}
