'use server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { hasPermission } from '@/lib/permissions';
import { OrderStatus, DiscountType, ApplicableTo } from '@prisma/client';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { LIMITS, isValidSlug, checkLengths, exceedsDecimal, mapPrismaError } from '@/lib/validation';

const DISCOUNT_TYPES: DiscountType[] = ['PERCENT', 'FIXED_AMOUNT', 'FREE_SHIPPING'];
const APPLICABLE_TO: ApplicableTo[] = ['ALL', 'CATEGORY', 'PRODUCT'];

async function requirePermission(module: string, action: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Chưa đăng nhập');
  const allowed = await hasPermission(BigInt(session.user.id), module, action);
  if (!allowed) throw new Error('Không có quyền truy cập');
  return session;
}

async function guardPermission(module: string, action: string): Promise<string | null> {
  try {
    await requirePermission(module, action);
    return null;
  } catch (e) {
    return (e as Error).message;
  }
}

// ── ORDERS ──
export async function updateOrderStatusAction(formData: FormData) {
  await requirePermission('orders', 'update_status');
  const orderId = BigInt(formData.get('orderId') as string);
  const status = formData.get('status') as OrderStatus;
  await db.order.update({ where: { id: orderId }, data: { orderStatus: status } });
  revalidatePath('/admin/orders');
}

// ── PRODUCTS ──
export async function toggleProductActiveAction(formData: FormData) {
  await requirePermission('products', 'toggle');
  const productId = BigInt(formData.get('productId') as string);
  const isActive = formData.get('isActive') === 'true';
  await db.product.update({ where: { id: productId }, data: { isActive: !isActive } });
  revalidateTag('products', 'max');
  revalidateTag('categories', 'max');
  revalidatePath('/admin/products');
}

type VariantInput = {
  variantId: string;
  sku: string;
  price: string;
  compareAtPrice: string;
  options: Record<string, string>; // attributeId (string) → valueId (string)
};

function parseSpecEntries(formData: FormData): { attributeId: number; textValue: string }[] {
  const specMap = new Map<number, string>();
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('spec_') && (value as string).trim()) {
      const attributeId = parseInt(key.slice(5), 10);
      if (!isNaN(attributeId)) {
        specMap.set(attributeId, (value as string).trim());
      }
    }
  }
  return Array.from(specMap.entries()).map(([attributeId, textValue]) => ({ attributeId, textValue }));
}

function parseVariantsJson(formData: FormData): VariantInput[] | null {
  try {
    return JSON.parse((formData.get('variants') as string) || '[]');
  } catch {
    return null;
  }
}

// Shared synchronous validation for product create/update (no DB access).
function validateProductForm(
  formData: FormData,
  name: string,
  slug: string,
  basePrice: number,
  categoryId: number,
  brandId: number,
  variantsData: VariantInput[]
): string | null {
  if (!name || !slug) return 'Tên và slug không được để trống';
  if (!isValidSlug(slug)) return 'Slug chỉ gồm chữ thường, số và dấu gạch ngang (vd: iphone-15-pro)';
  if (!categoryId) return 'Vui lòng chọn danh mục';
  if (!brandId) return 'Vui lòng chọn nhà cung cấp';
  if (isNaN(basePrice) || basePrice <= 0) return 'Giá phải lớn hơn 0';
  if (exceedsDecimal(basePrice, 18, 2)) return 'Giá vượt quá giới hạn cho phép';

  const lenErr = checkLengths([
    { label: 'Tên sản phẩm', value: name, max: LIMITS.product.name },
    { label: 'Slug', value: slug, max: LIMITS.product.slug },
    { label: 'Mô tả ngắn', value: formData.get('shortDescription') as string, max: LIMITS.product.shortDescription },
    { label: 'Meta title', value: formData.get('metaTitle') as string, max: LIMITS.product.metaTitle },
    { label: 'Meta description', value: formData.get('metaDescription') as string, max: LIMITS.product.metaDescription },
  ]);
  if (lenErr) return lenErr;

  if (variantsData.length === 0) return 'Sản phẩm phải có ít nhất một biến thể';
  const seenSku = new Set<string>();
  for (const v of variantsData) {
    const sku = v.sku?.trim();
    if (!sku) return 'Mỗi biến thể phải có SKU';
    if (sku.length > LIMITS.variant.sku) return `SKU không được vượt quá ${LIMITS.variant.sku} ký tự`;
    const skuKey = sku.toLowerCase();
    if (seenSku.has(skuKey)) return `SKU "${sku}" bị trùng giữa các biến thể`;
    seenSku.add(skuKey);
    if (!v.price || Number(v.price) <= 0) return 'Giá biến thể phải lớn hơn 0';
    if (exceedsDecimal(Number(v.price), 18, 2)) return 'Giá biến thể vượt quá giới hạn cho phép';
  }
  return null;
}

