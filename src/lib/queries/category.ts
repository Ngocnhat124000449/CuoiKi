import { db } from "@/lib/db";

export async function getCategories() {
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
