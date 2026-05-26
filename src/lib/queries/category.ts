import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";

// Cache danh mục (dữ liệu tĩnh ít đổi) — tránh hit DB mỗi request.
// Refresh sau 1h hoặc khi admin thay đổi danh mục/sản phẩm (revalidateTag).
export const getCategories = unstable_cache(
  _getCategories,
  ["categories-nav"],
  { revalidate: 3600, tags: ["categories"] },
);

async function _getCategories() {
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      parentId: true,
      children: {
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
        select: { id: true, name: true, slug: true, imageUrl: true },
      },
      _count: { select: { products: { where: { isActive: true } } } },
    },
  });

  // Chỉ trả về category gốc (không có parentId)
  return categories
    .filter((c) => c.parentId === null)
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      imageUrl: c.imageUrl,
      productCount: c._count.products,
      children: c.children,
    }));
}