// DB-backed checks: FK targets exist + required category attributes are filled.
async function validateProductRelations(
  categoryId: number,
  brandId: number,
  specAttributeIds: Set<number>
): Promise<string | null> {
  const [category, brand] = await Promise.all([
    db.category.findUnique({ where: { id: categoryId }, select: { id: true } }),
    db.brand.findUnique({ where: { id: brandId }, select: { id: true } }),
  ]);
  if (!category) return 'Danh mục đã chọn không tồn tại';
  if (!brand) return 'Nhà cung cấp đã chọn không tồn tại';

  const requiredAttrs = await db.categoryAttribute.findMany({
    where: { categoryId, isRequired: true },
    select: { attributeId: true, attribute: { select: { displayName: true } } },
  });
  const missing = requiredAttrs.filter((r) => !specAttributeIds.has(r.attributeId));
  if (missing.length > 0) {
    return `Thiếu thông số bắt buộc của danh mục: ${missing.map((m) => m.attribute.displayName).join(', ')}`;
  }
  return null;
}

export async function createProductAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const guard = await guardPermission('products', 'create');
  if (guard) return guard;

  const name = (formData.get('name') as string)?.trim();
  const slug = (formData.get('slug') as string)?.trim();
  const basePrice = parseFloat(formData.get('basePrice') as string);
  const categoryId = Number(formData.get('categoryId'));
  const brandId = Number(formData.get('brandId'));

  const specEntries = parseSpecEntries(formData);
  const variantsData = parseVariantsJson(formData);
  if (!variantsData) return 'Dữ liệu biến thể không hợp lệ';

  const formErr = validateProductForm(formData, name, slug, basePrice, categoryId, brandId, variantsData);
  if (formErr) return formErr;

  const relErr = await validateProductRelations(categoryId, brandId, new Set(specEntries.map((s) => s.attributeId)));
  if (relErr) return relErr;

  try {
    await db.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name, slug,
          shortDescription: (formData.get('shortDescription') as string) || null,
          description: (formData.get('description') as string) || null,
          categoryId, brandId,
          basePrice,
          isActive: formData.get('isActive') === 'on',
          isFeatured: formData.get('isFeatured') === 'on',
          metaTitle: (formData.get('metaTitle') as string) || null,
          metaDescription: (formData.get('metaDescription') as string) || null,
        },
      });

      if (specEntries.length > 0) {
        await tx.productAttributeValue.createMany({
          data: specEntries.map((s) => ({ productId: product.id, attributeId: s.attributeId, textValue: s.textValue })),
        });
      }

      for (const v of variantsData) {
        const variant = await tx.productVariant.create({
          data: { productId: product.id, sku: v.sku.trim(), price: Number(v.price), compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null, isActive: true },
        });
        const opts = Object.entries(v.options).filter(([, val]) => val);
        if (opts.length > 0) {
          await tx.variantOption.createMany({
            data: opts.map(([attrId, valId]) => ({ variantId: variant.id, attributeId: parseInt(attrId, 10), valueId: BigInt(valId) })),
          });
        }
      }
    });
  } catch (e) {
    return mapPrismaError(e, {
      unique: 'Slug hoặc SKU đã tồn tại, hãy kiểm tra lại',
      fk: 'Danh mục, nhà cung cấp hoặc thuộc tính tham chiếu không tồn tại',
    });
  }
  revalidateTag('products', 'max');
  revalidateTag('categories', 'max');
  redirect('/admin/products');
}

