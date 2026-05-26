'use client'
import { useActionState, useState } from 'react'
import { submitContactAction } from '@/lib/actions/contact'
import styles from './page.module.scss'

export default function ContactForm() {
  const [error, formAction, isPending] = useActionState(submitContactAction, null)
  const [submitted, setSubmitted] = useState(false)

  const showSuccess = submitted && !isPending && error === null

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Liên hệ với chúng tôi</h1>
        <p className={styles.heroSub}>Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7</p>
      </section>

      <div className={styles.content}>
        <div className={styles.infoGrid}>
          {[
            { icon: '📞', title: 'Hotline',      lines: ['1900 1234', 'Miễn phí · 8h–22h hàng ngày'] },
            { icon: '✉️', title: 'Email',         lines: ['support@phoneshop.vn', 'Phản hồi trong 2 giờ'] },
            { icon: '📍', title: 'Địa chỉ',       lines: ['123 Nguyễn Huệ, Quận 1', 'TP. Hồ Chí Minh'] },
            { icon: '🕐', title: 'Giờ làm việc',  lines: ['Thứ 2 – Chủ nhật', '8:00 – 22:00'] },
          ].map(card => (
            <div key={card.title} className={styles.infoCard}>
              <span className={styles.infoIcon}>{card.icon}</span>
              <h3 className={styles.infoTitle}>{card.title}</h3>
              {card.lines.map(l => <p key={l} className={styles.infoLine}>{l}</p>)}
            </div>
          ))}
        </div>

        <div className={styles.formWrap}>
          <h2 className={styles.formTitle}>Gửi tin nhắn cho chúng tôi</h2>

          {showSuccess ? (
            <div className={styles.success}>
              <span className={styles.successIcon}>✅</span>
              <h3>Đã gửi thành công!</h3>
              <p>Chúng tôi sẽ phản hồi trong vòng 2 giờ. Cảm ơn bạn đã liên hệ.</p>
              <button
                type="button"
                className={styles.resetBtn}
                onClick={() => setSubmitted(false)}
              >
                Gửi tin nhắn khác
              </button>
            </div>
          ) : (
            <form
              action={(fd) => { setSubmitted(true); formAction(fd) }}
              className={styles.form}
            >
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="contact-name">
                    Họ và tên <span className={styles.req}>*</span>
                  </label>
                  <input
                    id="contact-name" name="name" type="text"
                    className={styles.input}
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="contact-phone">Số điện thoại</label>
                  <input
                    id="contact-phone" name="phone" type="tel"
                    className={styles.input}
                    placeholder="0912 345 678"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="contact-email">
                  Email <span className={styles.req}>*</span>
                </label>
                <input
                  id="contact-email" name="email" type="email"
                  className={styles.input}
                  placeholder="example@email.com"
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="contact-message">
                  Nội dung <span className={styles.req}>*</span>
                </label>
                <textarea
                  id="contact-message" name="message"
                  className={`${styles.input} ${styles.textarea}`}
                  placeholder="Tôi cần tư vấn về..."
                  required
                  rows={5}
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <button type="submit" className={styles.submitBtn} disabled={isPending}>
                {isPending ? 'Đang gửi...' : '📨 Gửi tin nhắn'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
