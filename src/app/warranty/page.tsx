import type { Metadata } from 'next'
import InfoPage, { type InfoPageData } from '@/components/info/InfoPage'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Chính sách bảo hành',
  description: 'Chính sách bảo hành chính hãng tại PhoneShop: thời gian, điều kiện, quy trình và các trường hợp không được bảo hành.',
}

const data: InfoPageData = {
  pill: 'Hỗ trợ khách hàng',
  title: 'Chính sách bảo hành',
  desc: 'Mọi sản phẩm tại PhoneShop đều được bảo hành chính hãng. Chúng tôi cam kết hỗ trợ nhanh chóng, minh bạch và đúng quyền lợi của bạn.',
  blocks: [
    {
      kind: 'cards',
      eyebrow: 'Quyền lợi',
      title: 'Bạn được bảo hành những gì?',
      cards: [
        { badge: '12–24 tháng', title: 'Bảo hành chính hãng', desc: 'Theo tiêu chuẩn của từng nhà sản xuất tại trung tâm bảo hành ủy quyền trên toàn quốc.' },
        { badge: '1 đổi 1', title: 'Đổi mới trong 30 ngày', desc: 'Lỗi phần cứng do nhà sản xuất trong 30 ngày đầu được đổi sản phẩm mới tương đương.' },
        { badge: 'Miễn phí', title: 'Hỗ trợ phần mềm trọn đời', desc: 'Cập nhật, cài đặt, sao lưu và khắc phục lỗi phần mềm miễn phí tại mọi chi nhánh.' },
      ],
    },
    {
      kind: 'steps',
      eyebrow: 'Quy trình',
      title: 'Các bước bảo hành',
      desc: 'Đơn giản trong 4 bước, trung bình hoàn tất trong 3–7 ngày làm việc.',
      steps: [
        { title: 'Liên hệ hỗ trợ', desc: 'Gọi hotline 1900 1234 hoặc mang sản phẩm đến chi nhánh gần nhất kèm hóa đơn/phiếu bảo hành.' },
        { title: 'Kiểm tra & tiếp nhận', desc: 'Kỹ thuật viên kiểm tra tình trạng máy và xác nhận lỗi có thuộc diện bảo hành hay không.' },
        { title: 'Xử lý bảo hành', desc: 'Sửa chữa hoặc gửi tới trung tâm chính hãng. Bạn được cập nhật tiến độ qua SMS/Zalo.' },
        { title: 'Nhận lại sản phẩm', desc: 'Nhận máy tại cửa hàng hoặc giao tận nơi, kèm biên bản bảo hành đầy đủ.' },
      ],
    },
    {
      kind: 'checklist',
      eyebrow: 'Điều kiện',
      title: 'Điều kiện được bảo hành',
      items: [
        'Sản phẩm còn trong thời hạn bảo hành ghi trên phiếu/hóa đơn.',
        'Tem bảo hành, tem niêm phong còn nguyên vẹn, không rách hay tẩy xóa.',
        'Lỗi do nhà sản xuất về phần cứng, linh kiện trong điều kiện sử dụng bình thường.',
        'Máy không bị can thiệp, tháo lắp bởi đơn vị không được ủy quyền.',
      ],
    },
    {
      kind: 'faq',
      eyebrow: 'Lưu ý',
      title: 'Trường hợp KHÔNG được bảo hành',
      items: [
        { q: 'Máy bị vào nước, ẩm hoặc oxy hóa?', a: 'Không thuộc diện bảo hành chính hãng. PhoneShop có dịch vụ sửa chữa tính phí riêng cho các trường hợp này.' },
        { q: 'Máy bị rơi vỡ, cong vênh, móp méo?', a: 'Hư hỏng do tác động vật lý từ bên ngoài không được bảo hành. Vui lòng liên hệ để được báo giá sửa chữa.' },
        { q: 'Tem bảo hành bị rách hoặc đã tự sửa?', a: 'Sản phẩm đã qua sửa chữa tại nơi không ủy quyền hoặc mất tem niêm phong sẽ mất quyền bảo hành.' },
      ],
    },
  ],
  cta: {
    title: 'Cần hỗ trợ bảo hành?',
    desc: 'Đội ngũ kỹ thuật của chúng tôi sẵn sàng hỗ trợ bạn từ 8h–22h mỗi ngày.',
    href: '/contact',
    label: 'Liên hệ hỗ trợ',
  },
}

export default function WarrantyPage() {
  return <InfoPage data={data} />
}