export async function updateProductAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const guard = await guardPermission('products', 'update');
  if (guard) return guard;

  const productId = BigInt(formData.get('productId') as string);
  const name = (formData.get('name') as string)?.trim();
  const slug = (formData.get('slug') as string)?.trim();
  const basePrice = parseFloat(formData.get('basePrice') as string);
  const categoryId = Number(formData.get('categoryId'));
  const brandId = Number(formData.get('brandId'));

  const specEntries = parseSpecEntries(formData);
  const variantsData = parseVariantsJson(formData);
  if (!variantsData) return 'Dữ liệu biến thể không hợp lệ';

  const formErr = validateProductForm(formData, name, slug, basePrice, categoryId, brandId, variantsData);
  if (formErr) return formErr;

  const relErr = await validateProductRelations(categoryId, brandId, new Set(specEntries.map((s) => s.attributeId)));
  if (relErr) return relErr;

  try {
    await db.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: {
          name, slug,
          shortDescription: (formData.get('shortDescription') as string) || null,
          description: (formData.get('description') as string) || null,
          categoryId, brandId,
          basePrice,
          isActive: formData.get('isActive') === 'on',
          isFeatured: formData.get('isFeatured') === 'on',
          metaTitle: (formData.get('metaTitle') as string) || null,
          metaDescription: (formData.get('metaDescription') as string) || null,
        },
      });

      // Specs: delete all → re-create
      await tx.productAttributeValue.deleteMany({ where: { productId } });
      if (specEntries.length > 0) {
        await tx.productAttributeValue.createMany({
          data: specEntries.map((s) => ({ productId, attributeId: s.attributeId, textValue: s.textValue })),
        });
      }

      // Variants: get existing IDs, deactivate removed, update/create submitted
      const existingVariants = await tx.productVariant.findMany({ where: { productId }, select: { id: true } });
      const existingIdSet = new Set(existingVariants.map((v) => v.id.toString()));
      const submittedIdSet = new Set(variantsData.map((v) => v.variantId).filter(Boolean));

      for (const existId of existingIdSet) {
        if (!submittedIdSet.has(existId)) {
          await tx.productVariant.update({ where: { id: BigInt(existId) }, data: { isActive: false } });
        }
      }

      for (const v of variantsData) {
        const opts = Object.entries(v.options).filter(([, val]) => val);
        if (v.variantId) {
          await tx.productVariant.update({
            where: { id: BigInt(v.variantId) },
            data: { sku: v.sku.trim(), price: Number(v.price), compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null, isActive: true },
          });
          await tx.variantOption.deleteMany({ where: { variantId: BigInt(v.variantId) } });
          if (opts.length > 0) {
            await tx.variantOption.createMany({
              data: opts.map(([attrId, valId]) => ({ variantId: BigInt(v.variantId), attributeId: parseInt(attrId, 10), valueId: BigInt(valId) })),
            });
          }
        } else {
          const newVariant = await tx.productVariant.create({
            data: { productId, sku: v.sku.trim(), price: Number(v.price), compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null, isActive: true },
          });
          if (opts.length > 0) {
            await tx.variantOption.createMany({
              data: opts.map(([attrId, valId]) => ({ variantId: newVariant.id, attributeId: parseInt(attrId, 10), valueId: BigInt(valId) })),
            });
          }
        }
      }
    });
  } catch (e) {
    return mapPrismaError(e, {
      unique: 'Slug hoặc SKU đã tồn tại, hãy kiểm tra lại',
      fk: 'Danh mục, nhà cung cấp hoặc thuộc tính tham chiếu không tồn tại',
    });
  }
  revalidateTag('products', 'max');
  revalidateTag('categories', 'max');
  redirect('/admin/products');
}

export async function deleteProductAction(formData: FormData) {
  await requirePermission('products', 'delete');
  const productId = BigInt(formData.get('productId') as string);
  try {
    await db.product.delete({ where: { id: productId } });
  } catch (e) {
    if ((e as { code?: string }).code === 'P2003')
      throw new Error('Không thể xóa: Sản phẩm đang được tham chiếu bởi đơn hàng hoặc dữ liệu khác');
    throw e;
  }
  revalidateTag('products', 'max');
  revalidateTag('categories', 'max');
  revalidatePath('/admin/products');
}

// ── CATEGORIES ──

