import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { toggleProductActiveAction, deleteProductAction } from '@/lib/actions/admin';
import DeleteConfirmBtn from '../_components/DeleteConfirmBtn';
import styles from './page.module.scss';

export const metadata: Metadata = { title: 'Admin — Quản lý sản phẩm' };

function fmt(val: unknown) {
  return new Intl.NumberFormat('vi-VN').format(Number(val)) + 'đ';
}

export default async function AdminProductsPage() {
  const session = await auth();
  if (!(session?.user as { isAdmin?: boolean })?.isAdmin) redirect('/');

  const products = await db.product.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      basePrice: true,
      isActive: true,
      isFeatured: true,
      createdAt: true,
      category: { select: { name: true } },
      brand: { select: { name: true } },
      _count: { select: { variants: true } },
    },
  });

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.title}>Quản lý sản phẩm</h1>
          <p className={styles.desc}>{products.length} sản phẩm</p>
        </div>
        <Link href="/admin/products/new" className={styles.addBtn}>+ Thêm sản phẩm</Link>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Thương hiệu</th>
                <th>Giá gốc</th>
                <th>Biến thể</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id.toString()}>
                  <td>
                    <div className={styles.productName}>
                      <a href={`/products/${p.slug}`} target="_blank" rel="noreferrer" className={styles.nameLink}>
                        {p.name}
                      </a>
                      {p.isFeatured && <span className={styles.featuredBadge}>Nổi bật</span>}
                    </div>
                  </td>
                  <td className={styles.tdMuted}>{p.category.name}</td>
                  <td className={styles.tdMuted}>{p.brand?.name ?? '—'}</td>
                  <td className={styles.tdPrice}>{fmt(p.basePrice)}</td>
                  <td className={styles.tdCenter}>{p._count.variants}</td>
                  <td>
                    <span className={`${styles.badge} ${p.isActive ? styles.active : styles.inactive}`}>
                      {p.isActive ? 'Đang bán' : 'Ẩn'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionGroup}>
                      <Link href={`/admin/products/${p.id.toString()}/edit`} className={styles.editBtn}>Sửa</Link>
                      <form action={toggleProductActiveAction} className={styles.inlineForm}>
                        <input type="hidden" name="productId" value={p.id.toString()} />
                        <input type="hidden" name="isActive" value={p.isActive.toString()} />
                        <button type="submit" className={styles.toggleBtn}>
                          {p.isActive ? 'Ẩn' : 'Hiện'}
                        </button>
                      </form>
                      <DeleteConfirmBtn
                        action={deleteProductAction}
                        confirmMessage={`Xóa "${p.name}"?`}
                        hiddenFields={{ productId: p.id.toString() }}
                        className={styles.deleteBtn}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
