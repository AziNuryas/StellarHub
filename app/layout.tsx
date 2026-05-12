import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "sonner"
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ClientLayout from '@/components/ClientLayout'

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
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