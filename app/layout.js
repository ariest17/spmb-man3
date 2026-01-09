import './globals.css'
import { Toaster } from 'sonner'
import AuthProvider from '@/components/providers/AuthProvider'

export const metadata = {
  title: 'SPMB MAN 3 Kediri - Sistem Penerimaan Murid Baru',
  description: 'Sistem Penerimaan Murid Baru MAN 3 Kediri',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-background antialiased">
        <AuthProvider>
          {children}
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </body>
    </html>
  )
}