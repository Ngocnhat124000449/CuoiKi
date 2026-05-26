import type { Metadata } from 'next'
import CartView from './CartView'

export const metadata: Metadata = {
  title: 'Giỏ hàng',
  description: 'Xem lại sản phẩm trong giỏ và tiến hành đặt hàng tại PhoneShop.',
}

export default function CartPage() {
  return <CartView />
}
