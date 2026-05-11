import prisma from '../../prisma';

export async function listCategories(tenantId: string) {
  return prisma.category.findMany({ where: { tenantId } });
}

export async function createCategory(tenantId: string, data: any) {
  return prisma.category.create({ data: { tenantId, name: data.name, parentId: data.parentId ?? null } });
}

export async function updateCategory(tenantId: string, categoryId: string, patch: any) {
  await prisma.category.updateMany({ where: { id: categoryId, tenantId }, data: patch });
  return prisma.category.findUnique({ where: { id: categoryId } });
}

export async function deleteCategory(tenantId: string, categoryId: string) {
  const deleted = await prisma.category.deleteMany({ where: { id: categoryId, tenantId } });
  if (deleted.count === 0) throw { code: 'NOT_FOUND', message: 'Category not found' };
}
