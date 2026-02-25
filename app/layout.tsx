import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'  // ← IMPORT
import ClientLayout from '@/components/ClientLayout'

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
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider> {/* ← ThemeProvider harus di LUAR */}
          <AuthProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
          </AuthProvider>
        </ThemeProvider>
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