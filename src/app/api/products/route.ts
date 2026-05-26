import { NextRequest, NextResponse } from "next/server";
import { getProducts, type ProductListParams } from "@/lib/queries/product";

const SORT_VALUES = new Set<ProductListParams["sortBy"]>([
  "price_asc",
  "price_desc",
  "newest",
]);

function toNum(s: string | null, fallback: number): number {
  const n = Number(s);
  return !s || isNaN(n) ? fallback : n;
}
function toNumOpt(s: string | null): number | undefined {
  const n = Number(s);
  return !s || isNaN(n) ? undefined : n;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const rawSort = searchParams.get("sortBy");
    const sortBy = SORT_VALUES.has(rawSort as ProductListParams["sortBy"])
      ? (rawSort as ProductListParams["sortBy"])
      : undefined;

    const params = {
      page: toNum(searchParams.get("page"), 1),
      limit: Math.min(toNum(searchParams.get("limit"), 12), 50),
      search: searchParams.get("search") ?? undefined,
      categoryId: toNumOpt(searchParams.get("categoryId")),
      brandId: toNumOpt(searchParams.get("brandId")),
      minPrice: toNumOpt(searchParams.get("minPrice")),
      maxPrice: toNumOpt(searchParams.get("maxPrice")),
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
