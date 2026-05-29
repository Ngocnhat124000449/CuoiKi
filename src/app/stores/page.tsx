import type { Metadata } from 'next'
import InfoPage, { type InfoPageData } from '@/components/info/InfoPage'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Hệ thống cửa hàng',
  description: 'Hệ thống cửa hàng PhoneShop trên toàn quốc. Tìm chi nhánh gần bạn, địa chỉ, số điện thoại và giờ mở cửa.',
}

const data: InfoPageData = {
  pill: 'Ghé thăm chúng tôi',
  title: 'Hệ thống cửa hàng',
  desc: 'Hệ thống chi nhánh PhoneShop luôn sẵn sàng phục vụ bạn. Mở cửa tất cả các ngày trong tuần, kể cả lễ Tết.',
  blocks: [
    {
      kind: 'stores',
      eyebrow: 'TP. Hồ Chí Minh',
      title: 'Chi nhánh khu vực phía Nam',
      stores: [
        { name: 'PhoneShop Quận 1', address: '123 Lê Lợi, P. Bến Thành, Q.1, TP.HCM', phone: '1900 1234', hours: '8:00 – 22:00 hàng ngày' },
        { name: 'PhoneShop Quận 5', address: '456 Nguyễn Trãi, P.8, Q.5, TP.HCM', phone: '1900 1234', hours: '8:00 – 22:00 hàng ngày' },
        { name: 'PhoneShop Thủ Đức', address: '789 Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức', phone: '1900 1234', hours: '8:00 – 21:30 hàng ngày' },
      ],
    },
    {
      kind: 'stores',
      eyebrow: 'Hà Nội',
      title: 'Chi nhánh khu vực phía Bắc',
      stores: [
        { name: 'PhoneShop Hoàn Kiếm', address: '12 Hàng Bài, P. Hàng Bài, Q. Hoàn Kiếm, Hà Nội', phone: '1900 1234', hours: '8:00 – 22:00 hàng ngày' },
        { name: 'PhoneShop Cầu Giấy', address: '88 Xuân Thủy, P. Dịch Vọng, Q. Cầu Giấy, Hà Nội', phone: '1900 1234', hours: '8:00 – 21:30 hàng ngày' },
      ],
    },
    {
      kind: 'stores',
      eyebrow: 'Đà Nẵng',
      title: 'Chi nhánh khu vực miền Trung',
      stores: [
        { name: 'PhoneShop Hải Châu', address: '234 Hùng Vương, P. Vĩnh Trung, Q. Hải Châu, Đà Nẵng', phone: '1900 1234', hours: '8:00 – 21:30 hàng ngày' },
      ],
    },
  ],
  cta: {
    title: 'Không tiện ghé cửa hàng?',
    desc: 'Đặt hàng online và nhận giao hàng tận nơi trên toàn quốc, nhanh trong 2 giờ tại nội thành.',
    href: '/products',
    label: 'Mua hàng online',
  },
}

export default function StoresPage() {
  return <InfoPage data={data} />
}
