'use server'
import { db } from '@/lib/db'

export async function submitContactAction(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  const name    = (formData.get('name')    as string)?.trim()
  const email   = (formData.get('email')   as string)?.trim()
  const phone   = (formData.get('phone')   as string)?.trim() || null
  const message = (formData.get('message') as string)?.trim()

  if (!name || !email || !message) return 'Vui lòng điền đầy đủ các trường bắt buộc'

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRe.test(email)) return 'Email không hợp lệ'

  try {
    await db.contactInquiry.create({ data: { name, email, phone, message } })
    return null
  } catch {
    return 'Có lỗi xảy ra, vui lòng thử lại sau'
  }
}
