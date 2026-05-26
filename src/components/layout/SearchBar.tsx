'use client'
import { useState, useEffect, useRef, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import styles from './SearchBar.module.scss'

// ── Types ─────────────────────────────────────────────────────────────────────

type Suggestion = {
  id: number
  name: string
  slug: string
  priceText: string
  image: { url: string; altText: string | null } | null
  brand: string | null
  category: { name: string } | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Highlight({ text, query }: { text: string; query: string }): ReactNode {
  if (!query) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className={styles.mark}>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
)

// ── Component ─────────────────────────────────────────────────────────────────

export default function SearchBar() {
  const [query, setQuery]           = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading]       = useState(false)
  const [open, setOpen]             = useState(false)
  const [activeIdx, setActiveIdx]   = useState(-1)

  const router    = useRouter()
  const rootRef   = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)
  const abortRef  = useRef<AbortController | null>(null)

  // ── Close on outside click ───────────────────────────────────────────────
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
        setActiveIdx(-1)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  // ── Debounced fetch ──────────────────────────────────────────────────────
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setSuggestions([])
      setOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      abortRef.current?.abort()
      abortRef.current = new AbortController()
      setLoading(true)

      try {
        const res = await fetch(
          `/api/products?search=${encodeURIComponent(q)}&limit=6`,
          { signal: abortRef.current.signal }
        )
        if (!res.ok) throw new Error('fetch failed')
        const json = await res.json()
        setSuggestions(json.data ?? [])
        setOpen(true)
        setActiveIdx(-1)
      } catch (err: unknown) {
        if ((err as Error).name !== 'AbortError') setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // ── Navigation helpers ───────────────────────────────────────────────────
  const go = useCallback((url: string) => {
    setOpen(false)
    setQuery('')
    router.push(url)
  }, [router])

  function doSearch() {
    const q = query.trim()
    if (q) go(`/products?search=${encodeURIComponent(q)}`)
  }

  // ── Keyboard ─────────────────────────────────────────────────────────────
  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (e.key === 'Enter') doSearch()
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIdx(i => Math.min(i + 1, suggestions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIdx(i => Math.max(i - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIdx >= 0 && suggestions[activeIdx]) {
          go(`/products/${suggestions[activeIdx].slug}`)
        } else {
          doSearch()
        }
        break
      case 'Escape':
        setOpen(false)
        setActiveIdx(-1)
        inputRef.current?.blur()
        break
    }
  }

  const showDropdown = open && query.trim().length >= 2

  return (
    <div ref={rootRef} className={styles.root}>
      {/* ── Input row ── */}
      <div className={styles.wrap}>
        <input
          ref={inputRef}
          type="search"
          className={styles.input}
          placeholder="Tìm kiếm điện thoại, phụ kiện..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onKeyDown={onKeyDown}
          aria-label="Tìm kiếm sản phẩm"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          className={styles.btn}
          onClick={doSearch}
          aria-label="Tìm kiếm"
        >
          <SearchIcon />
          <span>Tìm kiếm</span>
        </button>
      </div>

      {/* ── Dropdown ── */}
      {showDropdown && (
        <div className={styles.dropdown} role="listbox" aria-label="Gợi ý tìm kiếm">

          {/* Loading skeletons */}
          {loading && (
            <ul className={styles.list}>
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className={styles.skeleton}>
                  <div className={styles.skeletonImg} />
                  <div className={styles.skeletonLines}>
                    <div className={styles.skeletonLine} style={{ width: `${55 + i * 10}%` }} />
                    <div className={styles.skeletonLine} style={{ width: '40%' }} />
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Results */}
          {!loading && suggestions.length > 0 && (
            <>
              <ul className={styles.list}>
                {suggestions.map((s, i) => (
                  <li
                    key={s.id}
                    role="option"
                    aria-selected={i === activeIdx}
                    className={`${styles.item} ${i === activeIdx ? styles.active : ''}`}
                    onMouseEnter={() => setActiveIdx(i)}
                    onMouseDown={e => { e.preventDefault(); go(`/products/${s.slug}`) }}
                  >
                    <div className={styles.itemImg}>
                      {s.image
                        ? <img src={s.image.url} alt={s.image.altText ?? s.name} loading="lazy" />
                        : <span className={styles.itemImgFallback}>📱</span>
                      }
                    </div>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>
                        <Highlight text={s.name} query={query.trim()} />
                      </span>
                      <div className={styles.itemMeta}>
                        {s.category && (
                          <span className={styles.itemCat}>{s.category.name}</span>
                        )}
                        <span className={styles.itemPrice}>{s.priceText}</span>
                      </div>
                    </div>
                    <SearchIcon />
                  </li>
                ))}
              </ul>

              <div
                className={styles.viewAll}
                onMouseDown={e => {
                  e.preventDefault()
                  go(`/products?search=${encodeURIComponent(query.trim())}`)
                }}
              >
                Xem tất cả kết quả cho&nbsp;<strong>"{query.trim()}"</strong>
                <span className={styles.viewAllArrow}>→</span>
              </div>
            </>
          )}

          {/* Empty */}
          {!loading && suggestions.length === 0 && (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>🔍</span>
              <p>Không tìm thấy sản phẩm nào cho</p>
              <p><strong>"{query.trim()}"</strong></p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
