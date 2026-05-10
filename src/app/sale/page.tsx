import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { getSaleProducts, type SaleProductSort } from '@/lib/queries/sale'
import SaleCard from '@/components/product/SaleCard'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import styles from './page.module.scss'

export const metadata: Metadata = {
  title: 'Khuyến mãi — Sản phẩm đang giảm giá',
  description: 'Tất cả sản phẩm đang được giảm giá tại PhoneShop. Mua ngay để tiết kiệm nhiều nhất.',
}

const SORT_OPTIONS: { value: SaleProductSort; label: string }[] = [
  { value: 'discount_desc', label: 'Giảm nhiều nhất' },
  { value: 'price_asc',     label: 'Giá thấp nhất' },
  { value: 'price_desc',    label: 'Giá cao nhất' },
  { value: 'newest',        label: 'Mới nhất' },
]

type PageProps = { searchParams: Promise<{ sort?: string }> }

export default async function SalePage({ searchParams }: PageProps) {
  const sp = await searchParams
  const sort = (SORT_OPTIONS.some(o => o.value === sp.sort) ? sp.sort : 'discount_desc') as SaleProductSort

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>🔥 Flash Sale</p>
          <h1 className={styles.heroTitle}>Sản phẩm đang giảm giá</h1>
          <p className={styles.heroSub}>Ưu đãi có hạn — Mua ngay trước khi hết</p>
        </div>
      </section>

      {/* Sort bar */}
      <div className={styles.toolbar}>
        <span className={styles.toolbarLabel}>Sắp xếp theo:</span>
        <div className={styles.sortBtns}>
          {SORT_OPTIONS.map(opt => (
            <Link
              key={opt.value}
              href={`/sale?sort=${opt.value}`}
              className={`${styles.sortBtn} ${sort === opt.value ? styles.sortBtnActive : ''}`}
              scroll={false}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Grid */}
      <Suspense fallback={<ProductGridSkeleton count={8} />}>
        <SaleGrid sort={sort} />
      </Suspense>
    </div>
  )
}

async function SaleGrid({ sort }: { sort: SaleProductSort }) {
  const products = await getSaleProducts(sort)

  if (products.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>🏷️</span>
        <p className={styles.emptyTitle}>Hiện chưa có sản phẩm giảm giá</p>
        <p className={styles.emptyHint}>Quay lại sau để không bỏ lỡ ưu đãi</p>
        <Link href="/products" className={styles.emptyLink}>Xem tất cả sản phẩm</Link>
      </div>
    )
  }

  return (
    <div className={styles.gridWrap}>
      <p className={styles.resultCount}>{products.length} sản phẩm đang giảm giá</p>
      <div className={styles.grid}>
        {products.map(product => (
          <SaleCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
