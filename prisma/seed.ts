import { config } from "dotenv";
config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { uploadProductImage } from "./lib/product-images";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter: new PrismaPg(pool) });

// ─── helpers ────────────────────────────────────────────────────────────────

async function avFindOrCreate(attributeId: number, value: string, displayValue: string, extra?: { colorHex?: string; displayOrder?: number }) {
  const existing = await db.attributeValue.findFirst({ where: { attributeId, value } });
  if (existing) return existing;
  return db.attributeValue.create({ data: { attributeId, value, displayValue, displayOrder: extra?.displayOrder ?? 0, colorHex: extra?.colorHex } });
}

async function upsertSpec(productId: bigint, attributeId: number, textValue: string) {
  await db.productAttributeValue.upsert({
    where: { productId_attributeId: { productId, attributeId } },
    update: { textValue },
    create: { productId, attributeId, textValue },
  });
}

async function addInventory(variantId: bigint, warehouseId: number, qty = 30) {
  await db.inventory.upsert({
    where: { variantId_warehouseId: { variantId, warehouseId } },
    update: {},
    create: { variantId, warehouseId, quantityOnHand: qty },
  });
}

// FK-safe wipe of all product data. Also clears the order + review graphs, which hold
// non-cascade FKs to products/variants that would otherwise block deletion.
// (Confirmed with user: the only existing order is test data and may be removed.)
async function wipeProducts() {
  const before = await db.product.count();
  const orders = await db.order.count();
  const reviews = await db.review.count();
  if (orders > 0 || reviews > 0) {
    console.log(`🧹 Xóa graph đơn hàng/đánh giá (orders=${orders}, reviews=${reviews})`);
  }

  // Reviews (reference products + order_items, no cascade) — children cascade on review delete.
  await db.reviewVote.deleteMany();
  await db.reviewImage.deleteMany();
  await db.review.deleteMany();

  // Order graph (order_items reference variants; payments/refunds/etc. reference orders, no cascade).
  await db.couponUsage.deleteMany();
  await db.refund.deleteMany();
  await db.payment.deleteMany();
  await db.orderStatusHistory.deleteMany();
  await db.shippingInfo.deleteMany();
  await db.orderItem.deleteMany();
  await db.order.deleteMany();

  await db.productImage.deleteMany();
  await db.variantOption.deleteMany();
  await db.productAttributeValue.deleteMany();
  await db.cartItem.deleteMany();
  await db.wishlistItem.deleteMany();
  await db.inventoryTransaction.deleteMany();
  await db.inventory.deleteMany();
  await db.productDiscount.deleteMany();
  await db.couponProduct.deleteMany();
  await db.productTag.deleteMany();
  await db.productView.deleteMany();
  await db.searchLog.deleteMany();
  await db.productVariant.deleteMany();
  await db.product.deleteMany();
  console.log(`🧹 Đã xóa ${before} sản phẩm cũ + dữ liệu liên quan`);
}

// ─── product dataset types ────────────────────────────────────────────────────

type AV = { id: bigint; value: string };
type VariantDef = { color?: AV; storage?: AV; ram?: AV; priceDelta?: number; name?: string; qty?: number };
type ProductDef = {
  slug: string; name: string; categoryId: number; brandId: number;
  basePrice: number; short: string; featured?: boolean;
  specs: Record<string, string>;
  variants: VariantDef[];
  img?: string;            // override Commons search query (default = name)
  imgExtra?: string[];     // extra fallback queries
};

