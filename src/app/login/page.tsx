import type { Metadata } from 'next'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: 'Đăng nhập',
  description: 'Đăng nhập vào tài khoản PhoneShop để theo dõi đơn hàng và nhận ưu đãi độc quyền.',
}

export default function LoginPage() {
  return <LoginForm />
}
