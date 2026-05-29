'use client';
import { useActionState, useState } from 'react';
import Link from 'next/link';
import styles from '../_form.module.scss';

type ActionFn = (prev: string | null, data: FormData) => Promise<string | null>;

export type CouponDefaultValues = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  discountType: 'PERCENT' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  discountValue: string;
  minOrderAmount: string;
  maxDiscountAmount: string | null;
  usageLimit: number | null;
  perUserLimit: number;
  applicableTo: 'ALL' | 'CATEGORY' | 'PRODUCT';
  startDate: string;
  endDate: string;
  isActive: boolean;
};

export default function CouponForm({
  action,
  defaultValues,
}: {
  action: ActionFn;
  defaultValues?: CouponDefaultValues;
}) {
  const [error, formAction, isPending] = useActionState(action, null);
  const isEdit = !!defaultValues;
  const [discountType, setDiscountType] = useState<'PERCENT' | 'FIXED_AMOUNT' | 'FREE_SHIPPING'>(
    defaultValues?.discountType ?? 'PERCENT'
  );

  return (
    <form action={formAction}>
      {isEdit && <input type="hidden" name="couponId" value={defaultValues.id} />}
      {error && <div className={styles.error}>{error}</div>}

      {/* ── Thông tin cơ bản ── */}
      <div className={styles.formCard}>
        <p className={styles.sectionTitle}>Thông tin mã giảm giá</p>
        <div className={styles.grid2}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="code">
              Mã coupon <span className={styles.required}>*</span>
            </label>
            <input
              id="code"
              name="code"
              className={styles.input}
              placeholder="VD: SALE10, SUMMER20"
              defaultValue={defaultValues?.code}
              style={{ textTransform: 'uppercase' }}
              maxLength={50}
              required
            />
            <span className={styles.hint}>Tự động chuyển thành chữ hoa khi lưu</span>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">
              Tên chương trình <span className={styles.required}>*</span>
            </label>
            <input
              id="name"
              name="name"
              className={styles.input}
              placeholder="VD: Giảm 10% cho đơn đầu tiên"
              defaultValue={defaultValues?.name}
              maxLength={100}
              required
            />
          </div>

          <div className={styles.fieldFull}>
            <label className={styles.label} htmlFor="description">Mô tả / Điều kiện</label>
            <textarea
              id="description"
              name="description"
              className={styles.textarea}
              placeholder="Mô tả điều kiện áp dụng, ghi chú..."
              defaultValue={defaultValues?.description ?? ''}
              maxLength={500}
            />
          </div>
        </div>
      </div>

      {/* ── Loại & Giá trị giảm ── */}
      <div className={styles.formCard}>
        <p className={styles.sectionTitle}>Loại & Giá trị giảm</p>
        <div className={styles.grid3}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="discountType">
              Loại giảm giá <span className={styles.required}>*</span>
            </label>
            <select
              id="discountType"
              name="discountType"
              className={styles.select}
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as typeof discountType)}
              required
            >
              <option value="PERCENT">Phần trăm (%)</option>
              <option value="FIXED_AMOUNT">Số tiền cố định (đ)</option>
              <option value="FREE_SHIPPING">Miễn phí vận chuyển</option>
            </select>
          </div>

          {discountType !== 'FREE_SHIPPING' ? (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="discountValue">
                Giá trị giảm <span className={styles.required}>*</span>
              </label>
              <input
                id="discountValue"
                name="discountValue"
                type="number"
                min="0.01"
                max={discountType === 'PERCENT' ? 100 : undefined}
                step={discountType === 'PERCENT' ? '0.01' : '1000'}
                className={styles.input}
                placeholder={discountType === 'PERCENT' ? 'VD: 10' : 'VD: 50000'}
                defaultValue={defaultValues?.discountValue ?? ''}
                required
              />
              <span className={styles.hint}>
                {discountType === 'PERCENT' ? 'Tối đa 100%' : 'Đơn vị VNĐ'}
              </span>
            </div>
          ) : (
            <input type="hidden" name="discountValue" value="0" />
          )}

          {discountType === 'PERCENT' && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="maxDiscountAmount">Giảm tối đa (đ)</label>
              <input
                id="maxDiscountAmount"
                name="maxDiscountAmount"
                type="number"
                min="0"
                step="1000"
                className={styles.input}
                placeholder="Để trống = không giới hạn"
                defaultValue={defaultValues?.maxDiscountAmount ?? ''}
              />
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="minOrderAmount">Đơn hàng tối thiểu (đ)</label>
            <input
              id="minOrderAmount"
              name="minOrderAmount"
              type="number"
              min="0"
              step="1000"
              className={styles.input}
              placeholder="0 = không yêu cầu"
              defaultValue={defaultValues?.minOrderAmount ?? '0'}
            />
          </div>
        </div>
      </div>

      {/* ── Giới hạn sử dụng ── */}
      <div className={styles.formCard}>
        <p className={styles.sectionTitle}>Giới hạn sử dụng</p>
        <div className={styles.grid3}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="usageLimit">Tổng số lần dùng</label>
            <input
              id="usageLimit"
              name="usageLimit"
              type="number"
              min="1"
              step="1"
              className={styles.input}
              placeholder="Để trống = không giới hạn"
              defaultValue={defaultValues?.usageLimit ?? ''}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="perUserLimit">
              Mỗi người dùng <span className={styles.required}>*</span>
            </label>
            <input
              id="perUserLimit"
              name="perUserLimit"
              type="number"
              min="1"
              step="1"
              className={styles.input}
              placeholder="1"
              defaultValue={defaultValues?.perUserLimit ?? 1}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="applicableTo">Áp dụng cho</label>
            <select
              id="applicableTo"
              name="applicableTo"
              className={styles.select}
              defaultValue={defaultValues?.applicableTo ?? 'ALL'}
            >
              <option value="ALL">Tất cả sản phẩm</option>
              <option value="CATEGORY">Danh mục cụ thể</option>
              <option value="PRODUCT">Sản phẩm cụ thể</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Thời hạn ── */}
      <div className={styles.formCard}>
        <p className={styles.sectionTitle}>Thời hạn hiệu lực</p>
        <div className={styles.grid2}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="startDate">
              Ngày bắt đầu <span className={styles.required}>*</span>
            </label>
            <input
              id="startDate"
              name="startDate"
              type="datetime-local"
              className={styles.input}
              defaultValue={defaultValues?.startDate}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="endDate">
              Ngày kết thúc <span className={styles.required}>*</span>
            </label>
            <input
              id="endDate"
              name="endDate"
              type="datetime-local"
              className={styles.input}
              defaultValue={defaultValues?.endDate}
              required
            />
          </div>
        </div>
      </div>

      {/* ── Tùy chọn ── */}
      <div className={styles.formCard}>
        <p className={styles.sectionTitle}>Tùy chọn</p>
        <label className={styles.checkRow}>
          <input type="checkbox" name="isActive" defaultChecked={defaultValues?.isActive ?? true} />
          <span>Kích hoạt mã giảm giá</span>
        </label>
      </div>

      <div className={styles.actions}>
        <Link href="/admin/coupons" className={styles.btnSecondary}>Hủy</Link>
        <button type="submit" className={styles.btnPrimary} disabled={isPending}>
          {isPending ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo mã giảm giá'}
        </button>
      </div>
    </form>
  );
}
