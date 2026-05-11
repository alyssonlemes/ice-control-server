import prisma from '../../prisma';

export async function listCustomers(tenantId: string, opts: any) {
  const page = parseInt(opts.page) || 1;
  const limit = parseInt(opts.limit) || 20;
  const where: any = { tenantId };
  if (opts.search) where.name = { contains: opts.search, mode: 'insensitive' } as any;
  const [data, total] = await Promise.all([
    prisma.customer.findMany({ where, skip: (page - 1) * limit, take: limit }),
    prisma.customer.count({ where })
  ]);
  return { data, total, page, limit };
}

export async function createCustomer(tenantId: string, data: any) {
  return prisma.customer.create({ data: { tenantId, name: data.name, email: data.email, phone: data.phone, address: data.address } });
}

export async function getCustomerOrders(tenantId: string, customerId: string) {
  return prisma.sale.findMany({ where: { tenantId, customerId } });
}

export async function updateCustomer(tenantId: string, customerId: string, patch: any) {
  await prisma.customer.updateMany({ where: { id: customerId, tenantId }, data: patch });
  return prisma.customer.findUnique({ where: { id: customerId } });
}

export async function deleteCustomer(tenantId: string, customerId: string) {
  const deleted = await prisma.customer.deleteMany({ where: { id: customerId, tenantId } });
  if (deleted.count === 0) throw { code: 'NOT_FOUND', message: 'Customer not found' };
}
