import { config } from "dotenv";
config({ path: ".env.local" });
import { PrismaClient, AttributeInputType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter: new PrismaPg(pool) });

// Find-or-create an AttributeValue (no unique constraint on (attributeId, value))
async function avFindOrCreate(attributeId: number, value: string, displayValue: string, extra?: { colorHex?: string; displayOrder?: number }) {
  const existing = await db.attributeValue.findFirst({ where: { attributeId, value } });
  if (existing) return existing;
  return db.attributeValue.create({ data: { attributeId, value, displayValue, displayOrder: extra?.displayOrder ?? 0, colorHex: extra?.colorHex } });
}

// Upsert ProductAttributeValue using textValue (new spec flow)
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

async function main() {
  console.log("🌱 Bắt đầu seed...");

  // ── Warehouse ────────────────────────────────────────────────────────────
  const wh = await db.warehouse.upsert({
    where: { code: "HCM-01" },
    update: {},
    create: { name: "Kho HCM", code: "HCM-01", address: "123 Lê Lợi", city: "TP.HCM", province: "TP.HCM" },
  });

  // ── Brands ───────────────────────────────────────────────────────────────
  const [apple, samsung, dell, lenovo, sony, jbl, asus, lg] = await Promise.all([
    db.brand.upsert({ where: { slug: "apple"   }, update: {}, create: { name: "Apple",   slug: "apple",   countryOfOrigin: "USA"          } }),
    db.brand.upsert({ where: { slug: "samsung" }, update: {}, create: { name: "Samsung", slug: "samsung", countryOfOrigin: "South Korea"  } }),
    db.brand.upsert({ where: { slug: "dell"    }, update: {}, create: { name: "Dell",    slug: "dell",    countryOfOrigin: "USA"          } }),
    db.brand.upsert({ where: { slug: "lenovo"  }, update: {}, create: { name: "Lenovo",  slug: "lenovo",  countryOfOrigin: "China"        } }),
    db.brand.upsert({ where: { slug: "sony"    }, update: {}, create: { name: "Sony",    slug: "sony",    countryOfOrigin: "Japan"        } }),
    db.brand.upsert({ where: { slug: "jbl"     }, update: {}, create: { name: "JBL",     slug: "jbl",     countryOfOrigin: "USA"          } }),
    db.brand.upsert({ where: { slug: "asus"    }, update: {}, create: { name: "ASUS",    slug: "asus",    countryOfOrigin: "Taiwan"       } }),
    db.brand.upsert({ where: { slug: "lg"      }, update: {}, create: { name: "LG",      slug: "lg",      countryOfOrigin: "South Korea"  } }),
  ]);
  console.log("✅ Brands");

  // ── Categories ───────────────────────────────────────────────────────────
  const [catPhone, catLaptop, catPC, catMonitor, catHeadphone, catAccessory] = await Promise.all([
    db.category.upsert({ where: { slug: "dien-thoai"  }, update: {}, create: { name: "Điện thoại",       slug: "dien-thoai",  displayOrder: 1 } }),
    db.category.upsert({ where: { slug: "laptop"      }, update: {}, create: { name: "Laptop",           slug: "laptop",      displayOrder: 2 } }),
    db.category.upsert({ where: { slug: "may-tinh-ban"}, update: {}, create: { name: "PC - Máy tính bàn",slug: "may-tinh-ban",displayOrder: 3 } }),
    db.category.upsert({ where: { slug: "man-hinh"    }, update: {}, create: { name: "Màn hình",         slug: "man-hinh",    displayOrder: 4 } }),
    db.category.upsert({ where: { slug: "tai-nghe"    }, update: {}, create: { name: "Tai nghe",         slug: "tai-nghe",    displayOrder: 5 } }),
    db.category.upsert({ where: { slug: "phu-kien"    }, update: {}, create: { name: "Phụ kiện",         slug: "phu-kien",    displayOrder: 6 } }),
  ]);
  console.log("✅ Categories");

  // ── Attributes ───────────────────────────────────────────────────────────
  // Variant-defining (SELECT / COLOR)
  const [attrStorage, attrColor, attrRam] = await Promise.all([
    db.attribute.upsert({ where: { name: "storage" }, update: {}, create: { name: "storage", displayName: "Dung lượng",  inputType: "SELECT", isFilterable: true, displayOrder: 1 } }),
    db.attribute.upsert({ where: { name: "color"   }, update: {}, create: { name: "color",   displayName: "Màu sắc",     inputType: "COLOR",  isFilterable: true, displayOrder: 2 } }),
    db.attribute.upsert({ where: { name: "ram"     }, update: {}, create: { name: "ram",     displayName: "RAM",         inputType: "SELECT", isFilterable: true, displayOrder: 3 } }),
  ]);
  // Spec (TEXT — lưu qua textValue)
  const [attrScreen, attrChip, attrCamera, attrBattery, attrCpu, attrGpu, attrOs, attrWeight, attrRefreshRate, attrResolution, attrConnectivity, attrDriver, attrFrequency] = await Promise.all([
    db.attribute.upsert({ where: { name: "screen"       }, update: {}, create: { name: "screen",        displayName: "Màn hình",       inputType: "TEXT", displayOrder: 10 } }),
    db.attribute.upsert({ where: { name: "chip"         }, update: {}, create: { name: "chip",          displayName: "Chip",           inputType: "TEXT", displayOrder: 11 } }),
    db.attribute.upsert({ where: { name: "camera"       }, update: {}, create: { name: "camera",        displayName: "Camera chính",   inputType: "TEXT", displayOrder: 12 } }),
    db.attribute.upsert({ where: { name: "battery"      }, update: {}, create: { name: "battery",       displayName: "Pin",            inputType: "TEXT", displayOrder: 13 } }),
    db.attribute.upsert({ where: { name: "cpu"          }, update: {}, create: { name: "cpu",           displayName: "Vi xử lý",       inputType: "TEXT", displayOrder: 14 } }),
    db.attribute.upsert({ where: { name: "gpu"          }, update: {}, create: { name: "gpu",           displayName: "Card đồ họa",    inputType: "TEXT", displayOrder: 15 } }),
    db.attribute.upsert({ where: { name: "os"           }, update: {}, create: { name: "os",            displayName: "Hệ điều hành",   inputType: "TEXT", displayOrder: 16 } }),
    db.attribute.upsert({ where: { name: "weight"       }, update: {}, create: { name: "weight",        displayName: "Trọng lượng",    inputType: "TEXT", displayOrder: 17 } }),
    db.attribute.upsert({ where: { name: "refresh_rate" }, update: {}, create: { name: "refresh_rate",  displayName: "Tần số quét",    inputType: "TEXT", displayOrder: 18 } }),
    db.attribute.upsert({ where: { name: "resolution"   }, update: {}, create: { name: "resolution",    displayName: "Độ phân giải",   inputType: "TEXT", displayOrder: 19 } }),
    db.attribute.upsert({ where: { name: "connectivity" }, update: {}, create: { name: "connectivity",  displayName: "Kết nối",        inputType: "TEXT", displayOrder: 20 } }),
    db.attribute.upsert({ where: { name: "driver"       }, update: {}, create: { name: "driver",        displayName: "Driver",         inputType: "TEXT", displayOrder: 21 } }),
    db.attribute.upsert({ where: { name: "frequency"    }, update: {}, create: { name: "frequency",     displayName: "Dải tần số",     inputType: "TEXT", displayOrder: 22 } }),
  ]);
  console.log("✅ Attributes");

  // ── Attribute Values (variant options only) ──────────────────────────────
  const [gb128, gb256, gb512, gb1tb] = await Promise.all([
    avFindOrCreate(attrStorage.id, "128gb",  "128 GB",  { displayOrder: 1 }),
    avFindOrCreate(attrStorage.id, "256gb",  "256 GB",  { displayOrder: 2 }),
    avFindOrCreate(attrStorage.id, "512gb",  "512 GB",  { displayOrder: 3 }),
    avFindOrCreate(attrStorage.id, "1tb",    "1 TB",    { displayOrder: 4 }),
  ]);
  const [clBlack, clWhite, clBlue, clSilver, clGray] = await Promise.all([
    avFindOrCreate(attrColor.id, "black",  "Đen",         { colorHex: "#1a1a1a", displayOrder: 1 }),
    avFindOrCreate(attrColor.id, "white",  "Trắng",       { colorHex: "#f5f5f7", displayOrder: 2 }),
    avFindOrCreate(attrColor.id, "blue",   "Xanh titan",  { colorHex: "#5e7a8a", displayOrder: 3 }),
    avFindOrCreate(attrColor.id, "silver", "Bạc",         { colorHex: "#c0c0c0", displayOrder: 4 }),
    avFindOrCreate(attrColor.id, "gray",   "Xám",         { colorHex: "#636366", displayOrder: 5 }),
  ]);
  const [ram8, ram16, ram32] = await Promise.all([
    avFindOrCreate(attrRam.id, "8gb",  "8 GB",  { displayOrder: 1 }),
    avFindOrCreate(attrRam.id, "16gb", "16 GB", { displayOrder: 2 }),
    avFindOrCreate(attrRam.id, "32gb", "32 GB", { displayOrder: 3 }),
  ]);
  console.log("✅ AttributeValues");

  // ── CategoryAttributes ───────────────────────────────────────────────────
  // Điện thoại
  await db.categoryAttribute.createMany({ skipDuplicates: true, data: [
    { categoryId: catPhone.id, attributeId: attrScreen.id,       groupName: "Màn hình",    displayOrder: 1 },
    { categoryId: catPhone.id, attributeId: attrChip.id,         groupName: "Hiệu năng",   displayOrder: 2 },
    { categoryId: catPhone.id, attributeId: attrRam.id,          groupName: "Hiệu năng",   displayOrder: 3 },
    { categoryId: catPhone.id, attributeId: attrStorage.id,      groupName: "Bộ nhớ",      displayOrder: 4 },
    { categoryId: catPhone.id, attributeId: attrCamera.id,       groupName: "Camera",      displayOrder: 5 },
    { categoryId: catPhone.id, attributeId: attrBattery.id,      groupName: "Pin & Sạc",   displayOrder: 6 },
    { categoryId: catPhone.id, attributeId: attrOs.id,           groupName: "Phần mềm",    displayOrder: 7 },
  ]});
  // Laptop
  await db.categoryAttribute.createMany({ skipDuplicates: true, data: [
    { categoryId: catLaptop.id, attributeId: attrCpu.id,         groupName: "Hiệu năng",   displayOrder: 1, isRequired: true },
    { categoryId: catLaptop.id, attributeId: attrRam.id,         groupName: "Hiệu năng",   displayOrder: 2, isRequired: true },
    { categoryId: catLaptop.id, attributeId: attrGpu.id,         groupName: "Hiệu năng",   displayOrder: 3 },
    { categoryId: catLaptop.id, attributeId: attrStorage.id,     groupName: "Bộ nhớ",      displayOrder: 4, isRequired: true },
    { categoryId: catLaptop.id, attributeId: attrScreen.id,      groupName: "Màn hình",    displayOrder: 5, isRequired: true },
    { categoryId: catLaptop.id, attributeId: attrResolution.id,  groupName: "Màn hình",    displayOrder: 6 },
    { categoryId: catLaptop.id, attributeId: attrOs.id,          groupName: "Phần mềm",    displayOrder: 7 },
    { categoryId: catLaptop.id, attributeId: attrBattery.id,     groupName: "Pin & Sạc",   displayOrder: 8 },
    { categoryId: catLaptop.id, attributeId: attrWeight.id,      groupName: "Thiết kế",    displayOrder: 9 },
  ]});
  // PC
  await db.categoryAttribute.createMany({ skipDuplicates: true, data: [
    { categoryId: catPC.id, attributeId: attrCpu.id,             groupName: "Hiệu năng",   displayOrder: 1, isRequired: true },
    { categoryId: catPC.id, attributeId: attrRam.id,             groupName: "Hiệu năng",   displayOrder: 2, isRequired: true },
    { categoryId: catPC.id, attributeId: attrGpu.id,             groupName: "Hiệu năng",   displayOrder: 3 },
    { categoryId: catPC.id, attributeId: attrStorage.id,         groupName: "Bộ nhớ",      displayOrder: 4, isRequired: true },
    { categoryId: catPC.id, attributeId: attrOs.id,              groupName: "Phần mềm",    displayOrder: 5 },
  ]});
  // Màn hình
  await db.categoryAttribute.createMany({ skipDuplicates: true, data: [
    { categoryId: catMonitor.id, attributeId: attrScreen.id,     groupName: "Màn hình",    displayOrder: 1, isRequired: true },
    { categoryId: catMonitor.id, attributeId: attrResolution.id, groupName: "Màn hình",    displayOrder: 2, isRequired: true },
    { categoryId: catMonitor.id, attributeId: attrRefreshRate.id,groupName: "Màn hình",    displayOrder: 3 },
    { categoryId: catMonitor.id, attributeId: attrConnectivity.id,groupName: "Kết nối",    displayOrder: 4 },
  ]});
  // Tai nghe
  await db.categoryAttribute.createMany({ skipDuplicates: true, data: [
    { categoryId: catHeadphone.id, attributeId: attrDriver.id,      groupName: "Âm thanh", displayOrder: 1 },
    { categoryId: catHeadphone.id, attributeId: attrFrequency.id,   groupName: "Âm thanh", displayOrder: 2 },
    { categoryId: catHeadphone.id, attributeId: attrConnectivity.id,groupName: "Kết nối",  displayOrder: 3 },
    { categoryId: catHeadphone.id, attributeId: attrBattery.id,     groupName: "Pin & Sạc",displayOrder: 4 },
  ]});
  console.log("✅ CategoryAttributes");

  // ── Products ──────────────────────────────────────────────────────────────

  // ── 1. iPhone 15 ─────────────────────────────────────────────────────────
  const iphone15 = await db.product.upsert({
    where: { slug: "iphone-15" },
    update: {},
    create: { categoryId: catPhone.id, brandId: apple.id, name: "iPhone 15", slug: "iphone-15", shortDescription: "Chip A16 Bionic, camera 48MP, Dynamic Island", basePrice: 20_990_000, isFeatured: true },
  });
  await Promise.all([
    upsertSpec(iphone15.id, attrScreen.id,  '6.1" Super Retina XDR OLED, 2556×1179, 460 ppi'),
    upsertSpec(iphone15.id, attrChip.id,    "Apple A16 Bionic (4nm)"),
    upsertSpec(iphone15.id, attrRam.id,     "6 GB"),
    upsertSpec(iphone15.id, attrCamera.id,  "48MP chính + 12MP góc siêu rộng"),
    upsertSpec(iphone15.id, attrBattery.id, "3349 mAh, sạc 20W"),
    upsertSpec(iphone15.id, attrOs.id,      "iOS 17"),
  ]);
  for (const [sv, sid, pe] of [[gb128, gb128.id, 0], [gb256, gb256.id, 2_000_000], [gb512, gb512.id, 5_000_000]] as any[]) {
    for (const [cv, cid] of [[clBlack, clBlack.id], [clWhite, clWhite.id], [clBlue, clBlue.id]] as any[]) {
      const sku = `IP15-${sv.value.toUpperCase()}-${cv.value.toUpperCase()}`;
      const v = await db.productVariant.upsert({ where: { sku }, update: {}, create: { productId: iphone15.id, sku, price: 20_990_000 + pe } });
      await db.variantOption.createMany({ skipDuplicates: true, data: [
        { variantId: v.id, attributeId: attrStorage.id, valueId: sid },
        { variantId: v.id, attributeId: attrColor.id,   valueId: cid  },
      ]});
      await addInventory(v.id, wh.id, 50);
    }
  }
  console.log("✅ iPhone 15 — 9 variants");

  // ── 2. iPhone 15 Pro Max ──────────────────────────────────────────────────
  const iphone15pm = await db.product.upsert({
    where: { slug: "iphone-15-pro-max" },
    update: {},
    create: { categoryId: catPhone.id, brandId: apple.id, name: "iPhone 15 Pro Max", slug: "iphone-15-pro-max", shortDescription: "Chip A17 Pro, khung Titan, camera 48MP 5x tetra-prism", basePrice: 34_990_000, isFeatured: true },
  });
  await Promise.all([
    upsertSpec(iphone15pm.id, attrScreen.id,  '6.7" Super Retina XDR ProMotion 120Hz, 2796×1290'),
    upsertSpec(iphone15pm.id, attrChip.id,    "Apple A17 Pro (3nm)"),
    upsertSpec(iphone15pm.id, attrRam.id,     "8 GB"),
    upsertSpec(iphone15pm.id, attrCamera.id,  "48MP chính + 12MP góc siêu rộng + 12MP telephoto 5x"),
    upsertSpec(iphone15pm.id, attrBattery.id, "4422 mAh, sạc 27W"),
    upsertSpec(iphone15pm.id, attrOs.id,      "iOS 17"),
  ]);
  for (const [sv, sid, pe] of [[gb256, gb256.id, 0], [gb512, gb512.id, 3_000_000], [gb1tb, gb1tb.id, 6_000_000]] as any[]) {
    for (const [cv, cid] of [[clBlack, clBlack.id], [clWhite, clWhite.id], [clSilver, clSilver.id]] as any[]) {
      const sku = `IP15PM-${sv.value.toUpperCase()}-${cv.value.toUpperCase()}`;
      const v = await db.productVariant.upsert({ where: { sku }, update: {}, create: { productId: iphone15pm.id, sku, price: 34_990_000 + pe } });
      await db.variantOption.createMany({ skipDuplicates: true, data: [
        { variantId: v.id, attributeId: attrStorage.id, valueId: sid },
        { variantId: v.id, attributeId: attrColor.id,   valueId: cid  },
      ]});
      await addInventory(v.id, wh.id, 30);
    }
  }
  console.log("✅ iPhone 15 Pro Max — 9 variants");

  // ── 3. Samsung Galaxy S24 Ultra ──────────────────────────────────────────
  const s24u = await db.product.upsert({
    where: { slug: "samsung-galaxy-s24-ultra" },
    update: {},
    create: { categoryId: catPhone.id, brandId: samsung.id, name: "Samsung Galaxy S24 Ultra", slug: "samsung-galaxy-s24-ultra", shortDescription: "Camera 200MP, S Pen, Snapdragon 8 Gen 3", basePrice: 33_990_000, isFeatured: true },
  });
  await Promise.all([
    upsertSpec(s24u.id, attrScreen.id,  '6.8" Dynamic AMOLED 2X 120Hz, 3088×1440'),
    upsertSpec(s24u.id, attrChip.id,    "Snapdragon 8 Gen 3 (4nm)"),
    upsertSpec(s24u.id, attrRam.id,     "12 GB"),
    upsertSpec(s24u.id, attrCamera.id,  "200MP chính + 12MP góc rộng + 50MP telephoto 5x + 10MP telephoto 3x"),
    upsertSpec(s24u.id, attrBattery.id, "5000 mAh, sạc 45W"),
    upsertSpec(s24u.id, attrOs.id,      "Android 14 / One UI 6.1"),
  ]);
  for (const [sv, sid, pe] of [[gb256, gb256.id, 0], [gb512, gb512.id, 3_000_000]] as any[]) {
    for (const [cv, cid] of [[clBlack, clBlack.id], [clGray, clGray.id]] as any[]) {
      const sku = `S24U-${sv.value.toUpperCase()}-${cv.value.toUpperCase()}`;
      const v = await db.productVariant.upsert({ where: { sku }, update: {}, create: { productId: s24u.id, sku, price: 33_990_000 + pe } });
      await db.variantOption.createMany({ skipDuplicates: true, data: [
        { variantId: v.id, attributeId: attrStorage.id, valueId: sid },
        { variantId: v.id, attributeId: attrColor.id,   valueId: cid  },
      ]});
      await addInventory(v.id, wh.id, 25);
    }
  }
  console.log("✅ Samsung Galaxy S24 Ultra — 4 variants");

  // ── 4. MacBook Pro M3 14" ────────────────────────────────────────────────
  const mbp14 = await db.product.upsert({
    where: { slug: "macbook-pro-m3-14" },
    update: {},
    create: { categoryId: catLaptop.id, brandId: apple.id, name: 'MacBook Pro M3 14"', slug: "macbook-pro-m3-14", shortDescription: "Chip Apple M3, màn hình Liquid Retina XDR, pin 18 giờ", basePrice: 42_990_000, isFeatured: true },
  });
  await Promise.all([
    upsertSpec(mbp14.id, attrCpu.id,        "Apple M3 (8-core CPU, 10-core GPU)"),
    upsertSpec(mbp14.id, attrRam.id,        "8 GB / 16 GB / 24 GB Unified Memory"),
    upsertSpec(mbp14.id, attrGpu.id,        "Apple M3 10-core GPU"),
    upsertSpec(mbp14.id, attrScreen.id,     '14.2" Liquid Retina XDR, 3024×1964, 254 ppi, ProMotion 120Hz'),
    upsertSpec(mbp14.id, attrResolution.id, "3024 × 1964 pixels"),
    upsertSpec(mbp14.id, attrOs.id,         "macOS Sonoma"),
    upsertSpec(mbp14.id, attrBattery.id,    "70 Wh, lên đến 18 giờ"),
    upsertSpec(mbp14.id, attrWeight.id,     "1.55 kg"),
  ]);
  for (const [sv, sid, pe] of [[gb512, gb512.id, 0], [gb1tb, gb1tb.id, 5_000_000]] as any[]) {
    const sku = `MBP14-M3-${sv.value.toUpperCase()}-SILVER`;
    const v = await db.productVariant.upsert({ where: { sku }, update: {}, create: { productId: mbp14.id, sku, price: 42_990_000 + pe, name: `${sv.displayValue} SSD` } });
    await db.variantOption.createMany({ skipDuplicates: true, data: [
      { variantId: v.id, attributeId: attrStorage.id, valueId: sid        },
      { variantId: v.id, attributeId: attrColor.id,   valueId: clSilver.id },
    ]});
    await addInventory(v.id, wh.id, 20);
  }
  console.log("✅ MacBook Pro M3 14\" — 2 variants");

  // ── 5. Dell XPS 13 Plus ──────────────────────────────────────────────────
  const xps13 = await db.product.upsert({
    where: { slug: "dell-xps-13-plus" },
    update: {},
    create: { categoryId: catLaptop.id, brandId: dell.id, name: "Dell XPS 13 Plus", slug: "dell-xps-13-plus", shortDescription: "Intel Core Ultra 7, màn hình OLED 3.5K, thiết kế siêu mỏng", basePrice: 38_990_000, isFeatured: false },
  });
  await Promise.all([
    upsertSpec(xps13.id, attrCpu.id,        "Intel Core Ultra 7 155H (16 cores, up to 4.8 GHz)"),
    upsertSpec(xps13.id, attrRam.id,        "32 GB LPDDR5x"),
    upsertSpec(xps13.id, attrGpu.id,        "Intel Arc Graphics"),
    upsertSpec(xps13.id, attrScreen.id,     '13.4" OLED 3.5K, 3456×2160, cảm ứng'),
    upsertSpec(xps13.id, attrResolution.id, "3456 × 2160 pixels"),
    upsertSpec(xps13.id, attrOs.id,         "Windows 11 Home"),
    upsertSpec(xps13.id, attrBattery.id,    "55 Wh, lên đến 12 giờ"),
    upsertSpec(xps13.id, attrWeight.id,     "1.26 kg"),
  ]);
  for (const [sv, sid] of [[gb512, gb512.id], [gb1tb, gb1tb.id]] as any[]) {
    const sku = `XPS13-${sv.value.toUpperCase()}-SILVER`;
    const v = await db.productVariant.upsert({ where: { sku }, update: {}, create: { productId: xps13.id, sku, price: 38_990_000 + (sv.value === "1tb" ? 4_000_000 : 0), name: `${sv.displayValue} SSD` } });
    await db.variantOption.createMany({ skipDuplicates: true, data: [
      { variantId: v.id, attributeId: attrStorage.id, valueId: sid        },
      { variantId: v.id, attributeId: attrColor.id,   valueId: clSilver.id },
    ]});
    await addInventory(v.id, wh.id, 15);
  }
  console.log("✅ Dell XPS 13 Plus — 2 variants");

  // ── 6. ASUS ROG Zephyrus G14 ─────────────────────────────────────────────
  const g14 = await db.product.upsert({
    where: { slug: "asus-rog-zephyrus-g14" },
    update: {},
    create: { categoryId: catLaptop.id, brandId: asus.id, name: "ASUS ROG Zephyrus G14", slug: "asus-rog-zephyrus-g14", shortDescription: "Ryzen 9, RTX 4060, màn hình 2.5K 165Hz, gaming mỏng nhẹ", basePrice: 45_990_000, isFeatured: true },
  });
  await Promise.all([
    upsertSpec(g14.id, attrCpu.id,        "AMD Ryzen 9 8945HS (8 cores, up to 5.2 GHz)"),
    upsertSpec(g14.id, attrRam.id,        "16 GB DDR5"),
    upsertSpec(g14.id, attrGpu.id,        "NVIDIA GeForce RTX 4060 8GB"),
    upsertSpec(g14.id, attrScreen.id,     '14" OLED 2.5K (2560×1600), 165Hz, 0.2ms'),
    upsertSpec(g14.id, attrResolution.id, "2560 × 1600 pixels"),
    upsertSpec(g14.id, attrOs.id,         "Windows 11 Home"),
    upsertSpec(g14.id, attrBattery.id,    "73 Wh, sạc 100W"),
    upsertSpec(g14.id, attrWeight.id,     "1.65 kg"),
  ]);
  for (const [sv, sid] of [[gb512, gb512.id], [gb1tb, gb1tb.id]] as any[]) {
    const sku = `G14-${sv.value.toUpperCase()}-GRAY`;
    const v = await db.productVariant.upsert({ where: { sku }, update: {}, create: { productId: g14.id, sku, price: 45_990_000 + (sv.value === "1tb" ? 3_000_000 : 0), name: `${sv.displayValue} SSD` } });
    await db.variantOption.createMany({ skipDuplicates: true, data: [
      { variantId: v.id, attributeId: attrStorage.id, valueId: sid        },
      { variantId: v.id, attributeId: attrColor.id,   valueId: clGray.id  },
    ]});
    await addInventory(v.id, wh.id, 12);
  }
  console.log("✅ ASUS ROG Zephyrus G14 — 2 variants");

  // ── 7. Sony WH-1000XM5 ───────────────────────────────────────────────────
  const wh1000xm5 = await db.product.upsert({
    where: { slug: "sony-wh-1000xm5" },
    update: {},
    create: { categoryId: catHeadphone.id, brandId: sony.id, name: "Sony WH-1000XM5", slug: "sony-wh-1000xm5", shortDescription: "Chống ồn hàng đầu, LDAC Hi-Res, pin 30 giờ", basePrice: 8_490_000, isFeatured: true },
  });
  await Promise.all([
    upsertSpec(wh1000xm5.id, attrDriver.id,       "30mm, HD Noise Cancelling Processor QN1"),
    upsertSpec(wh1000xm5.id, attrFrequency.id,    "4 Hz – 40.000 Hz"),
    upsertSpec(wh1000xm5.id, attrConnectivity.id, "Bluetooth 5.2, LDAC, NFC, 3.5mm"),
    upsertSpec(wh1000xm5.id, attrBattery.id,      "30 giờ (ANC bật), sạc nhanh 3 phút = 3 giờ"),
  ]);
  for (const [cv, cid] of [[clBlack, clBlack.id], [clSilver, clSilver.id]] as any[]) {
    const sku = `WH1000XM5-${cv.value.toUpperCase()}`;
    const v = await db.productVariant.upsert({ where: { sku }, update: {}, create: { productId: wh1000xm5.id, sku, price: 8_490_000 } });
    await db.variantOption.createMany({ skipDuplicates: true, data: [
      { variantId: v.id, attributeId: attrColor.id, valueId: cid },
    ]});
    await addInventory(v.id, wh.id, 40);
  }
  console.log("✅ Sony WH-1000XM5 — 2 variants");

  // ── 8. JBL Tune 770NC ────────────────────────────────────────────────────
  const jbl770 = await db.product.upsert({
    where: { slug: "jbl-tune-770nc" },
    update: {},
    create: { categoryId: catHeadphone.id, brandId: jbl.id, name: "JBL Tune 770NC", slug: "jbl-tune-770nc", shortDescription: "ANC Adaptive, pin 70 giờ, âm thanh JBL Pure Bass", basePrice: 2_490_000, isFeatured: false },
  });
  await Promise.all([
    upsertSpec(jbl770.id, attrDriver.id,       "40mm"),
    upsertSpec(jbl770.id, attrFrequency.id,    "20 Hz – 20.000 Hz"),
    upsertSpec(jbl770.id, attrConnectivity.id, "Bluetooth 5.3, 3.5mm"),
    upsertSpec(jbl770.id, attrBattery.id,      "70 giờ (ANC tắt), 44 giờ (ANC bật)"),
  ]);
  for (const [cv, cid] of [[clBlack, clBlack.id], [clBlue, clBlue.id], [clWhite, clWhite.id]] as any[]) {
    const sku = `JBL770-${cv.value.toUpperCase()}`;
    const v = await db.productVariant.upsert({ where: { sku }, update: {}, create: { productId: jbl770.id, sku, price: 2_490_000 } });
    await db.variantOption.createMany({ skipDuplicates: true, data: [
      { variantId: v.id, attributeId: attrColor.id, valueId: cid },
    ]});
    await addInventory(v.id, wh.id, 60);
  }
  console.log("✅ JBL Tune 770NC — 3 variants");

  // ── 9. LG UltraWide 34" ──────────────────────────────────────────────────
  const lg34 = await db.product.upsert({
    where: { slug: "lg-ultrawide-34wq75c" },
    update: {},
    create: { categoryId: catMonitor.id, brandId: lg.id, name: 'LG UltraWide 34" QHD', slug: "lg-ultrawide-34wq75c", shortDescription: "34 inch IPS 21:9, 3440×1440, 100Hz, USB-C 96W", basePrice: 12_990_000, isFeatured: false },
  });
  await Promise.all([
    upsertSpec(lg34.id, attrScreen.id,     '34" IPS, tỉ lệ 21:9, cong 1800R'),
    upsertSpec(lg34.id, attrResolution.id, "3440 × 1440 (WQHD)"),
    upsertSpec(lg34.id, attrRefreshRate.id,"100 Hz"),
    upsertSpec(lg34.id, attrConnectivity.id, "HDMI 2.0 ×2, DisplayPort 1.4, USB-C 96W, USB Hub"),
  ]);
  const lgV = await db.productVariant.upsert({ where: { sku: "LG34WQ75C-BLACK" }, update: {}, create: { productId: lg34.id, sku: "LG34WQ75C-BLACK", price: 12_990_000 } });
  await db.variantOption.createMany({ skipDuplicates: true, data: [
    { variantId: lgV.id, attributeId: attrColor.id, valueId: clBlack.id },
  ]});
  await addInventory(lgV.id, wh.id, 20);
  console.log("✅ LG UltraWide 34\" — 1 variant");

  console.log("\n🎉 Seed hoàn tất!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
