import prisma from '../../prisma';
import { hashPassword } from '../../utils/hash';

export async function createTenant(name: string, email: string, adminName: string, adminPassword: string) {
  // create tenant and admin user in a transaction
  const hashed = await hashPassword(adminPassword);
  const created = await prisma.$transaction(async (tx: any) => {
    const tenant = await tx.tenant.create({ data: { name, email } });
    const user = await tx.user.create({
      data: {
        tenantId: tenant.id,
        name: adminName,
        email,
        password: hashed,
        permissions: {
          products: 'admin',
          categories: 'admin',
          suppliers: 'admin',
          customers: 'admin',
          sales: 'admin',
          stock: 'admin',
          financial: 'admin',
          reports: 'admin',
          users: 'admin'
        }
      }
    });
    return { tenant };
  });
  return created.tenant;
}
