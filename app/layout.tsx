import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { AuthProvider } from './contexts/AuthContext'
import ClientLayout from '@/components/ClientLayout' // ← komponen baru

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "StellarHub | Cosmic Community",
  description: "Explore the universe with fellow astronomers",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <ClientLayout> {/* ← semua logic client dipindah ke sini */}
            {children}
          </ClientLayout>
        </AuthProvider>
        <Toaster 
          position="top-right"
          theme="dark"
          richColors
          closeButton
        />
      </body>
    </html>
  )
}