'use server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderCartItem = {
  variantId: number
  name: string
  image: string | null
  price: number
  quantity: number
  options: { attribute: string; value: string; displayValue: string }[]
}

export type CreateOrderInput = {
  recipientName: string
  recipientPhone: string
  shippingAddress: string
  shippingDistrict: string
  shippingProvince: string
  paymentMethod?: string
  note?: string
  couponId?: number
  discountAmount?: number
  items: OrderCartItem[]
}

// ─── Apply coupon ─────────────────────────────────────────────────────────────

function fmtVND(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ'
}

export type AppliedCoupon = {
  couponId: number
  code: string
  name: string
  discountAmount: number
}

export async function applyCouponAction(
  code: string,
  subtotal: number,
): Promise<AppliedCoupon | { error: string }> {
  const now = new Date()

  const coupon = await db.coupon.findFirst({
    where: {
      code: { equals: code.trim().toUpperCase(), mode: 'insensitive' },
      isActive: true,
      startDate: { lte: now },
      endDate:   { gte: now },
    },
  })

  if (!coupon) return { error: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit)
    return { error: 'Mã giảm giá đã hết lượt sử dụng' }

  const session = await auth()
  if (session?.user) {
    const usageCount = await db.couponUsage.count({
      where: { couponId: coupon.id, userId: BigInt(session.user.id) },
    })
    if (usageCount >= coupon.perUserLimit)
      return { error: 'Bạn đã sử dụng mã giảm giá này rồi' }
  }

  const minOrder = coupon.minOrderAmount.toNumber()
  if (subtotal < minOrder)
    return { error: `Đơn hàng tối thiểu ${fmtVND(minOrder)} để dùng mã này` }

  let discountAmount = 0

  if (coupon.discountType === 'PERCENT') {
    discountAmount = (subtotal * coupon.discountValue.toNumber()) / 100
    if (coupon.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount.toNumber())
    }
  } else if (coupon.discountType === 'FIXED_AMOUNT') {
    discountAmount = Math.min(coupon.discountValue.toNumber(), subtotal)
  }
  // FREE_SHIPPING: giao hàng miễn phí — discountAmount = 0 (already free)

  return {
    couponId: coupon.id,
    code: coupon.code,
    name: coupon.name,
    discountAmount: Math.round(discountAmount),
  }
}

// ─── Create order ─────────────────────────────────────────────────────────────

export async function createOrderAction(
  input: CreateOrderInput,
): Promise<{ orderId: number } | { error: string }> {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const userId = BigInt(session.user.id)

  if (input.items.length === 0) return { error: 'Giỏ hàng trống' }

  const variantIds = input.items.map(i => BigInt(i.variantId))
  const variants = await db.productVariant.findMany({
    where: { id: { in: variantIds } },
    select: { id: true, sku: true, price: true },
  })
  const variantMap = new Map(variants.map(v => [Number(v.id), { sku: v.sku, price: v.price.toNumber() }]))

  const subtotal      = input.items.reduce((sum, i) => sum + (variantMap.get(i.variantId)?.price ?? 0) * i.quantity, 0)
  const discountAmt   = input.discountAmount ?? 0
  const totalAmount   = Math.max(subtotal - discountAmt, 0)
  const orderNumber   = `ORD${Date.now()}`

  const order = await db.order.create({
    data: {
      orderNumber,
      userId,
      couponId:       input.couponId ?? null,
      recipientName:  input.recipientName,
      recipientPhone: input.recipientPhone,
      shippingAddress:  input.shippingAddress,
      shippingDistrict: input.shippingDistrict,
      shippingProvince: input.shippingProvince,
      paymentMethod:  input.paymentMethod ?? 'COD',
      note:           input.note ?? null,
      subtotal,
      discountAmount: discountAmt,
      totalAmount,
      orderItems: {
        create: input.items.map(item => ({
          variantId:           BigInt(item.variantId),
          productNameSnapshot: item.name,
          skuSnapshot:         variantMap.get(item.variantId)?.sku ?? '',
          imageUrlSnapshot:    item.image,
          unitPrice:           variantMap.get(item.variantId)?.price ?? 0,
          quantity:            item.quantity,
          subtotal:            (variantMap.get(item.variantId)?.price ?? 0) * item.quantity,
          variantNameSnapshot: item.options.length > 0
            ? item.options.map(o => o.displayValue).join(' / ')
            : null,
        })),
      },
    },
    select: { id: true },
  })

  // Record coupon usage
  if (input.couponId) {
    await db.$transaction([
      db.couponUsage.create({
        data: {
          couponId:       input.couponId,
          userId,
          orderId:        order.id,
          discountAmount: discountAmt,
        },
      }),
      db.coupon.update({
        where: { id: input.couponId },
        data:  { usedCount: { increment: 1 } },
      }),
    ])
  }

  return { orderId: Number(order.id) }
}

// ─── Cancel order ─────────────────────────────────────────────────────────────

export async function cancelOrderAction(orderId: number): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const userId = BigInt(session.user.id)
  const order  = await db.order.findFirst({
    where: { id: BigInt(orderId), userId },
    select: { orderStatus: true },
  })

  if (!order) return { error: 'Không tìm thấy đơn hàng' }
  if (order.orderStatus !== 'PENDING')
    return { error: 'Chỉ có thể hủy đơn hàng đang chờ xác nhận' }

  await db.order.update({
    where: { id: BigInt(orderId) },
    data:  { orderStatus: 'CANCELLED' },
  })

  return {}
}
