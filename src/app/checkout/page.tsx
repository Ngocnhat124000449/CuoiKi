import type { Metadata } from 'next'
import CheckoutForm from './CheckoutForm'

export const metadata: Metadata = {
  title: 'Thanh toán',
  description: 'Nhập thông tin giao hàng và hoàn tất đơn hàng tại PhoneShop.',
}

export default function CheckoutPage() {
  return <CheckoutForm />
}
