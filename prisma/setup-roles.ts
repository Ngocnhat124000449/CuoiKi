/**
 * Script tạo roles + permissions cơ bản trong DB.
 * Chạy: npm run setup-roles
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PERMISSIONS = [
  { module: 'products',   action: 'create',        description: 'Tạo sản phẩm mới' },
  { module: 'products',   action: 'update',        description: 'Chỉnh sửa sản phẩm' },
  { module: 'products',   action: 'delete',        description: 'Xóa sản phẩm' },
  { module: 'products',   action: 'toggle',        description: 'Bật/tắt hiển thị sản phẩm' },
  { module: 'orders',     action: 'view',          description: 'Xem danh sách đơn hàng' },
  { module: 'orders',     action: 'update_status', description: 'Cập nhật trạng thái đơn hàng' },
  { module: 'users',      action: 'view',          description: 'Xem danh sách người dùng' },
  { module: 'users',      action: 'toggle',        description: 'Khóa/mở tài khoản người dùng' },
  { module: 'categories', action: 'view',          description: 'Xem danh mục' },
  { module: 'categories', action: 'create',        description: 'Tạo danh mục mới' },
  { module: 'categories', action: 'update',        description: 'Chỉnh sửa danh mục' },
  { module: 'categories', action: 'delete',        description: 'Xóa danh mục' },
  { module: 'brands',     action: 'create',        description: 'Tạo thương hiệu mới' },
  { module: 'brands',     action: 'update',        description: 'Chỉnh sửa thương hiệu' },
  { module: 'brands',     action: 'delete',        description: 'Xóa thương hiệu' },
  { module: 'reviews',    action: 'approve',       description: 'Duyệt/từ chối đánh giá' },
];

async function main() {
  console.log('🔧 Thiết lập roles & permissions hệ thống...\n');

  const roles = [
    { roleName: 'ADMIN', description: 'Quản trị viên hệ thống' },
    { roleName: 'USER',  description: 'Người dùng thông thường' },
  ];

  const createdRoles: Record<string, number> = {};
  for (const role of roles) {
    const r = await prisma.role.upsert({
      where: { roleName: role.roleName },
      update: {},
      create: role,
    });
    createdRoles[r.roleName] = r.id;
    console.log(`✅ Role "${r.roleName}" (id=${r.id})`);
  }

  console.log('\n📋 Thiết lập permissions...');
  const permIds: number[] = [];
  for (const perm of PERMISSIONS) {
    const p = await prisma.permission.upsert({
      where: { module_action: { module: perm.module, action: perm.action } },
      update: { description: perm.description },
      create: perm,
    });
    permIds.push(p.id);
    console.log(`  ✅ ${p.module}.${p.action} (id=${p.id})`);
  }

  console.log('\n🔗 Gán permissions cho ADMIN...');
  const adminId = createdRoles['ADMIN'];
  for (const permId of permIds) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminId, permissionId: permId } },
      update: {},
      create: { roleId: adminId, permissionId: permId },
    });
  }
  console.log(`  ✅ ${permIds.length} permissions → ADMIN`);

  console.log('\n─────────────────────────────────────────');
  console.log('📌 Hướng dẫn tạo tài khoản Admin:');
  console.log('─────────────────────────────────────────');
  console.log('1. Đăng ký tài khoản tại /register');
  console.log('2. Chạy SQL (thay email):');
  console.log(`   INSERT INTO user_roles ("userId","roleId") SELECT u.id,r.id FROM users u,roles r WHERE u.email='admin@phoneshop.vn' AND r.role_name='ADMIN' ON CONFLICT DO NOTHING;`);
  console.log('3. Đăng nhập lại\n');
}

main()
  .catch((e) => { console.error('❌ Lỗi:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
