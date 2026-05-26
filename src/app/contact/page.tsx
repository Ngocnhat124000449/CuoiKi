import type { Metadata } from 'next'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Liên hệ',
  description: 'Liên hệ PhoneShop qua hotline 1900 1234, email hoặc form trực tuyến. Hỗ trợ 8h–22h mỗi ngày.',
}

export default function ContactPage() {
  return <ContactForm />
}
