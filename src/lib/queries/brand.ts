import { db } from '@/lib/db'

export async function getBrands() {
  const brands = await db.brand.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })
  return brands.map(b => ({ id: b.id, name: b.name }))
}

export type BrandListItem = { id: number; name: string }
