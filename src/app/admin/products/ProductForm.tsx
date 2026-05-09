'use client';
import { useActionState } from 'react';
import Link from 'next/link';
import styles from '../_form.module.scss';

type ActionFn = (prev: string | null, data: FormData) => Promise<string | null>;
type Category = { id: number; name: string };
type Brand    = { id: number; name: string };
type DefaultValues = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  categoryId: number;
  brandId: number | null;
  basePrice: number;
  isActive: boolean;
  isFeatured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
};

function toSlug(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export default function ProductForm({
  action,
  categories,
  brands,
  defaultValues,
}: {
  action: ActionFn;
  categories: Category[];
  brands: Brand[];
  defaultValues?: DefaultValues;
}) {
  const [error, formAction, isPending] = useActionState(action, null);
  const isEdit = !!defaultValues;

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (isEdit) return;
    const slugInput = document.getElementById('slug-input') as HTMLInputElement;
    if (slugInput) slugInput.value = toSlug(e.target.value);
  }

  return (
    <form action={formAction}>
      {isEdit && <input type="hidden" name="productId" value={defaultValues.id} />}
      {error && <div className={styles.error}>{error}</div>}

      {/* ── Thông tin cơ bản ── */}
      <div className={styles.formCard}>
        <p className={styles.sectionTitle}>Thông tin cơ bản</p>
        <div className={styles.grid2}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">
              Tên sản phẩm <span className={styles.required}>*</span>
            </label>
            <input
              id="name"
              name="name"
              className={styles.input}
              placeholder="Ví dụ: Samsung Galaxy S25"
              defaultValue={defaultValues?.name}
              onChange={handleNameChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="slug-input">
              Slug <span className={styles.required}>*</span>
            </label>
            <input
              id="slug-input"
              name="slug"
              className={styles.input}
              placeholder="samsung-galaxy-s25"
              defaultValue={defaultValues?.slug}
              required
            />
            <span className={styles.hint}>Tự động từ tên, có thể chỉnh sửa</span>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="categoryId">
              Danh mục <span className={styles.required}>*</span>
            </label>
            <select
              id="categoryId"
              name="categoryId"
              className={styles.select}
              defaultValue={defaultValues?.categoryId ?? ''}
              required
            >
              <option value="">— Chọn danh mục —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="brandId">Nhãn hàng</label>
            <select
              id="brandId"
              name="brandId"
              className={styles.select}
              defaultValue={defaultValues?.brandId ?? ''}
            >
              <option value="">— Không chọn —</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="basePrice">
              Giá gốc (đ) <span className={styles.required}>*</span>
            </label>
            <input
              id="basePrice"
              name="basePrice"
              type="number"
              min="0"
              step="1000"
              className={styles.input}
              placeholder="15000000"
              defaultValue={defaultValues?.basePrice}
              required
            />
          </div>

          <div className={styles.fieldFull}>
            <label className={styles.label} htmlFor="shortDescription">Mô tả ngắn</label>
            <input
              id="shortDescription"
              name="shortDescription"
              className={styles.input}
              placeholder="Tóm tắt 1 dòng về sản phẩm"
              defaultValue={defaultValues?.shortDescription ?? ''}
            />
          </div>

          <div className={styles.fieldFull}>
            <label className={styles.label} htmlFor="description">Mô tả chi tiết</label>
            <textarea
              id="description"
              name="description"
              className={styles.textarea}
              style={{ minHeight: '140px' }}
              placeholder="Mô tả đầy đủ về sản phẩm..."
              defaultValue={defaultValues?.description ?? ''}
            />
          </div>
        </div>
      </div>

      {/* ── SEO ── */}
      <div className={styles.formCard}>
        <p className={styles.sectionTitle}>SEO (tuỳ chọn)</p>
        <div className={styles.grid2}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="metaTitle">Meta title</label>
            <input
              id="metaTitle"
              name="metaTitle"
              className={styles.input}
              placeholder="Tiêu đề SEO (tối đa 160 ký tự)"
              maxLength={160}
              defaultValue={defaultValues?.metaTitle ?? ''}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="metaDescription">Meta description</label>
            <input
              id="metaDescription"
              name="metaDescription"
              className={styles.input}
              placeholder="Mô tả SEO (tối đa 320 ký tự)"
              maxLength={320}
              defaultValue={defaultValues?.metaDescription ?? ''}
            />
          </div>
        </div>
      </div>

      {/* ── Tùy chọn ── */}
      <div className={styles.formCard}>
        <p className={styles.sectionTitle}>Tùy chọn</p>
        <div className={styles.checksRow}>
          <label className={styles.checkRow}>
            <input type="checkbox" name="isActive" defaultChecked={defaultValues?.isActive ?? true} />
            <span>Đang bán (hiển thị trên cửa hàng)</span>
          </label>
          <label className={styles.checkRow}>
            <input type="checkbox" name="isFeatured" defaultChecked={defaultValues?.isFeatured ?? false} />
            <span>Sản phẩm nổi bật</span>
          </label>
        </div>
      </div>

      <div className={styles.actions}>
        <Link href="/admin/products" className={styles.btnSecondary}>Hủy</Link>
        <button type="submit" className={styles.btnPrimary} disabled={isPending}>
          {isPending ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
        </button>
      </div>
    </form>
  );
}
