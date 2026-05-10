'use server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

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
  items: OrderCartItem[]
}

export async function createOrderAction(input: CreateOrderInput): Promise<{ orderId: number } | { error: string }> {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const userId = BigInt(session.user.id)

  if (input.items.length === 0) return { error: 'Giỏ hàng trống' }

  const variantIds = input.items.map(i => BigInt(i.variantId))
  const variants = await db.productVariant.findMany({
    where: { id: { in: variantIds } },
    select: { id: true, sku: true },
  })
  const variantMap = new Map(variants.map(v => [Number(v.id), v.sku]))

  const subtotal = input.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const orderNumber = `ORD${Date.now()}`

  const order = await db.order.create({
    data: {
      orderNumber,
      userId,
      recipientName: input.recipientName,
      recipientPhone: input.recipientPhone,
      shippingAddress: input.shippingAddress,
      shippingDistrict: input.shippingDistrict,
      shippingProvince: input.shippingProvince,
      paymentMethod: input.paymentMethod ?? 'COD',
      note: input.note ?? null,
      subtotal,
      totalAmount: subtotal,
      orderItems: {
        create: input.items.map(item => ({
          variantId: BigInt(item.variantId),
          productNameSnapshot: item.name,
          skuSnapshot: variantMap.get(item.variantId) ?? '',
          imageUrlSnapshot: item.image,
          unitPrice: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
          variantNameSnapshot: item.options.length > 0
            ? item.options.map(o => o.displayValue).join(' / ')
            : null,
        })),
      },
    },
    select: { id: true },
  })

  return { orderId: Number(order.id) }
}

export async function cancelOrderAction(orderId: number): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const userId = BigInt(session.user.id)
  const order = await db.order.findFirst({
    where: { id: BigInt(orderId), userId },
    select: { orderStatus: true },
  })

  if (!order) return { error: 'Không tìm thấy đơn hàng' }
  if (order.orderStatus !== 'PENDING') return { error: 'Chỉ có thể hủy đơn hàng đang chờ xác nhận' }

  await db.order.update({
    where: { id: BigInt(orderId) },
    data: { orderStatus: 'CANCELLED' },
  })

  return {}
}
