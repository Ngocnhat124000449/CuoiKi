import { Suspense } from 'react'
import Link from 'next/link'
import ProductCard from '@/components/product/ProductCard'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import SectionHeader from '@/components/ui/SectionHeader'
import FlashTimer from '@/components/ui/FlashTimer'
import NewsletterForm from '@/components/home/NewsletterForm'
import { getFlashSaleProducts, getFeaturedProducts } from '@/lib/queries/product'
import { getCategories } from '@/lib/queries/category'
import styles from './page.module.scss'

// ─── Static data ──────────────────────────────────────────────────────────────

const CATEGORY_ICON: Record<string, string> = {
  'điện thoại': '📱', 'phone': '📱', 'smartphone': '📱',
  'laptop': '💻', 'máy tính xách tay': '💻', 'notebook': '💻',
  'âm thanh': '🎧', 'tai nghe': '🎧', 'loa': '🎧', 'audio': '🎧',
  'đồng hồ': '⌚', 'watch': '⌚',
  'máy ảnh': '📷', 'camera': '📷',
  'pc': '🖥️', 'màn hình': '🖥️', 'pc & màn hình': '🖥️', 'desktop': '🖥️',
  'tivi': '📺', 'tv': '📺', 'television': '📺',
  'gia dụng': '🏠', 'household': '🏠', 'smart home': '🏠',
  'phụ kiện': '🔌', 'accessory': '🔌', 'accessories': '🔌',
  'gaming': '🎮', 'game': '🎮',
  'máy tính bảng': '📟', 'tablet': '📟', 'ipad': '📟',
}

function getCatIcon(name: string): string {
  const key = name.toLowerCase()
  for (const [k, v] of Object.entries(CATEGORY_ICON)) {
    if (key.includes(k)) return v
  }
  return '📦'
}

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
        <div className={styles.heroImage}>
          <div className={styles.heroImgMain}>📱</div>
          <div className={`${styles.heroImgOrbit} ${styles.heroImgOrbit1}`}>💻</div>
          <div className={`${styles.heroImgOrbit} ${styles.heroImgOrbit2}`}>⌚</div>
          <div className={`${styles.heroImgOrbit} ${styles.heroImgOrbit3}`}>🎧</div>
          <div className={`${styles.heroImgOrbit} ${styles.heroImgOrbit4}`}>📷</div>
        </div>
      </div>
    </section>
  )
}

async function FlashSaleSection() {
  const data = await getFlashSaleProducts()
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
        <div className={styles.flashGrid} data-stagger>
          {data.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  )
}

async function FeaturedSection() {
  const data = await getFeaturedProducts()
  if (!data.length) return null
  return (
    <section className={styles.section}>
      <SectionHeader title="Sản phẩm nổi bật" icon="🏆" href="/products" />
      <div className={styles.featuredGrid} data-stagger>
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
      <div className={styles.catGrid} data-stagger>
        {categories.map(cat => (
          <Link
            key={cat.id}
            href={`/products?categoryId=${cat.id}`}
            className={styles.catCard}
          >
            <span className={styles.catIcon}>{getCatIcon(cat.name)}</span>
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
      <div className={styles.brandRow} data-stagger>
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
      <div className={styles.promoBanners} data-stagger>
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

function NewsletterSection() {
  return (
    <section className={styles.newsletter}>
      <div className={styles.newsletterInner}>
        <div className={styles.newsletterText}>
          <span className={styles.newsletterEyebrow}>Bản tin PhoneShop</span>
          <h2 className={styles.newsletterTitle}>Nhận ưu đãi độc quyền mỗi tuần</h2>
          <p className={styles.newsletterSub}>
            Đăng ký để không bỏ lỡ flash sale, sản phẩm mới ra mắt và mã giảm giá đặc biệt.
            Hơn <strong>10.000 thành viên</strong> đã tham gia.
          </p>
          <ul className={styles.newsletterPerks}>
            <li>🎁 Mã giảm 5% cho đơn đầu tiên</li>
            <li>⚡ Thông báo flash sale trước 1 giờ</li>
            <li>📦 Cập nhật sản phẩm mới hàng tuần</li>
          </ul>
        </div>
        <div className={styles.newsletterFormWrap}>
          <p className={styles.newsletterFormLabel}>Nhập email để đăng ký miễn phí:</p>
          <NewsletterForm />
          <p className={styles.newsletterPrivacy}>
            Chúng tôi tôn trọng quyền riêng tư của bạn. Hủy đăng ký bất cứ lúc nào.
          </p>
        </div>
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
      <NewsletterSection />
    </div>
  )
}
