import Link from 'next/link'
import styles from './SectionHeader.module.scss'

type Props = {
  title: string
  icon?: string
  href?: string
  linkLabel?: string
}

export default function SectionHeader({ title, icon, href, linkLabel = 'Xem tất cả →' }: Props) {
  return (
    <div className={styles.header}>
      <div className={styles.titleWrap}>
        <div className={styles.bar} />
        {icon && <span className={styles.icon}>{icon}</span>}
        <h2 className={styles.title}>{title}</h2>
      </div>
      {href && (
        <Link href={href} className={styles.link}>{linkLabel}</Link>
      )}
    </div>
  )
}
