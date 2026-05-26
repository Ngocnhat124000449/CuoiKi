'use client'
import { useState } from 'react'
import { submitReviewAction } from '@/lib/actions/review'
import styles from './ReviewForm.module.scss'

const LABELS = ['', 'Tệ', 'Không tốt', 'Bình thường', 'Tốt', 'Xuất sắc']

type Props = {
  productId: number
  productSlug: string
}

export default function ReviewForm({ productId, productSlug }: Props) {
  const [rating,  setRating]  = useState(0)
  const [hovered, setHovered] = useState(0)
  const [title,   setTitle]   = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [done,    setDone]    = useState(false)

  if (done) {
    return (
      <div className={styles.success}>
        <span className={styles.successIcon}>✓</span>
        <div>
          <p className={styles.successTitle}>Cảm ơn bạn đã đánh giá!</p>
          <p className={styles.successSub}>Nhận xét của bạn đã được ghi nhận.</p>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (rating === 0) { setError('Vui lòng chọn số sao đánh giá'); return }
    if (!content.trim()) { setError('Vui lòng nhập nội dung đánh giá'); return }

    setLoading(true)
    const result = await submitReviewAction({ productId, productSlug, rating, title, content })
    setLoading(false)

    if ('error' in result) { setError(result.error); return }
    setDone(true)
  }

  const active = hovered || rating

  return (
    <form onSubmit={handleSubmit} className={styles.form}>

      {/* Star rating */}
      <div className={styles.starsRow}>
        <div className={styles.stars}>
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
              className={`${styles.star} ${n <= active ? styles.starOn : ''}`}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(n)}
              aria-label={`${n} sao`}
            >
              ★
            </button>
          ))}
        </div>
        {active > 0 && (
          <span className={styles.ratingLabel}>{LABELS[active]}</span>
        )}
      </div>

      {/* Title (optional) */}
      <input
        type="text"
        className={styles.input}
        placeholder="Tiêu đề ngắn gọn (tùy chọn)"
        value={title}
        onChange={e => setTitle(e.target.value)}
        maxLength={255}
      />

      {/* Content */}
      <textarea
        className={`${styles.input} ${styles.textarea}`}
        placeholder="Chia sẻ trải nghiệm thực tế của bạn về sản phẩm này..."
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={4}
        required
      />

      {error && <p className={styles.error}>{error}</p>}

      <button type="submit" className={styles.submitBtn} disabled={loading}>
        {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
      </button>
    </form>
  )
}
