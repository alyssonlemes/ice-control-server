import prisma from '../../prisma';
import { hashPassword } from '../../utils/hash';

export async function listUsers(tenantId: string) {
  return prisma.user.findMany({ where: { tenantId }, select: { id: true, name: true, email: true, permissions: true, active: true, createdAt: true } });
}

export async function createUser(tenantId: string, data: any) {
  const hashed = await hashPassword(data.password);
  const user = await prisma.user.create({ data: { tenantId, name: data.name, email: data.email, password: hashed, permissions: data.permissions } });
  return { id: user.id, name: user.name, email: user.email, permissions: user.permissions, createdAt: user.createdAt };
}

export async function updateUser(tenantId: string, userId: string, patch: any) {
  const data: any = { ...patch };
  if (patch.password) data.password = await hashPassword(patch.password);
  const user = await prisma.user.updateMany({ where: { id: userId, tenantId }, data });
  if (user.count === 0) throw { code: 'NOT_FOUND', message: 'User not found' };
  return prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, permissions: true, active: true, createdAt: true } });
}

export async function deleteUser(tenantId: string, userId: string) {
  const deleted = await prisma.user.deleteMany({ where: { id: userId, tenantId } });
  if (deleted.count === 0) throw { code: 'NOT_FOUND', message: 'User not found' };
}