function parseCategoryAttrs(formData: FormData) {
  const result: { attributeId: number; groupName: string | null; displayOrder: number; isRequired: boolean; showInSpec: boolean }[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('attr_check_') && value === 'on') {
      const attrId = parseInt(key.slice('attr_check_'.length), 10);
      if (isNaN(attrId)) continue;
      const groupName = (formData.get(`attr_group_${attrId}`) as string)?.trim() || null;
      const displayOrder = parseInt(formData.get(`attr_order_${attrId}`) as string) || 0;
      const isRequired = formData.get(`attr_req_${attrId}`) === 'on';
      result.push({ attributeId: attrId, groupName, displayOrder, isRequired, showInSpec: true });
    }
  }
  return result;
}

// Detects whether setting `parentId` as parent of `categoryId` creates a loop.
async function categoryCycleExists(categoryId: number, parentId: number): Promise<boolean> {
  let current: number | null = parentId;
  const visited = new Set<number>();
  while (current != null) {
    if (current === categoryId) return true;
    if (visited.has(current)) break; // pre-existing cycle in data — stop walking
    visited.add(current);
    const node: { parentId: number | null } | null = await db.category.findUnique({
      where: { id: current },
      select: { parentId: true },
    });
    if (!node) break;
    current = node.parentId;
  }
  return false;
}

function validateCategoryForm(name: string, slug: string): string | null {
  if (!name || !slug) return 'Tên và slug không được để trống';
  if (!isValidSlug(slug)) return 'Slug chỉ gồm chữ thường, số và dấu gạch ngang';
  return checkLengths([
    { label: 'Tên danh mục', value: name, max: LIMITS.category.name },
    { label: 'Slug', value: slug, max: LIMITS.category.slug },
  ]);
}

export async function createCategoryAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const guard = await guardPermission('categories', 'create');
  if (guard) return guard;

  const name = (formData.get('name') as string)?.trim();
  const slug = (formData.get('slug') as string)?.trim();
  const parentId = formData.get('parentId') ? Number(formData.get('parentId')) : null;

  const formErr = validateCategoryForm(name, slug);
  if (formErr) return formErr;

  const catAttrs = parseCategoryAttrs(formData);
  if (catAttrs.length === 0) return 'Vui lòng chọn ít nhất một thông số kỹ thuật cho danh mục';

  if (parentId != null) {
    const parent = await db.category.findUnique({ where: { id: parentId }, select: { id: true } });
    if (!parent) return 'Danh mục cha đã chọn không tồn tại';
  }

  try {
    await db.$transaction(async (tx) => {
      const category = await tx.category.create({
        data: {
          name, slug,
          parentId,
          description: (formData.get('description') as string) || null,
          displayOrder: Number(formData.get('displayOrder')) || 0,
          isActive: formData.get('isActive') === 'on',
        },
      });
      await tx.categoryAttribute.createMany({
        data: catAttrs.map((a) => ({ categoryId: category.id, ...a })),
      });
    });
  } catch (e) {
    return mapPrismaError(e, { unique: 'Slug đã tồn tại, hãy dùng slug khác', fk: 'Danh mục cha hoặc thuộc tính tham chiếu không tồn tại' });
  }
  revalidateTag('categories', 'max');
  revalidateTag('products', 'max');
  redirect('/admin/categories');
}

export async function updateCategoryAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const guard = await guardPermission('categories', 'update');
  if (guard) return guard;

  const id = Number(formData.get('categoryId'));
  const name = (formData.get('name') as string)?.trim();
  const slug = (formData.get('slug') as string)?.trim();
  const parentId = formData.get('parentId') ? Number(formData.get('parentId')) : null;

  const formErr = validateCategoryForm(name, slug);
  if (formErr) return formErr;

  const catAttrs = parseCategoryAttrs(formData);

  if (parentId != null) {
    if (parentId === id) return 'Danh mục không thể là cha của chính nó';
    const parent = await db.category.findUnique({ where: { id: parentId }, select: { id: true } });
    if (!parent) return 'Danh mục cha đã chọn không tồn tại';
    if (await categoryCycleExists(id, parentId)) return 'Không thể chọn danh mục con làm danh mục cha (gây vòng lặp)';
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.category.update({
        where: { id },
        data: {
          name, slug,
          parentId,
          description: (formData.get('description') as string) || null,
          displayOrder: Number(formData.get('displayOrder')) || 0,
          isActive: formData.get('isActive') === 'on',
        },
      });
      await tx.categoryAttribute.deleteMany({ where: { categoryId: id } });
      if (catAttrs.length > 0) {
        await tx.categoryAttribute.createMany({
          data: catAttrs.map((a) => ({ categoryId: id, ...a })),
        });
      }
    });
  } catch (e) {
    return mapPrismaError(e, { unique: 'Slug đã tồn tại, hãy dùng slug khác', fk: 'Danh mục cha hoặc thuộc tính tham chiếu không tồn tại' });
  }
  revalidateTag('categories', 'max');
  revalidateTag('products', 'max');
  redirect('/admin/categories');
}

