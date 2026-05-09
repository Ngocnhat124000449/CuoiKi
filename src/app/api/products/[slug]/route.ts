import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/queries/product";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }, // ← Promise
) {
  try {
    const { slug } = await params; // ← phải await

    const product = await getProductBySlug(slug);

    if (!product) {
      return NextResponse.json(
        { error: "Không tìm thấy sản phẩm" },
        { status: 404 },
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("[GET /api/products/[slug]]", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
