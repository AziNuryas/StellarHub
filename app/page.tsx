'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Logo } from '@/components/shared/Logo'
import {
  ArrowRight, Camera, Heart, Radio,
  Github, Twitter, Instagram, Sparkles,
  MapPin, Satellite, Users, MessageCircle, Telescope, ChevronDown, Layout, Calendar, Globe, Rocket
} from 'lucide-react'

const FONT_HEADING = "'Outfit', 'Clash Display', system-ui, sans-serif"
const FONT_BODY = "'Space Grotesk', 'Inter', system-ui, sans-serif"

const COLORS = {
  bg: '#05070f',
  bgCard: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
  border: 'rgba(255, 255, 255, 0.08)',
  textMain: '#f8fafc',
  textMuted: '#94a3b8',
  accentSoft: '#818cf8',
  accentSecondary: '#f59e0b' // Gold for JWST
}

const STATS = [
  { val: '10K+', label: 'Astronom Amatir', icon: Users, color: '#3b82f6' },
  { val: '2.5M+', label: 'Total Observasi', icon: Camera, color: '#10b981' },
  { val: '30+', label: 'Provinsi', icon: MapPin, color: '#f59e0b' },
  { val: '24/7', label: 'Sinkronisasi NASA', icon: Satellite, color: '#8b5cf6' }
]

const FEATURES = [
  { title: 'Integrasi API NASA', desc: 'Terhubung langsung dengan server NASA. Nikmati pembaruan harian dari Astronomy Picture of the Day langsung di feed Anda.', icon: Satellite, color: '#3b82f6' },
  { title: 'Diskusi Real-Time', desc: 'Feed dan kolom komentar beroperasi secara instan menggunakan WebSockets termutakhir. Interaksi tanpa batas waktu.', icon: Radio, color: '#ec4899' },
  { title: 'Koleksi Pribadi', desc: 'Simpan nebula, galaksi, atau fenomena alam favorit Anda ke dalam galeri profil yang elegan.', icon: Heart, color: '#8b5cf6' }
]

const MODULES = [
  {
    title: 'Halaman Live Feed',
    subtitle: 'Nadi Utama StellarHub',
    desc: 'Di sinilah semua keajaiban terjadi. Halaman utama yang berisi aliran foto harian (APOD) dari NASA, bercampur dengan postingan diskusi dari astronom amatir lainnya. Semuanya diperbarui secara instan.',
    icon: Layout,
    color: '#3b82f6',
    mockupBg: 'url(https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=800)'
  },
  {
    title: 'Galeri & Profil Personal',
    subtitle: 'Arsip Kosmik Anda',
    desc: 'Halaman khusus untuk Anda berkreasi. Simpan semua gambar luar angkasa favorit ke dalam koleksi pribadi, unggah foto astrofotografi karya sendiri, dan bangun reputasi di komunitas.',
    icon: Camera,
    color: '#a855f7',
    mockupBg: 'url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800)'
  },
  {
    title: 'Komunitas & Event',
    subtitle: 'Jangan Lewatkan Fenomena Langit',
    desc: 'Halaman khusus untuk melacak jadwal astronomi penting di langit Indonesia, seperti gerhana bulan, hujan meteor, atau transit planet. Ajak pengguna lain untuk mengadakan observasi bersama.',
    icon: Calendar,
    color: '#10b981',
    mockupBg: 'url(https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=800)'
  }
]

const STEPS = [
  { n: '01', title: 'Buat Akun Gratis', desc: 'Daftar dalam hitungan detik menggunakan email. Dapatkan akses ke dashboard astronomi Nusantara.', icon: Rocket }, // Keep Rocket here since it's just an icon in the list, but we removed it from imports. Wait, I removed Rocket! Let me use Telescope instead or add Rocket back to import. I'll add Rocket back to import.
  { n: '02', title: 'Jelajahi Data NASA', desc: 'Akses feed harian foto resolusi tinggi langsung dari API resmi NASA tanpa delay.', icon: Globe },
  { n: '03', title: 'Diskusi & Bagikan', desc: 'Simpan foto favorit, buat diskusi, dan terhubung dengan astronom amatir di seluruh Indonesia.', icon: MessageCircle }
]

