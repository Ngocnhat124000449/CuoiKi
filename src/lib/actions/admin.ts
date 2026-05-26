'use server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { hasPermission } from '@/lib/permissions';
import { OrderStatus, DiscountType, ApplicableTo } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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

  if (!name || !slug) return 'Tên và slug không được để trống';
  if (!categoryId) return 'Vui lòng chọn danh mục';
  if (!brandId) return 'Vui lòng chọn nhà cung cấp';
  if (isNaN(basePrice) || basePrice <= 0) return 'Giá phải lớn hơn 0';

  const specEntries = parseSpecEntries(formData);
  const variantsData = parseVariantsJson(formData);
  if (!variantsData) return 'Dữ liệu biến thể không hợp lệ';
  for (const v of variantsData) {
    if (!v.sku?.trim()) return 'Mỗi biến thể phải có SKU';
    if (!v.price || Number(v.price) <= 0) return 'Giá biến thể phải lớn hơn 0';
  }

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
    if ((e as { code?: string }).code === 'P2002') return 'Slug hoặc SKU đã tồn tại, hãy kiểm tra lại';
    return 'Có lỗi xảy ra, thử lại sau';
  }
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

  if (!name || !slug) return 'Tên và slug không được để trống';
  if (!categoryId) return 'Vui lòng chọn danh mục';
  if (!brandId) return 'Vui lòng chọn nhà cung cấp';
  if (isNaN(basePrice) || basePrice <= 0) return 'Giá phải lớn hơn 0';

  const specEntries = parseSpecEntries(formData);
  const variantsData = parseVariantsJson(formData);
  if (!variantsData) return 'Dữ liệu biến thể không hợp lệ';
  for (const v of variantsData) {
    if (!v.sku?.trim()) return 'Mỗi biến thể phải có SKU';
    if (!v.price || Number(v.price) <= 0) return 'Giá biến thể phải lớn hơn 0';
  }

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
    if ((e as { code?: string }).code === 'P2002') return 'Slug hoặc SKU đã tồn tại, hãy kiểm tra lại';
    return 'Có lỗi xảy ra';
  }
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

export async function createCategoryAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const guard = await guardPermission('categories', 'create');
  if (guard) return guard;

  const name = (formData.get('name') as string)?.trim();
  const slug = (formData.get('slug') as string)?.trim();
  if (!name || !slug) return 'Tên và slug không được để trống';

  const catAttrs = parseCategoryAttrs(formData);
  if (catAttrs.length === 0) return 'Vui lòng chọn ít nhất một thông số kỹ thuật cho danh mục';

  try {
    await db.$transaction(async (tx) => {
      const category = await tx.category.create({
        data: {
          name, slug,
          parentId: formData.get('parentId') ? Number(formData.get('parentId')) : null,
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
    if ((e as { code?: string }).code === 'P2002') return 'Slug đã tồn tại, hãy dùng slug khác';
    return 'Có lỗi xảy ra';
  }
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
  if (!name || !slug) return 'Tên và slug không được để trống';

  const catAttrs = parseCategoryAttrs(formData);

  try {
    await db.$transaction(async (tx) => {
      await tx.category.update({
        where: { id },
        data: {
          name, slug,
          parentId: formData.get('parentId') ? Number(formData.get('parentId')) : null,
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
    if ((e as { code?: string }).code === 'P2002') return 'Slug đã tồn tại, hãy dùng slug khác';
    return 'Có lỗi xảy ra';
  }
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
export async function createBrandAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const guard = await guardPermission('brands', 'create');
  if (guard) return guard;

  const name = (formData.get('name') as string)?.trim();
  const slug = (formData.get('slug') as string)?.trim();
  if (!name || !slug) return 'Tên và slug không được để trống';

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
    if ((e as { code?: string }).code === 'P2002') return 'Slug đã tồn tại, hãy dùng slug khác';
    return 'Có lỗi xảy ra';
  }
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
  if (!name || !slug) return 'Tên và slug không được để trống';

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
    if ((e as { code?: string }).code === 'P2002') return 'Slug đã tồn tại, hãy dùng slug khác';
    return 'Có lỗi xảy ra';
  }
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
  revalidatePath('/admin/brands');
}

// ── COUPONS ──
export async function createCouponAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const guard = await guardPermission('coupons', 'create');
  if (guard) return guard;

  const code = (formData.get('code') as string)?.trim().toUpperCase();
  const name = (formData.get('name') as string)?.trim();
  const discountType = formData.get('discountType') as DiscountType;
  const startDate = new Date(formData.get('startDate') as string);
  const endDate = new Date(formData.get('endDate') as string);

  if (!code || !name) return 'Mã và tên không được để trống';
  if (!discountType) return 'Vui lòng chọn loại giảm giá';
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 'Ngày không hợp lệ';
  if (endDate <= startDate) return 'Ngày kết thúc phải sau ngày bắt đầu';

  const discountValue = parseFloat(formData.get('discountValue') as string) || 0;
  if (discountType !== 'FREE_SHIPPING' && discountValue <= 0) return 'Giá trị giảm phải lớn hơn 0';
  if (discountType === 'PERCENT' && discountValue > 100) return 'Phần trăm giảm tối đa là 100%';

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
    if ((e as { code?: string }).code === 'P2002') return 'Mã coupon đã tồn tại, hãy dùng mã khác';
    return 'Có lỗi xảy ra, thử lại sau';
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
  const code = (formData.get('code') as string)?.trim().toUpperCase();
  const name = (formData.get('name') as string)?.trim();
  const discountType = formData.get('discountType') as DiscountType;
  const startDate = new Date(formData.get('startDate') as string);
  const endDate = new Date(formData.get('endDate') as string);

  if (!code || !name) return 'Mã và tên không được để trống';
  if (!discountType) return 'Vui lòng chọn loại giảm giá';
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 'Ngày không hợp lệ';
  if (endDate <= startDate) return 'Ngày kết thúc phải sau ngày bắt đầu';

  const discountValue = parseFloat(formData.get('discountValue') as string) || 0;
  if (discountType !== 'FREE_SHIPPING' && discountValue <= 0) return 'Giá trị giảm phải lớn hơn 0';
  if (discountType === 'PERCENT' && discountValue > 100) return 'Phần trăm giảm tối đa là 100%';

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
    if ((e as { code?: string }).code === 'P2002') return 'Mã coupon đã tồn tại, hãy dùng mã khác';
    return 'Có lỗi xảy ra';
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
