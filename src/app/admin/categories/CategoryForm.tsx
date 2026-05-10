'use client';
import { useActionState, useState, useRef } from 'react';
import Link from 'next/link';
import styles from '../_form.module.scss';
import attrStyles from './CategoryForm.module.scss';
import { createAttributeQuickAction } from '@/lib/actions/admin';

type ActionFn = (prev: string | null, data: FormData) => Promise<string | null>;
type Parent = { id: number; name: string };

export type AttrItem = {
  id: number;
  name: string;
  displayName: string;
  inputType: string;
};

type AttrConfig = {
  groupName: string;
  displayOrder: string;
  isRequired: boolean;
};

export type ExistingCatAttr = {
  attributeId: number;
  groupName: string | null;
  displayOrder: number;
  isRequired: boolean;
};

type DefaultValues = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  categoryAttributes?: ExistingCatAttr[];
};

const TYPE_LABELS: Record<string, string> = {
  TEXT: 'Văn bản',
  NUMBER: 'Số',
  BOOLEAN: 'Có/Không',
  SELECT: 'Chọn',
  MULTI_SELECT: 'Chọn nhiều',
  COLOR: 'Màu sắc',
};

const TYPE_BADGE_CLASS: Record<string, string> = {
  COLOR: attrStyles.typeBadge_COLOR,
  SELECT: attrStyles.typeBadge_SELECT,
  MULTI_SELECT: attrStyles.typeBadge_SELECT,
  BOOLEAN: attrStyles.typeBadge_BOOLEAN,
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

function toKey(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .replace(/[^a-z0-9\s_]/g, '')
    .trim()
    .replace(/\s+/g, '_');
}

export default function CategoryForm({
  action,
  parents,
  allAttributes = [],
  defaultValues,
}: {
  action: ActionFn;
  parents: Parent[];
  allAttributes?: AttrItem[];
  defaultValues?: DefaultValues;
}) {
  const [error, formAction, isPending] = useActionState(action, null);
  const isEdit = !!defaultValues;

  // ── Main attribute list state ────────────────────────────────────────────────
  const [attrs, setAttrs] = useState<AttrItem[]>(allAttributes);

  const initRows = (): Record<number, AttrConfig | null> => {
    const map: Record<number, AttrConfig | null> = {};
    for (const attr of allAttributes) map[attr.id] = null;
    if (defaultValues?.categoryAttributes) {
      for (const ca of defaultValues.categoryAttributes) {
        map[ca.attributeId] = {
          groupName: ca.groupName ?? '',
          displayOrder: ca.displayOrder.toString(),
          isRequired: ca.isRequired,
        };
      }
    }
    return map;
  };

  const [rows, setRows] = useState<Record<number, AttrConfig | null>>(initRows);
  const selectedCount = Object.values(rows).filter(Boolean).length;

  function handleToggle(attrId: number, checked: boolean) {
    setRows((prev) => ({
      ...prev,
      [attrId]: checked ? { groupName: '', displayOrder: '0', isRequired: false } : null,
    }));
  }

  function handleField(attrId: number, field: keyof AttrConfig, value: string | boolean) {
    setRows((prev) => {
      const cur = prev[attrId];
      if (!cur) return prev;
      return { ...prev, [attrId]: { ...cur, [field]: value } };
    });
  }

  // ── Quick-add new attribute ──────────────────────────────────────────────────
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [isAddPending, setIsAddPending] = useState(false);
  const addFormRef = useRef<HTMLFormElement>(null);
  const keyInputRef = useRef<HTMLInputElement>(null);

  async function handleAddAttr(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAddError(null);
    setIsAddPending(true);
    const fd = new FormData(e.currentTarget);
    const result = await createAttributeQuickAction(fd);
    setIsAddPending(false);
    if (!result.ok) {
      setAddError(result.error);
      return;
    }
    const newAttr = result.attr;
    setAttrs((prev) => [...prev, newAttr]);
    setRows((prev) => ({
      ...prev,
      [newAttr.id]: { groupName: '', displayOrder: '0', isRequired: false },
    }));
    addFormRef.current?.reset();
    setShowAddPanel(false);
  }

  function handleDisplayNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (keyInputRef.current && !keyInputRef.current.dataset.edited) {
      keyInputRef.current.value = toKey(e.target.value);
    }
  }

  // ── Category slug auto-fill ──────────────────────────────────────────────────
  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (isEdit) return;
    const slugInput = document.getElementById('slug-input') as HTMLInputElement;
    if (slugInput) slugInput.value = toSlug(e.target.value);
  }

  return (
    <form action={formAction}>
      {isEdit && <input type="hidden" name="categoryId" value={defaultValues.id} />}
      {error && <div className={styles.error}>{error}</div>}

      {/* ── Category info ──────────────────────────────────────────────────── */}
      <div className={styles.formCard}>
        <p className={styles.sectionTitle}>Thông tin danh mục</p>
        <div className={styles.grid2}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">
              Tên danh mục <span className={styles.required}>*</span>
            </label>
            <input
              id="name"
              name="name"
              className={styles.input}
              placeholder="Ví dụ: Điện thoại Android"
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
              placeholder="dien-thoai-android"
              defaultValue={defaultValues?.slug}
              required
            />
            <span className={styles.hint}>Tự động tạo từ tên, có thể chỉnh sửa</span>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="parentId">Danh mục cha</label>
            <select
              id="parentId"
              name="parentId"
              className={styles.select}
              defaultValue={defaultValues?.parentId ?? ''}
            >
              <option value="">— Danh mục gốc —</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="displayOrder">Thứ tự hiển thị</label>
            <input
              id="displayOrder"
              name="displayOrder"
              type="number"
              min="0"
              className={styles.input}
              placeholder="0"
              defaultValue={defaultValues?.displayOrder ?? 0}
            />
          </div>

          <div className={styles.fieldFull}>
            <label className={styles.label} htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              name="description"
              className={styles.textarea}
              placeholder="Mô tả ngắn về danh mục..."
              defaultValue={defaultValues?.description ?? ''}
            />
          </div>
        </div>
      </div>

      {/* ── Attribute selection ────────────────────────────────────────────── */}
      <div className={styles.formCard}>
        <div className={attrStyles.attrSectionHead}>
          <p className={`${styles.sectionTitle} ${attrStyles.attrSectionTitle}`}>
            Thông số kỹ thuật <span className={styles.required}>*</span>
          </p>
          {selectedCount > 0 && (
            <span className={attrStyles.attrCount}>{selectedCount}</span>
          )}
        </div>
        <p className={attrStyles.attrHint}>
          Chọn ít nhất một thông số cho danh mục này. Tích vào ô để thêm và cấu hình nhóm hiển thị.
        </p>

        <div className={attrStyles.attrTable}>
          <div className={attrStyles.attrHeader}>
            <span className={attrStyles.colCheck} />
            <span className={attrStyles.colName}>Thuộc tính</span>
            <span className={attrStyles.colType}>Kiểu</span>
            <span className={attrStyles.colGroup}>Nhóm hiển thị</span>
            <span className={attrStyles.colOrder}>Thứ tự</span>
            <span className={attrStyles.colReq}>Bắt buộc</span>
          </div>

          {attrs.map((attr) => {
            const cfg = rows[attr.id];
            const isSelected = cfg !== null;
            return (
              <div
                key={attr.id}
                className={[
                  attrStyles.attrRow,
                  isSelected ? attrStyles.attrRowActive : attrStyles.attrRowDim,
                ].join(' ')}
              >
                <div className={attrStyles.colCheck}>
                  <input
                    type="checkbox"
                    name={`attr_check_${attr.id}`}
                    value="on"
                    checked={isSelected}
                    aria-label={`Chọn ${attr.displayName}`}
                    onChange={(e) => handleToggle(attr.id, e.target.checked)}
                  />
                </div>

                <div className={attrStyles.colName}>
                  <span className={attrStyles.attrName}>{attr.displayName}</span>
                  <span className={attrStyles.attrKey}>{attr.name}</span>
                </div>

                <div className={attrStyles.colType}>
                  <span className={[attrStyles.typeBadge, TYPE_BADGE_CLASS[attr.inputType] ?? ''].join(' ')}>
                    {TYPE_LABELS[attr.inputType] ?? attr.inputType}
                  </span>
                </div>

                <div className={attrStyles.colGroup}>
                  <input
                    type="text"
                    name={`attr_group_${attr.id}`}
                    className={styles.input}
                    placeholder="VD: Màn hình, Pin..."
                    value={cfg?.groupName ?? ''}
                    onChange={(e) => handleField(attr.id, 'groupName', e.target.value)}
                    disabled={!isSelected}
                  />
                </div>

                <div className={attrStyles.colOrder}>
                  <input
                    type="number"
                    name={`attr_order_${attr.id}`}
                    className={styles.input}
                    min="0"
                    value={cfg?.displayOrder ?? '0'}
                    onChange={(e) => handleField(attr.id, 'displayOrder', e.target.value)}
                    disabled={!isSelected}
                  />
                </div>

                <div className={attrStyles.colReq}>
                  <input
                    type="checkbox"
                    name={`attr_req_${attr.id}`}
                    className={attrStyles.reqCheck}
                    checked={cfg?.isRequired ?? false}
                    aria-label={`${attr.displayName} bắt buộc`}
                    onChange={(e) => handleField(attr.id, 'isRequired', e.target.checked)}
                    disabled={!isSelected}
                  />
                </div>
              </div>
            );
          })}

          {attrs.length === 0 && (
            <div className={attrStyles.attrEmptyRow}>
              Chưa có thuộc tính nào. Dùng nút bên dưới để tạo thuộc tính đầu tiên.
            </div>
          )}
        </div>

        {/* Toggle button */}
        {!showAddPanel && (
          <button
            type="button"
            className={attrStyles.addAttrToggle}
            onClick={() => setShowAddPanel(true)}
          >
            + Thêm thuộc tính mới
          </button>
        )}

        {/* Quick-add panel */}
        {showAddPanel && (
          <div className={attrStyles.addAttrPanel}>
            <p className={attrStyles.addAttrTitle}>Tạo thuộc tính mới</p>
            <form ref={addFormRef} onSubmit={handleAddAttr}>
              <div className={attrStyles.addAttrGrid}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="qa-displayName">
                    Tên hiển thị <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="qa-displayName"
                    name="displayName"
                    className={styles.input}
                    placeholder="VD: Kích thước màn hình"
                    onChange={handleDisplayNameChange}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="qa-name">
                    Khóa (key) <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="qa-name"
                    name="name"
                    ref={keyInputRef}
                    className={styles.input}
                    placeholder="VD: screen_size"
                    onChange={() => {
                      if (keyInputRef.current) keyInputRef.current.dataset.edited = 'true';
                    }}
                    required
                  />
                  <span className={styles.hint}>Tự động tạo từ tên, dùng để lưu DB</span>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="qa-inputType">
                    Kiểu nhập <span className={styles.required}>*</span>
                  </label>
                  <select id="qa-inputType" name="inputType" className={styles.select} required>
                    <option value="TEXT">Văn bản</option>
                    <option value="NUMBER">Số</option>
                    <option value="BOOLEAN">Có / Không</option>
                    <option value="SELECT">Chọn một</option>
                    <option value="MULTI_SELECT">Chọn nhiều</option>
                    <option value="COLOR">Màu sắc</option>
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="qa-unit">Đơn vị</label>
                  <input
                    id="qa-unit"
                    name="unit"
                    className={styles.input}
                    placeholder="VD: inch, GB, mAh..."
                  />
                </div>
              </div>

              {addError && <p className={attrStyles.addAttrError}>{addError}</p>}

              <div className={attrStyles.addAttrActions}>
                <button type="submit" className={attrStyles.addAttrSubmit} disabled={isAddPending}>
                  {isAddPending ? 'Đang tạo...' : 'Tạo & thêm vào danh mục'}
                </button>
                <button
                  type="button"
                  className={attrStyles.addAttrCancel}
                  onClick={() => { setShowAddPanel(false); setAddError(null); }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ── Options ───────────────────────────────────────────────────────────── */}
      <div className={styles.formCard}>
        <p className={styles.sectionTitle}>Tùy chọn</p>
        <div className={styles.checksRow}>
          <label className={styles.checkRow}>
            <input type="checkbox" name="isActive" defaultChecked={defaultValues?.isActive ?? true} />
            <span>Hiển thị danh mục</span>
          </label>
        </div>
      </div>

      <div className={styles.actions}>
        <Link href="/admin/categories" className={styles.btnSecondary}>Hủy</Link>
        <button type="submit" className={styles.btnPrimary} disabled={isPending}>
          {isPending ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo danh mục'}
        </button>
      </div>
    </form>
  );
}
