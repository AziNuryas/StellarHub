import type { Metadata } from "next"
import { Inter, DM_Sans, Archivo_Black } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ClientLayout from '@/components/ClientLayout'

const inter = Inter({ subsets: ["latin"] })
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", weight: ["400", "500", "600"] })
const archivoBlack = Archivo_Black({ subsets: ["latin"], variable: "--font-archivo", weight: "400" })

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
      <body className={`${inter.className} ${dmSans.variable} ${archivoBlack.variable} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
          </AuthProvider>
          <Toaster 
            position="top-right"
            theme="dark"
            richColors
            closeButton
          />
        </ThemeProvider>
      </body>
    </html>
  )
}