export async function deleteCategoryAction(formData: FormData) {
  await requirePermission('categories', 'delete');
  const id = Number(formData.get('categoryId'));
  try {
    await db.category.delete({ where: { id } });
  } catch (e) {
    if ((e as { code?: string }).code === 'P2003')
      throw new Error('Không thể xóa: Danh mục đang được sử dụng bởi sản phẩm');
    throw e;
  }
  revalidateTag('categories', 'max');
  revalidateTag('products', 'max');
  revalidatePath('/admin/categories');
}

type QuickAttrResult =
  | { ok: true; attr: { id: number; name: string; displayName: string; inputType: string } }
  | { ok: false; error: string };

export async function createAttributeQuickAction(formData: FormData): Promise<QuickAttrResult> {
  const guard = await guardPermission('categories', 'create');
  if (guard) return { ok: false, error: guard };

  const displayName = (formData.get('displayName') as string)?.trim();
  const name = (formData.get('name') as string)?.trim();
  const inputType = (formData.get('inputType') as string)?.trim();
  const unit = (formData.get('unit') as string)?.trim() || null;

  if (!displayName || !name || !inputType) {
    return { ok: false, error: 'Tên hiển thị, khóa và kiểu nhập là bắt buộc' };
  }

  const validTypes = ['TEXT', 'NUMBER', 'SELECT', 'MULTI_SELECT', 'BOOLEAN', 'COLOR'];
  if (!validTypes.includes(inputType)) {
    return { ok: false, error: 'Kiểu nhập không hợp lệ' };
  }

  const lenErr = checkLengths([
    { label: 'Khóa', value: name, max: 80 },
    { label: 'Tên hiển thị', value: displayName, max: 100 },
    { label: 'Đơn vị', value: unit, max: 20 },
  ]);
  if (lenErr) return { ok: false, error: lenErr };

  try {
    const attr = await db.attribute.create({
      data: { name, displayName, inputType: inputType as 'TEXT' | 'NUMBER' | 'SELECT' | 'MULTI_SELECT' | 'BOOLEAN' | 'COLOR', unit },
      select: { id: true, name: true, displayName: true, inputType: true },
    });
    revalidatePath('/admin/categories');
    return { ok: true, attr: { ...attr, inputType: attr.inputType as string } };
  } catch (e) {
    if ((e as { code?: string }).code === 'P2002') {
      return { ok: false, error: `Khóa "${name}" đã tồn tại, hãy dùng tên khác` };
    }
    return { ok: false, error: 'Có lỗi xảy ra khi tạo thuộc tính' };
  }
}

// ── BRANDS ──
function validateBrandForm(formData: FormData, name: string, slug: string): string | null {
  if (!name || !slug) return 'Tên và slug không được để trống';
  if (!isValidSlug(slug)) return 'Slug chỉ gồm chữ thường, số và dấu gạch ngang';
  return checkLengths([
    { label: 'Tên nhãn hàng', value: name, max: LIMITS.brand.name },
    { label: 'Slug', value: slug, max: LIMITS.brand.slug },
    { label: 'Website', value: formData.get('websiteUrl') as string, max: LIMITS.brand.websiteUrl },
    { label: 'Xuất xứ', value: formData.get('countryOfOrigin') as string, max: LIMITS.brand.countryOfOrigin },
  ]);
}

