'use client';
import { useActionState, useState, useMemo } from 'react';
import Link from 'next/link';
import base from '../_form.module.scss';
import styles from './ProductForm.module.scss';

// ── Types ──────────────────────────────────────────────────────────────────────

type AttrValue = { id: string; value: string; displayValue: string; colorHex: string | null };
type Attribute = {
  id: number;
  name: string;
  displayName: string;
  inputType: string;
  unit: string | null;
  isFilterable: boolean;
  values: AttrValue[];
};
type CatAttr = { attributeId: number; groupName: string | null; isRequired: boolean; attribute: Attribute };
export type CategoryWithAttrs = { id: number; name: string; categoryAttributes: CatAttr[] };
export type BrandItem = { id: number; name: string };

export type VariantRow = {
  tempId: string;
  variantId: string;
  sku: string;
  price: string;
  compareAtPrice: string;
  options: Record<number, string>; // attributeId → valueId
};

export type ProductDefaultValues = {
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
  specs: Record<number, string>;
  variants: VariantRow[];
};

type ActionFn = (prev: string | null, data: FormData) => Promise<string | null>;

// ── Helpers ────────────────────────────────────────────────────────────────────

function isVariantAttr(attr: Attribute): boolean {
  return (
    (attr.inputType === 'COLOR' || (attr.inputType === 'SELECT' && attr.isFilterable)) &&
    attr.values.length > 0
  );
}

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

let _tid = 0;
function makeTempId() { return `t${++_tid}_${Math.random().toString(36).slice(2, 6)}`; }

// ── Main Form ──────────────────────────────────────────────────────────────────

