import { NextResponse } from "next/server";
import { getCategories } from "@/lib/queries/category";

export async function GET() {
  try {
    const categories = await getCategories();

    return NextResponse.json(
      { data: categories },
      { headers: { "Cache-Control": "public, s-maxage=3600" } },
    );
  } catch (error) {
    console.error("[GET /api/categories]", error);
    return NextResponse.json(
      { error: "Không thể tải danh mục" },
      { status: 500 },
    );
  }
}
