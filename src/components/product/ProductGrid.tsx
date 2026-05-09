import { getProducts, type ProductListParams } from '@/lib/queries/product'
import ProductCard from './ProductCard'
import styles from './ProductGrid.module.scss'

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
        <p className={styles.pagination}>Trang {meta.page} / {meta.totalPages}</p>
      )}
    </div>
  )
}
