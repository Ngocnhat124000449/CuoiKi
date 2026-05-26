const ITEMS = [
  { icon: '🔥', text: 'Giảm đến 50% iPhone 15 Series' },
  { icon: '⚡', text: 'Flash Deal Samsung Galaxy S24 — chỉ hôm nay' },
  { icon: '💳', text: 'Trả góp 0% — duyệt trong 5 phút' },
  { icon: '🎁', text: 'Tặng ngay AirPods khi mua MacBook' },
  { icon: '🚚', text: 'Miễn phí giao hàng toàn quốc từ 500k' },
  { icon: '🏆', text: 'Xiaomi Redmi Note 13 Pro+ giảm 30%' },
  { icon: '🔄', text: 'Thu cũ đổi mới — lên đời tiết kiệm hơn' },
  { icon: '⭐', text: 'Bảo hành chính hãng — đổi trả 30 ngày' },
]

const TRIPLED = [...ITEMS, ...ITEMS, ...ITEMS]

import styles from './MarqueeBanner.module.scss'

export default function MarqueeBanner() {
  return (
    <div className={styles.root} aria-label="Thông báo khuyến mãi">
      <div className={styles.fadeLeft} aria-hidden />
      <div className={styles.fadeRight} aria-hidden />
      <div className={styles.track} aria-hidden>
        {TRIPLED.map((item, i) => (
          <span key={i} className={styles.item}>
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.text}>{item.text}</span>
            <span className={styles.dot} />
          </span>
        ))}
      </div>
    </div>
  )
}