export default function ProductForm({
  action,
  categories,
  brands,
  defaultValues,
}: {
  action: ActionFn;
  categories: CategoryWithAttrs[];
  brands: BrandItem[];
  defaultValues?: ProductDefaultValues;
}) {
  const [error, formAction, isPending] = useActionState(action, null);
  const isEdit = !!defaultValues;

  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(defaultValues?.categoryId ?? 0);
  const [variants, setVariants] = useState<VariantRow[]>(defaultValues?.variants ?? []);

  const currentCatAttrs = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId)?.categoryAttributes ?? [],
    [categories, selectedCategoryId]
  );

  const specAttrs = useMemo(
    () => currentCatAttrs.filter((ca) => !isVariantAttr(ca.attribute)),
    [currentCatAttrs]
  );

  const variantAttrs = useMemo(
    () => currentCatAttrs.filter((ca) => isVariantAttr(ca.attribute)),
    [currentCatAttrs]
  );

  // Group spec attributes by groupName
  const specGroups = useMemo(() => {
    const map = new Map<string, CatAttr[]>();
    for (const ca of specAttrs) {
      const key = ca.groupName ?? 'Thông số kỹ thuật';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ca);
    }
    return Array.from(map.entries()).map(([groupName, items]) => ({ groupName, items }));
  }, [specAttrs]);

  // ── Variant handlers ──

  function addVariant() {
    setVariants((prev) => [
      ...prev,
      { tempId: makeTempId(), variantId: '', sku: '', price: '', compareAtPrice: '', options: {} },
    ]);
  }

  function removeVariant(tempId: string) {
    setVariants((prev) => prev.filter((v) => v.tempId !== tempId));
  }

  function updateVariantField(tempId: string, field: 'sku' | 'price' | 'compareAtPrice', value: string) {
    setVariants((prev) => prev.map((v) => (v.tempId === tempId ? { ...v, [field]: value } : v)));
  }

  function updateVariantOption(tempId: string, attributeId: number, valueId: string) {
    setVariants((prev) =>
      prev.map((v) =>
        v.tempId === tempId ? { ...v, options: { ...v.options, [attributeId]: valueId } } : v
      )
    );
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (isEdit) return;
    const slugInput = document.getElementById('slug-input') as HTMLInputElement | null;
    if (slugInput) slugInput.value = toSlug(e.target.value);
  }

  // ── Render ──

  return (
    <form action={formAction}>
      {isEdit && <input type="hidden" name="productId" value={defaultValues.id} />}
      <input type="hidden" name="variants" value={JSON.stringify(variants)} />
      {error && <div className={base.error}>{error}</div>}

      {/* ── Thông tin cơ bản ── */}
      <div className={base.formCard}>
        <p className={base.sectionTitle}>Thông tin cơ bản</p>
        <div className={base.grid2}>
          <div className={base.field}>
            <label className={base.label} htmlFor="name">
              Tên sản phẩm <span className={base.required}>*</span>
            </label>
            <input
              id="name" name="name"
              className={base.input}
              placeholder="VD: iPhone 15 Pro Max 256GB Titan Tự Nhiên"
              defaultValue={defaultValues?.name}
              onChange={handleNameChange}
              required
            />
          </div>

          <div className={base.field}>
            <label className={base.label} htmlFor="slug-input">
              Slug <span className={base.required}>*</span>
            </label>
            <input
              id="slug-input" name="slug"
              className={base.input}
              placeholder="iphone-15-pro-max"
              defaultValue={defaultValues?.slug}
              required
            />
            <span className={base.hint}>Tự động từ tên, có thể chỉnh sửa</span>
          </div>

          <div className={base.field}>
            <label className={base.label} htmlFor="categoryId">
              Danh mục <span className={base.required}>*</span>
            </label>
            <select
              id="categoryId" name="categoryId"
              className={base.select}
              value={selectedCategoryId || ''}
              onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
              required
            >
              <option value="">— Chọn danh mục —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className={base.field}>
            <label className={base.label} htmlFor="brandId">
              Nhà cung cấp <span className={base.required}>*</span>
            </label>
            <select
              id="brandId" name="brandId"
              className={base.select}
              defaultValue={defaultValues?.brandId ?? ''}
              required
            >
              <option value="">— Chọn nhà cung cấp —</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className={base.field}>
            <label className={base.label} htmlFor="basePrice">
              Giá gốc (đ) <span className={base.required}>*</span>
            </label>
            <input
              id="basePrice" name="basePrice"
              type="number" min="0" step="1000"
              className={base.input}
              placeholder="22990000"
              defaultValue={defaultValues?.basePrice}
              required
            />
          </div>

          <div className={base.fieldFull}>
            <label className={base.label} htmlFor="shortDescription">Mô tả ngắn</label>
            <input
              id="shortDescription" name="shortDescription"
              className={base.input}
              placeholder="Tóm tắt 1 dòng về sản phẩm"
              defaultValue={defaultValues?.shortDescription ?? ''}
            />
          </div>

          <div className={base.fieldFull}>
            <label className={base.label} htmlFor="description">Mô tả chi tiết</label>
            <textarea
              id="description" name="description"
              className={`${base.textarea} ${styles.lgTextarea}`}
              placeholder="Mô tả đầy đủ về tính năng, điểm nổi bật..."
              defaultValue={defaultValues?.description ?? ''}
            />
          </div>
        </div>
      </div>

      {/* ── Thông số kỹ thuật (dynamic) ── */}
      {selectedCategoryId === 0 ? (
        <div className={base.formCard}>
          <p className={base.sectionTitle}>Thông số kỹ thuật</p>
          <p className={styles.emptyHint}>Chọn danh mục để hiển thị bộ thông số tương ứng.</p>
        </div>
      ) : specGroups.length === 0 ? (
        <div className={base.formCard}>
          <p className={base.sectionTitle}>Thông số kỹ thuật</p>
          <p className={styles.emptyHint}>Danh mục này chưa có thông số nào được cấu hình.</p>
        </div>
      ) : (
        specGroups.map(({ groupName, items }) => (
          <div key={groupName} className={base.formCard}>
            <p className={base.sectionTitle}>{groupName}</p>
            <div className={base.grid2}>
              {items.map((ca) => (
                <SpecField
                  key={ca.attributeId}
                  ca={ca}
                  defaultValue={defaultValues?.specs[ca.attributeId] ?? ''}
                />
              ))}
            </div>
          </div>
        ))
      )}

      {/* ── Biến thể sản phẩm ── */}
      <div className={base.formCard}>
        <div className={styles.variantHead}>
          <p className={`${base.sectionTitle} ${styles.variantTitle}`}>
            Biến thể sản phẩm
            <span className={styles.variantCount}>{variants.length}</span>
          </p>
          <button type="button" className={styles.addVariantBtn} onClick={addVariant}>
            + Thêm biến thể
          </button>
        </div>

        {variants.length === 0 ? (
          <p className={styles.emptyHint}>
            Nhấn &ldquo;+ Thêm biến thể&rdquo; để tạo biến thể (màu, dung lượng, RAM...).
            {selectedCategoryId === 0 && ' Chọn danh mục trước để hiển thị các tùy chọn.'}
          </p>
        ) : (
          <div className={styles.variantTable}>
            {/* Header */}
            <div className={styles.variantHeader}>
              <span className={styles.colSku}>SKU *</span>
              <span className={styles.colPrice}>Giá bán *</span>
              <span className={styles.colPrice}>Giá gốc</span>
              {variantAttrs.map((va) => (
                <span key={va.attributeId} className={styles.colOpt}>
                  {va.attribute.displayName}
                </span>
              ))}
              <span className={styles.colRemove} />
            </div>

            {/* Rows */}
            {variants.map((v) => (
              <div key={v.tempId} className={styles.variantRow}>
                <input
                  className={`${base.input} ${styles.colSku}`}
                  placeholder="VD: IP15-256-BLK"
                  value={v.sku}
                  onChange={(e) => updateVariantField(v.tempId, 'sku', e.target.value)}
                />
                <input
                  type="number" min="0" step="1000"
                  className={`${base.input} ${styles.colPrice}`}
                  placeholder="22990000"
                  value={v.price}
                  onChange={(e) => updateVariantField(v.tempId, 'price', e.target.value)}
                />
                <input
                  type="number" min="0" step="1000"
                  className={`${base.input} ${styles.colPrice}`}
                  placeholder="Giá gạch ngang"
                  value={v.compareAtPrice}
                  onChange={(e) => updateVariantField(v.tempId, 'compareAtPrice', e.target.value)}
                />
                {variantAttrs.map((va) => (
                  <select
                    key={va.attributeId}
                    aria-label={va.attribute.displayName}
                    className={`${base.select} ${styles.colOpt}`}
                    value={v.options[va.attributeId] ?? ''}
                    onChange={(e) => updateVariantOption(v.tempId, va.attributeId, e.target.value)}
                  >
                    <option value="">— Chọn —</option>
                    {va.attribute.values.map((val) => (
                      <option key={val.id} value={val.id}>
                        {val.displayValue}
                      </option>
                    ))}
                  </select>
                ))}
                <button
                  type="button"
                  className={styles.removeVariantBtn}
                  onClick={() => removeVariant(v.tempId)}
                  title="Xóa biến thể này"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SEO ── */}
      <div className={base.formCard}>
        <p className={base.sectionTitle}>SEO (tuỳ chọn)</p>
        <div className={base.grid2}>
          <div className={base.field}>
            <label className={base.label} htmlFor="metaTitle">Meta title</label>
            <input
              id="metaTitle" name="metaTitle"
              className={base.input}
              placeholder="Tiêu đề SEO (tối đa 160 ký tự)"
              maxLength={160}
              defaultValue={defaultValues?.metaTitle ?? ''}
            />
          </div>
          <div className={base.field}>
            <label className={base.label} htmlFor="metaDescription">Meta description</label>
            <input
              id="metaDescription" name="metaDescription"
              className={base.input}
              placeholder="Mô tả SEO (tối đa 320 ký tự)"
              maxLength={320}
              defaultValue={defaultValues?.metaDescription ?? ''}
            />
          </div>
        </div>
      </div>

      {/* ── Tùy chọn ── */}
      <div className={base.formCard}>
        <p className={base.sectionTitle}>Tùy chọn</p>
        <div className={base.checksRow}>
          <label className={base.checkRow}>
            <input type="checkbox" name="isActive" defaultChecked={defaultValues?.isActive ?? true} />
            <span>Đang bán (hiển thị trên cửa hàng)</span>
          </label>
          <label className={base.checkRow}>
            <input type="checkbox" name="isFeatured" defaultChecked={defaultValues?.isFeatured ?? false} />
            <span>Sản phẩm nổi bật</span>
          </label>
        </div>
      </div>

      <div className={base.actions}>
        <Link href="/admin/products" className={base.btnSecondary}>Hủy</Link>
        <button type="submit" className={base.btnPrimary} disabled={isPending}>
          {isPending ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
        </button>
      </div>
    </form>
  );
}

// ── SpecField sub-component ────────────────────────────────────────────────────

function SpecField({ ca, defaultValue }: { ca: CatAttr; defaultValue: string }) {
  const { attribute, isRequired } = ca;
  const fieldName = `spec_${attribute.id}`;

  if (attribute.inputType === 'BOOLEAN') {
    return (
      <div className={base.field}>
        <label className={base.checkRow}>
          <input
            type="checkbox" name={fieldName} value="true"
            defaultChecked={defaultValue === 'true' || defaultValue === '1'}
          />
          <span className={`${base.label} ${styles.inlineLabel}`}>
            {attribute.displayName}
            {isRequired && <span className={base.required}> *</span>}
          </span>
        </label>
      </div>
    );
  }

  if ((attribute.inputType === 'SELECT' || attribute.inputType === 'MULTI_SELECT') && attribute.values.length > 0) {
    return (
      <div className={base.field}>
        <label className={base.label} htmlFor={`spec-${attribute.id}`}>
          {attribute.displayName}
          {isRequired && <span className={base.required}> *</span>}
        </label>
        <select
          id={`spec-${attribute.id}`} name={fieldName}
          className={base.select}
          defaultValue={defaultValue}
          required={isRequired}
        >
          <option value="">— Chọn —</option>
          {attribute.values.map((v) => (
            <option key={v.id} value={v.displayValue}>{v.displayValue}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={base.field}>
      <label className={base.label} htmlFor={`spec-${attribute.id}`}>
        {attribute.displayName}
        {attribute.unit && <span className={base.hint}> ({attribute.unit})</span>}
        {isRequired && <span className={base.required}> *</span>}
      </label>
      <input
        id={`spec-${attribute.id}`} name={fieldName}
        type={attribute.inputType === 'NUMBER' ? 'number' : 'text'}
        className={base.input}
        placeholder={
          attribute.inputType === 'NUMBER'
            ? `Nhập số${attribute.unit ? ` (${attribute.unit})` : ''}`
            : `VD: giá trị ${attribute.displayName.toLowerCase()}`
        }
        defaultValue={defaultValue}
        required={isRequired}
      />
    </div>
  );
}
