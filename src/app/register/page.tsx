import type { Metadata } from 'next'
import RegisterForm from './RegisterForm'

export const metadata: Metadata = {
  title: 'Đăng ký',
  description: 'Tạo tài khoản PhoneShop để theo dõi đơn hàng, tích điểm và nhận ưu đãi độc quyền.',
}

export default function RegisterPage() {
  return <RegisterForm />
}
