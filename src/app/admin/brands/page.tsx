import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { deleteBrandAction } from '@/lib/actions/admin';
import styles from './page.module.scss';

export const metadata: Metadata = { title: 'Admin — Nhãn hàng' };

export default async function AdminBrandsPage() {
  const session = await auth();
  if (!(session?.user as { isAdmin?: boolean })?.isAdmin) redirect('/');

  const brands = await db.brand.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      countryOfOrigin: true,
      isActive: true,
      _count: { select: { products: true } },
    },
  });

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.title}>Nhãn hàng</h1>
          <p className={styles.desc}>{brands.length} nhãn hàng</p>
        </div>
        <Link href="/admin/brands/new" className={styles.addBtn}>+ Thêm nhãn hàng</Link>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Logo</th>
                <th>Tên nhãn hàng</th>
                <th>Slug</th>
                <th>Xuất xứ</th>
                <th className={styles.tdCenter}>Sản phẩm</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) => (
                <tr key={brand.id}>
                  <td>
                    {brand.logoUrl ? (
                      <Image src={brand.logoUrl} alt={brand.name} width={36} height={36} className={styles.logo} />
                    ) : (
                      <div className={styles.noLogo}>?</div>
                    )}
                  </td>
                  <td>{brand.name}</td>
                  <td className={styles.tdMono}>{brand.slug}</td>
                  <td className={styles.tdMuted}>{brand.countryOfOrigin ?? '—'}</td>
                  <td className={styles.tdCenter}>{brand._count.products}</td>
                  <td>
                    <span className={`${styles.badge} ${brand.isActive ? styles.active : styles.inactive}`}>
                      {brand.isActive ? 'Hiện' : 'Ẩn'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link href={`/admin/brands/${brand.id}/edit`} className={styles.editBtn}>Sửa</Link>
                      <form action={deleteBrandAction}>
                        <input type="hidden" name="brandId" value={brand.id} />
                        <button
                          type="submit"
                          className={styles.deleteBtn}
                          onClick={(e) => { if (!confirm(`Xóa nhãn hàng "${brand.name}"?`)) e.preventDefault(); }}
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
