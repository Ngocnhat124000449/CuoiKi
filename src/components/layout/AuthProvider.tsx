'use client'
import { SessionProvider } from 'next-auth/react'

// Cung cấp session ở phía client (useSession) — nhờ vậy root layout KHÔNG cần
// gọi auth() trên server, tránh ép toàn bộ route thành dynamic.
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
