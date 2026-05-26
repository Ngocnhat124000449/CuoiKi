import { db } from '@/lib/db'
import { unstable_cache } from 'next/cache'

// Cache thương hiệu — refresh sau 1h hoặc khi admin sửa brand (revalidateTag).
export const getBrands = unstable_cache(
  _getBrands,
  ['brands-list'],
  { revalidate: 3600, tags: ['brands'] },
)

async function _getBrands() {
  const brands = await db.brand.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })
  return brands.map(b => ({ id: b.id, name: b.name }))
}

export type BrandListItem = { id: number; name: string }
