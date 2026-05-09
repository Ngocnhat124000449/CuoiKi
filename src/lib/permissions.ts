import { db } from './db';

export const PERMISSIONS = {
  products: {
    create:  { module: 'products', action: 'create'  },
    update:  { module: 'products', action: 'update'  },
    delete:  { module: 'products', action: 'delete'  },
    toggle:  { module: 'products', action: 'toggle'  },
  },
  orders: {
    view:          { module: 'orders', action: 'view'          },
    update_status: { module: 'orders', action: 'update_status' },
  },
  users: {
    view:   { module: 'users', action: 'view'   },
    toggle: { module: 'users', action: 'toggle' },
  },
  categories: {
    view:   { module: 'categories', action: 'view'   },
    create: { module: 'categories', action: 'create' },
    update: { module: 'categories', action: 'update' },
    delete: { module: 'categories', action: 'delete' },
  },
  brands: {
    create: { module: 'brands', action: 'create' },
    update: { module: 'brands', action: 'update' },
    delete: { module: 'brands', action: 'delete' },
  },
  reviews: {
    approve: { module: 'reviews', action: 'approve' },
  },
} as const;

export async function hasPermission(
  userId: bigint,
  module: string,
  action: string
): Promise<boolean> {
  const count = await db.rolePermission.count({
    where: {
      role:       { userRoles: { some: { userId } } },
      permission: { module, action },
    },
  });
  return count > 0;
}
