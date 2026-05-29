import type { Metadata } from 'next'
import InfoPage, { type InfoPageData } from '@/components/info/InfoPage'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Điều khoản sử dụng',
  description: 'Điều khoản sử dụng website PhoneShop: quyền và nghĩa vụ của người dùng, quy định đặt hàng, thanh toán và giải quyết tranh chấp.',
}

const data: InfoPageData = {
  pill: 'Pháp lý',
  title: 'Điều khoản sử dụng',
  desc: 'Khi truy cập và mua sắm tại PhoneShop, bạn đồng ý với các điều khoản dưới đây. Vui lòng đọc kỹ trước khi sử dụng dịch vụ.',
  blocks: [
    {
      kind: 'prose',
      eyebrow: 'Cập nhật lần cuối: 01/2026',
      title: '1. Chấp nhận điều khoản',
      paragraphs: [
        'Bằng việc truy cập website PhoneShop, bạn xác nhận đã đọc, hiểu và đồng ý tuân thủ các điều khoản này cùng mọi chính sách liên quan được công bố trên website.',
        'PhoneShop có quyền điều chỉnh điều khoản bất cứ lúc nào. Các thay đổi có hiệu lực ngay khi được đăng tải. Việc bạn tiếp tục sử dụng dịch vụ đồng nghĩa với việc chấp nhận các thay đổi đó.',
      ],
    },
    {
      kind: 'prose',
      title: '2. Tài khoản người dùng',
      paragraphs: [
        'Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động phát sinh dưới tài khoản của mình.',
        'Thông tin cung cấp khi đăng ký phải chính xác và được cập nhật. PhoneShop có quyền tạm khóa tài khoản nếu phát hiện gian lận hoặc vi phạm điều khoản.',
      ],
    },
    {
      kind: 'prose',
      title: '3. Đặt hàng & thanh toán',
      paragraphs: [
        'Đơn hàng chỉ được xác nhận sau khi bạn hoàn tất quy trình đặt hàng và nhận được thông báo xác nhận từ PhoneShop.',
        'Giá sản phẩm và khuyến mãi có thể thay đổi mà không cần báo trước. PhoneShop có quyền từ chối hoặc hủy đơn hàng trong trường hợp sai sót về giá, hết hàng hoặc nghi ngờ gian lận.',
        'Mọi giao dịch thanh toán được xử lý qua các cổng thanh toán an toàn. PhoneShop không lưu trữ thông tin thẻ của bạn.',
      ],
    },
    {
      kind: 'prose',
      title: '4. Quyền sở hữu trí tuệ',
      paragraphs: [
        'Toàn bộ nội dung trên website (logo, hình ảnh, văn bản, thiết kế) thuộc quyền sở hữu của PhoneShop hoặc các bên cấp phép. Nghiêm cấm sao chép, phân phối khi chưa có sự đồng ý bằng văn bản.',
      ],
    },
    {
      kind: 'prose',
      title: '5. Giới hạn trách nhiệm & giải quyết tranh chấp',
      paragraphs: [
        'PhoneShop không chịu trách nhiệm với các thiệt hại gián tiếp phát sinh ngoài tầm kiểm soát hợp lý.',
        'Mọi tranh chấp sẽ ưu tiên giải quyết thông qua thương lượng. Nếu không đạt thỏa thuận, vụ việc sẽ được đưa ra cơ quan có thẩm quyền theo pháp luật Việt Nam.',
      ],
    },
  ],
  cta: {
    title: 'Còn thắc mắc về điều khoản?',
    desc: 'Liên hệ đội ngũ hỗ trợ để được giải đáp chi tiết.',
    href: '/contact',
    label: 'Liên hệ chúng tôi',
  },
}

export default function TermsPage() {
  return <InfoPage data={data} />
}
