import prisma from '../../prisma';

export async function getCashier(tenantId: string, dateStr?: string) {
  const date = dateStr ? new Date(dateStr) : new Date();
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const cashier = await prisma.cashier.findFirst({ where: { tenantId, date: start } });
  return cashier;
}

export async function openCashier(tenantId: string, openingBalance: number) {
  const today = new Date();
  const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const created = await prisma.cashier.create({ data: { tenantId, date, status: 'open', openedAt: new Date(), openingBalance } });
  return created;
}

export async function closeCashier(tenantId: string, dateStr?: string) {
  const date = dateStr ? new Date(dateStr) : new Date();
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const totalSales = await prisma.sale.aggregate({ where: { tenantId, createdAt: { gte: start, lt: end }, status: 'completed' }, _sum: { total: true } });
  const totalExpenses = await prisma.expense.aggregate({ where: { tenantId, createdAt: { gte: start, lt: end } }, _sum: { amount: true } });
  const cashier = await prisma.cashier.updateMany({ where: { tenantId, date: start, status: 'open' }, data: { status: 'closed', closedAt: new Date(), closingBalance: (totalSales._sum.total || 0) - (totalExpenses._sum.amount || 0) } });
  return prisma.cashier.findFirst({ where: { tenantId, date: start } });
}

export async function listExpenses(tenantId: string, opts: any) {
  const page = parseInt(opts.page) || 1;
  const limit = parseInt(opts.limit) || 20;
  const where: any = { tenantId };
  if (opts.type) where.type = opts.type;
  if (opts.startDate) where.createdAt = { gte: new Date(opts.startDate) };
  if (opts.endDate) where.createdAt = { ...where.createdAt, lte: new Date(opts.endDate) };
  const [data, total] = await Promise.all([
    prisma.expense.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.expense.count({ where })
  ]);
  return { data, total, page, limit };
}

export async function createExpense(tenantId: string, payload: any) {
  return prisma.expense.create({ data: { tenantId, description: payload.description, amount: payload.amount, type: payload.type, dueDate: payload.dueDate ? new Date(payload.dueDate) : null, paid: payload.paid ?? false, category: payload.category } });
}

export async function accountsReceivable(tenantId: string) {
  // Simplified: return sales with unpaid status
  return prisma.sale.findMany({ where: { tenantId, status: 'completed' } });
}

export async function accountsPayable(tenantId: string) {
  return prisma.expense.findMany({ where: { tenantId, paid: false } });
}
