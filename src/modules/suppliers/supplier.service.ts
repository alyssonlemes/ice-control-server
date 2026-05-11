import prisma from '../../prisma';

export async function listSuppliers(tenantId: string) {
  return prisma.supplier.findMany({ where: { tenantId } });
}

export async function createSupplier(tenantId: string, data: any) {
  return prisma.supplier.create({ data: { tenantId, name: data.name, contactName: data.contactName, email: data.email, phone: data.phone, paymentTerms: data.paymentTerms, address: data.address } });
}

export async function updateSupplier(tenantId: string, supplierId: string, patch: any) {
  await prisma.supplier.updateMany({ where: { id: supplierId, tenantId }, data: patch });
  return prisma.supplier.findUnique({ where: { id: supplierId } });
}

export async function deleteSupplier(tenantId: string, supplierId: string) {
  const deleted = await prisma.supplier.deleteMany({ where: { id: supplierId, tenantId } });
  if (deleted.count === 0) throw { code: 'NOT_FOUND', message: 'Supplier not found' };
}
