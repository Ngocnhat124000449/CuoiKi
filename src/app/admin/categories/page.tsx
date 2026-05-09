import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { deleteCategoryAction } from '@/lib/actions/admin';
import styles from './page.module.scss';

export const metadata: Metadata = { title: 'Admin — Danh mục' };

export default async function AdminCategoriesPage() {
  const session = await auth();
  if (!(session?.user as { isAdmin?: boolean })?.isAdmin) redirect('/');

  const categories = await db.category.findMany({
    orderBy: [{ parentId: 'asc' }, { displayOrder: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
      displayOrder: true,
      isActive: true,
      parent: { select: { name: true } },
      _count: { select: { products: true } },
    },
  });

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.title}>Danh mục</h1>
          <p className={styles.desc}>{categories.length} danh mục</p>
        </div>
        <Link href="/admin/categories/new" className={styles.addBtn}>+ Thêm danh mục</Link>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tên danh mục</th>
                <th>Slug</th>
                <th>Danh mục cha</th>
                <th className={styles.tdCenter}>Sản phẩm</th>
                <th className={styles.tdCenter}>Thứ tự</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td style={{ paddingLeft: cat.parentId ? '32px' : undefined }}>
                    {cat.parentId ? '↳ ' : ''}{cat.name}
                  </td>
                  <td className={styles.tdMono}>{cat.slug}</td>
                  <td className={styles.tdMuted}>{cat.parent?.name ?? '—'}</td>
                  <td className={styles.tdCenter}>{cat._count.products}</td>
                  <td className={styles.tdCenter}>{cat.displayOrder}</td>
                  <td>
                    <span className={`${styles.badge} ${cat.isActive ? styles.active : styles.inactive}`}>
                      {cat.isActive ? 'Hiện' : 'Ẩn'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link href={`/admin/categories/${cat.id}/edit`} className={styles.editBtn}>Sửa</Link>
                      <form action={deleteCategoryAction}>
                        <input type="hidden" name="categoryId" value={cat.id} />
                        <button
                          type="submit"
                          className={styles.deleteBtn}
                          onClick={(e) => { if (!confirm(`Xóa danh mục "${cat.name}"?`)) e.preventDefault(); }}
                        >
                          Xóa
                        </button>
                      </form>
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
