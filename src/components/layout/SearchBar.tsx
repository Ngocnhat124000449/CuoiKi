'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useRef } from 'react'
import styles from './SearchBar.module.scss'

export default function SearchBar() {
  const router = useRouter()
  const pathname = usePathname()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSearch() {
    const q = inputRef.current?.value.trim()
    if (q) router.push(`/products?search=${encodeURIComponent(q)}`)
    else if (pathname !== '/products') router.push('/products')
  }

  return (
    <div className={styles.wrap}>
      <input
        ref={inputRef}
        type="search"
        className={styles.input}
        placeholder="Tìm kiếm điện thoại, phụ kiện..."
        onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
        aria-label="Tìm kiếm sản phẩm"
      />
      <button type="button" className={styles.btn} onClick={handleSearch} aria-label="Tìm kiếm">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <span>Tìm kiếm</span>
      </button>
    </div>
  )
}
