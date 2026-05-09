'use client';
import { useActionState } from 'react';
import Link from 'next/link';
import styles from '../_form.module.scss';

type ActionFn = (prev: string | null, data: FormData) => Promise<string | null>;
type DefaultValues = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  websiteUrl: string | null;
  countryOfOrigin: string | null;
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

export default function BrandForm({
  action,
  defaultValues,
}: {
  action: ActionFn;
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
      {isEdit && <input type="hidden" name="brandId" value={defaultValues.id} />}
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.formCard}>
        <p className={styles.sectionTitle}>Thông tin nhãn hàng</p>
        <div className={styles.grid2}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">
              Tên nhãn hàng <span className={styles.required}>*</span>
            </label>
            <input
              id="name"
              name="name"
              className={styles.input}
              placeholder="Ví dụ: Samsung"
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
              placeholder="samsung"
              defaultValue={defaultValues?.slug}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="countryOfOrigin">Xuất xứ</label>
            <input
              id="countryOfOrigin"
              name="countryOfOrigin"
              className={styles.input}
              placeholder="Ví dụ: Hàn Quốc"
              defaultValue={defaultValues?.countryOfOrigin ?? ''}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="websiteUrl">Website</label>
            <input
              id="websiteUrl"
              name="websiteUrl"
              type="url"
              className={styles.input}
              placeholder="https://samsung.com"
              defaultValue={defaultValues?.websiteUrl ?? ''}
            />
          </div>

          <div className={styles.fieldFull}>
            <label className={styles.label} htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              name="description"
              className={styles.textarea}
              placeholder="Mô tả về nhãn hàng..."
              defaultValue={defaultValues?.description ?? ''}
            />
          </div>
        </div>
      </div>

      <div className={styles.formCard}>
        <p className={styles.sectionTitle}>Tùy chọn</p>
        <label className={styles.checkRow}>
          <input type="checkbox" name="isActive" defaultChecked={defaultValues?.isActive ?? true} />
          <span>Hiển thị nhãn hàng</span>
        </label>
      </div>

      <div className={styles.actions}>
        <Link href="/admin/brands" className={styles.btnSecondary}>Hủy</Link>
        <button type="submit" className={styles.btnPrimary} disabled={isPending}>
          {isPending ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo nhãn hàng'}
        </button>
      </div>
    </form>
  );
}