const FAQS = [
  {
    q: "Apa itu StellarHub?",
    a: "StellarHub adalah platform komunitas untuk penggiat astronomi di Indonesia. Anda bisa melihat feed foto luar angkasa harian dari NASA dan berdiskusi dengan sesama penggemar luar angkasa.",
    icon: Globe, color: '#818cf8'
  },
  {
    q: "Apakah platform ini gratis?",
    a: "Ya! StellarHub sepenuhnya gratis untuk digunakan. Tidak ada biaya berlangganan tersembunyi. Semua fitur utama termasuk akses NASA dan komunitas bisa dinikmati tanpa bayar.",
    icon: Sparkles, color: '#10b981'
  },
  {
    q: "Darimana data foto luar angkasa berasal?",
    a: "Kami menggunakan integrasi langsung dengan API publik NASA (APOD & Mars Rover). Data diperbarui setiap hari secara otomatis.",
    icon: Satellite, color: '#38bdf8'
  },
  {
    q: "Apakah bisa daftar tanpa akun Google?",
    a: "Tentu saja! Anda bisa mendaftar menggunakan email dan password biasa. Kami juga menyediakan opsi login cepat via Google dan GitHub untuk kenyamanan Anda.",
    icon: Users, color: '#f59e0b'
  },
  {
    q: "Bagaimana cara berbagi foto astronomi saya?",
    a: "Setelah login, buka halaman Feed dan klik tombol \"Post\". Anda bisa mengunggah foto, menambahkan deskripsi, dan tag lokasi observasi Anda.",
    icon: Camera, color: '#ec4899'
  },
]

