import type { Metadata } from 'next'
import InfoPage, { type InfoPageData } from '@/components/info/InfoPage'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Chính sách bảo mật',
  description: 'Chính sách bảo mật của PhoneShop: cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ thông tin cá nhân của bạn.',
}

const data: InfoPageData = {
  pill: 'Quyền riêng tư',
  title: 'Chính sách bảo mật',
  desc: 'PhoneShop tôn trọng và cam kết bảo vệ thông tin cá nhân của bạn. Chính sách này giải thích cách chúng tôi xử lý dữ liệu của bạn.',
  blocks: [
    {
      kind: 'cards',
      eyebrow: 'Thông tin',
      title: 'Chúng tôi thu thập gì?',
      cards: [
        { badge: 'Định danh', title: 'Thông tin cá nhân', desc: 'Họ tên, số điện thoại, email, địa chỉ giao hàng bạn cung cấp khi đăng ký hoặc đặt hàng.' },
        { badge: 'Giao dịch', title: 'Lịch sử mua sắm', desc: 'Đơn hàng, sản phẩm đã xem, phương thức thanh toán (không bao gồm số thẻ đầy đủ).' },
        { badge: 'Kỹ thuật', title: 'Dữ liệu thiết bị', desc: 'Loại trình duyệt, thiết bị và cookie nhằm tối ưu trải nghiệm và phân tích lưu lượng.' },
      ],
    },
    {
      kind: 'checklist',
      eyebrow: 'Mục đích',
      title: 'Chúng tôi dùng dữ liệu để làm gì?',
      items: [
        'Xử lý đơn hàng, giao hàng và hỗ trợ sau bán.',
        'Liên hệ xác nhận đơn, thông báo khuyến mãi (khi bạn đồng ý).',
        'Cải thiện sản phẩm, dịch vụ và trải nghiệm website.',
        'Phòng chống gian lận và bảo đảm an toàn giao dịch.',
      ],
    },
    {
      kind: 'prose',
      eyebrow: 'Cam kết',
      title: 'Bảo mật & chia sẻ thông tin',
      paragraphs: [
        'Thông tin của bạn được lưu trữ trên hệ thống bảo mật, mã hóa khi truyền tải và chỉ những nhân sự được ủy quyền mới có quyền truy cập.',
        'Chúng tôi KHÔNG bán hay cho thuê dữ liệu cá nhân của bạn. Thông tin chỉ được chia sẻ với đối tác vận chuyển, thanh toán ở mức cần thiết để hoàn tất đơn hàng, hoặc khi có yêu cầu hợp pháp từ cơ quan chức năng.',
      ],
    },
    {
      kind: 'faq',
      eyebrow: 'Quyền của bạn',
      title: 'Bạn có thể làm gì với dữ liệu của mình?',
      items: [
        { q: 'Làm sao để xem hoặc sửa thông tin của tôi?', a: 'Bạn có thể đăng nhập và chỉnh sửa thông tin bất cứ lúc nào trong mục "Tài khoản → Cài đặt".' },
        { q: 'Tôi muốn xóa tài khoản và dữ liệu thì sao?', a: 'Vui lòng liên hệ hotline hoặc email hỗ trợ. Chúng tôi sẽ xử lý yêu cầu xóa dữ liệu theo quy định pháp luật.' },
        { q: 'Tôi có thể từ chối nhận email quảng cáo không?', a: 'Có. Bạn có thể hủy đăng ký bất cứ lúc nào qua liên kết ở cuối email hoặc trong phần cài đặt tài khoản.' },
      ],
    },
  ],
  cta: {
    title: 'Có câu hỏi về quyền riêng tư?',
    desc: 'Liên hệ với chúng tôi để được hỗ trợ về dữ liệu cá nhân của bạn.',
    href: '/contact',
    label: 'Liên hệ chúng tôi',
  },
}

export default function PrivacyPage() {
  return <InfoPage data={data} />
}
