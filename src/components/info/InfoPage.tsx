import Link from 'next/link'
import styles from './InfoPage.module.scss'

// ==========================================================================
// InfoPage — shared static layout for footer info/policy pages
// Server Component (zero client JS). Scroll animations reuse the global
// <RevealObserver /> via the data-stagger / data-revealed pattern.
// One shared SCSS module → a single CSS chunk reused across all 7 routes.
// ==========================================================================

export type InfoBlock =
  | { kind: 'prose';  eyebrow?: string; title?: string; paragraphs: string[] }
  | { kind: 'cards';  eyebrow?: string; title?: string; desc?: string; cards: { badge?: string; title: string; desc: string }[] }
  | { kind: 'steps';  eyebrow?: string; title?: string; desc?: string; steps: { title: string; desc: string }[] }
  | { kind: 'checklist'; eyebrow?: string; title?: string; desc?: string; items: string[] }
  | { kind: 'faq';    eyebrow?: string; title?: string; items: { q: string; a: string }[] }
  | { kind: 'stores'; eyebrow?: string; title?: string; stores: { name: string; address: string; phone: string; hours: string }[] }

export type InfoPageData = {
  pill: string
  title: string
  desc: string
  blocks: InfoBlock[]
  cta?: { title: string; desc: string; href: string; label: string }
}

function BlockHead({ eyebrow, title, desc }: { eyebrow?: string; title?: string; desc?: string }) {
  if (!eyebrow && !title && !desc) return null
  return (
    <header className={styles.blockHead}>
      {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
      {title && <h2 className={styles.blockTitle}>{title}</h2>}
      {desc && <p className={styles.blockDesc}>{desc}</p>}
    </header>
  )
}

function Block({ block }: { block: InfoBlock }) {
  switch (block.kind) {
    case 'prose':
      return (
        <section className={styles.section}>
          <div className={styles.inner}>
            <BlockHead eyebrow={block.eyebrow} title={block.title} />
            <div className={styles.prose} data-stagger>
              {block.paragraphs.map((p, i) => (
                <p key={i} className={styles.para}>{p}</p>
              ))}
            </div>
          </div>
        </section>
      )

    case 'cards':
      return (
        <section className={styles.section}>
          <div className={styles.inner}>
            <BlockHead eyebrow={block.eyebrow} title={block.title} desc={block.desc} />
            <div className={styles.cardsGrid} data-stagger>
              {block.cards.map((c, i) => (
                <article key={i} className={styles.card}>
                  {c.badge && <span className={styles.cardBadge}>{c.badge}</span>}
                  <h3 className={styles.cardTitle}>{c.title}</h3>
                  <p className={styles.cardDesc}>{c.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )

    case 'steps':
      return (
        <section className={styles.section}>
          <div className={styles.inner}>
            <BlockHead eyebrow={block.eyebrow} title={block.title} desc={block.desc} />
            <ol className={styles.steps} data-stagger>
              {block.steps.map((s, i) => (
                <li key={i} className={styles.step}>
                  <span className={styles.stepNo}>{i + 1}</span>
                  <div className={styles.stepBody}>
                    <h3 className={styles.stepTitle}>{s.title}</h3>
                    <p className={styles.stepDesc}>{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )

    case 'checklist':
      return (
        <section className={styles.section}>
          <div className={styles.inner}>
            <BlockHead eyebrow={block.eyebrow} title={block.title} desc={block.desc} />
            <ul className={styles.checklist} data-stagger>
              {block.items.map((item, i) => (
                <li key={i} className={styles.checkItem}>
                  <span className={styles.checkIcon} aria-hidden="true">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )

    case 'faq':
      return (
        <section className={styles.section}>
          <div className={styles.inner}>
            <BlockHead eyebrow={block.eyebrow} title={block.title} />
            <div className={styles.faq} data-stagger>
              {block.items.map((qa, i) => (
                // <details> is native (no JS) — keeps the page a pure Server Component
                <details key={i} className={styles.faqItem}>
                  <summary className={styles.faqQ}>{qa.q}</summary>
                  <p className={styles.faqA}>{qa.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )

    case 'stores':
      return (
        <section className={styles.section}>
          <div className={styles.inner}>
            <BlockHead eyebrow={block.eyebrow} title={block.title} />
            <div className={styles.storesGrid} data-stagger>
              {block.stores.map((s, i) => (
                <article key={i} className={styles.storeCard}>
                  <h3 className={styles.storeName}>{s.name}</h3>
                  <p className={styles.storeRow}><span aria-hidden="true">📍</span>{s.address}</p>
                  <p className={styles.storeRow}><span aria-hidden="true">📞</span><a href={`tel:${s.phone.replace(/\s/g, '')}`}>{s.phone}</a></p>
                  <p className={styles.storeRow}><span aria-hidden="true">🕒</span>{s.hours}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )
  }
}

export default function InfoPage({ data }: { data: InfoPageData }) {
  return (
    <div className={styles.page}>
      {/* ── HERO ── static (no data-stagger) → instant paint, good for LCP ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true" />
        <div className={styles.heroInner}>
          <span className={styles.heroPill}>{data.pill}</span>
          <h1 className={styles.heroTitle}>{data.title}</h1>
          <p className={styles.heroDesc}>{data.desc}</p>
        </div>
      </section>

      {data.blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}

      {data.cta && (
        <section className={styles.ctaSection}>
          <div className={styles.ctaInner}>
            <h2 className={styles.ctaTitle}>{data.cta.title}</h2>
            <p className={styles.ctaDesc}>{data.cta.desc}</p>
            <Link href={data.cta.href} className={styles.ctaBtn}>{data.cta.label} →</Link>
          </div>
        </section>
      )}
    </div>
  )
}
