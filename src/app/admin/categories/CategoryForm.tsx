'use client';
import { useActionState } from 'react';
import Link from 'next/link';
import styles from '../_form.module.scss';

type ActionFn = (prev: string | null, data: FormData) => Promise<string | null>;
type Parent = { id: number; name: string };
type DefaultValues = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
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

export default function CategoryForm({
  action,
  parents,
  defaultValues,
}: {
  action: ActionFn;
  parents: Parent[];
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
      {isEdit && <input type="hidden" name="categoryId" value={defaultValues.id} />}
      {error && <div className={styles.error}>{error}</div>}

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
