import { Suspense } from 'react'
import Link from 'next/link'
import ProductCard from '@/components/product/ProductCard'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import SectionHeader from '@/components/ui/SectionHeader'
import FlashTimer from '@/components/ui/FlashTimer'
import { getProducts } from '@/lib/queries/product'
import { getCategories } from '@/lib/queries/category'
import styles from './page.module.scss'

// ─── Static data ──────────────────────────────────────────────────────────────

const BRANDS = [
  { emoji: '🍎', name: 'Apple',   href: '/products?search=iPhone'  },
  { emoji: '🌟', name: 'Samsung', href: '/products?search=Samsung' },
  { emoji: '⚡', name: 'Xiaomi',  href: '/products?search=Xiaomi'  },
  { emoji: '🔵', name: 'OPPO',    href: '/products?search=OPPO'    },
  { emoji: '🟢', name: 'Vivo',    href: '/products?search=Vivo'    },
  { emoji: '🔴', name: 'Realme',  href: '/products?search=Realme'  },
  { emoji: '🟡', name: 'Nokia',   href: '/products?search=Nokia'   },
  { emoji: '🟠', name: 'Sony',    href: '/products?search=Sony'    },
]

const PROMOS = [
  {
    icon: '💳',
    title: 'Trả góp 0% lãi suất',
    sub: 'Duyệt nhanh trong 5 phút',
    variant: 'red',
    href: '#',
  },
  {
    icon: '🔄',
    title: 'Thu cũ đổi mới',
    sub: 'Lên đời tiết kiệm hơn',
    variant: 'navy',
    href: '/about',
  },
  {
    icon: '🚚',
    title: 'Giao hàng trong 2 giờ',
    sub: 'Miễn phí từ 500.000đ',
    variant: 'orange',
    href: '#',
  },
]

// ─── Sections ─────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroContent}>
          <span className={styles.heroTag}>🔥 Ưu đãi đặc biệt hôm nay</span>
          <h1 className={styles.heroTitle}>
            Điện thoại<br />
            <em>chính hãng</em><br />
            giá tốt nhất
          </h1>
          <p className={styles.heroSub}>
            Hơn 500+ mẫu sản phẩm từ Apple, Samsung, Xiaomi và nhiều thương hiệu lớn.
            Cam kết hàng thật, bảo hành chính hãng.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/products" className={styles.heroBtnPrimary}>
              Mua ngay →
            </Link>
            <Link href="/about" className={styles.heroBtnOutline}>
              Tìm hiểu thêm
            </Link>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <strong>500+</strong>
              <span>Sản phẩm</span>
            </div>
            <div className={styles.heroStat}>
              <strong>50K+</strong>
              <span>Khách hàng</span>
            </div>
            <div className={styles.heroStat}>
              <strong>4.9★</strong>
              <span>Đánh giá</span>
            </div>
          </div>
        </div>
        <div className={styles.heroImage}>📱</div>
      </div>
    </section>
  )
}

async function FlashSaleSection() {
  const { data } = await getProducts({ limit: 5, sortBy: 'price_asc' })
  if (!data.length) return null
  return (
    <section className={styles.flashSale}>
      <div className={styles.flashInner}>
        <div className={styles.flashHead}>
          <div className={styles.flashTitle}>
            <span className={styles.flashLabel}>⚡ Flash Sale</span>
            <FlashTimer />
          </div>
          <Link href="/products?sortBy=price_asc" className={styles.flashLink}>
            Xem tất cả →
          </Link>
        </div>
        <div className={styles.flashGrid}>
          {data.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  )
}

async function FeaturedSection() {
  const { data } = await getProducts({ limit: 8, sortBy: 'newest' })
  if (!data.length) return null
  return (
    <section className={styles.section}>
      <SectionHeader title="Sản phẩm nổi bật" icon="🏆" href="/products" />
      <div className={styles.featuredGrid}>
        {data.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  )
}

async function CategorySection() {
  const categories = await getCategories()
  if (!categories.length) return null
  return (
    <section className={styles.sectionNoTop}>
      <SectionHeader title="Danh mục sản phẩm" icon="📂" href="/products" />
      <div className={styles.catGrid}>
        {categories.map(cat => (
          <Link
            key={cat.id}
            href={`/products?categoryId=${cat.id}`}
            className={styles.catCard}
          >
            <span className={styles.catIcon}>📱</span>
            <span className={styles.catLabel}>{cat.name}</span>
            <span className={styles.catCount}>{cat.productCount} sp</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

function BrandSection() {
  return (
    <section className={styles.sectionNoTop}>
      <SectionHeader title="Thương hiệu nổi bật" icon="🌐" />
      <div className={styles.brandRow}>
        {BRANDS.map(b => (
          <Link key={b.name} href={b.href} className={styles.brandCard}>
            <span className={styles.brandEmoji}>{b.emoji}</span>
            <span className={styles.brandName}>{b.name}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

function PromoBanners() {
  return (
    <section className={styles.sectionNoTop}>
      <div className={styles.promoBanners}>
        {PROMOS.map(p => (
          <Link
            key={p.title}
            href={p.href}
            className={`${styles.promoBanner} ${styles[p.variant as keyof typeof styles]}`}
          >
            <span className={styles.promoBannerIcon}>{p.icon}</span>
            <div className={styles.promoBannerText}>
              <strong>{p.title}</strong>
              <span>{p.sub}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div>
      <HeroSection />

      <Suspense fallback={null}>
        <FlashSaleSection />
      </Suspense>

      <Suspense
        fallback={
          <section className={styles.section}>
            <SectionHeader title="Sản phẩm nổi bật" icon="🏆" href="/products" />
            <ProductGridSkeleton count={8} />
          </section>
        }
      >
        <FeaturedSection />
      </Suspense>

      <Suspense fallback={null}>
        <CategorySection />
      </Suspense>

      <BrandSection />
      <PromoBanners />
    </div>
  )
}
