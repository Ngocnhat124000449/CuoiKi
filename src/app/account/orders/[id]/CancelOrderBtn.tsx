'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cancelOrderAction } from '@/lib/actions/order'
import styles from './page.module.scss'

export default function CancelOrderBtn({ orderId }: { orderId: number }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleCancel() {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return
    setLoading(true)
    const result = await cancelOrderAction(orderId)
    setLoading(false)
    if (result.error) { setError(result.error); return }
    router.refresh()
  }

  return (
    <div>
      {error && <p className={styles.errorMsg}>{error}</p>}
      <button
        type="button"
        className={styles.cancelBtn}
        onClick={handleCancel}
        disabled={loading}
      >
        {loading ? 'Đang hủy...' : '✕ Hủy đơn hàng'}
      </button>
    </div>
  )
}
