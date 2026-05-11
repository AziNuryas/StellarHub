# 🌌 StellarHub

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![GSAP](https://img.shields.io/badge/GSAP-Animations-green?style=for-the-badge&logo=greensock)](https://greensock.com/gsap/)

**StellarHub** adalah platform komunitas astronomi modern yang dirancang untuk menghubungkan penggiat langit di Indonesia dengan data kosmik NASA secara real-time. Nikmati pengalaman eksplorasi luar angkasa yang interaktif, elegan, dan responsif.

---

## ✨ Fitur Utama

-   🚀 **NASA APOD Explorer:** Jelajahi arsip harian "Astronomy Picture of the Day" NASA sejak 1995 dengan fitur terjemahan otomatis ke Bahasa Indonesia.
-   📱 **Live Feed & Komunitas:** Bagikan temuan kosmik Anda, berikan komentar, dan sukai kiriman astronom lain secara instan (Powered by Supabase Realtime).
-   🛰️ **Interactive UI:** Desain premium dengan animasi 3D satelit (GSAP) dan antarmuka *glassmorphism* yang memanjakan mata.
-   🔔 **Real-time Notifications:** Dapatkan pemberitahuan langsung saat ada interaksi pada profil atau kiriman Anda.
-   🌓 **Dark & Light Mode:** Dukungan tema dinamis yang disesuaikan untuk kenyamanan penglihatan di siang maupun malam hari.
-   🌍 **Multilingual Support:** Terjemahan konten NASA menggunakan DeepL API atau MyMemory fallback.

---

## 🛠️ Tech Stack

-   **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
-   **Database & Auth:** [Supabase](https://supabase.com/)
-   **Styling:** [Tailwind CSS 4.0](https://tailwindcss.com/) & [Vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
-   **Animations:** [GSAP](https://greensock.com/gsap/) & [Framer Motion](https://www.framer.com/motion/)
-   **UI Components:** [Radix UI](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/)
-   **State Management:** [TanStack Query (React Query)](https://tanstack.com/query/latest)
-   **Notifications:** [Sonner](https://sonner.stevenly.me/)

---

## 🚀 Memulai (Local Setup)

1.  **Clone Repository:**
    ```bash
    git clone https://github.com/AziNuryas/StellarHub.git
    cd stellarhub
    ```

2.  **Instal Dependensi:**
    ```bash
    npm install
    ```

3.  **Konfigurasi Environment:**
    Salin file `.env.example` ke `.env.local` dan lengkapi kredensial berikut:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    NEXT_PUBLIC_NASA_API_KEY=your_nasa_api_key
    DEEPL_API_KEY=your_deepl_api_key
    ```

4.  **Jalankan Development Server:**
    ```bash
    npm run dev
    ```
    Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

---

## 📸 Preview

![StellarHub Landing Page](https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1200)

---

## 🛡️ Lisensi

Didistribusikan di bawah Lisensi MIT. Lihat `LICENSE` untuk informasi lebih lanjut.

---

## 👨‍💻 Kontributor

-   **Azi Nuryas** - [GitHub](https://github.com/AziNuryas)

---

*Dibuat dengan ❤️ untuk komunitas astronomi Indonesia.*
