'use server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type SubmitReviewInput = {
  productId: number
  productSlug: string
  rating: number
  title?: string
  content: string
}

export async function submitReviewAction(
  input: SubmitReviewInput,
): Promise<{ success: true } | { error: string }> {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const userId    = BigInt(session.user.id)
  const productId = BigInt(input.productId)

  // Validate
  if (input.rating < 1 || input.rating > 5)
    return { error: 'Điểm đánh giá không hợp lệ' }
  if (!input.content.trim())
    return { error: 'Vui lòng nhập nội dung đánh giá' }

  // Prevent duplicate reviews
  const existing = await db.review.findFirst({ where: { productId, userId } })
  if (existing) return { error: 'Bạn đã gửi đánh giá cho sản phẩm này rồi' }

  // Check if user has a delivered order containing a variant of this product
  const verifiedOrder = await db.orderItem.findFirst({
    where: {
      variant: { productId },
      order: { userId, orderStatus: 'DELIVERED' },
    },
    select: { id: true },
  })

  await db.review.create({
    data: {
      productId,
      userId,
      rating:              input.rating,
      title:               input.title?.trim() || null,
      content:             input.content.trim(),
      isApproved:          true,
      isVerifiedPurchase:  !!verifiedOrder,
    },
  })

  revalidatePath(`/products/${input.productSlug}`)
  return { success: true }
}
