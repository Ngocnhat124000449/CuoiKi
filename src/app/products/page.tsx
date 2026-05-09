import { Suspense } from 'react'
import ProductGrid from '@/components/product/ProductGrid'
import ProductFilter from '@/components/product/ProductFilter'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import type { Metadata } from 'next'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Tất cả điện thoại' }

type PageProps = {
  searchParams: Promise<{
    page?: string; search?: string; sortBy?: string
    minPrice?: string; maxPrice?: string; categoryId?: string
  }>
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const params = {
    page      : Number(sp.page  ?? 1),
    limit     : 12,
    search    : sp.search    ?? undefined,
    sortBy    : (sp.sortBy   ?? 'newest') as 'newest' | 'price_asc' | 'price_desc',
    minPrice  : sp.minPrice  ? Number(sp.minPrice)  : undefined,
    maxPrice  : sp.maxPrice  ? Number(sp.maxPrice)  : undefined,
    categoryId: sp.categoryId ? Number(sp.categoryId) : undefined,
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>📱 Tất cả điện thoại</h1>
      </div>

      <div className={styles.layout}>
        <div className={styles.sidebar}>
          <ProductFilter />
        </div>
        <div className={styles.content}>
          <Suspense fallback={<ProductGridSkeleton count={12} />}>
            <ProductGrid params={params} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
