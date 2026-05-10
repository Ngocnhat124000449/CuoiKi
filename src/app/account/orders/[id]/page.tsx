import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import CancelOrderBtn from './CancelOrderBtn'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Chi tiết đơn hàng' }

const PAY_METHOD_MAP: Record<string, string> = {
  COD:     'Thanh toán khi nhận hàng (COD)',
  MOMO:    'Ví MoMo',
  ZALOPAY: 'ZaloPay',
  VNPAY:   'VNPay',
  BANKING: 'Chuyển khoản ngân hàng',
  CARD:    'Thẻ tín dụng / Ghi nợ',
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PENDING:    { label: 'Chờ xác nhận', cls: 'pending'    },
  CONFIRMED:  { label: 'Đã xác nhận',  cls: 'confirmed'  },
  PROCESSING: { label: 'Đang xử lý',   cls: 'processing' },
  SHIPPED:    { label: 'Đang giao',    cls: 'shipped'    },
  DELIVERED:  { label: 'Đã giao',      cls: 'delivered'  },
  CANCELLED:  { label: 'Đã hủy',       cls: 'cancelled'  },
  REFUNDED:   { label: 'Hoàn tiền',    cls: 'refunded'   },
}

function fmt(val: unknown) {
  return new Intl.NumberFormat('vi-VN').format(Number(val)) + 'đ'
}

type Props = { params: Promise<{ id: string }> }

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) redirect('/login')

  const order = await db.order.findFirst({
    where: { id: BigInt(id), userId: BigInt(session.user.id) },
    include: {
      orderItems: {
        select: {
          id: true,
          productNameSnapshot: true,
          variantNameSnapshot: true,
          imageUrlSnapshot: true,
          unitPrice: true,
          quantity: true,
          subtotal: true,
        },
      },
    },
  })

  if (!order) notFound()

  const s = STATUS_MAP[order.orderStatus] ?? { label: order.orderStatus, cls: 'pending' }
  const date = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(order.createdAt)

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <Link href="/account/orders" className={styles.backLink}>← Đơn hàng của tôi</Link>
          <h2 className={styles.title}>Đơn #{order.orderNumber}</h2>
          <p className={styles.date}>{date}</p>
        </div>
        <span className={`${styles.badge} ${styles[s.cls]}`}>{s.label}</span>
      </div>

      {/* Items */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Sản phẩm</h3>
        <div className={styles.itemList}>
          {order.orderItems.map(item => (
            <div key={item.id.toString()} className={styles.item}>
              <div className={styles.imgWrap}>
                {item.imageUrlSnapshot ? (
                  <Image
                    src={item.imageUrlSnapshot}
                    alt={item.productNameSnapshot}
                    fill sizes="64px"
                    className={styles.img}
                  />
                ) : (
                  <span className={styles.imgPlaceholder}>📱</span>
                )}
              </div>
              <div className={styles.itemInfo}>
                <p className={styles.itemName}>{item.productNameSnapshot}</p>
                {item.variantNameSnapshot && (
                  <p className={styles.itemVariant}>{item.variantNameSnapshot}</p>
                )}
                <p className={styles.itemMeta}>{fmt(item.unitPrice)} × {item.quantity}</p>
              </div>
              <p className={styles.itemSubtotal}>{fmt(item.subtotal)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping info */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Thông tin giao hàng</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Người nhận</span>
            <span className={styles.infoVal}>{order.recipientName}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Số điện thoại</span>
            <span className={styles.infoVal}>{order.recipientPhone}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Địa chỉ</span>
            <span className={styles.infoVal}>
              {order.shippingAddress}, {order.shippingDistrict}, {order.shippingProvince}
            </span>
          </div>
          {order.note && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Ghi chú</span>
              <span className={styles.infoVal}>{order.note}</span>
            </div>
          )}
        </div>
      </div>

      {/* Totals */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Thanh toán</h3>
        <div className={styles.totals}>
          <div className={styles.totalRow}>
            <span>Phương thức</span>
            <span>{PAY_METHOD_MAP[order.paymentMethod] ?? order.paymentMethod}</span>
          </div>
          <div className={styles.totalRow}>
            <span>Tạm tính</span>
            <span>{fmt(order.subtotal)}</span>
          </div>
          <div className={styles.totalRow}>
            <span>Vận chuyển</span>
            <span className={styles.free}>Miễn phí</span>
          </div>
          <div className={`${styles.totalRow} ${styles.grandTotal}`}>
            <span>Tổng cộng</span>
            <span>{fmt(order.totalAmount)}</span>
          </div>
          <p className={`${styles.payBadge} ${order.paymentStatus === 'PAID' ? styles.paid : styles.unpaid}`}>
            {order.paymentStatus === 'PAID' ? '✓ Đã thanh toán' : '⏳ Chờ thanh toán'}
          </p>
        </div>
      </div>

      {/* Cancel */}
      {order.orderStatus === 'PENDING' && (
        <div className={styles.cancelWrap}>
          <CancelOrderBtn orderId={Number(order.id)} />
        </div>
      )}
    </div>
  )
}
