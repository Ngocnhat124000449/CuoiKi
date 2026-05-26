'use client'
import { useEffect } from 'react'

export default function RevealObserver() {
  useEffect(() => {
    // ── Track scroll direction ──────────────────────────────────────────────
    let lastY = window.scrollY
    let dir: 'down' | 'up' = 'down'

    const onScroll = () => {
      const y = window.scrollY
      if (y !== lastY) dir = y > lastY ? 'down' : 'up'
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // ── Trigger: animate when section first enters the viewport (≥ 10%) ────
    const triggerIO = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ isIntersecting, target }) => {
          if (!isIntersecting) return

          const el = target as HTMLElement
          if (el.dataset.revealed) return  // wait for reset

          const children = Array.from(el.children) as HTMLElement[]
          const count = children.length
          const current = dir
          const step = Math.min(0.07, 0.46 / Math.max(count - 1, 1))

          children.forEach((child, i) => {
            const order = current === 'up' ? count - 1 - i : i
            child.style.setProperty('--delay', `${0.04 + order * step}s`)
          })

          el.setAttribute('data-revealed', current)
        })
      },
      { threshold: 0.1 }
    )

    // ── Reset: clear only when section fully leaves the viewport (ratio = 0) ─
    // Avoids threshold conflict: trigger at 10%, reset at 0% — clean separation.
    // Section must completely exit before the next scroll-in can re-animate it.
    const resetIO = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ isIntersecting, target }) => {
          if (isIntersecting) return  // still (partially) visible — keep revealed state

          const el = target as HTMLElement
          if (!el.dataset.revealed) return
          el.removeAttribute('data-revealed')
          ;(Array.from(el.children) as HTMLElement[]).forEach(child => {
            child.style.removeProperty('--delay')
          })
        })
      },
      { threshold: 0 }
    )

    // ── MutationObserver: catch async SSR-streamed elements ─────────────────
    // Theo dõi phần tử đã observe bằng WeakSet thay vì ghi attribute vào DOM.
    // Ghi `data-observed` lên DOM gây hydration mismatch khi trang được prerender
    // static (effect chạy lúc các section trong <Suspense> đang hydrate).
    const observed = new WeakSet<Element>()
    function observeNew() {
      document.querySelectorAll('[data-stagger]').forEach(el => {
        if (observed.has(el)) return
        observed.add(el)
        triggerIO.observe(el)
        resetIO.observe(el)
      })
    }

    observeNew()
    const mo = new MutationObserver(observeNew)
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      triggerIO.disconnect()
      resetIO.disconnect()
      mo.disconnect()
    }
  }, [])

  return null
}
