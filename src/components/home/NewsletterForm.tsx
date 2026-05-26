'use client'
import { useState } from 'react'
import styles from './NewsletterForm.module.scss'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    setTimeout(() => {
      setStatus('success')
      setEmail('')
    }, 800)
  }

  if (status === 'success') {
    return (
      <div className={styles.successWrap}>
        <span className={styles.successIcon}>✓</span>
        <p className={styles.successText}>Đăng ký thành công! Chào mừng bạn đến với PhoneShop.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Nhập địa chỉ email của bạn"
        className={styles.input}
        required
        disabled={status === 'loading'}
      />
      <button type="submit" className={styles.btn} disabled={status === 'loading'}>
        {status === 'loading' ? 'Đang xử lý...' : 'Đăng ký'}
      </button>
    </form>
  )
}
