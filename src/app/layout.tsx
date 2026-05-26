import type { Metadata } from 'next'
import Script from 'next/script'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import TopBar from '@/components/layout/TopBar'
import CategoryNav from '@/components/layout/CategoryNav'
import AuthProvider from '@/components/layout/AuthProvider'
import ThemeProvider from '@/components/ui/ThemeProvider'
import RevealObserver from '@/components/ui/RevealObserver'
import CartDrawer from '@/components/cart/CartDrawer'
import './globals.scss'

export const metadata: Metadata = {
  title: { default: 'PhoneShop', template: '%s | PhoneShop' },
  description: 'Điện thoại chính hãng, giá tốt nhất',
}

// Inline script runs synchronously before any CSS — prevents flash of wrong theme
const themeScript = `(function(){
  try {
    var t = localStorage.getItem('theme');
    if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', t);
  } catch(e) {}
})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeScript }} />
        <AuthProvider>
          <ThemeProvider>
            <TopBar />
            <Header />
            <CategoryNav />
            <RevealObserver />
            <main className="site-main">{children}</main>
            <Footer />
            <CartDrawer />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
