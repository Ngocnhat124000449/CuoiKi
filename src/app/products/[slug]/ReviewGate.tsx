'use client'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import ReviewForm from '@/components/product/ReviewForm'
import styles from './page.module.scss'

// Gate form đánh giá theo trạng thái đăng nhập — phía client (useSession),
// nhờ vậy trang chi tiết không cần auth() và có thể dùng ISR.
export default function ReviewGate({
  productId,
  productSlug,
}: {
  productId: number
  productSlug: string
}) {
  const { status } = useSession()

  if (status === 'loading') {
    return <p className={styles.loginHint}>Đang tải…</p>
  }

  if (status === 'authenticated') {
    return <ReviewForm productId={productId} productSlug={productSlug} />
  }

  return (
    <p className={styles.loginHint}>
      <Link href="/login">Đăng nhập</Link> để gửi đánh giá của bạn.
    </p>
  )
}
