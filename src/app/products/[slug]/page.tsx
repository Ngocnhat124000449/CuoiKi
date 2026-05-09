import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProductBySlug } from '@/lib/queries/product'
import VariantSelector from '@/components/product/VariantSelector'
import styles from './page.module.scss'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Không tìm thấy sản phẩm' }
  return {
    title: product.name,
    description: product.shortDescription ?? product.name,
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const primaryImage = product.images[0]

  return (
    <div className={styles.page}>

      {/* Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">Trang chủ</Link>
        <span className={styles.sep}>/</span>
        <Link href="/products">Điện thoại</Link>
        {product.category && (
          <>
            <span className={styles.sep}>/</span>
            <Link href={`/products?categoryId=${product.category.slug}`}>
              {product.category.name}
            </Link>
          </>
        )}
        <span className={styles.sep}>/</span>
        <span className={styles.current}>{product.name}</span>
      </nav>

      {/* Product grid: image + info */}
      <div className={styles.grid}>

        {/* Gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainImg}>
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={primaryImage.altText ?? product.name}
                fill
                sizes="(max-width:768px) 100vw, 50vw"
                style={{ objectFit: 'contain', padding: '16px' }}
                priority
              />
            ) : (
              <div className={styles.imgPlaceholder}>📱</div>
            )}
          </div>

          {product.images.length > 1 && (
            <div className={styles.thumbRow}>
              {product.images.slice(0, 6).map((img, i) => (
                <div key={i} className={styles.thumb}>
                  <Image
                    src={img.url}
                    alt={img.altText ?? ''}
                    fill
                    style={{ objectFit: 'contain', padding: '4px' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className={styles.info}>
          {product.brand && (
            <p className={styles.brand}>{product.brand.name}</p>
          )}

          <h1 className={styles.productName}>{product.name}</h1>

          {product.reviews.count > 0 && (
            <div className={styles.ratingRow}>
              <span className={styles.stars}>
                {'★'.repeat(Math.round(product.reviews.avg ?? 0))}
                {'☆'.repeat(5 - Math.round(product.reviews.avg ?? 0))}
              </span>
              <span className={styles.ratingText}>
                {product.reviews.avg} ({product.reviews.count} đánh giá)
              </span>
            </div>
          )}

          {product.shortDescription && (
            <p className={styles.shortDesc}>{product.shortDescription}</p>
          )}

          <div className={styles.divider} />

          <VariantSelector
            variantGroups={product.variantGroups}
            variants={product.variants}
          />
        </div>
      </div>

      {/* Specifications */}
      {product.specs.length > 0 && (
        <section className={styles.specsSection}>
          <h2 className={styles.specsTitle}>Thông số kỹ thuật</h2>
          <div className={styles.specsTable}>
            {product.specs.map(spec => (
              <div key={spec.name} className={styles.specRow}>
                <span className={styles.specKey}>{spec.displayName}</span>
                <span className={styles.specVal}>{spec.value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      {product.reviews.items.length > 0 && (
        <section className={styles.reviewsSection}>
          <h2 className={styles.reviewsTitle}>
            Đánh giá ({product.reviews.count})
          </h2>
          <div className={styles.reviewList}>
            {product.reviews.items.map(review => (
              <div key={review.id} className={styles.reviewCard}>
                <div className={styles.reviewHead}>
                  <div className={styles.avatar}>
                    {review.user?.fullName?.[0] ?? '?'}
                  </div>
                  <div>
                    <p className={styles.reviewerName}>
                      {review.user?.fullName ?? 'Ẩn danh'}
                    </p>
                    <span className={styles.reviewStars}>
                      {'★'.repeat(review.rating)}
                    </span>
                  </div>
                  {review.isVerified && (
                    <span className={styles.verifiedBadge}>✓ Đã mua</span>
                  )}
                </div>
                {review.title && (
                  <p className={styles.reviewTitle}>{review.title}</p>
                )}
                {review.content && (
                  <p className={styles.reviewContent}>{review.content}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
