import { Suspense } from 'react'
import ProductGrid from '@/components/product/ProductGrid'
import ProductFilter from '@/components/product/ProductFilter'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import { getCategories } from '@/lib/queries/category'
import { getBrands } from '@/lib/queries/brand'
import type { Metadata } from 'next'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Tất cả sản phẩm' }

type PageProps = {
  searchParams: Promise<{
    page?: string; search?: string; sortBy?: string
    minPrice?: string; maxPrice?: string
    categoryId?: string; brandId?: string
  }>
}

function toNum(v: string | undefined, fallback: number) {
  const n = Number(v); return !v || isNaN(n) ? fallback : n
}
function toNumOpt(v: string | undefined) {
  const n = Number(v); return !v || isNaN(n) ? undefined : n
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const params = {
    page      : toNum(sp.page, 1),
    limit     : 12,
    search    : sp.search    ?? undefined,
    sortBy    : (sp.sortBy   ?? 'newest') as 'newest' | 'price_asc' | 'price_desc',
    minPrice  : toNumOpt(sp.minPrice),
    maxPrice  : toNumOpt(sp.maxPrice),
    categoryId: toNumOpt(sp.categoryId),
    brandId   : toNumOpt(sp.brandId),
  }

  const [categories, brands] = await Promise.all([getCategories(), getBrands()])

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>📱 Tất cả sản phẩm</h1>
      </div>

      <div className={styles.layout}>
        <div className={styles.sidebar}>
          <ProductFilter categories={categories} brands={brands} />
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