async function main() {
  console.log("🌱 Bắt đầu seed...");
  await wipeProducts();

  // ── Warehouse ──
  const wh = await db.warehouse.upsert({
    where: { code: "HCM-01" },
    update: {},
    create: { name: "Kho HCM", code: "HCM-01", address: "123 Lê Lợi", city: "TP.HCM", province: "TP.HCM" },
  });

  // ── Brands ──
  const brandDefs: [string, string, string][] = [
    ["apple", "Apple", "USA"], ["samsung", "Samsung", "South Korea"], ["dell", "Dell", "USA"],
    ["lenovo", "Lenovo", "China"], ["sony", "Sony", "Japan"], ["jbl", "JBL", "USA"],
    ["asus", "ASUS", "Taiwan"], ["lg", "LG", "South Korea"], ["xiaomi", "Xiaomi", "China"],
    ["google", "Google", "USA"], ["hp", "HP", "USA"], ["acer", "Acer", "Taiwan"],
    ["msi", "MSI", "Taiwan"], ["bose", "Bose", "USA"], ["sennheiser", "Sennheiser", "Germany"],
    ["razer", "Razer", "USA"], ["logitech", "Logitech", "Switzerland"], ["anker", "Anker", "China"],
    ["corsair", "Corsair", "USA"], ["viewsonic", "ViewSonic", "USA"],
  ];
  const B: Record<string, { id: number }> = {};
  for (const [slug, name, country] of brandDefs) {
    B[slug] = await db.brand.upsert({ where: { slug }, update: {}, create: { name, slug, countryOfOrigin: country } });
  }
  console.log("✅ Brands");

  // ── Categories ──
  const catDefs: [string, string, number][] = [
    ["dien-thoai", "Điện thoại", 1], ["laptop", "Laptop", 2], ["may-tinh-ban", "PC - Máy tính bàn", 3],
    ["man-hinh", "Màn hình", 4], ["tai-nghe", "Tai nghe", 5], ["phu-kien", "Phụ kiện", 6],
  ];
  const C: Record<string, { id: number }> = {};
  for (const [slug, name, displayOrder] of catDefs) {
    C[slug] = await db.category.upsert({ where: { slug }, update: {}, create: { name, slug, displayOrder } });
  }
  console.log("✅ Categories");

  // ── Attributes ──
  const attrDefs: [string, string, "SELECT" | "COLOR" | "TEXT", number, boolean][] = [
    ["storage", "Dung lượng", "SELECT", 1, true], ["color", "Màu sắc", "COLOR", 2, true], ["ram", "RAM", "SELECT", 3, true],
    ["screen", "Màn hình", "TEXT", 10, false], ["chip", "Chip", "TEXT", 11, false], ["camera", "Camera chính", "TEXT", 12, false],
    ["battery", "Pin", "TEXT", 13, false], ["cpu", "Vi xử lý", "TEXT", 14, false], ["gpu", "Card đồ họa", "TEXT", 15, false],
    ["os", "Hệ điều hành", "TEXT", 16, false], ["weight", "Trọng lượng", "TEXT", 17, false], ["refresh_rate", "Tần số quét", "TEXT", 18, false],
    ["resolution", "Độ phân giải", "TEXT", 19, false], ["connectivity", "Kết nối", "TEXT", 20, false], ["driver", "Driver", "TEXT", 21, false],
    ["frequency", "Dải tần số", "TEXT", 22, false],
  ];
  const A: Record<string, { id: number }> = {};
  for (const [name, displayName, inputType, displayOrder, isFilterable] of attrDefs) {
    A[name] = await db.attribute.upsert({
      where: { name }, update: {},
      create: { name, displayName, inputType, displayOrder, isFilterable },
    });
  }
  console.log("✅ Attributes");

  // ── Attribute values (variant options) ──
  const storage = {
    "128gb": await avFindOrCreate(A.storage.id, "128gb", "128 GB", { displayOrder: 1 }),
    "256gb": await avFindOrCreate(A.storage.id, "256gb", "256 GB", { displayOrder: 2 }),
    "512gb": await avFindOrCreate(A.storage.id, "512gb", "512 GB", { displayOrder: 3 }),
    "1tb":   await avFindOrCreate(A.storage.id, "1tb", "1 TB", { displayOrder: 4 }),
  };
  const color = {
    black:  await avFindOrCreate(A.color.id, "black", "Đen", { colorHex: "#1a1a1a", displayOrder: 1 }),
    white:  await avFindOrCreate(A.color.id, "white", "Trắng", { colorHex: "#f5f5f7", displayOrder: 2 }),
    blue:   await avFindOrCreate(A.color.id, "blue", "Xanh", { colorHex: "#5e7a8a", displayOrder: 3 }),
    silver: await avFindOrCreate(A.color.id, "silver", "Bạc", { colorHex: "#c0c0c0", displayOrder: 4 }),
    gray:   await avFindOrCreate(A.color.id, "gray", "Xám", { colorHex: "#636366", displayOrder: 5 }),
  };
  const ram = {
    "8gb":  await avFindOrCreate(A.ram.id, "8gb", "8 GB", { displayOrder: 1 }),
    "16gb": await avFindOrCreate(A.ram.id, "16gb", "16 GB", { displayOrder: 2 }),
    "32gb": await avFindOrCreate(A.ram.id, "32gb", "32 GB", { displayOrder: 3 }),
  };
  console.log("✅ AttributeValues");

  // ── CategoryAttributes (spec table config) ──
  const ca = (categoryId: number, names: string[], required: string[] = []) =>
    db.categoryAttribute.createMany({
      skipDuplicates: true,
      data: names.map((n, i) => ({ categoryId, attributeId: A[n].id, displayOrder: i + 1, isRequired: required.includes(n) })),
    });
  await ca(C["dien-thoai"].id, ["screen", "chip", "ram", "storage", "camera", "battery", "os"]);
  await ca(C["laptop"].id, ["cpu", "ram", "gpu", "storage", "screen", "resolution", "os", "battery", "weight"], ["cpu", "ram", "storage", "screen"]);
  await ca(C["may-tinh-ban"].id, ["cpu", "ram", "gpu", "storage", "os"], ["cpu", "ram", "storage"]);
  await ca(C["man-hinh"].id, ["screen", "resolution", "refresh_rate", "connectivity"], ["screen", "resolution"]);
  await ca(C["tai-nghe"].id, ["driver", "frequency", "connectivity", "battery"]);
  await ca(C["phu-kien"].id, ["connectivity", "weight"]);
  console.log("✅ CategoryAttributes");

  // ── attach a Cloudinary image (Commons → placeholder fallback) ──
  async function attachImage(productId: bigint, slug: string, name: string, query: string, extraQueries?: string[]) {
    try {
      const up = await uploadProductImage(name, query, slug, { extraQueries });
      await db.productImage.create({
        data: { productId, url: up.secureUrl, altText: name, isPrimary: true, displayOrder: 0, widthPx: up.width, heightPx: up.height },
      });
      console.log(`   🖼  ${name} ← ${up.source}${up.title ? ` (${up.title})` : ""}`);
    } catch (e) {
      console.warn(`   ⚠  ảnh thất bại: ${name} — ${(e as Error).message}`);
    }
  }

  // ── create one product (product + specs + variants + inventory + image) ──
  async function createProduct(p: ProductDef) {
    const product = await db.product.create({
      data: {
        categoryId: p.categoryId, brandId: p.brandId, name: p.name, slug: p.slug,
        shortDescription: p.short, basePrice: p.basePrice, isFeatured: p.featured ?? false,
      },
    });
    for (const [attrName, value] of Object.entries(p.specs)) {
      if (A[attrName]) await upsertSpec(product.id, A[attrName].id, value);
    }
    let i = 0;
    for (const v of p.variants) {
      const suffix =
        [v.storage?.value, v.ram?.value, v.color?.value].filter(Boolean).join("-").toUpperCase() || `V${i + 1}`;
      const sku = `${p.slug.toUpperCase()}-${suffix}`;
      const variant = await db.productVariant.create({
        data: { productId: product.id, sku, price: p.basePrice + (v.priceDelta ?? 0), name: v.name ?? null },
      });
      const opts: { variantId: bigint; attributeId: number; valueId: bigint }[] = [];
      if (v.storage) opts.push({ variantId: variant.id, attributeId: A.storage.id, valueId: v.storage.id });
      if (v.ram)     opts.push({ variantId: variant.id, attributeId: A.ram.id, valueId: v.ram.id });
      if (v.color)   opts.push({ variantId: variant.id, attributeId: A.color.id, valueId: v.color.id });
      if (opts.length) await db.variantOption.createMany({ data: opts, skipDuplicates: true });
      await addInventory(variant.id, wh.id, v.qty ?? 30);
      i++;
    }
    await attachImage(product.id, product.slug, p.name, p.img ?? p.name, p.imgExtra);
  }

  // ── PRODUCT DATA (10 per category) ───────────────────────────────────────────
  const M = 1_000_000;
  const phone = C["dien-thoai"].id, laptop = C["laptop"].id, pc = C["may-tinh-ban"].id;
  const monitor = C["man-hinh"].id, headphone = C["tai-nghe"].id, accessory = C["phu-kien"].id;

  const products: ProductDef[] = [
    // ── Điện thoại ──
    { slug: "iphone-15", name: "iPhone 15", categoryId: phone, brandId: B.apple.id, basePrice: 20.99 * M, featured: true,
      short: "Chip A16 Bionic, camera 48MP, Dynamic Island",
      specs: { screen: '6.1" Super Retina XDR OLED', chip: "Apple A16 Bionic", ram: "6 GB", storage: "128/256/512 GB", camera: "48MP + 12MP", battery: "3349 mAh", os: "iOS 17" },
      variants: [{ storage: storage["128gb"], color: color.black }, { storage: storage["256gb"], color: color.black, priceDelta: 2 * M }] },
    { slug: "iphone-15-pro-max", name: "iPhone 15 Pro Max", categoryId: phone, brandId: B.apple.id, basePrice: 34.99 * M, featured: true,
      short: "Chip A17 Pro, khung Titan, camera 48MP 5x",
      specs: { screen: '6.7" LTPO OLED 120Hz', chip: "Apple A17 Pro", ram: "8 GB", storage: "256GB-1TB", camera: "48MP + 12MP + 12MP 5x", battery: "4422 mAh", os: "iOS 17" },
      variants: [{ storage: storage["256gb"], color: color.silver }, { storage: storage["512gb"], color: color.silver, priceDelta: 3 * M }] },
    { slug: "samsung-galaxy-s24-ultra", name: "Samsung Galaxy S24 Ultra", categoryId: phone, brandId: B.samsung.id, basePrice: 33.99 * M, featured: true,
      short: "Camera 200MP, S Pen, Snapdragon 8 Gen 3",
      specs: { screen: '6.8" Dynamic AMOLED 2X 120Hz', chip: "Snapdragon 8 Gen 3", ram: "12 GB", storage: "256/512 GB", camera: "200MP + 50MP + 12MP + 10MP", battery: "5000 mAh", os: "Android 14" },
      variants: [{ storage: storage["256gb"], color: color.black }, { storage: storage["512gb"], color: color.gray, priceDelta: 3 * M }] },
    { slug: "iphone-14", name: "iPhone 14", categoryId: phone, brandId: B.apple.id, basePrice: 16.99 * M,
      short: "Chip A15 Bionic, camera kép 12MP, pin bền bỉ",
      specs: { screen: '6.1" Super Retina XDR OLED', chip: "Apple A15 Bionic", ram: "6 GB", storage: "128/256 GB", camera: "12MP + 12MP", battery: "3279 mAh", os: "iOS 16" },
      variants: [{ storage: storage["128gb"], color: color.blue }, { storage: storage["256gb"], color: color.white, priceDelta: 2 * M }] },
    { slug: "samsung-galaxy-s24", name: "Samsung Galaxy S24", categoryId: phone, brandId: B.samsung.id, basePrice: 22.99 * M,
      short: "Compact flagship, Galaxy AI, Exynos 2400",
      specs: { screen: '6.2" Dynamic AMOLED 2X 120Hz', chip: "Exynos 2400", ram: "8 GB", storage: "256 GB", camera: "50MP + 12MP + 10MP", battery: "4000 mAh", os: "Android 14" },
      variants: [{ storage: storage["256gb"], color: color.black }, { storage: storage["256gb"], color: color.gray }] },
    { slug: "samsung-galaxy-a55", name: "Samsung Galaxy A55 5G", categoryId: phone, brandId: B.samsung.id, basePrice: 9.49 * M,
      short: "Tầm trung khung kim loại, màn 120Hz, camera 50MP",
      specs: { screen: '6.6" Super AMOLED 120Hz', chip: "Exynos 1480", ram: "8 GB", storage: "128/256 GB", camera: "50MP + 12MP + 5MP", battery: "5000 mAh", os: "Android 14" },
      variants: [{ storage: storage["128gb"], color: color.blue }, { storage: storage["256gb"], color: color.black, priceDelta: 1.5 * M }] },
    { slug: "xiaomi-14", name: "Xiaomi 14", categoryId: phone, brandId: B.xiaomi.id, basePrice: 18.99 * M,
      short: "Ống kính Leica, Snapdragon 8 Gen 3, sạc 90W",
      specs: { screen: '6.36" LTPO AMOLED 120Hz', chip: "Snapdragon 8 Gen 3", ram: "12 GB", storage: "256/512 GB", camera: "50MP Leica + 50MP + 50MP", battery: "4610 mAh", os: "HyperOS" },
      variants: [{ storage: storage["256gb"], color: color.black }, { storage: storage["512gb"], color: color.white, priceDelta: 2 * M }] },
    { slug: "xiaomi-redmi-note-13-pro", name: "Xiaomi Redmi Note 13 Pro", categoryId: phone, brandId: B.xiaomi.id, basePrice: 7.49 * M,
      short: "Camera 200MP, màn AMOLED 120Hz, giá tốt",
      specs: { screen: '6.67" AMOLED 120Hz', chip: "Snapdragon 7s Gen 2", ram: "8 GB", storage: "128/256 GB", camera: "200MP + 8MP + 2MP", battery: "5100 mAh", os: "MIUI 14" },
      variants: [{ storage: storage["128gb"], color: color.blue }, { storage: storage["256gb"], color: color.black, priceDelta: 1 * M }] },
    { slug: "google-pixel-8-pro", name: "Google Pixel 8 Pro", categoryId: phone, brandId: B.google.id, basePrice: 24.99 * M,
      short: "Tensor G3, AI camera, Android gốc 7 năm cập nhật",
      specs: { screen: '6.7" LTPO OLED 120Hz', chip: "Google Tensor G3", ram: "12 GB", storage: "128/256 GB", camera: "50MP + 48MP + 48MP", battery: "5050 mAh", os: "Android 14" },
      variants: [{ storage: storage["128gb"], color: color.black }, { storage: storage["256gb"], color: color.blue, priceDelta: 2 * M }] },
    { slug: "sony-xperia-1-vi", name: "Sony Xperia 1 VI", categoryId: phone, brandId: B.sony.id, basePrice: 31.99 * M,
      short: "Màn hình 4K, tele biến đổi, quay video chuyên nghiệp",
      specs: { screen: '6.5" OLED 120Hz', chip: "Snapdragon 8 Gen 3", ram: "12 GB", storage: "256/512 GB", camera: "48MP + 12MP + 12MP tele", battery: "5000 mAh", os: "Android 14" },
      variants: [{ storage: storage["256gb"], color: color.black }, { storage: storage["512gb"], color: color.silver, priceDelta: 3 * M }] },

    // ── Laptop ──
    { slug: "macbook-pro-m3-14", name: 'MacBook Pro M3 14"', categoryId: laptop, brandId: B.apple.id, basePrice: 42.99 * M, featured: true,
      short: "Chip Apple M3, Liquid Retina XDR, pin 18 giờ",
      specs: { cpu: "Apple M3 8-core", ram: "8/16/24 GB", gpu: "Apple M3 10-core GPU", storage: "512GB/1TB", screen: '14.2" Liquid Retina XDR 120Hz', resolution: "3024 × 1964", os: "macOS Sonoma", battery: "70 Wh, 18 giờ", weight: "1.55 kg" },
      variants: [{ storage: storage["512gb"], color: color.silver, name: "512GB SSD" }, { storage: storage["1tb"], color: color.gray, name: "1TB SSD", priceDelta: 5 * M }] },
    { slug: "dell-xps-13-plus", name: "Dell XPS 13 Plus", categoryId: laptop, brandId: B.dell.id, basePrice: 38.99 * M,
      short: "Intel Core Ultra 7, OLED 3.5K, thiết kế siêu mỏng",
      specs: { cpu: "Intel Core Ultra 7 155H", ram: "32 GB LPDDR5x", gpu: "Intel Arc Graphics", storage: "512GB/1TB", screen: '13.4" OLED 3.5K cảm ứng', resolution: "3456 × 2160", os: "Windows 11", battery: "55 Wh", weight: "1.26 kg" },
      variants: [{ storage: storage["512gb"], color: color.silver, name: "512GB SSD" }, { storage: storage["1tb"], color: color.silver, name: "1TB SSD", priceDelta: 4 * M }] },
    { slug: "asus-rog-zephyrus-g14", name: "ASUS ROG Zephyrus G14", categoryId: laptop, brandId: B.asus.id, basePrice: 45.99 * M, featured: true,
      short: "Ryzen 9, RTX 4060, OLED 2.5K 165Hz, gaming mỏng nhẹ",
      specs: { cpu: "AMD Ryzen 9 8945HS", ram: "16 GB DDR5", gpu: "NVIDIA RTX 4060 8GB", storage: "512GB/1TB", screen: '14" OLED 2.5K 165Hz', resolution: "2560 × 1600", os: "Windows 11", battery: "73 Wh", weight: "1.65 kg" },
      variants: [{ storage: storage["512gb"], color: color.gray, name: "512GB SSD" }, { storage: storage["1tb"], color: color.white, name: "1TB SSD", priceDelta: 3 * M }] },
    { slug: "macbook-air-m3-13", name: 'MacBook Air M3 13"', categoryId: laptop, brandId: B.apple.id, basePrice: 27.99 * M, featured: true,
      short: "Chip M3, siêu nhẹ 1.24kg, pin 18 giờ, không quạt",
      specs: { cpu: "Apple M3 8-core", ram: "8/16 GB", gpu: "Apple M3 8-core GPU", storage: "256GB/512GB", screen: '13.6" Liquid Retina', resolution: "2560 × 1664", os: "macOS Sonoma", battery: "52.6 Wh, 18 giờ", weight: "1.24 kg" },
      variants: [{ storage: storage["256gb"], color: color.silver, name: "256GB SSD" }, { storage: storage["512gb"], color: color.gray, name: "512GB SSD", priceDelta: 4 * M }] },
    { slug: "dell-inspiron-15", name: "Dell Inspiron 15", categoryId: laptop, brandId: B.dell.id, basePrice: 15.99 * M,
      short: "Laptop văn phòng Core i5, màn 15.6\" FHD, bền bỉ",
      specs: { cpu: "Intel Core i5-1334U", ram: "16 GB DDR4", gpu: "Intel Iris Xe", storage: "512 GB SSD", screen: '15.6" FHD', resolution: "1920 × 1080", os: "Windows 11", battery: "54 Wh", weight: "1.65 kg" },
      variants: [{ storage: storage["512gb"], color: color.silver }] },
    { slug: "lenovo-thinkpad-x1-carbon-gen-12", name: "Lenovo ThinkPad X1 Carbon Gen 12", categoryId: laptop, brandId: B.lenovo.id, basePrice: 39.99 * M,
      short: "Doanh nhân siêu nhẹ, Core Ultra 7, bàn phím trứ danh",
      specs: { cpu: "Intel Core Ultra 7 155U", ram: "32 GB", gpu: "Intel Graphics", storage: "1 TB SSD", screen: '14" WUXGA', resolution: "1920 × 1200", os: "Windows 11 Pro", battery: "57 Wh", weight: "1.09 kg" },
      variants: [{ storage: storage["1tb"], color: color.black }] },
    { slug: "lenovo-legion-5-pro", name: "Lenovo Legion 5 Pro", categoryId: laptop, brandId: B.lenovo.id, basePrice: 35.99 * M,
      short: "Gaming Ryzen 7, RTX 4070, màn 16\" 240Hz",
      specs: { cpu: "AMD Ryzen 7 7745HX", ram: "16 GB DDR5", gpu: "NVIDIA RTX 4070 8GB", storage: "1 TB SSD", screen: '16" WQXGA 240Hz', resolution: "2560 × 1600", os: "Windows 11", battery: "80 Wh", weight: "2.5 kg" },
      variants: [{ storage: storage["1tb"], color: color.gray }] },
    { slug: "hp-spectre-x360-14", name: "HP Spectre x360 14", categoryId: laptop, brandId: B.hp.id, basePrice: 33.99 * M,
      short: "Laptop 2-in-1 OLED 2.8K, Core Ultra 7, thiết kế cao cấp",
      specs: { cpu: "Intel Core Ultra 7 155H", ram: "16 GB", gpu: "Intel Arc Graphics", storage: "1 TB SSD", screen: '14" OLED 2.8K cảm ứng', resolution: "2880 × 1800", os: "Windows 11", battery: "68 Wh", weight: "1.44 kg" },
      variants: [{ storage: storage["1tb"], color: color.black }] },
    { slug: "acer-swift-14", name: "Acer Swift 14", categoryId: laptop, brandId: B.acer.id, basePrice: 18.99 * M,
      short: "Mỏng nhẹ Core Ultra 5, màn 14\" 2.5K, giá hợp lý",
      specs: { cpu: "Intel Core Ultra 5 125H", ram: "16 GB LPDDR5", gpu: "Intel Arc Graphics", storage: "512 GB SSD", screen: '14" 2.5K', resolution: "2560 × 1600", os: "Windows 11", battery: "65 Wh", weight: "1.3 kg" },
      variants: [{ storage: storage["512gb"], color: color.silver }] },
    { slug: "asus-zenbook-14-oled", name: "ASUS Zenbook 14 OLED", categoryId: laptop, brandId: B.asus.id, basePrice: 23.99 * M,
      short: "Màn OLED 2.8K 120Hz, Core Ultra 7, pin lâu",
      specs: { cpu: "Intel Core Ultra 7 155H", ram: "16 GB", gpu: "Intel Arc Graphics", storage: "1 TB SSD", screen: '14" OLED 2.8K 120Hz', resolution: "2880 × 1800", os: "Windows 11", battery: "75 Wh", weight: "1.28 kg" },
      variants: [{ storage: storage["1tb"], color: color.blue }] },

    // ── PC ──
    { slug: "apple-mac-mini-m2", name: "Apple Mac mini M2", categoryId: pc, brandId: B.apple.id, basePrice: 14.99 * M, featured: true,
      short: "Mini PC chip M2, nhỏ gọn, mạnh mẽ, tiết kiệm điện",
      specs: { cpu: "Apple M2 8-core", ram: "8/16 GB", gpu: "Apple M2 10-core GPU", storage: "256GB/512GB", os: "macOS Sonoma" },
      variants: [{ storage: storage["256gb"], color: color.silver }, { storage: storage["512gb"], color: color.silver, priceDelta: 4 * M }] },
    { slug: "apple-imac-24-m3", name: 'Apple iMac 24" M3', categoryId: pc, brandId: B.apple.id, basePrice: 34.99 * M,
      short: "All-in-One màn 4.5K Retina, chip M3, nhiều màu",
      specs: { cpu: "Apple M3 8-core", ram: "8/16 GB", gpu: "Apple M3 10-core GPU", storage: "256GB/512GB", os: "macOS Sonoma" },
      variants: [{ storage: storage["256gb"], color: color.blue }, { storage: storage["512gb"], color: color.silver, priceDelta: 5 * M }] },
    { slug: "dell-optiplex-7010", name: "Dell OptiPlex 7010", categoryId: pc, brandId: B.dell.id, basePrice: 16.99 * M,
      short: "PC văn phòng Core i5, ổn định, bảo mật doanh nghiệp",
      specs: { cpu: "Intel Core i5-13500", ram: "16 GB DDR4", gpu: "Intel UHD 770", storage: "512 GB SSD", os: "Windows 11 Pro" },
      variants: [{ storage: storage["512gb"], color: color.black }] },
    { slug: "hp-pavilion-tp01", name: "HP Pavilion Desktop TP01", categoryId: pc, brandId: B.hp.id, basePrice: 13.99 * M,
      short: "PC gia đình Ryzen 5, đa nhiệm mượt, giá tốt",
      specs: { cpu: "AMD Ryzen 5 5600G", ram: "16 GB DDR4", gpu: "AMD Radeon Graphics", storage: "512 GB SSD", os: "Windows 11" },
      variants: [{ storage: storage["512gb"], color: color.black }] },
    { slug: "lenovo-ideacentre-5", name: "Lenovo IdeaCentre 5", categoryId: pc, brandId: B.lenovo.id, basePrice: 15.49 * M,
      short: "PC đa dụng Core i5, thiết kế gọn, nâng cấp dễ",
      specs: { cpu: "Intel Core i5-13400", ram: "16 GB DDR4", gpu: "Intel UHD 730", storage: "512 GB SSD", os: "Windows 11" },
      variants: [{ storage: storage["512gb"], color: color.gray }] },
    { slug: "asus-rog-strix-g16ch", name: "ASUS ROG Strix G16CH", categoryId: pc, brandId: B.asus.id, basePrice: 32.99 * M, featured: true,
      short: "PC gaming Core i7, RTX 4060, tản nhiệt mạnh",
      specs: { cpu: "Intel Core i7-14700F", ram: "16 GB DDR5", gpu: "NVIDIA RTX 4060 8GB", storage: "1 TB SSD", os: "Windows 11" },
      variants: [{ storage: storage["1tb"], color: color.black }] },
    { slug: "msi-meg-trident-x", name: "MSI MEG Trident X", categoryId: pc, brandId: B.msi.id, basePrice: 55.99 * M,
      short: "PC gaming cao cấp, Core i9, RTX 4080, nhỏ gọn",
      specs: { cpu: "Intel Core i9-14900K", ram: "32 GB DDR5", gpu: "NVIDIA RTX 4080 16GB", storage: "1 TB SSD", os: "Windows 11" },
      variants: [{ storage: storage["1tb"], color: color.black }] },
    { slug: "dell-xps-desktop-8960", name: "Dell XPS Desktop 8960", categoryId: pc, brandId: B.dell.id, basePrice: 38.99 * M,
      short: "PC sáng tạo Core i7, RTX 4070, dựng phim render nhanh",
      specs: { cpu: "Intel Core i7-14700", ram: "32 GB DDR5", gpu: "NVIDIA RTX 4070 12GB", storage: "1 TB SSD", os: "Windows 11" },
      variants: [{ storage: storage["1tb"], color: color.silver }] },
    { slug: "lenovo-legion-tower-5", name: "Lenovo Legion Tower 5", categoryId: pc, brandId: B.lenovo.id, basePrice: 29.99 * M,
      short: "PC gaming Ryzen 7, RTX 4060 Ti, nâng cấp linh hoạt",
      specs: { cpu: "AMD Ryzen 7 7700", ram: "16 GB DDR5", gpu: "NVIDIA RTX 4060 Ti 8GB", storage: "1 TB SSD", os: "Windows 11" },
      variants: [{ storage: storage["1tb"], color: color.black }] },
    { slug: "hp-omen-45l", name: "HP Omen 45L", categoryId: pc, brandId: B.hp.id, basePrice: 49.99 * M,
      short: "PC gaming flagship, Core i9, RTX 4080, tản nhiệt Cryo",
      specs: { cpu: "Intel Core i9-14900K", ram: "32 GB DDR5", gpu: "NVIDIA RTX 4080 16GB", storage: "2 TB SSD", os: "Windows 11" },
      variants: [{ storage: storage["1tb"], color: color.black, name: "Cấu hình chuẩn" }] },

    // ── Màn hình ──
    { slug: "lg-ultrawide-34wq75c", name: 'LG UltraWide 34" QHD', categoryId: monitor, brandId: B.lg.id, basePrice: 12.99 * M,
      short: "34 inch IPS 21:9, 3440×1440, 100Hz, USB-C 96W",
      specs: { screen: '34" IPS cong 21:9', resolution: "3440 × 1440", refresh_rate: "100 Hz", connectivity: "HDMI ×2, DP, USB-C 96W" },
      variants: [{ color: color.black }] },
    { slug: "samsung-odyssey-g9", name: "Samsung Odyssey G9", categoryId: monitor, brandId: B.samsung.id, basePrice: 28.99 * M, featured: true,
      short: "49\" cong 1000R, 240Hz, siêu rộng cho game thủ",
      specs: { screen: '49" VA cong 1000R', resolution: "5120 × 1440", refresh_rate: "240 Hz", connectivity: "HDMI 2.1, DP 1.4, USB Hub" },
      variants: [{ color: color.white }] },
    { slug: "dell-ultrasharp-u2723qe", name: "Dell UltraSharp U2723QE", categoryId: monitor, brandId: B.dell.id, basePrice: 13.99 * M,
      short: "27\" 4K IPS Black, màu chuẩn, USB-C hub",
      specs: { screen: '27" IPS Black', resolution: "3840 × 2160", refresh_rate: "60 Hz", connectivity: "HDMI, DP, USB-C 90W, RJ45" },
      variants: [{ color: color.silver }] },
    { slug: "lg-ultragear-27gp850", name: "LG UltraGear 27GP850", categoryId: monitor, brandId: B.lg.id, basePrice: 9.99 * M,
      short: "27\" QHD Nano IPS 165Hz, 1ms, gaming sắc nét",
      specs: { screen: '27" Nano IPS', resolution: "2560 × 1440", refresh_rate: "165 Hz", connectivity: "HDMI ×2, DP" },
      variants: [{ color: color.black }] },
    { slug: "asus-proart-pa278cv", name: "ASUS ProArt PA278CV", categoryId: monitor, brandId: B.asus.id, basePrice: 9.49 * M,
      short: "27\" QHD chuẩn màu 100% sRGB, cho thiết kế",
      specs: { screen: '27" IPS', resolution: "2560 × 1440", refresh_rate: "75 Hz", connectivity: "HDMI, DP, USB-C 65W" },
      variants: [{ color: color.black }] },
    { slug: "samsung-viewfinity-s8", name: "Samsung ViewFinity S8", categoryId: monitor, brandId: B.samsung.id, basePrice: 11.99 * M,
      short: "27\" 4K IPS, màu chính xác, USB-C cho công việc",
      specs: { screen: '27" IPS', resolution: "3840 × 2160", refresh_rate: "60 Hz", connectivity: "HDMI, DP, USB-C 90W" },
      variants: [{ color: color.silver }] },
    { slug: "viewsonic-vx2758", name: "ViewSonic VX2758-2KP-MHD", categoryId: monitor, brandId: B.viewsonic.id, basePrice: 4.99 * M,
      short: "27\" QHD IPS 144Hz, giá tốt cho game thủ",
      specs: { screen: '27" IPS', resolution: "2560 × 1440", refresh_rate: "144 Hz", connectivity: "HDMI ×2, DP" },
      variants: [{ color: color.black }] },
    { slug: "msi-optix-mag274qrf", name: "MSI Optix MAG274QRF", categoryId: monitor, brandId: B.msi.id, basePrice: 8.99 * M,
      short: "27\" QHD Rapid IPS 165Hz, 1ms, gaming mượt",
      specs: { screen: '27" Rapid IPS', resolution: "2560 × 1440", refresh_rate: "165 Hz", connectivity: "HDMI, DP, USB-C, USB Hub" },
      variants: [{ color: color.black }] },
    { slug: "dell-s2722dgm", name: "Dell S2722DGM", categoryId: monitor, brandId: B.dell.id, basePrice: 6.99 * M,
      short: "27\" QHD cong VA 165Hz, gaming giá hợp lý",
      specs: { screen: '27" VA cong 1500R', resolution: "2560 × 1440", refresh_rate: "165 Hz", connectivity: "HDMI ×2, DP" },
      variants: [{ color: color.black }] },
    { slug: "asus-tuf-gaming-vg27aq", name: "ASUS TUF Gaming VG27AQ", categoryId: monitor, brandId: B.asus.id, basePrice: 7.49 * M,
      short: "27\" QHD IPS 165Hz, G-Sync, ELMB Sync",
      specs: { screen: '27" IPS', resolution: "2560 × 1440", refresh_rate: "165 Hz", connectivity: "HDMI ×2, DP" },
      variants: [{ color: color.black }] },

    // ── Tai nghe ──
    { slug: "sony-wh-1000xm5", name: "Sony WH-1000XM5", categoryId: headphone, brandId: B.sony.id, basePrice: 8.49 * M, featured: true,
      short: "Chống ồn hàng đầu, LDAC Hi-Res, pin 30 giờ",
      specs: { driver: "30mm", frequency: "4 Hz – 40.000 Hz", connectivity: "Bluetooth 5.2, LDAC, NFC", battery: "30 giờ" },
      variants: [{ color: color.black }, { color: color.silver }], img: "Sony WH-1000XM5", imgExtra: ["Sony WH-1000XM4", "Sony WH-1000XM5 headphones"] },
    { slug: "jbl-tune-770nc", name: "JBL Tune 770NC", categoryId: headphone, brandId: B.jbl.id, basePrice: 2.49 * M,
      short: "ANC Adaptive, pin 70 giờ, JBL Pure Bass",
      specs: { driver: "40mm", frequency: "20 Hz – 20.000 Hz", connectivity: "Bluetooth 5.3", battery: "70 giờ" },
      variants: [{ color: color.black }, { color: color.blue }, { color: color.white }] },
    { slug: "apple-airpods-pro-2", name: "Apple AirPods Pro 2", categoryId: headphone, brandId: B.apple.id, basePrice: 5.99 * M, featured: true,
      short: "Chống ồn chủ động, chip H2, USB-C, Adaptive Audio",
      specs: { driver: "Custom Apple", connectivity: "Bluetooth 5.3, H2", battery: "6 giờ (30 giờ với hộp)" },
      variants: [{ color: color.white }] },
    { slug: "apple-airpods-max", name: "Apple AirPods Max", categoryId: headphone, brandId: B.apple.id, basePrice: 12.99 * M,
      short: "Tai nghe chụp tai cao cấp, Spatial Audio, nhôm",
      specs: { driver: "40mm Apple", connectivity: "Bluetooth 5.0", battery: "20 giờ" },
      variants: [{ color: color.silver }, { color: color.gray }] },
    { slug: "bose-quietcomfort-ultra", name: "Bose QuietComfort Ultra", categoryId: headphone, brandId: B.bose.id, basePrice: 9.49 * M,
      short: "Chống ồn đỉnh cao, âm thanh Immersive, êm ái",
      specs: { driver: "35mm", frequency: "20 Hz – 20.000 Hz", connectivity: "Bluetooth 5.3, aptX Adaptive", battery: "24 giờ" },
      variants: [{ color: color.black }, { color: color.white }] },
    { slug: "sennheiser-momentum-4", name: "Sennheiser Momentum 4", categoryId: headphone, brandId: B.sennheiser.id, basePrice: 8.99 * M,
      short: "Âm thanh audiophile, pin 60 giờ, ANC thích ứng",
      specs: { driver: "42mm", frequency: "6 Hz – 22.000 Hz", connectivity: "Bluetooth 5.2, aptX Adaptive", battery: "60 giờ" },
      variants: [{ color: color.black }, { color: color.white }] },
    { slug: "sony-wf-1000xm5", name: "Sony WF-1000XM5", categoryId: headphone, brandId: B.sony.id, basePrice: 6.49 * M,
      short: "Tai nghe true wireless chống ồn tốt nhất, nhỏ gọn",
      specs: { driver: "8.4mm Dynamic X", frequency: "20 Hz – 40.000 Hz", connectivity: "Bluetooth 5.3, LDAC", battery: "8 giờ (24 giờ với hộp)" },
      variants: [{ color: color.black }, { color: color.silver }] },
    { slug: "jbl-live-660nc", name: "JBL Live 660NC", categoryId: headphone, brandId: B.jbl.id, basePrice: 3.49 * M,
      short: "Chống ồn thích ứng, pin 50 giờ, âm JBL Signature",
      specs: { driver: "40mm", frequency: "20 Hz – 20.000 Hz", connectivity: "Bluetooth 5.0", battery: "50 giờ" },
      variants: [{ color: color.black }, { color: color.blue }] },
    { slug: "razer-blackshark-v2-pro", name: "Razer BlackShark V2 Pro", categoryId: headphone, brandId: B.razer.id, basePrice: 4.49 * M,
      short: "Gaming không dây, THX Spatial, mic siêu nhạy",
      specs: { driver: "50mm TriForce Titanium", frequency: "12 Hz – 28.000 Hz", connectivity: "Wireless 2.4GHz", battery: "70 giờ" },
      variants: [{ color: color.black }] },
    { slug: "sennheiser-hd-660s", name: "Sennheiser HD 660S", categoryId: headphone, brandId: B.sennheiser.id, basePrice: 11.99 * M,
      short: "Tai nghe open-back audiophile, âm thanh tự nhiên",
      specs: { driver: "38mm", frequency: "10 Hz – 41.000 Hz", connectivity: "Có dây 3.5mm / 6.3mm", battery: "Không (có dây)" },
      variants: [{ color: color.black }] },

    // ── Phụ kiện ──
    { slug: "logitech-mx-master-3s", name: "Logitech MX Master 3S", categoryId: accessory, brandId: B.logitech.id, basePrice: 2.49 * M, featured: true,
      short: "Chuột cao cấp 8K DPI, cuộn MagSpeed, đa thiết bị",
      specs: { connectivity: "Bluetooth, Logi Bolt USB", weight: "141 g" },
      variants: [{ color: color.gray }, { color: color.white }] },
    { slug: "logitech-mx-keys-s", name: "Logitech MX Keys S", categoryId: accessory, brandId: B.logitech.id, basePrice: 2.79 * M,
      short: "Bàn phím không dây cao cấp, đèn nền thông minh",
      specs: { connectivity: "Bluetooth, Logi Bolt USB", weight: "810 g" },
      variants: [{ color: color.gray }] },
    { slug: "anker-powercore-20000", name: "Anker PowerCore 20000", categoryId: accessory, brandId: B.anker.id, basePrice: 1.29 * M,
      short: "Sạc dự phòng 20.000mAh, sạc nhanh PD 30W",
      specs: { connectivity: "USB-C PD, USB-A", weight: "343 g" },
      variants: [{ color: color.black }] },
    { slug: "apple-magic-keyboard", name: "Apple Magic Keyboard", categoryId: accessory, brandId: B.apple.id, basePrice: 2.99 * M,
      short: "Bàn phím Apple sạc lại, gõ êm, kết nối tức thì",
      specs: { connectivity: "Bluetooth, Lightning", weight: "243 g" },
      variants: [{ color: color.white }] },
    { slug: "apple-magic-mouse", name: "Apple Magic Mouse", categoryId: accessory, brandId: B.apple.id, basePrice: 2.19 * M,
      short: "Chuột cảm ứng đa điểm Apple, bề mặt Multi-Touch",
      specs: { connectivity: "Bluetooth, Lightning", weight: "99 g" },
      variants: [{ color: color.white }] },
    { slug: "samsung-45w-charger", name: "Samsung 45W Charger", categoryId: accessory, brandId: B.samsung.id, basePrice: 0.89 * M,
      short: "Củ sạc nhanh 45W USB-C PD, nhỏ gọn an toàn",
      specs: { connectivity: "USB-C PD 45W", weight: "62 g" },
      variants: [{ color: color.white }] },
    { slug: "razer-deathadder-v3", name: "Razer DeathAdder V3", categoryId: accessory, brandId: B.razer.id, basePrice: 1.79 * M,
      short: "Chuột gaming 30K DPI, siêu nhẹ 59g, công thái học",
      specs: { connectivity: "USB / Wireless HyperSpeed", weight: "59 g" },
      variants: [{ color: color.black }, { color: color.white }] },
    { slug: "corsair-k70-rgb", name: "Corsair K70 RGB", categoryId: accessory, brandId: B.corsair.id, basePrice: 3.49 * M,
      short: "Bàn phím cơ Cherry MX, khung nhôm, RGB từng phím",
      specs: { connectivity: "USB", weight: "1100 g" },
      variants: [{ color: color.black }] },
    { slug: "anker-737-charger", name: "Anker 737 GaNPrime Charger", categoryId: accessory, brandId: B.anker.id, basePrice: 1.99 * M,
      short: "Củ sạc GaN 120W 3 cổng, sạc laptop & điện thoại",
      specs: { connectivity: "2× USB-C, 1× USB-A, 120W", weight: "200 g" },
      variants: [{ color: color.black }] },
    { slug: "apple-airtag", name: "Apple AirTag", categoryId: accessory, brandId: B.apple.id, basePrice: 0.79 * M,
      short: "Thiết bị định vị đồ vật qua mạng Find My, pin 1 năm",
      specs: { connectivity: "Bluetooth, U1 UWB", weight: "11 g" },
      variants: [{ color: color.white }] },
  ];

  // ── create all products ──
  console.log(`\n📦 Tạo ${products.length} sản phẩm...\n`);
  let n = 0;
  for (const p of products) {
    n++;
    console.log(`[${n}/${products.length}] ${p.name}`);
    await createProduct(p);
  }

  // ── summary ──
  const byCat = await db.product.groupBy({ by: ["categoryId"], _count: true });
  const withImg = await db.product.count({ where: { images: { some: {} } } });
  console.log(`\n🎉 Seed hoàn tất! Tổng ${products.length} sản phẩm, ${withImg} có ảnh.`);
  for (const cat of catDefs) {
    const c = C[cat[0]];
    const row = byCat.find((b) => b.categoryId === c.id);
    console.log(`   ${cat[1]}: ${row?._count ?? 0} sản phẩm`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
