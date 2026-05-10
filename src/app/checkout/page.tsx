'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { createOrderAction } from '@/lib/actions/order'
import styles from './page.module.scss'

function fmt(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ'
}

type PaymentMethod = {
  id: string
  label: string
  desc: string
  icon: string
  tag?: string
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'COD',
    label: 'Thanh toán khi nhận hàng',
    desc: 'Trả tiền mặt khi nhận được hàng',
    icon: '💵',
  },
  {
    id: 'MOMO',
    label: 'Ví MoMo',
    desc: 'Quét mã QR hoặc chuyển khoản qua MoMo',
    icon: '💜',
    tag: 'Phổ biến',
  },
  {
    id: 'ZALOPAY',
    label: 'ZaloPay',
    desc: 'Thanh toán nhanh qua ứng dụng ZaloPay',
    icon: '🔵',
  },
  {
    id: 'VNPAY',
    label: 'VNPay',
    desc: 'Cổng thanh toán VNPay — hỗ trợ 40+ ngân hàng',
    icon: '🏦',
  },
  {
    id: 'BANKING',
    label: 'Chuyển khoản ngân hàng',
    desc: 'Chuyển khoản trực tiếp qua Internet Banking',
    icon: '🏛️',
  },
  {
    id: 'CARD',
    label: 'Thẻ tín dụng / Ghi nợ',
    desc: 'Visa, Mastercard, JCB, UnionPay',
    icon: '💳',
  },
]

const ONLINE_METHODS = ['MOMO', 'ZALOPAY', 'VNPAY', 'BANKING', 'CARD']

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('COD')

  const [form, setForm] = useState({
    recipientName: '',
    recipientPhone: '',
    shippingAddress: '',
    shippingDistrict: '',
    shippingProvince: '',
    note: '',
  })

  if (items.length === 0) {
    return (
      <div className={styles.emptyWrap}>
        <p>Giỏ hàng trống. <Link href="/products">Mua sắm ngay</Link></p>
      </div>
    )
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const { recipientName, recipientPhone, shippingAddress, shippingDistrict, shippingProvince } = form
    if (!recipientName || !recipientPhone || !shippingAddress || !shippingDistrict || !shippingProvince) {
      setError('Vui lòng điền đầy đủ thông tin giao hàng')
      return
    }

    setLoading(true)
    const result = await createOrderAction({
      ...form,
      paymentMethod,
      items: items.map(i => ({
        variantId: i.variantId,
        name: i.name,
        image: i.image,
        price: i.price,
        quantity: i.quantity,
        options: i.options,
      })),
    })
    setLoading(false)

    if ('error' in result) {
      setError(result.error)
      return
    }

    clearCart()
    router.push(`/account/orders/${result.orderId}`)
  }

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === paymentMethod)!

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Thanh toán</h1>

      <div className={styles.layout}>
        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className={styles.form}>

          {/* Shipping info */}
          <h2 className={styles.sectionTitle}>Thông tin giao hàng</h2>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="recipientName">Họ và tên *</label>
              <input
                id="recipientName" name="recipientName" type="text"
                className={styles.input}
                placeholder="Nguyễn Văn A"
                value={form.recipientName}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="recipientPhone">Số điện thoại *</label>
              <input
                id="recipientPhone" name="recipientPhone" type="tel"
                className={styles.input}
                placeholder="0912 345 678"
                value={form.recipientPhone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="shippingAddress">Địa chỉ (số nhà, tên đường) *</label>
            <input
              id="shippingAddress" name="shippingAddress" type="text"
              className={styles.input}
              placeholder="123 Nguyễn Huệ"
              value={form.shippingAddress}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="shippingDistrict">Quận / Huyện *</label>
              <input
                id="shippingDistrict" name="shippingDistrict" type="text"
                className={styles.input}
                placeholder="Quận 1"
                value={form.shippingDistrict}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="shippingProvince">Tỉnh / Thành phố *</label>
              <input
                id="shippingProvince" name="shippingProvince" type="text"
                className={styles.input}
                placeholder="TP. Hồ Chí Minh"
                value={form.shippingProvince}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="note">Ghi chú (tùy chọn)</label>
            <textarea
              id="note" name="note"
              className={`${styles.input} ${styles.textarea}`}
              placeholder="Giao hàng giờ hành chính..."
              value={form.note}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {/* Payment methods */}
          <div className={styles.paySection}>
            <h2 className={styles.sectionTitle}>Phương thức thanh toán</h2>
            <div className={styles.payGrid}>
              {PAYMENT_METHODS.map(method => (
                <button
                  key={method.id}
                  type="button"
                  className={`${styles.payCard} ${paymentMethod === method.id ? styles.payCardActive : ''}`}
                  data-method={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <span className={styles.payIcon}>{method.icon}</span>
                  <span className={styles.payLabel}>{method.label}</span>
                  {method.tag && <span className={styles.payTag}>{method.tag}</span>}
                  <span className={styles.payRadio}>
                    {paymentMethod === method.id && <span className={styles.payRadioInner} />}
                  </span>
                </button>
              ))}
            </div>

            {/* Info box for selected method */}
            <div className={styles.payInfo}>
              <span className={styles.payInfoIcon}>{selectedMethod.icon}</span>
              <div>
                <p className={styles.payInfoName}>{selectedMethod.label}</p>
                <p className={styles.payInfoDesc}>{selectedMethod.desc}</p>
                {ONLINE_METHODS.includes(paymentMethod) && (
                  <p className={styles.payInfoNote}>
                    Thông tin thanh toán sẽ được hiển thị sau khi đặt hàng thành công.
                  </p>
                )}
              </div>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading
              ? 'Đang xử lý...'
              : ONLINE_METHODS.includes(paymentMethod)
                ? `✓ Đặt hàng & Thanh toán qua ${selectedMethod.label}`
                : '✓ Đặt hàng (COD)'}
          </button>
        </form>

        {/* ── Order summary ── */}
        <div className={styles.summary}>
          <h2 className={styles.sectionTitle}>Đơn hàng ({items.length} sản phẩm)</h2>
          <div className={styles.itemList}>
            {items.map(item => (
              <div key={item.variantId} className={styles.summaryItem}>
                <div className={styles.summaryImgWrap}>
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill sizes="56px" className={styles.summaryImg} />
                  ) : (
                    <span className={styles.summaryImgPlaceholder}>📱</span>
                  )}
                  <span className={styles.qtyBadge}>{item.quantity}</span>
                </div>
                <div className={styles.summaryItemInfo}>
                  <p className={styles.summaryItemName}>{item.name}</p>
                  {item.options.length > 0 && (
                    <p className={styles.summaryItemOpts}>{item.options.map(o => o.displayValue).join(' · ')}</p>
                  )}
                </div>
                <p className={styles.summaryItemPrice}>{fmt(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className={styles.summaryTotals}>
            <div className={styles.summaryRow}>
              <span>Tạm tính</span>
              <span>{fmt(totalPrice)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Vận chuyển</span>
              <span className={styles.free}>Miễn phí</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span>Tổng cộng</span>
              <span>{fmt(totalPrice)}</span>
            </div>
          </div>

          <div className={styles.payMethodSelected}>
            <span>{selectedMethod.icon}</span>
            <span>{selectedMethod.label}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
