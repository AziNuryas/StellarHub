import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "NASA APOD Explorer | StellarHub",
  description: "Jelajahi arsip harian Astronomy Picture of the Day NASA. Temukan keajaiban alam semesta dengan deskripsi Bahasa Indonesia.",
  openGraph: {
    title: "NASA APOD Explorer | StellarHub",
    description: "Jelajahi arsip harian Astronomy Picture of the Day NASA.",
    images: ["/nasa-preview.jpg"],
  }
}

export default function NasaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