export async function createBrandAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const guard = await guardPermission('brands', 'create');
  if (guard) return guard;

  const name = (formData.get('name') as string)?.trim();
  const slug = (formData.get('slug') as string)?.trim();

  const formErr = validateBrandForm(formData, name, slug);
  if (formErr) return formErr;

  try {
    await db.brand.create({
      data: {
        name,
        slug,
        description: (formData.get('description') as string) || null,
        websiteUrl: (formData.get('websiteUrl') as string) || null,
        countryOfOrigin: (formData.get('countryOfOrigin') as string) || null,
        isActive: formData.get('isActive') === 'on',
      },
    });
  } catch (e) {
    return mapPrismaError(e, { unique: 'Slug đã tồn tại, hãy dùng slug khác' });
  }
  revalidateTag('brands', 'max');
  revalidateTag('products', 'max');
  redirect('/admin/brands');
}

export async function updateBrandAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const guard = await guardPermission('brands', 'update');
  if (guard) return guard;

  const id = Number(formData.get('brandId'));
  const name = (formData.get('name') as string)?.trim();
  const slug = (formData.get('slug') as string)?.trim();

  const formErr = validateBrandForm(formData, name, slug);
  if (formErr) return formErr;

  try {
    await db.brand.update({
      where: { id },
      data: {
        name,
        slug,
        description: (formData.get('description') as string) || null,
        websiteUrl: (formData.get('websiteUrl') as string) || null,
        countryOfOrigin: (formData.get('countryOfOrigin') as string) || null,
        isActive: formData.get('isActive') === 'on',
      },
    });
  } catch (e) {
    return mapPrismaError(e, { unique: 'Slug đã tồn tại, hãy dùng slug khác' });
  }
  revalidateTag('brands', 'max');
  revalidateTag('products', 'max');
  redirect('/admin/brands');
}

export async function deleteBrandAction(formData: FormData) {
  await requirePermission('brands', 'delete');
  const id = Number(formData.get('brandId'));
  try {
    await db.brand.delete({ where: { id } });
  } catch (e) {
    if ((e as { code?: string }).code === 'P2003')
      throw new Error('Không thể xóa: Nhãn hàng đang được sử dụng bởi sản phẩm');
    throw e;
  }
  revalidateTag('brands', 'max');
  revalidateTag('products', 'max');
  revalidatePath('/admin/brands');
}

// ── COUPONS ──
function validateCouponForm(formData: FormData): string | null {
  const code = (formData.get('code') as string)?.trim().toUpperCase();
  const name = (formData.get('name') as string)?.trim();
  const discountType = formData.get('discountType') as DiscountType;
  const applicableTo = ((formData.get('applicableTo') as string) || 'ALL') as ApplicableTo;
  const startDate = new Date(formData.get('startDate') as string);
  const endDate = new Date(formData.get('endDate') as string);

  if (!code || !name) return 'Mã và tên không được để trống';
  if (!discountType) return 'Vui lòng chọn loại giảm giá';
  if (!DISCOUNT_TYPES.includes(discountType)) return 'Loại giảm giá không hợp lệ';
  if (!APPLICABLE_TO.includes(applicableTo)) return 'Phạm vi áp dụng không hợp lệ';
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 'Ngày không hợp lệ';
  if (endDate <= startDate) return 'Ngày kết thúc phải sau ngày bắt đầu';

  const discountValue = parseFloat(formData.get('discountValue') as string) || 0;
  if (discountType !== 'FREE_SHIPPING' && discountValue <= 0) return 'Giá trị giảm phải lớn hơn 0';
  if (discountType === 'PERCENT' && discountValue > 100) return 'Phần trăm giảm tối đa là 100%';
  if (exceedsDecimal(discountValue, 10, 2)) return 'Giá trị giảm vượt quá giới hạn cho phép';

  const minOrderAmount = parseFloat(formData.get('minOrderAmount') as string) || 0;
  if (exceedsDecimal(minOrderAmount, 18, 2)) return 'Giá trị đơn tối thiểu vượt quá giới hạn';
  const maxDiscStr = (formData.get('maxDiscountAmount') as string)?.trim();
  if (maxDiscStr && exceedsDecimal(parseFloat(maxDiscStr), 18, 2)) return 'Mức giảm tối đa vượt quá giới hạn';

  return checkLengths([
    { label: 'Mã coupon', value: code, max: LIMITS.coupon.code },
    { label: 'Tên', value: name, max: LIMITS.coupon.name },
    { label: 'Mô tả', value: formData.get('description') as string, max: LIMITS.coupon.description },
  ]);
}

