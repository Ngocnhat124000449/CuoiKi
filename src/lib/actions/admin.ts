'use server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { hasPermission } from '@/lib/permissions';
import { OrderStatus } from '@prisma/client';
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

  if (!name || !slug) return 'Tên và slug không được để trống';
  if (!categoryId) return 'Vui lòng chọn danh mục';
  if (isNaN(basePrice) || basePrice <= 0) return 'Giá phải lớn hơn 0';

  try {
    await db.product.create({
      data: {
        name,
        slug,
        shortDescription: (formData.get('shortDescription') as string) || null,
        description: (formData.get('description') as string) || null,
        categoryId,
        brandId: formData.get('brandId') ? Number(formData.get('brandId')) : null,
        basePrice,
        isActive: formData.get('isActive') === 'on',
        isFeatured: formData.get('isFeatured') === 'on',
        metaTitle: (formData.get('metaTitle') as string) || null,
        metaDescription: (formData.get('metaDescription') as string) || null,
      },
    });
  } catch (e) {
    if ((e as { code?: string }).code === 'P2002') return 'Slug đã tồn tại, hãy dùng slug khác';
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

  if (!name || !slug) return 'Tên và slug không được để trống';
  if (!categoryId) return 'Vui lòng chọn danh mục';
  if (isNaN(basePrice) || basePrice <= 0) return 'Giá phải lớn hơn 0';

  try {
    await db.product.update({
      where: { id: productId },
      data: {
        name,
        slug,
        shortDescription: (formData.get('shortDescription') as string) || null,
        description: (formData.get('description') as string) || null,
        categoryId,
        brandId: formData.get('brandId') ? Number(formData.get('brandId')) : null,
        basePrice,
        isActive: formData.get('isActive') === 'on',
        isFeatured: formData.get('isFeatured') === 'on',
        metaTitle: (formData.get('metaTitle') as string) || null,
        metaDescription: (formData.get('metaDescription') as string) || null,
      },
    });
  } catch (e) {
    if ((e as { code?: string }).code === 'P2002') return 'Slug đã tồn tại, hãy dùng slug khác';
    return 'Có lỗi xảy ra, thử lại sau';
  }
  redirect('/admin/products');
}

export async function deleteProductAction(formData: FormData) {
  await requirePermission('products', 'delete');
  const productId = BigInt(formData.get('productId') as string);
  await db.product.delete({ where: { id: productId } });
  revalidatePath('/admin/products');
}

// ── CATEGORIES ──
export async function createCategoryAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const guard = await guardPermission('categories', 'create');
  if (guard) return guard;

  const name = (formData.get('name') as string)?.trim();
  const slug = (formData.get('slug') as string)?.trim();
  if (!name || !slug) return 'Tên và slug không được để trống';

  try {
    await db.category.create({
      data: {
        name,
        slug,
        parentId: formData.get('parentId') ? Number(formData.get('parentId')) : null,
        description: (formData.get('description') as string) || null,
        displayOrder: Number(formData.get('displayOrder')) || 0,
        isActive: formData.get('isActive') === 'on',
      },
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

  try {
    await db.category.update({
      where: { id },
      data: {
        name,
        slug,
        parentId: formData.get('parentId') ? Number(formData.get('parentId')) : null,
        description: (formData.get('description') as string) || null,
        displayOrder: Number(formData.get('displayOrder')) || 0,
        isActive: formData.get('isActive') === 'on',
      },
    });
  } catch (e) {
    if ((e as { code?: string }).code === 'P2002') return 'Slug đã tồn tại, hãy dùng slug khác';
    return 'Có lỗi xảy ra';
  }
  redirect('/admin/categories');
}

export async function deleteCategoryAction(formData: FormData) {
  await requirePermission('categories', 'update');
  const id = Number(formData.get('categoryId'));
  await db.category.delete({ where: { id } });
  revalidatePath('/admin/categories');
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
  await db.brand.delete({ where: { id } });
  revalidatePath('/admin/brands');
}

// ── USERS ──
export async function toggleUserActiveAction(formData: FormData) {
  await requirePermission('users', 'toggle');
  const userId = BigInt(formData.get('userId') as string);
  const isActive = formData.get('isActive') === 'true';
  await db.user.update({ where: { id: userId }, data: { isActive: !isActive } });
  revalidatePath('/admin/users');
}
