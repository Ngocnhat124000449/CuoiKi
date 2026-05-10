import { db } from '@/lib/db'
import { formatVND } from './product'

export type SaleProductSort = 'discount_desc' | 'price_asc' | 'price_desc' | 'newest'

export async function getSaleProducts(sort: SaleProductSort = 'discount_desc') {
  const rows = await db.product.findMany({
    where: {
      isActive: true,
      variants: {
        some: {
          isActive: true,
          compareAtPrice: { not: null },
        },
      },
    },
    orderBy: sort === 'newest'
      ? { createdAt: 'desc' }
      : sort === 'price_asc'
        ? { basePrice: 'asc' }
        : sort === 'price_desc'
          ? { basePrice: 'desc' }
          : { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      isFeatured: true,
      brand: { select: { name: true } },
      category: { select: { name: true, slug: true } },
      images: {
        where: { isPrimary: true },
        take: 1,
        select: { url: true, altText: true },
      },
      variants: {
        where: { isActive: true },
        orderBy: { price: 'asc' },
        select: {
          id: true,
          price: true,
          compareAtPrice: true,
          variantOptions: {
            select: {
              attribute: { select: { name: true, displayName: true } },
              value: { select: { value: true, displayValue: true, colorHex: true } },
            },
          },
        },
      },
      reviews: {
        where: { isApproved: true },
        select: { rating: true },
      },
    },
  })

  const products = rows
    .map((p) => {
      // Chỉ lấy variant nào thực sự giảm giá (compareAtPrice > price)
      const saleVariants = p.variants.filter(
        (v) => v.compareAtPrice !== null && v.compareAtPrice.toNumber() > v.price.toNumber(),
      )
      if (saleVariants.length === 0) return null

      // Chọn variant có % giảm cao nhất
      const best = saleVariants.reduce((acc, v) => {
        const pct = 1 - v.price.toNumber() / v.compareAtPrice!.toNumber()
        const accPct = 1 - acc.price.toNumber() / acc.compareAtPrice!.toNumber()
        return pct > accPct ? v : acc
      })

      const salePrice = best.price.toNumber()
      const origPrice = best.compareAtPrice!.toNumber()
      const discountPct = Math.round((1 - salePrice / origPrice) * 100)
      const savedAmount = origPrice - salePrice

      const ratings = p.reviews.map((r) => r.rating)
      const avgRating = ratings.length
        ? +(ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
        : null

      return {
        id: Number(p.id),
        name: p.name,
        slug: p.slug,
        isFeatured: p.isFeatured,
        image: p.images[0] ?? null,
        brand: p.brand?.name ?? null,
        category: p.category,
        salePrice,
        salePriceText: formatVND(salePrice),
        origPrice,
        origPriceText: formatVND(origPrice),
        discountPct,
        savedAmountText: formatVND(savedAmount),
        avgRating,
        reviewCount: ratings.length,
        variantId: Number(best.id),
        options: best.variantOptions.map((o) => ({
          attribute: o.attribute.name,
          displayName: o.attribute.displayName,
          value: o.value.value,
          displayValue: o.value.displayValue,
          colorHex: o.value.colorHex,
        })),
      }
    })
    .filter((p): p is NonNullable<typeof p> => p !== null)

  // Sort discount_desc cần xử lý sau khi map
  if (sort === 'discount_desc') {
    products.sort((a, b) => b.discountPct - a.discountPct)
  }

  return products
}

export type SaleProduct = Awaited<ReturnType<typeof getSaleProducts>>[number]
