'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import * as Tooltip from '@radix-ui/react-tooltip'
import * as HoverCard from '@radix-ui/react-hover-card'
import {
  Rocket, Satellite, Star, Users, ArrowRight, Globe, Heart,
  Bookmark, Zap, ChevronRight, Play, Camera, Newspaper, Share2,
  Sparkles, Eye, Radio, Mail, MapPin, Send, MessageCircle,
  Github, Twitter, Instagram, Shield, Cpu, Award, Wifi, Telescope,
} from 'lucide-react'

/* ── seeded star positions ── */
function seededRand(s: number) {
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff }
}
const rand = seededRand(42)
const STARS = Array.from({ length: 200 }, (_, i) => ({
  id: i,
  x: rand() * 100, y: rand() * 100,
  sz: rand() * 2.2 + 0.5,
  dl: rand() * 8, dr: rand() * 4 + 3,
  op: rand() * 0.7 + 0.15,
}))

const FEATURES = [
  {
    icon: Camera, title: 'NASA Live Imagery',
    desc: 'Foto luar angkasa terbaru dari NASA APOD langsung di feed kamu setiap hari.',
    accent: '#a78bfa', accentBg: 'rgba(167,139,250,0.1)', accentBorder: 'rgba(167,139,250,0.2)',
    tag: 'Live Data', glow: 'rgba(139,92,246,0.12)', stripe: '#7c6ef5',
    points: ['APOD harian otomatis', 'Mars Rover real-time', 'Resolusi penuh NASA'],
  },
  {
    icon: Newspaper, title: 'Buat & Bagikan Post',
    desc: 'Tulis caption, tempel URL gambar, dan bagikan penemuan kosmis ke komunitas global.',
    accent: '#818cf8', accentBg: 'rgba(129,140,248,0.1)', accentBorder: 'rgba(129,140,248,0.2)',
    tag: 'Social', glow: 'rgba(99,102,241,0.12)', stripe: '#6366f1',
    points: ['Editor post intuitif', 'Tag lokasi & kategori', 'Jadwal posting'],
  },
  {
    icon: Heart, title: 'Like & Koleksi',
    desc: 'Klik suka pada postingan inspiratif dan simpan ke koleksi pribadi.',
    accent: '#f472b6', accentBg: 'rgba(244,114,182,0.1)', accentBorder: 'rgba(244,114,182,0.2)',
    tag: 'Engagement', glow: 'rgba(236,72,153,0.1)', stripe: '#ec4899',
    points: ['Animasi like interaktif', 'Koleksi terorganisir', 'Notifikasi real-time'],
  },
  {
    icon: Radio, title: 'Feed Dinamis Real-time',
    desc: 'Feed bertenaga Supabase yang terus diperbarui tanpa reload halaman.',
    accent: '#34d399', accentBg: 'rgba(52,211,153,0.1)', accentBorder: 'rgba(52,211,153,0.2)',
    tag: 'Real-time', glow: 'rgba(16,185,129,0.1)', stripe: '#10b981',
    points: ['Update tanpa reload', 'Filter & sort canggih', 'Infinite scroll'],
  },
]

const STATS = [
  { val: '150K+', label: 'Penjelajah', icon: Users,     accent: '#a78bfa' },
  { val: '25M+',  label: 'Observasi',  icon: Eye,       accent: '#818cf8' },
  { val: '180+',  label: 'Negara',     icon: Globe,     accent: '#34d399' },
  { val: '24/7',  label: 'Live Feed',  icon: Satellite, accent: '#f472b6' },
]

const STEPS = [
  { n: '01', label: 'Daftar Gratis',         icon: Rocket,    accent: '#a78bfa', detail: 'Buat akun dalam 30 detik. Tidak perlu kartu kredit. Langsung aktif menjelajah jagat raya bersama ribuan astronomer amatir.' },
  { n: '02', label: 'Jelajahi Alam Semesta', icon: Telescope, accent: '#818cf8', detail: 'Temukan foto menakjubkan dari NASA, lihat postingan komunitas global, nikmati konten luar angkasa terkini setiap harinya.' },
  { n: '03', label: 'Bagikan Penemuanmu',    icon: Share2,    accent: '#34d399', detail: 'Post penemuanmu, like konten terbaik, simpan ke koleksi, dan bangun koneksi dengan sesama pecinta luar angkasa.' },
]

const TRUST = [
  { icon: Shield, title: 'Aman & Terpercaya', desc: 'Enkripsi end-to-end pada semua data.' },
  { icon: Cpu,    title: 'Bertenaga AI',       desc: 'Rekomendasi konten cerdas & personal.' },
  { icon: Wifi,   title: 'Uptime 99.9%',       desc: 'Infrastruktur cloud global.' },
  { icon: Award,  title: 'Komunitas #1',        desc: 'Platform astronomi terbesar Asia.' },
]

const TESTI = [
  { n: 'Reza Firmansyah', r: 'Astronom Amatir · Bandung',            av: 'R', c: '#7c3aed', t: 'StellarHub mengubah cara saya menikmati astronomi. Feed NASA harian-nya luar biasa — setiap pagi selalu ada foto galaksi baru yang benar-benar memukau.' },
  { n: 'Siti Nuraini',    r: 'Fotografer Langit Malam · Yogyakarta', av: 'S', c: '#4f46e5', t: 'Platform terbaik untuk berbagi foto langit malam saya. Komunitas di sini sangat supportif dan antusias. Sudah 3 bulan aktif!' },
  { n: 'Dimas Pratama',   r: 'Mahasiswa Fisika · Surabaya',          av: 'D', c: '#0ea5e9', t: 'Sebagai mahasiswa fisika, StellarHub jadi referensi harian. Data Mars Rover langsung dari NASA tersaji dengan visual yang keren.' },
]

/* shared inline style helpers */
const FD = "'Clash Display', system-ui, sans-serif"
const FB = "'Cabinet Grotesk', system-ui, sans-serif"
const FM = "'JetBrains Mono', monospace"

