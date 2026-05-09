import styles from './TopBar.module.scss'

const MESSAGES = [
  { icon: '✅', text: 'Sản phẩm chính hãng — Xuất VAT đầy đủ' },
  { icon: '🚚', text: 'Giao nhanh toàn quốc — Miễn phí từ 500k' },
  { icon: '🔄', text: 'Thu cũ đổi mới — Lên đời tiết kiệm hơn' },
  { icon: '🛡️', text: 'Bảo hành chính hãng — Đổi trả trong 30 ngày' },
  { icon: '💳', text: 'Trả góp 0% — Duyệt nhanh trong 5 phút' },
  { icon: '🎁', text: 'Quà tặng hấp dẫn — Cho mọi đơn hàng' },
]

const DOUBLED = [...MESSAGES, ...MESSAGES]

export default function TopBar() {
  return (
    <div className={styles.topbar}>
      <div className={styles.track} aria-hidden>
        {DOUBLED.map((msg, i) => (
          <span key={i} className={styles.item}>
            <span>{msg.icon}</span>
            <span>{msg.text}</span>
            {i < DOUBLED.length - 1 && <span className={styles.sep}>|</span>}
          </span>
        ))}
      </div>
    </div>
  )
}
