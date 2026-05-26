'use server';
import { signIn, signOut } from '@/lib/auth';
import { AuthError } from 'next-auth';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function loginAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/account',
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return err.type === 'CredentialsSignin'
        ? 'Email hoặc mật khẩu không đúng'
        : 'Có lỗi xảy ra. Vui lòng thử lại';
    }
    throw err;
  }
  return null;
}

export async function registerAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const email = (formData.get('email') as string).trim();
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const fullName = (formData.get('fullName') as string).trim();
  const phone = (formData.get('phone') as string)?.trim() || null;

  if (!email || !password || !fullName) return 'Vui lòng điền đầy đủ thông tin';
  if (password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự';
  if (password !== confirmPassword) return 'Mật khẩu xác nhận không khớp';

  try {
    const exists = await db.user.findUnique({ where: { email } });
    if (exists) return 'Email này đã được sử dụng';

    const passwordHash = await bcrypt.hash(password, 12);
    const userRole = await db.role.findUnique({ where: { roleName: 'USER' } });

    await db.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        phone,
        isActive: true,
        ...(userRole
          ? { userRoles: { create: { roleId: userRole.id } } }
          : {}),
      },
    });
  } catch {
    return 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại';
  }

  try {
    await signIn('credentials', { email, password, redirectTo: '/account' });
  } catch (err) {
    if (err instanceof AuthError)
      return 'Đăng ký thành công! Vui lòng đăng nhập thủ công.';
    throw err;
  }
  return null;
}

export async function logoutAction() {
  await signOut({ redirectTo: '/' });
}
