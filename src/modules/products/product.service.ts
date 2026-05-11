import prisma from '../../prisma';

export async function listProducts(tenantId: string, opts: any) {
  const where: any = { tenantId };
  if (opts.categoryId) where.categoryId = opts.categoryId;
  if (opts.search) where.name = { contains: opts.search, mode: 'insensitive' } as any;
  const page = parseInt(opts.page as any) || 1;
  const limit = parseInt(opts.limit as any) || 20;
  const [data, total] = await Promise.all([
    prisma.product.findMany({ where, skip: (page - 1) * limit, take: limit }),
    prisma.product.count({ where })
  ]);
  // augment products with stockQuantity computed from stock movements
  const items = await Promise.all(
    data.map(async (p: any) => {
      const sum = await prisma.stockMovement.aggregate({ where: { tenantId, productId: p.id }, _sum: { quantity: true } });
      const stockQuantity = (sum._sum.quantity || 0) as number;
      return { ...p, stockQuantity };
    })
  );
  return { data: items, total, page, limit };
}

export async function getProduct(tenantId: string, productId: string) {
  const product = await prisma.product.findFirst({ where: { id: productId, tenantId } });
  if (!product) return null;
  const sum = await prisma.stockMovement.aggregate({ where: { tenantId, productId: product.id }, _sum: { quantity: true } });
  const stockQuantity = (sum._sum.quantity || 0) as number;
  return { ...product, stockQuantity };
}

export async function createProduct(tenantId: string, data: any) {
  const created = await prisma.product.create({ data: { tenantId, name: data.name, categoryId: data.categoryId, costPrice: data.costPrice ?? 0, salePrice: data.salePrice ?? 0, unit: data.unit ?? 'un', minStockAlert: data.minStockAlert ?? 0, description: data.description ?? null } });
  return getProduct(tenantId, created.id);
}

export async function updateProduct(tenantId: string, productId: string, patch: any) {
  const data: any = { ...patch };
  await prisma.product.updateMany({ where: { id: productId, tenantId }, data });
  return getProduct(tenantId, productId);
}

export async function deleteProduct(tenantId: string, productId: string) {
  const deleted = await prisma.product.deleteMany({ where: { id: productId, tenantId } });
  if (deleted.count === 0) throw { code: 'NOT_FOUND', message: 'Product not found' };
}
