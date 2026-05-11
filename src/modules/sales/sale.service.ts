import prisma from '../../prisma';

export async function listSales(tenantId: string, opts: any) {
  const page = parseInt(opts.page) || 1;
  const limit = parseInt(opts.limit) || 20;
  const where: any = { tenantId };
  if (opts.startDate) where.createdAt = { gte: new Date(opts.startDate) };
  if (opts.endDate) where.createdAt = { ...where.createdAt, lte: new Date(opts.endDate) };
  const [data, total] = await Promise.all([
    prisma.sale.findMany({ where, include: { items: true }, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.sale.count({ where })
  ]);
  return { data, total, page, limit };
}

export async function getSale(tenantId: string, saleId: string) {
  return prisma.sale.findFirst({ where: { id: saleId, tenantId }, include: { items: true } });
}

export async function createSale(tenantId: string, payload: any) {
  // payload: customerId, items [{productId, quantity, unitPrice, discount}], discount, couponCode, paymentMethod
  const subtotal = payload.items.reduce((s: number, it: any) => s + it.unitPrice * it.quantity, 0);
  const total = subtotal - (payload.discount || 0);

  const created = await prisma.$transaction(async (tx) => {
    const sale = await tx.sale.create({ data: { tenantId, customerId: payload.customerId, subtotal, discount: payload.discount || 0, total, paymentMethod: payload.paymentMethod || 'cash', status: 'completed' } });
    for (const it of payload.items) {
      const product = await tx.product.findUnique({ where: { id: it.productId } });
      await tx.saleItem.create({ data: { saleId: sale.id, productId: it.productId, productName: product?.name || it.productName || 'Unknown', quantity: it.quantity, unitPrice: it.unitPrice, discount: it.discount || 0, total: (it.unitPrice * it.quantity) - (it.discount || 0) } });
      // create out stock movement (store negative quantity)
      await tx.stockMovement.create({ data: { tenantId, productId: it.productId, type: 'out', quantity: -Math.abs(it.quantity), reason: 'sale', supplierId: null } });
    }
    return sale;
  });
  return getSale(tenantId, created.id);
}

export async function cancelSale(tenantId: string, saleId: string) {
  const sale = await prisma.sale.findFirst({ where: { id: saleId, tenantId }, include: { items: true } });
  if (!sale) throw { code: 'NOT_FOUND', message: 'Sale not found' };
  if (sale.status === 'cancelled') return sale;
  await prisma.$transaction(async (tx) => {
    await tx.sale.update({ where: { id: saleId }, data: { status: 'cancelled' } });
    for (const it of sale.items) {
      await tx.stockMovement.create({ data: { tenantId, productId: it.productId, type: 'in', quantity: Math.abs(it.quantity), reason: 'sale_cancel', supplierId: null } });
    }
  });
  return getSale(tenantId, saleId);
}
