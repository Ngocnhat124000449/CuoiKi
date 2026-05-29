import type { Metadata } from 'next'
import InfoPage, { type InfoPageData } from '@/components/info/InfoPage'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Thu cũ đổi mới',
  description: 'Chương trình thu cũ đổi mới tại PhoneShop: định giá máy cũ minh bạch, trợ giá lên đời máy mới nhanh chóng.',
}

const data: InfoPageData = {
  pill: 'Lên đời tiết kiệm',
  title: 'Thu cũ đổi mới',
  desc: 'Mang máy cũ đến, nhận trợ giá hấp dẫn cho máy mới. Định giá minh bạch trong 15 phút, áp dụng cho mọi hãng.',
  blocks: [
    {
      kind: 'cards',
      eyebrow: 'Lợi ích',
      title: 'Vì sao chọn thu cũ đổi mới?',
      cards: [
        { badge: 'Đến 80%', title: 'Định giá cao', desc: 'Thu lại máy cũ với mức giá cạnh tranh, lên đến 80% giá trị tùy tình trạng và đời máy.' },
        { badge: '+ Trợ giá', title: 'Trợ giá lên đời', desc: 'Cộng thêm trợ giá đặc biệt khi đổi sang máy mới trong cùng giao dịch.' },
        { badge: '15 phút', title: 'Nhanh & minh bạch', desc: 'Kỹ thuật viên kiểm tra và báo giá tại chỗ, không ép giá, không phí ẩn.' },
      ],
    },
    {
      kind: 'steps',
      eyebrow: 'Quy trình',
      title: 'Đổi máy chỉ với 4 bước',
      steps: [
        { title: 'Mang máy cũ đến', desc: 'Đến chi nhánh gần nhất kèm máy cũ, sạc và giấy tờ tùy thân.' },
        { title: 'Kiểm tra & định giá', desc: 'Kỹ thuật viên kiểm tra ngoại hình, chức năng và báo giá thu mua ngay.' },
        { title: 'Chọn máy mới', desc: 'Chọn sản phẩm muốn lên đời, áp dụng giá thu cũ + trợ giá vào đơn hàng.' },
        { title: 'Thanh toán phần chênh', desc: 'Chỉ trả phần chênh lệch (có thể trả góp 0%) và nhận máy mới ngay.' },
      ],
    },
    {
      kind: 'checklist',
      eyebrow: 'Điều kiện',
      title: 'Yếu tố ảnh hưởng giá thu',
      items: [
        'Đời máy, dung lượng và phiên bản.',
        'Tình trạng ngoại hình (trầy xước, móp méo).',
        'Dung lượng pin và khả năng hoạt động.',
        'Đầy đủ phụ kiện, hộp gốc (nếu còn).',
        'Máy không dính khóa iCloud/tài khoản, không báo mất.',
      ],
    },
  ],
  cta: {
    title: 'Muốn biết máy của bạn được bao nhiêu?',
    desc: 'Liên hệ để được định giá sơ bộ trước khi ra cửa hàng.',
    href: '/contact',
    label: 'Nhận định giá',
  },
}

export default function TradeInPage() {
  return <InfoPage data={data} />
}
