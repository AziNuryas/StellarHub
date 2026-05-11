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
  title: {
    default: "StellarHub | Cosmic Community",
    template: "%s | StellarHub"
  },
  description: "Jelajahi alam semesta bersama komunitas astronomi Indonesia. Data real-time NASA, diskusi astronomi, dan koleksi kosmik pribadi.",
  keywords: ["astronomi", "NASA", "APOD", "bintang", "galaksi", "Indonesia", "komunitas astronomi"],
  authors: [{ name: "Azi Nuryas" }],
  creator: "Azi Nuryas",
  publisher: "StellarHub",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://stellarhub.id",
    title: "StellarHub | Cosmic Community",
    description: "Jelajahi alam semesta bersama komunitas astronomi Indonesia.",
    siteName: "StellarHub",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "StellarHub Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StellarHub | Cosmic Community",
    description: "Jelajahi alam semesta bersama komunitas astronomi Indonesia.",
    images: ["/og-image.jpg"],
    creator: "@AziNuryas",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
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