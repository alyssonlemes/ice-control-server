import prisma from '../../prisma';

export async function listStock(tenantId: string, opts: any) {
  const page = parseInt(opts.page) || 1;
  const limit = parseInt(opts.limit) || 20;
  const where: any = { tenantId };
  // optionally filter lowStock
  const allProducts = await prisma.product.findMany({ where: { tenantId }, skip: (page - 1) * limit, take: limit });
  const total = await prisma.product.count({ where: { tenantId } });
  const data = await Promise.all(allProducts.map(async (p: any) => {
    const sum = await prisma.stockMovement.aggregate({ where: { tenantId, productId: p.id }, _sum: { quantity: true } });
    const quantity = (sum._sum.quantity || 0) as number;
    return { productId: p.id, productName: p.name, quantity, minAlert: p.minStockAlert, isLow: quantity <= p.minStockAlert, unit: p.unit };
  }));
  return { data, total, page, limit };
}

export async function createMovement(tenantId: string, payload: any) {
  const qty = payload.type === 'out' ? -Math.abs(payload.quantity) : Math.abs(payload.quantity);
  const mv = await prisma.stockMovement.create({ data: { tenantId, productId: payload.productId, type: payload.type, quantity: qty, reason: payload.reason, supplierId: payload.supplierId ?? null } });
  const sum = await prisma.stockMovement.aggregate({ where: { tenantId, productId: payload.productId }, _sum: { quantity: true } });
  const balanceAfter = (sum._sum.quantity || 0) as number;
  return { ...mv, balanceAfter };
}

export async function listMovements(tenantId: string, opts: any) {
  const page = parseInt(opts.page) || 1;
  const limit = parseInt(opts.limit) || 20;
  const where: any = { tenantId };
  if (opts.productId) where.productId = opts.productId;
  if (opts.startDate) where.createdAt = { gte: new Date(opts.startDate) };
  if (opts.endDate) where.createdAt = { ...where.createdAt, lte: new Date(opts.endDate) };
  const [data, total] = await Promise.all([
    prisma.stockMovement.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.stockMovement.count({ where })
  ]);
  return { data, total, page, limit };
}