export async function createCouponAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const guard = await guardPermission('coupons', 'create');
  if (guard) return guard;

  const formErr = validateCouponForm(formData);
  if (formErr) return formErr;

  const code = (formData.get('code') as string)?.trim().toUpperCase();
  const name = (formData.get('name') as string)?.trim();
  const discountType = formData.get('discountType') as DiscountType;
  const startDate = new Date(formData.get('startDate') as string);
  const endDate = new Date(formData.get('endDate') as string);
  const discountValue = parseFloat(formData.get('discountValue') as string) || 0;
  const minOrderAmount = parseFloat(formData.get('minOrderAmount') as string) || 0;
  const maxDiscStr = (formData.get('maxDiscountAmount') as string)?.trim();
  const usageLimitStr = (formData.get('usageLimit') as string)?.trim();
  const perUserLimit = parseInt(formData.get('perUserLimit') as string) || 1;
  const applicableTo = (formData.get('applicableTo') as ApplicableTo) || 'ALL';

  try {
    await db.coupon.create({
      data: {
        code,
        name,
        description: (formData.get('description') as string) || null,
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscountAmount: maxDiscStr ? parseFloat(maxDiscStr) : null,
        usageLimit: usageLimitStr ? parseInt(usageLimitStr) : null,
        perUserLimit,
        applicableTo,
        startDate,
        endDate,
        isActive: formData.get('isActive') === 'on',
      },
    });
  } catch (e) {
    return mapPrismaError(e, { unique: 'Mã coupon đã tồn tại, hãy dùng mã khác' });
  }
  redirect('/admin/coupons');
}

export async function updateCouponAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const guard = await guardPermission('coupons', 'update');
  if (guard) return guard;

  const id = Number(formData.get('couponId'));

  const formErr = validateCouponForm(formData);
  if (formErr) return formErr;

  const code = (formData.get('code') as string)?.trim().toUpperCase();
  const name = (formData.get('name') as string)?.trim();
  const discountType = formData.get('discountType') as DiscountType;
  const startDate = new Date(formData.get('startDate') as string);
  const endDate = new Date(formData.get('endDate') as string);
  const discountValue = parseFloat(formData.get('discountValue') as string) || 0;
  const minOrderAmount = parseFloat(formData.get('minOrderAmount') as string) || 0;
  const maxDiscStr = (formData.get('maxDiscountAmount') as string)?.trim();
  const usageLimitStr = (formData.get('usageLimit') as string)?.trim();
  const perUserLimit = parseInt(formData.get('perUserLimit') as string) || 1;
  const applicableTo = (formData.get('applicableTo') as ApplicableTo) || 'ALL';

  try {
    await db.coupon.update({
      where: { id },
      data: {
        code,
        name,
        description: (formData.get('description') as string) || null,
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscountAmount: maxDiscStr ? parseFloat(maxDiscStr) : null,
        usageLimit: usageLimitStr ? parseInt(usageLimitStr) : null,
        perUserLimit,
        applicableTo,
        startDate,
        endDate,
        isActive: formData.get('isActive') === 'on',
      },
    });
  } catch (e) {
    return mapPrismaError(e, { unique: 'Mã coupon đã tồn tại, hãy dùng mã khác' });
  }
  redirect('/admin/coupons');
}

export async function deleteCouponAction(formData: FormData) {
  await requirePermission('coupons', 'delete');
  const id = Number(formData.get('couponId'));
  try {
    await db.coupon.delete({ where: { id } });
  } catch (e) {
    if ((e as { code?: string }).code === 'P2003')
      throw new Error('Không thể xóa: Mã giảm giá đang được tham chiếu bởi đơn hàng');
    throw e;
  }
  revalidatePath('/admin/coupons');
}

export async function toggleCouponActiveAction(formData: FormData) {
  await requirePermission('coupons', 'toggle');
  const id = Number(formData.get('couponId'));
  const isActive = formData.get('isActive') === 'true';
  await db.coupon.update({ where: { id }, data: { isActive: !isActive } });
  revalidatePath('/admin/coupons');
}

// ── USERS ──
export async function toggleUserActiveAction(formData: FormData) {
  await requirePermission('users', 'toggle');
  const userId = BigInt(formData.get('userId') as string);
  const isActive = formData.get('isActive') === 'true';
  await db.user.update({ where: { id: userId }, data: { isActive: !isActive } });
  revalidatePath('/admin/users');
}