export default function StellarHubLanding() {
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  
  const gsapLoaded = useRef(false)
  const cursorSatelliteRef = useRef<HTMLDivElement>(null)
  const freeSatelliteRef = useRef<HTMLDivElement>(null)
  const thirdSatelliteRef = useRef<HTMLDivElement>(null)
  
  // Real mouse position
  const mouseRef = useRef({ x: 0, y: 0 })
  // Smoothed mouse position (for delay effect)
  const smoothedMouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()
    supabase.auth.getSession().then((res: any) => {
      const session = res.data?.session
      if (session?.user) setUser(session.user)
    })
  }, [])

  useEffect(() => {
    if (gsapLoaded.current) return
    gsapLoaded.current = true
    gsap.registerPlugin(ScrollTrigger)

    // Center starting positions
    mouseRef.current.x = window.innerWidth / 2
    mouseRef.current.y = window.innerHeight / 2
    smoothedMouseRef.current.x = window.innerWidth / 2
    smoothedMouseRef.current.y = window.innerHeight / 2

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }
    window.addEventListener('mousemove', handleMouseMove)

    // --- Satellite 1: Orbiting Cursor (With Delay/Lerp) ---
    const cursorSat = cursorSatelliteRef.current
    if (cursorSat) {
      let orbitAngle = 0
      const orbitRadius = 120
      
      const animateCursorOrbit = () => {
        orbitAngle += 0.02 
        
        // Linear Interpolation (Lerp) untuk menciptakan efek delay/karet
        smoothedMouseRef.current.x += (mouseRef.current.x - smoothedMouseRef.current.x) * 0.03
        smoothedMouseRef.current.y += (mouseRef.current.y - smoothedMouseRef.current.y) * 0.03
        
        // Calculate orbit position around the SMOOTHED mouse
        const targetX = smoothedMouseRef.current.x + Math.cos(orbitAngle) * orbitRadius
        const targetY = smoothedMouseRef.current.y + Math.sin(orbitAngle) * orbitRadius
        
        const tangentAngle = (orbitAngle * (180 / Math.PI)) + 135

        gsap.set(cursorSat, {
          x: targetX,
          y: targetY,
          rotation: tangentAngle
        })

        requestAnimationFrame(animateCursorOrbit)
      }
      requestAnimationFrame(animateCursorOrbit)
    }

    // --- Satellite 2: Free Floating JWST — starts from LEFT side ---
    const freeSat = freeSatelliteRef.current
    if (freeSat) {
      // Spawn from left edge, random Y
      gsap.set(freeSat, { 
        x: -64, 
        y: Math.random() * window.innerHeight,
      })

      const animateFreeSat = () => {
        if (!freeSat) return
        
        const newX = Math.random() * window.innerWidth
        const newY = Math.random() * window.innerHeight
        
        const currentX = gsap.getProperty(freeSat, "x") as number
        const currentY = gsap.getProperty(freeSat, "y") as number
        const angle = Math.atan2(newY - currentY, newX - currentX) * (180 / Math.PI)
        
        const dist = Math.sqrt(Math.pow(newX - currentX, 2) + Math.pow(newY - currentY, 2))
        const duration = dist / 40 

        gsap.to(freeSat, {
          rotation: angle + 45,
          duration: 1.5,
          ease: 'power2.inOut'
        })

        gsap.to(freeSat, {
          x: newX,
          y: newY,
          duration: duration,
          ease: 'sine.inOut',
          onComplete: animateFreeSat
        })
      }
      animateFreeSat()
    }

    // --- Satellite 3: Random Floating Drone — starts from RIGHT side ---
    const thirdSat = thirdSatelliteRef.current
    if (thirdSat) {
      // Spawn from right edge, random Y
      gsap.set(thirdSat, { 
        x: window.innerWidth + 40,
        y: Math.random() * window.innerHeight,
      })

      const animateThirdSat = () => {
        if (!thirdSat) return
        
        const newX = Math.random() * window.innerWidth
        const newY = Math.random() * window.innerHeight
        
        const currentX = gsap.getProperty(thirdSat, "x") as number
        const currentY = gsap.getProperty(thirdSat, "y") as number
        const angle = Math.atan2(newY - currentY, newX - currentX) * (180 / Math.PI)
        
        const dist = Math.sqrt(Math.pow(newX - currentX, 2) + Math.pow(newY - currentY, 2))
        const duration = dist / 30

        gsap.to(thirdSat, {
          rotation: angle + 90,
          duration: 2,
          ease: 'power1.inOut'
        })

        gsap.to(thirdSat, {
          x: newX,
          y: newY,
          duration: duration,
          ease: 'power1.inOut',
          onComplete: animateThirdSat
        })
      }
      animateThirdSat()
    }

    // --- Scroll Animations ---
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
    
    tl.fromTo('.hero-badge', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, delay: 0.1 })
      .fromTo('.hero-title-line', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, stagger: 0.15 }, "-=1.2")
      .fromTo('.hero-desc', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5 }, "-=1.2")
      .fromTo('.hero-btn', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, stagger: 0.1 }, "-=1.2")
      .fromTo('.mockup-preview', { y: 100, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 2, ease: 'power4.out' }, "-=1.4")

    setTimeout(() => {
      document.querySelectorAll('.reveal-section').forEach((el) => {
        gsap.fromTo(el, 
          { y: 60, opacity: 0 },
          {
            scrollTrigger: { trigger: el as Element, start: 'top 85%' },
            y: 0, opacity: 1, duration: 1.2, ease: 'expo.out'
          }
        )
      })

      document.querySelectorAll('.stagger-grid').forEach((grid) => {
        const cards = grid.children
        gsap.fromTo(cards,
          { y: 50, opacity: 0 },
          {
            scrollTrigger: { trigger: grid, start: 'top 80%' },
            y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power3.out'
          }
        )
      })

      ScrollTrigger.refresh()
    }, 100)

    const mockup = document.querySelector('.mockup-tilt') as HTMLElement
    if (mockup) {
      mockup.addEventListener('mousemove', (e) => {
        const rect = mockup.getBoundingClientRect()
        const x = (e.clientX - rect.left - rect.width / 2) / 30
        const y = -(e.clientY - rect.top - rect.height / 2) / 30
        gsap.to(mockup, { rotateY: x, rotateX: y, duration: 0.6, ease: 'power2.out', transformPerspective: 1200 })
      })
      mockup.addEventListener('mouseleave', () => {
        gsap.to(mockup, { rotateX: 0, rotateY: 0, duration: 1, ease: 'elastic.out(1, 0.5)' })
      })
    }

    return () => { 
      ScrollTrigger.getAll().forEach(t => t.kill())
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div style={{ backgroundColor: COLORS.bg, color: COLORS.textMain, minHeight: '100svh', fontFamily: FONT_BODY, overflowX: 'hidden', position: 'relative' }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        
        .font-heading { font-family: ${FONT_HEADING}; }
        .font-body { font-family: ${FONT_BODY}; }

        .gradient-text {
          background: linear-gradient(135deg, #ffffff 0%, ${COLORS.accentSoft} 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .glass-card {
          background: ${COLORS.bgCard};
          border: 1px solid ${COLORS.border};
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.5);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }
        .glass-card::before {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.03), transparent);
          transform: skewX(-20deg);
          transition: all 0.7s ease;
        }
        .glass-card:hover::before {
          left: 150%;
        }
        .glass-card:hover {
          transform: translateY(-6px) scale(1.01);
          border-color: rgba(129, 140, 248, 0.3);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(129, 140, 248, 0.15);
        }

        .btn-glow { transition: all 0.4s ease; }
        .btn-glow:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 15px 35px rgba(255,255,255,0.2); }

        .faq-card {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid transparent;
        }
        .faq-card.open {
          background: rgba(129, 140, 248, 0.03);
          border-color: rgba(129, 140, 248, 0.2);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .faq-answer {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
          opacity: 0;
        }
        .faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
        .faq-answer-inner { overflow: hidden; }
        .faq-icon { transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), color 0.3s ease; }
        .faq-icon.open { transform: rotate(180deg); color: ${COLORS.accentSoft} !important; }

        /* 3D Transform Component for Telescope (JWST) */
        .telescope-3d {
          transform: perspective(600px) rotateX(45deg) rotateY(-15deg);
          filter: drop-shadow(10px 20px 15px rgba(0,0,0,0.6));
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>

      {/* ─── SATELLITE 1: Cursor Orbit ─── */}
      <div ref={cursorSatelliteRef} style={{ position: 'fixed', top: -24, left: -24, zIndex: 100, pointerEvents: 'none', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', width: '150%', height: '150%', background: COLORS.accentSoft, borderRadius: '50%', filter: 'blur(20px)', opacity: 0.6 }}></div>
        <Satellite size={32} color="#ffffff" style={{ position: 'relative', zIndex: 1, filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.8))' }} />
        <div style={{ position: 'absolute', right: '50%', top: '50%', width: 60, height: 2, background: `linear-gradient(to right, transparent, ${COLORS.accentSoft})`, transform: 'translateY(-50%)', opacity: 0.8 }} />
      </div>

      {/* ─── SATELLITE 2: Free Floating 3D Telescope (JWST) ─── */}
      <div ref={freeSatelliteRef} style={{ position: 'fixed', top: -32, left: -32, zIndex: 5, pointerEvents: 'none', width: 64, height: 64 }}>
        <div className="telescope-3d" style={{ width: '100%', height: '100%' }}>
          <div style={{ position: 'absolute', width: '120%', height: '120%', background: COLORS.accentSecondary, borderRadius: '50%', filter: 'blur(30px)', opacity: 0.4 }}></div>
          {/* Custom JWST SVG */}
          <svg viewBox="0 0 100 100" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', zIndex: 1, filter: 'drop-shadow(0 0 12px rgba(14,165,233,0.6))' }}>
            {/* Sunshield base (diamond layers) */}
            <path d="M50 80 L90 60 L50 40 L10 60 Z" fill="rgba(220, 200, 240, 0.4)" stroke="rgba(14,165,233,0.8)" strokeWidth="1.5" />
            <path d="M50 75 L85 57 L50 39 L15 57 Z" fill="rgba(220, 200, 240, 0.6)" stroke="rgba(14,165,233,0.9)" strokeWidth="1" />
            <path d="M50 70 L80 54 L50 38 L20 54 Z" fill="rgba(255, 255, 255, 0.9)" />
            
            {/* Mirrors (Golden hexagons) */}
            <g transform="translate(50, 35) scale(0.5)">
              <path d="M0 -20 L17.32 -10 L17.32 10 L0 20 L-17.32 10 L-17.32 -10 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
              <path d="M0 -60 L17.32 -50 L17.32 -30 L0 -20 L-17.32 -30 L-17.32 -50 Z" fill="#fcd34d" stroke="#d97706" strokeWidth="2" />
              <path d="M34.64 -40 L51.96 -30 L51.96 -10 L34.64 0 L17.32 -10 L17.32 -30 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
              <path d="M-34.64 -40 L-17.32 -30 L-17.32 -10 L-34.64 0 L-51.96 -10 L-51.96 -30 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
              <path d="M34.64 0 L51.96 10 L51.96 30 L34.64 40 L17.32 30 L17.32 10 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
              <path d="M-34.64 0 L-17.32 10 L-17.32 30 L-34.64 40 L-51.96 30 L-51.96 10 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
              <path d="M0 20 L17.32 30 L17.32 50 L0 60 L-17.32 50 L-17.32 30 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
            </g>
            
            {/* Center tower/antenna */}
            <line x1="50" y1="35" x2="50" y2="5" stroke="white" strokeWidth="2" />
            <circle cx="50" cy="5" r="3" fill="#38bdf8" />
          </svg>
        </div>
      </div>

      {/* ─── SATELLITE 3: Random Floating Drone ─── */}
      <div ref={thirdSatelliteRef} style={{ position: 'fixed', top: -20, left: -20, zIndex: 4, pointerEvents: 'none', width: 40, height: 40 }}>
        <div className="telescope-3d" style={{ width: '100%', height: '100%' }}>
          <div style={{ position: 'absolute', width: '120%', height: '120%', background: '#10b981', borderRadius: '50%', filter: 'blur(25px)', opacity: 0.4 }}></div>
          {/* Custom Futuristic Probe/Satellite SVG */}
          <svg viewBox="0 0 100 100" width="50" height="50" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', zIndex: 1, filter: 'drop-shadow(0 0 12px rgba(16,185,129,0.6))' }}>
            {/* Left Solar Panel */}
            <rect x="5" y="40" width="30" height="20" fill="rgba(16,185,129,0.2)" stroke="#34d399" strokeWidth="1.5" rx="2" />
            <line x1="15" y1="40" x2="15" y2="60" stroke="#34d399" strokeWidth="1" />
            <line x1="25" y1="40" x2="25" y2="60" stroke="#34d399" strokeWidth="1" />
            <line x1="5" y1="50" x2="35" y2="50" stroke="#34d399" strokeWidth="1" />

            {/* Right Solar Panel */}
            <rect x="65" y="40" width="30" height="20" fill="rgba(16,185,129,0.2)" stroke="#34d399" strokeWidth="1.5" rx="2" />
            <line x1="75" y1="40" x2="75" y2="60" stroke="#34d399" strokeWidth="1" />
            <line x1="85" y1="40" x2="85" y2="60" stroke="#34d399" strokeWidth="1" />
            <line x1="65" y1="50" x2="95" y2="50" stroke="#34d399" strokeWidth="1" />

            {/* Connecting Arms */}
            <line x1="35" y1="50" x2="42" y2="50" stroke="#94a3b8" strokeWidth="3" />
            <line x1="58" y1="50" x2="65" y2="50" stroke="#94a3b8" strokeWidth="3" />

            {/* Core Body */}
            <rect x="42" y="30" width="16" height="40" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" rx="4" />
            <circle cx="50" cy="40" r="4" fill="#6ee7b7" />
            <circle cx="50" cy="55" r="3" fill="#10b981" />

            {/* Top Antenna */}
            <line x1="50" y1="30" x2="50" y2="10" stroke="#cbd5e1" strokeWidth="2" />
            <path d="M40 10 Q50 0 60 10" fill="none" stroke="#6ee7b7" strokeWidth="1.5" />
            <circle cx="50" cy="10" r="2" fill="#34d399" />

            {/* Bottom Thruster */}
            <path d="M44 70 L46 80 L54 80 L56 70 Z" fill="#64748b" />
            <path d="M47 80 L50 90 L53 80 Z" fill="#10b981" opacity="0.8" />
          </svg>
        </div>
      </div>

      {/* ─── DYNAMIC BACKGROUND ─── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '32px 32px', maskImage: 'radial-gradient(ellipse at center 40%, black 10%, transparent 80%)', WebkitMaskImage: 'radial-gradient(ellipse at center 40%, black 10%, transparent 80%)' }} />
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(129,140,248,0.05) 0%, transparent 60%)', filter: 'blur(80px)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10 }}>
        
        {/* ══════════════════════════════════════
            HERO SECTION
        ══════════════════════════════════════ */}
        <section style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '160px', paddingBottom: '80px', position: 'relative' }}>
          
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            
            <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 24px', borderRadius: 999, border: `1px solid ${COLORS.border}`, background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)', marginBottom: 32 }}>
              <Sparkles size={14} color={COLORS.accentSoft} />
              <span className="font-heading" style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.08em', color: '#cbd5e1', textTransform: 'uppercase' }}>Jaringan Astronomi Nusantara</span>
            </div>

            <h1 className="font-heading" style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 32 }}>
              <div className="hero-title-line">Gerbang Menuju</div>
              <div className="hero-title-line gradient-text">Alam Semesta.</div>
            </h1>

            <p className="hero-desc font-body" style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: COLORS.textMuted, maxWidth: 650, margin: '0 auto 50px', lineHeight: 1.7 }}>
              StellarHub menghubungkan Anda dengan data NASA secara real-time. Temukan, simpan, dan diskusikan keajaiban kosmik bersama komunitas astronomi terbesar di Indonesia.
            </p>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '80px' }}>
              <Link href={user ? '/feed' : '/register'} className="hero-btn btn-glow font-heading" style={{
                display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 36px', borderRadius: 14,
                background: COLORS.textMain, color: '#000', fontSize: 16, fontWeight: 600, textDecoration: 'none'
              }}>
                {user ? 'Buka Dashboard' : 'Mulai Jelajah'} <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {/* Feed Mockup Preview */}
          <div className="mockup-preview mockup-tilt" style={{ width: '100%', maxWidth: 1000, margin: '0 24px', borderRadius: 24, background: 'rgba(10,12,20,0.8)', border: `1px solid ${COLORS.border}`, backdropFilter: 'blur(30px)', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)', overflow: 'hidden', transformStyle: 'preserve-3d', willChange: 'transform' }}>
            <div style={{ padding: '16px 24px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444', opacity: 0.5 }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#eab308', opacity: 0.5 }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e', opacity: 0.5 }} />
              </div>
              <div style={{ margin: '0 auto', fontSize: 12, color: COLORS.textMuted, fontWeight: 500, fontFamily: 'monospace', padding: '4px 16px', borderRadius: 6, background: 'rgba(255,255,255,0.03)' }}>
                stellarhub.id/feed
              </div>
              <div style={{ width: 42 }} />
            </div>

            <div style={{ padding: '32px', display: 'flex', gap: 24, background: 'linear-gradient(to bottom, rgba(255,255,255,0.01), transparent)' }}>
              <div style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 12, borderRight: `1px solid ${COLORS.border}`, paddingRight: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <Logo size={24} /> <span className="font-heading" style={{ fontWeight: 600 }}>StellarHub</span>
                </div>
                {[1,2,3].map(i => (
                  <div key={i} style={{ height: 40, borderRadius: 10, background: i === 1 ? 'rgba(255,255,255,0.08)' : 'transparent', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 12 }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, background: i === 1 ? '#fff' : 'rgba(255,255,255,0.2)' }} />
                    <div style={{ height: 8, width: i === 1 ? 80 : 60, borderRadius: 4, background: i === 1 ? '#fff' : 'rgba(255,255,255,0.2)' }} />
                  </div>
                ))}
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ padding: 24, borderRadius: 16, border: `1px solid ${COLORS.border}`, background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${COLORS.accentSoft}, #3b82f6)` }} />
                    <div>
                      <div style={{ width: 120, height: 12, borderRadius: 4, background: 'rgba(255,255,255,0.8)', marginBottom: 8 }} />
                      <div style={{ width: 80, height: 10, borderRadius: 4, background: COLORS.textMuted }} />
                    </div>
                  </div>
                  <div style={{ height: 220, borderRadius: 12, background: 'url(https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=800) center/cover', border: `1px solid ${COLORS.border}`, marginBottom: 16 }} />
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ width: 80, height: 32, borderRadius: 16, background: 'rgba(255,255,255,0.05)' }} />
                    <div style={{ width: 60, height: 32, borderRadius: 16, background: 'rgba(255,255,255,0.05)' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            STATS SHOWCASE
        ══════════════════════════════════════ */}
        <section className="reveal-section" style={{ padding: '80px 24px 100px' }}>
          <div className="stagger-grid" style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
            {STATS.map((s, i) => (
              <div key={i} className="glass-card" style={{ padding: '32px 24px', borderRadius: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`, opacity: 0.6 }} />
                
                <div style={{ width: 56, height: 56, borderRadius: 16, background: `linear-gradient(135deg, ${s.color}22, transparent)`, border: `1px solid ${s.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <s.icon size={24} color={s.color} />
                </div>
                <h4 className="font-heading" style={{ fontSize: '2.2rem', fontWeight: 700, color: COLORS.textMain, lineHeight: 1, marginBottom: 8 }}>{s.val}</h4>
                <p className="font-body" style={{ color: COLORS.textMuted, fontSize: '1rem', fontWeight: 500 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════
            MODULE EXPLANATION
        ══════════════════════════════════════ */}
        <section style={{ padding: '100px 24px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.01), transparent)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div className="reveal-section" style={{ textAlign: 'center', marginBottom: 80 }}>
              <span className="font-heading" style={{ color: COLORS.accentSoft, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: 13 }}>Ekosistem StellarHub</span>
              <h2 className="font-heading" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', fontWeight: 800, marginTop: 12, marginBottom: 20, lineHeight: 1.1 }}>
                Jelajahi Setiap <span className="gradient-text">Sudut Galaksi.</span>
              </h2>
              <p className="font-body" style={{ color: COLORS.textMuted, fontSize: '1.1rem', maxWidth: 650, margin: '0 auto' }}>StellarHub bukan sekadar website gambar. Kami membangun beberapa modul terpisah untuk memenuhi semua kebutuhan eksplorasi Anda.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 60 }}>
              {MODULES.map((mod, i) => (
                <div key={i} className="reveal-section" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 40, flexDirection: i % 2 !== 0 ? 'row-reverse' : 'row' }}>
                  
                  <div style={{ flex: '1 1 400px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg, ${mod.color}22, transparent)`, border: `1px solid ${mod.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <mod.icon size={20} color={mod.color} />
                      </div>
                      <div>
                        <span className="font-heading" style={{ color: mod.color, fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{mod.subtitle}</span>
                        <h3 className="font-heading" style={{ fontSize: '2rem', fontWeight: 700 }}>{mod.title}</h3>
                      </div>
                    </div>
                    <p className="font-body" style={{ color: COLORS.textMuted, fontSize: '1.1rem', lineHeight: 1.7 }}>{mod.desc}</p>
                    <ul style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12, listStyle: 'none', padding: 0 }}>
                      {[1,2].map(li => (
                         <li key={li} style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#e2e8f0', fontSize: '1.05rem' }}>
                           <div style={{ width: 6, height: 6, borderRadius: '50%', background: mod.color }}></div> 
                           {li === 1 ? 'Integrasi data mulus 24/7' : 'Desain antarmuka responsif'}
                         </li>
                      ))}
                    </ul>
                  </div>

                  <div className="glass-card" style={{ flex: '1 1 500px', height: 400, borderRadius: 32, background: mod.mockupBg, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}></div>
                    <div style={{ position: 'absolute', bottom: 30, left: 30, right: 30, padding: 24, borderRadius: 20, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: mod.color, boxShadow: `0 0 10px ${mod.color}` }}></div>
                        <span className="font-body" style={{ fontWeight: 600, color: '#fff', fontSize: '1rem' }}>Modul Aktif</span>
                      </div>
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            FEATURES GRID
        ══════════════════════════════════════ */}
        <section style={{ padding: '80px 24px' }} className="reveal-section">
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 70 }}>
              <span className="font-heading" style={{ color: COLORS.accentSoft, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: 13 }}>Teknologi Inti</span>
              <h2 className="font-heading" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', fontWeight: 800, marginTop: 12, marginBottom: 20, lineHeight: 1.1 }}>
                Infrastruktur <span className="gradient-text">Tangguh.</span>
              </h2>
            </div>

            <div className="stagger-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
              {FEATURES.map((f, i) => (
                <div key={i} className="glass-card" style={{ borderRadius: 28, padding: 40, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 2, background: `linear-gradient(90deg, transparent, ${f.color}, transparent)`, opacity: 0.5 }} />
                  <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100px', height: '100px', background: f.color, filter: 'blur(50px)', opacity: 0.15, pointerEvents: 'none' }} />
                  
                  <div style={{ width: 64, height: 64, borderRadius: 18, background: `linear-gradient(135deg, ${f.color}22, transparent)`, border: `1px solid ${f.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                    <f.icon size={28} color={f.color} />
                  </div>
                  <h3 className="font-heading" style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 12 }}>{f.title}</h3>
                  <p className="font-body" style={{ color: COLORS.textMuted, fontSize: '1.05rem', lineHeight: 1.6, flex: 1 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            HOW IT WORKS
        ══════════════════════════════════════ */}
        <section style={{ padding: '100px 24px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.015), transparent)' }} className="reveal-section">
          <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 60, alignItems: 'center' }}>
            <div style={{ flex: '1 1 400px' }}>
              <span className="font-heading" style={{ color: COLORS.accentSoft, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: 13 }}>Cara Kerja</span>
              <h2 className="font-heading" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', fontWeight: 800, marginTop: 12, marginBottom: 20, lineHeight: 1.1 }}>
                Tiga Langkah <br/><span className="gradient-text">Sederhana.</span>
              </h2>
              <p className="font-body" style={{ color: COLORS.textMuted, fontSize: '1.1rem', marginBottom: 40, lineHeight: 1.6 }}>
                Proses pendaftaran kurang dari satu menit. Akses seluruh data secara gratis seumur hidup.
              </p>
              
              <div className="stagger-grid" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {STEPS.map((s, i) => (
                  <div key={i} className="glass-card" style={{ padding: 24, borderRadius: 24, display: 'flex', gap: 20 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: `linear-gradient(135deg, ${COLORS.accentSoft}22, transparent)`, border: `1px solid ${COLORS.accentSoft}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <s.icon size={24} color={COLORS.accentSoft} />
                    </div>
                    <div>
                      <h4 className="font-heading" style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: COLORS.accentSoft, fontSize: '1rem', fontWeight: 600 }}>{s.n}</span> {s.title}
                      </h4>
                      <p className="font-body" style={{ color: COLORS.textMuted, lineHeight: 1.6, fontSize: '0.95rem' }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            FAQ SECTION
        ══════════════════════════════════════ */}
        <section style={{ padding: '100px 24px' }} className="reveal-section">
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 20px', borderRadius: 999, border: `1px solid ${COLORS.border}`, background: 'rgba(255,255,255,0.02)', marginBottom: 20 }}>
                <MessageCircle size={13} color={COLORS.accentSoft} />
                <span className="font-heading" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', color: '#cbd5e1', textTransform: 'uppercase' }}>Pertanyaan Umum</span>
              </div>
              <h2 className="font-heading" style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 800, marginBottom: 16, lineHeight: 1.1 }}>
                Ada Pertanyaan? <span className="gradient-text">Kami Jawab.</span>
              </h2>
              <p className="font-body" style={{ color: COLORS.textMuted, fontSize: '1.05rem', maxWidth: 480, margin: '0 auto' }}>
                Temukan jawaban dari pertanyaan yang paling sering ditanyakan tentang StellarHub.
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {FAQS.map((faq, i) => (
                <div key={i} className={`glass-card faq-card ${openFaq === i ? 'open' : ''}`} style={{ borderRadius: 22, overflow: 'hidden' }}>
                  <button 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ width: '100%', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: COLORS.textMain, gap: 16 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                      {/* FAQ icon badge */}
                      <div style={{
                        width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                        background: `linear-gradient(135deg, ${faq.color}22, ${faq.color}08)`,
                        border: `1px solid ${faq.color}33`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        boxShadow: openFaq === i ? `0 0 16px ${faq.color}33` : 'none',
                        transform: openFaq === i ? 'scale(1.08)' : 'scale(1)',
                      }}>
                        <faq.icon size={16} color={openFaq === i ? faq.color : COLORS.textMuted} />
                      </div>
                      <span className="font-heading" style={{ fontSize: '1.08rem', fontWeight: 600, lineHeight: 1.4 }}>{faq.q}</span>
                    </div>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: openFaq === i ? `${faq.color}22` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${openFaq === i ? faq.color + '44' : 'rgba(255,255,255,0.08)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.3s',
                    }}>
                      <ChevronDown
                        className={`faq-icon ${openFaq === i ? 'open' : ''}`}
                        size={14}
                        color={openFaq === i ? faq.color : COLORS.textMuted}
                      />
                    </div>
                  </button>
                  <div className={`faq-answer ${openFaq === i ? 'open' : ''}`}>
                    <div className="faq-answer-inner" style={{ padding: '0 28px 22px 80px', color: COLORS.textMuted, lineHeight: 1.75, fontSize: '1rem' }}>
                      {faq.a}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            GRAND CTA
        ══════════════════════════════════════ */}
        <section style={{ padding: '80px 24px 160px', textAlign: 'center', position: 'relative' }} className="reveal-section">
          <div className="glass-card" style={{ maxWidth: 700, margin: '0 auto', position: 'relative', zIndex: 1, padding: '70px 40px', borderRadius: 36, boxShadow: '0 30px 60px rgba(0,0,0,0.6)', overflow: 'visible' }}>
            {/* Glow blob behind card */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: 36, background: 'linear-gradient(135deg, rgba(129,140,248,0.06), rgba(56,189,248,0.04))', pointerEvents: 'none' }} />
            {/* Logo — with extra padding to not clip */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28, padding: '4px 0' }}>
              <Logo size={72} glow className="text-white" />
            </div>
            <h2 className="font-heading" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 20, lineHeight: 1.1 }}>
              Mulai Petualangan <br/><span className="gradient-text">Sekarang.</span>
            </h2>
            <p className="font-body" style={{ color: COLORS.textMuted, fontSize: '1.15rem', marginBottom: 40, lineHeight: 1.6, maxWidth: 500, margin: '0 auto 40px' }}>
              Bergabunglah secara gratis dan mulai akses feed NASA hari ini juga.
            </p>
            <Link href={user ? '/feed' : '/register'} className="btn-glow font-heading" style={{ 
              display: 'inline-flex', alignItems: 'center', gap: 12, padding: '18px 44px', borderRadius: 16, 
              background: COLORS.textMain, color: '#000', fontSize: '1.15rem', fontWeight: 600, textDecoration: 'none'
            }}>
              Daftar Gratis <Rocket size={20} />
            </Link>
          </div>
        </section>

        {/* ══════════════════════════════════════
            FOOTER
        ══════════════════════════════════════ */}
        <footer style={{ padding: '60px 24px 40px', borderTop: `1px solid ${COLORS.border}`, background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 40 }}>
            <div style={{ maxWidth: 300 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <Logo size={28} />
                <span className="font-heading" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: COLORS.textMain }}>StellarHub</span>
              </div>
              <p className="font-body" style={{ color: COLORS.textMuted, lineHeight: 1.6, fontSize: '0.95rem' }}>Platform komunitas astronomi Indonesia. Mengeksplorasi luar angkasa bersama-sama.</p>
            </div>
            
            <div style={{ display: 'flex', gap: 60, flexWrap: 'wrap' }}>
              <div>
                <h4 className="font-heading" style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: COLORS.textMain }}>Platform</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, color: COLORS.textMuted }} className="font-body">
                  <Link href="#" style={{ textDecoration: 'none', color: 'inherit', fontSize: '0.95rem' }}>Beranda</Link>
                  <Link href="#" style={{ textDecoration: 'none', color: 'inherit', fontSize: '0.95rem' }}>Feed</Link>
                  <Link href="#" style={{ textDecoration: 'none', color: 'inherit', fontSize: '0.95rem' }}>Event</Link>
                </div>
              </div>
              <div>
                <h4 className="font-heading" style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: COLORS.textMain }}>Legal</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, color: COLORS.textMuted }} className="font-body">
                  <Link href="#" style={{ textDecoration: 'none', color: 'inherit', fontSize: '0.95rem' }}>Kebijakan Privasi</Link>
                  <Link href="#" style={{ textDecoration: 'none', color: 'inherit', fontSize: '0.95rem' }}>Syarat Ketentuan</Link>
                </div>
              </div>
            </div>
          </div>
          <div style={{ maxWidth: 1200, margin: '40px auto 0', paddingTop: 30, borderTop: `1px solid ${COLORS.border}`, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
            <p className="font-body" style={{ color: COLORS.textMuted, fontSize: 13 }}>© {new Date().getFullYear()} StellarHub. Dibuat di Indonesia.</p>
            <div style={{ display: 'flex', gap: 16, color: COLORS.textMuted }}>
              <Github size={18} style={{ cursor: 'pointer' }} />
              <Twitter size={18} style={{ cursor: 'pointer' }} />
              <Instagram size={18} style={{ cursor: 'pointer' }} />
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}