export default function StellarHubLanding() {
  const [user, setUser]       = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [form, setForm]       = useState({ name: '', email: '', message: '' })
  const [sent, setSent]       = useState(false)
  const gsapLoaded            = useRef(false)

  /* GSAP init */
  useEffect(() => {
    if (gsapLoaded.current) return
    gsapLoaded.current = true
    const load = (src: string) => new Promise<void>(res => {
      if (document.querySelector(`script[src="${src}"]`)) return res()
      const s = document.createElement('script'); s.src = src; s.onload = () => res(); document.head.appendChild(s)
    })
    Promise.all([
      load('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js'),
      load('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js'),
    ]).then(() => {
      const { gsap, ScrollTrigger } = window as any
      gsap.registerPlugin(ScrollTrigger)

      gsap.set('.hero-content', { autoAlpha: 1 })
      gsap.timeline({ defaults: { ease: 'expo.out' } })
        .from('.h-badge',   { autoAlpha: 0, y: 20, duration: 0.7, delay: 0.15 })
        .from('.h-t1',      { autoAlpha: 0, y: 80, skewY: 3, duration: 1.1 }, '-=0.35')
        .from('.h-t2',      { autoAlpha: 0, y: 80, skewY: 3, duration: 1.1 }, '-=0.95')
        .from('.h-sub',     { autoAlpha: 0, y: 28, duration: 0.75 }, '-=0.7')
        .from('.h-cta > *', { autoAlpha: 0, y: 22, stagger: 0.1, duration: 0.65 }, '-=0.5')
        .from('.stat-card', { autoAlpha: 0, y: 36, scale: 0.9, stagger: 0.07, duration: 0.75, ease: 'back.out(1.6)' }, '-=0.4')

      document.querySelectorAll('[data-reveal]').forEach((el: any) => {
        gsap.from(el, {
          autoAlpha: 0, y: 44, duration: 0.85, ease: 'power3.out',
          delay: parseFloat(el.dataset.delay || '0'),
          scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none none' },
        })
      })

      /* 3D tilt on feature cards */
      document.querySelectorAll('.feat-card').forEach((card: any) => {
        card.addEventListener('mousemove', (e: any) => {
          const r = card.getBoundingClientRect()
          const x = (e.clientX - r.left - r.width / 2) / r.width
          const y = (e.clientY - r.top - r.height / 2) / r.height
          gsap.to(card, { rotateY: x * 10, rotateX: -y * 10, duration: 0.4, ease: 'power2.out', transformPerspective: 1000 })
        })
        card.addEventListener('mouseleave', () => {
          gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.65, ease: 'elastic.out(1,0.5)' })
        })
      })

      /* count-up */
      document.querySelectorAll('[data-count]').forEach((el: any) => {
        const raw = el.dataset.count
        const num = parseFloat(raw.replace(/[^0-9.]/g, ''))
        const suf = raw.replace(/[0-9.]/g, '')
        const obj = { v: 0 }
        gsap.to(obj, {
          v: num, duration: 2.2, ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(obj.v) + suf },
          scrollTrigger: { trigger: el, start: 'top 93%', once: true },
        })
      })

      /* NASA orb rings */
      gsap.to('.ring-a', { rotation: 360,  duration: 18, ease: 'none', repeat: -1, transformOrigin: '50% 50%' })
      gsap.to('.ring-b', { rotation: -360, duration: 11, ease: 'none', repeat: -1, transformOrigin: '50% 50%' })
      gsap.to('.ring-c', { rotation: 360,  duration: 30, ease: 'none', repeat: -1, transformOrigin: '50% 50%' })

      /* floating dots */
      document.querySelectorAll('.float-dot').forEach((d: any, i) => {
        gsap.to(d, { y: -(18 + i * 7), x: (i % 2 ? 1 : -1) * (5 + i * 3), duration: 2.8 + i * 0.4, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: i * 0.35 })
      })
    })
  }, [])

  /* session */
  useEffect(() => {
    setMounted(true)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return
      supabase.from('profiles').select('*').eq('id', session.user.id).single()
        .then(({ data }) => { if (data) setUser(data) })
    })
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true); setForm({ name: '', email: '', message: '' })
    setTimeout(() => setSent(false), 5000)
  }

  return (
    <Tooltip.Provider delayDuration={250}>
      <div style={{ position: 'relative', minHeight: '100svh', overflowX: 'hidden' }}>

        {/* ══ BACKGROUND ══ */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'linear-gradient(148deg,#0e0b1f 0%,#07050f 55%,#0a0817 100%)', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 55% at 12% 8%, rgba(100,75,230,0.2) 0%,transparent 65%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 40% at 90% 85%, rgba(56,189,248,0.09) 0%,transparent 60%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 45% 40% at 55% 48%, rgba(236,72,153,0.05) 0%,transparent 65%)' }} />
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.022) 1px,transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 85% 80% at 50% 15%,black 30%,transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 85% 80% at 50% 15%,black 30%,transparent 100%)',
          }} />
          {mounted && STARS.map(s => (
            <span key={s.id} style={{
              position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
              width: s.sz, height: s.sz, borderRadius: '50%', background: 'white', opacity: s.op,
              animation: `stTwinkle ${s.dr}s ease-in-out ${s.dl}s infinite`,
            }} />
          ))}
        </div>

        <style>{`
          @keyframes stTwinkle{0%,100%{opacity:.1;transform:scale(1)}50%{opacity:.9;transform:scale(1.6)}}
          @keyframes stTextShimmer{0%,100%{background-position:0% center}50%{background-position:100% center}}
          @keyframes stPulseDot{0%,100%{box-shadow:0 0 0 2px rgba(52,211,153,.18)}50%{box-shadow:0 0 0 7px rgba(52,211,153,0)}}
          @keyframes stLineSlide{0%,100%{opacity:.2;transform:scaleY(.4)}50%{opacity:1;transform:scaleY(1)}}
          @keyframes stFadeUp{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:none}}

          .hero-content{visibility:hidden}

          .text-gs{
            background:linear-gradient(110deg,#ddd6fe 0%,#a78bfa 25%,#818cf8 50%,#c084fc 75%,#f0abfc 90%,#ddd6fe 100%);
            background-size:260% auto;
            -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
            animation:stTextShimmer 10s ease infinite;
          }

          /* shimmer sweep button */
          .btn-sw{position:relative;overflow:hidden;}
          .btn-sw::after{content:'';position:absolute;top:0;left:-100%;width:50%;height:100%;
            background:linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent);
            transition:left .55s ease;}
          .btn-sw:hover::after{left:160%;}

          /* card hovers */
          .feat-card{
            transition:border-color .3s,box-shadow .3s;
            transform-style:preserve-3d;will-change:transform;
          }
          .feat-card:hover{
            border-color:rgba(167,139,250,.28)!important;
            box-shadow:0 0 0 1px rgba(255,255,255,.03),0 22px 60px rgba(0,0,0,.42)!important;
          }
          .step-card{transition:transform .3s cubic-bezier(.175,.885,.32,1.275),border-color .3s,box-shadow .3s;}
          .step-card:hover{transform:translateY(-8px) rotate(.4deg);border-color:rgba(167,139,250,.26)!important;box-shadow:0 20px 55px rgba(0,0,0,.38)!important;}
          .testi-card{transition:transform .3s cubic-bezier(.175,.885,.32,1.275),border-color .3s;}
          .testi-card:hover{transform:translateY(-6px);border-color:rgba(167,139,250,.26)!important;}
          .trust-tile{transition:transform .25s cubic-bezier(.175,.885,.32,1.275),border-color .25s;}
          .trust-tile:hover{transform:translateY(-6px) scale(1.04);border-color:rgba(167,139,250,.28)!important;}
          .contact-lnk{transition:transform .25s cubic-bezier(.175,.885,.32,1.275),border-color .25s,box-shadow .25s;}
          .contact-lnk:hover{transform:translateX(6px);border-color:rgba(167,139,250,.3)!important;box-shadow:0 8px 28px rgba(124,110,245,.1)!important;}
          .soc-btn{transition:transform .2s cubic-bezier(.175,.885,.32,1.275),background .2s,border-color .2s;}
          .soc-btn:hover{transform:translateY(-4px) scale(1.1);background:rgba(124,110,245,.12)!important;border-color:rgba(167,139,250,.32)!important;}
          .stat-card{transition:transform .3s cubic-bezier(.175,.885,.32,1.275),border-color .3s;}
          .stat-card:hover{transform:translateY(-6px) scale(1.06);border-color:rgba(167,139,250,.28)!important;}

          /* Radix Tooltip */
          .rt-TooltipContent{
            background:rgba(18,12,34,.92)!important;border:1px solid rgba(167,139,250,.18)!important;
            backdrop-filter:blur(16px)!important;color:rgba(220,215,255,.88)!important;
            font-size:12px!important;font-family:${FM}!important;
            border-radius:10px!important;padding:7px 13px!important;
            animation:stFadeUp .16s ease!important;
          }
          /* Radix HoverCard */
          .rt-HoverCardContent{
            background:rgba(14,9,28,.94)!important;border:1px solid rgba(167,139,250,.16)!important;
            backdrop-filter:blur(28px)!important;border-radius:18px!important;padding:18px!important;
            animation:stFadeUp .18s ease!important;box-shadow:0 24px 60px rgba(0,0,0,.48)!important;
          }

          /* nav link underline */
          .nav-lnk{position:relative;color:rgba(220,215,255,.5);text-decoration:none;font-family:${FB};font-size:.85rem;font-weight:500;transition:color .2s;}
          .nav-lnk::after{content:'';position:absolute;bottom:-2px;left:0;right:0;height:1px;background:rgba(167,139,250,.6);transform:scaleX(0);transition:transform .25s ease;}
          .nav-lnk:hover{color:rgba(220,215,255,.9);}
          .nav-lnk:hover::after{transform:scaleX(1);}
        `}</style>

        {/* ══════════════════════════════════════
            HERO
        ══════════════════════════════════════ */}
        <section style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(100px,14vw,150px) 24px clamp(80px,10vw,120px)', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <div className="hero-content">

            {/* badge */}
            <div className="h-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '7px 18px', borderRadius: 100, marginBottom: 44, background: 'rgba(124,110,245,.08)', border: '1px solid rgba(124,110,245,.2)', backdropFilter: 'blur(12px)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 0 3px rgba(52,211,153,.2)', animation: 'stPulseDot 2s ease-in-out infinite' }} />
              <span style={{ fontFamily: FM, fontSize: 10, fontWeight: 500, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(196,181,253,.8)' }}>
                Live · NASA APIs · Space Community
              </span>
            </div>

            {/* title */}
            <h1 style={{ fontFamily: FD, fontSize: 'clamp(4rem,11vw,10rem)', fontWeight: 800, lineHeight: .9, letterSpacing: '-.04em', marginBottom: 28 }}>
              <span className="h-t1" style={{ display: 'block', color: '#f0eeff' }}>Jelajahi</span>
              <span className="h-t2 text-gs" style={{ display: 'block' }}>Alam Semesta</span>
            </h1>

            <p className="h-sub" style={{ fontFamily: FB, fontSize: 'clamp(.95rem,1.8vw,1.12rem)', color: 'rgba(220,215,255,.58)', maxWidth: 520, margin: '0 auto clamp(36px,5vw,52px)', lineHeight: 1.82, fontWeight: 400 }}>
              StellarHub — platform komunitas luar angkasa. Foto NASA langsung, posting penemuan, dan terhubung dengan ribuan pecinta antariksa di seluruh dunia.
            </p>

            {/* CTAs */}
            <div className="h-cta" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 'clamp(52px,8vw,88px)' }}>
              <Link href={user ? '/feed' : '/register'} className="btn-sw" style={{
                display: 'inline-flex', alignItems: 'center', gap: 9, padding: '14px 34px', borderRadius: 14,
                fontFamily: FD, fontSize: '.9rem', fontWeight: 700, color: '#fff', textDecoration: 'none',
                background: 'linear-gradient(135deg,#7c6ef5 0%,#4f46e5 100%)',
                border: '1px solid rgba(255,255,255,.1)',
                boxShadow: '0 0 0 1px rgba(124,110,245,.2),0 5px 26px rgba(79,70,229,.4),inset 0 1px 0 rgba(255,255,255,.12)',
                transition: 'transform .2s cubic-bezier(.175,.885,.32,1.275),box-shadow .25s',
              }}>
                <Rocket style={{ width: 15, height: 15 }} />
                {user ? 'Buka Feed' : 'Mulai Gratis'}
                <ArrowRight style={{ width: 14, height: 14 }} />
              </Link>
              <Link href="/explore" style={{
                display: 'inline-flex', alignItems: 'center', gap: 9, padding: '14px 26px', borderRadius: 14,
                fontFamily: FD, fontSize: '.9rem', fontWeight: 600, color: 'rgba(220,215,255,.68)',
                background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', backdropFilter: 'blur(12px)',
                textDecoration: 'none', transition: 'transform .2s cubic-bezier(.175,.885,.32,1.275),background .2s,color .2s',
              }}>
                <span style={{ width: 25, height: 25, borderRadius: '50%', background: 'rgba(255,255,255,.09)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Play style={{ width: 8, height: 8, marginLeft: 1 }} />
                </span>
                Jelajahi
              </Link>
            </div>

            {/* stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 11, maxWidth: 620, margin: '0 auto' }}>
              {STATS.map((s, i) => (
                <Tooltip.Root key={i}>
                  <Tooltip.Trigger asChild>
                    <div className="stat-card" style={{ padding: '17px 10px', borderRadius: 18, background: 'rgba(12,8,26,0.55)', border: '1px solid rgba(167,139,250,.1)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'default' }}>
                      <s.icon style={{ width: 13, height: 13, color: s.accent, marginBottom: 1 }} />
                      <span data-count={s.val} style={{ fontFamily: FD, fontSize: '1.7rem', fontWeight: 800, color: '#f0eeff', letterSpacing: '-.03em' }}>{s.val}</span>
                      <span style={{ fontFamily: FM, fontSize: 9, color: 'rgba(190,180,245,.38)', textTransform: 'uppercase', letterSpacing: '.2em' }}>{s.label}</span>
                    </div>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content className="rt-TooltipContent" sideOffset={8}>
                      {s.val} {s.label} di StellarHub
                      <Tooltip.Arrow style={{ fill: 'rgba(18,12,34,.92)' }} />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              ))}
            </div>
          </div>

          {/* scroll hint */}
          <div style={{ position: 'absolute', bottom: 34, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 1, height: 46, background: 'linear-gradient(to bottom,transparent,rgba(124,110,245,.75),transparent)', animation: 'stLineSlide 2.5s ease-in-out infinite' }} />
            <span style={{ fontFamily: FM, fontSize: 8, color: 'rgba(190,180,245,.32)', textTransform: 'uppercase', letterSpacing: '.28em' }}>Scroll</span>
          </div>
        </section>

        {/* ══════════════════════════════════════
            FEATURES
        ══════════════════════════════════════ */}
        <section style={{ padding: 'clamp(80px,12vw,140px) 24px', position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: 1160, margin: '0 auto' }}>
            <div data-reveal style={{ textAlign: 'center', marginBottom: 'clamp(52px,8vw,88px)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 18, fontFamily: FM, fontSize: 10, color: 'rgba(190,180,245,.38)', textTransform: 'uppercase', letterSpacing: '.22em' }}>
                <span style={{ width: 20, height: 1, background: 'currentColor', opacity: .45 }} />Fitur Platform<span style={{ width: 20, height: 1, background: 'currentColor', opacity: .45 }} />
              </div>
              <h2 style={{ fontFamily: FD, fontSize: 'clamp(2rem,5.5vw,4.2rem)', fontWeight: 800, lineHeight: 1, letterSpacing: '-.03em', marginBottom: 16 }}>
                <span style={{ display: 'block', color: '#f0eeff' }}>Semua yang kamu butuhkan</span>
                <span className="text-gs">untuk menjelajah bintang</span>
              </h2>
              <p style={{ fontFamily: FB, color: 'rgba(220,215,255,.48)', fontSize: '.92rem', lineHeight: 1.85, maxWidth: 480, margin: '0 auto' }}>
                Dari data NASA real-time hingga komunitas aktif — StellarHub menghadirkan pengalaman eksplorasi terlengkap.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 15 }}>
              {FEATURES.map((f, i) => (
                <HoverCard.Root key={i} openDelay={200} closeDelay={80}>
                  <HoverCard.Trigger asChild>
                    <div className="feat-card" data-reveal data-delay={i * 0.08} style={{ borderRadius: 24, padding: 'clamp(26px,4vw,38px)', position: 'relative', overflow: 'hidden', background: 'rgba(14,10,28,0.58)', border: '1px solid rgba(167,139,250,.1)', backdropFilter: 'blur(22px)', cursor: 'default' }}>

                      {/* top accent stripe */}
                      <div style={{ position: 'absolute', top: 0, left: '18%', right: '18%', height: 1, background: `linear-gradient(90deg,transparent,${f.stripe}60,transparent)` }} />

                      {/* corner glow */}
                      <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: `radial-gradient(circle,${f.glow} 0%,transparent 70%)`, pointerEvents: 'none' }} />

                      {/* faint watermark icon */}
                      <div style={{ position: 'absolute', bottom: -8, right: -4, width: 110, height: 110, opacity: .05, pointerEvents: 'none' }}>
                        <f.icon style={{ width: '100%', height: '100%', color: f.accent }} />
                      </div>

                      <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                          <div style={{ width: 48, height: 48, borderRadius: 14, background: f.accentBg, border: `1px solid ${f.accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'rgba(255,255,255,.15)' }} />
                            <f.icon style={{ width: 19, height: 19, color: f.accent }} />
                          </div>
                          <span style={{ padding: '4px 11px', borderRadius: 8, fontFamily: FM, fontSize: 9, fontWeight: 500, letterSpacing: '.12em', textTransform: 'uppercase', color: f.accent, background: f.accentBg, border: `1px solid ${f.accentBorder}` }}>{f.tag}</span>
                        </div>

                        <h3 style={{ fontFamily: FD, fontSize: '1.05rem', fontWeight: 700, color: '#f0eeff', marginBottom: 9, letterSpacing: '-.015em' }}>{f.title}</h3>
                        <p style={{ fontFamily: FB, color: 'rgba(220,215,255,.52)', fontSize: '.86rem', lineHeight: 1.8, marginBottom: 16 }}>{f.desc}</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
                          {f.points.map((p, j) => (
                            <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: FB, fontSize: '.8rem', color: 'rgba(220,215,255,.6)', fontWeight: 400 }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: f.accent, boxShadow: `0 0 5px ${f.accent}`, flexShrink: 0 }} />{p}
                            </div>
                          ))}
                        </div>

                        <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: FB, fontSize: '.8rem', fontWeight: 600, color: f.accent, textDecoration: 'none', transition: 'gap .2s' }}>
                          Pelajari lebih <ChevronRight style={{ width: 12, height: 12 }} />
                        </a>
                      </div>
                    </div>
                  </HoverCard.Trigger>
                  <HoverCard.Portal>
                    <HoverCard.Content className="rt-HoverCardContent" sideOffset={10} align="start">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 11, background: f.accentBg, border: `1px solid ${f.accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <f.icon style={{ width: 16, height: 16, color: f.accent }} />
                        </div>
                        <div>
                          <div style={{ fontFamily: FD, fontSize: '.88rem', fontWeight: 700, color: '#f0eeff' }}>{f.title}</div>
                          <div style={{ fontFamily: FM, fontSize: 9, color: f.accent, textTransform: 'uppercase', letterSpacing: '.1em' }}>{f.tag}</div>
                        </div>
                      </div>
                      <p style={{ fontFamily: FB, fontSize: '.8rem', color: 'rgba(220,215,255,.58)', lineHeight: 1.7 }}>{f.desc}</p>
                    </HoverCard.Content>
                  </HoverCard.Portal>
                </HoverCard.Root>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            APP MOCKUP
        ══════════════════════════════════════ */}
        <section style={{ padding: '0 24px 80px', position: 'relative', zIndex: 10 }}>
          <div data-reveal style={{ maxWidth: 880, margin: '0 auto', borderRadius: 26, background: 'rgba(10,6,22,0.65)', border: '1px solid rgba(167,139,250,.12)', backdropFilter: 'blur(28px)', boxShadow: '0 0 0 1px rgba(255,255,255,.03),0 56px 110px rgba(0,0,0,.58)', overflow: 'hidden' }}>
            {/* browser chrome */}
            <div style={{ padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,.055)', display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(0,0,0,.22)' }}>
              <div style={{ display: 'flex', gap: 5 }}>
                {['rgba(239,68,68,.5)', 'rgba(234,179,8,.5)', 'rgba(34,197,94,.5)'].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
              </div>
              <div style={{ flex: 1, height: 24, borderRadius: 7, margin: '0 11px', background: 'rgba(255,255,255,.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: FM, fontSize: 10, color: 'rgba(196,181,253,.32)', letterSpacing: '.04em' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 5px #34d399', animation: 'stPulseDot 1.5s ease-in-out infinite' }} />
                stellarhub.app/feed
              </div>
              <Sparkles style={{ width: 12, height: 12, color: 'rgba(167,139,250,.38)' }} />
            </div>
            <div style={{ padding: 14, display: 'grid', gap: 11 }}>
              {[
                { name: 'Alex Chen',      topic: 'APOD Today', likes: '2.4k', comments: '38', bg: '#6d28d9' },
                { name: 'Maria Kowalski', topic: 'Mars Rover', likes: '891',  comments: '17', bg: '#4338ca' },
                { name: 'James Park',     topic: 'Nebula M42', likes: '3.1k', comments: '54', bg: '#0369a1' },
              ].map((p, i) => (
                <div key={i} style={{ borderRadius: 14, padding: '13px 14px', background: 'rgba(255,255,255,.026)', border: '1px solid rgba(255,255,255,.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FD, fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{p.name[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: FD, fontSize: 12, fontWeight: 700, color: '#f0eeff' }}>{p.name}</div>
                      <div style={{ fontFamily: FM, fontSize: 9, color: 'rgba(190,180,245,.38)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{p.topic}</div>
                    </div>
                    <span style={{ fontFamily: FM, fontSize: 8, padding: '2px 8px', borderRadius: 100, background: `${p.bg}22`, border: `1px solid ${p.bg}38`, color: 'rgba(196,181,253,.65)', letterSpacing: '.1em' }}>NEW</span>
                  </div>
                  <div style={{ height: 66, borderRadius: 10, background: `linear-gradient(135deg,${p.bg}18,rgba(0,0,0,.38))`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, border: `1px solid ${p.bg}12` }}>
                    <Star style={{ width: 20, height: 20, color: 'rgba(255,255,255,.05)' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {[{ I: Heart, l: p.likes }, { I: Bookmark, l: 'Simpan' }, { I: Share2, l: 'Share' }].map(({ I, l }, j) => (
                      <span key={j} style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: FB, fontSize: 10, color: 'rgba(190,180,245,.38)', fontWeight: 500 }}><I style={{ width: 10, height: 10 }} />{l}</span>
                    ))}
                    <span style={{ marginLeft: 'auto', fontFamily: FB, fontSize: 10, color: 'rgba(190,180,245,.32)' }}>{p.comments} komentar</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            STEPS
        ══════════════════════════════════════ */}
        <section style={{ padding: 'clamp(80px,12vw,140px) 24px', position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: 1160, margin: '0 auto' }}>
            <div data-reveal style={{ textAlign: 'center', marginBottom: 'clamp(52px,8vw,88px)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 18, fontFamily: FM, fontSize: 10, color: 'rgba(190,180,245,.38)', textTransform: 'uppercase', letterSpacing: '.22em' }}>
                <span style={{ width: 20, height: 1, background: 'currentColor', opacity: .45 }} />Cara Kerja<span style={{ width: 20, height: 1, background: 'currentColor', opacity: .45 }} />
              </div>
              <h2 style={{ fontFamily: FD, fontSize: 'clamp(2rem,5.5vw,4.2rem)', fontWeight: 800, lineHeight: 1, letterSpacing: '-.03em', marginBottom: 16 }}>
                <span style={{ display: 'block', color: '#f0eeff' }}>Tiga langkah menuju</span>
                <span className="text-gs">orbit pertamamu</span>
              </h2>
              <p style={{ fontFamily: FB, color: 'rgba(220,215,255,.48)', fontSize: '.92rem', lineHeight: 1.85, maxWidth: 460, margin: '0 auto' }}>Dari nol sampai menjelajahi galaksi hanya dalam beberapa menit.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {STEPS.map((s, i) => (
                <div key={i} className="step-card" data-reveal data-delay={i * 0.1} style={{ borderRadius: 22, padding: 'clamp(26px,4vw,36px)', position: 'relative', overflow: 'hidden', background: 'rgba(14,10,28,0.56)', border: '1px solid rgba(167,139,250,.1)', backdropFilter: 'blur(20px)' }}>
                  <div style={{ position: 'absolute', top: 0, left: '18%', right: '18%', height: 1, background: `linear-gradient(90deg,transparent,${s.accent}55,transparent)` }} />
                  <div style={{ position: 'absolute', top: 12, right: 18, fontFamily: FD, fontSize: '5rem', fontWeight: 800, color: s.accent, opacity: .06, lineHeight: 1, letterSpacing: '-.05em', pointerEvents: 'none' }}>{s.n}</div>

                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 11px', borderRadius: 7, marginBottom: 16, fontFamily: FM, fontSize: 9, fontWeight: 500, letterSpacing: '.14em', textTransform: 'uppercase', color: s.accent, background: `${s.accent}12`, border: `1px solid ${s.accent}26` }}>Step {s.n}</div>

                  <div style={{ width: 46, height: 46, borderRadius: 13, background: `${s.accent}10`, border: `1px solid ${s.accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 15, position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'rgba(255,255,255,.12)' }} />
                    <s.icon style={{ width: 19, height: 19, color: s.accent }} />
                  </div>

                  <h3 style={{ fontFamily: FD, fontSize: '1rem', fontWeight: 700, color: '#f0eeff', marginBottom: 9, letterSpacing: '-.01em' }}>{s.label}</h3>
                  <p style={{ fontFamily: FB, color: 'rgba(220,215,255,.48)', fontSize: '.84rem', lineHeight: 1.8 }}>{s.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            TRUST
        ══════════════════════════════════════ */}
        <section style={{ padding: '0 24px clamp(80px,10vw,120px)', position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: 1160, margin: '0 auto' }}>
            <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(167,139,250,.13) 30%,rgba(167,139,250,.13) 70%,transparent)', marginBottom: 48 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 13 }}>
              {TRUST.map((t, i) => (
                <Tooltip.Root key={i}>
                  <Tooltip.Trigger asChild>
                    <div className="trust-tile" data-reveal data-delay={i * 0.07} style={{ borderRadius: 18, padding: '22px 15px', textAlign: 'center', background: 'rgba(14,10,28,0.45)', border: '1px solid rgba(167,139,250,.09)', backdropFilter: 'blur(16px)', cursor: 'default' }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(124,110,245,.09)', border: '1px solid rgba(124,110,245,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'rgba(255,255,255,.1)' }} />
                        <t.icon style={{ width: 17, height: 17, color: '#a78bfa' }} />
                      </div>
                      <div style={{ fontFamily: FD, fontSize: '.84rem', fontWeight: 700, color: '#f0eeff', marginBottom: 5 }}>{t.title}</div>
                      <div style={{ fontFamily: FB, fontSize: '.76rem', color: 'rgba(190,180,245,.42)', lineHeight: 1.6 }}>{t.desc}</div>
                    </div>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content className="rt-TooltipContent" sideOffset={8}>
                      {t.desc}<Tooltip.Arrow style={{ fill: 'rgba(18,12,34,.92)' }} />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            NASA
        ══════════════════════════════════════ */}
        <section style={{ padding: 'clamp(60px,9vw,110px) 24px', position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: 1160, margin: '0 auto' }}>
            <div data-reveal style={{ borderRadius: 30, padding: 'clamp(36px,5vw,60px)', position: 'relative', overflow: 'hidden', background: 'rgba(10,6,22,0.68)', border: '1px solid rgba(167,139,250,.16)', backdropFilter: 'blur(36px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.055),0 40px 90px rgba(0,0,0,.55)' }}>
              <div style={{ position: 'absolute', top: -70, right: -70, width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle,rgba(14,165,233,.11) 0%,transparent 65%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: -50, left: -50, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,110,245,.09) 0%,transparent 65%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: 0, left: '25%', right: '25%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(56,189,248,.45),transparent)' }} />

              <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 'clamp(32px,6vw,68px)', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* orb */}
                <div style={{ position: 'relative', width: 190, height: 190, flexShrink: 0, margin: '0 auto' }}>
                  {[{ cls: 'ring-a', inset: 0, c: 'rgba(56,189,248,.26)' }, { cls: 'ring-b', inset: 22, c: 'rgba(124,110,245,.2)' }, { cls: 'ring-c', inset: 42, c: 'rgba(232,121,249,.16)' }].map((r, i) => (
                    <div key={i} className={r.cls} style={{ position: 'absolute', inset: r.inset, borderRadius: '50%', border: `1px solid ${r.c}` }} />
                  ))}
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 76, height: 76, borderRadius: 20, background: 'rgba(14,165,233,.09)', border: '1px solid rgba(14,165,233,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'rgba(255,255,255,.12)' }} />
                      <Satellite style={{ width: 32, height: 32, color: '#38bdf8' }} />
                    </div>
                  </div>
                  {[{ c: '#38bdf8', t: '6%', r: '18%' }, { c: '#c084fc', b: '12%', r: '8%' }, { c: '#34d399', t: '50%', l: '4%' }].map((d, i) => (
                    <div key={i} className="float-dot" style={{ position: 'absolute', width: 8, height: 8, borderRadius: '50%', background: d.c, boxShadow: `0 0 9px ${d.c}`, top: (d as any).t, bottom: (d as any).b, left: (d as any).l, right: (d as any).r }} />
                  ))}
                </div>

                <div style={{ flex: 1, minWidth: 250 }}>
                  <div style={{ fontFamily: FM, fontSize: 10, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '.2em', marginBottom: 12 }}>Powered by NASA Open APIs</div>
                  <h3 style={{ fontFamily: FD, fontSize: 'clamp(1.75rem,4vw,2.85rem)', fontWeight: 800, color: '#f0eeff', lineHeight: 1.06, letterSpacing: '-.03em', marginBottom: 15 }}>Data luar angkasa nyata,<br />langsung ke feed kamu.</h3>
                  <p style={{ fontFamily: FB, color: 'rgba(220,215,255,.52)', fontSize: '.88rem', lineHeight: 1.85, marginBottom: 22 }}>Setiap hari, foto dari NASA Astronomy Picture of the Day dan Mars Rover missions mengalir langsung ke StellarHub. Data sains sungguhan yang tersaji dengan tampilan yang cantik.</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {['APOD Harian', 'Mars Rover', 'Satellite Feeds', 'Space Weather', 'Exoplanet Data'].map(tag => (
                      <span key={tag} style={{ padding: '6px 14px', borderRadius: 9, fontFamily: FM, fontSize: 10, color: 'rgba(220,215,255,.5)', letterSpacing: '.07em', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(167,139,250,.12)', cursor: 'default' }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            TESTIMONIALS
        ══════════════════════════════════════ */}
        <section style={{ padding: 'clamp(80px,12vw,140px) 24px', position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: 1160, margin: '0 auto' }}>
            <div data-reveal style={{ textAlign: 'center', marginBottom: 'clamp(52px,8vw,88px)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 18, fontFamily: FM, fontSize: 10, color: 'rgba(190,180,245,.38)', textTransform: 'uppercase', letterSpacing: '.22em' }}>
                <span style={{ width: 20, height: 1, background: 'currentColor', opacity: .45 }} />Kata Mereka<span style={{ width: 20, height: 1, background: 'currentColor', opacity: .45 }} />
              </div>
              <h2 style={{ fontFamily: FD, fontSize: 'clamp(2rem,5.5vw,4.2rem)', fontWeight: 800, lineHeight: 1, letterSpacing: '-.03em' }}>
                <span style={{ display: 'block', color: '#f0eeff' }}>Dipercaya para</span>
                <span className="text-gs">penjelajah bintang</span>
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {TESTI.map((t, i) => (
                <div key={i} className="testi-card" data-reveal data-delay={i * 0.1} style={{ borderRadius: 22, padding: 24, position: 'relative', overflow: 'hidden', background: 'rgba(14,10,28,0.56)', border: '1px solid rgba(167,139,250,.1)', backdropFilter: 'blur(20px)' }}>
                  <div style={{ position: 'absolute', top: 0, left: '18%', right: '18%', height: 1, background: `linear-gradient(90deg,transparent,${t.c}50,transparent)` }} />
                  <div style={{ fontFamily: FD, fontSize: '2.4rem', lineHeight: 1, color: 'rgba(167,139,250,.16)', marginBottom: 10 }}>"</div>
                  <p style={{ fontFamily: FB, color: 'rgba(220,215,255,.58)', fontSize: '.86rem', lineHeight: 1.85, marginBottom: 18 }}>{t.t}</p>
                  <div style={{ display: 'flex', gap: 3, marginBottom: 15 }}>
                    {Array(5).fill(0).map((_, j) => <Star key={j} style={{ width: 10, height: 10, color: '#fbbf24', fill: '#fbbf24' }} />)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,.05)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: t.c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FD, fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{t.av}</div>
                    <div>
                      <div style={{ fontFamily: FD, fontSize: '.86rem', fontWeight: 700, color: '#f0eeff' }}>{t.n}</div>
                      <div style={{ fontFamily: FM, fontSize: 9, color: 'rgba(190,180,245,.38)', letterSpacing: '.05em' }}>{t.r}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            BIG CTA
        ══════════════════════════════════════ */}
        <section style={{ padding: 'clamp(80px,12vw,140px) 24px', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ width: 750, height: 380, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(100,75,230,.18) 0%,rgba(79,70,229,.06) 45%,transparent 70%)', filter: 'blur(55px)' }} />
          </div>
          <div style={{ maxWidth: 660, margin: '0 auto', position: 'relative', zIndex: 1 }} data-reveal>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 18px', borderRadius: 100, marginBottom: 38, background: 'rgba(124,110,245,.08)', border: '1px solid rgba(124,110,245,.18)' }}>
              <Star style={{ width: 11, height: 11, color: '#fbbf24', fill: '#fbbf24' }} />
              <span style={{ fontFamily: FM, fontSize: 10, color: 'rgba(196,181,253,.72)', letterSpacing: '.18em', textTransform: 'uppercase' }}>Bergabung dengan 150,000+ penjelajah</span>
            </div>
            <h2 style={{ fontFamily: FD, fontSize: 'clamp(2.6rem,8vw,5.8rem)', fontWeight: 800, lineHeight: .92, letterSpacing: '-.04em', marginBottom: 22 }}>
              <span style={{ display: 'block', color: '#f0eeff' }}>Perjalananmu</span>
              <span className="text-gs">dimulai sekarang.</span>
            </h2>
            <p style={{ fontFamily: FB, color: 'rgba(220,215,255,.48)', fontSize: '.94rem', lineHeight: 1.85, maxWidth: 420, margin: '0 auto 46px' }}>
              Daftar gratis, jelajahi alam semesta NASA, dan bagikan penemuanmu bersama komunitas yang selalu memandang ke atas.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href={user ? '/feed' : '/register'} className="btn-sw" style={{
                display: 'inline-flex', alignItems: 'center', gap: 9, padding: '15px 42px', borderRadius: 15,
                fontFamily: FD, fontSize: '.97rem', fontWeight: 700, color: '#fff', textDecoration: 'none',
                background: 'linear-gradient(135deg,#7c6ef5 0%,#4f46e5 100%)',
                border: '1px solid rgba(255,255,255,.1)',
                boxShadow: '0 0 70px rgba(100,75,230,.3),0 8px 30px rgba(79,70,229,.4)',
                transition: 'transform .2s cubic-bezier(.175,.885,.32,1.275),box-shadow .25s',
              }}>
                <Zap style={{ width: 17, height: 17 }} />{user ? 'Buka Feed' : 'Mulai Eksplorasi'}<ArrowRight style={{ width: 17, height: 17 }} />
              </Link>
              <span style={{ fontFamily: FM, fontSize: 10, color: 'rgba(190,180,245,.32)', letterSpacing: '.1em' }}>Gratis · Tanpa kartu kredit</span>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            CONTACT
        ══════════════════════════════════════ */}
        <section style={{ padding: 'clamp(80px,12vw,110px) 24px', position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: 1160, margin: '0 auto' }}>
            <div data-reveal style={{ textAlign: 'center', marginBottom: 'clamp(52px,8vw,80px)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 18, fontFamily: FM, fontSize: 10, color: 'rgba(190,180,245,.38)', textTransform: 'uppercase', letterSpacing: '.22em' }}>
                <span style={{ width: 20, height: 1, background: 'currentColor', opacity: .45 }} />Hubungi Kami<span style={{ width: 20, height: 1, background: 'currentColor', opacity: .45 }} />
              </div>
              <h2 style={{ fontFamily: FD, fontSize: 'clamp(2rem,5.5vw,4.2rem)', fontWeight: 800, lineHeight: 1, letterSpacing: '-.03em' }}>
                <span style={{ display: 'block', color: '#f0eeff' }}>Ada pertanyaan atau</span>
                <span className="text-gs">ingin berkolaborasi?</span>
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
              {/* left */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                <div style={{ marginBottom: 6 }}>
                  <h3 style={{ fontFamily: FD, fontSize: '1.45rem', fontWeight: 700, color: '#f0eeff', marginBottom: 10 }}>Kami ada di sini <span className="text-gs">untukmu.</span></h3>
                  <p style={{ fontFamily: FB, color: 'rgba(220,215,255,.48)', fontSize: '.86rem', lineHeight: 1.8 }}>Pertanyaan teknis, ide kolaborasi, atau sekadar menyapa — kami senang mendengar dari kamu.</p>
                </div>

                {[
                  { icon: Mail, label: 'Email', val: 'stellarhub.app@gmail.com', sub: 'Balas dalam 24 jam', href: 'mailto:stellarhub.app@gmail.com', ac: '#a78bfa', abg: 'rgba(167,139,250,.09)' },
                  { icon: MessageCircle, label: 'WhatsApp', val: '0851 3430 1278', sub: 'Chat langsung dengan kami', href: 'https://wa.me/6285134301278', ac: '#34d399', abg: 'rgba(52,211,153,.09)' },
                  { icon: MapPin, label: 'Lokasi', val: 'Brebes Salem, Jawa Tengah', sub: 'Indonesia 🇮🇩', href: '#', ac: '#818cf8', abg: 'rgba(129,140,248,.09)' },
                ].map((c, i) => (
                  <a key={i} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="contact-lnk" style={{ display: 'flex', alignItems: 'flex-start', gap: 15, padding: '18px 20px', borderRadius: 17, background: 'rgba(14,10,28,0.5)', border: '1px solid rgba(167,139,250,.1)', backdropFilter: 'blur(16px)', textDecoration: 'none' }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: c.abg, border: `1px solid ${c.ac}26`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'rgba(255,255,255,.1)' }} />
                      <c.icon style={{ width: 17, height: 17, color: c.ac }} />
                    </div>
                    <div>
                      <div style={{ fontFamily: FM, fontSize: 9, color: 'rgba(190,180,245,.38)', textTransform: 'uppercase', letterSpacing: '.16em', marginBottom: 4 }}>{c.label}</div>
                      <div style={{ fontFamily: FD, fontSize: '.88rem', fontWeight: 700, color: '#f0eeff', marginBottom: 2 }}>{c.val}</div>
                      <div style={{ fontFamily: FB, fontSize: '.76rem', color: 'rgba(190,180,245,.42)' }}>{c.sub}</div>
                    </div>
                  </a>
                ))}

                <div style={{ borderRadius: 16, padding: '16px 18px', background: 'rgba(14,10,28,0.45)', border: '1px solid rgba(167,139,250,.09)', backdropFilter: 'blur(12px)' }}>
                  <div style={{ fontFamily: FM, fontSize: 9, color: 'rgba(190,180,245,.38)', textTransform: 'uppercase', letterSpacing: '.16em', marginBottom: 12 }}>Follow kami</div>
                  <div style={{ display: 'flex', gap: 9 }}>
                    {[{ I: Twitter, l: 'Twitter' }, { I: Github, l: 'GitHub' }, { I: Instagram, l: 'Instagram' }].map(s => (
                      <Tooltip.Root key={s.l}>
                        <Tooltip.Trigger asChild>
                          <a href="#" className="soc-btn" style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(167,139,250,.12)' }} aria-label={s.l}>
                            <s.I style={{ width: 14, height: 14, color: 'rgba(196,181,253,.5)' }} />
                          </a>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content className="rt-TooltipContent" sideOffset={8}>{s.l}<Tooltip.Arrow style={{ fill: 'rgba(18,12,34,.92)' }} /></Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    ))}
                  </div>
                </div>
              </div>

              {/* right – form */}
              <div style={{ borderRadius: 26, padding: 'clamp(24px,4vw,40px)', position: 'relative', overflow: 'hidden', background: 'rgba(10,6,20,0.68)', border: '1px solid rgba(167,139,250,.18)', backdropFilter: 'blur(36px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.045),0 20px 60px rgba(0,0,0,.45)' }}>
                <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(167,139,250,.4),transparent)' }} />
                {sent && (
                  <div style={{ padding: '13px 16px', borderRadius: 12, marginBottom: 18, background: 'rgba(52,211,153,.07)', border: '1px solid rgba(52,211,153,.2)', display: 'flex', alignItems: 'center', gap: 9, fontFamily: FB, fontSize: '.86rem', color: '#6ee7b7', fontWeight: 600, animation: 'stFadeUp .3s ease' }}>
                    <Sparkles style={{ width: 15, height: 15, color: '#34d399', flexShrink: 0 }} />
                    Pesan terkirim! Kami akan segera menghubungimu. 🚀
                  </div>
                )}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    {[{ l: 'Nama', t: 'text', k: 'name', ph: 'Budi Santoso' }, { l: 'Email', t: 'email', k: 'email', ph: 'kamu@email.com' }].map(f => (
                      <div key={f.k} style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                        <label style={{ fontFamily: FM, fontSize: 9, color: 'rgba(190,180,245,.42)', textTransform: 'uppercase', letterSpacing: '.16em' }}>{f.l}</label>
                        <input type={f.t} placeholder={f.ph} required value={(form as any)[f.k]}
                          onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                          style={{ width: '100%', padding: '11px 14px', borderRadius: 11, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(167,139,250,.14)', color: '#f0eeff', fontFamily: FB, fontSize: '.86rem', outline: 'none', transition: 'border-color .25s,box-shadow .25s', caretColor: '#a78bfa' }}
                          onFocus={e => { e.target.style.borderColor = 'rgba(124,110,245,.48)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,110,245,.09)' }}
                          onBlur={e => { e.target.style.borderColor = 'rgba(167,139,250,.14)'; e.target.style.boxShadow = 'none' }}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <label style={{ fontFamily: FM, fontSize: 9, color: 'rgba(190,180,245,.42)', textTransform: 'uppercase', letterSpacing: '.16em' }}>Pesan</label>
                    <textarea placeholder="Ceritakan ide atau pertanyaanmu…" required rows={5} value={form.message}
                      onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 11, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(167,139,250,.14)', color: '#f0eeff', fontFamily: FB, fontSize: '.86rem', outline: 'none', resize: 'vertical', lineHeight: 1.7, caretColor: '#a78bfa', transition: 'border-color .25s,box-shadow .25s' }}
                      onFocus={e => { e.target.style.borderColor = 'rgba(124,110,245,.48)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,110,245,.09)' }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(167,139,250,.14)'; e.target.style.boxShadow = 'none' }}
                    />
                  </div>
                  <button type="submit" className="btn-sw" style={{ width: '100%', padding: '14px', borderRadius: 13, fontFamily: FD, fontSize: '.92rem', fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#7c6ef5 0%,#4f46e5 100%)', border: '1px solid rgba(255,255,255,.09)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 22px rgba(79,70,229,.38)', transition: 'transform .2s cubic-bezier(.175,.885,.32,1.275),box-shadow .25s' }}>
                    <Send style={{ width: 14, height: 14 }} />Kirim Pesan<ArrowRight style={{ width: 14, height: 14 }} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            FOOTER
        ══════════════════════════════════════ */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,.05)', padding: 'clamp(32px,5vw,48px) 24px', position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 22 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(124,110,245,.14)', border: '1px solid rgba(167,139,250,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Rocket style={{ width: 13, height: 13, color: '#c4b5fd' }} />
              </div>
              <span style={{ fontFamily: FD, fontSize: '.97rem', fontWeight: 700, background: 'linear-gradient(110deg,#ddd6fe,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>StellarHub</span>
            </Link>

            <nav style={{ display: 'flex', gap: 26, flexWrap: 'wrap' }}>
              {['Privacy', 'Terms', 'API Docs', 'Status', 'Blog'].map(l => (
                <Link key={l} href="#" style={{ fontFamily: FB, fontSize: '.8rem', color: 'rgba(190,180,245,.36)', textDecoration: 'none', fontWeight: 500, transition: 'color .2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(220,215,255,.8)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(190,180,245,.36)')}
                >{l}</Link>
              ))}
            </nav>

            <div style={{ display: 'flex', gap: 9 }}>
              {[Twitter, Github, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="soc-btn" style={{ width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(167,139,250,.1)' }}>
                  <Icon style={{ width: 13, height: 13, color: 'rgba(190,180,245,.42)' }} />
                </a>
              ))}
            </div>

            <p style={{ fontFamily: FM, fontSize: 10, color: 'rgba(190,180,245,.28)', letterSpacing: '.04em' }}>© {new Date().getFullYear()} StellarHub. Built for stargazers. 🚀</p>
          </div>
        </footer>
      </div>
    </Tooltip.Provider>
  )
}