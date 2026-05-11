import prisma from '../../prisma';
import { comparePassword, hashPassword } from '../../utils/hash';
import { signAccess, signRefresh, verifyRefresh } from '../../utils/jwt';

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw { code: 'NOT_FOUND', message: 'User not found' };
  const ok = await comparePassword(password, user.password);
  if (!ok) throw { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' };
  const accessToken = signAccess({ userId: user.id, tenantId: user.tenantId, permissions: user.permissions });
  const refreshToken = signRefresh({ userId: user.id, tenantId: user.tenantId });
  return { accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email, tenantId: user.tenantId, permissions: user.permissions } };
}

export async function refresh(refreshToken: string) {
  try {
    const payload = verifyRefresh(refreshToken) as any;
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw new Error('User not found');
    const accessToken = signAccess({ userId: user.id, tenantId: user.tenantId, permissions: user.permissions });
    return { accessToken };
  } catch (err) {
    throw { code: 'INVALID_TOKEN', message: 'Invalid refresh token' };
  }
}

export async function logout(_userId: string) {
  // With stateless JWT, logout is a no-op unless refresh tokens are persisted.
  return;
}
