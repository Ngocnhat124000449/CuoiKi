'use client'
import { useEffect, useState } from 'react'
import styles from './FlashTimer.module.scss'

function pad(n: number) { return String(n).padStart(2, '0') }

function getEndOfDay(): Date {
  const d = new Date()
  d.setHours(23, 59, 59, 0)
  return d
}

function getRemainingSeconds(end: Date): number {
  return Math.max(0, Math.floor((end.getTime() - Date.now()) / 1000))
}

export default function FlashTimer() {
  const [end]  = useState(getEndOfDay)
  const [secs, setSecs] = useState(() => getRemainingSeconds(getEndOfDay()))

  useEffect(() => {
    const id = setInterval(() => setSecs(getRemainingSeconds(end)), 1000)
    return () => clearInterval(id)
  }, [end])

  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60

  return (
    <div className={styles.timer}>
      <span className={styles.block}>{pad(h)}</span>
      <span className={styles.sep}>:</span>
      <span className={styles.block}>{pad(m)}</span>
      <span className={styles.sep}>:</span>
      <span className={styles.block}>{pad(s)}</span>
    </div>
  )
}
