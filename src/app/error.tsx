'use client'
import { useEffect } from 'react'
import styles from './error.module.scss'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className={styles.wrap}>
      <p className={styles.icon}>⚠️</p>
      <h2 className={styles.title}>Đã xảy ra lỗi</h2>
      <p className={styles.desc}>
        Có lỗi không mong muốn xảy ra. Vui lòng thử lại hoặc quay về trang chủ.
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.btnPrimary} onClick={reset}>
          Thử lại
        </button>
        <a href="/" className={styles.btnSecondary}>Về trang chủ</a>
      </div>
    </div>
  )
}
