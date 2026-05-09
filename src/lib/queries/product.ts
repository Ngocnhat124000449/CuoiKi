import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────

export type ProductListParams = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price_asc" | "price_desc" | "newest" | "popular";
};

// ─── Helpers ──────────────────────────────────────────────

export function formatVND(amount: Prisma.Decimal | number) {
  const num = typeof amount === "number" ? amount : amount.toNumber();
  return new Intl.NumberFormat("vi-VN").format(num) + "đ";
}

function buildOrderBy(sortBy?: string): Prisma.ProductOrderByWithRelationInput {
  switch (sortBy) {
    case "price_asc":
      return { basePrice: "asc" };
    case "price_desc":
      return { basePrice: "desc" };
    case "newest":
      return { createdAt: "desc" };
    default:
      return { createdAt: "desc" };
  }
}

// ─── Queries ──────────────────────────────────────────────

// Danh sách sản phẩm (dùng cho trang listing)
export async function getProducts(params: ProductListParams = {}) {
  const {
    page = 1,
    limit = 12,
    search,
    categoryId,
    brandId,
    minPrice,
    maxPrice,
    sortBy,
  } = params;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(categoryId && { categoryId }),
    ...(brandId && { brandId }),
    ...((minPrice || maxPrice) && {
      basePrice: {
        ...(minPrice && { gte: minPrice }),
        ...(maxPrice && { lte: maxPrice }),
      },
    }),
  };

  const [items, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: buildOrderBy(sortBy),
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        basePrice: true,
        isFeatured: true,
        brand: { select: { name: true } },
        category: { select: { name: true, slug: true } },
        // Chỉ lấy ảnh chính — tránh over-fetch
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { url: true, altText: true },
        },
        // Giá thấp nhất trong các variant
        variants: {
          where: { isActive: true },
          orderBy: { price: "asc" },
          take: 1,
          select: { price: true, sku: true },
        },
        // Điểm đánh giá trung bình
        reviews: {
          where: { isApproved: true },
          select: { rating: true },
        },
      },
    }),
    db.product.count({ where }),
  ]);

  // Tính rating trung bình
  const products = items.map((p) => {
    const ratings = p.reviews.map((r) => r.rating);
    const avgRating = ratings.length
      ? +(ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : null;
    const lowestPrice = p.variants[0]?.price ?? p.basePrice;

    return {
      id: Number(p.id),
      name: p.name,
      slug: p.slug,
      price: lowestPrice.toNumber(),
      priceText: formatVND(lowestPrice),
      image: p.images[0] ?? null,
      brand: p.brand?.name ?? null,
      category: p.category,
      avgRating,
      isFeatured: p.isFeatured,
      reviewCount: ratings.length,
    };
  });

  return {
    data: products,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
}

// ─────────────────────────────────────────────────────────

// Chi tiết 1 sản phẩm theo slug
export async function getProductBySlug(slug: string) {
  const product = await db.product.findFirst({
    // ← findFirst thay vì findUnique
    where: { slug, isActive: true }, // ← giờ hoạt động bình thường
    include: {
      brand: { select: { name: true, logoUrl: true } },
      category: { select: { name: true, slug: true } },

      images: { orderBy: { displayOrder: "asc" } },

      // Thông số kỹ thuật
      attributeValues: {
        include: {
          attribute: { select: { displayName: true, name: true } },
          value: { select: { displayValue: true } },
        },
        orderBy: { attribute: { displayOrder: "asc" } },
      },

      // Biến thể đầy đủ
      variants: {
        where: { isActive: true },
        orderBy: { price: "asc" },
        include: {
          variantOptions: {
            include: {
              attribute: { select: { name: true, displayName: true } },
              value: {
                select: {
                  value: true,
                  displayValue: true,
                  colorHex: true,
                },
              },
            },
          },
          inventory: {
            select: { quantityOnHand: true, quantityReserved: true },
          },
        },
      },

      // 5 đánh giá mới nhất
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: { select: { fullName: true, avatarUrl: true } },
          images: { select: { url: true } },
        },
      },
    },
  });

  if (!product) return null;

  // Tính rating tổng hợp
  const allRatings = product.reviews.map((r) => r.rating);
  const avgRating = allRatings.length
    ? +(allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1)
    : null;

  // Gom nhóm variant options (storage, color…)
  const variantGroups: Record<
    string,
    {
      displayName: string;
      values: {
        value: string;
        displayValue: string;
        colorHex: string | null;
      }[];
    }
  > = {};

  for (const variant of product.variants) {
    for (const opt of variant.variantOptions) {
      const key = opt.attribute.name;
      if (!variantGroups[key]) {
        variantGroups[key] = {
          displayName: opt.attribute.displayName,
          values: [],
        };
      }
      if (!variantGroups[key].values.some((v) => v.value === opt.value.value)) {
        variantGroups[key].values.push({
          value: opt.value.value,
          displayValue: opt.value.displayValue,
          colorHex: opt.value.colorHex,
        });
      }
    }
  }

  return {
    id: Number(product.id),
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    description: product.description,
    basePrice: product.basePrice.toNumber(),
    basePriceText: formatVND(product.basePrice),
    brand: product.brand,
    category: product.category,
    images: product.images,
    specs: product.attributeValues.map((av) => ({
      name: av.attribute.name,
      displayName: av.attribute.displayName,
      value: av.value.displayValue,
    })),
    variantGroups,
    variants: product.variants.map((v) => ({
      id: Number(v.id),
      sku: v.sku,
      price: v.price.toNumber(),
      priceText: formatVND(v.price),
      compareAtPrice: v.compareAtPrice?.toNumber() ?? null,
      inStock:
        v.inventory.reduce(
          (sum, inv) => sum + inv.quantityOnHand - inv.quantityReserved,
          0,
        ) > 0,
      options: v.variantOptions.map((o) => ({
        attribute: o.attribute.name,
        value: o.value.value,
        displayValue: o.value.displayValue,
        colorHex: o.value.colorHex,
      })),
    })),
    reviews: {
      avg: avgRating,
      count: allRatings.length,
      items: product.reviews.map((r) => ({
        id: Number(r.id),
        rating: r.rating,
        title: r.title,
        content: r.content,
        createdAt: r.createdAt,
        user: r.user,
        images: r.images,
        isVerified: r.isVerifiedPurchase,
      })),
    },
  };
}

export type ProductDetail = NonNullable<
  Awaited<ReturnType<typeof getProductBySlug>>
>;
export type ProductListItem = Awaited<
  ReturnType<typeof getProducts>
>["data"][number];


