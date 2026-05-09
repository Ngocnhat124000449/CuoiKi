'use server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export async function updateProfileAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return 'Chưa đăng nhập';

  const fullName = (formData.get('fullName') as string).trim();
  const phone = (formData.get('phone') as string)?.trim() || null;

  if (!fullName) return 'Vui lòng nhập họ và tên';

  try {
    await db.user.update({
      where: { id: BigInt(session.user.id) },
      data: { fullName, phone },
    });
    revalidatePath('/account');
    return 'success';
  } catch {
    return 'Có lỗi xảy ra. Vui lòng thử lại';
  }
}

export async function changePasswordAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return 'Chưa đăng nhập';

  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!currentPassword || !newPassword) return 'Vui lòng điền đầy đủ thông tin';
  if (newPassword.length < 8) return 'Mật khẩu mới phải có ít nhất 8 ký tự';
  if (newPassword !== confirmPassword) return 'Mật khẩu xác nhận không khớp';

  const user = await db.user.findUnique({
    where: { id: BigInt(session.user.id) },
  });
  if (!user) return 'Người dùng không tồn tại';

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) return 'Mật khẩu hiện tại không đúng';

  try {
    await db.user.update({
      where: { id: BigInt(session.user.id) },
      data: { passwordHash: await bcrypt.hash(newPassword, 12) },
    });
    return 'success';
  } catch {
    return 'Có lỗi xảy ra. Vui lòng thử lại';
  }
}
