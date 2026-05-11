import prisma from '../../prisma';

export async function bestSellers(tenantId: string, opts: any) {
  const start = opts.startDate ? new Date(opts.startDate) : undefined;
  const end = opts.endDate ? new Date(opts.endDate) : undefined;
  const take = parseInt(opts.limit) || 10;
  const where: any = { tenantId };
  if (start) where.sale = { createdAt: { gte: start } };
  if (end) where.sale = { createdAt: { lte: end } };
  const groups = await prisma.saleItem.groupBy({ by: ['productId', 'productName'], where: { tenantId }, _sum: { quantity: true, total: true }, orderBy: { _sum: { quantity: 'desc' } }, take });
  return groups.map((g: any) => ({ productId: g.productId, productName: g.productName, quantitySold: g._sum.quantity || 0, totalRevenue: g._sum.total || 0 }));
}

export async function salesByPeriod(tenantId: string, opts: any) {
  const start = opts.startDate ? new Date(opts.startDate) : undefined;
  const end = opts.endDate ? new Date(opts.endDate) : undefined;
  const groupBy = opts.groupBy || 'day';
  const where: any = { tenantId };
  if (start) where.createdAt = { gte: start };
  if (end) where.createdAt = { ...where.createdAt, lte: end };
  const sales = await prisma.sale.findMany({ where });
  const map = new Map<string, { totalSales: number; totalRevenue: number }>();
  for (const s of sales) {
    const d = new Date(s.createdAt as any);
    let key = d.toISOString().slice(0,10);
    if (groupBy === 'week') {
      const year = d.getUTCFullYear();
      const week = Math.ceil((((d.getTime() - Date.UTC(year,0,1))/86400000)+1)/7);
      key = `${year}-W${week}`;
    } else if (groupBy === 'month') {
      key = `${d.getUTCFullYear()}-${(d.getUTCMonth()+1).toString().padStart(2,'0')}`;
    }
    const cur = map.get(key) || { totalSales: 0, totalRevenue: 0 };
    cur.totalSales += 1;
    cur.totalRevenue += s.total as any || 0;
    map.set(key, cur);
  }
  const out: any[] = [];
  for (const [period, v] of map) out.push({ period, totalSales: v.totalSales, totalRevenue: v.totalRevenue });
  return out.sort((a,b) => a.period < b.period ? -1 : 1);
}

export async function profitMargin(tenantId: string, opts: any) {
  const start = opts.startDate ? new Date(opts.startDate) : undefined;
  const end = opts.endDate ? new Date(opts.endDate) : undefined;
  const where: any = { tenantId };
  if (start) where.createdAt = { gte: start };
  if (end) where.createdAt = { ...where.createdAt, lte: end };
  const groups = await prisma.saleItem.groupBy({ by: ['productId', 'productName'], where: { tenantId }, _sum: { quantity: true, total: true } });
  const results = [];
  for (const g of groups) {
    const product = await prisma.product.findUnique({ where: { id: g.productId } });
    const quantitySold = g._sum.quantity || 0;
    const totalRevenue = g._sum.total || 0;
    const costPrice = product?.costPrice || 0;
    const salePrice = product?.salePrice || 0;
    const marginPercent = salePrice === 0 ? 0 : ((salePrice - costPrice) / salePrice) * 100;
    const totalProfit = (salePrice - costPrice) * quantitySold;
    results.push({ productId: g.productId, productName: g.productName, costPrice, salePrice, marginPercent: Number(marginPercent.toFixed(2)), quantitySold, totalProfit });
  }
  return results;
}

export async function cashFlow(tenantId: string, opts: any) {
  const start = opts.startDate ? new Date(opts.startDate) : undefined;
  const end = opts.endDate ? new Date(opts.endDate) : undefined;
  const salesWhere: any = { tenantId };
  const expensesWhere: any = { tenantId };
  if (start) { salesWhere.createdAt = { gte: start }; expensesWhere.createdAt = { gte: start }; }
  if (end) { salesWhere.createdAt = { ...salesWhere.createdAt, lte: end }; expensesWhere.createdAt = { ...expensesWhere.createdAt, lte: end }; }
  const sales = await prisma.sale.findMany({ where: salesWhere });
  const expenses = await prisma.expense.findMany({ where: expensesWhere });
  const map = new Map<string, { revenues: number, expenses: number }>();
  for (const s of sales) {
    const key = (new Date(s.createdAt as any)).toISOString().slice(0,10);
    const cur = map.get(key) || { revenues: 0, expenses: 0 };
    cur.revenues += s.total as any || 0;
    map.set(key, cur);
  }
  for (const e of expenses) {
    const key = (new Date(e.createdAt as any)).toISOString().slice(0,10);
    const cur = map.get(key) || { revenues: 0, expenses: 0 };
    cur.expenses += e.amount;
    map.set(key, cur);
  }
  const out: any[] = [];
  let acc = 0;
  for (const [date, v] of Array.from(map).sort((a,b)=>a[0]<b[0]? -1:1)) {
    acc += v.revenues - v.expenses;
    out.push({ date, revenues: v.revenues, expenses: v.expenses, balance: v.revenues - v.expenses, accumulatedBalance: acc });
  }
  return out;
}
