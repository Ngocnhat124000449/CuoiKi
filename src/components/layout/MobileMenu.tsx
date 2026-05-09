"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./MobileMenu.module.scss";

type NavItem = { label: string; href: string; icon?: string };

const DEFAULT_NAV: NavItem[] = [
  { label: "Trang chủ", href: "/", icon: "🏠" },
  { label: "Điện thoại", href: "/products", icon: "📱" },
  { label: "Laptop", href: "/products?search=laptop", icon: "💻" },
  { label: "Phụ kiện", href: "/products?search=phu+kien", icon: "🔌" },
  { label: "Âm thanh", href: "/products?search=tai+nghe", icon: "🎧" },
  { label: "Khuyến mãi", href: "/products?sortBy=price_asc", icon: "🏷️" },
  { label: "Về chúng tôi", href: "/about", icon: "ℹ️" },
];

export default function MobileMenu({ navItems }: { navItems?: NavItem[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const items = navItems ?? DEFAULT_NAV;

  return (
    <>
      <button
        type="button"
        className={styles.hamburger}
        onClick={() => setOpen(true)}
        aria-label="Mở menu"
        aria-expanded={open}
      >
        <span />
        <span />
        <span />
      </button>

      {open && (
        <>
          <div className={styles.overlay} onClick={() => setOpen(false)} />
          <div
            className={`${styles.drawer} ${styles.open}`}
            role="dialog"
            aria-modal
          >
            <div className={styles.head}>
              <span className={styles.logoText}>PhoneShop</span>
              <button
                className={styles.closeBtn}
                onClick={() => setOpen(false)}
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            <nav className={styles.nav}>
              {items.map((item) => (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className={styles.navItem}
                  onClick={() => setOpen(false)}
                >
                  {item.icon && (
                    <span className={styles.icon}>{item.icon}</span>
                  )}
                  {item.label}
                </Link>
              ))}
              <div className={styles.divider} />
              <Link
                href="/cart"
                className={styles.navItem}
                onClick={() => setOpen(false)}
              >
                <span className={styles.icon}>🛒</span>Giỏ hàng
              </Link>
              <Link
                href="#"
                className={styles.navItem}
                onClick={() => setOpen(false)}
              >
                <span className={styles.icon}>👤</span>Tài khoản
              </Link>
            </nav>

            <div className={styles.foot}>
              <a href="tel:19001234" className={styles.hotlineBtn}>
                <span>📞</span>Gọi ngay 1900 1234
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
}
