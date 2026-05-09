import { NextRequest, NextResponse } from "next/server";
import { getProducts, type ProductListParams } from "@/lib/queries/product";

const SORT_VALUES = new Set<ProductListParams["sortBy"]>([
  "price_asc",
  "price_desc",
  "newest",
  "popular",
]);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const rawSort = searchParams.get("sortBy");
    const sortBy = SORT_VALUES.has(rawSort as ProductListParams["sortBy"])
      ? (rawSort as ProductListParams["sortBy"])
      : undefined;

    const params = {
      page: Number(searchParams.get("page") ?? 1),
      limit: Math.min(Number(searchParams.get("limit") ?? 12), 50),
      search: searchParams.get("search") ?? undefined,
      categoryId: searchParams.get("categoryId")
        ? Number(searchParams.get("categoryId"))
        : undefined,
      brandId: searchParams.get("brandId")
        ? Number(searchParams.get("brandId"))
        : undefined,
      minPrice: searchParams.get("minPrice")
        ? Number(searchParams.get("minPrice"))
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : undefined,
      sortBy,
    };

    const result = await getProducts(params);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("[GET /api/products]", error);
    return NextResponse.json(
      { error: "Không thể tải danh sách sản phẩm" },
      { status: 500 },
    );
  }
}
