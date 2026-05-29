// Re-fetch the primary image for one or more products (used to fix verify mismatches).
//
// Usage:
//   npx ts-node --project tsconfig.seed.json prisma/refresh-image.ts <slug> [<slug> ...] [--skip N] [--query "..."]
//
//   --skip N      pick the N-th Commons candidate instead of the best (try a different photo)
//   --query "..." override the Commons search query (applied to every slug given)

import { config } from "dotenv";
config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { uploadProductImage } from "./lib/product-images";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter: new PrismaPg(pool) });

function parseArgs(argv: string[]) {
  const slugs: string[] = [];
  let skip = 0;
  let query: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--skip") skip = Number(argv[++i]) || 0;
    else if (a.startsWith("--skip=")) skip = Number(a.slice(7)) || 0;
    else if (a === "--query") query = argv[++i];
    else if (a.startsWith("--query=")) query = a.slice(8);
    else slugs.push(a);
  }
  return { slugs, skip, query };
}

async function refresh(slug: string, skip: number, queryOverride?: string) {
  const product = await db.product.findUnique({ where: { slug } });
  if (!product) { console.warn(`⚠  không tìm thấy sản phẩm: ${slug}`); return; }

  const query = queryOverride ?? product.name;
  const up = await uploadProductImage(product.name, query, slug, { skip });

  await db.productImage.deleteMany({ where: { productId: product.id } });
  await db.productImage.create({
    data: { productId: product.id, url: up.secureUrl, altText: product.name, isPrimary: true, displayOrder: 0, widthPx: up.width, heightPx: up.height },
  });
  console.log(`✅ ${product.name} ← ${up.source}${up.title ? ` (${up.title})` : ""} [skip=${skip}, query="${query}"]`);
}

async function main() {
  const { slugs, skip, query } = parseArgs(process.argv.slice(2));
  if (slugs.length === 0) {
    console.error('Cần ít nhất 1 slug. VD: refresh-image.ts sony-wh-1000xm5 --skip 1 --query "Sony WH-1000XM5 headphones"');
    process.exit(1);
  }
  for (const slug of slugs) await refresh(slug, skip, query);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
