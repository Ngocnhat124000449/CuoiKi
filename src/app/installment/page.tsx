import type { Metadata } from 'next'
import InfoPage, { type InfoPageData } from '@/components/info/InfoPage'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Trả góp 0% lãi suất',
  description: 'Mua điện thoại trả góp 0% lãi suất tại PhoneShop qua thẻ tín dụng và công ty tài chính. Duyệt nhanh trong 5 phút.',
}

const data: InfoPageData = {
  pill: 'Mua trước trả sau',
  title: 'Trả góp 0% lãi suất',
  desc: 'Sở hữu ngay chiếc điện thoại yêu thích mà không cần trả hết một lần. Duyệt hồ sơ trong 5 phút, lãi suất 0% cho đơn hàng từ 3 triệu đồng.',
  blocks: [
    {
      kind: 'cards',
      eyebrow: 'Hình thức',
      title: 'Hai cách trả góp linh hoạt',
      cards: [
        { badge: 'Nhanh nhất', title: 'Qua thẻ tín dụng', desc: 'Chuyển đổi trả góp 0% kỳ hạn 3–12 tháng với thẻ tín dụng của hơn 20 ngân hàng. Duyệt tức thì.' },
        { badge: 'Không cần thẻ', title: 'Qua công ty tài chính', desc: 'Trả góp qua Home Credit, FE Credit, HD Saison… chỉ cần CCCD và bằng lái. Trả trước từ 0%.' },
      ],
    },
    {
      kind: 'checklist',
      eyebrow: 'Hồ sơ',
      title: 'Điều kiện & giấy tờ',
      desc: 'Thủ tục tối giản, không chứng minh thu nhập với phần lớn hồ sơ.',
      items: [
        'Công dân Việt Nam từ 20–60 tuổi.',
        'CCCD/CMND còn hiệu lực.',
        'Trả góp qua thẻ: cần thẻ tín dụng còn hạn mức.',
        'Trả góp tài chính: thêm bằng lái xe hoặc hộ khẩu.',
        'Đơn hàng giá trị từ 3.000.000đ.',
      ],
    },
    {
      kind: 'steps',
      eyebrow: 'Quy trình',
      title: 'Đăng ký trả góp trong 5 phút',
      steps: [
        { title: 'Chọn sản phẩm', desc: 'Thêm sản phẩm vào giỏ và chọn phương thức "Trả góp" khi thanh toán.' },
        { title: 'Chọn kỳ hạn', desc: 'Lựa chọn ngân hàng/công ty tài chính và số tháng trả góp phù hợp.' },
        { title: 'Duyệt hồ sơ', desc: 'Nhân viên hỗ trợ xác nhận hồ sơ và thông báo kết quả trong vài phút.' },
        { title: 'Nhận hàng', desc: 'Ký hợp đồng và nhận sản phẩm tại cửa hàng hoặc giao tận nơi.' },
      ],
    },
    {
      kind: 'faq',
      eyebrow: 'Giải đáp',
      title: 'Câu hỏi thường gặp',
      items: [
        { q: 'Trả góp 0% có phát sinh phí gì không?', a: 'Với hình thức qua thẻ tín dụng, bạn không trả thêm lãi. Một số gói qua công ty tài chính có thể có phí chuyển đổi nhỏ, sẽ được báo rõ trước khi ký.' },
        { q: 'Bao lâu thì biết kết quả duyệt?', a: 'Trả góp qua thẻ duyệt tức thì. Qua công ty tài chính thường từ 5–15 phút trong giờ làm việc.' },
        { q: 'Tôi có thể tất toán sớm không?', a: 'Có. Bạn có thể thanh toán hết khoản còn lại bất cứ lúc nào, vui lòng liên hệ công ty tài chính/ngân hàng để biết điều kiện.' },
      ],
    },
  ],
  cta: {
    title: 'Sẵn sàng sở hữu ngay?',
    desc: 'Chọn sản phẩm yêu thích và đăng ký trả góp 0% chỉ trong vài phút.',
    href: '/products',
    label: 'Xem sản phẩm',
  },
}

export default function InstallmentPage() {
  return <InfoPage data={data} />
}
