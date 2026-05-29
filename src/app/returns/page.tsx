import type { Metadata } from 'next'
import InfoPage, { type InfoPageData } from '@/components/info/InfoPage'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Đổi trả trong 30 ngày',
  description: 'Chính sách đổi trả & hoàn tiền trong 30 ngày tại PhoneShop: điều kiện, quy trình và thời gian hoàn tiền.',
}

const data: InfoPageData = {
  pill: 'Yên tâm mua sắm',
  title: 'Đổi trả trong 30 ngày',
  desc: 'Không hài lòng với sản phẩm? Đổi hoặc hoàn tiền trong vòng 30 ngày — đơn giản, nhanh gọn và không phí ẩn.',
  blocks: [
    {
      kind: 'cards',
      eyebrow: 'Cam kết',
      title: 'Quyền lợi đổi trả',
      cards: [
        { badge: '30 ngày', title: 'Đổi trả miễn phí', desc: 'Đổi sang sản phẩm khác hoặc trả hàng hoàn tiền trong 30 ngày kể từ ngày nhận hàng.' },
        { badge: '0đ', title: 'Miễn phí vận chuyển', desc: 'PhoneShop chịu toàn bộ phí vận chuyển chiều đổi trả cho sản phẩm lỗi do nhà sản xuất.' },
        { badge: '24–72h', title: 'Hoàn tiền nhanh', desc: 'Hoàn tiền về tài khoản hoặc ví trong 24–72 giờ sau khi nhận lại và kiểm tra sản phẩm.' },
      ],
    },
    {
      kind: 'checklist',
      eyebrow: 'Điều kiện',
      title: 'Sản phẩm đủ điều kiện đổi trả',
      desc: 'Để quá trình đổi trả diễn ra thuận lợi, sản phẩm cần đáp ứng các điều kiện sau.',
      items: [
        'Còn trong thời hạn 30 ngày kể từ ngày nhận hàng.',
        'Còn đầy đủ hộp, phụ kiện, quà tặng kèm (nếu có).',
        'Sản phẩm chưa kích hoạt hoặc lỗi do nhà sản xuất.',
        'Còn hóa đơn mua hàng hoặc mã đơn hàng để đối chiếu.',
        'Không trầy xước, hư hỏng do tác động bên ngoài.',
        'Tem niêm phong, IMEI trùng khớp với lúc xuất hàng.',
      ],
    },
    {
      kind: 'steps',
      eyebrow: 'Quy trình',
      title: 'Cách yêu cầu đổi trả',
      steps: [
        { title: 'Gửi yêu cầu', desc: 'Liên hệ hotline 1900 1234 hoặc vào mục "Đơn hàng của tôi" để gửi yêu cầu đổi/trả.' },
        { title: 'Xác nhận tình trạng', desc: 'Nhân viên xác nhận điều kiện đổi trả và hướng dẫn cách gửi hàng về.' },
        { title: 'Kiểm tra sản phẩm', desc: 'Chúng tôi kiểm tra sản phẩm nhận lại trong vòng 24 giờ.' },
        { title: 'Hoàn tất', desc: 'Giao sản phẩm mới hoặc hoàn tiền theo phương thức bạn đã chọn.' },
      ],
    },
  ],
  cta: {
    title: 'Cần đổi hoặc trả hàng?',
    desc: 'Theo dõi và gửi yêu cầu đổi trả ngay trong trang đơn hàng của bạn.',
    href: '/account/orders',
    label: 'Xem đơn hàng của tôi',
  },
}

export default function ReturnsPage() {
  return <InfoPage data={data} />
}
